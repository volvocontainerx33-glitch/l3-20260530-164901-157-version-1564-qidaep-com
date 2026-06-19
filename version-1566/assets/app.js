(function () {
    var navButton = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navButton && mobileNav) {
        navButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        show(0);
        start();
    }

    function textOf(card) {
        return [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-year') || '',
            card.textContent || ''
        ].join(' ').toLowerCase();
    }

    function setupFilters() {
        var input = document.querySelector('[data-filter-input]');
        var category = document.querySelector('[data-filter-category]');
        var type = document.querySelector('[data-filter-type]');
        var region = document.querySelector('[data-filter-region]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

        if (!cards.length || !input) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query) {
            input.value = query;
        }

        function apply() {
            var keyword = input.value.trim().toLowerCase();
            var categoryValue = category ? category.value : '';
            var typeValue = type ? type.value : '';
            var regionValue = region ? region.value : '';

            cards.forEach(function (card) {
                var matchKeyword = !keyword || textOf(card).indexOf(keyword) !== -1;
                var matchCategory = !categoryValue || card.getAttribute('data-category') === categoryValue;
                var matchType = !typeValue || (card.getAttribute('data-type') || '').indexOf(typeValue) !== -1;
                var matchRegion = !regionValue || (card.getAttribute('data-region') || '').indexOf(regionValue) !== -1;
                card.classList.toggle('is-hidden', !(matchKeyword && matchCategory && matchType && matchRegion));
            });
        }

        [input, category, type, region].forEach(function (element) {
            if (element) {
                element.addEventListener('input', apply);
                element.addEventListener('change', apply);
            }
        });

        apply();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

        players.forEach(function (player) {
            var video = player.querySelector('[data-video]');
            var button = player.querySelector('[data-play]');
            var src = player.getAttribute('data-video-src');
            var hls = null;
            var ready = false;

            function hideButton() {
                if (button) {
                    button.classList.add('is-hidden');
                }
            }

            function load() {
                if (!video || !src || ready) {
                    return;
                }

                ready = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                    video.addEventListener('loadedmetadata', function () {
                        video.play().catch(function () {});
                    }, { once: true });
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    return;
                }

                video.src = src;
                video.play().catch(function () {});
            }

            function play() {
                hideButton();
                load();
                if (video) {
                    video.play().catch(function () {});
                }
            }

            if (button) {
                button.addEventListener('click', play);
            }

            if (video) {
                video.addEventListener('click', play);
                video.addEventListener('play', hideButton);
            }

            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
