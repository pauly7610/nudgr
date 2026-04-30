/**
 * DreamFi Product Analytics browser tracker.
 * Install once in the shared HTML/app shell:
 * <script src="https://your-domain.com/friction-tracker.js" data-api-key="fk_..."></script>
 */

(function() {
  'use strict';

  const SDK_VERSION = '0.4.0';
  const SCHEMA_VERSION = 2;
  const script = document.currentScript;

  const API_KEY = script?.getAttribute('data-api-key') || '';
  const scriptSrc = script?.src || '';
  const scriptOrigin = scriptSrc ? new URL(scriptSrc, window.location.href).origin : window.location.origin;
  const endpointBase = (script?.getAttribute('data-endpoint-base') || `${scriptOrigin}/api`).replace(/\/$/, '');
  const ENDPOINT = script?.getAttribute('data-endpoint') || `${endpointBase}/ingest-events`;
  const SDK_SESSION_ENDPOINT = script?.getAttribute('data-session-endpoint') || `${endpointBase}/sdk/session`;
  const UPLOAD_ENDPOINT = script?.getAttribute('data-upload-endpoint') || `${endpointBase}/upload-recording`;
  const SCREENSHOT_ENDPOINT = script?.getAttribute('data-screenshot-endpoint') || `${endpointBase}/upload-screenshot`;
  const SITE_USER_ID = script?.getAttribute('data-user-id') || 'anonymous';

  const BATCH_SIZE = clampNumber(parseInt(script?.getAttribute('data-batch-size') || '10', 10), 1, 100);
  const BATCH_INTERVAL = clampNumber(parseInt(script?.getAttribute('data-batch-interval') || '5000', 10), 1000, 60000);
  const MAX_QUEUE_SIZE = clampNumber(parseInt(script?.getAttribute('data-max-queue-size') || '500', 10), 25, 2000);
  const ENABLE_RECORDING = script?.getAttribute('data-enable-recording') === 'true';
  const ENABLE_SCREENSHOTS = script?.getAttribute('data-enable-screenshots') === 'true';
  const SCREENSHOT_ON_FRICTION = script?.getAttribute('data-screenshot-friction') === 'true';
  const RECORDING_MAX_DURATION = clampNumber(parseInt(script?.getAttribute('data-recording-duration') || '300000', 10), 10000, 600000);
  const RECORDING_SAMPLE_RATE = clampNumber(parseFloat(script?.getAttribute('data-sample-rate') || '1.0'), 0, 1);
  const HTML2CANVAS_SRC = script?.getAttribute('data-html2canvas-src') || 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
  const CAPTURE_QUERY_STRING = script?.getAttribute('data-capture-query-string') === 'true';
  const CAPTURE_HASH = script?.getAttribute('data-capture-url-hash') === 'true';
  const RESPECT_DNT = script?.getAttribute('data-respect-do-not-track') !== 'false';
  const REQUIRE_CONSENT = script?.getAttribute('data-require-consent') === 'true';
  const CONSENT_STORAGE_KEY = script?.getAttribute('data-consent-storage-key') || 'dreamfi_analytics_consent';
  const REDACT_TEXT = script?.getAttribute('data-redact-text') !== 'false';

  const SENSITIVE_KEY_RE = /(password|passwd|secret|token|jwt|session|cookie|auth|card|cc|cvv|cvc|ssn|social|dob|birth|bank|routing|account|pin|otp|mfa|email|phone|address|name)/i;
  const SENSITIVE_SELECTOR = 'input[type="password"],input[type="email"],input[type="tel"],input[type="number"],input[name*="card" i],input[name*="ssn" i],input[name*="password" i],input[name*="token" i],textarea,[data-nudgr-redact],[data-private],[data-sensitive]';
  const QUEUE_STORAGE_KEY = `dreamfi_analytics_queue_${API_KEY.slice(0, 12) || 'default'}`;
  const SESSION_STORAGE_KEY = 'dreamfi_analytics_session_id';

  if (!API_KEY) {
    console.error('[DreamFiAnalytics] Missing API key');
    return;
  }

  if (shouldSkipForPrivacy()) {
    exposeConsentApi();
    return;
  }

  const SESSION_ID = getOrCreateSessionId();
  const eventQueue = loadPersistedQueue();
  let batchTimer;
  let retryTimer;
  let retryAttempt = 0;
  let sdkSessionToken = null;
  let sdkSessionPromise = null;
  let lastPageUrl = sanitizeUrl(window.location.href);
  let lastPageViewAt = 0;

  let isRecording = false;
  let recordingData = [];
  let recordingStartTime = null;
  let recordingTimer = null;
  let frictionEventCount = 0;

  const clickTracker = new Map();
  const RAGE_CLICK_THRESHOLD = 3;
  const RAGE_CLICK_WINDOW = 1000;
  const DEAD_CLICK_TIMEOUT = 3000;
  let maxScroll = 0;

  function shouldSkipForPrivacy() {
    const dntEnabled = navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.msDoNotTrack === '1';
    if (RESPECT_DNT && dntEnabled) {
      return true;
    }

    if (!REQUIRE_CONSENT) {
      return false;
    }

    return safeLocalStorageGet(CONSENT_STORAGE_KEY) !== 'granted';
  }

  function exposeConsentApi() {
    window.DreamFiAnalytics = {
      grantConsent: function() {
        safeLocalStorageSet(CONSENT_STORAGE_KEY, 'granted');
        window.location.reload();
      },
      revokeConsent: function() {
        safeLocalStorageSet(CONSENT_STORAGE_KEY, 'revoked');
      },
    };
  }

  function clampNumber(value, min, max) {
    if (!Number.isFinite(value)) {
      return min;
    }

    return Math.min(max, Math.max(min, value));
  }

  function safeLocalStorageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function safeLocalStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Storage may be unavailable in private mode or locked-down webviews.
    }
  }

  function safeLocalStorageRemove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore.
    }
  }

  function getOrCreateSessionId() {
    try {
      const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (existing) {
        return existing;
      }

      const created = generateUUID();
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, created);
      return created;
    } catch {
      return generateUUID();
    }
  }

  function loadPersistedQueue() {
    const raw = safeLocalStorageGet(QUEUE_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.slice(-MAX_QUEUE_SIZE) : [];
    } catch {
      safeLocalStorageRemove(QUEUE_STORAGE_KEY);
      return [];
    }
  }

  function persistQueue() {
    if (eventQueue.length === 0) {
      safeLocalStorageRemove(QUEUE_STORAGE_KEY);
      return;
    }

    safeLocalStorageSet(QUEUE_STORAGE_KEY, JSON.stringify(eventQueue.slice(-MAX_QUEUE_SIZE)));
  }

  function trimQueue() {
    if (eventQueue.length > MAX_QUEUE_SIZE) {
      eventQueue.splice(0, eventQueue.length - MAX_QUEUE_SIZE);
    }
  }

  function generateUUID() {
    if (window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }

    if (window.crypto?.getRandomValues) {
      const bytes = new Uint8Array(16);
      window.crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function sanitizeString(value, maxLength = 500) {
    if (value === undefined || value === null) {
      return value;
    }

    return String(value)
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
      .replace(/\b(?:\d[ -]*?){13,19}\b/g, '[redacted-card]')
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[redacted-ssn]')
      .slice(0, maxLength);
  }

  function sanitizeUrl(raw) {
    try {
      const parsed = new URL(raw, window.location.href);
      const result = `${parsed.origin}${parsed.pathname}`;

      let query = '';
      if (CAPTURE_QUERY_STRING && parsed.searchParams.size > 0) {
        const safeParams = new URLSearchParams();
        parsed.searchParams.forEach((value, key) => {
          safeParams.set(key, SENSITIVE_KEY_RE.test(key) ? '[redacted]' : sanitizeString(value, 120));
        });
        query = safeParams.toString() ? `?${safeParams.toString()}` : '';
      }

      return `${result}${query}${CAPTURE_HASH ? parsed.hash : ''}`;
    } catch {
      return sanitizeString(raw || 'unknown', 500);
    }
  }

  function sanitizeMetadata(value, depth = 0) {
    if (depth > 4) {
      return '[truncated]';
    }

    if (value === null || value === undefined || typeof value === 'boolean' || typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      return sanitizeString(value);
    }

    if (Array.isArray(value)) {
      return value.slice(0, 25).map(item => sanitizeMetadata(item, depth + 1));
    }

    if (typeof value === 'object') {
      const output = {};
      Object.entries(value).slice(0, 80).forEach(([key, nestedValue]) => {
        if (SENSITIVE_KEY_RE.test(key)) {
          output[key] = '[redacted]';
        } else {
          output[key] = sanitizeMetadata(nestedValue, depth + 1);
        }
      });
      return output;
    }

    return sanitizeString(String(value));
  }

  function getSelector(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return 'unknown';
    }

    if (element.closest?.(SENSITIVE_SELECTOR)) {
      return '[redacted]';
    }

    const tag = element.tagName.toLowerCase();
    const nudgrLabel = element.getAttribute('data-nudgr-label') || element.getAttribute('data-nudgr-id');
    if (nudgrLabel) {
      return `${tag}[data-nudgr-label="${sanitizeString(nudgrLabel, 80)}"]`;
    }

    const testId = element.getAttribute('data-testid') || element.getAttribute('data-test');
    if (testId) {
      return `${tag}[data-testid="${sanitizeString(testId, 80)}"]`;
    }

    if (element.id && !SENSITIVE_KEY_RE.test(element.id)) {
      return `${tag}#${sanitizeString(element.id, 80)}`;
    }

    if (typeof element.className === 'string' && element.className.trim()) {
      const classes = element.className
        .split(/\s+/)
        .filter(className => className && !SENSITIVE_KEY_RE.test(className))
        .slice(0, 3)
        .map(className => className.replace(/[^a-zA-Z0-9_-]/g, ''))
        .filter(Boolean);

      if (classes.length > 0) {
        return `${tag}.${classes.join('.')}`;
      }
    }

    const parent = element.parentElement;
    if (!parent) {
      return tag;
    }

    const siblings = Array.from(parent.children).filter(child => child.tagName === element.tagName);
    const index = Math.max(1, siblings.indexOf(element) + 1);
    return `${tag}:nth-of-type(${index})`;
  }

  function getPageStateFingerprint() {
    const body = document.body;
    return [
      sanitizeUrl(window.location.href),
      document.title,
      body ? body.innerText.length : 0,
      document.querySelectorAll('a,button,input,select,textarea,form').length,
      document.activeElement ? getSelector(document.activeElement) : '',
    ].join('|');
  }

  function redactDom(root) {
    root.querySelectorAll('script,noscript,style').forEach(node => node.remove());
    root.querySelectorAll('input,textarea,select').forEach(node => {
      node.setAttribute('value', '[redacted]');
      node.setAttribute('placeholder', '[redacted]');
      node.setAttribute('data-nudgr-redacted', 'true');
      node.textContent = '[redacted]';
    });
    root.querySelectorAll('[data-nudgr-redact],[data-private],[data-sensitive]').forEach(node => {
      node.textContent = '[redacted]';
      node.setAttribute('data-nudgr-redacted', 'true');
    });

    if (REDACT_TEXT) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) {
        nodes.push(walker.currentNode);
      }
      nodes.forEach(node => {
        if (node.textContent && node.textContent.trim()) {
          node.textContent = '[text]';
        }
      });
    }
  }

  function getRedactedHtmlSnapshot() {
    const clone = document.documentElement.cloneNode(true);
    redactDom(clone);
    return clone.outerHTML.substring(0, 50000);
  }

  function getFirstContentfulPaint() {
    const entries = performance.getEntriesByName('first-contentful-paint');
    return entries.length > 0 ? Math.round(entries[0].startTime) : 0;
  }

  function getTimeToInteractive() {
    const navEntry = performance.getEntriesByType('navigation')[0];
    return navEntry ? Math.round(navEntry.domInteractive) : 0;
  }

  function ensureSdkSessionToken() {
    if (sdkSessionToken) {
      return Promise.resolve(sdkSessionToken);
    }

    if (sdkSessionPromise) {
      return sdkSessionPromise;
    }

    sdkSessionPromise = fetch(SDK_SESSION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({
        sessionId: SESSION_ID,
        siteUserId: SITE_USER_ID,
        pageUrl: sanitizeUrl(window.location.href),
        userAgent: sanitizeString(navigator.userAgent, 512),
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Session bootstrap failed (${response.status})`);
        }

        return response.json();
      })
      .then((data) => {
        if (!data?.sdkSessionToken) {
          throw new Error('Missing sdkSessionToken in session bootstrap response');
        }

        sdkSessionToken = data.sdkSessionToken;
        return sdkSessionToken;
      })
      .catch((error) => {
        sdkSessionPromise = null;
        console.error('[DreamFiAnalytics] Failed to initialize SDK session:', error);
        throw error;
      });

    return sdkSessionPromise;
  }

  function sendWithSdkSession(url, options) {
    return ensureSdkSessionToken()
      .then((token) => {
        const mergedHeaders = {
          ...(options?.headers || {}),
          'x-api-key': API_KEY,
          'x-sdk-session-token': token,
        };

        return fetch(url, {
          ...options,
          headers: mergedHeaders,
          keepalive: options?.keepalive === true,
        });
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }

        return response;
      });
  }

  function normalizeEvent(event) {
    const eventData = sanitizeMetadata(event.data || {});
    const pageUrl = sanitizeUrl(eventData.pageUrl || window.location.href);
    const eventType = sanitizeString(eventData.eventType || event.type || 'custom', 80);

    return {
      type: eventType,
      sessionId: event.sessionId || SESSION_ID,
      timestamp: event.timestamp || Date.now(),
      eventId: event.eventId || generateUUID(),
      schemaVersion: SCHEMA_VERSION,
      sdkVersion: SDK_VERSION,
      data: {
        ...eventData,
        eventType,
        pageUrl,
        sdkVersion: SDK_VERSION,
        schemaVersion: SCHEMA_VERSION,
      },
    };
  }

  function queueEvent(event) {
    eventQueue.push(normalizeEvent(event));
    trimQueue();
    persistQueue();

    if (eventQueue.length >= BATCH_SIZE) {
      sendBatch();
    } else if (!batchTimer) {
      batchTimer = setTimeout(sendBatch, BATCH_INTERVAL);
    }
  }

  function scheduleRetry() {
    if (retryTimer || !eventQueue.length) {
      return;
    }

    const delay = Math.min(60000, 1000 * (2 ** retryAttempt));
    retryAttempt = Math.min(retryAttempt + 1, 6);
    retryTimer = setTimeout(() => {
      retryTimer = null;
      sendBatch();
    }, delay);
  }

  function sendBatch(options = {}) {
    if (eventQueue.length === 0) {
      return Promise.resolve();
    }

    if (navigator.onLine === false && options.keepalive !== true) {
      persistQueue();
      scheduleRetry();
      return Promise.resolve();
    }

    const batchSize = options.flushAll ? Math.min(eventQueue.length, 100) : Math.min(BATCH_SIZE, eventQueue.length);
    const batch = eventQueue.splice(0, batchSize);
    clearTimeout(batchTimer);
    batchTimer = null;
    persistQueue();

    return sendWithSdkSession(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events: batch }),
      keepalive: options.keepalive === true,
    })
      .then(() => {
        retryAttempt = 0;
        persistQueue();
        if (eventQueue.length > 0 && options.keepalive !== true) {
          batchTimer = setTimeout(sendBatch, 0);
        }
      })
      .catch((error) => {
        console.error('[DreamFiAnalytics] Failed to send events:', error);
        eventQueue.unshift(...batch);
        trimQueue();
        persistQueue();
        if (options.keepalive !== true) {
          scheduleRetry();
        }
      });
  }

  function trackPageView(reason) {
    const now = Date.now();
    const pageUrl = sanitizeUrl(window.location.href);
    if (pageUrl === lastPageUrl && now - lastPageViewAt < 1000) {
      return;
    }

    lastPageUrl = pageUrl;
    lastPageViewAt = now;
    maxScroll = 0;

    queueEvent({
      type: 'page_view',
      sessionId: SESSION_ID,
      timestamp: now,
      data: {
        eventType: 'page_view',
        pageUrl,
        elementSelector: 'body',
        severityScore: 0,
        metadata: {
          reason,
          title: sanitizeString(document.title, 160),
          referrer: sanitizeUrl(document.referrer || ''),
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        },
      },
    });
  }

  function trackFriction(data) {
    frictionEventCount++;
    const eventId = generateUUID();

    queueEvent({
      type: data.eventType || 'friction',
      sessionId: SESSION_ID,
      timestamp: Date.now(),
      eventId,
      data: {
        ...data,
        pageUrl: sanitizeUrl(data.pageUrl || window.location.href),
      },
    });

    if ((ENABLE_SCREENSHOTS || SCREENSHOT_ON_FRICTION) && Number(data.severityScore || 0) >= 7) {
      captureScreenshot(eventId);
    }

    if (ENABLE_RECORDING && !isRecording && Math.random() < RECORDING_SAMPLE_RATE) {
      startRecording();
    }
  }

  function trackHeatmap(data) {
    queueEvent({
      type: data.eventType || 'heatmap',
      sessionId: SESSION_ID,
      timestamp: Date.now(),
      data: {
        ...data,
        pageUrl: sanitizeUrl(data.pageUrl || window.location.href),
      },
    });
  }

  function trackPerformance(data) {
    queueEvent({
      type: 'performance',
      sessionId: SESSION_ID,
      timestamp: Date.now(),
      data: {
        eventType: 'performance',
        pageUrl: sanitizeUrl(data.pageUrl || window.location.href),
        severityScore: 0,
        ...data,
      },
    });
  }

  function trackScrollDepth(reason) {
    if (maxScroll <= 0) {
      return;
    }

    queueEvent({
      type: 'scroll_depth',
      sessionId: SESSION_ID,
      timestamp: Date.now(),
      data: {
        eventType: 'scroll_depth',
        pageUrl: sanitizeUrl(window.location.href),
        elementSelector: 'window',
        severityScore: 0,
        metadata: {
          maxScrollPercentage: maxScroll,
          reason,
        },
      },
    });
  }

  function startRecording() {
    if (isRecording) return;

    console.log('[DreamFiAnalytics] Starting session recording');
    isRecording = true;
    recordingStartTime = Date.now();
    recordingData = [];

    captureSnapshot('full');

    const observer = new MutationObserver((mutations) => {
      if (!isRecording) return;

      mutations.slice(0, 100).forEach((mutation) => {
        recordingData.push({
          type: 'mutation',
          timestamp: Date.now() - recordingStartTime,
          target: getSelector(mutation.target),
          mutationType: mutation.type,
          addedNodes: Array.from(mutation.addedNodes).slice(0, 20).map(n => getNodeInfo(n)),
          removedNodes: Array.from(mutation.removedNodes).slice(0, 20).map(n => getNodeInfo(n)),
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: !REDACT_TEXT,
    });

    let lastMouseCapture = 0;
    const mouseMoveHandler = (event) => {
      const now = Date.now();
      if (now - lastMouseCapture < 75) return;
      lastMouseCapture = now;

      recordingData.push({
        type: 'mouse',
        timestamp: now - recordingStartTime,
        x: event.clientX,
        y: event.clientY,
      });
    };
    document.addEventListener('mousemove', mouseMoveHandler);

    const clickHandler = (event) => {
      recordingData.push({
        type: 'click',
        timestamp: Date.now() - recordingStartTime,
        x: event.clientX,
        y: event.clientY,
        target: getSelector(event.target),
      });
    };
    document.addEventListener('click', clickHandler, true);

    const scrollHandler = () => {
      recordingData.push({
        type: 'scroll',
        timestamp: Date.now() - recordingStartTime,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
      });
    };
    window.addEventListener('scroll', scrollHandler);

    recordingTimer = setTimeout(stopRecording, RECORDING_MAX_DURATION);

    window.__dreamFiAnalyticsHandlers = {
      observer,
      mouseMoveHandler,
      clickHandler,
      scrollHandler,
    };
  }

  function stopRecording() {
    if (!isRecording) return;

    console.log('[DreamFiAnalytics] Stopping session recording');
    isRecording = false;

    const handlers = window.__dreamFiAnalyticsHandlers;
    if (handlers) {
      handlers.observer?.disconnect();
      document.removeEventListener('mousemove', handlers.mouseMoveHandler);
      document.removeEventListener('click', handlers.clickHandler, true);
      window.removeEventListener('scroll', handlers.scrollHandler);
    }

    clearTimeout(recordingTimer);
    uploadRecording();
  }

  function captureSnapshot(type) {
    recordingData.push({
      type: 'snapshot',
      snapshotType: type,
      timestamp: Date.now() - (recordingStartTime || Date.now()),
      url: sanitizeUrl(window.location.href),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      html: getRedactedHtmlSnapshot(),
    });
  }

  function getNodeInfo(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return { type: 'text', content: REDACT_TEXT ? '[text]' : sanitizeString(node.textContent || '', 100) };
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

    const durationSeconds = Math.floor((Date.now() - recordingStartTime) / 1000);
    const recordingBlob = new Blob([JSON.stringify(recordingData)], { type: 'application/json' });

    const formData = new FormData();
    formData.append('file', recordingBlob, `session-${SESSION_ID}.json`);
    formData.append('sessionId', SESSION_ID);
    formData.append('userId', SITE_USER_ID);
    formData.append('metadata', JSON.stringify({
      durationSeconds,
      pageUrl: sanitizeUrl(window.location.href),
      userAgent: sanitizeString(navigator.userAgent, 512),
      frictionEventsCount: frictionEventCount,
      recordingStart: new Date(recordingStartTime).toISOString(),
      recordingEnd: new Date().toISOString(),
      sdkVersion: SDK_VERSION,
    }));

    sendWithSdkSession(UPLOAD_ENDPOINT, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        console.log('[DreamFiAnalytics] Recording uploaded:', data);
      })
      .catch(error => {
        console.error('[DreamFiAnalytics] Failed to upload recording:', error);
      });

    recordingData = [];
    frictionEventCount = 0;
  }

  function captureScreenshot(eventId) {
    if (!ENABLE_SCREENSHOTS && !SCREENSHOT_ON_FRICTION) {
      return;
    }

    Promise.resolve()
      .then(async () => {
        if (!window.html2canvas) {
          const html2canvasScript = document.createElement('script');
          html2canvasScript.src = HTML2CANVAS_SRC;
          html2canvasScript.async = true;
          html2canvasScript.crossOrigin = 'anonymous';
          html2canvasScript.referrerPolicy = 'no-referrer';
          await new Promise((resolve, reject) => {
            html2canvasScript.onload = resolve;
            html2canvasScript.onerror = reject;
            document.head.appendChild(html2canvasScript);
          });
        }

        return window.html2canvas(document.body, {
          allowTaint: false,
          useCORS: true,
          logging: false,
          width: window.innerWidth,
          height: window.innerHeight,
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
          onclone: (clonedDocument) => {
            redactDom(clonedDocument.documentElement);
          },
        });
      })
      .then((canvas) => {
        if (!canvas) return;

        canvas.toBlob((blob) => {
          if (!blob) return;

          const formData = new FormData();
          formData.append('file', blob, `screenshot-${eventId}.png`);
          formData.append('eventId', eventId);
          formData.append('userId', SITE_USER_ID);

          sendWithSdkSession(SCREENSHOT_ENDPOINT, {
            method: 'POST',
            body: formData,
          })
            .then(response => response.json())
            .then(data => {
              console.log('[DreamFiAnalytics] Screenshot uploaded:', data);
            })
            .catch(error => {
              console.error('[DreamFiAnalytics] Failed to upload screenshot:', error);
            });
        }, 'image/png');
      })
      .catch((error) => {
        console.error('[DreamFiAnalytics] Screenshot capture failed:', error);
      });
  }

  function patchRouteTracking() {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    const afterRouteChange = (reason) => {
      setTimeout(() => {
        trackScrollDepth('route_change');
        trackPageView(reason);
      }, 0);
    };

    history.pushState = function() {
      const result = originalPushState.apply(this, arguments);
      afterRouteChange('pushState');
      return result;
    };

    history.replaceState = function() {
      const result = originalReplaceState.apply(this, arguments);
      afterRouteChange('replaceState');
      return result;
    };

    window.addEventListener('popstate', () => afterRouteChange('popstate'));
    window.addEventListener('hashchange', () => afterRouteChange('hashchange'));
  }

  window.addEventListener('error', (event) => {
    trackFriction({
      eventType: 'javascript_error',
      pageUrl: window.location.href,
      errorMessage: event.message,
      elementSelector: sanitizeString(event.filename || 'window', 300),
      severityScore: 8,
      metadata: {
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
      },
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    trackFriction({
      eventType: 'unhandled_rejection',
      pageUrl: window.location.href,
      errorMessage: event.reason?.message || String(event.reason),
      severityScore: 7,
      metadata: {
        reason: event.reason,
      },
    });
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    const selector = getSelector(target);
    const now = Date.now();

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
          element: target?.tagName,
        },
      });
      clickTracker.delete(selector);
    }

    const pageStateBeforeClick = getPageStateFingerprint();
    setTimeout(() => {
      if (pageStateBeforeClick === getPageStateFingerprint()) {
        trackFriction({
          eventType: 'dead_click',
          elementSelector: selector,
          pageUrl: window.location.href,
          userAction: 'click_no_response',
          severityScore: 6,
          metadata: {
            element: target?.tagName,
          },
        });
      }
    }, DEAD_CLICK_TIMEOUT);

    trackHeatmap({
      eventType: 'click',
      pageUrl: window.location.href,
      elementSelector: selector,
      interactionType: 'click',
      severityScore: 0,
      metadata: {
        x: event.clientX,
        y: event.clientY,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      },
    });
  }, true);

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
      },
    });
  }, true);

  window.addEventListener('scroll', () => {
    const scrollableHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const scrollPercent = clampNumber(Math.round((window.scrollY / scrollableHeight) * 100), 0, 100);
    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;
    }
  }, { passive: true });

  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      if (perfData) {
        trackPerformance({
          pageUrl: window.location.href,
          loadTime: Math.round(perfData.loadEventEnd - perfData.fetchStart),
          fcp: getFirstContentfulPaint(),
          tti: getTimeToInteractive(),
          metadata: {
            type: perfData.type,
            domInteractive: Math.round(perfData.domInteractive),
            responseEnd: Math.round(perfData.responseEnd),
          },
        });
      }
    }, 0);
  });

  window.addEventListener('online', () => sendBatch({ flushAll: true }));

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      trackScrollDepth('visibility_hidden');
      sendBatch({ keepalive: true, flushAll: true });
    }
  });

  window.addEventListener('pagehide', () => {
    if (isRecording) {
      stopRecording();
    }
    trackScrollDepth('pagehide');
    persistQueue();
    sendBatch({ keepalive: true, flushAll: true });
  });

  window.addEventListener('beforeunload', () => {
    persistQueue();
  });

  window.DreamFiAnalytics = {
    track: function(eventName, properties) {
      queueEvent({
        type: 'custom',
        sessionId: SESSION_ID,
        timestamp: Date.now(),
        data: {
          eventType: sanitizeString(eventName || 'custom', 80),
          pageUrl: window.location.href,
          severityScore: 0,
          metadata: properties || {},
        },
      });
    },
    flush: function() {
      return sendBatch({ flushAll: true });
    },
    grantConsent: function() {
      safeLocalStorageSet(CONSENT_STORAGE_KEY, 'granted');
    },
    revokeConsent: function() {
      safeLocalStorageSet(CONSENT_STORAGE_KEY, 'revoked');
    },
    sessionId: SESSION_ID,
  };

  patchRouteTracking();
  trackPageView('initial_load');
  ensureSdkSessionToken()
    .then(() => {
      if (eventQueue.length > 0) {
        sendBatch({ flushAll: true });
      }
    })
    .catch(() => {
      scheduleRetry();
    });

  console.log('[DreamFiAnalytics] Initialized with session:', SESSION_ID);
})();
