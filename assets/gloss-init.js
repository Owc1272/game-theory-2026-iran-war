/* gloss-init.js — initializes Bootstrap popovers for both:
   (a) inline glossary triggers (buttons emitted by the gloss.lua filter)
   (b) Mermaid SVG nodes marked with a `gt-gloss-<id>` class
   Quarto bundles Bootstrap; window.bootstrap is available at runtime. */

(function () {
  // ---------- Shared: read gloss data island ----------
  var glossLookup = null;
  function getGlossData() {
    if (glossLookup !== null) return glossLookup;
    var el = document.getElementById("gt-gloss-data");
    if (!el) { glossLookup = {}; return glossLookup; }
    try {
      var arr = JSON.parse(el.textContent || "[]");
      glossLookup = {};
      arr.forEach(function (e) { glossLookup[e.id] = e; });
    } catch (e) {
      glossLookup = {};
    }
    return glossLookup;
  }

  function glossaryHref(id) {
    // Convert a gloss id (e.g. "olson-zeckhauser") into a glossary anchor.
    // Glossary chapter sections are auto-anchored from H2 headings; we point
    // at the page itself (the user can scroll/use TOC). Could be refined
    // to anchor exactly if we ever export the section IDs.
    var base = (window.GT_BASE || "/");
    if (!base.endsWith("/")) base = base + "/";
    return base + "glossary.html";
  }

  // ---------- (a) Inline button popovers ----------
  function initInlinePopovers() {
    if (typeof window.bootstrap === "undefined" || !window.bootstrap.Popover) return;
    document.querySelectorAll(
      'button.gloss-trigger[data-bs-toggle="popover"]:not([data-gloss-initialized])'
    ).forEach(function (el) {
      try {
        new window.bootstrap.Popover(el, {
          container: "body",
          html: true,
          sanitize: false,
          customClass: "gloss-popover",
          fallbackPlacements: ["top", "bottom", "right", "left"],
        });
        el.setAttribute("data-gloss-initialized", "1");
      } catch (e) { /* Bootstrap not yet ready */ }
    });
  }

  // ---------- (b) Mermaid node popovers ----------
  // Mermaid renders <pre class="mermaid"> blocks into SVG. After render, we
  // find nodes whose class list includes a gt-gloss-<id> token, look the gloss
  // up, attach the Bootstrap popover attributes, and instantiate the popover.
  function initMermaidGlosses() {
    if (typeof window.bootstrap === "undefined" || !window.bootstrap.Popover) return;
    var data = getGlossData();
    if (!Object.keys(data).length) return;

    // Walk every SVG <g> / <rect> / etc. with a gt-gloss-* class
    var nodes = document.querySelectorAll('svg [class*="gt-gloss-"]');
    nodes.forEach(function (node) {
      if (node.dataset.glossInitialized) return;
      // class can be SVGAnimatedString — read via getAttribute.
      var cls = node.getAttribute("class") || "";
      var token = cls.split(/\s+/).find(function (c) { return c.indexOf("gt-gloss-") === 0; });
      if (!token) return;
      var id = token.substring("gt-gloss-".length);
      var entry = data[id];
      if (!entry) return;

      var content = entry.body +
        '<br><br><a href="' + glossaryHref(id) + '" class="gloss-primer-link">Read full glossary entry &rarr;</a>';

      node.setAttribute("data-bs-toggle", "popover");
      node.setAttribute("data-bs-trigger", "focus hover");
      node.setAttribute("data-bs-html", "true");
      node.setAttribute("data-bs-placement", "top");
      node.setAttribute("data-bs-title", entry.title);
      node.setAttribute("data-bs-content", content);
      node.setAttribute("tabindex", "0");
      // SVG nodes don't accept inline style cursor reliably from CSS-class
      // selectors in all browsers; set directly.
      try { node.style.cursor = "help"; } catch (e) {}
      // Make all child shapes inherit the cursor and hit-testing.
      Array.from(node.querySelectorAll("rect, polygon, circle, path, text")).forEach(function (c) {
        try { c.style.cursor = "help"; } catch (e) {}
      });

      try {
        // Use manual trigger and attach our own listeners — Bootstrap's
        // auto-attach hover/focus handlers don't reliably fire on SVG <g>
        // elements across browsers.
        var pop = new window.bootstrap.Popover(node, {
          container: "body",
          html: true,
          sanitize: false,
          customClass: "gloss-popover",
          trigger: "manual",
          fallbackPlacements: ["top", "bottom", "right", "left"],
        });
        var hideTimer = null;
        var show = function () { if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; } pop.show(); };
        var hideSoon = function () {
          if (hideTimer) clearTimeout(hideTimer);
          hideTimer = setTimeout(function () {
            // Only hide if the cursor isn't currently over the popover itself.
            var tip = pop.tip;
            if (!tip || !tip.matches(":hover")) pop.hide();
          }, 200);
        };
        node.addEventListener("mouseenter", show);
        node.addEventListener("mouseleave", hideSoon);
        node.addEventListener("focus", show);
        node.addEventListener("blur", hideSoon);
        node.addEventListener("click", function (e) { e.stopPropagation(); show(); });
        // After tooltip is shown, also keep alive when hovering it.
        node.addEventListener("inserted.bs.popover", function () {
          var tip = pop.tip;
          if (!tip) return;
          tip.addEventListener("mouseenter", show);
          tip.addEventListener("mouseleave", hideSoon);
        });
        node.dataset.glossInitialized = "1";
      } catch (e) {
        if (window.console && console.warn) console.warn("[gloss] Popover init failed for", node, e);
      }
    });
    if (window.console && console.info) {
      console.info("[gloss] Mermaid SVG gloss nodes wired:", nodes.length);
    }
  }

  // Wait for Mermaid to render: poll until SVGs appear inside .mermaid blocks,
  // or until we hit max attempts. Then init.
  function waitForMermaidThenInit() {
    var attempts = 60; // ~12s at 200ms intervals
    function tick() {
      var blocks = document.querySelectorAll("pre.mermaid, div.mermaid");
      if (blocks.length === 0) {
        // No mermaid on this page; just init inline + done.
        initInlinePopovers();
        return;
      }
      var withSvg = 0;
      blocks.forEach(function (b) { if (b.querySelector("svg")) withSvg++; });
      if (withSvg >= blocks.length) {
        initMermaidGlosses();
        initInlinePopovers();
      } else if (--attempts > 0) {
        setTimeout(tick, 200);
      } else {
        // Give up on mermaid; init what we have.
        initMermaidGlosses();
        initInlinePopovers();
      }
    }
    tick();
  }

  // Outside-click dismissal for both kinds of popover.
  document.addEventListener("click", function (e) {
    if (typeof window.bootstrap === "undefined" || !window.bootstrap.Popover) return;
    document.querySelectorAll('[data-bs-toggle="popover"]').forEach(function (el) {
      var inst = window.bootstrap.Popover.getInstance(el);
      if (!inst) return;
      var tip = inst.tip;
      if (el.contains(e.target)) return;
      if (tip && tip.contains(e.target)) return;
      inst.hide();
    });
  });

  // ESC dismisses all open popovers.
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (typeof window.bootstrap === "undefined" || !window.bootstrap.Popover) return;
    document.querySelectorAll('[data-bs-toggle="popover"]').forEach(function (el) {
      var inst = window.bootstrap.Popover.getInstance(el);
      if (inst) inst.hide();
    });
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForMermaidThenInit);
  } else {
    waitForMermaidThenInit();
  }
})();
