(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var navLinks = document.querySelector('.nav-links');
  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });
    showSlide(0);
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-filter-input]');
  var categorySelect = document.querySelector('[data-filter-category]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card[data-search]'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function runFilter() {
    var keyword = normalize(searchInput ? searchInput.value : '');
    var category = normalize(categorySelect ? categorySelect.value : '');
    var year = normalize(yearSelect ? yearSelect.value : '');
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      var cardCategory = normalize(card.getAttribute('data-category'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchedCategory = !category || cardCategory === category;
      var matchedYear = !year || cardYear === year;
      card.classList.toggle('is-hidden-by-filter', !(matchedKeyword && matchedCategory && matchedYear));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', runFilter);
  }
  if (categorySelect) {
    categorySelect.addEventListener('change', runFilter);
  }
  if (yearSelect) {
    yearSelect.addEventListener('change', runFilter);
  }

  Array.prototype.slice.call(document.querySelectorAll('.player')).forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.play-overlay');
    var loading = player.querySelector('.player-loading');
    var error = player.querySelector('.player-error');
    var source = player.getAttribute('data-stream');
    var started = false;

    function hideLoading() {
      if (loading) {
        loading.classList.add('is-hidden');
      }
    }

    function showError() {
      hideLoading();
      if (error) {
        error.classList.remove('is-hidden');
      }
    }

    if (!video || !source) {
      showError();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, hideLoading);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showError();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', hideLoading);
      video.addEventListener('error', showError);
    } else {
      showError();
    }

    function playVideo() {
      started = true;
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }
    video.addEventListener('click', function () {
      if (!started || video.paused) {
        playVideo();
      } else {
        video.pause();
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      }
    });
    video.addEventListener('playing', function () {
      started = true;
      hideLoading();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  });
}());
