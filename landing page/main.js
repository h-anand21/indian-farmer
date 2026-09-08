/* ════════════════════════════════════════════════════════════════
   KISANQUEUE — LANDING PAGE SCRIPT
   Interactive Counter Animations, Mobile Sheet, & Smooth Scrolling
   ════════════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  // ── Mobile Menu Toggling ──
  const burgerBtn = document.getElementById("burgerBtn");
  const menuOverlay = document.getElementById("menuOverlay");

  if (burgerBtn && menuOverlay) {
    const toggleMenu = () => {
      const isOpen = menuOverlay.classList.toggle("open");
      burgerBtn.classList.toggle("open", isOpen);
      burgerBtn.setAttribute("aria-expanded", isOpen);
      menuOverlay.hidden = !isOpen;
      document.body.style.overflow = isOpen ? "hidden" : "";
    };

    burgerBtn.addEventListener("click", toggleMenu);

    menuOverlay.addEventListener("click", (e) => {
      if (e.target === menuOverlay || e.target.classList.contains("mobile-link")) {
        toggleMenu();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menuOverlay.classList.contains("open")) {
        toggleMenu();
      }
    });
  }

  // ── Stats Counting Animation with easeOutCubic ──
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const animateCount = (el, target, decimals, duration) => {
    let startTimestamp = null;
    const startVal = 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentVal = startVal + (target - startVal) * easeOutCubic(progress);

      el.textContent = currentVal.toFixed(decimals);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target.toFixed(decimals);
      }
    };

    window.requestAnimationFrame(step);
  };

  const statElements = document.querySelectorAll(".stat-item");
  let hasAnimated = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;

          statElements.forEach((item, index) => {
            const countEl = item.querySelector(".count");
            const target = parseFloat(item.getAttribute("data-target") || "0");
            const decimals = parseInt(item.getAttribute("data-decimals") || "0", 10);
            const duration = 1500 + index * 100;
            const startDelay = 300 + index * 90;

            setTimeout(() => {
              animateCount(countEl, target, decimals, duration);
            }, startDelay);
          });
        }
      });
    },
    { threshold: 0.25 }
  );

  const statsStrip = document.querySelector(".stats-strip");
  if (statsStrip) {
    observer.observe(statsStrip);
  }

  // ── Video Action ──
  const watchVideoBtn = document.getElementById("watchVideoBtn");
  if (watchVideoBtn) {
    watchVideoBtn.addEventListener("click", () => {
      window.open("https://www.youtube.com/results?search_query=kisan+mandi+slot+booking", "_blank");
    });
  }
});
