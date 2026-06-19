(function () {
    'use strict';

    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function bindHeader() {
        var header = document.querySelector('[data-header]');
        var button = document.querySelector('[data-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (header) {
            var onScroll = function () {
                if (window.scrollY > 16) {
                    header.classList.add('is-scrolled');
                } else {
                    header.classList.remove('is-scrolled');
                }
            };
            onScroll();
            window.addEventListener('scroll', onScroll, { passive: true });
        }
        if (button && menu) {
            button.addEventListener('click', function () {
                menu.classList.toggle('is-open');
            });
        }
    }

    function bindHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var previous = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener('click', function () {
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
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function bindFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var targetSelector = panel.getAttribute('data-target') || '#movie-list';
            var target = document.querySelector(targetSelector);
            if (!target) {
                return;
            }
            var input = panel.querySelector('[data-search-input]');
            var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-select]'));
            var cards = Array.prototype.slice.call(target.querySelectorAll('.js-card'));
            var empty = document.querySelector('[data-empty-state]');
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q');
            if (initialQuery && input) {
                input.value = initialQuery;
            }

            function apply() {
                var query = normalize(input ? input.value : '');
                var filters = {};
                selects.forEach(function (select) {
                    filters[select.getAttribute('data-filter-select')] = normalize(select.value);
                });
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags')
                    ].join(' '));
                    var match = !query || haystack.indexOf(query) !== -1;
                    Object.keys(filters).forEach(function (key) {
                        var value = filters[key];
                        if (value && normalize(card.getAttribute('data-' + key)) !== value) {
                            match = false;
                        }
                    });
                    card.hidden = !match;
                    if (match) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', apply);
            });
            apply();
        });
    }

    function bindImages() {
        Array.prototype.slice.call(document.querySelectorAll('img')).forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('image-fallback');
            });
        });
    }

    function bindPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            var message = player.querySelector('[data-player-message]');
            var stream = player.getAttribute('data-stream');
            var hls = null;
            if (!video || !stream) {
                return;
            }

            function setMessage(text) {
                if (!message) {
                    return;
                }
                message.textContent = text || '';
                message.classList.toggle('is-visible', Boolean(text));
            }

            function prepare() {
                if (video.dataset.ready === '1') {
                    return;
                }
                video.dataset.ready = '1';
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                                setMessage('播放线路暂时繁忙，正在重新连接');
                                hls.startLoad();
                            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                                setMessage('播放画面恢复中');
                                hls.recoverMediaError();
                            } else {
                                setMessage('播放暂时不可用，请稍后重试');
                            }
                        }
                    });
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setMessage('');
                    });
                    return;
                }
                setMessage('当前播放环境暂不可用');
            }

            function playVideo() {
                prepare();
                var request = video.play();
                if (request && typeof request.catch === 'function') {
                    request.catch(function () {
                        setMessage('点击播放器后可继续播放');
                    });
                }
            }

            prepare();
            if (button) {
                button.addEventListener('click', playVideo);
            }
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
                setMessage('');
            });
            video.addEventListener('pause', function () {
                player.classList.remove('is-playing');
            });
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                } else {
                    video.pause();
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        bindHeader();
        bindHero();
        bindFilters();
        bindImages();
        bindPlayers();
    });
})();
