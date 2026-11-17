document.querySelectorAll("[data-image-carousel]").forEach((carousel) => {
  const slides = Array.from(
    carousel.querySelectorAll(".image-carousel__slide")
  );
  const imageButtons = Array.from(
    carousel.querySelectorAll("[data-carousel-toggle]")
  );
  const feedback = carousel.querySelector(".image-carousel__feedback");
  const carouselLabel = carousel.getAttribute("aria-label") || "Image carousel";

  let currentIndex = 0;
  let isPaused = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  let timerId = null;

  function loadSlideImage(slide) {
    const image = slide.querySelector("img[data-src]");

    if (image) {
      image.src = image.dataset.src;
      image.removeAttribute("data-src");
    }
  }

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;
    loadSlideImage(slides[currentIndex]);

    slides.forEach((slide, index) => {
      slide.hidden = index !== currentIndex;
    });

    loadSlideImage(slides[(currentIndex + 1) % slides.length]);
  }

  function updateTimer() {
    window.clearInterval(timerId);
    timerId = null;

    if (!isPaused && !document.hidden) {
      timerId = window.setInterval(() => {
        showSlide(currentIndex + 1);
      }, 5000);
    }
  }

  function updateImageButtons() {
    const playbackState = isPaused ? "paused" : "playing";
    carousel.setAttribute(
      "aria-label",
      `${carouselLabel}. Slideshow ${playbackState}.`
    );
    feedback.dataset.state = playbackState;

    imageButtons.forEach((button) => {
      const image = button.querySelector("img");
      const action = isPaused ? "Resume" : "Pause";
      button.setAttribute("aria-label", `${action} slideshow. ${image.alt}`);
      button.setAttribute("aria-pressed", String(isPaused));
    });
  }

  function showFeedback() {
    feedback.classList.remove("is-animating");
    void feedback.offsetWidth;
    feedback.classList.add("is-animating");
  }

  feedback.addEventListener("animationend", (event) => {
    if (event.target === feedback) {
      feedback.classList.remove("is-animating");
    }
  });

  function togglePlayback() {
    isPaused = !isPaused;
    updateImageButtons();
    showFeedback();
    updateTimer();
  }

  carousel.addEventListener("click", (event) => {
    const target = event.target;
    const control = target instanceof Element
      ? target.closest(
          "button, a, input, select, textarea, [role='button'], [data-carousel-navigation], [data-carousel-dot], .image-carousel__arrow, .image-carousel__dot"
        )
      : null;

    if (control && !control.matches("[data-carousel-toggle]")) {
      return;
    }

    togglePlayback();
  });

  carousel.addEventListener("keydown", (event) => {
    if (event.target !== carousel || event.repeat) {
      return;
    }

    const isSpace = event.key === " " || event.key === "Spacebar" || event.code === "Space";

    if (isSpace || event.key === "Enter") {
      event.preventDefault();
      togglePlayback();
    }
  });

  document.addEventListener("visibilitychange", () => {
    updateTimer();
  });

  showSlide(currentIndex);
  updateImageButtons();
  updateTimer();
});
