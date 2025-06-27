// Authentication Management
class AuthManager {
  constructor(db) {
    this.db = db
    this.currentUser = null
    this.sessionTimeout = 24 * 60 * 60 * 1000 // 24 hours
    this.loadSession()
  }

  // Login functionality
  async login(username, password, userType) {
    try {
      const user = this.db.getUserByUsername(username)

      if (!user) {
        throw new Error("User not found")
      }

      if (user.password !== password) {
        throw new Error("Invalid password")
      }

      if (user.role !== userType) {
        throw new Error("Invalid user type selected")
      }

      if (user.status !== "active") {
        throw new Error("Account is inactive")
      }

      // Create session
      this.currentUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        loginTime: new Date().toISOString(),
      }

      this.saveSession()

      return { success: true, user: this.currentUser }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Logout functionality
  logout() {
    this.currentUser = null
    localStorage.removeItem("userSession")
    window.location.href = "login.html"
  }

  // Session management
  saveSession() {
    const sessionData = {
      user: this.currentUser,
      timestamp: new Date().getTime(),
    }
    localStorage.setItem("userSession", JSON.stringify(sessionData))
  }

  loadSession() {
    const sessionData = localStorage.getItem("userSession")
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData)
        const now = new Date().getTime()

        // Check if session is still valid
        if (now - session.timestamp < this.sessionTimeout) {
          this.currentUser = session.user
          return true
        } else {
          // Session expired
          localStorage.removeItem("userSession")
        }
      } catch (error) {
        console.error("Error loading session:", error)
        localStorage.removeItem("userSession")
      }
    }
    return false
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser
  }

  // Check user role
  hasRole(role) {
    return this.currentUser && this.currentUser.role === role
  }

  // Check if user has permission
  hasPermission(permission) {
    if (!this.currentUser) return false

    const permissions = {
      admin: ["view_all", "edit_all", "delete_all", "manage_users", "view_reports"],
      teacher: ["view_own", "edit_own", "view_students", "mark_attendance"],
      student: ["view_own", "mark_own_attendance"],
    }

    return permissions[this.currentUser.role]?.includes(permission) || false
  }

  // Redirect based on authentication status
  redirectToDashboard() {
    if (this.isAuthenticated()) {
      window.location.href = "dashboard.html"
    } else {
      window.location.href = "login.html"
    }
  }

  // Password validation
  validatePassword(password) {
    const minLength = 6
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)

    const errors = []

    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`)
    }

    if (!hasUpperCase) {
      errors.push("Password must contain at least one uppercase letter")
    }

    if (!hasLowerCase) {
      errors.push("Password must contain at least one lowercase letter")
    }

    if (!hasNumbers) {
      errors.push("Password must contain at least one number")
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      if (!this.currentUser) {
        throw new Error("User not authenticated")
      }

      const user = this.db.getUserById(this.currentUser.id)
      if (user.password !== currentPassword) {
        throw new Error("Current password is incorrect")
      }

      const validation = this.validatePassword(newPassword)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "))
      }

      this.db.updateUser(this.currentUser.id, { password: newPassword })

      return { success: true, message: "Password changed successfully" }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Update profile
  async updateProfile(profileData) {
    try {
      if (!this.currentUser) {
        throw new Error("User not authenticated")
      }

      const updatedUser = this.db.updateUser(this.currentUser.id, profileData)
      if (updatedUser) {
        // Update current session
        this.currentUser = {
          ...this.currentUser,
          ...profileData,
        }
        this.saveSession()

        return { success: true, user: this.currentUser }
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Registration (for admin use)
  async register(userData) {
    try {
      // Check if user already exists
      const existingUser = this.db.getUserByUsername(userData.username) || this.db.getUserByUsername(userData.email)

      if (existingUser) {
        throw new Error("User already exists with this username or email")
      }

      // Validate password
      const validation = this.validatePassword(userData.password)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "))
      }

      // Create new user
      const newUser = this.db.addUser(userData)

      return { success: true, user: newUser }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Account recovery (basic implementation)
  async requestPasswordReset(email) {
    try {
      const user = this.db.getUserByUsername(email)
      if (!user) {
        throw new Error("No account found with this email address")
      }

      // In a real application, this would send an email
      // For demo purposes, we'll just return a reset token
      const resetToken = this.generateResetToken()

      // Store reset token (in real app, this would be in database with expiration)
      localStorage.setItem(
        `reset_${resetToken}`,
        JSON.stringify({
          userId: user.id,
          timestamp: new Date().getTime(),
          expires: new Date().getTime() + 60 * 60 * 1000, // 1 hour
        }),
      )

      return {
        success: true,
        message: "Password reset instructions sent to your email",
        resetToken: resetToken, // In real app, this wouldn't be returned
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Reset password with token
  async resetPassword(token, newPassword) {
    try {
      const resetData = localStorage.getItem(`reset_${token}`)
      if (!resetData) {
        throw new Error("Invalid or expired reset token")
      }

      const reset = JSON.parse(resetData)
      if (new Date().getTime() > reset.expires) {
        localStorage.removeItem(`reset_${token}`)
        throw new Error("Reset token has expired")
      }

      const validation = this.validatePassword(newPassword)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "))
      }

      this.db.updateUser(reset.userId, { password: newPassword })
      localStorage.removeItem(`reset_${token}`)

      return { success: true, message: "Password reset successfully" }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Generate reset token
  generateResetToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  // Activity logging
  logActivity(action, details = {}) {
    if (!this.currentUser) return

    const activity = {
      userId: this.currentUser.id,
      action: action,
      details: details,
      timestamp: new Date().toISOString(),
      ip: "localhost", // In real app, get actual IP
      userAgent: navigator.userAgent,
    }

    // Store activity log
    const activities = JSON.parse(localStorage.getItem("activityLog") || "[]")
    activities.unshift(activity)

    // Keep only last 1000 activities
    if (activities.length > 1000) {
      activities.splice(1000)
    }

    localStorage.setItem("activityLog", JSON.stringify(activities))
  }

  // Get user activities
  getUserActivities(limit = 50) {
    if (!this.currentUser) return []

    const activities = JSON.parse(localStorage.getItem("activityLog") || "[]")
    return activities.filter((activity) => activity.userId === this.currentUser.id).slice(0, limit)
  }
}

// Initialize auth manager with actual database when DOM loads
document.addEventListener("DOMContentLoaded", () => {
  // Wait for database to be available
  if (window.db) {
    window.auth = new AuthManager(window.db)
  } else {
    // Fallback if database isn't loaded yet
    setTimeout(() => {
      window.auth = new AuthManager(window.db)
    }, 100)
  }
})

// Make AuthManager available globally
window.AuthManager = AuthManager

// Demo credentials helper
function fillDemoCredentials(type) {
  const credentials = {
    admin: { username: "admin", password: "admin123" },
    teacher: { username: "teacher1", password: "teacher123" },
    student: { username: "student1", password: "student123" },
  }

  if (credentials[type]) {
    document.getElementById("userType").value = type
    document.getElementById("username").value = credentials[type].username
    document.getElementById("password").value = credentials[type].password
  }
}

// Login form handler
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm")

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const formData = new FormData(loginForm)
      const username = formData.get("username")
      const password = formData.get("password")
      const userType = formData.get("userType")

      if (!username || !password || !userType) {
        showMessage("Please fill in all fields", "error")
        return
      }

      // Show loading state
      const submitBtn = loginForm.querySelector('button[type="submit"]')
      const originalText = submitBtn.textContent
      submitBtn.textContent = "Signing in..."
      submitBtn.disabled = true

      const auth = window.auth // Declare the auth variable here

      try {
        const result = await auth.login(username, password, userType)

        if (result.success) {
          showMessage("Login successful! Redirecting...", "success")
          auth.logActivity("login", { userType })

          // Redirect after short delay
          setTimeout(() => {
            auth.redirectToDashboard()
          }, 1000)
        } else {
          showMessage(result.error, "error")
        }
      } catch (error) {
        showMessage("An error occurred during login", "error")
        console.error("Login error:", error)
      } finally {
        submitBtn.textContent = originalText
        submitBtn.disabled = false
      }
    })
  }

  // Check if user is already logged in
  if (window.location.pathname.includes("login.html") && window.auth.isAuthenticated()) {
    window.auth.redirectToDashboard()
  }

  // Protect dashboard pages
  if (window.location.pathname.includes("dashboard.html") && !window.auth.isAuthenticated()) {
    window.location.href = "login.html"
  }
})

// Message display helper
function showMessage(message, type = "info") {
  // Remove existing messages
  const existingMessages = document.querySelectorAll(".auth-message")
  existingMessages.forEach((msg) => msg.remove())

  // Create message element
  const messageDiv = document.createElement("div")
  messageDiv.className = `auth-message ${type}`
  messageDiv.style.cssText = `
        padding: 12px 20px;
        margin: 15px 0;
        border-radius: 5px;
        font-weight: 500;
        text-align: center;
        ${type === "success" ? "background: #d5f4e6; color: #27ae60; border: 1px solid #27ae60;" : ""}
        ${type === "error" ? "background: #fadbd8; color: #e74c3c; border: 1px solid #e74c3c;" : ""}
        ${type === "info" ? "background: #d6eaf8; color: #3498db; border: 1px solid #3498db;" : ""}
    `
  messageDiv.textContent = message

  // Insert message
  const form = document.getElementById("loginForm")
  if (form) {
    form.insertBefore(messageDiv, form.firstChild)

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove()
      }
    }, 5000)
  }
}

// Logout function
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    window.auth.logActivity("logout")
    window.auth.logout()
  }
}

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = AuthManager
}
