// Database Management using localStorage (SQLite3 simulation)
class AttendanceDB {
  constructor() {
    this.initializeDatabase()
  }

  initializeDatabase() {
    // Initialize tables if they don't exist
    if (!localStorage.getItem("users")) {
      this.createUsersTable()
    }
    if (!localStorage.getItem("attendance")) {
      this.createAttendanceTable()
    }
    if (!localStorage.getItem("settings")) {
      this.createSettingsTable()
    }
  }

  createUsersTable() {
    const defaultUsers = [
      {
        id: 1,
        username: "admin",
        email: "admin@attendease.com",
        password: "admin123",
        fullName: "System Administrator",
        role: "admin",
        status: "active",
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        username: "teacher1",
        email: "teacher@attendease.com",
        password: "teacher123",
        fullName: "John Teacher",
        role: "teacher",
        status: "active",
        createdAt: new Date().toISOString(),
      },
      {
        id: 3,
        username: "student1",
        email: "student@attendease.com",
        password: "student123",
        fullName: "Jane Student",
        role: "student",
        status: "active",
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem("users", JSON.stringify(defaultUsers))
  }

  createAttendanceTable() {
    localStorage.setItem("attendance", JSON.stringify([]))
  }

  createSettingsTable() {
    const defaultSettings = {
      workingHours: {
        start: "09:00",
        end: "17:00",
      },
      lateThreshold: 15, // minutes
      timezone: "UTC",
    }
    localStorage.setItem("settings", JSON.stringify(defaultSettings))
  }

  // User Management
  getAllUsers() {
    return JSON.parse(localStorage.getItem("users") || "[]")
  }

  getUserById(id) {
    const users = this.getAllUsers()
    return users.find((user) => user.id === Number.parseInt(id))
  }

  getUserByUsername(username) {
    const users = this.getAllUsers()
    return users.find((user) => user.username === username || user.email === username)
  }

  addUser(userData) {
    const users = this.getAllUsers()
    const newUser = {
      id: Math.max(...users.map((u) => u.id), 0) + 1,
      ...userData,
      status: "active",
      createdAt: new Date().toISOString(),
    }
    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))
    return newUser
  }

  updateUser(id, userData) {
    const users = this.getAllUsers()
    const index = users.findIndex((user) => user.id === Number.parseInt(id))
    if (index !== -1) {
      users[index] = { ...users[index], ...userData, updatedAt: new Date().toISOString() }
      localStorage.setItem("users", JSON.stringify(users))
      return users[index]
    }
    return null
  }

  deleteUser(id) {
    const users = this.getAllUsers()
    const filteredUsers = users.filter((user) => user.id !== Number.parseInt(id))
    localStorage.setItem("users", JSON.stringify(filteredUsers))
    return true
  }

  // Attendance Management
  getAllAttendance() {
    return JSON.parse(localStorage.getItem("attendance") || "[]")
  }

  getAttendanceByUser(userId, startDate = null, endDate = null) {
    const attendance = this.getAllAttendance()
    let userAttendance = attendance.filter((record) => record.userId === Number.parseInt(userId))

    if (startDate && endDate) {
      userAttendance = userAttendance.filter((record) => {
        const recordDate = new Date(record.date)
        return recordDate >= new Date(startDate) && recordDate <= new Date(endDate)
      })
    }

    return userAttendance.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  getTodayAttendance(userId) {
    const today = new Date().toISOString().split("T")[0]
    const attendance = this.getAllAttendance()
    return attendance.find((record) => record.userId === Number.parseInt(userId) && record.date === today)
  }

  markAttendance(userId, type) {
    const attendance = this.getAllAttendance()
    const today = new Date().toISOString().split("T")[0]
    const now = new Date()
    const timeString = now.toTimeString().split(" ")[0]

    let todayRecord = attendance.find((record) => record.userId === Number.parseInt(userId) && record.date === today)

    if (!todayRecord) {
      todayRecord = {
        id: Math.max(...attendance.map((a) => a.id), 0) + 1,
        userId: Number.parseInt(userId),
        date: today,
        checkIn: null,
        checkOut: null,
        status: "absent",
        duration: 0,
        createdAt: now.toISOString(),
      }
      attendance.push(todayRecord)
    }

    if (type === "in" && !todayRecord.checkIn) {
      todayRecord.checkIn = timeString
      todayRecord.status = this.calculateStatus(timeString)
    } else if (type === "out" && todayRecord.checkIn && !todayRecord.checkOut) {
      todayRecord.checkOut = timeString
      todayRecord.duration = this.calculateDuration(todayRecord.checkIn, todayRecord.checkOut)
    }

    todayRecord.updatedAt = now.toISOString()
    localStorage.setItem("attendance", JSON.stringify(attendance))
    return todayRecord
  }

  calculateStatus(checkInTime) {
    const settings = JSON.parse(localStorage.getItem("settings"))
    const workStart = settings.workingHours.start
    const lateThreshold = settings.lateThreshold

    const checkIn = new Date(`2000-01-01T${checkInTime}`)
    const workStartTime = new Date(`2000-01-01T${workStart}`)
    const lateTime = new Date(workStartTime.getTime() + lateThreshold * 60000)

    if (checkIn <= workStartTime) {
      return "present"
    } else if (checkIn <= lateTime) {
      return "present"
    } else {
      return "late"
    }
  }

  calculateDuration(checkIn, checkOut) {
    const start = new Date(`2000-01-01T${checkIn}`)
    const end = new Date(`2000-01-01T${checkOut}`)
    return Math.round((end - start) / (1000 * 60)) // Duration in minutes
  }

  // Statistics and Reports
  getAttendanceStats(userId, period = "month") {
    const attendance = this.getAttendanceByUser(userId)
    const now = new Date()
    let startDate

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const periodAttendance = attendance.filter((record) => new Date(record.date) >= startDate)

    const totalDays = periodAttendance.length
    const presentDays = periodAttendance.filter(
      (record) => record.status === "present" || record.status === "late",
    ).length
    const lateDays = periodAttendance.filter((record) => record.status === "late").length
    const absentDays = periodAttendance.filter((record) => record.status === "absent").length

    return {
      totalDays,
      presentDays,
      lateDays,
      absentDays,
      attendanceRate: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
    }
  }

  getRecentActivity(userId, limit = 10) {
    const attendance = this.getAttendanceByUser(userId)
    return attendance.slice(0, limit)
  }

  // Settings Management
  getSettings() {
    return JSON.parse(localStorage.getItem("settings"))
  }

  updateSettings(newSettings) {
    const currentSettings = this.getSettings()
    const updatedSettings = { ...currentSettings, ...newSettings }
    localStorage.setItem("settings", JSON.stringify(updatedSettings))
    return updatedSettings
  }

  // Data Export
  exportAttendanceData(userId, format = "json", startDate = null, endDate = null) {
    const attendance = this.getAttendanceByUser(userId, startDate, endDate)
    const user = this.getUserById(userId)

    const exportData = {
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role,
      },
      attendance: attendance,
      exportDate: new Date().toISOString(),
      period: {
        start: startDate,
        end: endDate,
      },
    }

    if (format === "csv") {
      return this.convertToCSV(attendance)
    }

    return JSON.stringify(exportData, null, 2)
  }

