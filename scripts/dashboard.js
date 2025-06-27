// Dashboard Management
class DashboardManager {
  constructor(auth, db) {
    this.currentSection = "dashboard"
    this.attendanceChart = null
    this.auth = auth
    this.db = db
    this.init()
  }

  init() {
    this.checkAuthentication()
    this.setupEventListeners()
    this.loadUserInfo()
    this.updateDateTime()
    this.loadDashboardData()

    // Update time every minute
    setInterval(() => this.updateDateTime(), 60000)
  }

  checkAuthentication() {
    if (!this.auth.isAuthenticated()) {
      window.location.href = "login.html"
      return
    }

    // Show admin menu if user is admin
    if (this.auth.hasRole("admin")) {
      const adminMenu = document.getElementById("adminMenu")
      if (adminMenu) {
        adminMenu.style.display = "block"
      }
    }
  }

  setupEventListeners() {
    // Add user form
    const addUserForm = document.getElementById("addUserForm")
    if (addUserForm) {
      addUserForm.addEventListener("submit", (e) => this.handleAddUser(e))
    }

    // Date filters
    const dateFilter = document.getElementById("dateFilter")
    const monthFilter = document.getElementById("monthFilter")

    if (dateFilter) {
      dateFilter.addEventListener("change", () => this.filterRecords())
    }

    if (monthFilter) {
      monthFilter.addEventListener("change", () => this.filterRecords())
    }
  }

  loadUserInfo() {
    const user = this.auth.getCurrentUser()
    if (user) {
      const userWelcome = document.getElementById("userWelcome")
      if (userWelcome) {
        userWelcome.textContent = `Welcome, ${user.fullName}`
      }
    }
  }

  updateDateTime() {
    const now = new Date()

    // Update current date
    const currentDate = document.getElementById("currentDate")
    if (currentDate) {
      currentDate.textContent = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }

    // Update current time
    const currentTime = document.getElementById("currentTime")
    if (currentTime) {
      currentTime.textContent = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    }
  }

  loadDashboardData() {
    const user = this.auth.getCurrentUser()
    if (!user) return

    this.loadAttendanceStats()
    this.loadRecentActivity()
    this.loadTodayAttendanceStatus()
    this.loadAttendanceRecords()

    if (this.auth.hasRole("admin")) {
      this.loadUsersData()
    }
  }

  loadAttendanceStats() {
    const user = this.auth.getCurrentUser()
    if (!user) return

    const stats = this.db.getAttendanceStats(user.id)

    // Update stat cards
    const todayAttendance = document.getElementById("todayAttendance")
    const weekAttendance = document.getElementById("weekAttendance")
    const monthAttendance = document.getElementById("monthAttendance")
    const attendanceRate = document.getElementById("attendanceRate")

    if (todayAttendance) {
      const todayRecord = this.db.getTodayAttendance(user.id)
      todayAttendance.textContent = todayRecord ? "1" : "0"
    }

    if (weekAttendance) {
      const weekStats = this.db.getAttendanceStats(user.id, "week")
      weekAttendance.textContent = weekStats.presentDays
    }

    if (monthAttendance) {
      const monthStats = this.db.getAttendanceStats(user.id, "month")
      monthAttendance.textContent = monthStats.presentDays
    }

    if (attendanceRate) {
      attendanceRate.textContent = `${stats.attendanceRate}%`
    }
  }

  loadRecentActivity() {
    const user = this.auth.getCurrentUser()
    if (!user) return

    const activities = this.db.getRecentActivity(user.id, 5)
    const activityList = document.getElementById("recentActivity")

    if (activityList) {
      if (activities.length === 0) {
        activityList.innerHTML = '<p class="no-activity">No recent activity</p>'
        return
      }

      activityList.innerHTML = activities
        .map(
          (activity) => `
        <div class="activity-item">
          <div class="activity-icon ${activity.checkIn ? "check-in" : "check-out"}">
            <i class="fas fa-${activity.checkIn ? "sign-in-alt" : "sign-out-alt"}"></i>
          </div>
          <div class="activity-details">
            <h4>${activity.checkIn ? "Checked In" : "Checked Out"}</h4>
            <p>${new Date(activity.date).toLocaleDateString()} at ${activity.checkIn || activity.checkOut}</p>
          </div>
        </div>
      `,
        )
        .join("")
    }
  }

