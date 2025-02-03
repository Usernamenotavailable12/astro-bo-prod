// Attach functions to the global `window` object
window.toggleMenu = function () {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("open");
  const main = document.getElementById("main");
  main.classList.toggle("open-sidebar");
};

window.loadFrame = function (url) {
  const iframe = document.getElementById("contentFrame");
  iframe.src = url;
};

window.toggleDisplay = function () {
  const element = document.getElementById("legacy");
  if (element) {
    element.style.display =
      element.style.display === "block" ? "none" : "block";
  } else {
    console.error("Element with ID 'legacy' not found.");
  }
};

window.refreshPage = function () {
  location.reload();
};


/* dock button */

/* dock button */

document.addEventListener("DOMContentLoaded", function () {
  const dock = document.getElementById("doc-nav-bar");
  const toggleButton = document.getElementById("hide-dock");

  // Load state from localStorage
  const isHidden = localStorage.getItem("dockHidden") === "true";

  // Apply visibility before rendering
  dock.style.display = isHidden ? "none" : "flex";
  toggleButton.innerText = isHidden ? "↑" : "↓";

  // Attach toggle function to button
  toggleButton.addEventListener("click", function () {
    const isCurrentlyHidden = dock.style.display === "none";

    dock.style.display = isCurrentlyHidden ? "flex" : "none";
    toggleButton.innerText = isCurrentlyHidden ? "↓" : "↑";
    localStorage.setItem("dockHidden", isCurrentlyHidden ? "false" : "true");
  });
});


