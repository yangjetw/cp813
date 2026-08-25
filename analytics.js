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
}());
