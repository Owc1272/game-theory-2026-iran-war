/* gloss-init.js — wires up two kinds of gloss popovers:
   (a) inline glossary buttons (Bootstrap popover — works fine on HTML buttons)
   (b) Mermaid SVG nodes marked with gt-gloss-<id> (custom popover — Bootstrap's
       Popper-based positioning is unreliable on SVG <g> elements, so we use a
       self-contained popover element positioned via getBoundingClientRect.) */

(function () {
  // ---------- Glossary data island ----------
  var glossLookup = null;
  function getGlossData() {
    if (glossLookup !== null) return glossLookup;
    var el = document.getElementById("gt-gloss-data");
    if (!el) { glossLookup = {}; return glossLookup; }
    try {
      var arr = JSON.parse(el.textContent || "[]");
      glossLookup = {};
      arr.forEach(function (e) { glossLookup[e.id] = e; });
    } catch (e) { glossLookup = {}; }
    return glossLookup;
  }

  function glossaryHref() {
    var base = (window.GT_BASE || "/");
    if (!base.endsWith("/")) base += "/";
    return base + "glossary.html";
  }

  // ---------- (a) Inline button popovers (Bootstrap) ----------
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

  // ---------- (b) Custom popover for SVG nodes ----------
  var customPop = null;
  var hideTimer = null;
  var pinned = false;

  function ensureCustomPopover() {
    if (customPop) return customPop;
    var p = document.createElement("div");
    p.id = "gt-custom-popover";
    p.setAttribute("role", "tooltip");
    p.innerHTML =
      '<div class="gt-popover-header"></div>' +
      '<div class="gt-popover-body"></div>' +
      '<div class="gt-popover-arrow"></div>';
    document.body.appendChild(p);
    // Keep the popover alive while the cursor is over it.
    p.addEventListener("mouseenter", function () {
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    });
    p.addEventListener("mouseleave", scheduleHide);
    customPop = p;
    return p;
  }

  function showCustomPopover(node, entry) {
    var p = ensureCustomPopover();
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    p.querySelector(".gt-popover-header").textContent = entry.title;
    p.querySelector(".gt-popover-body").innerHTML =
      escapeForBody(entry.body) +
      '<br><br><a href="' + glossaryHref() + '" class="gloss-primer-link">Read full glossary entry &rarr;</a>';
    p.style.display = "block";
    // Force layout to read dimensions, then position.
    requestAnimationFrame(function () { positionCustomPopover(node); });
  }

  // Body content is plain text from the YAML; we want to render <br> we put in
  // ourselves but escape any HTML chars in the original body text.
  function escapeForBody(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function positionCustomPopover(node) {
    var p = customPop;
    if (!p) return;
    var nodeRect = node.getBoundingClientRect();
    var popRect = p.getBoundingClientRect();
    var margin = 8;
    var arrowSize = 8;
    // Default: place above the node, horizontally centered.
    var top = nodeRect.top + window.scrollY - popRect.height - arrowSize;
    var left = nodeRect.left + window.scrollX + (nodeRect.width - popRect.width) / 2;
    var placement = "top";
    if (nodeRect.top - popRect.height - arrowSize < margin) {
      // Not enough room above — flip below.
      top = nodeRect.bottom + window.scrollY + arrowSize;
      placement = "bottom";
    }
    // Clamp horizontally to viewport.
    var maxLeft = window.scrollX + window.innerWidth - popRect.width - margin;
    var minLeft = window.scrollX + margin;
    if (left > maxLeft) left = maxLeft;
    if (left < minLeft) left = minLeft;
    p.style.top = top + "px";
    p.style.left = left + "px";
    p.dataset.placement = placement;
    // Position the arrow horizontally so it points at the node center.
    var arrow = p.querySelector(".gt-popover-arrow");
    if (arrow) {
      var nodeCenterX = nodeRect.left + window.scrollX + nodeRect.width / 2;
      var arrowLeft = nodeCenterX - left - arrowSize;
      arrow.style.left = Math.max(12, Math.min(popRect.width - 24, arrowLeft)) + "px";
    }
  }

  function scheduleHide() {
    if (pinned) return;
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      if (!pinned && customPop) customPop.style.display = "none";
      hideTimer = null;
    }, 200);
  }

  function hideCustomNow() {
    pinned = false;
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    if (customPop) customPop.style.display = "none";
  }

  // ---------- Wire up SVG node triggers ----------
  function wireSvgNodes() {
    var data = getGlossData();
    var keyCount = Object.keys(data).length;
    var nodes = document.querySelectorAll('svg [class*="gt-gloss-"]');
    if (window.console && console.info) {
      console.info("[gloss] data entries:", keyCount, "| SVG candidate nodes:", nodes.length);
    }
    var wired = 0;
    nodes.forEach(function (node) {
      if (node.dataset.glossInitialized) return;
      var cls = node.getAttribute("class") || "";
      var token = cls.split(/\s+/).find(function (c) { return c.indexOf("gt-gloss-") === 0; });
      if (!token) return;
      var id = token.substring("gt-gloss-".length);
      var entry = data[id];
      if (!entry) {
        if (window.console && console.warn) console.warn("[gloss] no data for id", id);
        return;
      }
      try { node.style.cursor = "help"; } catch (e) {}
      Array.from(node.querySelectorAll("rect, polygon, circle, path, text")).forEach(function (c) {
        try { c.style.cursor = "help"; } catch (e) {}
      });
      node.setAttribute("tabindex", "0");
      node.setAttribute("role", "button");
      node.setAttribute("aria-label", "Glossary: " + entry.title);

      var open = function () { showCustomPopover(node, entry); };
      var closeSoon = function () { scheduleHide(); };
      node.addEventListener("mouseenter", open);
      node.addEventListener("mouseleave", closeSoon);
      node.addEventListener("focus", open);
      node.addEventListener("blur", closeSoon);
      node.addEventListener("click", function (e) {
        e.stopPropagation();
        pinned = true;
        open();
      });
      node.dataset.glossInitialized = "1";
      wired++;
    });
    if (window.console && console.info) {
      console.info("[gloss] SVG nodes wired:", wired);
    }
  }

  // ---------- Initialize: poll for SVG nodes + watch via MutationObserver ----------
  // Earlier version polled for pre.mermaid wrappers, but Mermaid REPLACES those
  // with the rendered SVG, so the selector returned 0 after render and the init
  // bailed out. Now we poll for the actual gt-gloss-* SVG nodes we need.
  function waitForMermaidThenInit() {
    initInlinePopovers();   // Inline buttons don't need to wait — wire them now.

    // Phase 1: brief poll for the typical Mermaid-render window (~4s).
    var attempts = 20;
    function tick() {
      wireSvgNodes();
      var remaining = document.querySelectorAll(
        'svg [class*="gt-gloss-"]:not([data-gloss-initialized])'
      ).length;
      if (remaining === 0) return;   // all wired
      if (--attempts > 0) setTimeout(tick, 200);
    }
    tick();

    // Phase 2: MutationObserver picks up any late-rendering SVG (e.g. scrolly
    // sections that lazy-mount, theme switches that re-render Mermaid).
    if (window.MutationObserver) {
      var pending = false;
      var obs = new MutationObserver(function () {
        if (pending) return;
        pending = true;
        // Coalesce bursts of mutations into one wire pass per animation frame.
        requestAnimationFrame(function () {
          pending = false;
          wireSvgNodes();
        });
      });
      obs.observe(document.body, { childList: true, subtree: true });
    }
  }

  // ---------- Outside-click and ESC dismissal ----------
  document.addEventListener("click", function (e) {
    if (customPop && customPop.style.display === "block") {
      if (customPop.contains(e.target)) return;
      var anyTrigger = e.target.closest('[class*="gt-gloss-"]');
      if (!anyTrigger) hideCustomNow();
    }
    if (typeof window.bootstrap !== "undefined" && window.bootstrap.Popover) {
      document.querySelectorAll('button.gloss-trigger[data-bs-toggle="popover"]').forEach(function (el) {
        var inst = window.bootstrap.Popover.getInstance(el);
        if (!inst) return;
        var tip = inst.tip;
        if (el.contains(e.target)) return;
        if (tip && tip.contains(e.target)) return;
        inst.hide();
      });
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    hideCustomNow();
    if (typeof window.bootstrap === "undefined" || !window.bootstrap.Popover) return;
    document.querySelectorAll('button.gloss-trigger[data-bs-toggle="popover"]').forEach(function (el) {
      var inst = window.bootstrap.Popover.getInstance(el);
      if (inst) inst.hide();
    });
  });

  // ---------- Reposition on scroll/resize while popover open ----------
  window.addEventListener("scroll", function () {
    // Hide on scroll; users typically don't want a sticky popover while scrolling.
    if (customPop && customPop.style.display === "block") {
      customPop.style.display = "none";
      pinned = false;
    }
  }, { passive: true });
  window.addEventListener("resize", hideCustomNow);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForMermaidThenInit);
  } else {
    waitForMermaidThenInit();
  }
})();
