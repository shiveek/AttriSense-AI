# Contributing to AttriSense AI

Thank you for your interest in contributing to **AttriSense AI** ("Predict • Understand • Retain"). We welcome community contributions, bug reports, and enhancements from developers, ML engineers, and UI/UX designers!

---

## 1. Code of Conduct

All contributors are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a respectful, inclusive environment.

---

## 2. Getting Started

1. **Fork the Repository**: Click the **Fork** button on [GitHub](https://github.com/shiveek/AttriSense-AI).
2. **Clone your Fork**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/AttriSense-AI.git
   cd AttriSense-AI
   ```
3. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/amazing-retention-feature
   ```

---

## 3. Development Workflow

### Backend (FastAPI & ML Core)
```bash
python -m venv backend/venv
source backend/venv/bin/activate  # On Windows: backend\venv\Scripts\activate
pip install -r backend/requirements.txt
python -m uvicorn backend.app.main:app --reload
```

### Frontend (React 19 & TypeScript)
```bash
cd frontend
npm install
npm run dev
```

---

## 4. Submission Checklist

Before submitting a Pull Request, ensure:
- [ ] TypeScript compiles cleanly without warnings (`cd frontend && npm run build`).
- [ ] Pytest and production verification pass (`python -m backend.app.core.verify_production`).
- [ ] Code follows Clean Architecture & SOLID principles.
- [ ] No hardcoded secrets or API credentials are included.

---

## 5. Pull Request Process

1. Open a Pull Request targeting the `main` branch.
2. Use our [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).
3. A maintainer will review your code within 24-48 hours.
