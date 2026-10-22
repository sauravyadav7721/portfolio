(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* footer year */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* hero name: split into letters for the entrance animation */
  var idx = 0;
  document.querySelectorAll(".hero-name .line").forEach(function (line) {
    var text = line.textContent;
    line.textContent = "";
    text.split("").forEach(function (c) {
      var s = document.createElement("span");
      s.className = "ch";
      s.style.setProperty("--i", idx++);
      s.textContent = c;
      line.appendChild(s);
    });
  });

  /* scroll progress bar */
  var bar = document.getElementById("progress-bar");
  function onScroll() {
    var max = doc.scrollHeight - window.innerHeight;
    var p = max > 0 ? window.scrollY / max : 0;
    if (bar) bar.style.transform = "scaleX(" + p + ")";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* section titles slide in once */
  var titles = document.querySelectorAll(".section-title");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var t = e.target.querySelector(".section-title");
          if (t) t.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px" });
    titles.forEach(function (t) { io.observe(t.closest("section") || t.parentElement); });
  } else {
    titles.forEach(function (t) { t.classList.add("in"); });
  }

  /* project accordion: one open at a time */
  var heads = document.querySelectorAll(".project-head");
  heads.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      heads.forEach(function (b) {
        b.setAttribute("aria-expanded", "false");
        document.getElementById(b.getAttribute("aria-controls")).classList.remove("open");
      });
      if (!open) {
        btn.setAttribute("aria-expanded", "true");
        document.getElementById(btn.getAttribute("aria-controls")).classList.add("open");
      }
    });
  });
  if (heads[0]) heads[0].click();

  /* hero landscape: ridgelines that rise toward the cursor */
  var canvas = document.getElementById("landscape");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var w = 0, h = 0, dpr = 1, running = true;
  var mouse = { x: -999, y: -999, sx: -999, sy: -999, active: false };
  var BG = "#F2F0FB", INK = "#17143F", BLUE = "#3B38F0";

  function resize() {
    var r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function wave(x, i, t) {
    return 14 * Math.sin(x * 0.006 + i * 0.25 + t * 0.5) +
           9 * Math.sin(x * 0.013 - i * 0.4 + t * 0.8) +
           6 * Math.sin(x * 0.027 + i * 0.9 - t * 0.3);
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    mouse.sx += (mouse.x - mouse.sx) * 0.08;
    mouse.sy += (mouse.y - mouse.sy) * 0.08;

    var inner = canvas.parentElement.querySelector(".hero-inner");
    var top = inner ? inner.offsetTop + inner.offsetHeight + 36 : h * 0.6;
    top = Math.min(top, h - 140);
    var gap = w < 700 ? 13 : 15;
    var rows = Math.ceil((h - top) / gap) + 4;
    var step = 7;
    var nearest = -1, best = 1e9;
    for (var i = 0; i < rows; i++) {
      var d = Math.abs(top + i * gap - mouse.sy);
      if (d < best) { best = d; nearest = i; }
    }

    for (var r = 0; r < rows; r++) {
      var y0 = top + r * gap;
      ctx.beginPath();
      for (var x = -step; x <= w + step; x += step) {
        var dx = x - mouse.sx, dy = y0 - mouse.sy;
        var bump = mouse.active ? -78 * Math.exp(-(dx * dx + dy * dy) / (2 * 120 * 120)) : 0;
        var u = w < 700 ? 0 : Math.max(0, (x / w - 0.48) / 0.52);
        var lift = u * u * (top - 96);
        var y = y0 - lift + wave(x, r, t) + bump;
        if (x === -step) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.lineTo(w + step, h + 30);
      ctx.lineTo(-step, h + 30);
      ctx.closePath();
      ctx.fillStyle = BG;
      ctx.fill();
      ctx.lineWidth = r === nearest && mouse.active ? 2.6 : 1.4;
      ctx.strokeStyle = r === nearest && mouse.active ? BLUE : INK;
      ctx.globalAlpha = r === nearest && mouse.active ? 1 : 0.85;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  function frame(ms) {
    if (running) draw(ms / 1000);
    if (!reduceMotion) requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", function () { resize(); if (reduceMotion) draw(0); });

  var hero = canvas.parentElement;
  hero.addEventListener("pointermove", function (e) {
    var r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    if (!mouse.active) { mouse.sx = mouse.x; mouse.sy = mouse.y; }
    mouse.active = true;
  });
  hero.addEventListener("pointerleave", function () { mouse.active = false; });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) { running = entries[0].isIntersecting; }).observe(hero);
  }

  if (reduceMotion) draw(0); else requestAnimationFrame(frame);
})();
