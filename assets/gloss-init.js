/* gloss-init.js — initialize Bootstrap popovers on glossary triggers.
   Quarto bundles Bootstrap, so window.bootstrap is available at runtime.
   Idempotent and safe to re-run on dynamic content insertions. */

(function () {
  function initPopovers() {
    if (typeof window.bootstrap === "undefined" || !window.bootstrap.Popover) {
      return;
    }
    var triggers = document.querySelectorAll(
      '[data-bs-toggle="popover"]:not([data-gloss-initialized])'
    );
    triggers.forEach(function (el) {
      try {
        new window.bootstrap.Popover(el, {
          container: "body",
          html: true,
          sanitize: true,
          customClass: "gloss-popover",
          fallbackPlacements: ["top", "bottom", "right", "left"],
        });
        el.setAttribute("data-gloss-initialized", "1");
      } catch (e) {
        /* ignore — Bootstrap not yet ready, will retry on next call */
      }
    });
  }

  // Dismiss popover when user clicks outside the trigger or the popover itself.
  document.addEventListener("click", function (e) {
    if (typeof window.bootstrap === "undefined" || !window.bootstrap.Popover) return;
    document.querySelectorAll('[data-bs-toggle="popover"]').forEach(function (el) {
      var inst = window.bootstrap.Popover.getInstance(el);
      if (!inst) return;
      var tip = inst.tip;
      if (el.contains(e.target)) return;     // click was on the trigger
      if (tip && tip.contains(e.target)) return; // click was inside the popover
      inst.hide();
    });
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPopovers);
  } else {
    initPopovers();
  }
})();
