/* gallery 3d: soft floating archive plates behind the editorial grid, plus pointer tilt on photos.
   The tilt is plain JS and always runs; the WebGL backdrop loads three.js from the CDN and
   silently stays off if the CDN is unreachable - the page works the same without it. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Pointer tilt on photo frames and the portrait card (hover-capable devices only) */
  if (!reduce && matchMedia('(hover: hover)').matches) {
    var MAX = 5;
    document.querySelectorAll('.gallery-item .img-frame, .portrait-card').forEach(function (el) {
      var raf = null;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.style.transform = 'perspective(700px) rotateX(' + (-y * MAX).toFixed(2) + 'deg) rotateY(' + (x * MAX).toFixed(2) + 'deg)';
        });
      });
      el.addEventListener('pointerleave', function () {
        if (raf) cancelAnimationFrame(raf);
        el.style.transform = '';
      });
    });
  }

  /* 2. Floating 3D archive plates behind the page */
  import('https://unpkg.com/three@0.169.0/build/three.module.js').then(function (THREE) {
    var canvas = document.createElement('canvas');
    canvas.id = 'g-3d';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0); // transparent: solid pastel objects over the cream page

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 12);
    var root = new THREE.Group();
    scene.add(root);

    var CREAM = 0xfffdf6, TERRA = 0xc84b31, INK = 0x141413, MUTED = 0x9a9890, PEACH = 0xe9c3b2;
    function mat(color, rough) { return new THREE.MeshStandardMaterial({ color: color, roughness: rough == null ? 0.6 : rough, metalness: 0.04 }); }

    /* an "archive plate": a cream frame with a coloured inset, like a mounted photo */
    function plate(w, h, insetColor) {
      var g = new THREE.Group();
      var frame = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.09), mat(CREAM, 0.5));
      var inset = new THREE.Mesh(new THREE.BoxGeometry(w * 0.82, h * 0.78, 0.05), mat(insetColor, 0.7));
      inset.position.z = 0.05;
      g.add(frame); g.add(inset);
      return g;
    }

    var mob = innerWidth < 700;
    var specs = [
      { w: 2.6, h: 1.9, c: TERRA, p: [-4.6, 2.2, -1.5], r: [0.06, -0.3, 0.08] },
      { w: 1.7, h: 2.2, c: INK,   p: [4.4, 1.2, -2.0],  r: [-0.04, 0.35, -0.06] },
      { w: 2.1, h: 1.5, c: MUTED, p: [-3.6, -1.6, -1.0], r: [0.1, 0.25, -0.1] },
      { w: 1.5, h: 1.5, c: PEACH, p: [3.4, -2.2, -0.5], r: [-0.08, -0.3, 0.12] },
      { w: 1.1, h: 1.4, c: TERRA, p: [0.4, 3.0, -2.5],  r: [0.12, 0.15, 0.05] },
      { w: 1.2, h: 0.9, c: INK,   p: [-0.6, -3.2, -2.0], r: [-0.1, -0.2, -0.08] }
    ];
    if (mob) specs = specs.slice(0, 4); // fewer plates on phones
    var plates = specs.map(function (s) {
      var p = plate(s.w, s.h, s.c);
      p.position.set(s.p[0], s.p[1], s.p[2]);
      p.rotation.set(s.r[0], s.r[1], s.r[2]);
      p.userData = { bx: s.p[0], y: s.p[1], ph: Math.random() * 6.28, sp: 0.25 + Math.random() * 0.3 };
      root.add(p);
      return p;
    });

    /* two quiet accents */
    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.05, 16, 64), mat(TERRA, 0.45));
    ring.position.set(4.6, -0.6, -1.2); ring.rotation.x = 1.1; root.add(ring);
    var dot = new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 20), mat(INK, 0.35));
    dot.position.set(-4.9, 0.4, -0.8); root.add(dot);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xf6f4f0, 1.5));
    var key = new THREE.DirectionalLight(0xfff2e0, 1.1);
    key.position.set(4, 6, 8); scene.add(key);

    var W = 0, H = 0, px = 0, py = 0;
    function resize() {
      W = innerWidth; H = innerHeight; mob = W < 700;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.position.z = mob ? 15 : 12;
      // pull the plates into the narrow phone frame (fixed x offsets are tuned for desktop width)
      var sx = mob ? 0.45 : 1;
      plates.forEach(function (p) { p.position.x = p.userData.bx * sx; });
      ring.position.x = 4.6 * sx; dot.position.x = -4.9 * sx;
      camera.updateProjectionMatrix();
    }
    addEventListener('resize', resize); resize();
    addEventListener('pointermove', function (e) {
      px = (e.clientX / W - 0.5) * 2; py = (e.clientY / H - 0.5) * 2;
    }, { passive: true });

    function frame(t) {
      requestAnimationFrame(frame);
      if (document.hidden) return;
      var tx = reduce ? 0 : px, ty = reduce ? 0 : py;
      camera.position.x += (tx * 0.9 - camera.position.x) * 0.03;
      camera.position.y += (-ty * 0.55 - camera.position.y) * 0.03;
      root.position.y = scrollY * 0.00035; // gentle parallax against the scrolling grid
      if (!reduce) {
        plates.forEach(function (p) {
          var u = p.userData;
          p.position.y = u.y + Math.sin(t * 0.0004 * u.sp * 4 + u.ph) * 0.28;
          p.rotation.y += 0.0009; p.rotation.x += 0.0004;
        });
        ring.rotation.z = t * 0.0002;
      }
      renderer.render(scene, camera);
    }
    if (reduce) { renderer.render(scene, camera); addEventListener('resize', function () { renderer.render(scene, camera); }); }
    else requestAnimationFrame(frame);
  }).catch(function () { /* CDN unreachable: the gallery works without the 3D backdrop */ });
})();
