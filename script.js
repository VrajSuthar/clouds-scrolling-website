(() => {
  const FRAME_COUNT = 300;
  const FRAME_PATH = (i) => `assets/frames/frame_${String(i).padStart(4, "0")}.jpg`;

  const canvas = document.getElementById("scroll-canvas");
  const ctx = canvas.getContext("2d");
  const hero = document.querySelector(".hero");
  const loadingIndicator = document.getElementById("loading-indicator");
  const scrollHint = document.querySelector(".scroll-hint");

  const images = new Array(FRAME_COUNT);
  let loadedCount = 0;
  let currentFrame = -1;

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    currentFrame = -1; // force redraw at new size
    drawFrame(getFrameIndex());
  }

  // Draws an image into the canvas using "cover" scaling (like CSS background-size: cover).
  function drawCover(img) {
    const cw = window.innerWidth;
    const ch = window.innerHeight;
    const iw = img.width;
    const ih = img.height;
    const scale = Math.max(cw / iw, ch / ih);
    const sw = cw / scale;
    const sh = ch / scale;
    const sx = (iw - sw) / 2;
    const sy = (ih - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
  }

  function drawFrame(index) {
    if (index === currentFrame) return;
    const img = images[index];
    if (!img || !img.complete) return;
    currentFrame = index;
    drawCover(img);
  }

  function getFrameIndex() {
    const heroTop = hero.offsetTop;
    const heroHeight = hero.offsetHeight;
    const scrollRange = heroHeight - window.innerHeight;
    const progress = scrollRange > 0
      ? (window.scrollY - heroTop) / scrollRange
      : 0;
    const clamped = Math.min(1, Math.max(0, progress));
    return Math.min(FRAME_COUNT - 1, Math.floor(clamped * FRAME_COUNT));
  }

  let ticking = false;
  function onScroll() {
    if (scrollHint && window.scrollY > 20) {
      scrollHint.style.opacity = "0";
    } else if (scrollHint) {
      scrollHint.style.opacity = "1";
    }
    if (!ticking) {
      requestAnimationFrame(() => {
        drawFrame(getFrameIndex());
        ticking = false;
      });
      ticking = true;
    }
  }

  function preloadImages() {
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.onload = img.onerror = () => {
        loadedCount++;
        if (i === 0) drawFrame(0); // show first frame as soon as it's ready
        if (loadedCount === FRAME_COUNT && loadingIndicator) {
          loadingIndicator.classList.add("hidden");
        }
      };
      img.src = FRAME_PATH(i + 1); // files are frame_0001.jpg .. frame_0300.jpg
      images[i] = img;
    }
  }

  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("scroll", onScroll, { passive: true });

  resizeCanvas();
  preloadImages();
})();
