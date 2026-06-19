const menuButton = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");

if (menuButton && mobileNav) {
  menuButton.addEventListener("click", () => {
    mobileNav.classList.toggle("open");
  });
}

function setupHero() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll(".hero-slide"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  const prev = hero.querySelector("[data-hero-prev]");
  const next = hero.querySelector("[data-hero-next]");
  let current = 0;
  let timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  function restart() {
    window.clearInterval(timer);
    timer = window.setInterval(() => show(current + 1), 5200);
  }

  if (prev) {
    prev.addEventListener("click", () => {
      show(current - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener("click", () => {
      show(current + 1);
      restart();
    });
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      show(Number(dot.dataset.heroDot || 0));
      restart();
    });
  });

  restart();
}

async function attachPlayer(video) {
  const source = video.dataset.m3u8;
  if (!source || video.dataset.ready === "1") {
    return;
  }

  video.dataset.ready = "1";

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
    return;
  }

  try {
    const module = await import("./hls-vendor.js");
    const Hls = module.H || module.default || module.Hls;

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsInstance = hls;
    } else {
      video.src = source;
    }
  } catch (error) {
    video.src = source;
  }
}

function setupPlayers() {
  const players = Array.from(document.querySelectorAll(".js-player"));

  players.forEach((video) => {
    const shell = video.closest(".player-shell");
    const trigger = shell ? shell.querySelector("[data-play-trigger]") : null;

    attachPlayer(video);

    if (trigger) {
      trigger.addEventListener("click", async () => {
        await attachPlayer(video);
        trigger.classList.add("hidden");
        try {
          await video.play();
        } catch (error) {
          video.controls = true;
        }
      });

      video.addEventListener("play", () => {
        trigger.classList.add("hidden");
      });
    }
  });
}

function setupSearchPage() {
  const input = document.querySelector("#page-search-input");
  const results = Array.from(document.querySelectorAll("[data-search-text]"));
  const empty = document.querySelector("[data-search-empty]");

  if (!input || !results.length) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const initial = params.get("q") || "";
  input.value = initial;

  function filter() {
    const value = input.value.trim().toLowerCase();
    let visible = 0;

    results.forEach((item) => {
      const text = (item.dataset.searchText || "").toLowerCase();
      const matched = !value || text.includes(value);
      item.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  input.addEventListener("input", filter);
  filter();
}

setupHero();
setupPlayers();
setupSearchPage();
