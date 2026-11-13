const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const navigationLinks = document.querySelectorAll(".nav-link");

function closeMenu() {
  navigation.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
}

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation menu" : "Close navigation menu");
  navigation.classList.toggle("is-open", !isExpanded);
});

navigationLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

const sections = document.querySelectorAll("main section[id]");
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    navigationLinks.forEach((link) => {
      if (link.getAttribute("href") === `#${entry.target.id}`) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  });
}, {
  rootMargin: "-30% 0px -60% 0px",
});

sections.forEach((section) => sectionObserver.observe(section));

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formStatus.textContent = "Thanks for reaching out! This demo form does not send messages yet.";
  contactForm.reset();
});
