(function () {
  "use strict";

  const form = document.getElementById("careerForm");
  const steps = Array.from(document.querySelectorAll(".step"));
  const nextButton = document.getElementById("nextButton");
  const backButton = document.getElementById("backButton");
  const nextLabel = document.getElementById("nextLabel");
  const stepLabel = document.getElementById("stepLabel");
  const progressPercent = document.getElementById("progressPercent");
  const progressBar = document.getElementById("progressBar");
  const completeState = document.getElementById("completeState");
  const resetButton = document.getElementById("resetButton");
  let currentStep = 0;

  function stepIsValid() {
    const active = steps[currentStep];
    if (currentStep === 0) return active.querySelectorAll("input:checked").length > 0;
    if (currentStep === 1 || currentStep === 2) return Boolean(active.querySelector("input:checked"));
    return Array.from(active.querySelectorAll("[required]")).every((field) => field.value.trim());
  }

  function renderStep() {
    steps.forEach((step, index) => step.classList.toggle("is-active", index === currentStep));
    const percent = Math.round(((currentStep + 1) / steps.length) * 100);
    stepLabel.textContent = `STEP ${currentStep + 1} / ${steps.length}`;
    progressPercent.textContent = `${percent}%`;
    progressBar.style.width = `${percent}%`;
    backButton.classList.toggle("is-visible", currentStep > 0);
    nextLabel.textContent = currentStep === steps.length - 1 ? "無料で求人を紹介してもらう" : "次へ進む";
    nextButton.disabled = !stepIsValid();
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
  const cards = Array.from(slider.querySelectorAll(".job-card"));
  const currentCounter = document.getElementById("slideCurrent");
  function cardStep() { return cards[0].getBoundingClientRect().width + 16; }
  function updateCounter() {
    const index = Math.max(0, Math.min(cards.length - 1, Math.round(slider.scrollLeft / cardStep())));
    currentCounter.textContent = String(index + 1).padStart(2, "0");
  }
  document.getElementById("prevJob").addEventListener("click", () => slider.scrollBy({ left: -cardStep(), behavior: "smooth" }));
  document.getElementById("nextJob").addEventListener("click", () => slider.scrollBy({ left: cardStep(), behavior: "smooth" }));
  slider.addEventListener("scroll", updateCounter, { passive: true });
  slider.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      slider.scrollBy({ left: event.key === "ArrowRight" ? cardStep() : -cardStep(), behavior: "smooth" });
    }
  });

  renderStep();
})();
