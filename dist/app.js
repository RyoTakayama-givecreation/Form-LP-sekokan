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

  function animateMatchCount() {
    cancelAnimationFrame(matchAnimationFrame);
    matchResult.classList.remove("is-revealed", "is-complete");
    jobMatchCount.textContent = reduceMotion ? "960" : "0";

    requestAnimationFrame(function () {
      matchResult.classList.add("is-revealed");
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
    return Array.from(active.querySelectorAll("[required]")).every((field) => field.value.trim());
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
    nextButton.disabled = !stepIsValid();
    if (currentStep === 1 && previousStep !== 1) animateMatchCount();
    previousStep = currentStep;
  }

  form.addEventListener("change", renderStep);
  form.addEventListener("input", renderStep);
  nextButton.addEventListener("click", function () {
    if (!stepIsValid()) return;
    if (currentStep < steps.length - 1) {
      currentStep += 1;
      renderStep();
      document.querySelector(".form-card").scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }
    form.hidden = true;
    document.querySelector(".form-head").hidden = true;
    document.querySelector(".progress-wrap").hidden = true;
    completeState.hidden = false;
  });
  backButton.addEventListener("click", function () {
    if (currentStep === 0) return;
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
  function fitJobTitles() {
    slider.querySelectorAll(".job-card h3").forEach(function (title) {
      title.style.fontSize = "";
      const naturalSize = parseFloat(getComputedStyle(title).fontSize);
      if (title.scrollWidth <= title.clientWidth) return;
      const fittedSize = Math.max(11.5, naturalSize * title.clientWidth / title.scrollWidth);
      title.style.fontSize = `${fittedSize}px`;
    });
  }
  const beforeCards = document.createDocumentFragment();
  const afterCards = document.createDocumentFragment();
  originalCards.forEach(function (card) {
    const before = card.cloneNode(true);
    const after = card.cloneNode(true);
    before.setAttribute("aria-hidden", "true");
    after.setAttribute("aria-hidden", "true");
    beforeCards.appendChild(before);
    afterCards.appendChild(after);
  });
  slider.insertBefore(beforeCards, slider.firstChild);
  slider.appendChild(afterCards);

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

  function measureSlider() {
    fitJobTitles();
    const nextWidth = originalCards[0].getBoundingClientRect().left -
      slider.firstElementChild.getBoundingClientRect().left;
    if (!nextWidth || Math.abs(nextWidth - loopWidth) < .5) return;
    // Preserve the current job and fractional progress on a real width change.
    const phase = loopWidth ? ((slider.scrollLeft % loopWidth) + loopWidth) % loopWidth / loopWidth : 0;
    loopWidth = nextWidth;
    autoPosition = loopWidth * (1 + phase);
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
      autoPosition = loopWidth + ((autoPosition % loopWidth) + loopWidth) % loopWidth;
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
    slider.scrollLeft = dragStartScroll - (event.clientX - dragStartX);
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
