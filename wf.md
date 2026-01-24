# Project Workflow Guide

This document outlines the standard workflows for developing, testing, and deploying the **Student Internship Portal**.

## 🚀 1. Setup & Installation

**Prerequisites:**
- Python 3.9+
- Git

### Initial Setup
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd student-internship-portal-devops
   ```

2. **Backend Setup:**
   ```bash
   cd src/backend
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

---

## 💻 2. Local Development Workflow

The project uses a **unified architecture** where Flask serves both the API and the static frontend files.

### Start the Application
Run the following command from `src/backend`:
```bash
python app.py
```
*The app will be available at **http://localhost:5000***

### Database
- **Local:** Uses **SQLite** automatically (`internship_portal.db`). No configuration needed.
- **Production:** Uses **PostgreSQL** if `DATABASE_URL` is set.

### Making Changes
1. **Frontend:** Edit files in `src/frontend/`. Refresh browser to see changes.
   - `index.html`, `login.html`, etc.
   - `js/`, `css/`
2. **Backend:** Edit `src/backend/app.py`. Server auto-reloads on save.

---

## 🧪 3. Testing Workflow

### Manual Testing
1. **Student Flow:**
   - Register a new account
   - Browse internships
   - Apply (upload CV)
   - Check status on Dashboard
2. **Admin Flow:**
   - Login (Default: `admin@example.com` / `admin123`)
   - Create new Internship
   - Approve/Reject applications

### Automated Tests
Run API tests:
```bash
cd src/backend
python test_api.py
```

---

## 🚢 4. Deployment Workflow (Railway)

The project is configured for **Railway** deployment.

### Files Prepared
- `Procfile`: Configures Gunicorn web server
- `requirements.txt`: Includes production dependencies (`gunicorn`, `psycopg2-binary`)
- `app.py`: Handles PostgreSQL connection and static file serving

### Steps to Deploy
1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deploy"
   git push origin main
   ```

2. **Deploy on Railway:**
   - Create new project from GitHub repo
   - Add **PostgreSQL** database service
   - Railway automatically sets `DATABASE_URL`
   - App builds and deploys automatically

---

## 🔄 5. CI/CD Pipeline

The project includes GitHub Actions workflows in `.github/workflows/`:
- **`ci.yml`**: Runs tests on every push/PR to `main` or `develop` branches.
- **`deploy.yml`**: (Optional) Can be configured for direct deployment.

---

## 🛠️ Troubleshooting

- **"Module 'psycopg2' not found":** Run `pip install psycopg2-binary`
- **Database errors:** Delete `internship_portal.db` to reset the local database.
- **Port in use:** The app defaults to port 5000. Set `PORT` env var to change it.
