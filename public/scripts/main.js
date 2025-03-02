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
  // Normalize a path by removing trailing slashes
  function normalizePath(path) {
    return path.replace(/\/$/, '');
  }

  const currentPath = normalizePath(window.location.pathname);

  // Retrieve active category from localStorage
  const savedActiveCategory = localStorage.getItem('activeCategory');
  if (savedActiveCategory) {
    const savedCategoryElem = document.querySelector(`nav ul li.category[data-category="${savedActiveCategory}"]`);
    if (savedCategoryElem) {
      savedCategoryElem.classList.add('active', 'no-transition');
      setTimeout(() => savedCategoryElem.classList.remove('no-transition'), 10);
    }
  }

  // Accordion behavior: toggle category on click and store the active one in localStorage
  const categoryLinks = document.querySelectorAll('nav ul li.category > a');
  categoryLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const parentCategory = this.parentElement;
      const categoryName = parentCategory.getAttribute('data-category');

      // Close any other open category
      document.querySelectorAll('nav ul li.category.active').forEach(activeItem => {
        if (activeItem !== parentCategory) {
          activeItem.classList.remove('active');
        }
      });

      // Toggle the clicked category
      const isActive = parentCategory.classList.toggle('active');

      // Save or remove from localStorage based on toggle state
      if (isActive) {
        localStorage.setItem('activeCategory', categoryName);
      } else {
        localStorage.removeItem('activeCategory');
      }
    });
  });

  // Check submenu links and mark the matching one as active
  const submenuLinks = document.querySelectorAll('nav ul li.category .submenu li a');
  submenuLinks.forEach(link => {
    if (normalizePath(link.getAttribute('href')) === currentPath) {
      link.classList.add('active');
      // Open the parent category (if not already open)
      const category = link.closest('li.category');
      category.classList.add('active', 'no-transition');
      localStorage.setItem('activeCategory', category.getAttribute('data-category'));
      setTimeout(() => category.classList.remove('no-transition'), 10);
    }
  });

  // Optional: Fade in the sidebar for a smoother feel on page load
  const nav = document.querySelector('nav');
  nav.classList.add('visible');
});