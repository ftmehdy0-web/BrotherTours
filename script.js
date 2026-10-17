"use strict";

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
if (!motionPreference.matches && "IntersectionObserver" in window) {
  const revealItems = Array.from(document.querySelectorAll(".destination-card, .travel-option, .step"));
  if (revealItems.length) {
    revealItems.forEach(function (item, index) {
      item.classList.add("reveal-item");
      item.style.setProperty("--reveal-delay", (index % 4) * 70 + "ms");
    });
    document.documentElement.classList.add("motion-ready");

    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  }
}

const menuToggle = document.querySelector(".menu-toggle");
const primaryNavigation = document.querySelector("#primary-navigation");
const mobileNavigation = window.matchMedia("(max-width: 820px)");

function setMenuOpen(open) {
  if (!menuToggle || !primaryNavigation) return;
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  primaryNavigation.hidden = !open;
  primaryNavigation.classList.toggle("is-open", open);
}

if (menuToggle && primaryNavigation) {
  if (mobileNavigation.matches) setMenuOpen(false);

  menuToggle.addEventListener("click", function () {
    const shouldOpen = menuToggle.getAttribute("aria-expanded") !== "true";
    setMenuOpen(shouldOpen);
  });

  primaryNavigation.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      if (mobileNavigation.matches) setMenuOpen(false);
    });
  });

  document.addEventListener("click", function (event) {
    if (!mobileNavigation.matches || menuToggle.getAttribute("aria-expanded") !== "true") return;
    if (!primaryNavigation.contains(event.target) && !menuToggle.contains(event.target)) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  mobileNavigation.addEventListener("change", function (event) {
    if (!event.matches) {
      primaryNavigation.hidden = false;
      primaryNavigation.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    } else {
      setMenuOpen(false);
    }
  });
}

document.querySelectorAll(".plan-destination").forEach(function (button) {
  button.addEventListener("click", function () {
    const destination = document.querySelector("#destination");
    const formSection = document.querySelector("#plan");
    if (!destination || !formSection) return;

    destination.value = button.dataset.destination || "";
    formSection.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "center"
    });

    window.setTimeout(function () {
      destination.focus({ preventScroll: true });
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 350);
  });
});

const tripForm = document.querySelector("#trip-form");
if (tripForm) {
  tripForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const destination = document.querySelector("#destination").value;
    const travelMonth = document.querySelector("#travel-month").value;
    const groupSize = document.querySelector("#group-size").value;
    const monthLabel = travelMonth
      ? new Date(travelMonth + "-01T12:00:00").toLocaleDateString("en", { month: "long", year: "numeric" })
      : "Flexible";
    const subject = "Himalayan trip enquiry — " + destination;
    const body = [
      "Hello Brother Tours,",
      "",
      "I’d like to request a custom quote for a Himalayan trip.",
      "",
      "Destination: " + destination,
      "Travel month: " + monthLabel,
      "Group size: " + groupSize,
      "",
      "Please share suggested next steps.",
      "",
      "Thank you"
    ].join("\n");
    const mailto = "mailto:brothertours6@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    window.location.href = mailto;
  });
}

document.querySelectorAll("img").forEach(function (image) {
  function showImageFallback() {
    const frame = image.closest(".image-frame");
    if (frame) {
      frame.classList.add("image-fallback");
      frame.setAttribute("role", "img");
      frame.setAttribute("aria-label", image.alt);
    }
    if (image.classList.contains("hero__image")) {
      document.querySelector(".hero").classList.add("hero--image-missing");
    }
    image.hidden = true;
  }

  image.addEventListener("error", showImageFallback, { once: true });
  if (image.complete && image.naturalWidth === 0) showImageFallback();
});

const year = document.querySelector("#current-year");
if (year) year.textContent = String(new Date().getFullYear());

const snowCanvas = document.querySelector("#snowfall");
const hero = document.querySelector(".hero");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
if (snowCanvas && hero && !reducedMotion.matches) {
  const context = snowCanvas.getContext("2d");
  let flakes = [];
  let canvasWidth = 0;
  let canvasHeight = 0;
  let animationFrame = null;
  let heroIsVisible = true;

  function resizeSnow() {
    const bounds = hero.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = bounds.width;
    canvasHeight = bounds.height;
    snowCanvas.width = Math.round(canvasWidth * ratio);
    snowCanvas.height = Math.round(canvasHeight * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = Math.max(12, Math.min(42, Math.round(canvasWidth / 32)));
    flakes = Array.from({ length: count }, function () {
      return {
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        radius: 0.55 + Math.random() * 1.35,
        speed: 0.18 + Math.random() * 0.48,
        drift: -0.12 + Math.random() * 0.24,
        alpha: 0.28 + Math.random() * 0.46,
        phase: Math.random() * Math.PI * 2
      };
    });
  }

  function drawSnow() {
    if (document.hidden || reducedMotion.matches) {
      animationFrame = null;
      return;
    }

    context.clearRect(0, 0, canvasWidth, canvasHeight);
    flakes.forEach(function (flake) {
      flake.y += flake.speed;
      flake.x += flake.drift + Math.sin(flake.phase + flake.y * 0.008) * 0.16;
      if (flake.y > canvasHeight + 4) {
        flake.y = -4;
        flake.x = Math.random() * canvasWidth;
      }
      if (flake.x < -4) flake.x = canvasWidth + 4;
      if (flake.x > canvasWidth + 4) flake.x = -4;

      context.beginPath();
      context.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      context.fillStyle = "rgba(255, 255, 255, " + flake.alpha + ")";
      context.fill();
    });

    animationFrame = window.requestAnimationFrame(drawSnow);
  }

  function startSnow() {
    if (animationFrame !== null || document.hidden || reducedMotion.matches || !heroIsVisible) return;
    animationFrame = window.requestAnimationFrame(drawSnow);
  }

  function stopSnow() {
    if (animationFrame !== null) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  if ("IntersectionObserver" in window) {
    heroIsVisible = false;
    const snowVisibilityObserver = new IntersectionObserver(function (entries) {
      heroIsVisible = entries.some(function (entry) { return entry.isIntersecting; });
      if (heroIsVisible) startSnow();
      else stopSnow();
    }, { threshold: 0.01, rootMargin: "80px 0px" });
    snowVisibilityObserver.observe(hero);
  }

  resizeSnow();
  startSnow();
  let resizeFrame = null;
  window.addEventListener("resize", function () {
    if (resizeFrame !== null) window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(function () {
      resizeFrame = null;
      resizeSnow();
    });
  }, { passive: true });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stopSnow();
    else startSnow();
  });
  reducedMotion.addEventListener("change", function (event) {
    if (event.matches) {
      stopSnow();
      context.clearRect(0, 0, canvasWidth, canvasHeight);
    } else {
      resizeSnow();
      startSnow();
    }
  });
}
