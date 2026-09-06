/* ==========================================================================
   QAISAR ALI — PUBLIC PAGE RENDERER
   Reads QASite data and renders the dynamic sections (services, achievements,
   portfolio, partners, contact info, text overrides) on whichever public
   page it's loaded on. Safe to include on every page — each render function
   checks whether its mount point exists before doing anything.
   ========================================================================== */

(function () {
  'use strict';
  if (!window.QASite) return;
  var QA = window.QASite;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function svg(iconKey, cls) {
    var paths = QA.ICONS[iconKey] || QA.ICONS.star;
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>';
  }

  function thumbDiv(item, extraClass) {
    if (item.thumbImage) {
      return '<span class="' + (extraClass || '') + '" style="position:absolute;inset:0;background-image:url(\'' + item.thumbImage.replace(/'/g, "%27") + '\');background-size:cover;background-position:center;"></span>';
    }
    return '<span class="' + (extraClass || '') + ' ' + esc(item.thumbPattern || 'thumb--marque') + '"></span>';
  }

  /* ---------- Services ---------- */
  function renderServiceCardFull(s) {
    return '' +
      '<div class="service-card">' +
        '<div class="service-card__icon">' + svg(s.icon) + '</div>' +
        '<h3>' + esc(s.title) + '</h3>' +
        '<p>' + esc(s.description) + '</p>' +
        '<div class="service-card__price-row">' +
          '<div class="service-card__price">' +
            '<span class="service-card__price-label">Starting at</span>' +
            '<span class="service-card__price-value">' + esc(s.price) + '<span> ' + esc(s.unit) + '</span></span>' +
            (s.note ? '<span class="service-card__price-note">' + esc(s.note) + '</span>' : '') +
          '</div>' +
          '<a href="contact.html" class="service-card__link">Get a quote ' + svg('layout') + '</a>' +
        '</div>' +
      '</div>';
  }
  function renderServiceCardTeaser(s) {
    return '' +
      '<div class="service-card">' +
        '<div class="service-card__icon">' + svg(s.icon) + '</div>' +
        '<h3>' + esc(s.title) + '</h3>' +
        '<p>' + esc(s.description) + '</p>' +
      '</div>';
  }
  function renderServices(data) {
    var teaserMount = document.getElementById('servicesGridMount');
    if (teaserMount) {
      teaserMount.innerHTML = data.services.slice(0, 3).map(renderServiceCardTeaser).join('');
    }
    var fullMount = document.getElementById('servicesGridFullMount');
    if (fullMount) {
      fullMount.innerHTML = data.services.map(renderServiceCardFull).join('');
    }
  }

  /* ---------- Achievements ---------- */
  function renderAchievements(data) {
    var mount = document.getElementById('achievementsMount');
    if (!mount) return;
    mount.innerHTML = '<span class="achievements-timeline__line" aria-hidden="true"></span>' +
      data.achievements.map(function (a, i) {
      return '' +
        '<div class="achievement-card">' +
          '<div class="achievement-card__badge">' + svg(a.icon) + '<span class="achievement-card__index">' + String(i + 1).padStart(2, '0') + '</span></div>' +
          '<div class="achievement-card__content">' +
            '<span class="stat-card__corner tl"></span><span class="stat-card__corner br"></span>' +
            '<div class="achievement-card__head"><h3>' + esc(a.title) + '</h3><span class="achievement-card__year">' + esc(a.year) + '</span></div>' +
            '<div class="achievement-card__represents"><span class="achievement-card__represents-label">Represents</span><span class="achievement-card__represents-value">' + (a.companyUrl ? '<a href="' + esc(a.companyUrl) + '" target="_blank" rel="noopener">' + esc(a.represents) + '</a>' : esc(a.represents)) + '</span></div>' +
            '<p class="achievement-card__desc">' + esc(a.description) + '</p>' +
          '</div>' +
        '</div>';
    }).join('');
  }

  /* ---------- Portfolio ----------
     One shared card renderer is used for BOTH the Home page ("Selected
     builds" teaser) and the full Portfolio page grid, so the cards are
     visually identical (same image + text layout/dimensions) and clicking
     either one opens the same lightbox popup. */
  function renderPortfolioCardFull(p) {
    var features = JSON.stringify(p.features || []).replace(/'/g, '&#39;');
    var gallery = JSON.stringify(p.gallery || []).replace(/'/g, '&#39;');
    return '' +
      '<button type="button" class="portfolio-card" data-category="' + esc(p.category) + '" ' +
        'data-tag="' + esc(p.categoryLabel) + '" data-title="' + esc(p.title) + '" ' +
        'data-desc="' + esc(p.fullDescription || p.description) + '" data-tags="' + esc((p.tags || []).join(', ')) + '" ' +
        'data-thumb-pattern="' + esc(p.thumbPattern || 'thumb--marque') + '" data-thumb-image="' + esc(p.thumbImage || '') + '" ' +
        'data-live-url="' + esc(p.liveUrl || '') + '" data-features=\'' + features + '\' data-gallery=\'' + gallery + '\'>' +
        '<div class="portfolio-card__media">' + thumbDiv(p, 'thumb-fill') +
          '<span class="portfolio-card__view" aria-hidden="true">' + svg('layout') + '</span>' +
        '</div>' +
        '<div class="portfolio-card__body">' +
          '<span class="portfolio-card__tag">' + esc(p.categoryLabel) + '</span>' +
          '<h3 class="portfolio-card__title">' + esc(p.title) + '</h3>' +
          '<p class="portfolio-card__desc">' + esc(p.description) + '</p>' +
        '</div>' +
      '</button>';
  }
  function renderPortfolio(data) {
    var teaserMount = document.getElementById('workGridMount');
    if (teaserMount) {
      var featured = data.portfolio.filter(function (p) { return p.featured; }).slice(0, 3);
      if (featured.length < 3) featured = data.portfolio.slice(0, 3);
      teaserMount.innerHTML = featured.map(renderPortfolioCardFull).join('');
    }
    var fullMount = document.getElementById('portfolioGridMount');
    if (fullMount) {
      fullMount.innerHTML = data.portfolio.map(renderPortfolioCardFull).join('');
    }
  }

  /* ---------- Partners marquee ---------- */
  function renderPartners(data) {
    var mount = document.getElementById('partnersMarqueeMount');
    if (!mount) return;
    var items = data.partners.map(function (p) {
      if (p.logoImage) {
        return '<span class="marquee__item marquee__item--logo"><img src="' + p.logoImage.replace(/"/g, '') + '" alt="' + esc(p.name) + '" style="height:28px;width:auto;display:block;filter:grayscale(1);opacity:.7;"></span>';
      }
      return '<span class="marquee__item">' + esc(p.name) + '</span>';
    });
    mount.innerHTML = items.concat(items).join('');
  }

  /* ---------- Contact info (footer social icons, contact page, CTA mailtos) ---------- */
  function renderContact(data) {
    var c = data.contact;
    document.querySelectorAll('[data-contact="email-text"]').forEach(function (el) { el.textContent = c.email; });
    document.querySelectorAll('[data-contact="email-mailto"]').forEach(function (el) { el.href = 'mailto:' + c.email; });
    document.querySelectorAll('[data-contact="whatsapp-text"]').forEach(function (el) { el.textContent = c.whatsapp; });
    document.querySelectorAll('[data-contact="whatsapp-note"]').forEach(function (el) { el.textContent = c.whatsappNote; });
    document.querySelectorAll('[data-contact="whatsapp-href"]').forEach(function (el) {
      el.href = 'https://wa.me/' + c.whatsapp.replace(/[^0-9]/g, '');
    });
    document.querySelectorAll('[data-contact="based-text"]').forEach(function (el) { el.textContent = c.basedText; });
    document.querySelectorAll('[data-contact="linkedin-href"]').forEach(function (el) { el.href = c.linkedinUrl || '#'; });
    document.querySelectorAll('[data-contact="github-href"]').forEach(function (el) { el.href = c.githubUrl || '#'; });
  }

  /* ---------- Profile photo ---------- */
  function renderMedia(data) {
    var portraitInner = document.querySelector('.portrait__inner');
    if (portraitInner) {
      if (data.media.profilePhoto) {
        portraitInner.innerHTML = '<img src="' + data.media.profilePhoto.replace(/"/g, '') + '" alt="Qaisar Ali" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">';
      } else {
        // restore default monogram if it was previously replaced (defensive, mostly a no-op on fresh load)
        if (!portraitInner.querySelector('.portrait__mono')) {
          portraitInner.innerHTML = '<span class="portrait__mono">QA</span>' +
            '<svg class="portrait__grid" viewBox="0 0 400 500" preserveAspectRatio="none">' +
            '<defs><pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">' +
            '<path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFDF59" stroke-width="0.5"/></pattern></defs>' +
            '<rect width="400" height="500" fill="url(#gridPattern)" /></svg>';
        }
      }
    }
  }

  /* ---------- Simple text overrides ---------- */
  function renderTextOverrides(data) {
    var overrides = data.content || {};
    document.querySelectorAll('[data-key]').forEach(function (el) {
      var key = el.getAttribute('data-key');
      if (Object.prototype.hasOwnProperty.call(overrides, key) && overrides[key] !== '') {
        el.textContent = overrides[key];
      }
    });
    // Stat counters / skill bars store numeric overrides on data-count-to / data-fill-to
    document.querySelectorAll('[data-key-count]').forEach(function (el) {
      var key = el.getAttribute('data-key-count');
      if (Object.prototype.hasOwnProperty.call(overrides, key) && overrides[key] !== '') {
        el.setAttribute('data-count-to', overrides[key]);
      }
    });
    document.querySelectorAll('[data-key-fill]').forEach(function (el) {
      var key = el.getAttribute('data-key-fill');
      if (Object.prototype.hasOwnProperty.call(overrides, key) && overrides[key] !== '') {
        el.setAttribute('data-fill-to', overrides[key]);
        var valueEl = document.querySelector('[data-key-count="' + key + '"]');
        if (valueEl) valueEl.setAttribute('data-count-to', overrides[key]);
      }
    });
  }

  /* ---------- Master render ---------- */
  function renderAll() {
    var data = QA.loadData();
    QA.applyTheme(data.theme);
    renderServices(data);
    renderAchievements(data);
    renderPortfolio(data);
    renderPartners(data);
    renderContact(data);
    renderMedia(data);
    renderTextOverrides(data);
    document.dispatchEvent(new CustomEvent('qa:rendered', { detail: data }));
  }

  /* First paint strategy:
     — Repeat visit (we hold a cached copy): render immediately, then refresh
       silently when the live copy arrives.
     — First visit (nothing cached): waiting ~200ms for the live content avoids
       showing placeholder thumbnails that then swap to the real images. A
       safety timer guarantees the page still renders if the network is slow. */
  var painted = false;
  function firstPaint() {
    if (painted) return;
    painted = true;
    renderAll();
  }
  document.addEventListener('DOMContentLoaded', function () {
    if (!QA.hasCache || QA.hasCache() || !QA.ready) { firstPaint(); return; }
    var safety = setTimeout(firstPaint, 900);
    QA.ready.then(function () { clearTimeout(safety); firstPaint(); })
            .catch(function () { clearTimeout(safety); firstPaint(); });
  });

  // Live update: another tab (e.g. the Admin Panel) changed the data
  window.addEventListener('storage', function (e) {
    if (e.key === QA.STORAGE_KEY) renderAll();
  });
  // Live update: same tab / same-window change (e.g. Admin Panel preview iframe)
  document.addEventListener('qa:datachange', function () { painted = true; renderAll(); });

})();
