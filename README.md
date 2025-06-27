# AttendEase - Attendance Management System

A comprehensive web-based attendance management system built with HTML, CSS, and JavaScript.

## 🚀 Quick Start

### Method 1: Using Node.js (Recommended)

1. **Install Node.js** (if not already installed)
   - Download from: https://nodejs.org/

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start the server**
   \`\`\`bash
   npm start
   \`\`\`
   This will open the application at `http://localhost:8080`

### Method 2: Using Python

1. **Navigate to project directory**
   \`\`\`bash
   cd attendance-management-system
   \`\`\`

2. **Start Python server**
   \`\`\`bash
   # Python 3
   python -m http.server 8080
   
   # Python 2
   python -m SimpleHTTPServer 8080
   \`\`\`

3. **Open browser** and go to `http://localhost:8080`

### Method 3: Direct File Opening

Simply double-click `index.html` to open in your browser.

## 🧪 Testing the System

### Demo Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Teacher | teacher1 | teacher123 |
| Student | student1 | student123 |

### Test Steps

1. **Homepage**: Navigate through all pages (Home, About, Features, Contact)
2. **Login**: Use demo accounts to test authentication
3. **Dashboard**: Test attendance marking, view records, generate reports
4. **Admin Features**: Add/manage users (admin account only)
5. **Contact Form**: Submit test messages

## 🛠 Troubleshooting

### Common Issues

1. **Demo login not working**
   - Clear browser cache and localStorage
   - Try different browser
   - Check browser console for errors

2. **Dashboard not loading**
   - Ensure you're using a local server (not file://)
   - Check JavaScript console for errors

3. **Data not persisting**
   - Data is stored in localStorage
   - Clear localStorage to reset: `localStorage.clear()`

### Browser Console Commands

\`\`\`javascript
// Clear all data
localStorage.clear();

// Check stored data
console.log('Users:', localStorage.getItem('users'));
console.log('Attendance:', localStorage.getItem('attendance'));
console.log('Session:', localStorage.getItem('userSession'));

// Reset to default data
window.db.clearAllData();
\`\`\`

## 📁 Project Structure

\`\`\`
attendance-management-system/
├── index.html              # Homepage
├── login.html              # Login page
├── dashboard.html          # Main dashboard
├── about.html              # About page
├── features.html           # Features page
├── contact.html            # Contact page
├── styles/
│   └── main.css           # Main stylesheet
├── scripts/
│   ├── database.js        # Database management
│   ├── auth.js           # Authentication
│   ├── dashboard.js      # Dashboard functionality
│   ├── main.js           # General utilities
│   └── contact.js        # Contact form handler
├── package.json          # Node.js configuration
└── README.md            # This file
\`\`\`

## 🌟 Features

- ✅ Multi-user authentication (Admin, Teacher, Student)
- ✅ Real-time attendance tracking
- ✅ Dashboard with statistics
- ✅ Report generation (CSV export)
- ✅ User management (Admin)
- ✅ Responsive design
- ✅ Contact form
- ✅ Local data storage (localStorage)

## 🔧 Development

### Adding New Features

1. **Database**: Modify `scripts/database.js`
2. **Authentication**: Update `scripts/auth.js`
3. **UI**: Edit HTML files and `styles/main.css`
4. **Functionality**: Add to respective JavaScript files

### Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📝 License

MIT License - feel free to use and modify as needed.
