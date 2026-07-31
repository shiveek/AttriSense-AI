# AttriSense AI - Portfolio, Hackathon & Pitch Showcase Kit

## 1. Project Abstract
**AttriSense AI** ("Predict • Understand • Retain") is an enterprise Workforce Intelligence SaaS Platform that predicts employee attrition risk, illuminates machine learning decisions through Explainable AI (SHAP), and recommends proactive retention strategies. By replacing guesswork with decision intelligence, AttriSense AI empowers HR teams to mitigate flight risk before resignation notices are given.

---

## 2. 30-Second Elevator Pitch
> *"Every year, voluntary turnover costs enterprise organizations billions of dollars in lost talent and onboarding overhead. AttriSense AI is an enterprise Workforce Intelligence platform that doesn't just predict who is going to leave—it uses Explainable AI (SHAP) to explain exactly **why** they are at risk and provides an interactive 'What-If' simulator so managers can test retention interventions in real-time. Built with FastAPI, React 19, and Scikit-Learn, AttriSense AI turns HR data into actionable retention decisions."*

---

## 3. 2-Minute Technical Pitch
> *"AttriSense AI is engineered with Clean and Feature-Based Architecture across the stack. The backend is powered by FastAPI and Python 3.11, leveraging a Scikit-Learn Random Forest Classifier trained on 16 core employee metrics. To solve the 'black box' problem in AI, we integrated `shap.TreeExplainer` to compute localized feature attributions for every single prediction, identifying positive and negative risk factors in real time.*
>
> *The frontend is built with React 19, TypeScript, Tailwind CSS v4, Framer Motion, and Zustand state containers, rendering interactive SHAP waterfall breakdowns and a 'What-If' policy sandbox where managers can adjust salary or overtime parameters and view instant recalculated risk output.*
>
> *For scalability, heavy PDF/Excel export tasks run asynchronously on background Celery workers with Redis queues and AWS S3 storage. The entire infrastructure is containerized with Docker, verified by automated SRE audit suites, and deployed across Vercel, Railway, and Neon Serverless PostgreSQL."*

---

## 4. Resume Bullet Points (Software Engineering & AI/ML)

- **Full Stack / AI Engineering**: Designed and built **AttriSense AI**, an enterprise Workforce Intelligence SaaS platform using **FastAPI**, **React 19**, **TypeScript**, and **Scikit-Learn** achieving **89.2% model accuracy** and **0.941 ROC AUC**.
- **Explainable AI (XAI)**: Integrated **TreeSHAP (`shap.TreeExplainer`)** to compute localized feature attribution vectors, demystifying Random Forest predictions into actionable HR retention driver breakdowns.
- **Interactive Simulator**: Created a real-time "What-If" policy sandbox using **Zustand** and **TanStack Query**, allowing HR managers to simulate policy changes and recalculate flight risk in sub-100ms.
- **Asynchronous Architecture**: Architected background worker queues using **Celery** and **Redis** for asynchronous executive PDF/Excel report generation, storing export artifacts on **AWS S3**.
- **DevOps & Cloud Security**: Implemented **OAuth2 JWT** authentication, fine-grained **RBAC**, and **Docker** containerization; configured multi-cloud CI/CD pipeline deploying to **Vercel**, **Railway**, and **Neon PostgreSQL**.

---

## 5. LinkedIn & Social Media Showcase Post

```text
🚀 Excited to launch AttriSense AI ("Predict • Understand • Retain") — an enterprise Workforce Intelligence Platform built with FastAPI, React 19, TypeScript, and Explainable AI!

Unwanted employee turnover costs organizations millions each year. AttriSense AI helps HR leaders move from reactive exits to proactive retention:

🔮 Predict Attrition Risk: Machine learning algorithms classify flight probabilities across 16 workforce attributes.
🧠 Explainable AI (SHAP): TreeSHAP feature attributions explain EXACTLY why an employee is flagged (e.g., Overtime +24%, Low Satisfaction +18%).
🎛️ What-If Simulator: Interactively simulate policy changes (e.g. 15% raise or zero overtime) to view immediate risk score reductions.
📊 Executive Dashboards & PDF Exports: Instant departmental heatmaps and Celery-powered background PDF report downloads.

🛠️ Tech Stack: FastAPI | React 19 | TypeScript | Scikit-Learn | SHAP | Celery | Redis | PostgreSQL | Docker | Vercel | Railway

Check out the code & live demo!
🌐 Live App: https://attrisense-ai.vercel.app
💻 GitHub: https://github.com/shiveek/AttriSense-AI

#AI #MachineLearning #ReactJS #FastAPI #TypeScript #ExplainableAI #DataScience #WebDevelopment #SoftwareEngineering #Portfolio
```

---

## 6. Hackathon Presentation Slide Deck Structure (10-12 Slides)

1. **Slide 1: Title & Tagline** — AttriSense AI (*Predict • Understand • Retain*).
2. **Slide 2: The Problem** — Voluntary Turnover Crisis ($1.5x salary cost per departure, unexplainable HR decisions).
3. **Slide 3: The Solution** — AttriSense AI Decision Intelligence Engine.
4. **Slide 4: Predictive Machine Learning** — 89.2% Accuracy, 16 Workforce Parameters.
5. **Slide 5: Explainable AI (SHAP)** — Opening the Black Box (Positive vs. Protective driver attributions).
6. **Slide 6: What-If Risk Simulator** — Interactive policy experimentation sandbox.
7. **Slide 7: System Architecture** — Decoupled React 19 SPA + FastAPI + Celery/Redis + Neon Postgres + AWS S3.
8. **Slide 8: Enterprise Security & RBAC** — OAuth2 JWT, passlib bcrypt, SOC2/GDPR compliance audit logs.
9. **Slide 9: Live Demo Highlights** — Screenshots / GIF walkthrough of Dashboard, Directory, and Simulator.
10. **Slide 10: Scalability & DevOps** — Dockerized microservices, Vercel/Railway multi-cloud deployment.
11. **Slide 11: Future Roadmap** — LLM Retention Copilot, Workday/BambooHR API integrations, Cox survival analysis.
12. **Slide 12: Team & Q&A** — Thank you! GitHub link & Live demo URL.

---

## 7. Demo Video Script (3-5 Minutes)

- **[0:00 - 0:45] Intro & Problem Statement**: Show statistics on employee attrition. Introduce AttriSense AI.
- **[0:45 - 1:30] Executive Dashboard Tour**: Demonstrate live KPI metrics, department distribution bar charts, and high-risk employee watchlist.
- **[1:30 - 2:30] Deep-Dive into SHAP Explainability & Recommendations**: Open employee detail drawer. Show TreeSHAP force breakdown bar chart and auto-generated action plan.
- **[2:30 - 3:30] Interactive What-If Simulator**: Demonstrate adjusting salary and overtime sliders, showing instant recalculated risk reduction.
- **[3:30 - 4:30] CSV Bulk Import & PDF Report Generation**: Upload synthetic employee CSV, show batch processing, and download PDF briefing.
- **[4:30 - 5:00] Conclusion & Tech Architecture Summary**: Highlight React 19, FastAPI, Docker, and GitHub links.
