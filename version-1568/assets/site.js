(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function initNavigation() {
        var button = document.querySelector(".nav-toggle");
        var links = document.querySelector(".nav-links");
        if (!button || !links) {
            return;
        }
        button.addEventListener("click", function () {
            links.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector(".js-hero");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                play();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                play();
            });
        }

        play();
    }

    function uniqueValues(items, name) {
        var values = [];
        items.forEach(function (item) {
            var value = item.getAttribute("data-" + name) || "";
            if (value && values.indexOf(value) === -1) {
                values.push(value);
            }
        });
        return values.sort(function (a, b) {
            if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
                return Number(b) - Number(a);
            }
            return a.localeCompare(b, "zh-CN");
        });
    }

    function fillSelect(select, values) {
        values.forEach(function (value) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll(".search-panel"));
        scopes.forEach(function (panel) {
            var items = Array.prototype.slice.call(panel.querySelectorAll(".filter-item"));
            if (!items.length) {
                return;
            }
            var input = panel.querySelector(".js-filter-input");
            var selects = Array.prototype.slice.call(panel.querySelectorAll(".js-filter-select"));
            var empty = panel.querySelector(".empty-state");

            selects.forEach(function (select) {
                var key = select.getAttribute("data-filter");
                fillSelect(select, uniqueValues(items, key));
            });

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var activeFilters = {};
                selects.forEach(function (select) {
                    var key = select.getAttribute("data-filter");
                    activeFilters[key] = select.value;
                });
                var visible = 0;

                items.forEach(function (item) {
                    var haystack = [
                        item.getAttribute("data-title") || "",
                        item.getAttribute("data-region") || "",
                        item.getAttribute("data-type") || "",
                        item.getAttribute("data-year") || "",
                        item.getAttribute("data-tags") || ""
                    ].join(" ").toLowerCase();
                    var matched = !keyword || haystack.indexOf(keyword) !== -1;

                    Object.keys(activeFilters).forEach(function (key) {
                        if (activeFilters[key] && item.getAttribute("data-" + key) !== activeFilters[key]) {
                            matched = false;
                        }
                    });

                    item.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
        });
    }

    window.initPlayer = function (containerId, source) {
        var root = document.getElementById(containerId);
        if (!root) {
            return;
        }
        var video = root.querySelector("video");
        var cover = root.querySelector(".player-cover");
        var message = root.querySelector(".player-message");
        var attached = false;
        var hls = null;

        function fail() {
            if (message) {
                message.hidden = false;
            }
        }

        function attach() {
            if (attached || !video) {
                return;
            }
            attached = true;
            video.crossOrigin = "anonymous";
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        fail();
                    }
                });
                return;
            }
            video.src = source;
        }

        function start() {
            attach();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            if (message) {
                message.hidden = true;
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    fail();
                });
            }
        }

        if (cover) {
            cover.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener("error", fail);
        }
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        initNavigation();
        initHero();
        initFilters();
    });
})();
