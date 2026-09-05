/* ==========================================================================
   QAISAR ALI — PORTFOLIO SHARED SCRIPT
   Handles: load-in animation, scroll reveals, stat counters,
   testimonial slider, marquee (CSS-driven), mobile nav.
   Reused across every page — keep additions page-agnostic.
   ========================================================================== */

/* ---------- Contact form → email delivery ----------
   This is a static site with no server, so the contact form can't send an
   email on its own — it needs a free "form backend" service to relay the
   submission to your inbox. To turn this on:

     1. Go to https://formspree.io and create a free account.
     2. Create a new form and confirm it via the email they send you.
     3. Copy the endpoint it gives you — it looks like
        "https://formspree.io/f/xxxxxxxx".
     4. Paste that URL below, between the quotes.

   (Any similar service — Web3Forms, Getform, Basin — works too: they all
   accept a plain POST of the form fields and just need the endpoint here.)

   Until this is filled in, the form keeps working exactly as before: it
   shows the "message received" confirmation locally, but nothing is
   actually emailed anywhere. */
const CONTACT_FORM_ENDPOINT = ''; // e.g. 'https://formspree.io/f/xxxxxxxx'

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Hero / page load-in ---------- */
  requestAnimationFrame(() => {
    document.body.classList.add('is-loaded');
  });

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const siteNav = document.getElementById('siteNav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    siteNav.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        siteNav.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Download CV button(s) ----------
     Any element marked data-cv-link (hero button, About page button, etc.)
     is wired here. It stays hidden until a CV is uploaded in the Admin
     Panel (Media & Assets → Resume / CV), so a fresh install never shows a
     dead-end download button. */
  const cvLinks = document.querySelectorAll('[data-cv-link]');
  const wireCvLinks = () => {
    if (!cvLinks.length || !window.QASite) return;
    const siteData = window.QASite.loadData();
    const cvUrl = siteData.media && siteData.media.cvUrl;
    cvLinks.forEach(link => {
      if (cvUrl) {
        link.href = cvUrl;
        link.removeAttribute('hidden');
        const fileName = (siteData.media && siteData.media.cvFileName) || 'Qaisar-Ali-CV.pdf';
        link.setAttribute('download', fileName);
      } else {
        link.setAttribute('hidden', '');
      }
    });
  };
  wireCvLinks();
  // Re-run once the live content arrives from the database
  document.addEventListener('qa:datachange', wireCvLinks);

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ---------- Animated stat counters ---------- */
  const counters = document.querySelectorAll('[data-count-to]');
  const animateCounter = (el) => {
    const target = parseFloat(el.getAttribute('data-count-to'));
    const decimals = parseInt(el.getAttribute('data-decimal') || '0', 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1600;
    const start = performance.now();

    if (prefersReducedMotion) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }

    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = easeOutExpo(progress);
      const value = target * eased;
      el.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toFixed(decimals) + suffix;
      }
    };
    requestAnimationFrame(tick);
  };

  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateCounter);
    } else {
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(el => counterObserver.observe(el));
    }
  }

  /* ---------- Contact form ---------- */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  if (contactForm && formSuccess) {
    const showSuccess = () => {
      contactForm.hidden = true;
      formSuccess.hidden = false;
      requestAnimationFrame(() => formSuccess.classList.add('is-visible'));
    };

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      // No email service connected yet (see CONTACT_FORM_ENDPOINT at the
      // top of this file) — keep the existing local-only confirmation.
      if (!CONTACT_FORM_ENDPOINT) {
        showSuccess();
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

      fetch(CONTACT_FORM_ENDPOINT, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Submit failed');
          showSuccess();
        })
        .catch(() => {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
          alert("Sorry, something went wrong sending your message. Please email me directly instead.");
        });
    });

    const resetBtn = document.getElementById('formResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        contactForm.reset();
        formSuccess.classList.remove('is-visible');
        formSuccess.hidden = true;
        contactForm.hidden = false;
      });
    }
  }

  /* ---------- Portfolio filter tabs ---------- */
  const filterTabs = document.querySelectorAll('.filter-tab');
  const filterHighlight = document.querySelector('.filter-tabs__highlight');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  function moveHighlight(tabEl) {
    if (!filterHighlight || !tabEl) return;
    filterHighlight.style.width = tabEl.offsetWidth + 'px';
    filterHighlight.style.height = tabEl.offsetHeight + 'px';
    filterHighlight.style.transform = `translate(${tabEl.offsetLeft}px, ${tabEl.offsetTop}px)`;
  }

  if (filterTabs.length) {
    const initialTab = document.querySelector('.filter-tab.is-active') || filterTabs[0];
    requestAnimationFrame(() => moveHighlight(initialTab));
    window.addEventListener('load', () => moveHighlight(document.querySelector('.filter-tab.is-active')));
    window.addEventListener('resize', () => moveHighlight(document.querySelector('.filter-tab.is-active')));

    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        if (tab.classList.contains('is-active')) return;
        filterTabs.forEach(t => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        moveHighlight(tab);

        const filter = tab.getAttribute('data-filter');
        let visibleIndex = 0;
        portfolioCards.forEach(card => {
          const matches = filter === 'all' || card.getAttribute('data-category') === filter;
          if (matches) {
            card.style.display = '';
            card.style.transitionDelay = prefersReducedMotion ? '0ms' : (visibleIndex * 80) + 'ms';
            requestAnimationFrame(() => {
              card.classList.remove('is-filtered-out');
              card.classList.add('is-visible');
            });
            visibleIndex++;
          } else {
            card.style.transitionDelay = '0ms';
            card.classList.add('is-filtered-out');
            setTimeout(() => {
              if (card.classList.contains('is-filtered-out')) card.style.display = 'none';
            }, prefersReducedMotion ? 0 : 480);
          }
        });
      });
    });
  }

  /* ---------- Lightbox ----------
     Shows the full project: a main image (uploaded thumbnail, a gallery
     image, or the abstract pattern as a fallback), an optional strip of
     gallery thumbnails to browse more shots, and a "Visit Live Site" link
     when a live URL has been set in the Admin Panel. Used on both the
     Home page teaser cards and the full Portfolio grid. */
  const lightbox = document.getElementById('lightbox');
  if (lightbox && portfolioCards.length) {
    const mediaEl = document.getElementById('lightboxMedia');
    const galleryEl = document.getElementById('lightboxGallery');
    const tagEl = document.getElementById('lightboxTag');
    const titleEl = document.getElementById('lightboxTitle');
    const descEl = document.getElementById('lightboxDesc');
    const tagsWrap = document.getElementById('lightboxTags');
    const liveLink = document.getElementById('lightboxLiveLink');
    let lastFocused = null;

    function setMainImage(image) {
      mediaEl.className = 'lightbox__media';
      mediaEl.style.backgroundImage = '';
      if (image.type === 'image') {
        mediaEl.style.backgroundImage = "url('" + image.value.replace(/'/g, '%27') + "')";
        mediaEl.style.backgroundSize = 'cover';
        mediaEl.style.backgroundPosition = 'center';
      } else {
        mediaEl.classList.add('thumb-fill', image.value);
      }
    }

    function openLightbox(card) {
      lastFocused = document.activeElement;

      const thumbImage = card.getAttribute('data-thumb-image') || '';
      const thumbPattern = card.getAttribute('data-thumb-pattern') || 'thumb--marque';
      let gallery = [];
      try { gallery = JSON.parse(card.getAttribute('data-gallery') || '[]'); } catch (e) { gallery = []; }

      const images = [];
      images.push(thumbImage ? { type: 'image', value: thumbImage } : { type: 'pattern', value: thumbPattern });
      gallery.forEach(src => images.push({ type: 'image', value: src }));

      setMainImage(images[0]);

      if (galleryEl) {
        if (images.length > 1) {
          galleryEl.hidden = false;
          galleryEl.innerHTML = images.map((img, i) => {
            const style = img.type === 'image'
              ? ' style="background-image:url(\'' + img.value.replace(/'/g, '%27') + '\')"'
              : '';
            const cls = 'lightbox__thumb' + (i === 0 ? ' is-active' : '') + (img.type === 'pattern' ? ' thumb-fill ' + img.value : '');
            return '<button type="button" class="' + cls + '"' + style + ' data-idx="' + i + '" aria-label="View image ' + (i + 1) + ' of ' + images.length + '"></button>';
          }).join('');
          galleryEl.querySelectorAll('.lightbox__thumb').forEach(btn => {
            btn.addEventListener('click', () => {
              setMainImage(images[parseInt(btn.getAttribute('data-idx'), 10)]);
              galleryEl.querySelectorAll('.lightbox__thumb').forEach(b => b.classList.remove('is-active'));
              btn.classList.add('is-active');
            });
          });
        } else {
          galleryEl.hidden = true;
          galleryEl.innerHTML = '';
        }
      }

      tagEl.textContent = card.getAttribute('data-tag');
      titleEl.textContent = card.getAttribute('data-title');
      descEl.textContent = card.getAttribute('data-desc');
      tagsWrap.innerHTML = '';
      (card.getAttribute('data-tags') || '').split(',').map(s => s.trim()).filter(Boolean).forEach(t => {
        const pill = document.createElement('span');
        pill.className = 'lightbox__tag-pill';
        pill.textContent = t;
        tagsWrap.appendChild(pill);
      });

      const liveUrl = card.getAttribute('data-live-url') || '';
      if (liveLink) {
        if (liveUrl) {
          liveLink.href = liveUrl;
          liveLink.hidden = false;
        } else {
          liveLink.hidden = true;
          liveLink.removeAttribute('href');
        }
      }

      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
      const closeBtn = lightbox.querySelector('.lightbox__close');
      if (closeBtn) closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-open');
      if (lastFocused) lastFocused.focus();
    }

    portfolioCards.forEach(card => {
      card.addEventListener('click', () => openLightbox(card));
    });
    lightbox.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeLightbox));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
    });
  }

  /* ---------- Timeline / achievements line draw ---------- */
  const lineDrawEls = document.querySelectorAll('.timeline, .achievements-timeline');
  if (lineDrawEls.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      lineDrawEls.forEach(el => el.classList.add('is-visible'));
    } else {
      const lineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            lineObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      lineDrawEls.forEach(el => lineObserver.observe(el));
    }
  }

  /* ---------- About: Skill bar fill ---------- */
  const skillFills = document.querySelectorAll('.skill-row__fill');
  if (skillFills.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      skillFills.forEach(el => { el.style.width = (el.getAttribute('data-fill-to') || '0') + '%'; });
    } else {
      const fillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = el.getAttribute('data-fill-to') || '0';
            requestAnimationFrame(() => { el.style.width = target + '%'; });
            fillObserver.unobserve(el);
          }
        });
      }, { threshold: 0.4 });
      skillFills.forEach(el => fillObserver.observe(el));
    }
  }

  /* ---------- Testimonial slider ---------- */
  const track = document.querySelector('.testimonial-track__inner');
  if (track) {
    const cards = track.querySelectorAll('.testimonial-card');
    const dotsWrap = document.querySelector('.testimonial-dots');
    const prevBtn = document.querySelector('.testimonial-arrow--prev');
    const nextBtn = document.querySelector('.testimonial-arrow--next');
    let index = 0;
    let autoplayId = null;

    const dots = [];
    if (dotsWrap) {
      cards.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'testimonial-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
        dots.push(dot);
      });
    }

    function goTo(i) {
      index = (i + cards.length) % cards.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle('is-active', di === index));
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAutoplay(); });

    function startAutoplay() {
      if (prefersReducedMotion || cards.length < 2) return;
      autoplayId = setInterval(next, 6000);
    }
    function resetAutoplay() {
      if (autoplayId) clearInterval(autoplayId);
      startAutoplay();
    }

    const slider = document.querySelector('.testimonial-slider');
    if (slider) {
      slider.addEventListener('mouseenter', () => autoplayId && clearInterval(autoplayId));
      slider.addEventListener('mouseleave', startAutoplay);
    }

    startAutoplay();
  }
});
