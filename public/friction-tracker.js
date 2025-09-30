/**
 * Friction Analytics Tracking SDK with Session Recording
 * Embed this script on your website to track user friction events and record sessions
 * Usage: <script src="https://your-domain.com/friction-tracker.js" data-api-key="your-api-key"></script>
 */

(function() {
  'use strict';

  // Configuration
  const script = document.currentScript;
  const API_KEY = script?.getAttribute('data-api-key') || '';
  const ENDPOINT = script?.getAttribute('data-endpoint') || 'https://nykvaozegqidulsgqrfg.supabase.co/functions/v1/ingest-events';
  const UPLOAD_ENDPOINT = script?.getAttribute('data-upload-endpoint') || 'https://nykvaozegqidulsgqrfg.supabase.co/functions/v1/upload-recording';
  const SCREENSHOT_ENDPOINT = script?.getAttribute('data-screenshot-endpoint') || 'https://nykvaozegqidulsgqrfg.supabase.co/functions/v1/upload-screenshot';
  const BATCH_SIZE = parseInt(script?.getAttribute('data-batch-size') || '10');
  const BATCH_INTERVAL = parseInt(script?.getAttribute('data-batch-interval') || '5000');
  const ENABLE_RECORDING = script?.getAttribute('data-enable-recording') === 'true';
  const ENABLE_SCREENSHOTS = script?.getAttribute('data-enable-screenshots') === 'true';
  const SCREENSHOT_ON_FRICTION = script?.getAttribute('data-screenshot-friction') === 'true';
  const RECORDING_MAX_DURATION = parseInt(script?.getAttribute('data-recording-duration') || '300000'); // 5 minutes
  const RECORDING_SAMPLE_RATE = parseFloat(script?.getAttribute('data-sample-rate') || '1.0'); // 100% of sessions

  if (!API_KEY) {
    console.error('[FrictionTracker] Missing API key');
    return;
  }

  // Session management
  const SESSION_ID = generateUUID();
  const eventQueue = [];
  let batchTimer;

  // Session recording state
  let isRecording = false;
  let recordingData = [];
  let recordingStartTime = null;
  let recordingTimer = null;
  let frictionEventCount = 0;

  // Rage click detection
  const clickTracker = new Map();
  const RAGE_CLICK_THRESHOLD = 3;
  const RAGE_CLICK_WINDOW = 1000;

  // Dead click detection
  const DEAD_CLICK_TIMEOUT = 3000;

  // Error tracking
  window.addEventListener('error', (event) => {
    trackFriction({
      eventType: 'javascript_error',
      pageUrl: window.location.href,
      errorMessage: event.message,
      elementSelector: event.filename,
      severityScore: 8,
      metadata: {
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
      }
    });
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    trackFriction({
      eventType: 'unhandled_rejection',
      pageUrl: window.location.href,
      errorMessage: event.reason?.message || String(event.reason),
      severityScore: 7,
      metadata: {
        reason: event.reason,
      }
    });
  });

  // Click tracking
  document.addEventListener('click', (event) => {
    const target = event.target;
    const selector = getSelector(target);
    const now = Date.now();

    // Rage click detection
    const clicks = clickTracker.get(selector) || [];
    clicks.push(now);
    const recentClicks = clicks.filter(time => now - time < RAGE_CLICK_WINDOW);
    clickTracker.set(selector, recentClicks);

    if (recentClicks.length >= RAGE_CLICK_THRESHOLD) {
      trackFriction({
        eventType: 'rage_click',
        elementSelector: selector,
        pageUrl: window.location.href,
        userAction: 'multiple_rapid_clicks',
        severityScore: 7,
        metadata: {
          clickCount: recentClicks.length,
          element: target.tagName,
        }
      });
      clickTracker.delete(selector);
    }

    // Dead click detection
    const hadChange = hasPageChanged();
    setTimeout(() => {
      if (!hasPageChanged() && hadChange === hasPageChanged()) {
        trackFriction({
          eventType: 'dead_click',
          elementSelector: selector,
          pageUrl: window.location.href,
          userAction: 'click_no_response',
          severityScore: 6,
          metadata: {
            element: target.tagName,
            text: target.textContent?.substring(0, 50),
          }
        });
      }
    }, DEAD_CLICK_TIMEOUT);

    // Heatmap tracking
    trackHeatmap({
      pageUrl: window.location.href,
      elementSelector: selector,
      interactionType: 'click',
      frictionScore: 0,
    });
  }, true);

  // Form error tracking
  document.addEventListener('invalid', (event) => {
    const target = event.target;
    trackFriction({
      eventType: 'form_validation_error',
      elementSelector: getSelector(target),
      pageUrl: window.location.href,
      errorMessage: target.validationMessage,
      userAction: 'form_submit',
      severityScore: 5,
      metadata: {
        fieldName: target.name,
        fieldType: target.type,
      }
    });
  }, true);

  // Scroll tracking
  let maxScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );
    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;
    }
  });

  // Performance tracking
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      if (perfData) {
        trackPerformance({
          pageUrl: window.location.href,
          loadTime: perfData.loadEventEnd - perfData.loadEventStart,
          fcp: getFirstContentfulPaint(),
          tti: getTimeToInteractive(),
        });
      }
    }, 0);
  });

  // Helper functions
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function getSelector(element) {
    if (!element) return '';
    if (element.id) return `#${element.id}`;
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c).join('.');
      return `${element.tagName.toLowerCase()}.${classes}`;
    }
    return element.tagName.toLowerCase();
  }

  function hasPageChanged() {
    return window.performance.now();
  }

  function getFirstContentfulPaint() {
    const entries = performance.getEntriesByName('first-contentful-paint');
    return entries.length > 0 ? entries[0].startTime : 0;
  }

  function getTimeToInteractive() {
    const navEntry = performance.getEntriesByType('navigation')[0];
    return navEntry ? navEntry.domInteractive : 0;
  }

  function trackFriction(data) {
    frictionEventCount++;
    const eventId = generateUUID();
    
    queueEvent({
      type: 'friction',
      sessionId: SESSION_ID,
      timestamp: Date.now(),
      eventId,
      data,
    });

    // Capture screenshot if enabled
    if ((ENABLE_SCREENSHOTS || SCREENSHOT_ON_FRICTION) && data.severityScore >= 7) {
      captureScreenshot(eventId);
    }

    // Start recording on first friction event if enabled and sampling allows
    if (ENABLE_RECORDING && !isRecording && Math.random() < RECORDING_SAMPLE_RATE) {
      startRecording();
    }
  }

  function trackHeatmap(data) {
    queueEvent({
      type: 'heatmap',
      sessionId: SESSION_ID,
      timestamp: Date.now(),
      data,
    });
  }

  function trackPerformance(data) {
    queueEvent({
      type: 'performance',
      sessionId: SESSION_ID,
      timestamp: Date.now(),
      data,
    });
  }

  // Session Recording Functions
  function startRecording() {
    if (isRecording) return;
    
    console.log('[FrictionTracker] Starting session recording');
    isRecording = true;
    recordingStartTime = Date.now();
    recordingData = [];

    // Capture initial DOM snapshot
    captureSnapshot('full');

    // Set up mutation observer for DOM changes
    const observer = new MutationObserver((mutations) => {
      if (!isRecording) return;
      
      mutations.forEach((mutation) => {
        recordingData.push({
          type: 'mutation',
          timestamp: Date.now() - recordingStartTime,
          target: getSelector(mutation.target),
          mutationType: mutation.type,
          addedNodes: Array.from(mutation.addedNodes).map(n => getNodeInfo(n)),
          removedNodes: Array.from(mutation.removedNodes).map(n => getNodeInfo(n)),
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    // Capture mouse movements (throttled)
    let lastMouseCapture = 0;
    const mouseMoveHandler = (e) => {
      const now = Date.now();
      if (now - lastMouseCapture < 50) return; // Throttle to 20fps
      lastMouseCapture = now;

      recordingData.push({
        type: 'mouse',
        timestamp: now - recordingStartTime,
        x: e.clientX,
        y: e.clientY,
      });
    };
    document.addEventListener('mousemove', mouseMoveHandler);

    // Capture clicks
    const clickHandler = (e) => {
      recordingData.push({
        type: 'click',
        timestamp: Date.now() - recordingStartTime,
        x: e.clientX,
        y: e.clientY,
        target: getSelector(e.target),
      });
    };
    document.addEventListener('click', clickHandler, true);

    // Capture scrolls
    const scrollHandler = () => {
      recordingData.push({
        type: 'scroll',
        timestamp: Date.now() - recordingStartTime,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
      });
    };
    window.addEventListener('scroll', scrollHandler);

    // Auto-stop recording after max duration
    recordingTimer = setTimeout(() => {
      stopRecording();
    }, RECORDING_MAX_DURATION);

    // Store handlers for cleanup
    window.__frictionTrackerHandlers = {
      observer,
      mouseMoveHandler,
      clickHandler,
      scrollHandler,
    };
  }

  function stopRecording() {
    if (!isRecording) return;

    console.log('[FrictionTracker] Stopping session recording');
    isRecording = false;

    // Clean up event listeners
    const handlers = window.__frictionTrackerHandlers;
    if (handlers) {
      handlers.observer?.disconnect();
      document.removeEventListener('mousemove', handlers.mouseMoveHandler);
      document.removeEventListener('click', handlers.clickHandler, true);
      window.removeEventListener('scroll', handlers.scrollHandler);
    }

    clearTimeout(recordingTimer);

    // Upload recording
    uploadRecording();
  }

  function captureSnapshot(type) {
    const snapshot = {
      type: 'snapshot',
      snapshotType: type,
      timestamp: Date.now() - (recordingStartTime || Date.now()),
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      html: document.documentElement.outerHTML.substring(0, 50000), // Limit size
    };
    recordingData.push(snapshot);
  }

  function getNodeInfo(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return { type: 'text', content: node.textContent?.substring(0, 100) };
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      return { 
        type: 'element', 
        tag: node.tagName?.toLowerCase(),
        selector: getSelector(node),
      };
    }
    return { type: 'other' };
  }

  function uploadRecording() {
    if (recordingData.length === 0) return;

    const duration = Math.floor((Date.now() - recordingStartTime) / 1000);
    const recordingBlob = new Blob([JSON.stringify(recordingData)], { type: 'application/json' });

    const formData = new FormData();
    formData.append('file', recordingBlob, `session-${SESSION_ID}.json`);
    formData.append('sessionId', SESSION_ID);
    formData.append('userId', 'anonymous'); // Could be enhanced with actual user ID
    formData.append('metadata', JSON.stringify({
      duration,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      frictionCount: frictionEventCount,
      recordingStartTime: new Date(recordingStartTime).toISOString(),
    }));

    fetch(UPLOAD_ENDPOINT, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
      },
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      console.log('[FrictionTracker] Recording uploaded:', data);
    })
    .catch(error => {
      console.error('[FrictionTracker] Failed to upload recording:', error);
    });

    // Reset recording data
    recordingData = [];
    frictionEventCount = 0;
  }

  function queueEvent(event) {
    eventQueue.push(event);
    
    if (eventQueue.length >= BATCH_SIZE) {
      sendBatch();
    } else if (!batchTimer) {
      batchTimer = setTimeout(sendBatch, BATCH_INTERVAL);
    }
  }

  function sendBatch() {
    if (eventQueue.length === 0) return;

    const batch = eventQueue.splice(0, BATCH_SIZE);
    clearTimeout(batchTimer);
    batchTimer = null;

    fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({ events: batch }),
    }).catch((error) => {
      console.error('[FrictionTracker] Failed to send events:', error);
      // Re-queue events on failure
      eventQueue.unshift(...batch);
    });
  }

  // Send remaining events before page unload
  window.addEventListener('beforeunload', () => {
    if (isRecording) {
      stopRecording();
    }
    if (eventQueue.length > 0) {
      sendBatch();
    }
  });

  // Screenshot capture using html2canvas
  async function captureScreenshot(eventId) {
    try {
      // Dynamically load html2canvas if not already loaded
      if (!window.html2canvas) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.async = true;
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // Capture screenshot
      const canvas = await window.html2canvas(document.body, {
        allowTaint: true,
        useCORS: true,
        logging: false,
        width: window.innerWidth,
        height: window.innerHeight,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      });

      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append('file', blob, `screenshot-${eventId}.png`);
        formData.append('eventId', eventId);
        formData.append('userId', 'anonymous');

        // Upload screenshot
        fetch(SCREENSHOT_ENDPOINT, {
          method: 'POST',
          headers: {
            'x-api-key': API_KEY,
          },
          body: formData,
        })
        .then(response => response.json())
        .then(data => {
          console.log('[FrictionTracker] Screenshot uploaded:', data);
        })
        .catch(error => {
          console.error('[FrictionTracker] Failed to upload screenshot:', error);
        });
      }, 'image/png');
    } catch (error) {
      console.error('[FrictionTracker] Screenshot capture failed:', error);
    }
  }

  // Send page view
  trackHeatmap({
    pageUrl: window.location.href,
    elementSelector: 'body',
    interactionType: 'pageview',
    frictionScore: 0,
  });

  console.log('[FrictionTracker] Initialized with session:', SESSION_ID);
})();