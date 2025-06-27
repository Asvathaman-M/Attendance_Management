// Contact Form Handler
document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm")

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault()

      // Get form data
      const formData = new FormData(this)
      const contactData = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        company: formData.get("company"),
        subject: formData.get("subject"),
        message: formData.get("message"),
        newsletter: formData.get("newsletter") === "on",
        timestamp: new Date().toISOString(),
      }

      // Show loading
      const submitBtn = this.querySelector('button[type="submit"]')
      const originalText = submitBtn.innerHTML
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...'
      submitBtn.disabled = true

      // Simulate form submission
      setTimeout(() => {
        // Store contact submission
        const contacts = JSON.parse(localStorage.getItem("contactSubmissions") || "[]")
        contacts.unshift(contactData)
        localStorage.setItem("contactSubmissions", JSON.stringify(contacts))

        // Show success message
        showContactMessage("Thank you for your message! We'll get back to you soon.", "success")

        // Reset form
        this.reset()

        // Reset button
        submitBtn.innerHTML = originalText
        submitBtn.disabled = false
      }, 2000)
    })
  }
})

function showContactMessage(message, type = "info") {
  // Remove existing messages
  const existingMessages = document.querySelectorAll(".contact-message")
  existingMessages.forEach((msg) => msg.remove())

  // Create message element
  const messageDiv = document.createElement("div")
  messageDiv.className = `contact-message ${type}`
  messageDiv.style.cssText = `
    padding: 15px 20px;
    margin: 20px 0;
    border-radius: 5px;
    font-weight: 500;
    ${type === "success" ? "background: #d5f4e6; color: #27ae60; border: 1px solid #27ae60;" : ""}
    ${type === "error" ? "background: #fadbd8; color: #e74c3c; border: 1px solid #e74c3c;" : ""}
    ${type === "info" ? "background: #d6eaf8; color: #3498db; border: 1px solid #3498db;" : ""}
  `
  messageDiv.innerHTML = `<i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i> ${message}`

  // Insert message
  const form = document.getElementById("contactForm")
  if (form) {
    form.parentNode.insertBefore(messageDiv, form)

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove()
      }
    }, 5000)
  }
}
