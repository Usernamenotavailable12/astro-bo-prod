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


document.addEventListener('DOMContentLoaded', function() {
  const nav = document.querySelector('nav');
  // Fade in the sidebar on page load for a seamless feel.
  nav.classList.add('visible');

  const categoryLinks = document.querySelectorAll('nav ul li.category > a');
  
  // Toggle active category on click (accordion behavior)
  categoryLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const parentCategory = this.parentElement;
      
      // Close any other open category
      document.querySelectorAll('nav ul li.category.active').forEach(activeItem => {
        if (activeItem !== parentCategory) {
          activeItem.classList.remove('active');
        }
      });
      
      // Toggle the clicked category
      parentCategory.classList.toggle('active');
    });
  });
  
  // On page load, check if a submenu link matches the current URL
  // and open its parent category (without animating) and mark it as active.
  const currentPath = window.location.pathname;
  const submenuLinks = document.querySelectorAll('nav ul li.category .submenu li a');
  
  submenuLinks.forEach(link => {
    if(link.getAttribute('href') === currentPath) {
      // Mark this submenu link as active.
      link.classList.add('active');
      // Open its parent category without animation.
      const category = link.closest('li.category');
      category.classList.add('active', 'no-transition');
      // Remove the temporary no-transition class shortly after load.
      setTimeout(() => {
        category.classList.remove('no-transition');
      }, 10);
    }
  });
});