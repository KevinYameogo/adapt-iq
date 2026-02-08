(function() {
  if (typeof window === 'undefined') return;
  
  var noop = function() {};
  
  function shimHistory(obj) {
    if (!obj) return;
    try {
      // Define properties if they are missing or not functions
      if (typeof obj.replaceState !== 'function') {
        Object.defineProperty(obj, 'replaceState', {
          value: noop,
          writable: true,
          configurable: true
        });
      }
      if (typeof obj.pushState !== 'function') {
        Object.defineProperty(obj, 'pushState', {
          value: noop,
          writable: true,
          configurable: true
        });
      }
      // Ensure they stay as noops even if someone tries to overwrite them with something that fails
      var originalReplace = obj.replaceState;
      obj.replaceState = function() {
        try {
          return originalReplace.apply(this, arguments);
        } catch (e) {
          console.warn("Caught replaceState error", e);
        }
      };
    } catch (e) {
      console.error("Critical failure shimming history", e);
    }
  }

  // Shim both the window.history and the global history if they differ
  shimHistory(window.history);
  
  // Extra protection: catch unhandled rejections that might come from Next.js routing
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message && event.reason.message.indexOf('replaceState') !== -1) {
      console.warn("Silencing replaceState rejection");
      event.preventDefault();
    }
  });
})();
