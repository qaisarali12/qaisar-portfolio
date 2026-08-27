/* ==========================================================================
   QAISAR ALI — PORTFOLIO DATA LAYER
   Single source of truth for editable site content, shared by every public
   page and the Admin Panel. Persists to localStorage (per-browser).

   IMPORTANT HONESTY NOTE (read before wiring anything to a real backend):
   This is a client-side-only data store. Edits made in the Admin Panel are
   saved to the CURRENT BROWSER's localStorage. They will instantly appear
   on every page opened in that same browser (including other open tabs,
   live, via the storage event) — but they are NOT synced to a server, so a
   different visitor on a different device will not see them. A static ZIP
   of HTML/CSS/JS has no database. To make edits visible to every visitor
   worldwide, this data layer would need to be swapped for real API calls
   to a backend (Node/Express + a database, Firebase, Supabase, etc).
   ========================================================================== */

(function (global) {
  'use strict';

  var STORAGE_KEY = 'qa_site_data_v1';
  var AUTH_KEY = 'qa_admin_auth_v1';
  var SESSION_KEY = 'qa_admin_session_v1';

  var DEFAULT_CREDENTIALS = { username: 'admin', password: 'Admin@123' };

  /* ---------- Icon library (shared between public render + admin pickers) ---------- */
  var ICONS = {
    layout: '<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M3.5 9.5h17"/><path d="M8.5 9.5V20"/>',
    nodes: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8 7l8 10"/><circle cx="18" cy="6" r="2.5"/><path d="M15.8 7.3L10 15"/>',
    bolt: '<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/>',
    gitbranch: '<circle cx="6" cy="6" r="2.3"/><circle cx="6" cy="18" r="2.3"/><circle cx="18" cy="8.3" r="2.3"/><path d="M6 8.3v7.4"/><path d="M18 10.6a6 6 0 0 1-6 6H8.3"/>',
    star: '<path d="M12 3.5l2.6 5.4 5.9.6-4.4 4 1.3 5.9L12 16.4l-5.4 3-1.3-5.9-4.4-4 5.9-.6L12 3.5Z"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.9v.2h5v-.2c0-.8.4-1.5 1-1.9A6 6 0 0 0 12 3Z"/>',
    flag: '<path d="M5 3v18"/><path d="M5 4h11l-2.5 3.5L16 11H5"/>',
    shield: '<path d="m12 3 7 3v5c0 4.6-3 8.4-7 10-4-1.6-7-5.4-7-10V6l7-3Z"/>',
  };

  var THUMB_PATTERNS = ['thumb--marque', 'thumb--wilden', 'thumb--gull', 'thumb--grid', 'thumb--glow2'];

  /* ---------- Default content (mirrors the site exactly as designed) ---------- */
  var DEFAULTS = {
    theme: 'default',

    contact: {
      email: 'qaisaralishopify@gmail.com',
      whatsapp: '+92 317 0626467',
      whatsappNote: 'Available on request',
      linkedinUrl: '#',
      githubUrl: '#',
      basedText: 'Remote — Worldwide Clients'
    },

    services: [
      {
        id: 'svc-os2',
        icon: 'layout',
        title: 'Custom OS 2.0 Theme Development',
        description: "Bespoke, app-free Shopify themes built entirely from scratch using native Liquid, HTML, CSS, and modular JSON templates — engineered for elite Core Web Vitals and zero performance bloat.",
        price: '$500',
        unit: '/ project',
        note: ''
      },
      {
        id: 'svc-api',
        icon: 'nodes',
        title: 'Complex API Integrations & Apps',
        description: "Custom serverless logic and GraphQL / Admin API data routing — including specialized systems like real-time external pricing exchanges, such as live coin pricing via the Draft Order API.",
        price: '$800',
        unit: '/ integration',
        note: ''
      },
      {
        id: 'svc-perf',
        icon: 'bolt',
        title: 'Storefront Performance & Optimization',
        description: "Front-end audits that strip out heavy third-party app dependencies and replace them with vanilla JavaScript logic — built to boost mobile conversion rates and site speed.",
        price: '$300',
        unit: '/ audit',
        note: ''
      },
      {
        id: 'svc-retainer',
        icon: 'gitbranch',
        title: 'Dedicated Full-Stack Retainer',
        description: "Ongoing technical partnership covering store maintenance, custom feature enhancements, Git-based version control, and agile daily collaboration.",
        price: '$1,000',
        unit: '/ month',
        note: 'or $15 / hour'
      }
    ],

    achievements: [
      {
        id: 'ach-top-rated',
        icon: 'star',
        title: 'Top-Rated Upwork Shopify Developer Status',
        year: '2025 · 50+ Builds',
        represents: 'Client community & delivery track record',
        companyUrl: '',
        description: "Awarded by maintaining a consistent 4.9/5 client satisfaction rating across 50+ successful custom e-commerce builds — proof that performance-first engineering doesn't come at the cost of client experience."
      },
      {
        id: 'ach-integrator',
        icon: 'bulb',
        title: 'Complex Integration Innovator',
        year: '2024 · Gullmarkaðurinn',
        represents: 'Gullmarkaðurinn — Live Market Pricing System',
        companyUrl: '',
        description: "Recognized for architecting advanced technical solutions from scratch — including a real-time live market-pricing coin exchange system built on the Draft Order API for Gullmarkaðurinn."
      },
      {
        id: 'ach-appfree',
        icon: 'flag',
        title: 'App-Free Architecture Pioneer',
        year: '2023 – Present',
        represents: 'D2C clients & industry peers',
        companyUrl: '',
        description: "Acknowledged by clients and peers for eliminating heavy third-party app bloat and engineering high-performance, native OS 2.0 themes that drastically boost mobile Core Web Vitals and conversion rates."
      },
      {
        id: 'ach-junior-muscled',
        icon: 'bolt',
        title: 'Started as Junior Shopify Theme Developer',
        year: '2023',
        represents: 'Muscled Agency — Top Canadian Upwork Agency',
        companyUrl: 'https://muscled.co/',
        description: "Began the Shopify journey in 2023 as a Junior Theme Developer at Muscled Agency, one of the top Canadian agencies on Upwork. Learned the fundamentals from senior developers on the team — writing clean, reusable code that's optimized for speed from the ground up."
      },
      {
        id: 'ach-promoted-muscled',
        icon: 'shield',
        title: 'Promoted to Team Lead & Project Manager',
        year: '2024',
        represents: 'Muscled Agency — Client & Project Management',
        companyUrl: 'https://muscled.co/',
        description: "Promoted at Muscled Agency to Team Lead and Project Manager in 2024, collaborating directly with senior management to manage client relationships end-to-end — from first meetings through final project delivery."
      }
    ],

    portfolio: [
      {
        id: 'proj-marque',
        title: 'Brand Marque',
        category: 'os2',
        categoryLabel: 'Custom OS 2.0 Themes',
        tag: 'Luxury Fashion — OS 2.0 Rebuild',
        thumbPattern: 'thumb--marque',
        thumbImage: '',
        gallery: [],
        liveUrl: '',
        description: 'A modular, performance-first OS 2.0 architecture built for a luxury fashion label — zero third-party apps.',
        fullDescription: "Brand Marque needed a full Online Store 2.0 rebuild that could keep pace with frequent seasonal campaigns without relying on app-block bloat. I architected a fully modular section and block system in native Liquid, giving the internal team drag-and-drop flexibility in the theme editor while keeping every template lightweight. The result: a storefront the design team can restyle campaign-to-campaign without touching code, and a performance score that held steady through launch traffic.",
        features: ['Native Liquid section & block architecture', 'Zero third-party theme apps', 'Drag-and-drop editor flexibility', 'Stable Core Web Vitals at launch traffic'],
        tags: ['Liquid', 'OS 2.0 Sections', 'Theme Editor', 'Core Web Vitals'],
        featured: true
      },
      {
        id: 'proj-gull',
        title: 'Gullmarkaðurinn',
        category: 'api',
        categoryLabel: 'API Integrations & Apps',
        tag: 'Fine Jewelry — API Integration Suite',
        thumbPattern: 'thumb--gull',
        thumbImage: '',
        gallery: [],
        liveUrl: '',
        description: 'Real-time live market pricing exchange for gold and silver coins, powered by the Draft Order API.',
        fullDescription: "Gullmarkaðurinn sells gold and silver coins whose prices shift with the spot market throughout the day — something standard Shopify pricing can't handle on its own. I built a custom integration that pulls live spot prices and uses the Draft Order API to generate accurate, up-to-the-minute checkout totals, without a single pricing app installed. Pricing is reconciled server-side, so what a customer sees at checkout is always what they pay.",
        features: ['Live spot-price data pipeline', 'Draft Order API checkout logic', 'Server-side price reconciliation', 'Zero pricing apps installed'],
        tags: ['Draft Order API', 'Live Pricing', 'Custom Checkout Logic', 'Node.js'],
        featured: true
      },
      {
        id: 'proj-wilden',
        title: 'Wilden Grove',
        category: 'performance',
        categoryLabel: 'Performance & Custom Logic',
        tag: 'Home & Living — Custom Storefront',
        thumbPattern: 'thumb--wilden',
        thumbImage: '',
        gallery: [],
        liveUrl: '',
        description: 'App-free, multi-variant product personalizer letting shoppers customize pieces in real time.',
        fullDescription: "Wilden Grove's product line needed a personalization flow — engraving, material, and finish options — that felt instant and didn't add another app's script tag to the storefront. I built a multi-variant personalizer entirely in native JavaScript and Liquid, syncing selections to real Shopify variants so pricing and inventory stay accurate. The interface updates instantly with no page reloads, keeping the storefront's performance budget intact.",
        features: ['Real-time variant personalizer UI', 'Native JS — no personalization app', 'Live-synced pricing & inventory', 'Zero page-reload interactions'],
        tags: ['Custom JS', 'Variant Logic', 'Real-Time UI', 'App-Free'],
        featured: true
      }
    ],

    partners: [
      { id: 'p1', name: 'Northfield Studio', logoImage: '' },
      { id: 'p2', name: 'Vera & Co.', logoImage: '' },
      { id: 'p3', name: 'Arkhouse Digital', logoImage: '' },
      { id: 'p4', name: 'Meridian Commerce', logoImage: '' },
      { id: 'p5', name: 'Palette & Co.', logoImage: '' },
      { id: 'p6', name: 'Lumen Group', logoImage: '' }
    ],

    media: {
      profilePhoto: '',
      cvUrl: '',
      cvFileName: ''
    },

    /* Simple text-field overrides, keyed by data-key attributes in each page's HTML */
    content: {}
  };

  /* ---------- Deep merge helper (so new default fields survive old saved data) ---------- */
  function deepMerge(base, override) {
    if (Array.isArray(base)) return override !== undefined ? override : base;
    if (typeof base === 'object' && base !== null) {
      var out = {};
      for (var k in base) {
        out[k] = deepMerge(base[k], override ? override[k] : undefined);
      }
      if (override) {
        for (var k2 in override) {
          if (!(k2 in out)) out[k2] = override[k2];
        }
      }
      return out;
    }
    return override !== undefined ? override : base;
  }

  /* ---------- Storage ---------- */
  function loadData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULTS));
      var parsed = JSON.parse(raw);
      return deepMerge(DEFAULTS, parsed);
    } catch (e) {
      console.warn('QA site-data: failed to load, using defaults', e);
      return JSON.parse(JSON.stringify(DEFAULTS));
    }
  }

  function saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      // Same-tab listeners (the storage event only fires in OTHER tabs)
      document.dispatchEvent(new CustomEvent('qa:datachange', { detail: data }));
      return { ok: true };
    } catch (e) {
      console.error('QA site-data: save failed', e);
      var isQuota = e && (e.name === 'QuotaExceededError' || e.code === 22);
      return { ok: false, quota: isQuota, error: e };
    }
  }

  function resetData() {
    localStorage.removeItem(STORAGE_KEY);
    document.dispatchEvent(new CustomEvent('qa:datachange', { detail: loadData() }));
  }

  /* ---------- Theme ---------- */
  function applyTheme(themeName) {
    var root = document.documentElement;
    if (!themeName || themeName === 'default') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', themeName);
    }
  }

  var THEME_LIST = [
    { id: 'default', name: 'Default — White & Accent Yellow', swatch: '#FFDF59' },
    { id: 'midnight-blue', name: 'Midnight Blue', swatch: '#4C8DFF' },
    { id: 'charcoal-orange', name: 'Charcoal Orange', swatch: '#FF7A33' },
    { id: 'emerald-dark', name: 'Emerald Dark', swatch: '#2ECC71' }
  ];

  /* ---------- Auth ---------- */
  function getCredentials() {
    try {
      var raw = localStorage.getItem(AUTH_KEY);
      if (!raw) return DEFAULT_CREDENTIALS;
      var parsed = JSON.parse(raw);
      if (!parsed.username || !parsed.password) return DEFAULT_CREDENTIALS;
      return parsed;
    } catch (e) {
      return DEFAULT_CREDENTIALS;
    }
  }

  function usingDefaultCredentials() {
    return !localStorage.getItem(AUTH_KEY);
  }

  function setCredentials(username, password) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ username: username, password: password }));
  }

  function checkLogin(username, password) {
    var creds = getCredentials();
    return username === creds.username && password === creds.password;
  }

  function isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  }

  function setLoggedIn(val) {
    if (val) sessionStorage.setItem(SESSION_KEY, 'true');
    else sessionStorage.removeItem(SESSION_KEY);
  }

  /* ---------- Image compression (keeps localStorage usage sane) ---------- */
  function compressImage(file, maxDim, quality) {
    maxDim = maxDim || 1200;
    quality = quality || 0.82;
    return new Promise(function (resolve, reject) {
      if (!file || !file.type || file.type.indexOf('image/') !== 0) {
        reject(new Error('Please choose an image file.'));
        return;
      }
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('Could not read the file.')); };
      reader.onload = function () {
        var img = new Image();
        img.onerror = function () { reject(new Error('Could not decode the image.')); };
        img.onload = function () {
          var w = img.width, h = img.height;
          if (w > h && w > maxDim) { h = Math.round(h * (maxDim / w)); w = maxDim; }
          else if (h > maxDim) { w = Math.round(w * (maxDim / h)); h = maxDim; }
          var canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          var dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function readFileAsDataURL(file, maxBytes) {
    maxBytes = maxBytes || 8 * 1024 * 1024; // 8MB default cap
    return new Promise(function (resolve, reject) {
      if (!file) { reject(new Error('Please choose a file.')); return; }
      if (file.size > maxBytes) {
        reject(new Error('File is too large (max ' + Math.round(maxBytes / 1024 / 1024) + 'MB).'));
        return;
      }
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('Could not read the file.')); };
      reader.onload = function () { resolve(reader.result); };
      reader.readAsDataURL(file);
    });
  }

  function estimateStorageUsage() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY) || '';
      var bytes = raw.length;
      return { bytes: bytes, kb: Math.round(bytes / 1024), mb: +(bytes / 1024 / 1024).toFixed(2) };
    } catch (e) {
      return { bytes: 0, kb: 0, mb: 0 };
    }
  }

  /* ---------- Public API ---------- */
  global.QASite = {
    STORAGE_KEY: STORAGE_KEY,
    ICONS: ICONS,
    THUMB_PATTERNS: THUMB_PATTERNS,
    THEME_LIST: THEME_LIST,
    DEFAULTS: DEFAULTS,
    loadData: loadData,
    saveData: saveData,
    resetData: resetData,
    applyTheme: applyTheme,
    getCredentials: getCredentials,
    usingDefaultCredentials: usingDefaultCredentials,
    setCredentials: setCredentials,
    checkLogin: checkLogin,
    isLoggedIn: isLoggedIn,
    setLoggedIn: setLoggedIn,
    compressImage: compressImage,
    readFileAsDataURL: readFileAsDataURL,
    estimateStorageUsage: estimateStorageUsage
  };

  // Apply the saved theme immediately (this file is also loaded early via the
  // inline head snippet on each page for zero-flash theming; this call makes
  // it safe even if site-data.js is the only thing that ran).
  try { applyTheme(loadData().theme); } catch (e) {}

})(window);
