/* ==========================================================
   WEB NEURON — Comportamiento y animaciones
   GSAP · ScrollTrigger · ScrollSmoother · SplitText · ScrollTo
   ========================================================== */
(() => {
  "use strict";

  /* ---------- Configuración de contacto ----------
     Rellena UNO para que el formulario envíe mensajes reales:
       - CONTACT_WHATSAPP: número con lada de país, solo dígitos (ej. "5215512345678")
       - CONTACT_EMAIL:    correo que recibirá los mensajes
     Si ambos están vacíos, el formulario valida pero avisa que falta configurar. */
  const CONTACT_WHATSAPP = "";
  const CONTACT_EMAIL = "";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  // Celulares y tablets: scroll nativo (más fluido en táctil) y sin efectos de ratón
  const touchLike = matchMedia("(max-width: 900px), (hover: none) and (pointer: coarse)").matches;
  // Si el usuario ahorra datos, el video de fondo no arranca solo
  const saveData = !!(navigator.connection && navigator.connection.saveData);

  $("#year").textContent = new Date().getFullYear();

  /* ==========================================================
     Video: reproducir solo cuando es visible + botón de pausa
     (no depende de GSAP)
     ========================================================== */
  function initVideos() {
    const vids = $$("video[data-autoplay]");
    const hero = $("#heroVideo");
    const toggle = $("#heroToggle");
    const noAuto = reduceMotion || saveData;
    let userPaused = noAuto;

    const setToggle = () => {
      toggle.setAttribute("aria-pressed", String(userPaused));
      toggle.setAttribute("aria-label", userPaused ? "Reproducir video de fondo" : "Pausar video de fondo");
    };

    if (noAuto) {
      vids.forEach((v) => { v.removeAttribute("autoplay"); v.pause(); });
    } else if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(({ target: v, isIntersecting }) => {
          if (isIntersecting) { if (!(v === hero && userPaused)) v.play().catch(() => {}); }
          else v.pause();
        });
      }, { threshold: 0.1 });
      vids.forEach((v) => io.observe(v));
    }

    toggle.addEventListener("click", () => {
      userPaused = !userPaused;
      userPaused ? hero.pause() : hero.play().catch(() => {});
      setToggle();
    });
    setToggle();
  }
  initVideos();

  // Si GSAP no cargó, el sitio queda visible y estático.
  if (typeof gsap === "undefined") {
    root.classList.remove("js");
    return;
  }

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin, SplitText);
  gsap.config({ nullTargetWarn: false });
  // Evita recalcular todo cuando la barra del navegador móvil sube o baja
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------- Scroll suave ---------- */
  let smoother = null;
  if (!reduceMotion && !touchLike) {
    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1,
      ignoreMobileResize: true,
    });
  }

  /* ==========================================================
     Navegación
     ========================================================== */
  let menuOpen = false;

  function initNav() {
    const nav = $("#nav");
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: (self) => {
        nav.classList.toggle("is-scrolled", self.scroll() > 8);
        gsap.set(".progress span", { scaleX: self.progress });
      },
    });

    // Menú móvil
    const burger = $("#burger"), menu = $("#menu");
    const links = $$("a", menu);
    const menuTl = gsap.timeline({ paused: true })
      .set(menu, { visibility: "visible" })
      .to(menu, { opacity: 1, duration: 0.35, ease: "power2.out" })
      .fromTo(links, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", stagger: 0.06 }, "-=0.1");
    menuTl.eventCallback("onReverseComplete", () => gsap.set(menu, { visibility: "hidden" }));

    const toggleMenu = (open) => {
      menuOpen = open;
      burger.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
      nav.classList.toggle("is-menu-open", open);
      root.classList.toggle("menu-lock", open);
      if (smoother) smoother.paused(open);
      open ? menuTl.timeScale(1).play() : menuTl.timeScale(2).reverse();
    };
    burger.addEventListener("click", () => toggleMenu(!menuOpen));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menuOpen) toggleMenu(false); });
    window.addEventListener("resize", () => { if (menuOpen && window.innerWidth > 860) toggleMenu(false); });

    // Anclas con desplazamiento animado
    $$("a[data-scroll]").forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (!id || id.charAt(0) !== "#") return;
        e.preventDefault();
        const target = id === "#inicio" ? 0 : $(id);
        if (target === null) return;
        const go = () => {
          if (smoother) smoother.scrollTo(target, true, target === 0 ? "top top" : "top 64px");
          else gsap.to(window, { scrollTo: { y: target, offsetY: 64 }, duration: 1.2, ease: "power3.inOut" });
        };
        if (menuOpen) { toggleMenu(false); gsap.delayedCall(0.35, go); } else go();
      });
    });
  }

  // El menú cambia a tono oscuro/transparente sobre el hero y el contacto.
  // Se crea al final (después de los pins) para medir posiciones correctas.
  const navFlags = { hero: true, expand: false, contact: false };
  function applyNavTheme() {
    const nav = $("#nav");
    nav.classList.toggle("is-clear", navFlags.hero);
    nav.classList.toggle("is-dark", navFlags.hero || navFlags.expand || navFlags.contact);
  }
  function initNavTheme() {
    ScrollTrigger.create({ trigger: ".hero", start: "top top", end: "bottom 64px", onToggle: (s) => { navFlags.hero = s.isActive; applyNavTheme(); } });
    ScrollTrigger.create({ trigger: "#contacto", start: "top 32px", end: "max", onToggle: (s) => { navFlags.contact = s.isActive; applyNavTheme(); } });
  }

  /* ==========================================================
     Formulario
     ========================================================== */
  function initForm() {
    const form = $("#contactForm");
    const status = $("#formStatus");
    const say = (msg, isError = false) => {
      status.textContent = msg;
      status.classList.toggle("is-error", isError);
      if (!reduceMotion) gsap.fromTo(status, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" });
    };

    $$(".field input, .field textarea", form).forEach((i) =>
      i.addEventListener("input", () => i.closest(".field").classList.remove("is-invalid")));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get("nombre") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const msg = (data.get("mensaje") || "").toString().trim();

      let valid = true;
      [["nombre", name], ["email", /^\S+@\S+\.\S+$/.test(email) ? email : ""], ["mensaje", msg]].forEach(([k, v]) => {
        form.elements[k].closest(".field").classList.toggle("is-invalid", !v);
        if (!v) valid = false;
      });
      if (!valid) return say("Revisa los campos marcados para continuar.", true);

      const text = `Hola, soy ${name} (${email}).\n\n${msg}`;
      if (CONTACT_WHATSAPP) {
        window.open(`https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
      } else if (CONTACT_EMAIL) {
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Nuevo proyecto — Web Neuron")}&body=${encodeURIComponent(text)}`;
      } else {
        console.warn("Web Neuron: configura CONTACT_WHATSAPP o CONTACT_EMAIL en js/main.js");
        return say("Formulario listo: falta configurar el destino en js/main.js.", true);
      }
      form.reset();
      say("Gracias. Abrimos tu mensaje para que lo envíes; te responderemos pronto.");
    });
  }

  /* ==========================================================
     Utilidades de animación
     ========================================================== */
  function revealLines(el, vars = {}) {
    SplitText.create(el, {
      type: "lines", mask: "lines", autoSplit: true,
      onSplit(self) {
        gsap.set(el, { visibility: "visible" });
        return gsap.from(self.lines, {
          yPercent: 105, duration: 1.1, ease: "power4.out", stagger: 0.09,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          ...vars,
        });
      },
    });
  }

  function fadeIn(el) {
    gsap.fromTo(el, { y: 28, opacity: 0 }, {
      y: 0, opacity: 1, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 92%", once: true },
    });
  }

  function batchIn(selector, vars = {}) {
    gsap.set(selector, { y: 40, opacity: 0 });
    ScrollTrigger.batch(selector, {
      start: "top 92%", once: true,
      onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.1, ...vars }),
    });
  }

  /* ==========================================================
     Secciones
     ========================================================== */

  /* Hero: la imagen se abre, el texto sube y al hacer scroll el video se encoge */
  function initHero() {
    const stage = $("#heroStage");
    const video = $("#heroVideo");
    const title = $("#heroTitle");

    gsap.fromTo(stage, { clipPath: "inset(9% 5% round 36px)" },
      { clipPath: "inset(0% 0% round 0px)", duration: 1.7, ease: "power4.inOut", onComplete: () => gsap.set(stage, { clipPath: "none" }) });
    gsap.fromTo(video, { scale: 1.22 }, { scale: 1, duration: 2.4, ease: "power3.out" });

    SplitText.create(title, {
      type: "lines", mask: "lines", autoSplit: true,
      onSplit(self) {
        gsap.set(title, { visibility: "visible" });
        return gsap.from(self.lines, { yPercent: 105, duration: 1.3, ease: "power4.out", stagger: 0.1, delay: 0.95 });
      },
    });

    gsap.timeline({ defaults: { ease: "power3.out" } })
      .to(".hero .eyebrow", { opacity: 1, duration: 1 }, 0.9)
      .fromTo(".hero__sub", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1 }, 1.4)
      .fromTo(".hero__actions", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1 }, 1.55);

    // Scroll: la tarjeta de video se encoge y se redondea; el texto se desvanece
    gsap.to(stage, {
      scale: 0.9, borderRadius: 40, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
    gsap.to(".hero__content", {
      opacity: 0, y: -60, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "55% top", scrub: true },
    });
  }

  /* Cinta de texto gigante: velocidad y dirección según el scroll */
  function initTicker() {
    const track = $(".ticker__track");
    const group = $(".ticker__group");
    const copies = 3;
    for (let i = 0; i < copies; i++) track.appendChild(group.cloneNode(true));
    const tween = gsap.to(track, { xPercent: -100 / (copies + 1), ease: "none", duration: 40, repeat: -1 });

    ScrollTrigger.create({
      trigger: ".ticker", start: "top bottom", end: "bottom top",
      onUpdate: (self) => {
        const dir = self.direction;
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 400, 4);
        gsap.to(tween, {
          timeScale: dir * boost, duration: 0.25, overwrite: true,
          onComplete: () => gsap.to(tween, { timeScale: dir, duration: 1.2 }),
        });
      },
    });
  }

  /* Declaración: texto que se enciende palabra por palabra */
  function initStatement() {
    const st = $("#statement");
    const words = SplitText.create(st, { type: "words" });
    gsap.fromTo(words.words, { opacity: 0.18 }, {
      opacity: 1, ease: "none", stagger: 0.08,
      scrollTrigger: { trigger: st, start: "top 80%", end: "bottom 60%", scrub: 0.5 },
    });
  }

  /* Imagen gigante: de tarjeta pequeña a pantalla completa, con la sección fija */
  function initExpand() {
    gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ".expand__pin", start: "top top", end: "+=130%", pin: true, scrub: 0.7, anticipatePin: 1,
        // El menú se oscurece cuando la foto ya ocupa la pantalla
        onUpdate: (self) => { navFlags.expand = self.isActive && self.progress > 0.5; applyNavTheme(); },
        onLeave: () => { navFlags.expand = false; applyNavTheme(); },
        onLeaveBack: () => { navFlags.expand = false; applyNavTheme(); },
      },
    })
      .fromTo(".expand__img", { clipPath: "inset(20% 26% round 28px)" }, { clipPath: "inset(0% 0% round 0px)", duration: 1 }, 0)
      .fromTo(".expand__img img", { scale: 1.4 }, { scale: 1, duration: 1 }, 0)
      .fromTo(".expand__shade", { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.5)
      .fromTo(".expand__text", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.5 }, 0.55);
  }

  /* Servicios: imagen de vista previa que sigue al cursor */
  function initPreview() {
    if (!finePointer) return;
    const prev = $("#preview");
    const imgs = $$("img", prev);
    const W = () => prev.offsetWidth;
    gsap.set(prev, { yPercent: -50, scale: 0.85, opacity: 0 });
    const xTo = gsap.quickTo(prev, "x", { duration: 0.55, ease: "power3" });
    const yTo = gsap.quickTo(prev, "y", { duration: 0.55, ease: "power3" });
    const place = (e) => {
      const right = e.clientX + 44 + W() < window.innerWidth - 16;
      return [right ? e.clientX + 44 : e.clientX - 44 - W(), e.clientY];
    };

    $$("[data-row]").forEach((row) => {
      row.addEventListener("pointerenter", (e) => {
        imgs.forEach((i) => i.classList.toggle("is-on", i.dataset.id === row.dataset.img));
        const [x, y] = place(e);
        gsap.set(prev, { x, y });
        gsap.to(prev, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out", overwrite: "auto" });
      });
      row.addEventListener("pointermove", (e) => { const [x, y] = place(e); xTo(x); yTo(y); });
      row.addEventListener("pointerleave", () =>
        gsap.to(prev, { opacity: 0, scale: 0.85, duration: 0.4, ease: "power3.in", overwrite: "auto" }));
    });
  }

  /* Proceso: galería horizontal fija con parallax interno */
  function initProcess() {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 901px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)", () => {
      const pin = $(".process__pin");
      const track = $(".process__track");
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);

      const scrollTween = gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: pin, start: "top top", end: () => "+=" + dist(), pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true },
      });
      gsap.to(".process__bar span", {
        scaleX: 1, ease: "none",
        scrollTrigger: { trigger: pin, start: "top top", end: () => "+=" + dist(), scrub: true, invalidateOnRefresh: true },
      });

      $$("[data-panel]").forEach((panel) => {
        gsap.fromTo($(".panel__media", panel), { xPercent: -6 }, {
          xPercent: 6, ease: "none",
          scrollTrigger: { trigger: panel, containerAnimation: scrollTween, start: "left right", end: "right left", scrub: true },
        });
        gsap.from($$(".panel__body > *", panel), {
          y: 34, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.08,
          scrollTrigger: { trigger: panel, containerAnimation: scrollTween, start: "left 78%", toggleActions: "play none none reverse" },
        });
      });
    });

    mm.add("(max-width: 900px), (max-height: 619px)", () => { batchIn("[data-panel]", { stagger: 0.12 }); });
  }

  /* "Incluido": la foto se abre al entrar y se mueve en parallax */
  function initIncluded() {
    const fig = $("#incFig");
    gsap.fromTo(fig, { clipPath: "inset(14% 10% round 28px)" }, {
      clipPath: "inset(0% 0% round 28px)", ease: "none",
      scrollTrigger: { trigger: fig, start: "top 92%", end: "top 40%", scrub: 0.6 },
    });
    gsap.fromTo($("img", fig), { yPercent: -6 }, {
      yPercent: 6, ease: "none",
      scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: true },
    });
  }

  /* Contacto: fondo con parallax */
  function initContactBg() {
    gsap.fromTo(".contact__bg img", { yPercent: -6 }, {
      yPercent: 6, ease: "none",
      scrollTrigger: { trigger: ".contact", start: "top bottom", end: "bottom top", scrub: true },
    });
  }

  /* Botones magnéticos (solo con ratón) */
  function initMagnetic() {
    if (!finePointer) return;
    $$("[data-magnetic]").forEach((btn) => {
      const xTo = gsap.quickTo(btn, "x", { duration: 0.7, ease: "elastic.out(1, 0.5)" });
      const yTo = gsap.quickTo(btn, "y", { duration: 0.7, ease: "elastic.out(1, 0.5)" });
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.22);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
      });
      btn.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });
  }

  /* ==========================================================
     Construcción en orden de aparición en la página
     ========================================================== */
  function buildAnimations() {
    initHero();
    initTicker();
    initStatement();
    initExpand();

    fadeIn($("#servicios .eyebrow"));
    revealLines($("#servicios [data-lines]"));
    batchIn("[data-row]", { stagger: 0.08 });
    initPreview();

    fadeIn($("#proceso .eyebrow"));
    revealLines($("#proceso [data-lines]"));
    initProcess();

    const inc = $(".included");
    fadeIn($(".eyebrow", inc));
    revealLines($("[data-lines]", inc));
    $$(".checks li").forEach(fadeIn);
    initIncluded();

    const pk = $("#paquetes");
    fadeIn($(".eyebrow", pk));
    revealLines($("[data-lines]", pk));
    fadeIn($(".lead", pk));
    batchIn("[data-plan]", { stagger: 0.14 });

    const ct = $("#contacto");
    fadeIn($(".eyebrow", ct));
    revealLines($("[data-lines]", ct));
    fadeIn($(".lead", ct));
    fadeIn($(".form", ct));
    initContactBg();

    initMagnetic();
  }

  /* ---------- Arranque ---------- */
  initNav();
  initForm();

  // Espera a las fuentes (máx. 2,5 s) para dividir el texto con las medidas correctas
  const fontsReady = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]);
  fontsReady.then(() => {
    if (!reduceMotion) buildAnimations();
    initNavTheme();
    ScrollTrigger.refresh();
  });

  // Reajusta posiciones cuando las imágenes terminan de cargar
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
