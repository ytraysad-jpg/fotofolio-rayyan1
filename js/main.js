/* Portofolio Muhammad Rayyan Nafis – main.js
   Bagian: bintang 3D · pindah halaman · tab · game · suara tombol */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = matchMedia('(pointer: coarse)').matches;
  // Mode ringan untuk HP / perangkat kecil supaya tidak lag
  var lite = coarse || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;

  var mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  var warp = 0;
  var cur = null;
  addEventListener('pointermove', function (e) {
    mouse.x = (e.clientX / innerWidth - .5) * 2;
    mouse.y = (e.clientY / innerHeight - .5) * 2;
  }, { passive: true });

  /* ============ BINTANG 3D (ringan: kotak kecil, tanpa blur) ============ */
  var cv = document.getElementById('stars');
  var cx = cv.getContext('2d', { alpha: true });
  var W = 0, H = 0, stars = [];
  var COLORS = ['#5f86ff', '#8fb2ff', '#d6e4ff'];

  function resetStar(s, z) {
    s.x = (Math.random() - .5) * 2.6;
    s.y = (Math.random() - .5) * 2.6;
    s.z = z;
  }
  function resizeStars() {
    W = innerWidth; H = innerHeight;
    cv.width = W; cv.height = H;            // 1x saja, bintang kecil tidak perlu resolusi tinggi
    var n = lite ? 70 : Math.min(150, Math.round(W * H / 9500));
    stars = [];
    for (var i = 0; i < n; i++) {
      var s = { c: (Math.random() * 3) | 0, v: .5 + Math.random() };
      resetStar(s, Math.random() * .98 + .02);
      stars.push(s);
    }
  }
  resizeStars();
  addEventListener('resize', resizeStars);

  var shoot = null;
  function drawStars(dt) {
    mouse.sx += (mouse.x - mouse.sx) * .05;
    mouse.sy += (mouse.y - mouse.sy) * .05;
    cx.clearRect(0, 0, W, H);
    var f = Math.max(W, H) * .275,
        ox = W / 2 - mouse.sx * 36,
        oy = H / 2 - mouse.sy * 36,
        speed = (.0016 + warp * .045) * dt,
        streak = warp > .03;

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i], pz = s.z;
      s.z -= speed * s.v;
      if (s.z <= .02) { resetStar(s, 1); pz = 1; }
      var x = ox + s.x / s.z * f, y = oy + s.y / s.z * f;
      if (x < -10 || x > W + 10 || y < -10 || y > H + 10) { resetStar(s, 1); continue; }
      var depth = 1 - s.z;
      cx.globalAlpha = Math.min(1, .2 + depth * 1.1);
      cx.fillStyle = cx.strokeStyle = COLORS[s.c];
      if (streak) {
        cx.lineWidth = .8 + depth * 1.4;
        cx.beginPath();
        cx.moveTo(ox + s.x / pz * f, oy + s.y / pz * f);
        cx.lineTo(x, y);
        cx.stroke();
      } else {
        var sz = 1 + depth * 1.8;
        cx.fillRect(x, y, sz, sz);
      }
    }
    // bintang jatuh (jarang, hanya mode normal)
    if (!lite && !reduce) {
      if (!shoot && Math.random() < .002) shoot = { x: Math.random() * W * .8 + W * .2, y: Math.random() * H * .35, l: 0 };
      if (shoot) {
        shoot.x -= 10 * dt; shoot.y += 5 * dt; shoot.l++;
        cx.globalAlpha = Math.max(0, 1 - shoot.l / 60);
        cx.strokeStyle = '#aacdff'; cx.lineWidth = 1.5;
        cx.beginPath(); cx.moveTo(shoot.x, shoot.y); cx.lineTo(shoot.x + 70, shoot.y - 35); cx.stroke();
        if (shoot.l > 60) shoot = null;
      }
    }
    cx.globalAlpha = 1;
    warp *= Math.pow(.93, dt);
    if (warp < .005) warp = 0;
  }

  /* ============ LOOP (dibatasi fps, berhenti saat tab tidak aktif) ============ */
  var running = true, looping = false, last = 0, frameN = 0;
  var MIN_DT = lite ? 33 : 20;           // ~30fps (ringan) / ~50fps (normal)

  function loop(ts) {
    if (!running || reduce) { looping = false; return; }
    requestAnimationFrame(loop);
    var d = ts - last;
    if (d < MIN_DT) return;
    last = ts;
    var dt = Math.min(d, 50) / 16.7;
    frameN++;
    drawStars(dt);
  }
  function startLoop() { if (looping || reduce) return; looping = true; requestAnimationFrame(loop); }
  document.addEventListener('visibilitychange', function () { running = !document.hidden; if (running) startLoop(); });

  /* ============ HALAMAN: pindah seperti membuka halaman baru ============ */
  var titles = { home: '', tentang: 'Tentang · ', portofolio: 'Portofolio · ' };
  var pages = {};
  ['home', 'tentang', 'portofolio'].forEach(function (id) { pages[id] = document.getElementById(id); });
  var navLinks = [].slice.call(document.querySelectorAll('nav.pill a'));
  var ind = document.getElementById('navInd');
  var timer = null;

  function moveInd() {
    var a = document.querySelector('nav.pill a.on');
    if (!a) return;
    ind.style.width = a.offsetWidth + 'px';
    ind.style.transform = 'translateX(' + a.offsetLeft + 'px)';
  }
  function setNav(id) {
    navLinks.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + id); });
    moveInd();
  }
  addEventListener('resize', moveInd);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveInd);

  function reveal(el) {
    el.querySelectorAll('.rv').forEach(function (r, i) {
      r.classList.remove('in');
      setTimeout(function () { r.classList.add('in'); }, reduce ? 0 : 100 + i * 100);
    });
  }
  function show(el) {
    Object.keys(pages).forEach(function (k) {
      if (pages[k] !== el) { pages[k].hidden = true; pages[k].classList.remove('out', 'inn'); }
    });
    el.hidden = false;
    el.classList.remove('out', 'inn');
    void el.offsetWidth;
    if (!reduce) el.classList.add('inn');
    scrollTo(0, 0);
    if (el.id === 'home') sizeObj();
    reveal(el);
    if (reduce) { drawStars(1); }
  }
  function go(id, push) {
    if (!pages[id]) id = 'home';
    if (id === cur) return;
    var prev = cur ? pages[cur] : null;
    cur = id;
    setNav(id);
    if (push) { try { history.pushState({ p: id }, '', '#' + id); } catch (e) { try { location.hash = id; } catch (x) {} } }
    document.title = titles[id] + 'Muhammad Rayyan Nafis – Portofolio';
    clearTimeout(timer);
    if (!prev || reduce) { show(pages[id]); return; }
    warp = 1.3;
    prev.classList.add('out');
    timer = setTimeout(function () { show(pages[id]); }, 360);
  }
  [].slice.call(document.querySelectorAll('a[href^="#"]')).forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      if (!pages[id]) return;
      e.preventDefault();
      go(id, true);
    });
  });
  function dariHash() { go((location.hash || '#home').slice(1), false); }
  addEventListener('popstate', dariHash);
  addEventListener('hashchange', dariHash);

  /* ============ LOADER ============ */
  var loader = document.getElementById('loader');
  var pct = document.getElementById('pct');
  var fill = document.getElementById('barFill');
  var prog = 0, loaded = (document.readyState === 'complete');
  addEventListener('load', function () { loaded = true; });
  setTimeout(function () { loaded = true; }, 4000);

  function finishLoad() {
    loader.classList.add('done');
    go((location.hash || '#home').slice(1), false);
    startLoop();
  }
  (function tick() {
    var target = loaded ? 100 : 90;
    prog += (target - prog) * .08 + .4;
    if (prog > target) prog = target;
    var v = Math.min(100, Math.round(prog));
    pct.textContent = v;
    fill.style.width = v + '%';
    if (v >= 100) { setTimeout(finishLoad, 250); return; }
    setTimeout(tick, reduce ? 10 : 40);
  })();

  /* ============ TILT 3D (hanya mouse, bukan layar sentuh / perangkat ringan) ============ */
  if (!reduce && !coarse) {
    [].slice.call(document.querySelectorAll('.tilt')).forEach(function (el) {
      var m = +el.getAttribute('data-tilt') || 8, raf = 0, ex = 0, ey = 0;
      function apply() {
        raf = 0;
        var r = el.getBoundingClientRect(), x = (ex - r.left) / r.width - .5, y = (ey - r.top) / r.height - .5;
        el.style.transform = 'perspective(800px) rotateX(' + (-y * m).toFixed(2) + 'deg) rotateY(' + (x * m).toFixed(2) + 'deg)';
      }
      el.addEventListener('pointermove', function (e) {
        ex = e.clientX; ey = e.clientY;
        el.style.transition = 'transform .1s linear';
        if (!raf) raf = requestAnimationFrame(apply);
      });
      el.addEventListener('pointerleave', function () {
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        el.style.transition = 'transform .45s cubic-bezier(.2,.8,.2,1)';
        el.style.transform = '';
      });
    });
  }

  /* ============ TAB ============ */
  var tabs = [].slice.call(document.querySelectorAll('.tab'));
  function pilih(t, fokus) {
    tabs.forEach(function (b) {
      var on = b === t;
      b.setAttribute('aria-selected', on);
      b.tabIndex = on ? 0 : -1;
      document.getElementById(b.getAttribute('aria-controls')).hidden = !on;
    });
    if (fokus) t.focus();
  }
  tabs.forEach(function (b, i) {
    b.addEventListener('click', function () { pilih(b); });
    b.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (n) { e.preventDefault(); pilih(tabs[(i + n + tabs.length) % tabs.length], true); }
    });
  });

  /* ============ GAME TEBAK ANGKA ============ */
  var MAX = 4, rahasia, sisa, rekor = null;
  var inp = document.getElementById('tebakan'),
      pesan = document.getElementById('pesanGame'),
      ny = document.getElementById('nyawa'),
      rk = document.getElementById('rekor'),
      bt = document.getElementById('btnTebak'),
      bu = document.getElementById('btnUlang');
  try { rekor = +localStorage.getItem('rekorTebak') || null; } catch (e) {}

  function tampil() {
    ny.textContent = '♥'.repeat(sisa) + '♡'.repeat(MAX - sisa);
    rk.textContent = rekor ? 'Rekor: ' + rekor + ' tebakan' : 'Rekor: belum ada';
  }
  function selesai() { inp.disabled = true; bt.disabled = true; bu.classList.add('solid'); bu.focus(); }
  function mulai() {
    rahasia = Math.floor(Math.random() * 10) + 1; sisa = MAX;
    inp.value = ''; inp.disabled = false; bt.disabled = false;
    bu.classList.remove('solid');
    pesan.textContent = 'Ketik angka lalu tekan Tebak.';
    tampil();
  }
  function tebak() {
    if (inp.disabled) return;
    var n = parseInt(inp.value, 10);
    if (!(n >= 1 && n <= 10)) { pesan.textContent = 'Masukkan angka antara 1 dan 10.'; return; }
    sisa--;
    if (n === rahasia) {
      var q = MAX - sisa;
      pesan.textContent = 'Benar! Angkanya ' + rahasia + '. Kamu butuh ' + q + ' tebakan. Tekan Main lagi.';
      selesai();
      if (!rekor || q < rekor) { rekor = q; try { localStorage.setItem('rekorTebak', q); } catch (e) {} }
    } else if (sisa === 0) {
      pesan.textContent = 'Kesempatan habis. Angkanya ' + rahasia + '. Tekan Main lagi.';
      selesai();
    } else {
      pesan.textContent = (n < rahasia ? 'Terlalu kecil.' : 'Terlalu besar.') + ' Sisa ' + sisa + ' kesempatan.';
    }
    tampil(); inp.value = ''; if (!inp.disabled) inp.focus();
  }
  bt.addEventListener('click', tebak);
  bu.addEventListener('click', mulai);
  inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') tebak(); });
  mulai();

  /* ============ FOTO: kalau gagal dimuat, tampilkan avatar "RN" ============ */
  ['fotoProfil', 'fotoHome'].forEach(function (id) {
    var foto = document.getElementById(id);
    if (!foto) return;
    var FB = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 453"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#14224f"/><stop offset="1" stop-color="#0a1233"/></linearGradient></defs><rect width="340" height="453" fill="url(#g)"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-family="Inter,Arial,sans-serif" font-weight="800" font-size="120" fill="#4d8bff">RN</text></svg>');
    var pakaiFB = function () { if (foto.dataset.fb) return; foto.dataset.fb = '1'; foto.src = FB; };
    foto.addEventListener('error', pakaiFB);
    if (foto.complete && !foto.naturalWidth) pakaiFB();
  });

  /* ============ TOMBOL: suara klik satisfying + riak liquid glass ============
     Suara dibuat langsung dengan Web Audio (tanpa file mp3), jadi ringan. */
  (function () {
    var SEL = '.btn, .tab, nav.pill a';
    var AC = null, out = null, noise = null, pressed = null, muted = false, toastT = 0;
    var sfxBtn = document.getElementById('sfx');
    var toastEl = document.getElementById('toast');
    try { muted = localStorage.getItem('sfxMuted') === '1'; } catch (e) {}

    function ctx() {
      if (!AC) {
        var C = window.AudioContext || window.webkitAudioContext;
        if (!C) return null;
        try { AC = new C(); } catch (e) { return null; }
        var comp = AC.createDynamicsCompressor();
        out = AC.createGain(); out.gain.value = .85;
        out.connect(comp); comp.connect(AC.destination);
        var len = Math.floor(AC.sampleRate * .06), buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0);
        for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
        noise = buf;
      }
      if (AC.state === 'suspended') AC.resume();
      return AC;
    }
    function tone(type, f0, f1, dur, vol, t0) {
      var o = AC.createOscillator(), g = AC.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f0, t0);
      o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
      g.gain.setValueAtTime(.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + .004);
      g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
      o.connect(g); g.connect(out);
      o.start(t0); o.stop(t0 + dur + .02);
    }
    function tick(freq, q, dur, vol, t0) {
      var s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
      s.buffer = noise; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
      g.gain.setValueAtTime(vol, t0);
      g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
      s.connect(f); f.connect(g); g.connect(out);
      s.start(t0); s.stop(t0 + dur + .01);
    }
    var PITCH = { btn: 1, solid: .82, tab: 1.25, nav: 1.12, icon: 1.4 };
    function kindOf(el) {
      if (el.id === 'sfx') return 'icon';
      if (el.classList.contains('tab')) return 'tab';
      if (el.classList.contains('solid')) return 'solid';
      if (el.closest('nav.pill')) return 'nav';
      return 'btn';
    }
    // saat ditekan: "thok" bulat + kilau kaca + klik tajam
    function down(kind) {
      if (muted || !ctx()) return;
      var t = AC.currentTime + .001, p = (PITCH[kind] || 1) * (.96 + Math.random() * .08);
      tone('sine', 560 * p, 140 * p, .11, .5, t);
      tone('triangle', 1250 * p, 620 * p, .05, .16, t);
      tick(3400 * p, 1.2, .022, .5, t);
    }
    // saat dilepas: "plip" gelembung naik
    function up(kind) {
      if (muted || !ctx()) return;
      var t = AC.currentTime + .001, p = (PITCH[kind] || 1) * (.97 + Math.random() * .06);
      tone('sine', 700 * p, 1500 * p, .07, .2, t);
      tick(6200 * p, 2, .014, .22, t);
    }

    function ripple(el, x, y) {
      if (reduce) return;
      var r = el.getBoundingClientRect(), size = Math.max(r.width, r.height) * 1.6, s = document.createElement('span');
      s.className = 'rip';
      s.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (x - r.left - size / 2) + 'px;top:' + (y - r.top - size / 2) + 'px';
      el.appendChild(s);
      var rm = function () { if (s.parentNode) s.parentNode.removeChild(s); };
      s.addEventListener('animationend', rm);
      setTimeout(rm, 900);
    }
    function target(e) { var t = e.target; return t && t.closest ? t.closest(SEL) : null; }
    function spasiLink(e, el) { return e.key === ' ' && el.tagName === 'A'; }

    document.addEventListener('pointerdown', function (e) {
      if (e.button > 0) return;
      var el = target(e);
      if (!el || el.disabled) return;
      pressed = el;
      ripple(el, e.clientX, e.clientY);
      down(kindOf(el));
    }, true);
    document.addEventListener('pointerup', function () {
      if (!pressed) return;
      var el = pressed; pressed = null; up(kindOf(el));
    }, true);
    document.addEventListener('pointercancel', function () { pressed = null; }, true);

    // keyboard (Enter / Spasi)
    document.addEventListener('keydown', function (e) {
      if (e.repeat || (e.key !== 'Enter' && e.key !== ' ')) return;
      var el = target(e);
      if (!el || el.disabled || spasiLink(e, el)) return;
      var r = el.getBoundingClientRect();
      ripple(el, r.left + r.width / 2, r.top + r.height / 2);
      down(kindOf(el));
    }, true);
    document.addEventListener('keyup', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var el = target(e);
      if (el && !el.disabled && !spasiLink(e, el)) up(kindOf(el));
    }, true);

    // iOS / Safari: audio baru aktif setelah ada sentuhan
    ['touchend', 'click'].forEach(function (n) {
      document.addEventListener(n, function () { if (!muted) ctx(); }, { capture: true, passive: true });
    });

    function toast(msg) {
      if (!toastEl) return;
      toastEl.textContent = msg;
      toastEl.classList.add('show');
      clearTimeout(toastT);
      toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2800);
    }

    /* tombol suara nyala / mati */
    function paintSfx() {
      sfxBtn.setAttribute('aria-pressed', String(!muted));
      sfxBtn.setAttribute('aria-label', 'Suara tombol: ' + (muted ? 'mati' : 'nyala'));
    }
    if (sfxBtn) {
      paintSfx();
      sfxBtn.addEventListener('click', function () {
        muted = !muted;
        try { localStorage.setItem('sfxMuted', muted ? '1' : '0'); } catch (e) {}
        paintSfx();
        toast(muted ? 'Suara tombol dimatikan' : 'Suara tombol dinyalakan');
        if (!muted) down('icon');
      });
    }

    /* tombol Preview & File GitHub: link diisi lewat data-preview / data-repo di index.html */
    [].slice.call(document.querySelectorAll('.card[data-preview], .card[data-repo]')).forEach(function (card) {
      [].slice.call(card.querySelectorAll('[data-act]')).forEach(function (a) {
        var act = a.getAttribute('data-act');
        var url = (card.getAttribute('data-' + act) || '').trim();
        if (/^https?:\/\//i.test(url)) {
          a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        } else {
          a.href = '#';
          a.classList.add('pending');
          a.addEventListener('click', function (e) {
            e.preventDefault();
            toast((act === 'preview' ? 'Link preview' : 'Link GitHub') + ' belum diisi. Isi data-' + act + ' di index.html.');
          });
        }
      });
    });
  })();

  document.getElementById('thn').textContent = new Date().getFullYear();
})();
