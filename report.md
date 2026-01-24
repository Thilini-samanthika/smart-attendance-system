# Student Internship Portal - Project Report

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [API Architecture](#api-architecture)
7. [Frontend Architecture](#frontend-architecture)
8. [DevOps & CI/CD Pipeline](#devops--cicd-pipeline)
9. [How to Work with the Project](#how-to-work-with-the-project)
10. [Development Workflow](#development-workflow)
11. [Security Considerations](#security-considerations)
12. [Future Enhancements](#future-enhancements)

---

## Project Overview

The **Student Internship Portal** is a full-stack web application designed to streamline the internship application process for students and administrators. The platform enables:

- **Students** to browse available internships, submit applications with CVs and cover letters, and track application status
- **Administrators** to post internship opportunities, manage applications (approve/reject), and view analytics

### Key Features
- ✅ Role-based authentication (Student/Admin)
- ✅ JWT-based secure authentication
- ✅ File upload functionality for CVs
- ✅ Application status tracking
- ✅ Admin dashboard with statistics
- ✅ RESTful API architecture
- ✅ Responsive UI with Bootstrap 5
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Automated deployment to Netlify

---

## Architecture

### High-Level Architecture

The application follows a **3-tier architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Frontend (HTML/CSS/JavaScript + Bootstrap 5)       │   │
│  │   - Student Dashboard                                │   │
│  │   - Admin Dashboard                                  │   │
│  │   - Authentication Pages                             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/AJAX (REST API)
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Flask Backend (Python)                             │   │
│  │   - RESTful API Endpoints                            │   │
│  │   - JWT Authentication                               │   │
│  │   - Role-based Access Control                        │   │
│  │   - File Upload Handler                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ MySQL Connector
┌─────────────────────────────────────────────────────────────┐
│                        DATA LAYER                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   MySQL Database                                     │   │
│  │   - Students Table                                   │   │
│  │   - Admins Table                                     │   │
│  │   - Internships Table                                │   │
│  │   - Applications Table                               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Pattern
- **Pattern**: MVC (Model-View-Controller) with RESTful API
- **Frontend**: View layer (HTML/CSS/JS)
- **Backend**: Controller layer (Flask routes)
- **Database**: Model layer (MySQL tables)

---

## Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.9+ | Backend language |
| Flask | Latest | Web framework |
| Flask-CORS | Latest | Cross-Origin Resource Sharing |
| Flask-JWT-Extended | Latest | JWT authentication |
| MySQL Connector | Latest | Database driver |
| Werkzeug | Latest | Password hashing & file handling |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| HTML5 | - | Structure |
| CSS3 | - | Styling |
| JavaScript (ES6+) | - | Client-side logic |
| Bootstrap 5 | 5.x | UI framework |
| Chart.js | Latest | Data visualization |
| Fetch API | - | HTTP requests |

### Database
| Technology | Version | Purpose |
|------------|---------|---------|
| MySQL | 8.0+ | Relational database |

### DevOps & Deployment
| Technology | Purpose |
|------------|---------|
| GitHub Actions | CI/CD pipeline |
| Netlify | Frontend hosting |
| Environment Variables | Configuration management |

---

## Project Structure

```
student-internship-portal-devops/
│
├── .github/
│   └── workflows/
│       ├── ci.yml              # Continuous Integration pipeline
│       └── deploy.yml          # Netlify deployment workflow
│
├── src/
│   ├── backend/
│   │   ├── app.py              # Main Flask application
│   │   ├── requirements.txt    # Python dependencies
│   │   ├── database_setup.sql  # Database schema & seed data
│   │   ├── test_api.py         # API tests
│   │   └── uploads/            # CV file storage (auto-created)
│   │
│   └── frontend/
│       ├── index.html                  # Landing page
│       ├── login.html                  # Login page
│       ├── register.html               # Registration page
│       ├── student-dashboard.html      # Student dashboard
│       ├── internships.html            # Browse internships
│       ├── admin-dashboard.html        # Admin dashboard
│       ├── admin-internships.html      # Manage internships
│       ├── admin-applications.html     # Manage applications
│       │
│       ├── css/
│       │   └── style.css              # Custom styles
│       │
│       └── js/
│           └── script.js              # Client-side JavaScript
│
├── netlify.toml            # Netlify configuration
├── README.md               # Project documentation
└── .gitignore              # Git ignore rules
```

### Directory Breakdown

#### Backend (`src/backend/`)
- **`app.py`**: Core Flask application with all API routes, authentication, and business logic
- **`database_setup.sql`**: SQL script to create database schema and seed initial data
- **`requirements.txt`**: Python package dependencies
- **`test_api.py`**: Automated API tests
- **`uploads/`**: Directory for storing uploaded CV files

#### Frontend (`src/frontend/`)
- **HTML Pages**: Separate pages for different user flows
- **`css/style.css`**: Custom styling on top of Bootstrap
- **`js/script.js`**: Client-side JavaScript for API calls and DOM manipulation

#### CI/CD (`.github/workflows/`)
- **`ci.yml`**: Runs on every push to validate code
- **`deploy.yml`**: Deploys frontend to Netlify on main branch push

---

## Database Schema

### Entity-Relationship Diagram

```
┌─────────────────┐         ┌──────────────────┐
│    students     │         │      admins      │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │         │ id (PK)          │
│ name            │         │ name             │
│ email (UNIQUE)  │         │ email (UNIQUE)   │
│ password        │         │ password         │
│ course          │         │ created_at       │
│ year            │         └──────────────────┘
│ created_at      │                  │
└─────────────────┘                  │
        │                            │
        │                            │ (admin_id)
        │                            ↓
        │                   ┌──────────────────┐
        │                   │   internships    │
        │                   ├──────────────────┤
        │                   │ id (PK)          │
        │                   │ title            │
        │                   │ company          │
        │                   │ description      │
        │                   │ duration         │
        │                   │ slots            │
        │                   │ date_posted      │
        │                   │ admin_id (FK)    │
        │                   └──────────────────┘
        │                            │
        │                            │
        │ (student_id)               │ (internship_id)
        └────────────┬───────────────┘
                     ↓
            ┌──────────────────┐
            │   applications   │
            ├──────────────────┤
            │ id (PK)          │
            │ student_id (FK)  │
            │ internship_id(FK)│
            │ cv_file          │
            │ cover_letter     │
            │ status           │
            │ applied_at       │
            └──────────────────┘
            UNIQUE(student_id, internship_id)
```

### Table Descriptions

#### `students`
Stores student user information.
- **Primary Key**: `id`
- **Unique Constraint**: `email`
- **Password**: Hashed using Werkzeug's `generate_password_hash`

#### `admins`
Stores administrator user information.
- **Primary Key**: `id`
- **Unique Constraint**: `email`
- **Password**: Hashed using Werkzeug's `generate_password_hash`

#### `internships`
Stores internship opportunities posted by admins.
- **Primary Key**: `id`
- **Foreign Key**: `admin_id` → `admins(id)`
- **On Delete**: SET NULL (preserves internship if admin is deleted)

#### `applications`
Stores student applications to internships.
- **Primary Key**: `id`
- **Foreign Keys**: 
  - `student_id` → `students(id)` (CASCADE delete)
  - `internship_id` → `internships(id)` (CASCADE delete)
- **Unique Constraint**: `(student_id, internship_id)` - prevents duplicate applications
- **Status**: ENUM('Pending', 'Approved', 'Rejected')

---

## API Architecture

### Authentication Flow

```
┌─────────┐                  ┌─────────┐                  ┌──────────┐
│ Client  │                  │  Flask  │                  │  MySQL   │
└────┬────┘                  └────┬────┘                  └────┬─────┘
     │                            │                            │
     │  POST /api/login           │                            │
     │  {email, password}         │                            │
     ├───────────────────────────→│                            │
     │                            │  SELECT * FROM students    │
     │                            │  WHERE email = ?           │
     │                            ├───────────────────────────→│
     │                            │                            │
     │                            │  ← User data               │
     │                            │←───────────────────────────┤
     │                            │                            │
     │                            │  Verify password hash      │
     │                            │  Generate JWT token        │
     │                            │                            │
     │  ← {access_token, role}    │                            │
     │←───────────────────────────┤                            │
     │                            │                            │
     │  Store token in localStorage                            │
     │                            │                            │
     │  GET /api/internships      │                            │
     │  Header: Authorization:    │                            │
     │  Bearer <token>            │                            │
     ├───────────────────────────→│                            │
     │                            │  Verify JWT                │
     │                            │  Extract user identity     │
     │                            │                            │
     │  ← Internships data        │                            │
     │←───────────────────────────┤                            │
```

### API Endpoints

#### Authentication Endpoints

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| POST | `/api/register/student` | No | - | Register new student |
| POST | `/api/login` | No | - | Login (returns JWT) |
| GET | `/api/me` | Yes | Any | Get current user info |

#### Internship Endpoints

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/api/internships` | No | - | Get all internships |
| POST | `/api/internships` | Yes | Admin | Create internship |

#### Application Endpoints

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| POST | `/api/apply` | Yes | Student | Apply for internship |
| GET | `/api/status` | Yes | Student | Get application status |
| GET | `/api/applications` | Yes | Admin | Get all applications |
| POST | `/api/applications/<id>/approve` | Yes | Admin | Approve application |
| POST | `/api/applications/<id>/reject` | Yes | Admin | Reject application |

#### Statistics Endpoints

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/api/stats` | Yes | Admin | Get dashboard statistics |

### Request/Response Examples

#### Login Request
```json
POST /api/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123"
}
```

#### Login Response
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "role": "student"
}
```

#### Apply for Internship
```json
POST /api/apply
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "internship_id": 1,
  "cover_letter": "I am interested in this position...",
  "cv": <file>
}
```

---

## Frontend Architecture

### Page Flow Diagram

```
                    ┌──────────────┐
                    │  index.html  │
                    │ (Landing)    │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ↓                         ↓
     ┌────────────────┐        ┌────────────────┐
     │  login.html    │        │ register.html  │
     └────────┬───────┘        └────────┬───────┘
              │                         │
              └────────────┬────────────┘
                           │
                    Check Role (JWT)
                           │
              ┌────────────┴────────────┐
              │                         │
         [Student]                  [Admin]
              │                         │
              ↓                         ↓
  ┌──────────────────────┐   ┌──────────────────────┐
  │ student-dashboard.   │   │ admin-dashboard.html │
  │ html                 │   │                      │
  └──────────┬───────────┘   └──────────┬───────────┘
             │                          │
             ↓                          ↓
  ┌──────────────────────┐   ┌──────────────────────┐
  │ internships.html     │   │ admin-internships.   │
  │ (Browse & Apply)     │   │ html                 │
  └──────────────────────┘   │ (Create/Manage)      │
                             └──────────┬───────────┘
                                        │
                                        ↓
                             ┌──────────────────────┐
                             │ admin-applications.  │
                             │ html                 │
                             │ (Approve/Reject)     │
                             └──────────────────────┘
```

### JavaScript Architecture

The frontend uses a modular approach with `script.js` handling:

1. **API Communication**: Fetch API for HTTP requests
2. **Authentication**: JWT token storage in localStorage
3. **DOM Manipulation**: Dynamic content rendering
4. **Form Handling**: Validation and submission
5. **Error Handling**: User-friendly error messages

### Key Frontend Features

- **Responsive Design**: Bootstrap 5 grid system
- **Single Page Behavior**: AJAX for dynamic updates
- **Client-side Routing**: Manual navigation with token validation
- **File Upload**: FormData API for CV uploads
- **Charts**: Chart.js for admin statistics visualization

---

## DevOps & CI/CD Pipeline

### GitHub Actions Workflow

#### CI Pipeline (`ci.yml`)
Triggered on: Push to `main`, `develop`, `feature/*` branches

```yaml
Steps:
1. Checkout code
2. Setup Node.js 18
3. Install dependencies (if any)
4. Run validation checks
```

**Purpose**: Validate code quality on every push

#### Deployment Pipeline (`deploy.yml`)
Triggered on: Push to `main` branch

```yaml
Steps:
1. Checkout code
2. Deploy to Netlify
   - Publish directory: ./src/frontend
   - Production deployment: true
   - Uses secrets: NETLIFY_AUTH_TOKEN, NETLIFY_SITE_ID
```

**Purpose**: Automatically deploy frontend to Netlify

### Deployment Architecture

```
┌─────────────────┐
│   GitHub Repo   │
└────────┬────────┘
         │ Push to main
         ↓
┌─────────────────┐
│ GitHub Actions  │
│   (deploy.yml)  │
└────────┬────────┘
         │ Deploy
         ↓
┌─────────────────┐
│    Netlify      │
│  (Frontend)     │
└─────────────────┘

┌─────────────────┐
│   Backend API   │
│ (Self-hosted/   │
│  Cloud)         │
└─────────────────┘
```

### Environment Configuration

The application uses environment variables for configuration:

**Backend (`app.py`)**:
- `JWT_SECRET_KEY`: Secret key for JWT signing
- `DB_HOST`: Database host
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_PORT`: Database port (default: 3306)
- `PORT`: Application port (default: 10000)

**Netlify (`netlify.toml`)**:
- Publish directory: `src/frontend`
- Redirects: SPA routing support

---

## How to Work with the Project

### Prerequisites

Before starting, ensure you have:
- ✅ Python 3.9 or higher
- ✅ MySQL 8.0 or higher
- ✅ Git
- ✅ Code editor (VS Code recommended)
- ✅ Postman or similar (for API testing)

### Initial Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/Thilini-samanthika/student-internship-portal-devops.git
cd student-internship-portal-devops
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd src/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 3. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Create database and tables
mysql -u root -p < database_setup.sql

# Or manually:
# CREATE DATABASE internship_portal;
# USE internship_portal;
# (Then run the SQL commands from database_setup.sql)
```

#### 4. Configure Environment Variables

Create a `.env` file in `src/backend/` or set environment variables:

```bash
# Windows PowerShell
$env:DB_HOST="localhost"
$env:DB_USER="root"
$env:DB_PASSWORD="your_password"
$env:JWT_SECRET_KEY="your-secret-key-change-in-production"

# Linux/macOS
export DB_HOST="localhost"
export DB_USER="root"
export DB_PASSWORD="your_password"
export JWT_SECRET_KEY="your-secret-key-change-in-production"
```

#### 5. Run the Backend

```bash
# From src/backend directory
python app.py

# Server will start on http://localhost:5000
```

#### 6. Frontend Setup

```bash
# Open a new terminal
cd src/frontend

# Option 1: Python HTTP server
python -m http.server 8000

# Option 2: Node.js http-server
npx http-server -p 8000

# Frontend will be available at http://localhost:8000
```

### Creating Admin Account

After database setup, create an admin account:

```bash
# Using curl
curl -X POST http://localhost:5000/api/register/admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123"
  }'

# Using Postman
POST http://localhost:5000/api/register/admin
Body (JSON):
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123"
}
```

---

## Development Workflow

### Branching Strategy

```
main (production)
  ↑
  └── develop (integration)
        ↑
        ├── feature/user-authentication
        ├── feature/admin-dashboard
        └── feature/file-upload
```

**Branch Types**:
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Critical production fixes

### Development Process

#### 1. Create Feature Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

#### 2. Make Changes

- Write code
- Test locally
- Follow coding standards

#### 3. Test Your Changes

```bash
# Backend tests
cd src/backend
python test_api.py

# Manual testing
# - Test all affected endpoints
# - Test in browser
# - Check console for errors
```

#### 4. Commit and Push

```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

#### 5. Create Pull Request

- Go to GitHub repository
- Create PR from `feature/your-feature-name` to `develop`
- Wait for CI checks to pass
- Request review
- Merge after approval

### Commit Message Convention

Follow conventional commits:

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

### Testing Checklist

Before committing:
- [ ] Backend API tests pass
- [ ] All endpoints return expected responses
- [ ] Frontend pages load without errors
- [ ] Authentication works correctly
- [ ] File uploads work
- [ ] Database operations succeed
- [ ] No console errors
- [ ] Responsive design works on mobile

---

## Security Considerations

### Current Security Measures

1. **Password Hashing**: Werkzeug's `generate_password_hash` with salt
2. **JWT Authentication**: Secure token-based auth with expiration
3. **CORS Configuration**: Controlled cross-origin requests
4. **SQL Injection Prevention**: Parameterized queries
5. **File Upload Validation**: Allowed extensions and size limits
6. **Role-based Access Control**: Decorator-based authorization

### Production Security Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET_KEY` to a strong random string
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS/SSL
- [ ] Implement rate limiting
- [ ] Add input validation and sanitization
- [ ] Set up proper CORS policies
- [ ] Implement file upload scanning
- [ ] Add logging and monitoring
- [ ] Set up database backups
- [ ] Use secure database credentials
- [ ] Implement CSRF protection
- [ ] Add security headers
- [ ] Regular dependency updates

### Known Security Issues (Development)

⚠️ **Warning**: The following are acceptable for development but MUST be fixed for production:

1. Default JWT secret key
2. Hardcoded database credentials in code
3. No rate limiting
4. No input sanitization
5. No file scanning for malware
6. Debug mode enabled

---

## Future Enhancements

### Planned Features

1. **Email Notifications**
   - Application confirmation emails
   - Status update notifications
   - Admin alerts for new applications

2. **Advanced Search & Filtering**
   - Filter internships by company, duration, location
   - Search functionality
   - Sorting options

3. **User Profiles**
   - Student portfolio pages
   - Resume builder
   - Skill tracking

4. **Analytics Dashboard**
   - Application trends
   - Success rates
   - Popular internships

5. **Multi-file Upload**
   - Portfolio documents
   - Certificates
   - Recommendation letters

6. **Interview Scheduling**
   - Calendar integration
   - Meeting links
   - Reminders

7. **Feedback System**
   - Student reviews
   - Company ratings
   - Internship experience sharing

### Technical Improvements

1. **Backend**
   - Implement caching (Redis)
   - Add API versioning
   - Implement pagination
   - Add comprehensive logging
   - Unit test coverage

2. **Frontend**
   - Migrate to React/Vue.js
   - Implement state management
   - Add progressive web app (PWA) features
   - Improve accessibility (WCAG compliance)

3. **DevOps**
   - Containerization (Docker)
   - Kubernetes orchestration
   - Automated testing in CI/CD
   - Performance monitoring
   - Automated backups

4. **Database**
   - Implement database migrations
   - Add full-text search
   - Optimize queries with indexing
   - Set up read replicas

---

## Troubleshooting

### Common Issues

#### Backend won't start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill the process or use a different port
python app.py  # Will use PORT env variable
```

#### Database connection fails
```bash
# Verify MySQL is running
mysql -u root -p

# Check credentials in app.py
# Ensure database exists
SHOW DATABASES;
```

#### CORS errors in browser
```bash
# Ensure backend is running on http://localhost:5000
# Check CORS configuration in app.py
# Verify frontend is making requests to correct URL
```

#### JWT token expired
```bash
# Login again to get a new token
# Token expires after 24 hours by default
```

---

## Contact & Support

For questions or issues:
- **GitHub Issues**: [Open an issue](https://github.com/Thilini-samanthika/student-internship-portal-devops/issues)
- **Email**: Contact repository owner
- **Documentation**: Refer to README.md

---

## License

This project is open source and available for educational purposes.

---

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Maintained by**: Thilini Samanthika
