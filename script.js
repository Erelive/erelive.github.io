(function () {
    'use strict';

    var root = document.documentElement;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- theme ---------- */

    var themeToggle = document.getElementById('themeToggle');
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

    function activeTheme() {
        var pinned = root.getAttribute('data-theme');
        if (pinned === 'light' || pinned === 'dark') return pinned;
        return systemDark.matches ? 'dark' : 'light';
    }

    // The button names the theme it switches to, so it never needs an icon.
    function syncToggle() {
        if (!themeToggle) return;
        var next = activeTheme() === 'dark' ? 'light' : 'dark';
        themeToggle.textContent = next.charAt(0).toUpperCase() + next.slice(1);
        themeToggle.setAttribute('aria-label', 'Switch to ' + next + ' theme');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            var next = activeTheme() === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            try {
                localStorage.setItem('theme', next);
            } catch (err) { }
            syncToggle();
        });
    }

    if (typeof systemDark.addEventListener === 'function') {
        systemDark.addEventListener('change', syncToggle);
    }

    syncToggle();

    /* ---------- navigation ---------- */

    var navToggle = document.getElementById('navToggle');
    var nav = document.getElementById('primaryNav');

    function setNav(open) {
        if (!nav || !navToggle) return;
        nav.classList.toggle('is-open', open);
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.textContent = open ? 'Close' : 'Menu';
    }

    if (navToggle && nav) {
        navToggle.addEventListener('click', function () {
            setNav(!nav.classList.contains('is-open'));
        });

        nav.addEventListener('click', function (event) {
            if (event.target.closest('a')) setNav(false);
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') setNav(false);
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 720) setNav(false);
        });
    }

    var header = document.getElementById('siteHeader');

    function onScroll() {
        if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));

    function setCurrent(id) {
        navLinks.forEach(function (link) {
            if (link.getAttribute('href') === '#' + id) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) setCurrent(entry.target.id);
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        sections.forEach(function (section) {
            spy.observe(section);
        });
    }

    /* ---------- entrance ---------- */

    var revealTargets = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

    function revealAll() {
        revealTargets.forEach(function (el) {
            el.classList.add('is-in');
        });
    }

    if (reduceMotion || !('IntersectionObserver' in window)) {
        revealAll();
    } else {
        var revealer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-in');
                revealer.unobserve(entry.target);
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        revealTargets.forEach(function (el) {
            revealer.observe(el);
        });

        // The page must never be able to sit blank if the observer does not fire.
        window.addEventListener('load', function () {
            setTimeout(function () {
                revealTargets.forEach(function (el) {
                    var box = el.getBoundingClientRect();
                    if (box.top < window.innerHeight) el.classList.add('is-in');
                });
            }, 1200);
        });
    }

    /* ---------- small things ---------- */

    var year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());

    var copyBtn = document.querySelector('[data-copy]');
    if (copyBtn && navigator.clipboard && navigator.clipboard.writeText) {
        copyBtn.hidden = false;
        copyBtn.addEventListener('click', function () {
            navigator.clipboard.writeText(copyBtn.getAttribute('data-copy')).then(function () {
                copyBtn.textContent = 'Copied';
                setTimeout(function () {
                    copyBtn.textContent = 'Copy';
                }, 1600);
            }).catch(function () { });
        });
    }

    /* ---------- chapter mapper demo ----------
       A port of the interpolation in KuroShiro's ChapterMapper (Kotlin):
       same constants, same margins, same confidence rules. The anchors are
       made up, so the numbers show how the estimate behaves, not a real series. */

    var NS = 'http://www.w3.org/2000/svg';
    var COMIC_MAX = 70;
    var NOVEL_TOTAL = 160;
    var CLOSE_GAP = 4;
    var FAR_GAP = 20;
    var NEAR_EXTRAPOLATION = 3;
    var RATE_POINTS = 5;

    // Comic chapter c tells novel chapters from..to, as a source would name them.
    var ANCHORS = [
        { c: 1, from: 1, to: 2 },
        { c: 12, from: 20, to: 22 },
        { c: 15, from: 27, to: 28 },
        { c: 30, from: 61, to: 63 },
        { c: 58, from: 131, to: 134 }
    ];

    function interpolate(chapter, before, after) {
        var gap = after.c - before.c;
        var t = (chapter - before.c) / gap;
        var start = before.from + (after.from - before.from) * t;
        var end = before.to + (after.to - before.to) * t;
        var rate = Math.max((after.from - before.from) / gap, 0.5);
        var distance = Math.min(chapter - before.c, after.c - chapter);
        var margin = rate * (0.25 + 0.1 * distance);
        var from = Math.max(Math.floor(start - margin), before.from);
        var to = Math.max(Math.min(Math.ceil(end + margin), after.to), from);
        return {
            from: from,
            to: to,
            confidence: gap <= CLOSE_GAP ? 'high' : (gap <= FAR_GAP ? 'medium' : 'low'),
            basis: 'interpolated'
        };
    }

    // Past the last chapter a source names: carry on at the pace of the last few named.
    function extrapolate(chapter, nearest) {
        var distance = Math.abs(chapter - nearest.c);
        var side = ANCHORS.slice(-RATE_POINTS);
        var rate = (side[side.length - 1].from - side[0].from) / (side[side.length - 1].c - side[0].c);
        var margin = Math.max(1, rate) * (0.5 + 0.15 * distance);
        var from = Math.max(Math.floor(nearest.from + rate * distance - margin), 1);
        var to = Math.max(Math.ceil(nearest.to + rate * distance + margin), from);
        return {
            from: from,
            to: to,
            confidence: distance <= NEAR_EXTRAPOLATION ? 'medium' : 'low',
            basis: 'extrapolated'
        };
    }

    function estimate(chapter) {
        var exact = null;
        var before = null;
        var after = null;
        ANCHORS.forEach(function (point) {
            if (point.c === chapter) exact = point;
            if (point.c < chapter) before = point;
            if (point.c > chapter && !after) after = point;
        });
        var result;
        if (exact) {
            result = { from: exact.from, to: exact.to, confidence: 'high', basis: 'direct' };
        } else if (before && after) {
            result = interpolate(chapter, before, after);
        } else {
            result = extrapolate(chapter, before || after);
        }
        result.from = Math.min(result.from, NOVEL_TOTAL);
        result.to = Math.min(result.to, NOVEL_TOTAL);
        return result;
    }

    var CONFIDENCE = { high: 'Sure', medium: 'Likely', low: 'Rough guess' };
    var BASIS = {
        direct: 'A source names this chapter.',
        interpolated: 'Worked out between two chapters that sources name.',
        extrapolated: 'Past the last chapter a source names.'
    };

    function svgEl(name, attrs, parent) {
        var el = document.createElementNS(NS, name);
        Object.keys(attrs).forEach(function (key) {
            el.setAttribute(key, attrs[key]);
        });
        if (parent) parent.appendChild(el);
        return el;
    }

    function initMapper(host) {
        var input = host.querySelector('[data-mapper-input]');
        var stage = host.querySelector('[data-mapper-stage]');
        if (!input || !stage) return;

        var out = {
            comic: host.querySelector('[data-mapper-comic]'),
            range: host.querySelector('[data-mapper-range]'),
            confidence: host.querySelector('[data-mapper-confidence]'),
            basis: host.querySelector('[data-mapper-basis]')
        };

        var H = 204;
        var PAD = 22;
        var COMIC_Y = 70;
        var NOVEL_Y = 150;
        var W, SPAN, svg, fill, span, dot, comicLabel, novelLabel;

        function comicX(c) { return PAD + (c - 1) / (COMIC_MAX - 1) * SPAN; }
        function novelX(n) { return PAD + (n - 1) / (NOVEL_TOTAL - 1) * SPAN; }

        // Drawn at the stage's own width, one unit per pixel, so the labels stay
        // the same size on a phone as on a desktop instead of shrinking with the figure.
        function build() {
            W = Math.max(280, Math.min(720, Math.round(stage.clientWidth) || 640));
            SPAN = W - 2 * PAD;

            if (svg) stage.removeChild(svg);
            svg = svgEl('svg', {
                'class': 'mapper-svg',
                viewBox: '0 0 ' + W + ' ' + H,
                role: 'img',
                'aria-label': 'Comic chapters on the top line and novel chapters on the bottom line. '
                    + 'Thin lines join the chapters that sources name; the highlighted wedge is the estimate.'
            });

            fill = svgEl('polygon', { 'class': 'est-fill' }, svg);

            var lastLabelX = -100;
            ANCHORS.forEach(function (point) {
                var x = comicX(point.c);
                var x1 = novelX(point.from);
                var x2 = Math.max(novelX(point.to), x1 + 3);
                svgEl('line', { 'class': 'anchor-line', x1: x, y1: COMIC_Y, x2: (x1 + x2) / 2, y2: NOVEL_Y }, svg);
                svgEl('line', { 'class': 'anchor-tick', x1: x, y1: COMIC_Y - 4, x2: x, y2: COMIC_Y + 4 }, svg);
                svgEl('line', { 'class': 'anchor-span', x1: x1, y1: NOVEL_Y, x2: x2, y2: NOVEL_Y }, svg);
                if (x - lastLabelX >= 20) {
                    svgEl('text', { x: x, y: COMIC_Y - 9, 'text-anchor': 'middle' }, svg).textContent = String(point.c);
                    lastLabelX = x;
                }
            });

            svgEl('line', { 'class': 'axis', x1: PAD, y1: COMIC_Y, x2: W - PAD, y2: COMIC_Y }, svg);
            svgEl('line', { 'class': 'axis', x1: PAD, y1: NOVEL_Y, x2: W - PAD, y2: NOVEL_Y }, svg);

            svgEl('text', { x: PAD, y: 13 }, svg).textContent = 'Comic chapters';
            if (W >= 460) {
                svgEl('text', { x: W - PAD, y: 13, 'text-anchor': 'end' }, svg).textContent = 'numbered ticks: named by a source';
            }
            svgEl('text', { x: PAD, y: H - 5 }, svg).textContent = 'Novel chapters, 1 to ' + NOVEL_TOTAL;

            span = svgEl('line', { 'class': 'est-span', y1: NOVEL_Y, y2: NOVEL_Y }, svg);
            dot = svgEl('circle', { 'class': 'est-dot', cy: COMIC_Y, r: 6 }, svg);
            comicLabel = svgEl('text', { 'class': 'est-label', y: COMIC_Y - 26, 'text-anchor': 'middle' }, svg);
            novelLabel = svgEl('text', { 'class': 'est-label', y: NOVEL_Y + 21, 'text-anchor': 'middle' }, svg);

            svg.addEventListener('pointerdown', function (event) {
                dragging = true;
                if (svg.setPointerCapture) svg.setPointerCapture(event.pointerId);
                setFromPointer(event);
            });

            svg.addEventListener('pointermove', function (event) {
                if (dragging) setFromPointer(event);
            });

            ['pointerup', 'pointercancel'].forEach(function (type) {
                svg.addEventListener(type, function () {
                    dragging = false;
                });
            });

            stage.appendChild(svg);
        }

        function clampLabel(x) {
            return Math.min(Math.max(x, PAD + 16), W - PAD - 16);
        }

        function render() {
            var chapter = Math.min(Math.max(parseInt(input.value, 10) || 1, 1), COMIC_MAX);
            var est = estimate(chapter);
            var x = comicX(chapter);
            var x1 = novelX(est.from);
            var x2 = Math.max(novelX(est.to), x1 + 4);
            var rangeText = est.from === est.to ? String(est.from) : est.from + '–' + est.to;

            fill.setAttribute('points', x + ',' + COMIC_Y + ' ' + x2 + ',' + NOVEL_Y + ' ' + x1 + ',' + NOVEL_Y);
            span.setAttribute('x1', x1);
            span.setAttribute('x2', x2);
            dot.setAttribute('cx', x);
            comicLabel.setAttribute('x', clampLabel(x));
            comicLabel.textContent = 'ch. ' + chapter;
            novelLabel.setAttribute('x', clampLabel((x1 + x2) / 2));
            novelLabel.textContent = rangeText;

            if (out.comic) out.comic.textContent = String(chapter);
            if (out.range) out.range.textContent = (est.from === est.to ? 'Novel chapter ' : 'Novel chapters ') + rangeText;
            if (out.confidence) out.confidence.textContent = CONFIDENCE[est.confidence];
            if (out.basis) {
                out.basis.textContent = BASIS[est.basis] + (est.to < NOVEL_TOTAL
                    ? ' Pick up the novel at chapter ' + (est.to + 1) + '.'
                    : ' That is the end of the novel.');
            }
        }

        function setFromPointer(event) {
            var box = svg.getBoundingClientRect();
            var x = (event.clientX - box.left) / box.width * W;
            var chapter = Math.round(1 + (x - PAD) / SPAN * (COMIC_MAX - 1));
            input.value = String(Math.min(Math.max(chapter, 1), COMIC_MAX));
            render();
        }

        var dragging = false;
        var resizeTimer = null;

        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                if (Math.abs(Math.round(stage.clientWidth) - W) < 8) return;
                build();
                render();
            }, 150);
        });

        input.addEventListener('input', render);
        build();
        render();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-mapper]')).forEach(initMapper);
})();