  convertToCSV(data) {
    if (!data.length) return ""

    const headers = ["Date", "Check In", "Check Out", "Duration (minutes)", "Status"]
    const csvContent = [
      headers.join(","),
      ...data.map((record) =>
        [record.date, record.checkIn || "", record.checkOut || "", record.duration || 0, record.status].join(","),
      ),
    ].join("\n")

    return csvContent
  }

  // Search and Filter
  searchAttendance(userId, query, filters = {}) {
    let attendance = this.getAttendanceByUser(userId)

    // Apply date filters
    if (filters.startDate) {
      attendance = attendance.filter((record) => new Date(record.date) >= new Date(filters.startDate))
    }

    if (filters.endDate) {
      attendance = attendance.filter((record) => new Date(record.date) <= new Date(filters.endDate))
    }

    // Apply status filter
    if (filters.status) {
      attendance = attendance.filter((record) => record.status === filters.status)
    }

    // Apply text search
    if (query) {
      attendance = attendance.filter(
        (record) =>
          record.date.includes(query) ||
          (record.checkIn && record.checkIn.includes(query)) ||
          (record.checkOut && record.checkOut.includes(query)) ||
          record.status.toLowerCase().includes(query.toLowerCase()),
      )
    }

    return attendance
  }

  // Bulk Operations
  bulkUpdateAttendance(updates) {
    const attendance = this.getAllAttendance()

    updates.forEach((update) => {
      const index = attendance.findIndex((record) => record.id === update.id)
      if (index !== -1) {
        attendance[index] = { ...attendance[index], ...update, updatedAt: new Date().toISOString() }
      }
    })

    localStorage.setItem("attendance", JSON.stringify(attendance))
    return true
  }

  bulkDeleteAttendance(ids) {
    const attendance = this.getAllAttendance()
    const filteredAttendance = attendance.filter((record) => !ids.includes(record.id))
    localStorage.setItem("attendance", JSON.stringify(filteredAttendance))
    return true
  }

  // Database Maintenance
  clearAllData() {
    localStorage.removeItem("users")
    localStorage.removeItem("attendance")
    localStorage.removeItem("settings")
    this.initializeDatabase()
  }

  backupData() {
    const backup = {
      users: this.getAllUsers(),
      attendance: this.getAllAttendance(),
      settings: this.getSettings(),
      backupDate: new Date().toISOString(),
    }
    return JSON.stringify(backup, null, 2)
  }

  restoreData(backupData) {
    try {
      const data = JSON.parse(backupData)
      localStorage.setItem("users", JSON.stringify(data.users))
      localStorage.setItem("attendance", JSON.stringify(data.attendance))
      localStorage.setItem("settings", JSON.stringify(data.settings))
      return true
    } catch (error) {
      console.error("Error restoring data:", error)
      return false
    }
  }
}

// Initialize database
const db = new AttendanceDB()

// Make database available globally for browser
window.db = new AttendanceDB()
