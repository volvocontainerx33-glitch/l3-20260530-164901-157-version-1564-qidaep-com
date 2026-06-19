(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')));
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initHomeSearch() {
        var input = document.querySelector('[data-home-search]');
        if (!input) {
            return;
        }
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' && input.value.trim()) {
                window.location.href = 'search.html?q=' + encodeURIComponent(input.value.trim());
            }
        });
    }

    function fillSelect(select, values) {
        if (!select || select.options.length > 1) {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function initFilters() {
        var scope = document.querySelector('[data-filter-scope]');
        if (!scope) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] .movie-card'));
        var search = scope.querySelector('[data-card-search]');
        var yearFilter = scope.querySelector('[data-year-filter]');
        var regionFilter = scope.querySelector('[data-region-filter]');
        var count = scope.querySelector('[data-result-count]');
        var years = Array.from(new Set(cards.map(function (card) {
            return card.getAttribute('data-year');
        }))).filter(Boolean).sort(function (a, b) {
            return Number(b) - Number(a);
        });
        var regions = Array.from(new Set(cards.map(function (card) {
            return card.getAttribute('data-region');
        }))).filter(Boolean).sort();

        fillSelect(yearFilter, years);
        fillSelect(regionFilter, regions);

        var params = new URLSearchParams(window.location.search);
        if (params.get('q') && search) {
            search.value = params.get('q');
        }

        function apply() {
            var keyword = search ? search.value.trim().toLowerCase() : '';
            var year = yearFilter ? yearFilter.value : '';
            var region = regionFilter ? regionFilter.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-keywords'),
                    card.getAttribute('data-year')
                ].join(' ').toLowerCase();
                var ok = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (year && card.getAttribute('data-year') !== year) {
                    ok = false;
                }
                if (region && card.getAttribute('data-region') !== region) {
                    ok = false;
                }
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = visible + ' 部';
            }
        }

        [search, yearFilter, regionFilter].forEach(function (element) {
            if (element) {
                element.addEventListener('input', apply);
                element.addEventListener('change', apply);
            }
        });
        apply();
    }

    function initPlayer() {
        var video = document.getElementById('videoPlayer');
        var button = document.querySelector('[data-action="play-video"]');
        var tip = document.querySelector('[data-player-tip]');
        if (!video || !button) {
            return;
        }
        var started = false;
        function setTip(text) {
            if (tip) {
                tip.textContent = text;
            }
        }
        function startVideo() {
            var source = video.getAttribute('data-src');
            if (!source || started) {
                return;
            }
            started = true;
            button.classList.add('hidden');
            setTip('正在初始化播放源...');
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setTip('播放源已加载。');
                    video.play().catch(function () {
                        setTip('浏览器阻止了自动播放，请再次点击视频播放。');
                    });
                });
                hls.on(window.Hls.Events.ERROR, function () {
                    setTip('播放源加载失败，可稍后重试或检查网络。');
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.play().catch(function () {
                    setTip('浏览器阻止了自动播放，请再次点击视频播放。');
                });
            } else {
                video.src = source;
                setTip('当前浏览器不完全支持 HLS，可尝试使用 Safari 或新版 Chrome。');
            }
        }
        button.addEventListener('click', startVideo);
        video.addEventListener('click', function () {
            if (!started) {
                startVideo();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initHomeSearch();
        initFilters();
        initPlayer();
    });
})();
