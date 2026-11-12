/* Portofolio Muhammad Rayyan Nafis – main.js
   Bagian: bintang 3D · objek 3D · pindah halaman · tab · game */
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

  /* ============ OBJEK 3D (wireframe, 1 path per lapisan, tanpa shadowBlur) ============ */
  var oc = document.getElementById('obj');
  var ox2 = oc.getContext('2d');
  var OW = 0, OH = 0, rx = .5, ry = 0, vrx = 0, vry = 0, drag = false, lx = 0, ly = 0, time = 0;
  var objVisible = true;

  var P = (1 + Math.sqrt(5)) / 2;
  var ico = [[-1, P, 0], [1, P, 0], [-1, -P, 0], [1, -P, 0], [0, -1, P], [0, 1, P], [0, -1, -P], [0, 1, -P], [P, 0, -1], [P, 0, 1], [-P, 0, -1], [-P, 0, 1]]
    .map(function (v) { var l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; });
  var icoE = [];
  for (var a = 0; a < 12; a++) for (var b = a + 1; b < 12; b++) {
    if (Math.hypot(ico[a][0] - ico[b][0], ico[a][1] - ico[b][1], ico[a][2] - ico[b][2]) < 1.06) icoE.push([a, b]);
  }
  var oct = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].map(function (v) { return [v[0] * .55, v[1] * .55, v[2] * .55]; });
  var octE = [[0, 2], [0, 3], [0, 4], [0, 5], [1, 2], [1, 3], [1, 4], [1, 5], [2, 4], [2, 5], [3, 4], [3, 5]];
  var RING = lite ? 28 : 40, ring = [];
  for (var k = 0; k < RING; k++) { var t = k / RING * 6.283; ring.push([Math.cos(t) * 1.45, 0, Math.sin(t) * 1.45]); }
  var orbs = [0, 2.094, 4.188];

  function sizeObj() {
    var r = oc.getBoundingClientRect();
    if (!r.width) return;
    var d = Math.min(devicePixelRatio || 1, lite ? 1.25 : 1.75);
    OW = r.width; OH = r.height;
    oc.width = OW * d; oc.height = OH * d;
    ox2.setTransform(d, 0, 0, d, 0, 0);
  }
  sizeObj();
  addEventListener('resize', sizeObj);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { objVisible = es[0].isIntersecting; }).observe(oc);
  }

  function rot(v, ax, ay, az) {
    var x = v[0], y = v[1], z = v[2], c = Math.cos(ax), s = Math.sin(ax), y1 = y * c - z * s, z1 = y * s + z * c;
    c = Math.cos(ay); s = Math.sin(ay);
    var x2 = x * c + z1 * s, z2 = -x * s + z1 * c;
    c = Math.cos(az); s = Math.sin(az);
    return [x2 * c - y1 * s, x2 * s + y1 * c, z2];
  }
  function proj(v, sc) { var z = v[2] + 3.2, k = 2.6 / z; return [OW / 2 + v[0] * sc * k, OH / 2 + v[1] * sc * k, z]; }

  oc.addEventListener('pointerdown', function (e) { drag = true; lx = e.clientX; ly = e.clientY; try { oc.setPointerCapture(e.pointerId); } catch (x) {} oc.style.cursor = 'grabbing'; });
  oc.addEventListener('pointermove', function (e) { if (!drag) return; vry += (e.clientX - lx) * .0016; vrx += (e.clientY - ly) * .0016; lx = e.clientX; ly = e.clientY; });
  function release() { drag = false; oc.style.cursor = 'grab'; }
  oc.addEventListener('pointerup', release);
  oc.addEventListener('pointercancel', release);

  // gambar semua garis lapisan belakang (redup) lalu depan (terang), masing-masing satu path
  function edges(V, E, col, w) {
    var mid = 3.2, pass, i, A, B;
    for (pass = 0; pass < 2; pass++) {
      ox2.globalAlpha = pass ? .95 : .3;
      ox2.lineWidth = w;
      ox2.strokeStyle = col;
      ox2.beginPath();
      for (i = 0; i < E.length; i++) {
        A = V[E[i][0]]; B = V[E[i][1]];
        if (((A[2] + B[2]) / 2 < mid) === !!pass) { ox2.moveTo(A[0], A[1]); ox2.lineTo(B[0], B[1]); }
      }
      ox2.stroke();
    }
  }

  function drawObj(dt) {
    if (!OW) return;
    time += .01 * dt;
    vry *= Math.pow(.94, dt); vrx *= Math.pow(.94, dt);
    rx += (.0045 + vrx) * dt;
    ry += (.0075 + vry + mouse.sx * .0012) * dt;
    ox2.clearRect(0, 0, OW, OH);
    ox2.lineCap = 'round';
    var sc = OW * .3, i;

    var V = ico.map(function (v) { return proj(rot(v, rx, ry, 0), sc); });
    edges(V, icoE, '#7fb0ff', 1.4);

    ox2.globalAlpha = .95; ox2.fillStyle = '#e6f0ff'; ox2.beginPath();
    for (i = 0; i < V.length; i++) { ox2.moveTo(V[i][0] + 2.2, V[i][1]); ox2.arc(V[i][0], V[i][1], 2.2, 0, 6.283); }
    ox2.fill();

    var V2 = oct.map(function (v) { return proj(rot(v, -rx * 1.6, -ry * 1.4, time), sc); });
    edges(V2, octE, '#3d77ff', 1.6);

    var R = ring.map(function (v) { return proj(rot(v, rx * .5 + 1.1, ry * .6, time * .5), sc); });
    ox2.globalAlpha = .4; ox2.lineWidth = 1; ox2.strokeStyle = '#7db4ff'; ox2.beginPath();
    ox2.moveTo(R[0][0], R[0][1]);
    for (i = 1; i < R.length; i++) ox2.lineTo(R[i][0], R[i][1]);
    ox2.closePath(); ox2.stroke();

    ox2.globalAlpha = 1; ox2.fillStyle = '#fff'; ox2.beginPath();
    for (i = 0; i < orbs.length; i++) {
      orbs[i] += (.012 + i * .004) * dt;
      var p = proj(rot([Math.cos(orbs[i]) * 1.45, 0, Math.sin(orbs[i]) * 1.45], rx * .5 + 1.1, ry * .6, time * .5), sc);
      ox2.moveTo(p[0] + 3.2, p[1]); ox2.arc(p[0], p[1], 3.2, 0, 6.283);
    }
    ox2.fill();
    ox2.globalAlpha = 1;
  }

  /* ============ LOOP (dibatasi fps, berhenti saat tab tidak aktif) ============ */
  var running = true, looping = false, last = 0, frameN = 0;
  var MIN_DT = lite ? 33 : 20;           // ~30fps (ringan) / ~50fps (normal)
  var OBJ_EVERY = lite ? 2 : 1;           // objek 3D lebih jarang digambar di perangkat ringan

  function loop(ts) {
    if (!running || reduce) { looping = false; return; }
    requestAnimationFrame(loop);
    var d = ts - last;
    if (d < MIN_DT) return;
    last = ts;
    var dt = Math.min(d, 50) / 16.7;
    frameN++;
    drawStars(dt);
    if (cur === 'home' && objVisible && frameN % OBJ_EVERY === 0) drawObj(dt * OBJ_EVERY);
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
    if (reduce) { drawStars(1); if (el.id === 'home') drawObj(1); }
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
  var foto = document.getElementById('fotoProfil');
  if (foto) {
    var FB = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 453"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#14224f"/><stop offset="1" stop-color="#0a1233"/></linearGradient></defs><rect width="340" height="453" fill="url(#g)"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-family="Inter,Arial,sans-serif" font-weight="800" font-size="120" fill="#4d8bff">RN</text></svg>');
    var pakaiFB = function () { if (foto.dataset.fb) return; foto.dataset.fb = '1'; foto.src = FB; };
    foto.addEventListener('error', pakaiFB);
    if (foto.complete && !foto.naturalWidth) pakaiFB();
  }

  document.getElementById('thn').textContent = new Date().getFullYear();
})();
