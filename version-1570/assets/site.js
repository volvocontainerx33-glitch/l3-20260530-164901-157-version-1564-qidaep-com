(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initNav() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var links = document.querySelector("[data-nav-links]");
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener("click", function() {
            links.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === active);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function() {
                show(active + 1);
            }, 5600);
        }

        if (previous) {
            previous.addEventListener("click", function() {
                show(active - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function() {
                show(active + 1);
                restart();
            });
        }
        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });
        restart();
    }

    function normalize(text) {
        return String(text || "").toLowerCase().trim();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function(scope) {
            var input = scope.querySelector("[data-search-input]");
            var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            if (!cards.length) {
                var nextGrid = scope.querySelector("[data-card-grid]");
                if (nextGrid) {
                    cards = Array.prototype.slice.call(nextGrid.querySelectorAll(".movie-card"));
                }
            }
            var filterValue = "all";

            function apply() {
                var query = normalize(input ? input.value : "");
                var filter = normalize(filterValue);
                cards.forEach(function(card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var type = normalize(card.getAttribute("data-type"));
                    var year = normalize(card.getAttribute("data-year"));
                    var region = normalize(card.getAttribute("data-region"));
                    var tags = normalize(card.getAttribute("data-tags"));
                    var matchQuery = !query || text.indexOf(query) > -1;
                    var matchFilter = filter === "all" || type.indexOf(filter) > -1 || year === filter || region.indexOf(filter) > -1 || tags.indexOf(filter) > -1 || text.indexOf(filter) > -1;
                    card.classList.toggle("is-hidden", !(matchQuery && matchFilter));
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            buttons.forEach(function(button) {
                button.addEventListener("click", function() {
                    filterValue = button.getAttribute("data-filter-value") || "all";
                    buttons.forEach(function(item) {
                        item.classList.toggle("active", item === button);
                    });
                    apply();
                });
            });
            apply();
        });
    }

    ready(function() {
        initNav();
        initHero();
        initFilters();
    });
})();
