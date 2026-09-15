(function () {
  "use strict";

  const form = document.getElementById("careerForm");
  const steps = Array.from(document.querySelectorAll(".step"));
  const nextButton = document.getElementById("nextButton");
  const backButton = document.getElementById("backButton");
  const nextLabel = document.getElementById("nextLabel");
  const formTitle = document.getElementById("form-title");
  const stepLabel = document.getElementById("stepLabel");
  const progressPercent = document.getElementById("progressPercent");
  const progressBar = document.getElementById("progressBar");
  const completeState = document.getElementById("completeState");
  const resetButton = document.getElementById("resetButton");
  const matchResult = document.getElementById("matchResult");
  const jobMatchCount = document.getElementById("jobMatchCount");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let currentStep = 0;
  let previousStep = -1;
  let matchAnimationFrame = 0;
  let autoAdvanceTimer = 0;
  const autoAdvanceSteps = new Set([1, 2]);

  function animateMatchCount() {
    cancelAnimationFrame(matchAnimationFrame);
    matchResult.classList.remove("is-complete");
    matchResult.classList.add("is-revealed");
    jobMatchCount.textContent = reduceMotion ? "960" : "0";

    requestAnimationFrame(function () {
      if (reduceMotion) {
        matchResult.classList.add("is-complete");
        return;
      }

      const startedAt = performance.now();
      const duration = 920;
      function count(now) {
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        jobMatchCount.textContent = String(Math.round(960 * eased));
        if (progress < 1) {
          matchAnimationFrame = requestAnimationFrame(count);
          return;
        }
        matchResult.classList.add("is-complete");
      }
      matchAnimationFrame = requestAnimationFrame(count);
    });
  }

  function stepIsValid() {
    const active = steps[currentStep];
    if (currentStep === 0) return active.querySelectorAll("input:checked").length > 0;
    if (currentStep === 1 || currentStep === 2) return Boolean(active.querySelector("input:checked"));
    if (currentStep === 3) {
      const age = active.querySelector('input[name="age"]');
      return Array.from(active.querySelectorAll("[required]")).every((field) => field.value.trim()) && /^\d{1,3}$/.test(age.value);
    }
    return Array.from(active.querySelectorAll("[required]")).every((field) => field.value.trim());
  }

  function showNextStep() {
    if (currentStep >= steps.length - 1) return;
    currentStep += 1;
    renderStep();
    document.querySelector(".form-card").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function renderStep() {
    steps.forEach((step, index) => step.classList.toggle("is-active", index === currentStep));
    formTitle.textContent = steps[currentStep].dataset.title;
    const percent = Math.round(((currentStep + 1) / steps.length) * 100);
    stepLabel.textContent = `STEP ${currentStep + 1} / ${steps.length}`;
    progressPercent.textContent = `${percent}%`;
    progressBar.style.width = `${percent}%`;
    backButton.classList.toggle("is-visible", currentStep > 0);
    nextLabel.textContent = currentStep === steps.length - 1 ? "無料で求人を紹介してもらう" : "次へ進む";
    nextButton.classList.toggle("is-hidden", autoAdvanceSteps.has(currentStep));
    nextButton.classList.toggle("is-submit", currentStep === steps.length - 1);
    nextButton.disabled = !stepIsValid();
    if (currentStep === 1 && previousStep !== 1) animateMatchCount();
    previousStep = currentStep;
  }

  form.addEventListener("change", function (event) {
    renderStep();
    if (!autoAdvanceSteps.has(currentStep) || !event.target.matches('input[type="radio"]') || !event.target.checked) return;
    const selectedStep = currentStep;
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = window.setTimeout(function () {
      if (currentStep !== selectedStep || !stepIsValid()) return;
      showNextStep();
    }, 160);
  });
  form.addEventListener("input", function (event) {
    if (event.target.matches('input[name="age"]')) event.target.value = event.target.value.replace(/\D/g, "").slice(0, 3);
    renderStep();
  });
  nextButton.addEventListener("click", function () {
    if (!stepIsValid()) return;
    if (currentStep < steps.length - 1) {
      showNextStep();
      return;
    }
    form.hidden = true;
    document.querySelector(".form-head").hidden = true;
    document.querySelector(".progress-wrap").hidden = true;
    completeState.hidden = false;
  });
  backButton.addEventListener("click", function () {
    if (currentStep === 0) return;
    clearTimeout(autoAdvanceTimer);
    currentStep -= 1;
    renderStep();
  });
  resetButton.addEventListener("click", function () {
    form.reset();
    currentStep = 0;
    form.hidden = false;
    document.querySelector(".form-head").hidden = false;
    document.querySelector(".progress-wrap").hidden = false;
    completeState.hidden = true;
    renderStep();
  });

  const slider = document.getElementById("jobSlider");
  const originalCards = Array.from(slider.querySelectorAll(".job-card"));
  // Copies kept on each side of the originals. Swipe/trackpad momentum can't be rebased
  // mid-gesture (writing scrollLeft kills iOS momentum), so a gesture needs this much room
  // before it reaches a scroll edge. One set is at least ~1,060px, so this is over 3,000px.
  const BUFFER_SETS = 3;
  function fitJobTitles() {
    const titles = Array.from(slider.querySelectorAll(".job-card h3"));
    titles.forEach(function (title) { title.style.fontSize = ""; });
    // Copies repeat the originals in order at the same width, so fit the originals once
    // (one layout instead of one per card) and reuse the sizes.
    const sizes = originalCards.map(function (card) {
      const title = card.querySelector("h3");
      const naturalSize = parseFloat(getComputedStyle(title).fontSize);
      if (title.scrollWidth <= title.clientWidth) return "";
      return `${Math.max(11.5, naturalSize * title.clientWidth / title.scrollWidth)}px`;
    });
    titles.forEach(function (title, index) { title.style.fontSize = sizes[index % sizes.length]; });
  }
  function cloneSet() {
    const set = document.createDocumentFragment();
    originalCards.forEach(function (card) {
      const copy = card.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      set.appendChild(copy);
    });
    return set;
  }
  for (let i = 0; i < BUFFER_SETS; i += 1) {
    slider.insertBefore(cloneSet(), slider.firstChild);
    slider.appendChild(cloneSet());
  }

  // Autoplay runs one loop past loopBase and gestures need BUFFER_SETS of room beyond that.
  // Card width is capped, so on wide screens the viewport can outgrow the copies; the
  // browser then clamps scrollLeft short of the wrap point and the slider freezes, then
  // jumps. Append copies until that far end is reachable.
  function ensureTrailingCopies(base, width) {
    let added = false;
    for (let i = 0; i < 10 && slider.scrollWidth - slider.clientWidth < base * 2 + width; i += 1) {
      slider.appendChild(cloneSet());
      added = true;
    }
    return added;
  }

  let loopBase = 0;
  let loopWidth = 0;
  let autoPosition = 0;
  let previousTime = 0;
  let manual = false;
  let lastInteraction = 0;
  let touching = false;
  let mouseId = null;
  let dragStartX = 0;
  let dragStartScroll = 0;
  let lastWritten = 0;

  function writePosition(position) {
    slider.scrollLeft = position;
    lastWritten = slider.scrollLeft;
  }

  // Whole loops to subtract to bring a position into [loopBase, loopBase + loopWidth).
  // Every loop is an identical copy, so the jump is invisible.
  function loopShift(position) {
    return Math.floor((position - loopBase) / loopWidth) * loopWidth;
  }

  function measureSlider() {
    fitJobTitles();
    const base = originalCards[0].getBoundingClientRect().left -
      slider.firstElementChild.getBoundingClientRect().left;
    if (!base) return;
    // Checked before the early return: the viewport can widen while card width stays capped.
    if (ensureTrailingCopies(base, base / BUFFER_SETS)) fitJobTitles();
    if (Math.abs(base - loopBase) < .5) return;
    // Preserve the current job and fractional progress on a real width change.
    const phase = loopWidth ? ((slider.scrollLeft % loopWidth) + loopWidth) % loopWidth / loopWidth : 0;
    loopBase = base;
    loopWidth = base / BUFFER_SETS;
    autoPosition = loopBase + loopWidth * phase;
    writePosition(autoPosition);
  }

  function beginInteraction() {
    manual = true;
    lastInteraction = performance.now();
  }

  function moveSlider(now) {
    const elapsed = Math.min(now - previousTime, 40);
    previousTime = now;
    if (manual) {
      // Native touch momentum must finish before autoplay owns scrollLeft again.
      if (!touching && mouseId === null && now - lastInteraction >= 100) {
        autoPosition = slider.scrollLeft;
        manual = false;
      }
    }
    if (!manual && document.visibilityState === "visible" && loopWidth) {
      autoPosition += elapsed * .03;
      // Rebase only outside gestures/momentum, between identical copies.
      autoPosition -= loopShift(autoPosition);
      writePosition(autoPosition);
    }
    requestAnimationFrame(moveSlider);
  }

  slider.addEventListener("scroll", function () {
    // Ignore our own writes, including Safari's fractional-pixel rounding.
    if (manual || Math.abs(slider.scrollLeft - lastWritten) > 1) beginInteraction();
  }, { passive: true });

  slider.addEventListener("touchstart", function () {
    touching = true;
    beginInteraction();
  }, { passive: true });
  function endTouch(event) {
    touching = event.touches.length > 0;
    beginInteraction();
  }
  slider.addEventListener("touchend", endTouch, { passive: true });
  slider.addEventListener("touchcancel", endTouch, { passive: true });

  slider.addEventListener("pointerdown", function (event) {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    mouseId = event.pointerId;
    dragStartX = event.clientX;
    dragStartScroll = slider.scrollLeft;
    beginInteraction();
    slider.setPointerCapture(event.pointerId);
  });
  slider.addEventListener("pointermove", function (event) {
    if (event.pointerType !== "mouse" || event.pointerId !== mouseId) return;
    beginInteraction();
    let position = dragStartScroll - (event.clientX - dragStartX);
    // A drag writes scrollLeft itself (no momentum to lose), so it can wrap while moving.
    if (loopWidth) {
      const shift = loopShift(position);
      position -= shift;
      dragStartScroll -= shift;
    }
    slider.scrollLeft = position;
  });
  function endMouse(event) {
    if (event.pointerId !== mouseId) return;
    mouseId = null;
    beginInteraction();
  }
  slider.addEventListener("pointerup", endMouse);
  slider.addEventListener("pointercancel", endMouse);
  slider.addEventListener("lostpointercapture", endMouse);
  slider.addEventListener("dragstart", function (event) { event.preventDefault(); });
  slider.addEventListener("wheel", beginInteraction, { passive: true });
  slider.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      beginInteraction();
      // Same for keys: wrap before each step so holding an arrow never reaches an edge.
      const shift = loopWidth ? loopShift(slider.scrollLeft) : 0;
      if (shift) slider.scrollLeft -= shift;
      slider.scrollBy({ left: event.key === "ArrowRight" ? slider.clientWidth * .7 : -slider.clientWidth * .7, behavior: "smooth" });
    }
  });

  requestAnimationFrame(function (now) {
    measureSlider();
    previousTime = now;
    requestAnimationFrame(moveSlider);
  });
  // Safari's collapsing address bar emits resize even when card widths do not change.
  window.addEventListener("resize", measureSlider);

  renderStep();
})();
