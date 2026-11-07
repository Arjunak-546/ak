(() => {
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const hint = document.getElementById("hint");
  const resetBtn = document.getElementById("resetBtn");
  const canvas = document.getElementById("confetti");
  const card = document.getElementById("card");
  const title = document.getElementById("title");
  const body = document.body;

  const prefersReducedMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  )?.matches;

  const state = {
    dodges: 0,
    locked: false,
    confettiRunning: false,
    yesClicked: false,
  };

  const cuteMessages = [
    "unaku enna pudikadha 😢",
    "Please say yes ma... 💕",
    "Come on, oru chance kuden ! 🥺",
    "kal manasa unaku😣",
    "life time offer ah miss pannadha😅",
    "enna maari oru nalla paiyen kedaika maatan paathukooo😆",
    "🙇‍♂️🙇‍♂️🙇‍♂️🙇‍♂️",
    "kaal la vilundum un manasu karaialaya😭🥺",
    "koushiiiiiiiiiiiiiiiiii🥺🥺",
    

  ];

  // Array of meme/gif URLs - use direct image URLs (not page URLs)
  // For Tenor: Right-click the GIF and "Copy image address" to get the direct URL
  // For Giphy: Use format like "https://media.giphy.com/media/[ID]/giphy.gif"
  const memeUrls = [
    "https://media.tenor.com/10625643692071595107/tenor.gif", // For message 1
    "https://media.tenor.com/21359531/tenor.gif", // For message 2
    "https://media.tenor.com/16174932034374231111/tenor.gif", // For message 3
    "https://media.tenor.com/24739451/tenor.gif", // For message 4
    "https://media.tenor.com/12499475292157450672/tenor.gif", // For message 5
    "https://media.tenor.com/11127039702778598748/tenor.gif", // For message 6
    "https://media.tenor.com/602673572992226258/tenor.gif", // For message 7
    "https://media.tenor.com/21484464/tenor.gif", // For message 8
    "https://media.tenor.com/19506496/tenor.gif", // For message 9
  ];

  // Try several direct image URL patterns for Tenor/Giphy page links and
  // attempt to load them sequentially until one succeeds. This improves
  // resilience when the original array contains page URLs instead of
  // direct image links.
  function trySetImageFromPageUrl(pageUrl, imgEl, onFail) {
    if (!pageUrl) {
      if (onFail) onFail();
      return;
    }

    // If it's already a direct image URL, use it immediately
    if (pageUrl.match(/\.(gif|webp|jpg|jpeg|png)(\?|$)/i) || pageUrl.includes('media.tenor.com') || pageUrl.includes('media.giphy.com') || pageUrl.includes('c.tenor.com')) {
      imgEl.src = pageUrl;
      return;
    }

    const candidates = [];

    // Tenor page URLs -> try a few known patterns
    const tenorMatch = pageUrl.match(/tenor\.com\/view\/.*-gif-(\d+)/);
    if (tenorMatch) {
      const id = tenorMatch[1];
      candidates.push(`https://media.tenor.com/${id}/tenor.gif`);
      candidates.push(`https://c.tenor.com/${id}.gif`);
      candidates.push(`https://media.tenor.com/images/${id}/tenor.gif`);
    }

    // Giphy page URLs -> try the media URL pattern
    const giphyMatch = pageUrl.match(/giphy\.com\/gifs\/[^\/]+\/([^\/\?]+)/);
    if (giphyMatch) {
      const id = giphyMatch[1];
      candidates.push(`https://media.giphy.com/media/${id}/giphy.gif`);
      candidates.push(`https://i.giphy.com/media/${id}/giphy.gif`);
    }

    // Always try the original page URL last (some CDN backends may redirect)
    candidates.push(pageUrl);

    let idx = 0;

    function tryNext() {
      if (idx >= candidates.length) {
        console.error('All candidate image URLs failed for', pageUrl);
        if (onFail) onFail();
        return;
      }
      const candidate = candidates[idx++];
      console.log('Trying candidate image URL:', candidate);
      const probe = new Image();
      probe.crossOrigin = 'anonymous';
      probe.onload = function () {
        imgEl.src = candidate;
      };
      probe.onerror = function () {
        tryNext();
      };
      // Start loading
      probe.src = candidate;
      // If the browser caches instant failures, ensure errors eventually propagate
      setTimeout(() => {
        // If imgEl didn't get set, and probe hasn't fired, move on after timeout
        if (imgEl.src === '' || imgEl.src === window.location.href) {
          // no-op only; errors will trigger tryNext via onerror
        }
      }, 1200);
    }

    tryNext();
  }

  const heart = document.getElementById("heart");
  const memeImage = document.getElementById("memeImage");
  const heartShape = document.querySelector(".heart__shape");
  const heartPulse = document.querySelector(".heart__pulse");

  // Small inline SVG placeholder (cat emoji) used when GIFs fail or before load
  const placeholderSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'><rect rx='12' width='240' height='240' fill='%23ffffff'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='72'>%F0%9F%98%BA</text></svg>";

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function makeYesButtonBigger() {
    // Increase size by 10% each time, max 200% of original
    const currentScale = parseFloat(yesBtn.style.transform.match(/scale\(([\d.]+)\)/)?.[1] || "1");
    const newScale = Math.min(currentScale + 0.1, 2.0);
    
    // Also increase padding and font size
    const currentPadding = parseFloat(yesBtn.style.padding.match(/[\d.]+/)?.[0] || "12");
    const newPadding = Math.min(currentPadding + 2, 24);
    
    const currentFontSize = parseFloat(yesBtn.style.fontSize.match(/[\d.]+/)?.[0] || "15");
    const newFontSize = Math.min(currentFontSize + 1, 22);
    
    yesBtn.style.transform = `scale(${newScale})`;
    yesBtn.style.padding = `${newPadding}px ${newPadding * 1.5}px`;
    yesBtn.style.fontSize = `${newFontSize}px`;
    yesBtn.style.transition = "transform 0.3s ease, padding 0.3s ease, font-size 0.3s ease";
    yesBtn.classList.add("scaled");
  }

  function checkOverlap(noBtnLeft, noBtnTop, noBtnWidth, noBtnHeight) {
    const yesBtnRect = yesBtn.getBoundingClientRect();
    const buttonsContainer = document.querySelector(".buttons");
    const containerRect = buttonsContainer.getBoundingClientRect();
    
    // Convert yesBtn position relative to container
    const yesBtnLeft = yesBtnRect.left - containerRect.left;
    const yesBtnTop = yesBtnRect.top - containerRect.top;
    const yesBtnWidth = yesBtnRect.width;
    const yesBtnHeight = yesBtnRect.height;
    
    // Check if rectangles overlap (with some padding)
    const padding = 15;
    return !(
      noBtnLeft + noBtnWidth + padding < yesBtnLeft ||
      noBtnLeft > yesBtnLeft + yesBtnWidth + padding ||
      noBtnTop + noBtnHeight + padding < yesBtnTop ||
      noBtnTop > yesBtnTop + yesBtnHeight + padding
    );
  }

  const constantGif = "https://media.tenor.com/ck7oRyY26uwAAAAi/bear-%EB%86%80%EC%9E%90%EA%B3%B0.gif";

  function moveNoButton() {
    if (state.locked || state.yesClicked) return;
    
    state.dodges += 1;

    // Make Yes button bigger
    makeYesButtonBigger();

    // Show the next cute message (if available)
    const messageIndex = Math.min(state.dodges - 1, cuteMessages.length - 1);
    hint.textContent = cuteMessages[messageIndex] || '';
    hint.style.display = 'block';
    hint.style.opacity = '1';

    // Display the constant GIF
    heartShape.style.display = "none";
    heartShape.style.visibility = "hidden";
    heartPulse.style.display = "none";
    heartPulse.style.visibility = "hidden";

    memeImage.alt = "cute bear";
    memeImage.style.display = "block";
    memeImage.style.visibility = "visible";
    memeImage.style.opacity = "1";
    memeImage.style.position = "relative";
    memeImage.style.zIndex = "10";
    memeImage.src = constantGif;

    // Hide No button if all cute messages are exhausted
    if (state.dodges >= cuteMessages.length) {
      noBtn.style.display = 'none';
      hint.textContent = "Just click yes(no other options for u)😡😡";
      return;
    }

    // Move the No button to a random position
    const buttonsContainer = document.querySelector(".buttons");
    const containerRect = buttonsContainer.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();

    // Calculate safe area within the buttons container
    const padding = 10;
    const leftMin = padding;
    const topMin = padding;
    const leftMax = containerRect.width - btnRect.width - padding;
    const topMax = containerRect.height - btnRect.height - padding;

    // Try to find a position that doesn't overlap with Yes button
    let attempts = 0;
    let left, top;
    let foundPosition = false;
    
    while (attempts < 50 && !foundPosition) {
      left = clamp(rand(leftMin, leftMax), leftMin, leftMax);
      top = clamp(rand(topMin, topMax), topMin, topMax);
      
      if (!checkOverlap(left, top, btnRect.width, btnRect.height)) {
        foundPosition = true;
      }
      attempts++;
    }

    // Ensure we have valid bounds
    if (leftMax > leftMin && topMax > topMin) {
      noBtn.style.position = "absolute";
      noBtn.style.left = `${left}px`;
      noBtn.style.top = `${top}px`;
      noBtn.style.transform = `rotate(${rand(-8, 8)}deg)`;
      noBtn.style.transition = "left 0.2s ease, top 0.2s ease";
    }
  }

  function changeToLoveTheme() {
    state.yesClicked = true;
    body.classList.add("love-theme");
    card.classList.add("love-card");
    title.textContent = "vazhthukal  🎉";
    
    // Hide buttons and show celebration message
    yesBtn.style.display = "none";
    noBtn.style.display = "none";
    
    // Create celebration message
    const celebration = document.createElement("div");
    celebration.className = "celebration";
    celebration.innerHTML = `
      <p class="celebration__text">Good girl🥰💕</p>
      <p class="celebration__subtext">now you're my girl😎😏</p>
      <p class="celebration__subtext">🫣🫣😘😘</p>
    `;
    
    const controls = document.querySelector(".controls");
    controls.appendChild(celebration);
    
    hint.style.display = "none";
  }

  // Confetti (tiny, local, no deps)
  const ctx = canvas.getContext("2d");
  let confetti = [];
  let rafId = 0;
  let lastT = 0;

  function resizeCanvas() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function spawnConfettiBurst() {
    const colors = [
      "#ff2f6f",
      "#ff79a9",
      "#ffd1dc",
      "#ffffff",
      "#ffb3c6",
      "#ff4d7d",
    ];
    const count = prefersReducedMotion ? 70 : 180;
    const originX = window.innerWidth / 2;
    const originY = window.innerHeight * 0.28;

    for (let i = 0; i < count; i += 1) {
      const size = rand(4, 9);
      confetti.push({
        x: originX + rand(-20, 20),
        y: originY + rand(-10, 10),
        vx: rand(-4.5, 4.5),
        vy: rand(-8.5, -2.5),
        g: rand(0.12, 0.22),
        r: rand(0, Math.PI * 2),
        vr: rand(-0.18, 0.18),
        w: size,
        h: size * rand(0.6, 1.6),
        color: colors[Math.floor(rand(0, colors.length))],
        life: rand(1700, 2600),
        age: 0,
      });
    }
  }

  function tick(t) {
    if (!lastT) lastT = t;
    const dt = Math.min(32, t - lastT);
    lastT = t;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    confetti = confetti.filter((p) => p.age < p.life && p.y < window.innerHeight + 40);
    for (const p of confetti) {
      p.age += dt;
      p.vy += p.g * (dt / 16);
      p.x += p.vx * (dt / 16);
      p.y += p.vy * (dt / 16);
      p.r += p.vr * (dt / 16);

      const alpha = 1 - Math.max(0, p.age - p.life * 0.7) / (p.life * 0.3);
      ctx.save();
      ctx.globalAlpha = clamp(alpha, 0, 1);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (confetti.length > 0) {
      rafId = window.requestAnimationFrame(tick);
    } else {
      state.confettiRunning = false;
      rafId = 0;
      lastT = 0;
    }
  }

  function startConfetti() {
    if (state.confettiRunning) return;
    state.confettiRunning = true;
    spawnConfettiBurst();
    if (!rafId) rafId = window.requestAnimationFrame(tick);
  }

  function resetAll() {
    state.dodges = 0;
    state.locked = false;
    state.yesClicked = false;
    hint.textContent = "";
    hint.style.opacity = "0";
    hint.style.display = "block";
    noBtn.style.position = "static";
    noBtn.style.left = "";
    noBtn.style.top = "";
    noBtn.style.transform = "";
    noBtn.style.transition = "";
    yesBtn.style.display = "";
    noBtn.style.display = "";
    
    // Reset Yes button size
    yesBtn.style.transform = "";
    yesBtn.style.padding = "";
    yesBtn.style.fontSize = "";
    yesBtn.style.transition = "";
    yesBtn.classList.remove("scaled");
    
    // Reset heart/meme display
    memeImage.style.display = "none";
    memeImage.style.visibility = "hidden";
    memeImage.src = "";
    const gifOutputEl = document.getElementById('gif-output');
    if (gifOutputEl) gifOutputEl.innerHTML = '';
    heartShape.style.display = "block";
    heartShape.style.visibility = "visible";
    heartPulse.style.display = "block";
    heartPulse.style.visibility = "visible";
    
    body.classList.remove("love-theme");
    card.classList.remove("love-card");
    title.textContent = "Will you be my Valentine?";
    
    const celebration = document.querySelector(".celebration");
    if (celebration) {
      celebration.remove();
    }
    
    resetBtn.hidden = true;
  }

  yesBtn.addEventListener("click", () => {
    if (state.locked || state.yesClicked) return;
    // Display the special 'Yes' GIF and provide a direct link
    const yesGif = "https://media1.tenor.com/m/DjyCY1aC7LgAAAAC/love-you-a-lot.gif";
    trySetImageFromPageUrl(yesGif, memeImage, function() {
      // If trySetImageFromPageUrl fails, fall back to direct assignment
      memeImage.src = yesGif;
      memeImage.style.display = 'block';
      memeImage.style.visibility = 'visible';
    });
    memeImage.alt = "Love you a lot";
    memeImage.style.display = 'block';
    memeImage.style.visibility = 'visible';
    const gifOutputEl = document.getElementById('gif-output');
    if (gifOutputEl) {
      gifOutputEl.innerHTML = '';
    }
    state.locked = true;
    startConfetti();
    setTimeout(() => {
      changeToLoveTheme();
    }, 500);
    resetBtn.hidden = false;
  });

  // Only move on click, not on hover
  noBtn.addEventListener("click", (e) => {
    if (state.locked || state.yesClicked) return;
    e.preventDefault();
    moveNoButton();
  });

  // Also handle touch for mobile
  noBtn.addEventListener("touchend", (e) => {
    if (state.locked || state.yesClicked) return;
    e.preventDefault();
    moveNoButton();
  });

  resetBtn.addEventListener("click", resetAll);

  // Initialize: show placeholder image and hide decorative heart pulse/shape
  memeImage.src = placeholderSvg;
  memeImage.alt = "Cute cat";
  memeImage.style.display = "block";
  memeImage.style.visibility = "visible";
  heartShape.style.display = "none";
  heartShape.style.visibility = "hidden";
  heartPulse.style.display = "none";
  heartPulse.style.visibility = "hidden";
})();