  loadTodayAttendanceStatus() {
    const user = this.auth.getCurrentUser()
    if (!user) return

    const todayRecord = this.db.getTodayAttendance(user.id)
    const attendanceStatus = document.getElementById("attendanceStatus")
    const checkInBtn = document.getElementById("checkInBtn")
    const checkOutBtn = document.getElementById("checkOutBtn")
    const todaySummary = document.getElementById("todaySummary")

    if (!attendanceStatus || !checkInBtn || !checkOutBtn) return

    if (!todayRecord || !todayRecord.checkIn) {
      // Not checked in yet
      attendanceStatus.innerHTML = `
        <i class="fas fa-clock"></i>
        <strong>Ready to Check In</strong>
        <p>Click the Check In button to mark your attendance for today</p>
      `
      attendanceStatus.className = "attendance-status checked-out"
      checkInBtn.disabled = false
      checkOutBtn.disabled = true
    } else if (todayRecord.checkIn && !todayRecord.checkOut) {
      // Checked in, not checked out
      attendanceStatus.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <strong>Checked In</strong>
        <p>You checked in at ${todayRecord.checkIn}</p>
      `
      attendanceStatus.className = "attendance-status checked-in"
      checkInBtn.disabled = true
      checkOutBtn.disabled = false
    } else {
      // Fully completed day
      attendanceStatus.innerHTML = `
        <i class="fas fa-calendar-check"></i>
        <strong>Day Complete</strong>
        <p>You worked from ${todayRecord.checkIn} to ${todayRecord.checkOut}</p>
      `
      attendanceStatus.className = "attendance-status checked-in"
      checkInBtn.disabled = true
      checkOutBtn.disabled = true
    }

    // Update today's summary
    if (todaySummary && todayRecord) {
      const duration = todayRecord.duration || 0
      const hours = Math.floor(duration / 60)
      const minutes = duration % 60

      todaySummary.innerHTML = `
        <h3>Today's Summary</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <strong>Check In:</strong> ${todayRecord.checkIn || "Not checked in"}
          </div>
          <div class="summary-item">
            <strong>Check Out:</strong> ${todayRecord.checkOut || "Not checked out"}
          </div>
          <div class="summary-item">
            <strong>Duration:</strong> ${hours}h ${minutes}m
          </div>
          <div class="summary-item">
            <strong>Status:</strong> 
            <span class="status-badge ${todayRecord.status}">${todayRecord.status}</span>
          </div>
        </div>
      `
    }
  }

  loadAttendanceRecords() {
    const user = this.auth.getCurrentUser()
    if (!user) return

    const records = this.db.getAttendanceByUser(user.id)
    const tableBody = document.getElementById("recordsTableBody")

    if (tableBody) {
      if (records.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No attendance records found</td></tr>'
        return
      }

      tableBody.innerHTML = records
        .map((record) => {
          const duration = record.duration || 0
          const hours = Math.floor(duration / 60)
          const minutes = duration % 60

          return `
          <tr>
            <td>${new Date(record.date).toLocaleDateString()}</td>
            <td>${record.checkIn || "-"}</td>
            <td>${record.checkOut || "-"}</td>
            <td>${hours}h ${minutes}m</td>
            <td><span class="status-badge ${record.status}">${record.status}</span></td>
          </tr>
        `
        })
        .join("")
    }
  }

  loadUsersData() {
    if (!this.auth.hasRole("admin")) return

    const users = this.db.getAllUsers()
    const tableBody = document.getElementById("usersTableBody")

    if (tableBody) {
      tableBody.innerHTML = users
        .map(
          (user) => `
        <tr>
          <td>${user.id}</td>
          <td>${user.fullName}</td>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td><span class="status-badge ${user.status}">${user.status}</span></td>
          <td>
            <div class="action-buttons">
              <button class="btn-icon btn-edit" onclick="editUser(${user.id})" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon btn-delete" onclick="deleteUser(${user.id})" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `,
        )
        .join("")
    }
  }

  filterRecords() {
    const dateFilter = document.getElementById("dateFilter")
    const monthFilter = document.getElementById("monthFilter")

    if (!dateFilter || !monthFilter) return

    const user = this.auth.getCurrentUser()
    if (!user) return

    let records = this.db.getAttendanceByUser(user.id)

    // Apply date filter
    if (dateFilter.value) {
      records = records.filter((record) => record.date === dateFilter.value)
    }

    // Apply month filter
    if (monthFilter.value !== "") {
      const selectedMonth = Number.parseInt(monthFilter.value)
      records = records.filter((record) => {
        const recordDate = new Date(record.date)
        return recordDate.getMonth() === selectedMonth
      })
    }

    // Update table
    const tableBody = document.getElementById("recordsTableBody")
    if (tableBody) {
      if (records.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No records found for selected filters</td></tr>'
        return
      }

      tableBody.innerHTML = records
        .map((record) => {
          const duration = record.duration || 0
          const hours = Math.floor(duration / 60)
          const minutes = duration % 60

          return `
          <tr>
            <td>${new Date(record.date).toLocaleDateString()}</td>
            <td>${record.checkIn || "-"}</td>
            <td>${record.checkOut || "-"}</td>
            <td>${hours}h ${minutes}m</td>
            <td><span class="status-badge ${record.status}">${record.status}</span></td>
          </tr>
        `
        })
        .join("")
    }
  }

  handleAddUser(e) {
    e.preventDefault()

    if (!this.auth.hasRole("admin")) {
      alert("Access denied")
      return
    }

    const formData = new FormData(e.target)
    const userData = {
      fullName: formData.get("newUserName"),
      email: formData.get("newUserEmail"),
      username: formData.get("newUserEmail"), // Use email as username
      password: formData.get("newUserPassword"),
      role: formData.get("newUserRole"),
    }

    const result = this.auth.register(userData)

    if (result.success) {
      alert("User added successfully!")
      this.closeAddUserModal()
      this.loadUsersData()
      e.target.reset()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  showAddUserModal() {
    const modal = document.getElementById("addUserModal")
    if (modal) {
      modal.style.display = "block"
    }
  }

  closeAddUserModal() {
    const modal = document.getElementById("addUserModal")
    if (modal) {
      modal.style.display = "none"
    }
  }
}

// Global functions for dashboard
function showSection(sectionName) {
  // Hide all sections
  const sections = document.querySelectorAll(".dashboard-section")
  sections.forEach((section) => section.classList.remove("active"))

  // Show selected section
  const targetSection = document.getElementById(sectionName + "Section")
  if (targetSection) {
    targetSection.classList.add("active")
  }

  // Update sidebar
  const sidebarLinks = document.querySelectorAll(".sidebar-link")
  sidebarLinks.forEach((link) => link.classList.remove("active"))

  const activeLink = document.querySelector(`[onclick="showSection('${sectionName}')"]`)
  if (activeLink) {
    activeLink.classList.add("active")
  }

  // Load section-specific data
  if (window.dashboardManager) {
    switch (sectionName) {
      case "dashboard":
        window.dashboardManager.loadDashboardData()
        break
      case "records":
        window.dashboardManager.loadAttendanceRecords()
        break
      case "users":
        window.dashboardManager.loadUsersData()
        break
    }
  }
}

function markAttendance(type) {
  const user = window.dashboardManager.auth.getCurrentUser()
  if (!user) return

  const result = window.dashboardManager.db.markAttendance(user.id, type)

  if (result) {
    window.dashboardManager.auth.logActivity(`attendance_${type}`, {
      date: result.date,
      time: type === "in" ? result.checkIn : result.checkOut,
    })

    // Refresh the attendance status
    if (window.dashboardManager) {
      window.dashboardManager.loadTodayAttendanceStatus()
      window.dashboardManager.loadAttendanceStats()
      window.dashboardManager.loadRecentActivity()
    }

    const message = type === "in" ? "Checked in successfully!" : "Checked out successfully!"
    showNotification(message, "success")
  } else {
    showNotification("Error marking attendance", "error")
  }
}

function generateReport() {
  const user = window.dashboardManager.auth.getCurrentUser()
  if (!user) return

  const reportType = document.getElementById("reportType")?.value || "monthly"
  const fromDate = document.getElementById("reportFromDate")?.value
  const toDate = document.getElementById("reportToDate")?.value

  let startDate = null
  let endDate = null

  if (reportType === "custom" && fromDate && toDate) {
    startDate = fromDate
    endDate = toDate
  } else if (reportType === "monthly") {
    const now = new Date()
    startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]
  } else if (reportType === "weekly") {
    const now = new Date()
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
    startDate = weekStart.toISOString().split("T")[0]
    endDate = new Date().toISOString().split("T")[0]
  }

  const csvData = window.dashboardManager.db.exportAttendanceData(user.id, "csv", startDate, endDate)

  // Create and download file
  const blob = new Blob([csvData], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `attendance_report_${user.fullName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)

  showNotification("Report downloaded successfully!", "success")
}

function showAddUserModal() {
  if (window.dashboardManager) {
    window.dashboardManager.showAddUserModal()
  }
}

function closeAddUserModal() {
  if (window.dashboardManager) {
    window.dashboardManager.closeAddUserModal()
  }
}

function editUser(userId) {
  alert(`Edit user functionality would be implemented here for user ID: ${userId}`)
}

function deleteUser(userId) {
  if (confirm("Are you sure you want to delete this user?")) {
    if (window.dashboardManager.db.deleteUser(userId)) {
      alert("User deleted successfully!")
      if (window.dashboardManager) {
        window.dashboardManager.loadUsersData()
      }
    } else {
      alert("Error deleting user")
    }
  }
}

function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.style.cssText = `
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
    ${type === "info" ? "background: #3498db;" : ""}
  `
  notification.textContent = message

  document.body.appendChild(notification)

  // Auto remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove()
    }
  }, 3000)
}

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("dashboard.html")) {
    // Wait for auth and db to be available
    const initDashboard = () => {
      if (window.auth && window.db) {
        window.dashboardManager = new DashboardManager(window.auth, window.db)
      } else {
        setTimeout(initDashboard, 100)
      }
    }
    initDashboard()
  }
})
