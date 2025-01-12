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
