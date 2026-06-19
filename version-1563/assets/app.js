(function () {
  function queryAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = document.querySelector('.mobile-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!button || !nav) return;
    button.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var slides = queryAll('.hero-slide', hero);
    var dots = queryAll('.hero-dot', hero);
    var feature = hero.querySelector('.hero-feature-card');
    if (slides.length < 2) return;
    var index = 0;
    function activate(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
        slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
        dot.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
      if (feature) {
        feature.href = slides[index].getAttribute('data-url') || feature.href;
        var image = feature.querySelector('img');
        var title = feature.querySelector('h2');
        var desc = feature.querySelector('p');
        if (image) image.src = slides[index].getAttribute('data-cover') || image.src;
        if (title) title.textContent = slides[index].getAttribute('data-title') || title.textContent;
        if (desc) desc.textContent = slides[index].getAttribute('data-desc') || desc.textContent;
      }
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        activate(i);
      });
    });
    setInterval(function () {
      activate(index + 1);
    }, 5200);
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupFilters() {
    var bars = queryAll('.filter-bar');
    bars.forEach(function (bar) {
      var input = bar.querySelector('[data-filter="keyword"]');
      var year = bar.querySelector('[data-filter="year"]');
      var region = bar.querySelector('[data-filter="region"]');
      var scope = document.querySelector(bar.getAttribute('data-target') || 'body') || document;
      var cards = queryAll('.movie-card', scope);
      function apply() {
        var keyword = normalize(input && input.value);
        var yearValue = normalize(year && year.value);
        var regionValue = normalize(region && region.value);
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardRegion = normalize(card.getAttribute('data-region'));
          var matched = true;
          if (keyword && text.indexOf(keyword) === -1) matched = false;
          if (yearValue && cardYear !== yearValue) matched = false;
          if (regionValue && cardRegion.indexOf(regionValue) === -1) matched = false;
          card.classList.toggle('hide-card', !matched);
        });
      }
      [input, year, region].forEach(function (control) {
        if (control) control.addEventListener('input', apply);
        if (control) control.addEventListener('change', apply);
      });
    });
  }

  function setupPlayer() {
    queryAll('.player-shell').forEach(function (shell) {
      var video = shell.querySelector('video');
      var trigger = shell.querySelector('.player-trigger');
      if (!video || !trigger) return;
      function start() {
        var url = video.getAttribute('data-hls');
        if (!url) return;
        shell.classList.add('is-playing');
        if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
          if (!video.hlsInstance) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(url);
            hls.attachMedia(video);
            video.hlsInstance = hls;
          }
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          if (!video.src) video.src = url;
        } else {
          if (!video.src) video.src = url;
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }
      trigger.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (video.paused) start();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
