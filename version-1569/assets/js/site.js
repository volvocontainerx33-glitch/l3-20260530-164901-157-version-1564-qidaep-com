(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var navPanel = document.querySelector('.nav-panel');

    if (menuButton && navPanel) {
        menuButton.addEventListener('click', function () {
            var open = navPanel.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var categoryButton = document.querySelector('.nav-cat-button');
    var categoryWrap = document.querySelector('.nav-cats');

    if (categoryButton && categoryWrap) {
        categoryButton.addEventListener('click', function () {
            categoryWrap.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;

        function showSlide(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var next = Number(dot.getAttribute('data-hero-dot')) || 0;
                showSlide(next);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }
    }

    var searchInput = document.querySelector('.site-search');
    var yearFilter = document.querySelector('.year-filter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));

    function applyFilter() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var year = yearFilter ? yearFilter.value : '';

        cards.forEach(function (card) {
            var haystack = [
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' ').toLowerCase();
            var yearValue = card.getAttribute('data-year') || '';
            var matchedQuery = !query || haystack.indexOf(query) !== -1;
            var matchedYear = !year || yearValue.indexOf(year) !== -1;
            card.classList.toggle('hidden-by-search', !(matchedQuery && matchedYear));
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilter);
    }

    if (yearFilter) {
        yearFilter.addEventListener('change', applyFilter);
    }
})();
