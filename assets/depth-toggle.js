/* Depth toggle: switches the body between .depth-concise (default) and
   .depth-deep so blocks marked .deep-only become visible in deep mode and
   blocks marked .concise-only get hidden.
   Persists choice across chapters via localStorage.
   Idempotent: safe to load multiple times. */

(function () {
  const KEY = "gt2026.depth";
  const CONCISE = "concise";
  const DEEP = "deep";

  function applyDepth(d) {
    document.body.classList.remove("depth-concise", "depth-deep");
    document.body.classList.add(d === DEEP ? "depth-deep" : "depth-concise");
    document.querySelectorAll("[data-depth-btn]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.dataset.depthBtn === d));
    });
  }

  function getStored() {
    try {
      const v = localStorage.getItem(KEY);
      return v === DEEP ? DEEP : CONCISE;
    } catch (e) { return CONCISE; }
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
