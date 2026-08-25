(function () {
    'use strict';

    var root = document.documentElement;
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var themeToggle = document.getElementById('themeToggle');
    var systemLight = window.matchMedia('(prefers-color-scheme: light)');

    function activeTheme() {
        var pinned = root.getAttribute('data-theme');
        if (pinned) return pinned;
        return systemLight.matches ? 'light' : 'dark';
    }

    function syncToggleLabel() {
        if (!themeToggle) return;
        var next = activeTheme() === 'dark' ? 'light' : 'dark';
        themeToggle.setAttribute('aria-label', 'Switch to ' + next + ' theme');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            var next = activeTheme() === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            try {
                localStorage.setItem('theme', next);
            } catch (err) { }
            syncToggleLabel();
        });
    }

    if (typeof systemLight.addEventListener === 'function') {
        systemLight.addEventListener('change', syncToggleLabel);
    }

    syncToggleLabel();

    var navToggle = document.getElementById('navToggle');
    var nav = document.getElementById('primaryNav');

    function closeNav() {
        if (!nav || !navToggle) return;
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
        document.body.classList.remove('nav-open');
    }

    if (navToggle && nav) {
        navToggle.addEventListener('click', function () {
            var opening = !nav.classList.contains('open');
            nav.classList.toggle('open', opening);
            navToggle.setAttribute('aria-expanded', String(opening));
            navToggle.setAttribute('aria-label', opening ? 'Close menu' : 'Open menu');
            document.body.classList.toggle('nav-open', opening);
        });

        nav.addEventListener('click', function (event) {
            if (event.target.closest('a')) closeNav();
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') closeNav();
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 720) closeNav();
        });
    }

    var header = document.getElementById('siteHeader');

    function onScroll() {
        if (header) header.classList.toggle('scrolled', window.scrollY > 12);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var revealTargets = document.querySelectorAll('.reveal');

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealTargets.forEach(function (el) {
            el.classList.add('visible');
        });
    } else {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

        revealTargets.forEach(function (el, index) {
            el.style.transitionDelay = (index % 4) * 70 + 'ms';
            revealObserver.observe(el);
        });
    }

    var sections = Array.prototype.slice.call(
        document.querySelectorAll('main section[id]')
    );
    var navLinks = Array.prototype.slice.call(
        document.querySelectorAll('.nav a[href^="#"]')
    );

    function setActiveLink(id) {
        navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
    }

    if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
        var spyObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) setActiveLink(entry.target.id);
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        sections.forEach(function (section) {
            spyObserver.observe(section);
        });
    }

    var year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
})();
