/* ==========================================================================
   RIZVI HASAN — PORTFOLIO
   ========================================================================== */

/* ---------- EDITABLE CONFIG — update these, nothing else ---------- */
const CONFIG = {
  email: "your-email@example.com",       // TODO: replace with real email
  linkedin: "https://www.linkedin.com/in/your-profile", // TODO: replace with real LinkedIn URL
  formEndpoint: null,                     // TODO: set to a form backend (e.g. Formspree URL) to actually send messages
};

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /* ---------------------------------------------------------------------
     Wire up contact links from CONFIG
  --------------------------------------------------------------------- */
  function wireContactLinks() {
    const mailLinks = [document.getElementById("connectMail")];
    mailLinks.forEach((el) => {
      if (!el) return;
      el.href = `mailto:${CONFIG.email}`;
    });
    const liLinks = [
      document.getElementById("connectLinkedin"),
      document.getElementById("footerLinkedin"),
      document.getElementById("mobileLinkedin"),
    ];
    liLinks.forEach((el) => {
      if (!el) return;
      el.href = CONFIG.linkedin;
      el.target = "_blank";
      el.rel = "noopener";
    });
  }
  wireContactLinks();

  /* ---------------------------------------------------------------------
     Lenis smooth scroll
  --------------------------------------------------------------------- */
  let lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    if (window.gsap && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  // Smooth-scroll anchor links (works with or without Lenis)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMobileMenu();
      if (lenis) {
        lenis.scrollTo(target, { offset: -20 });
      } else {
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      }
    });
  });

  /* ---------------------------------------------------------------------
     GSAP registration
  --------------------------------------------------------------------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);

  /* ---------------------------------------------------------------------
     Page-load hero entrance
  --------------------------------------------------------------------- */
  function heroEntrance() {
    const lines = document.querySelectorAll(".hero__headline .line");
    if (!hasGSAP) {
      lines.forEach((l) => (l.style.opacity = 1));
      document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in"));
      return;
    }
    lines.forEach((l) => {
      const span = document.createElement("span");
      span.textContent = l.textContent;
      l.textContent = "";
      l.appendChild(span);
      gsap.set(span, { y: "110%", display: "block" });
    });
    const tl = gsap.timeline({ delay: 0.15 });
    tl.to(".hero__headline .line span", {
      y: "0%",
      duration: 1.1,
      ease: "power4.out",
      stagger: 0.11,
    }).to(
      ".hero__kicker, .hero__sub, .hero__cta",
      { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 },
      "-=0.6"
    );
  }
  heroEntrance();

  /* ---------------------------------------------------------------------
     Generic reveal-on-scroll for [data-reveal]
  --------------------------------------------------------------------- */
  function initReveals() {
    const els = document.querySelectorAll("[data-reveal]");
    if (!hasGSAP) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    els.forEach((el) => {
      // hero elements are handled by heroEntrance
      if (el.closest(".hero")) return;
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        onEnter: () => el.classList.add("is-in"),
        once: true,
      });
    });
  }
  initReveals();

  /* ---------------------------------------------------------------------
     Split headline reveal for [data-split]
  --------------------------------------------------------------------- */
  function initSplits() {
    document.querySelectorAll("[data-split]").forEach((el) => {
      const text = el.textContent.trim();
      const words = text.split(/\s+/);
      el.innerHTML = words
        .map((w) => `<span class="word" style="display:inline-block;">${w}&nbsp;</span>`)
        .join("");
      if (!hasGSAP) {
        el.querySelectorAll(".word").forEach((w) => (w.style.opacity = 1));
        return;
      }
      gsap.set(el.querySelectorAll(".word"), { opacity: 0, y: 18 });
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(el.querySelectorAll(".word"), {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.035,
          });
        },
      });
    });
  }
  initSplits();

  /* ---------------------------------------------------------------------
     Statement paragraph: per-word opacity tied to scroll position
  --------------------------------------------------------------------- */
  function initStatementScrub() {
    const el = document.querySelector(".statement__text");
    if (!el || !hasGSAP) return;
    const text = el.textContent.trim();
    const words = text.split(/\s+/);
    el.innerHTML = words.map((w) => `<span class="word">${w}&nbsp;</span>`).join("");
    const wordEls = el.querySelectorAll(".word");
    gsap.set(wordEls, { opacity: 0.22 });
    gsap.to(wordEls, {
      opacity: 1,
      stagger: 0.06,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top 75%",
        end: "bottom 45%",
        scrub: 0.4,
      },
    });
  }
  // statement uses [data-split] already handled generically is skipped since it's not tagged data-split
  initStatementScrub();

  /* ---------------------------------------------------------------------
     Hero parallax on scroll
  --------------------------------------------------------------------- */
  function initHeroParallax() {
    if (!hasGSAP || reduceMotion) return;
    gsap.to(".hero__grid", {
      yPercent: 20,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
    gsap.to(".hero__headline", {
      yPercent: -14,
      opacity: 0.35,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
    gsap.to(".hero__foot", {
      yPercent: -6,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
  }
  initHeroParallax();

  /* ---------------------------------------------------------------------
     Nav: hide on scroll down, show on scroll up + scrolled state
  --------------------------------------------------------------------- */
  function initNav() {
    const nav = document.getElementById("siteNav");
    let lastY = window.scrollY;
    let ticking = false;

    function update() {
      const y = window.scrollY;
      nav.classList.toggle("is-scrolled", y > 40);
      if (y > lastY && y > 140) {
        nav.classList.add("is-hidden");
      } else {
        nav.classList.remove("is-hidden");
      }
      lastY = y;
      ticking = false;
    }
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    });
    update();
  }
  initNav();

  /* ---------------------------------------------------------------------
     Mobile menu
  --------------------------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  function openMobileMenu() {
    mobileMenu.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("no-scroll");
  }
  function closeMobileMenu() {
    mobileMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("no-scroll");
  }
  navToggle.addEventListener("click", () => {
    mobileMenu.classList.contains("is-open") ? closeMobileMenu() : openMobileMenu();
  });
  mobileMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMobileMenu));

  /* ---------------------------------------------------------------------
     Scroll progress rail
  --------------------------------------------------------------------- */
  function initProgress() {
    const fill = document.getElementById("progressFill");
    if (!fill) return;
    function update() {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (scrolled / max) * 100 : 0;
      fill.style.height = pct + "%";
    }
    window.addEventListener("scroll", update);
    update();
  }
  initProgress();

  /* ---------------------------------------------------------------------
     Custom cursor
  --------------------------------------------------------------------- */
  function initCursor() {
    if (isTouch) return;
    const cursor = document.getElementById("cursor");
    const label = cursor.querySelector(".cursor-label");
    cursor.classList.add("is-active");
    let mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
    });
    (function loop() {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();

    const hoverables = document.querySelectorAll("a, button, [data-project], .skills__tags span");
    hoverables.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.classList.add("is-hover");
        const custom = el.getAttribute("data-cursor");
        if (custom) {
          label.textContent = custom;
        } else if (el.closest("[data-project]")) {
          label.textContent = "VIEW";
        } else {
          label.textContent = "";
        }
      });
      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("is-hover");
        label.textContent = "";
      });
    });
  }
  initCursor();

  /* ---------------------------------------------------------------------
     Magnetic buttons
  --------------------------------------------------------------------- */
  function initMagnetic() {
    if (isTouch || reduceMotion) return;
    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.4}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "translate(0,0)";
      });
    });
  }
  initMagnetic();

  /* ---------------------------------------------------------------------
     Marquees (stats + tools) — velocity-linked via GSAP ticker
  --------------------------------------------------------------------- */
  function initMarquee(trackId, speed) {
    const track = document.getElementById(trackId);
    if (!track || reduceMotion) return;
    let x = 0;
    const groupWidth = () => track.children[0].getBoundingClientRect().width;
    gsap.ticker.add(() => {
      x -= speed;
      const w = groupWidth();
      if (Math.abs(x) >= w) x += w;
      track.style.transform = `translateX(${x}px)`;
    });
  }
  if (hasGSAP) {
    initMarquee("statsTrack", 0.6);
    initMarquee("toolsTrack", 0.45);
  }

  /* ---------------------------------------------------------------------
     Timeline progress line + active marker
  --------------------------------------------------------------------- */
  function initTimeline() {
    const line = document.getElementById("timelineFill");
    const items = document.querySelectorAll("[data-timeline-item]");
    if (!line || !items.length) return;
    if (!hasGSAP) {
      items.forEach((i) => i.classList.add("is-active"));
      return;
    }
    gsap.to(line, {
      height: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: "#timeline",
        start: "top 60%",
        end: "bottom 70%",
        scrub: 0.5,
      },
    });
    items.forEach((item) => {
      ScrollTrigger.create({
        trigger: item,
        start: "top 65%",
        onEnter: () => item.classList.add("is-active"),
      });
    });
  }
  initTimeline();

  /* ---------------------------------------------------------------------
     Approach: scroll-driven step progress
  --------------------------------------------------------------------- */
  function initApproach() {
    const progress = document.getElementById("approachProgress");
    const steps = document.querySelectorAll("[data-approach-step]");
    if (!progress || !steps.length || !hasGSAP) {
      steps.forEach((s) => s.classList.add("is-active"));
      return;
    }
    gsap.to(progress, {
      height: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: ".approach__wrap",
        start: "top 55%",
        end: "bottom 60%",
        scrub: 0.5,
      },
    });
    steps.forEach((step) => {
      ScrollTrigger.create({
        trigger: step,
        start: "top 60%",
        end: "bottom 40%",
        onEnter: () => step.classList.add("is-active"),
        onEnterBack: () => step.classList.add("is-active"),
        onLeave: () => step.classList.remove("is-active"),
        onLeaveBack: () => step.classList.remove("is-active"),
      });
    });
  }
  initApproach();

  /* ---------------------------------------------------------------------
     Brand type: each word lights up as it enters view
  --------------------------------------------------------------------- */
  function initBrandType() {
    const words = document.querySelectorAll("[data-brand-word]");
    if (!words.length) return;
    if (!hasGSAP) {
      words.forEach((w) => w.classList.add("is-lit"));
      return;
    }
    words.forEach((w) => {
      ScrollTrigger.create({
        trigger: w,
        start: "top 75%",
        onEnter: () => w.classList.add("is-lit"),
        onLeaveBack: () => w.classList.remove("is-lit"),
      });
    });
  }
  initBrandType();

  /* ---------------------------------------------------------------------
     Project modal
  --------------------------------------------------------------------- */
  function initProjectModal() {
    const modal = document.getElementById("projectModal");
    const projects = document.querySelectorAll("[data-project]");
    const fields = {
      cat: document.getElementById("modalCat"),
      title: document.getElementById("modalTitle"),
      desc: document.getElementById("modalDesc"),
      role: document.getElementById("modalRole"),
      work: document.getElementById("modalWork"),
      tools: document.getElementById("modalTools"),
    };

    function open(project) {
      fields.cat.textContent = project.dataset.category;
      fields.title.textContent = project.dataset.title;
      fields.desc.textContent = project.dataset.desc;
      fields.role.innerHTML = project.dataset.role;
      fields.work.textContent = project.dataset.work;
      fields.tools.textContent = project.dataset.tools;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.documentElement.classList.add("no-scroll");
    }
    function close() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.documentElement.classList.remove("no-scroll");
    }
    projects.forEach((p) => {
      p.addEventListener("click", () => open(p));
      p.setAttribute("tabindex", "0");
      p.setAttribute("role", "button");
      p.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(p);
        }
      });
    });
    modal.querySelectorAll("[data-close-modal]").forEach((el) => el.addEventListener("click", close));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) close();
    });
  }
  initProjectModal();

  /* ---------------------------------------------------------------------
     Contact form validation
  --------------------------------------------------------------------- */
  function initForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;
    const status = document.getElementById("formStatus");

    function setError(fieldId, errId, message) {
      const field = document.getElementById(fieldId);
      const err = document.getElementById(errId);
      field.closest(".field").classList.toggle("has-error", !!message);
      err.textContent = message || "";
    }

    function validate() {
      let valid = true;
      const name = document.getElementById("fName").value.trim();
      const email = document.getElementById("fEmail").value.trim();
      const message = document.getElementById("fMessage").value.trim();

      if (!name) {
        setError("fName", "errName", "Please enter your name.");
        valid = false;
      } else setError("fName", "errName", "");

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailPattern.test(email)) {
        setError("fEmail", "errEmail", "Please enter a valid email address.");
        valid = false;
      } else setError("fEmail", "errEmail", "");

      if (!message || message.length < 10) {
        setError("fMessage", "errMessage", "Message should be at least 10 characters.");
        valid = false;
      } else setError("fMessage", "errMessage", "");

      return valid;
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validate()) {
        status.textContent = "Please fix the highlighted fields.";
        return;
      }

      if (!CONFIG.formEndpoint) {
        // No backend configured yet — fall back to opening a mail client with the message pre-filled.
        const name = document.getElementById("fName").value.trim();
        const email = document.getElementById("fEmail").value.trim();
        const message = document.getElementById("fMessage").value.trim();
        const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
        const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
        window.location.href = `mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
        status.textContent = "Opening your email client…";
        return;
      }

      try {
        status.textContent = "Sending…";
        const res = await fetch(CONFIG.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: document.getElementById("fName").value.trim(),
            email: document.getElementById("fEmail").value.trim(),
            message: document.getElementById("fMessage").value.trim(),
          }),
        });
        if (!res.ok) throw new Error("Request failed");
        status.textContent = "Message sent — thank you.";
        form.reset();
      } catch (err) {
        status.textContent = "Something went wrong. Please email directly instead.";
      }
    });
  }
  initForm();

  /* ---------------------------------------------------------------------
     Refresh ScrollTrigger after everything is set up
  --------------------------------------------------------------------- */
  window.addEventListener("load", () => {
    if (hasGSAP) ScrollTrigger.refresh();
  });
})();
