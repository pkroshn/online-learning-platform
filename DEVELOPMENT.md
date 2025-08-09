# Development Guide

This guide provides step-by-step instructions for setting up and running the Online Learning Platform in a development environment across different operating systems.

## 📋 Prerequisites

### Required Software
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download here](https://dev.mysql.com/downloads/)
- **Git** - [Download here](https://git-scm.com/downloads)
- **Code Editor** (VS Code recommended) - [Download here](https://code.visualstudio.com/)

### Package Manager
- **npm** (comes with Node.js) or **yarn** (optional)

## 🚀 Quick Start (All Platforms)

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd online-learning-platform
```

### 2. Install Dependencies
```bash
# Install root dependencies and all sub-projects
npm run install:all

# Or install manually:
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 3. Database Setup

#### Option A: Using MySQL Command Line
```bash
# Login to MySQL (you'll be prompted for password)
mysql -u root -p

# Create database
CREATE DATABASE online_learning_platform;
CREATE USER 'dev_user'@'localhost' IDENTIFIED BY 'dev_password';
GRANT ALL PRIVILEGES ON online_learning_platform.* TO 'dev_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Option B: Using MySQL Workbench (GUI)
1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Create a new schema named `online_learning_platform`
4. Create a new user `dev_user` with password `dev_password`
5. Grant all privileges to the user for the database

### 4. Environment Configuration
```bash
# Copy the example environment file
cp server/env.example server/.env
```

Edit `server/.env` with your database credentials:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=online_learning_platform
DB_USER=dev_user
DB_PASSWORD=dev_password

# JWT Configuration (use any secure random string for development)
JWT_SECRET=your-development-jwt-secret-key
JWT_EXPIRES_IN=7d

# Admin Default Credentials
ADMIN_EMAIL=admin@learningplatform.com
ADMIN_PASSWORD=admin123
```

### 5. Start the Application
```bash
# Start both backend and frontend simultaneously
npm run dev

# Backend will run on http://localhost:5000
# Frontend will run on http://localhost:3000
```

### 6. Access the Application
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Documentation**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

## 🖥️ Platform-Specific Setup

### Windows

#### Prerequisites Installation
1. **Node.js**: Download and install from [nodejs.org](https://nodejs.org/)
2. **MySQL**: 
   - Download MySQL Installer from [MySQL Downloads](https://dev.mysql.com/downloads/installer/)
   - Choose "Developer Default" setup type
   - Follow the installation wizard
3. **Git**: Download from [git-scm.com](https://git-scm.com/download/win)

#### Using Command Prompt/PowerShell
```cmd
# Check installations
node --version
npm --version
mysql --version

# Clone and setup project
git clone <repository-url>
cd online-learning-platform
npm run install:all

# Start MySQL service (if not auto-started)
net start mysql80

# Setup database (using Command Prompt)
mysql -u root -p
```

#### Using Windows Subsystem for Linux (WSL) - Optional
```bash
# Install WSL2 and Ubuntu
wsl --install

# Follow Linux instructions below in WSL terminal
```

### macOS

#### Prerequisites Installation

**Option 1: Using Homebrew (Recommended)**
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install MySQL
brew install mysql

# Start MySQL service
brew services start mysql

# Secure MySQL installation
mysql_secure_installation
```

**Option 2: Manual Installation**
1. **Node.js**: Download from [nodejs.org](https://nodejs.org/)
2. **MySQL**: Download from [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)

#### Setup Project
```bash
# Clone repository
git clone <repository-url>
cd online-learning-platform

# Install dependencies
npm run install:all

# Setup database
mysql -u root -p
```

### Linux (Ubuntu/Debian)

#### Prerequisites Installation
```bash
# Update package list
sudo apt update

# Install Node.js (using NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server

# Secure MySQL installation
sudo mysql_secure_installation

# Install Git (if not already installed)
sudo apt install git
```

#### Setup Project
```bash
# Clone repository
git clone <repository-url>
cd online-learning-platform

# Install dependencies
npm run install:all

# Setup database
sudo mysql -u root -p
```

### Linux (CentOS/RHEL/Fedora)

#### Prerequisites Installation
```bash
# For CentOS/RHEL
sudo yum install -y curl
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs mysql-server

# For Fedora
sudo dnf install -y nodejs mysql-server

# Start and enable MySQL
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Secure MySQL
sudo mysql_secure_installation
```

## 🛠️ Development Workflow

### Running in Development Mode

#### Start Both Services (Recommended)
```bash
npm run dev
```

#### Start Services Separately
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

### Development Scripts

#### Root Level Scripts
```bash
npm run dev          # Start both backend and frontend
npm run server       # Start backend only
npm run client       # Start frontend only
npm run build        # Build frontend for production
npm run test         # Run all tests
npm run install:all  # Install all dependencies
```

#### Backend Scripts (in server/ directory)
```bash
cd server
npm start            # Start production server
npm run dev          # Start development server with nodemon
npm test             # Run backend tests
npm run test:watch   # Run tests in watch mode
```

#### Frontend Scripts (in client/ directory)
```bash
cd client
npm start            # Start development server
npm run build        # Build for production
npm test             # Run frontend tests
npm run eject        # Eject from Create React App (not recommended)
```

## 🔧 Development Tools & Extensions

### Recommended VS Code Extensions
- **ES7+ React/Redux/React-Native snippets** - Code snippets
- **Prettier - Code formatter** - Code formatting
- **ESLint** - Code linting
- **Auto Rename Tag** - HTML/JSX tag renaming
- **Bracket Pair Colorizer** - Bracket highlighting
- **GitLens** - Enhanced Git capabilities
- **Thunder Client** - API testing (alternative to Postman)
- **MySQL** - Database management

### Browser Extensions
- **React Developer Tools** - React debugging
- **Redux DevTools** - Redux state debugging

## 🐛 Debugging

### Backend Debugging

#### Using VS Code Debugger
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server/index.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "runtimeExecutable": "nodemon",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

#### Console Debugging
```bash
# Enable debug logs
DEBUG=* npm run server

# Or specific modules
DEBUG=express:* npm run server
```

### Frontend Debugging

#### React DevTools
1. Install React DevTools browser extension
2. Open browser developer tools
3. Navigate to "React" or "⚛️ Components" tab

#### Redux DevTools
1. Install Redux DevTools browser extension
2. Open browser developer tools
3. Navigate to "Redux" tab

## 🧪 Testing

### Running Tests

#### All Tests
```bash
npm run test
```

#### Backend Tests Only
```bash
cd server
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

#### Frontend Tests Only
```bash
cd client
npm test

# With coverage
npm test -- --coverage --watchAll=false
```

### Writing Tests

#### Backend Test Example
```javascript
// server/tests/example.test.js
const request = require('supertest');
const app = require('../index');

describe('API Tests', () => {
  it('should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.success).toBe(true);
  });
});
```

#### Frontend Test Example
```javascript
// client/src/components/__tests__/Button.test.js
import { render, screen } from '@testing-library/react';
import Button from '../Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  const buttonElement = screen.getByText(/click me/i);
  expect(buttonElement).toBeInTheDocument();
});
```

## 🔍 API Testing

### Using Thunder Client (VS Code)
1. Install Thunder Client extension
2. Create new request
3. Set URL to `http://localhost:5000/api/courses`
4. Add Authorization header: `Bearer <your-jwt-token>`

### Using Postman
1. Import the API collection (if available)
2. Set base URL to `http://localhost:5000`
3. Configure authentication

### Using curl
```bash
# Get all courses
curl http://localhost:5000/api/courses

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@learningplatform.com","password":"admin123"}'

# Authenticated request
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🗄️ Database Management

### Using Command Line
```bash
# Connect to database
mysql -u dev_user -p online_learning_platform

# Show tables
SHOW TABLES;

# Describe table structure
DESCRIBE users;

# View data
SELECT * FROM users LIMIT 5;
```

### Using GUI Tools

#### MySQL Workbench
1. Create new connection
2. Host: localhost, Port: 3306
3. Username: dev_user, Password: dev_password
4. Default Schema: online_learning_platform

#### phpMyAdmin (Optional)
```bash
# Install using Docker
docker run --name phpmyadmin -d --link mysql:db -p 8080:80 phpmyadmin/phpmyadmin
```

### Database Reset
```bash
# Drop and recreate database
mysql -u root -p -e "DROP DATABASE IF EXISTS online_learning_platform; CREATE DATABASE online_learning_platform;"

# Restart server to trigger auto-migration
npm run server
```

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000          # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>          # macOS/Linux
taskkill /PID <PID> /F # Windows
```

#### Database Connection Issues
```bash
# Check MySQL service status
sudo systemctl status mysql    # Linux
brew services list | grep mysql # macOS
net start mysql80              # Windows

# Test connection
mysql -u dev_user -p -h localhost online_learning_platform
```

#### Node.js Version Issues
```bash
# Check Node.js version
node --version

# Use Node Version Manager (nvm)
# Install nvm first, then:
nvm install 18
nvm use 18
```

#### Permission Issues (macOS/Linux)
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

#### Windows Specific Issues
```cmd
# Clear npm cache
npm cache clean --force

# Set execution policy (PowerShell as Admin)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Environment Variables Not Loading
1. Ensure `.env` file is in `server/` directory
2. Check file encoding (should be UTF-8)
3. Restart the server after changes
4. Verify no spaces around `=` in `.env` file

### Frontend Build Issues
```bash
# Clear React cache
cd client
rm -rf node_modules package-lock.json
npm install

# Clear browser cache
# Or use incognito/private browsing mode
```

## 📝 Development Best Practices

### Code Style
- Use Prettier for code formatting
- Follow ESLint rules
- Use meaningful variable and function names
- Add comments for complex logic

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request
```

### Database Changes
- Always backup before making schema changes
- Test migrations thoroughly
- Document database changes

### API Development
- Follow RESTful conventions
- Use proper HTTP status codes
- Validate input data
- Handle errors gracefully
- Document API changes

## 🎯 Next Steps

Once you have the development environment running:

1. **Explore the codebase** - Understand the project structure
2. **Check API documentation** - Visit http://localhost:5000/api-docs
3. **Run tests** - Ensure everything is working
4. **Create test data** - Register users and create courses
5. **Start developing** - Add new features or fix bugs

## 🆘 Getting Help

If you encounter issues:

1. Check this development guide
2. Review the main [README.md](README.md)
3. Check the console logs for error details
4. Ensure all prerequisites are properly installed
5. Verify environment variables are correctly set
6. Try restarting the development servers

---

**Happy Coding! 🚀**