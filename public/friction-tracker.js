/**
 * Friction Analytics Tracking SDK
 * Embed this script on your website to track user friction events
 * Usage: <script src="https://your-domain.com/friction-tracker.js" data-api-key="your-api-key"></script>
 */

(function() {
  'use strict';

  // Configuration
  const script = document.currentScript;
  const API_KEY = script?.getAttribute('data-api-key') || '';
  const ENDPOINT = script?.getAttribute('data-endpoint') || 'https://nykvaozegqidulsgqrfg.supabase.co/functions/v1/ingest-events';
  const BATCH_SIZE = parseInt(script?.getAttribute('data-batch-size') || '10');
  const BATCH_INTERVAL = parseInt(script?.getAttribute('data-batch-interval') || '5000');
  const ENABLE_RECORDING = script?.getAttribute('data-enable-recording') === 'true';

  if (!API_KEY) {
    console.error('[FrictionTracker] Missing API key');
    return;
  }

  // Session management
  const SESSION_ID = generateUUID();
  const eventQueue = [];
  let batchTimer;

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
    queueEvent({
      type: 'friction',
      sessionId: SESSION_ID,
      timestamp: Date.now(),
      data,
    });
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
    if (eventQueue.length > 0) {
      sendBatch();
    }
  });

  // Send page view
  trackHeatmap({
    pageUrl: window.location.href,
    elementSelector: 'body',
    interactionType: 'pageview',
    frictionScore: 0,
  });

  console.log('[FrictionTracker] Initialized with session:', SESSION_ID);
})();