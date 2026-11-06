/* Sarang Vehale, research portfolio. Self-hosted, no dependencies.
   Everything geometric on the page is drawn here: the Bloch sphere on the
   Nataraja's ring, the Sri Yantra, the teleportation circuit, the entropy
   curve, the channel, the surface code, the lattice, the kolam. */
document.documentElement.classList.add("js");

(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const f = (n) => +n.toFixed(2);

  function el(parent, tag, attrs = {}, text) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    parent.appendChild(n);
    return n;
  }
  const draw = (n) => n;
  function starPoints(cx, cy, r) {
    const p = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const q = i % 2 ? r * 0.42 : r;
      p.push(f(cx + q * Math.cos(a)) + "," + f(cy + q * Math.sin(a)));
    }
    return p.join(" ");
  }

  /* ---- Bloch sphere drawn on the bronze ring ---- */
  function bloch(svg) {
    const W = 1100, H = 1380, C = { x: 556, y: 519 }, R = 372, TILT = 0.24;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    // circles that keep going past the art and under the text
    for (const r of [448, 610, 860, 1180]) {
      el(svg, "circle", { class: "g-soft", cx: C.x, cy: C.y, r });
    }
    // protractor ticks just outside the flames
    const T = 462;
    for (let d = 0; d < 360; d += 7.5) {
      const a = (d * Math.PI) / 180;
      const long = d % 90 === 0, mid = d % 30 === 0;
      const r2 = T + (long ? 26 : mid ? 14 : 7);
      el(svg, "line", {
        class: mid ? "g-line" : "g-soft",
        x1: f(C.x + T * Math.cos(a)), y1: f(C.y + T * Math.sin(a)),
        x2: f(C.x + r2 * Math.cos(a)), y2: f(C.y + r2 * Math.sin(a)),
      });
    }
    // axes
    el(svg, "line", { class: "g-line", x1: C.x, y1: C.y - 500, x2: C.x, y2: C.y + R + 8 });
    el(svg, "line", { class: "g-soft g-dash", x1: C.x - 620, y1: C.y, x2: C.x + 620, y2: C.y });
    // equator: dashed behind, solid in front
    el(svg, "path", { class: "g-line g-dash", d: `M${C.x - R} ${C.y} A${R} ${R * TILT} 0 0 1 ${C.x + R} ${C.y}` });
    el(svg, "path", { class: "g-strong", d: `M${C.x - R} ${C.y} A${R} ${R * TILT} 0 0 0 ${C.x + R} ${C.y}` });
    const lab = (x, y, t, s = 44) => el(svg, "text", { class: "g-ket", x, y, "font-size": s, "text-anchor": "middle" }, t);
    lab(C.x, C.y - 512, "|0⟩");
    lab(C.x + 56, C.y + R - 30, "|1⟩", 34);
    el(svg, "text", { class: "g-text", x: C.x + 630, y: C.y + 5, "font-size": 16 }, "y");
    el(svg, "text", { class: "g-text", x: C.x - 650, y: C.y + 5, "font-size": 16 }, "x");
    // moving state
    const TH = 0.92;
    const lat = el(svg, "ellipse", {
      class: "g-soft g-dash", cx: C.x, cy: f(C.y - R * Math.cos(TH) * Math.sqrt(1 - TILT * TILT)),
      rx: f(R * Math.sin(TH)), ry: f(R * Math.sin(TH) * TILT),
    });
    const vec = el(svg, "line", { class: "g-strong", x1: C.x, y1: C.y });
    const drop = el(svg, "line", { class: "g-line g-dash" });
    const tip = el(svg, "polygon", { class: "g-star" });
    const psi = el(svg, "text", { class: "g-ket", "font-size": 42 }, "|ψ⟩");
    function place(phi) {
      const sx = R * Math.sin(TH) * Math.cos(phi);
      const sy = R * Math.sin(TH) * Math.sin(phi);
      const x = C.x + sx, y = +lat.getAttribute("cy") + sy * TILT;
      vec.setAttribute("x2", f(x)); vec.setAttribute("y2", f(y));
      drop.setAttribute("x1", f(x)); drop.setAttribute("y1", f(y));
      drop.setAttribute("x2", f(x)); drop.setAttribute("y2", f(C.y + sy * TILT));
      tip.setAttribute("points", starPoints(x, y, 17));
      psi.setAttribute("x", f(x + 24)); psi.setAttribute("y", f(y - 14));
    }
    place(0.5);
    if (REDUCED) return;
    // slow precession, 20 fps, off while scrolling or out of view
    let phi = 0.5, last = 0, visible = true, scrolling = 0;
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible) requestAnimationFrame(tick); }).observe(svg);
    addEventListener("scroll", () => { scrolling = performance.now(); }, { passive: true });
    function tick(t) {
      if (!visible) return;
      if (t - last > 50 && t - scrolling > 180) {
        phi += ((t - last) / 1000) * 0.35;
        place(phi);
        last = t;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---- Sri Yantra: nine interlocking triangles with lotus and gates ---- */
  function yantra(svg) {
    svg.setAttribute("viewBox", "-1.72 -1.72 3.44 3.44");
    const g = el(svg, "g", {});
    // [apex y, base y, half width], in units of the inner circle, y up
    const tri = [
      [1, -0.25, 0.968], [0.56, -0.47, 0.8], [0.02, -0.69, 0.55], [0.39, -0.1, 0.38],
      [-1, 0.25, 0.968], [-0.6, 0.43, 0.8], [-0.07, 0.66, 0.57], [-0.57, 0.07, 0.5], [-0.33, -0.07 + 0.14, 0.2],
    ];
    for (const [a, b, w] of tri) {
      draw(el(g, "polygon", { class: "g-line", points: `0,${-a} ${w},${-b} ${-w},${-b}` }));
    }
    el(g, "circle", { class: "g-fill", cx: 0, cy: 0, r: 0.012 });
    for (const r of [1.02, 1.04]) draw(el(g, "circle", { class: "g-line", r }));
    const petals = (n, r0, r1, off) => {
      for (let i = 0; i < n; i++) {
        const a0 = off + (i * 2 * Math.PI) / n, a1 = off + ((i + 1) * 2 * Math.PI) / n, m = (a0 + a1) / 2;
        const P = (r, a) => f2(r * Math.cos(a)) + " " + f2(r * Math.sin(a));
        draw(el(g, "path", {
          class: "g-line",
          d: `M${P(r0, a0)} Q${P(r0 + (r1 - r0) * 0.72, a0 + (m - a0) * 0.28)} ${P(r1, m)} Q${P(r0 + (r1 - r0) * 0.72, a1 - (a1 - m) * 0.28)} ${P(r0, a1)}`,
        }));
      }
    };
    const f2 = (n) => +n.toFixed(4);
    petals(8, 1.04, 1.26, Math.PI / 8);
    draw(el(g, "circle", { class: "g-line", r: 1.28 }));
    petals(16, 1.28, 1.42, 0);
    for (const r of [1.44, 1.46, 1.48]) draw(el(g, "circle", { class: "g-soft", r }));
    // bhupura: three nested squares with four gates
    for (const s of [1.56, 1.61, 1.66]) {
      const gw = 0.24, gd = 0.1;
      const side = [[-s, -s], [-gw, -s], [-gw, -s - gd], [gw, -s - gd], [gw, -s], [s, -s]];
      let pts = [];
      for (let q = 0; q < 4; q++) {
        const c = Math.cos((q * Math.PI) / 2), n = Math.sin((q * Math.PI) / 2);
        for (const [x, y] of side) pts.push(f2(x * c - y * n) + "," + f2(x * n + y * c));
      }
      draw(el(g, "polygon", { class: "g-soft", points: pts.join(" ") }));
    }
  }

  /* ---- Quantum teleportation circuit, wires run off both page edges ---- */
  function circuit(svg) {
    svg.setAttribute("viewBox", "0 0 1200 112");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    const y = [18, 56, 94];
    // wires run off the left edge; only the teleported qubit runs off the right
    el(svg, "line", { class: "g-line", x1: -2600, y1: y[0], x2: 604, y2: y[0] });
    el(svg, "line", { class: "g-line", x1: -2600, y1: y[1], x2: 604, y2: y[1] });
    el(svg, "line", { class: "g-line", x1: -2600, y1: y[2], x2: 3800, y2: y[2] });
    // after measurement a qubit is classical: double line
    for (const [q, end] of [[0, 860], [1, 760]]) {
      for (const dy of [-2, 2]) el(svg, "line", { class: "g-soft", x1: 636, y1: y[q] + dy, x2: end, y2: y[q] + dy });
    }
    const box = (x, q, t) => {
      el(svg, "rect", { class: "g-box", x: x - 15, y: y[q] - 13, width: 30, height: 26 });
      el(svg, "text", { class: "g-text", x, y: y[q] + 5, "text-anchor": "middle" }, t);
    };
    const cnot = (x, c, tg) => {
      el(svg, "line", { class: "g-strong", x1: x, y1: y[c], x2: x, y2: y[tg] + (tg > c ? 9 : -9) });
      el(svg, "circle", { class: "g-fill", cx: x, cy: y[c], r: 4 });
      el(svg, "circle", { class: "g-box", cx: x, cy: y[tg], r: 9 });
      el(svg, "line", { class: "g-strong", x1: x - 9, y1: y[tg], x2: x + 9, y2: y[tg] });
      el(svg, "line", { class: "g-strong", x1: x, y1: y[tg] - 9, x2: x, y2: y[tg] + 9 });
    };
    const meter = (x, q) => {
      el(svg, "rect", { class: "g-box", x: x - 16, y: y[q] - 13, width: 32, height: 26 });
      el(svg, "path", { class: "g-line", d: `M${x - 10} ${y[q] + 7} A10 10 0 0 1 ${x + 10} ${y[q] + 7}` });
      el(svg, "line", { class: "g-line", x1: x, y1: y[q] + 7, x2: x + 8, y2: y[q] - 7 });
    };
    const ctrlGate = (x, q, tg, t) => {
      // classically controlled correction: double wire from the measurement
      el(svg, "line", { class: "g-soft", x1: x - 2, y1: y[q], x2: x - 2, y2: y[tg] - 13 });
      el(svg, "line", { class: "g-soft", x1: x + 2, y1: y[q], x2: x + 2, y2: y[tg] - 13 });
      el(svg, "circle", { class: "g-fill", cx: x, cy: y[q], r: 4 });
      box(x, tg, t);
    };
    const K = (x, q, t) => el(svg, "text", { class: "g-ket", x, y: y[q] + 6, "font-size": 19, "text-anchor": "end" }, t);
    const pad = (x, q) => el(svg, "rect", { x: x - 54, y: y[q] - 13, width: 58, height: 26, fill: "#000" });
    [0, 1, 2].forEach((q) => pad(170, q));
    K(170, 0, "|ψ⟩"); K(170, 1, "|0⟩"); K(170, 2, "|0⟩");
    box(240, 1, "H"); cnot(320, 1, 2); cnot(440, 0, 1); box(520, 0, "H");
    meter(620, 0); meter(620, 1);
    ctrlGate(760, 1, 2, "X"); ctrlGate(860, 0, 2, "Z");
    pad(1000, 2); K(1000, 2, "|ψ⟩");
  }

  /* ---- Binary entropy, plain mathematics ---- */
  const H2 = (p) => (p <= 0 || p >= 1 ? 0 : -p * Math.log2(p) - (1 - p) * Math.log2(1 - p));
  function curvePath(x0, y0, w, h) {
    let d = "";
    for (let i = 0; i <= 200; i++) {
      const p = i / 200;
      d += (i ? "L" : "M") + f(x0 + p * w) + " " + f(y0 - H2(p) * h);
    }
    return d;
  }
  function entropyLarge(svg) {
    svg.setAttribute("viewBox", "0 0 640 480");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    const x0 = 56, y0 = 400, w = 520, h = 320;
    el(svg, "line", { class: "g-soft", x1: -400, y1: y0, x2: 1000, y2: y0 });
    el(svg, "line", { class: "g-soft", x1: x0, y1: y0 + 20, x2: x0, y2: y0 - h - 30 });
    draw(el(svg, "path", { class: "g-strong", d: curvePath(x0, y0, w, h) }));
    // 1 - H2: the capacity of the binary symmetric channel
    let d = "";
    for (let i = 0; i <= 200; i++) { const p = i / 200; d += (i ? "L" : "M") + f(x0 + p * w) + " " + f(y0 - (1 - H2(p)) * h); }
    draw(el(svg, "path", { class: "g-line g-dash", d }));
    const T = (x, y, t, a = "start") => el(svg, "text", { class: "g-text g-halo", x, y, "text-anchor": a }, t);
    for (const [p, l] of [[0, "0"], [0.5, "1/2"], [1, "1"]]) {
      el(svg, "line", { class: "g-line", x1: x0 + p * w, y1: y0, x2: x0 + p * w, y2: y0 + 7 });
      T(x0 + p * w, y0 + 24, l, "middle");
    }
    T(x0 + 34, y0 - h * 0.62, "H₂(p)", "end");
    T(x0 + w + 8, y0 - h + 10, "1 − H₂(p)", "end");
    T(x0 + w + 16, y0 - 8, "p");
  }
  function entropySmall(svg) {
    svg.setAttribute("viewBox", "0 0 96 56");
    el(svg, "line", { class: "g-soft", x1: 2, y1: 50, x2: 94, y2: 50 });
    draw(el(svg, "path", { class: "g-strong", d: curvePath(6, 50, 84, 44) }));
  }
  function channelSmall(svg) {
    svg.setAttribute("viewBox", "0 0 96 56");
    const y = 28;
    el(svg, "line", { class: "g-line", x1: 0, y1: y, x2: 96, y2: y });
    [["E", 22], ["N", 48], ["D", 74]].forEach(([t, x]) => {
      el(svg, "rect", { class: "g-box", x: x - 9, y: y - 9, width: 18, height: 18 });
      el(svg, "text", { class: "g-text", x, y: y + 4, "text-anchor": "middle", "font-size": 11 }, t);
    });
    // environment leak out of the channel
    el(svg, "line", { class: "g-line g-dash", x1: 48, y1: y - 9, x2: 48, y2: 4 });
  }

  /* ---- Surface code, distance d ---- */
  function surface(svg, d, opts = {}) {
    const s = 20, m = s;
    const size = (d - 1) * s + 2 * m;
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    for (let r = 0; r < d - 1; r++) {
      for (let c = 0; c < d - 1; c++) {
        const x = m + c * s, y = m + r * s;
        if ((r + c) % 2 === 0) el(svg, "rect", { class: "g-tint", x, y, width: s, height: s });
        else el(svg, "rect", { class: "g-soft", x, y, width: s, height: s });
      }
    }
    // weight-two checks on the boundary
    for (let i = 0; i < d - 1; i++) {
      const p = m + i * s;
      if (i % 2 === 1) {
        el(svg, "path", { class: "g-tint", d: `M${p} ${m} A${s / 2} ${s / 2} 0 0 1 ${p + s} ${m} Z` });
        el(svg, "path", { class: "g-tint", d: `M${p + s} ${m + (d - 1) * s} A${s / 2} ${s / 2} 0 0 1 ${p} ${m + (d - 1) * s} Z`.replace(/^M(\S+ \S+)/, "M$1") });
      } else {
        el(svg, "path", { class: "g-soft", d: `M${m} ${p + s} A${s / 2} ${s / 2} 0 0 1 ${m} ${p} Z` });
        el(svg, "path", { class: "g-soft", d: `M${m + (d - 1) * s} ${p} A${s / 2} ${s / 2} 0 0 1 ${m + (d - 1) * s} ${p + s} Z` });
      }
    }
    for (let r = 0; r < d; r++) {
      for (let c = 0; c < d; c++) {
        el(svg, "circle", { class: "g-fill", cx: m + c * s, cy: m + r * s, r: opts.dot || 2.2 });
      }
    }
  }

  /* ---- Lattice with Babai rounding ---- */
  function lattice(svg) {
    svg.setAttribute("viewBox", "0 0 400 250");
    const b1 = [62, 10], b2 = [24, -58], O = [150, 160];
    const P = (i, j) => [O[0] + i * b1[0] + j * b2[0], O[1] + i * b1[1] + j * b2[1]];
    const inb = ([x, y]) => x > -10 && x < 410 && y > -10 && y < 260;
    for (let j = -4; j <= 5; j++) {
      const a = P(-8, j), c = P(8, j);
      el(svg, "line", { class: "g-soft", x1: a[0], y1: a[1], x2: c[0], y2: c[1] });
    }
    for (let i = -8; i <= 8; i++) {
      const a = P(i, -6), c = P(i, 7);
      el(svg, "line", { class: "g-soft", x1: a[0], y1: a[1], x2: c[0], y2: c[1] });
    }
    for (let i = -8; i <= 8; i++) for (let j = -4; j <= 5; j++) {
      const p = P(i, j);
      if (inb(p)) el(svg, "circle", { class: "g-fill", cx: p[0], cy: p[1], r: 2.1, opacity: 0.8 });
    }
    const arrow = (a, b, cls = "g-strong") => el(svg, "line", { class: cls, x1: a[0], y1: a[1], x2: b[0], y2: b[1] });
    arrow(O, P(1, 0)); arrow(O, P(0, 1));
    const T = (p, t, dx = 6, dy = -6) => el(svg, "text", { class: "g-text", x: p[0] + dx, y: p[1] + dy }, t);
    T(P(1, 0), "b₁", -2, 16); T(P(0, 1), "b₂", -22, 0);
    // a target and the lattice point Babai's rounding returns for it
    const t = [292, 62];
    const det = b1[0] * b2[1] - b1[1] * b2[0];
    const u = (t[0] - O[0]), v = (t[1] - O[1]);
    const i = Math.round((u * b2[1] - v * b2[0]) / det), j = Math.round((b1[0] * v - b1[1] * u) / det);
    const near = P(i, j);
    el(svg, "circle", { class: "g-line", cx: near[0], cy: near[1], r: 7 });
    arrow(t, near, "g-line g-dash");
    el(svg, "polygon", { class: "g-fill", points: starPoints(t[0], t[1], 6) });
    T(t, "t", 8, -4);
  }

  /* ---- Kolam: a billiard path on a dot grid, one unbroken line ---- */
  function kolam(svg, m, n) {
    const s = 40;
    svg.setAttribute("viewBox", `${-s / 2} ${-s / 2} ${m * s + s} ${n * s + s}`);
    // walk a ray at 45 degrees; coprime m and n give a single closed loop
    let x = 0, y = 1, dx = 1, dy = 1;
    const pts = [];
    const lim = 8 * m * n;
    for (let i = 0; i < lim; i++) {
      pts.push([x, y]);
      x += dx; y += dy;
      if (x === 0 || x === 2 * m) dx = -dx;
      if (y === 0 || y === 2 * n) dy = -dy;
      if (x === 0 && y === 1 && dx === 1 && dy === 1) break;
    }
    const c = (p) => [p[0] * s * 0.5, p[1] * s * 0.5];
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let d = "";
    pts.forEach((p, i) => {
      const a = c(p), b = c(pts[(i + 1) % pts.length]);
      const q = mid(a, b);
      d += (i === 0 ? `M${f(q[0])} ${f(q[1])}` : `Q${f(a[0])} ${f(a[1])} ${f(q[0])} ${f(q[1])}`);
    });
    const a0 = c(pts[0]), q0 = mid(a0, c(pts[1]));
    d += `Q${f(a0[0])} ${f(a0[1])} ${f(q0[0])} ${f(q0[1])}`;
    el(svg, "path", { d, fill: "none", stroke: "currentColor", "stroke-width": 2.4, "stroke-linejoin": "round" });
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) {
      el(svg, "circle", { class: "g-fill", cx: s / 2 + i * s, cy: s / 2 + j * s, r: 2.6 });
    }
  }

  /* ---- Seigaiha: overlapping concentric circles, drawn back to front ---- */
  function seigaiha(svg) {
    const r = 46, W = 1920, H = 260, dx = r * 2, dy = r * 0.5;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMax slice");
    const defs = el(svg, "defs", {});
    const sym = el(defs, "g", { id: "sg" });
    el(sym, "circle", { r, fill: "#000", stroke: "currentColor", "stroke-width": 1 });
    for (const q of [0.78, 0.56, 0.34, 0.12]) el(sym, "circle", { r: r * q, fill: "none", stroke: "currentColor", "stroke-width": 1 });
    let row = 0;
    for (let cy = 0; cy <= H + r; cy += dy, row++) {
      for (let cx = (row % 2 ? r : 0) - dx; cx <= W + dx; cx += dx) {
        el(svg, "use", { href: "#sg", x: cx, y: cy });
      }
    }
  }

  /* ---- Barcode for the poster: the bits of a name ---- */
  function barcode(svg, text) {
    let bits = "";
    for (const ch of text) bits += ch.charCodeAt(0).toString(2).padStart(8, "0") + "01";
    svg.setAttribute("viewBox", `0 0 ${bits.length} 10`);
    svg.setAttribute("preserveAspectRatio", "none");
    bits.split("").forEach((b, i) => {
      if (b === "1") el(svg, "rect", { class: "g-fill", x: i, y: 0, width: 0.72, height: 10 });
    });
  }

  /* ---- A split keyboard, for the uses page ---- */
  function keyboard(svg) {
    svg.setAttribute("viewBox", "0 0 760 420");
    const u = 46, gap = 6, stag = [14, 6, 0, 6, 12, 16];
    const half = (ox, mirror) => {
      for (let c = 0; c < 6; c++) {
        for (let r = 0; r < 3; r++) {
          const cc = mirror ? 5 - c : c;
          el(svg, "rect", { class: "g-line", x: ox + cc * (u + gap), y: 60 + stag[c] + r * (u + gap), width: u, height: u, rx: 5 });
        }
      }
      for (let t = 0; t < 3; t++) {
        const x = mirror ? ox + t * (u + gap) - 10 : ox + (3 + t) * (u + gap) + 10;
        el(svg, "rect", { class: "g-strong", x, y: 60 + 3 * (u + gap) + 24 + (mirror ? (2 - t) : t) * 8, width: u, height: u, rx: 5 });
      }
    };
    half(20, false);
    half(420, true);
    el(svg, "text", { class: "g-text", x: 380, y: 404, "text-anchor": "middle", opacity: 0.6 }, "split, column-staggered, three thumb keys a side");
  }

  /* ---- photo lightbox ---- */
  function photos() {
    const dlg = $("#photo-lb");
    if (!dlg) return;
    const img = $("img", dlg), cap = $(".plb-cap", dlg);
    $$(".ph-btn").forEach((b) => b.addEventListener("click", () => {
      img.src = b.dataset.full; img.alt = b.dataset.cap; cap.textContent = b.dataset.cap;
      dlg.showModal();
    }));
    $(".lb-close", dlg).addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  }

  function drawGeometry() {
    const map = {
      bloch, yantra, circuit,
      entropy: entropyLarge, "entropy-sm": entropySmall, channel: channelSmall,
      lattice,
      surface: (s) => surface(s, +s.dataset.d || 5, { dot: +s.dataset.dot || 2.2 }),
      kolam: (s) => kolam(s, +s.dataset.m || 7, +s.dataset.n || 5),
      seigaiha, keyboard,
      barcode: (s) => barcode(s, s.dataset.text || "SARANG"),
    };
    $$("svg[data-geo]").forEach((s) => map[s.dataset.geo] && map[s.dataset.geo](s));
  }

  /* ---- reveals: opacity and transform only ---- */
  function reveals() {
    const items = $$(".reveal,.draw");
    if (REDUCED || !("IntersectionObserver" in window)) {
      items.forEach((n) => n.classList.add("on"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      let k = 0;
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const n = e.target;
        if (n.classList.contains("reveal")) {
          n.animate(
            [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }],
            { duration: 460, delay: 60 * k++, easing: "cubic-bezier(.215,.61,.355,1)", fill: "backwards" }
          );
        }
        n.classList.add("on");
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.04 });
    items.forEach((n) => io.observe(n));
  }

  /* ---- header state, spine, current section ---- */
  function chrome() {
    const hdr = $(".hdr");
    if (!hdr) return;
    const onScroll = () => hdr.classList.toggle("solid", scrollY > 24);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const burger = $(".burger");
    burger.addEventListener("click", () => {
      const open = hdr.classList.toggle("open");
      burger.setAttribute("aria-expanded", open);
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    $$(".menu a").forEach((a) => a.addEventListener("click", () => {
      hdr.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }));
    const tabs = $$(".spine-tab");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        tabs.forEach((t) => t.setAttribute("aria-current", t.getAttribute("href") === "#" + e.target.id ? "true" : "false"));
      });
    }, { rootMargin: "-48% 0px -48% 0px" });
    $$("main [id]").filter((n) => n.matches("section,header")).forEach((s) => io.observe(s));
  }

  /* ---- 01 gallery and its lightbox ---- */
  function gallery() {
    const frame = $(".frame");
    if (!frame) return;
    const thumbs = $$(".frame-thumb button");
    const imgs = $$(".frame-img", frame);
    const sheet = $(".frame-sheet", frame);
    const sheetImg = $("img", sheet);
    const openK = $(".frame-open__k", frame);
    const labelEl = $(".frame-label", frame);
    const tag = $(".frame-copy .tag");
    const note = $(".frame-note");
    const count = $(".frame-count");
    const lb = $("#lightbox");
    const lbPanel = $(".lb-panel", lb);
    const lbCap = $(".lb-cap", lb);
    let cur = 0, front = 0, seq = 0;

    function show(i, focus) {
      cur = (i + thumbs.length) % thumbs.length;
      const d = thumbs[cur].dataset;
      thumbs.forEach((t, k) => t.setAttribute("aria-pressed", k === cur));
      // cross-fade once the new image can paint; a newer click cancels this one
      const token = ++seq;
      const back = imgs[1 - front];
      back.alt = d.alt;
      back.src = d.art;
      const swap = () => {
        if (token !== seq) return;
        imgs.forEach((im) => im.classList.toggle("is-on", im === back));
        front = imgs.indexOf(back);
      };
      back.decode().then(swap, swap);
      if (d.cert) {
        sheet.classList.remove("is-text");
        sheetImg.src = d.cert + "-t.webp";
        openK.textContent = "Open certificate";
      } else {
        sheet.classList.add("is-text");
        openK.textContent = "Open record";
      }
      if (labelEl) labelEl.textContent = d.label;
      tag.textContent = String(cur + 1).padStart(2, "0") + " // " + d.tag;
      note.textContent = d.note;
      count.textContent = cur + 1 + " / " + thumbs.length;
      // warm the neighbour so stepping never flashes
      new Image().src = thumbs[(cur + 1) % thumbs.length].dataset.art;
      if (focus) thumbs[cur].focus({ preventScroll: true });
      const strip = thumbs[cur].closest(".strip");
      if (strip && strip.scrollWidth > strip.clientWidth) {
        strip.scrollTo({ left: thumbs[cur].parentElement.offsetLeft - strip.offsetLeft, behavior: "smooth" });
      }
    }
    function open() {
      const d = thumbs[cur].dataset;
      lbPanel.textContent = "";
      const art = document.createElement("img");
      art.className = "lb-art"; art.src = d.art; art.alt = "";
      lbPanel.appendChild(art);
      const lt = document.createElement("span");
      lt.className = "imgtag imgtag--bl"; lt.textContent = d.label;
      lbPanel.appendChild(lt);
      if (d.cert) {
        const c = document.createElement("img");
        c.className = "lb-cert";
        c.src = d.cert + ".webp";
        c.alt = "Certificate: " + d.note;
        lbPanel.appendChild(c);
      } else {
        const n = document.createElement("p");
        n.className = "lb-none";
        n.textContent = d.nocert;
        lbPanel.appendChild(n);
      }
      lbCap.textContent = "";
      const rec = document.getElementById(d.record);
      if (rec) lbCap.appendChild(rec.cloneNode(true)).removeAttribute("id");
      lb.showModal();
      lbCap.scrollTop = 0;
    }
    thumbs.forEach((t, i) => t.addEventListener("click", () => show(i)));
    frame.addEventListener("click", open);
    $(".frame-prev").addEventListener("click", () => show(cur - 1));
    $(".frame-next").addEventListener("click", () => show(cur + 1));
    $(".strip").addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); show(cur + 1, true); }
      if (e.key === "ArrowLeft") { e.preventDefault(); show(cur - 1, true); }
    });
    $(".lb-close", lb).addEventListener("click", () => lb.close());
    lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
    show(0);
  }

  /* ---- 03 ledger and manifest ---- */
  function manifest() {
    const dlg = $("#manifest");
    if (!dlg) return;
    const input = $(".mf-search input", dlg);
    const cells = $$(".mf-group", dlg);
    const empty = $(".mf-empty", dlg);
    const filter = () => {
      const q = input.value.trim().toLowerCase();
      let shown = 0;
      cells.forEach((c) => {
        const hit = !q || c.textContent.toLowerCase().includes(q);
        c.hidden = !hit;
        if (hit) shown++;
      });
      empty.hidden = shown !== 0;
      $(".mf-count", dlg).textContent = shown + " of " + cells.length;
    };
    input.addEventListener("input", filter);
    $(".mf-clear", dlg).addEventListener("click", () => { input.value = ""; filter(); input.focus(); });
    const open = (q) => {
      input.value = q || "";
      filter();
      dlg.showModal();
      $(".mf-body", dlg).scrollTop = 0;
    };
    $$(".ledger-btn").forEach((b) => b.addEventListener("click", () => open(b.dataset.q)));
    const ob = $(".open-btn");
    if (ob) ob.addEventListener("click", () => open(""));
    $(".mf-close", dlg).addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  }

  function init() {
    drawGeometry();
    chrome();
    gallery();
    manifest();
    photos();
    reveals();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
