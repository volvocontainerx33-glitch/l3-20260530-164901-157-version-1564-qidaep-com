(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function initMobileNav() {
    const toggle = $('[data-mobile-toggle]');
    const nav = $('[data-mobile-nav]');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      nav.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    const slider = $('[data-hero-slider]');
    if (!slider) return;

    const slides = $$('[data-hero-slide]', slider);
    const thumbs = $$('[data-hero-target]', slider);
    const prev = $('[data-hero-prev]', slider);
    const next = $('[data-hero-next]', slider);
    if (!slides.length) return;

    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      thumbs.forEach((thumb, i) => thumb.classList.toggle('is-active', i === index));
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    function start() {
      stop();
      timer = window.setInterval(() => show(index + 1), 5600);
    }

    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        show(Number(thumb.dataset.heroTarget || 0));
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', () => {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        show(index + 1);
        start();
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function textIncludes(value, query) {
    return String(value || '').toLowerCase().includes(query);
  }

  function initFilters() {
    const panels = $$('[data-filter-panel]');
    panels.forEach((panel) => {
      const root = panel.parentElement || document;
      const cards = $$('[data-movie-card]', root);
      if (!cards.length) return;

      const search = $('[data-filter-search]', panel);
      const region = $('[data-filter-region]', panel);
      const type = $('[data-filter-type]', panel);
      const year = $('[data-filter-year]', panel);
      const genre = $('[data-filter-genre]', panel);
      const reset = $('[data-filter-reset]', panel);
      const count = $('[data-filter-count]', root);

      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q && search) search.value = q;

      function apply() {
        const query = (search && search.value ? search.value : '').trim().toLowerCase();
        const regionValue = region && region.value ? region.value : '';
        const typeValue = type && type.value ? type.value : '';
        const yearValue = year && year.value ? year.value : '';
        const genreValue = genre && genre.value ? genre.value : '';
        let visible = 0;

        cards.forEach((card) => {
          const okQuery = !query || textIncludes(card.dataset.title, query);
          const okRegion = !regionValue || card.dataset.region === regionValue;
          const okType = !typeValue || card.dataset.type === typeValue;
          const okYear = !yearValue || card.dataset.year === yearValue;
          const okGenre = !genreValue || textIncludes(card.dataset.genre, genreValue.toLowerCase());
          const show = okQuery && okRegion && okType && okYear && okGenre;
          card.classList.toggle('is-hidden', !show);
          if (show) visible += 1;
        });

        if (count) count.textContent = String(visible);
      }

      [search, region, type, year, genre].filter(Boolean).forEach((control) => {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      });

      if (reset) {
        reset.addEventListener('click', () => {
          [search, region, type, year, genre].filter(Boolean).forEach((control) => {
            control.value = '';
          });
          apply();
        });
      }

      apply();
    });
  }

  function initPlayers() {
    $$('[data-player]').forEach((frame) => {
      const video = $('video', frame);
      const button = $('[data-play-button]', frame);
      const message = $('[data-player-message]', frame);
      const source = frame.dataset.src;
      let loaded = false;
      let hls = null;

      if (!video || !button || !source) return;

      function setMessage(text) {
        if (message) message.textContent = text || '';
      }

      let loadPromise = null;

      function loadSource() {
        if (loaded) return Promise.resolve();
        if (loadPromise) return loadPromise;
        setMessage('');

        if (window.Hls && window.Hls.isSupported()) {
          loadPromise = new Promise((resolve, reject) => {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              loaded = true;
              resolve();
            });
            hls.on(window.Hls.Events.ERROR, function (_event, data) {
              if (data && data.fatal) {
                loaded = false;
                loadPromise = null;
                setMessage('视频加载失败，请检查网络后重试。');
                reject(new Error('HLS load error'));
              }
            });
          });
          return loadPromise;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          loadPromise = new Promise((resolve, reject) => {
            video.src = source;
            video.addEventListener('loadedmetadata', function onLoaded() {
              video.removeEventListener('loadedmetadata', onLoaded);
              loaded = true;
              resolve();
            });
            video.addEventListener('error', function onError() {
              video.removeEventListener('error', onError);
              loaded = false;
              loadPromise = null;
              setMessage('视频加载失败，请检查网络后重试。');
              reject(new Error('Native HLS load error'));
            });
          });
          return loadPromise;
        }

        setMessage('当前浏览器不支持 HLS 播放，请更换浏览器或安装支持组件。');
        return Promise.reject(new Error('HLS is not supported'));
      }

      function play() {
        video.controls = true;
        loadSource()
          .then(() => video.play())
          .then(() => {
            frame.classList.add('is-playing');
          })
          .catch(() => {
            frame.classList.remove('is-playing');
          });
      }

      button.addEventListener('click', play);
      video.addEventListener('click', () => {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener('pause', () => frame.classList.remove('is-playing'));
      video.addEventListener('play', () => frame.classList.add('is-playing'));
      window.addEventListener('beforeunload', () => {
        if (hls) hls.destroy();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initHeroSlider();
    initFilters();
    initPlayers();
  });
})();
