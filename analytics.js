(function () {
  "use strict";

  try {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };

    var gtagScript = document.createElement("script");
    gtagScript.async = true;
    gtagScript.src = "https://www.googletagmanager.com/gtag/js?id=G-619HGDM0GS";
    document.head.appendChild(gtagScript);

    window.gtag("js", new Date());
    window.gtag("config", "G-619HGDM0GS");
  } catch (_) {
    // Analytics must never interrupt the reading experience.
  }

  try {
    window.clarity = window.clarity || function () {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };

    var clarityScript = document.createElement("script");
    clarityScript.async = true;
    clarityScript.src = "https://www.clarity.ms/tag/y7udzp11ow";
    document.head.appendChild(clarityScript);
  } catch (_) {
    // Analytics must never interrupt the reading experience.
  }

  function trackEvent(eventName, parameters) {
    try {
      if (typeof window.gtag === "function") {
        window.gtag("event", eventName, parameters);
      }
    } catch (_) {
      // Analytics must never interrupt the reading experience.
    }
  }

  window.trackEntryVersion = function (version, entry_source) {
    trackEvent("entry_version", {
      version: version,
      entry_source: entry_source
    });
  };

  window.trackSlideView = function (slide_no, slide_name, version) {
    trackEvent("slide_view", {
      slide_no: slide_no,
      slide_name: slide_name,
      version: version
    });
  };

  window.trackSlideNavigation = function (from_slide, to_slide, direction, navigation_method, version) {
    trackEvent("slide_navigation", {
      from_slide: from_slide,
      to_slide: to_slide,
      direction: direction,
      navigation_method: navigation_method,
      version: version
    });
  };

  window.trackStoryComplete = function (version) {
    trackEvent("story_complete", { version: version });
  };

  window.trackInteractiveOpen = function (interactive_id, interactive_name, source_slide, version) {
    trackEvent("interactive_open", {
      interactive_id: interactive_id,
      interactive_name: interactive_name,
      source_slide: source_slide,
      version: version
    });
  };

  try {
    var queuedCalls = window.cp813AnalyticsQueue || [];
    window.cp813AnalyticsQueue = [];
    queuedCalls.forEach(function (queuedCall) {
      var method = window[queuedCall[0]];
      if (typeof method === "function") {
        method.apply(window, queuedCall[1]);
      }
    });
  } catch (_) {
    // Analytics must never interrupt the reading experience.
  }
}());
