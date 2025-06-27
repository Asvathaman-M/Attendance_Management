// Main JavaScript for AttendEase
document.addEventListener("DOMContentLoaded", () => {
  // Mobile navigation toggle
  const hamburger = document.querySelector(".hamburger")
  const navMenu = document.querySelector(".nav-menu")

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active")
      navMenu.classList.toggle("active")
    })

    // Close mobile menu when clicking on a link
    document.querySelectorAll(".nav-link").forEach((n) =>
      n.addEventListener("click", () => {
        hamburger.classList.remove("active")
        navMenu.classList.remove("active")
      }),
    )
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })

  // Animation on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  }, observerOptions)

  // Observe elements for animation
  document.querySelectorAll(".feature-card, .stat-item, .team-member, .value-card").forEach((el) => {
    el.style.opacity = "0"
    el.style.transform = "translateY(20px)"
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease"
    observer.observe(el)
  })

  // Counter animation for stats
  function animateCounter(element, target) {
    let current = 0
    const increment = target / 100
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        current = target
        clearInterval(timer)
      }
      element.textContent = Math.floor(current).toLocaleString()
    }, 20)
  }

  // Animate counters when they come into view
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = Number.parseInt(entry.target.textContent.replace(/[^\d]/g, ""))
          if (target > 0) {
            animateCounter(entry.target, target)
            counterObserver.unobserve(entry.target)
          }
        }
      })
    },
    { threshold: 0.5 },
  )

  document.querySelectorAll(".stat-item h3").forEach((counter) => {
    counterObserver.observe(counter)
  })

  // Form validation and submission
  const forms = document.querySelectorAll("form")
  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      if (!validateForm(this)) {
        e.preventDefault()
      }
    })
  })

  function validateForm(form) {
    let isValid = true
    const requiredFields = form.querySelectorAll("[required]")

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        showFieldError(field, "This field is required")
        isValid = false
      } else {
        clearFieldError(field)
      }
    })

    // Email validation
    const emailFields = form.querySelectorAll('input[type="email"]')
    emailFields.forEach((field) => {
      if (field.value && !isValidEmail(field.value)) {
        showFieldError(field, "Please enter a valid email address")
        isValid = false
      }
    })

    return isValid
  }

  function showFieldError(field, message) {
    clearFieldError(field)
    const errorDiv = document.createElement("div")
    errorDiv.className = "field-error"
    errorDiv.style.cssText = "color: #e74c3c; font-size: 0.9rem; margin-top: 5px;"
    errorDiv.textContent = message
    field.parentNode.appendChild(errorDiv)
    field.style.borderColor = "#e74c3c"
  }

  function clearFieldError(field) {
    const existingError = field.parentNode.querySelector(".field-error")
    if (existingError) {
      existingError.remove()
    }
    field.style.borderColor = ""
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Search functionality
  const searchInputs = document.querySelectorAll('input[type="search"]')
  searchInputs.forEach((input) => {
    input.addEventListener("input", function () {
      const query = this.value.toLowerCase()
      // Implement search logic based on the page
      handleSearch(query)
    })
  })

  function handleSearch(query) {
    // This would be implemented based on specific page requirements
    console.log("Searching for:", query)
  }

  // Lazy loading for images
  const images = document.querySelectorAll("img[data-src]")
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        img.classList.remove("lazy")
        imageObserver.unobserve(img)
      }
    })
  })

  images.forEach((img) => imageObserver.observe(img))

  // Back to top button
  const backToTopButton = document.createElement("button")
  backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>'
  backToTopButton.className = "back-to-top"
  backToTopButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    cursor: pointer;
    display: none;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
  `

  document.body.appendChild(backToTopButton)

  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
      backToTopButton.style.display = "block"
    } else {
      backToTopButton.style.display = "none"
    }
  })

  backToTopButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  })

  // Print functionality
  window.printPage = () => {
    window.print()
  }

  // Download functionality
  window.downloadFile = (filename, content, type = "text/plain") => {
    const blob = new Blob([content], { type })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }
})

// Global utility functions
window.showAlert = (message, type = "info") => {
  const alertDiv = document.createElement("div")
  alertDiv.className = `alert alert-${type}`
  alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    ${type === "success" ? "background: #27ae60;" : ""}
    ${type === "error" ? "background: #e74c3c;" : ""}
    ${type === "warning" ? "background: #f39c12;" : ""}
    ${type === "info" ? "background: #3498db;" : ""}
  `
  alertDiv.textContent = message

  document.body.appendChild(alertDiv)

  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove()
    }
  }, 5000)
}

// Loading spinner utility
window.showLoading = (show = true) => {
  let spinner = document.getElementById("loading-spinner")

  if (show && !spinner) {
    spinner = document.createElement("div")
    spinner.id = "loading-spinner"
    spinner.innerHTML = '<div class="spinner"></div>'
    spinner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `

    const spinnerCSS = `
      .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `

    const style = document.createElement("style")
    style.textContent = spinnerCSS
    document.head.appendChild(style)

    document.body.appendChild(spinner)
  } else if (!show && spinner) {
    spinner.remove()
  }
}
