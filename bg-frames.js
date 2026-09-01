/* ==========================================================================
   RIZVI HASAN — CINEMATIC SCROLL-CONTROLLED FRAME-SEQUENCE BACKGROUND
   New, self-contained addition. Does not touch script.js or any existing
   site behaviour — it only draws into its own canvas layer behind the page.
   ========================================================================== */

/* ---------- EDITABLE CONFIG — swap frames or retune here ---------- */
const BG_FRAMES_CONFIG = {
  frameCount: 102,                 // total frames in the sequence (000..101)
  desktopPath: "assets/frames/frame_{n}.webp",        // {n} -> zero-padded 3-digit index
  mobilePath: "assets/frames-mobile/frame_{n}.webp",  // smaller/lighter set for phones
  mobileBreakpoint: 760,           // px — matches the site's existing mobile breakpoint
  padLength: 3,                    // frame_000.webp
  concurrentLoads: 6,              // how many frames to fetch in parallel while preloading
  smoothing: 0.16,                 // 0..1 — how quickly the drawn frame catches up to the scroll target (higher = snappier)
  reducedMotionFrameFraction: 0.28 // which single frame (as a fraction of the sequence) to show for prefers-reduced-motion
};

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobileViewport = window.matchMedia(`(max-width: ${BG_FRAMES_CONFIG.mobileBreakpoint}px)`).matches;

  const scene = document.getElementById("bgScene");
  const canvas = document.getElementById("bgSceneCanvas");
  if (!scene || !canvas) return; // markup not present — nothing to do

  const ctx = canvas.getContext("2d", { alpha: false });

  const basePath = isMobileViewport ? BG_FRAMES_CONFIG.mobilePath : BG_FRAMES_CONFIG.desktopPath;
  const frameCount = BG_FRAMES_CONFIG.frameCount;

  function frameUrl(index) {
    const n = String(index).padStart(BG_FRAMES_CONFIG.padLength, "0");
    return basePath.replace("{n}", n);
  }

  /* ---------------------------------------------------------------------
     Frame cache + progressive preloader
  --------------------------------------------------------------------- */
  const images = new Array(frameCount).fill(null); // holds loaded HTMLImageElement or null
  const inFlight = new Set();
  let highestLoadedContiguous = -1; // for a simple "ready" signal

  function loadFrame(index, { priority = false } = {}) {
    if (index < 0 || index >= frameCount) return;
    if (images[index] || inFlight.has(index)) return;
    inFlight.add(index);
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      images[index] = img;
      inFlight.delete(index);
      if (index === highestLoadedContiguous + 1) {
        while (images[highestLoadedContiguous + 1]) highestLoadedContiguous++;
      }
      requestRender();
    };
    img.onerror = () => {
      inFlight.delete(index);
    };
    img.src = frameUrl(index);
    if (priority) {
      // Priority frames are requested immediately (already done above by
      // creating the Image and setting src) — nothing further needed since
      // the browser's own network queue handles ordering reasonably well
      // once the src is assigned first.
    }
  }

  // Queue-based background preloading so we never block the main thread or
  // flood the network — loads a limited number of frames concurrently,
  // walking outward from frame 0.
  function startBackgroundPreload() {
    let cursor = 0;
    function pump() {
      let active = inFlight.size;
      while (active < BG_FRAMES_CONFIG.concurrentLoads && cursor < frameCount) {
        if (!images[cursor] && !inFlight.has(cursor)) {
          loadFrame(cursor);
          active++;
        }
        cursor++;
      }
      if (cursor < frameCount || inFlight.size > 0) {
        const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 60));
        idle(pump, { timeout: 250 });
      }
    }
    pump();
  }

  /* ---------------------------------------------------------------------
     Canvas sizing (cover-fit, capped device pixel ratio for performance)
  --------------------------------------------------------------------- */
  let cw = 0, ch = 0, dpr = 1;
  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = window.innerWidth;
    ch = window.innerHeight;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFrame(Math.round(currentFrame), true);
  }

  function drawFrame(index, force) {
    if (index < 0) index = 0;
    if (index > frameCount - 1) index = frameCount - 1;
    let img = images[index];
    // graceful fallback: if the exact frame hasn't loaded yet, use the
    // nearest already-loaded frame so the visual never blanks out.
    if (!img) {
      let lo = index, hi = index;
      while ((lo >= 0 || hi < frameCount) && !img) {
        if (lo >= 0 && images[lo]) { img = images[lo]; break; }
        if (hi < frameCount && images[hi]) { img = images[hi]; break; }
        lo--; hi++;
      }
      // still nothing loaded at all — try to kick off a load and bail
      if (!img) {
        loadFrame(index, { priority: true });
        return;
      }
    }
    if (!force && index === lastDrawnIndex) return;
    lastDrawnIndex = index;

    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale, dh = ih * scale;
    const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);

    if (!canvas.classList.contains("is-ready")) {
      canvas.classList.add("is-ready");
    }
  }

  /* ---------------------------------------------------------------------
     Scroll -> target frame mapping
  --------------------------------------------------------------------- */
  let targetFrame = 0;
  let currentFrame = 0;
  let lastDrawnIndex = -1;
  let rafRunning = false;

  function computeTargetFrame() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    targetFrame = progress * (frameCount - 1);
    // Ask for the exact frame we're scrubbing toward first, then let the
    // background queue fill in the rest around it.
    loadFrame(Math.round(targetFrame), { priority: true });
    requestRender();
  }

  function requestRender() {
    if (rafRunning || reduceMotion) return;
    rafRunning = true;
    requestAnimationFrame(tick);
  }

  function tick() {
    const delta = targetFrame - currentFrame;
    if (Math.abs(delta) < 0.03) {
      currentFrame = targetFrame;
    } else {
      currentFrame += delta * BG_FRAMES_CONFIG.smoothing;
    }
    drawFrame(Math.round(currentFrame));

    if (Math.abs(targetFrame - currentFrame) > 0.03) {
      requestAnimationFrame(tick);
    } else {
      rafRunning = false;
    }
  }

  /* ---------------------------------------------------------------------
     Init
  --------------------------------------------------------------------- */
  function init() {
    resizeCanvas();

    if (reduceMotion) {
      const staticIndex = Math.round((frameCount - 1) * BG_FRAMES_CONFIG.reducedMotionFrameFraction);
      loadFrame(staticIndex, { priority: true });
      const check = setInterval(() => {
        if (images[staticIndex]) {
          drawFrame(staticIndex, true);
          clearInterval(check);
        }
      }, 80);
      // Still background-preload gently in case the user later disables
      // reduced motion mid-session (rare, but keeps it consistent).
      startBackgroundPreload();
      window.addEventListener("resize", debounce(resizeCanvas, 150));
      return;
    }

    loadFrame(0, { priority: true });
    const firstFrameCheck = setInterval(() => {
      if (images[0]) {
        drawFrame(0, true);
        clearInterval(firstFrameCheck);
      }
    }, 40);

    startBackgroundPreload();

    let scrollTicking = false;
    window.addEventListener("scroll", () => {
      if (!scrollTicking) {
        requestAnimationFrame(() => {
          computeTargetFrame();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });

    window.addEventListener("resize", debounce(resizeCanvas, 150));

    computeTargetFrame();
  }

  function debounce(fn, wait) {
    let t = null;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
