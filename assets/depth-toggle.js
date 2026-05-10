/* Depth toggle: switches the body between .depth-standard and .depth-deep
   so blocks marked .detail-only become visible in deep mode.
   Persists choice across chapters via localStorage.
   Idempotent: safe to load multiple times. */

(function () {
  const KEY = "gt2026.depth";
  const STANDARD = "standard";
  const DEEP = "deep";

  function applyDepth(d) {
    document.body.classList.remove("depth-standard", "depth-deep");
    document.body.classList.add(d === DEEP ? "depth-deep" : "depth-standard");
    document.querySelectorAll("[data-depth-btn]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.dataset.depthBtn === d));
    });
  }

  function getStored() {
    try {
      const v = localStorage.getItem(KEY);
      return v === DEEP ? DEEP : STANDARD;
    } catch (e) { return STANDARD; }
  }

  function setStored(d) {
    try { localStorage.setItem(KEY, d); } catch (e) { /* ignore */ }
  }

  function init() {
    applyDepth(getStored());
    document.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-depth-btn]");
      if (!btn) return;
      const d = btn.dataset.depthBtn;
      setStored(d);
      applyDepth(d);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
