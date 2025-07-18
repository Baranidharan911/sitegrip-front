# 🌐 SiteGrip

A comprehensive real-time website monitoring, SEO, and analytics platform built with Next.js, Firebase, Playwright, and more.

---

## 🚀 Features

- **Real-time Uptime Monitoring** (with WebSocket simulation or Firebase)
- **SEO Tools**: Web Vitals, Indexing, Meta Tag Analyzer, OpenGraph, Schema, etc.
- **Performance Analysis**: PageSpeed, JS Rendering, Accessibility, and more
- **Incident & Alert Management**
- **Reporting & Analytics**: PDF/CSV export, charts, dashboards
- **User Authentication**: Google Auth (Firebase)
- **Modern UI**: Responsive, dark/light themes, beautiful UX

---

## 🛠️ Getting Started

### 1. **Clone the Repository**

```bash
git clone https://github.com/Baranidharan911/sitegrip-front.git
cd sitegrip
```

### 2. **Install Dependencies**

```bash
npm install
```

### 3. **Set Up Environment Variables**

Copy `.env.local` or `.env` from the repo (if present), or create your own:

```env
# API CONFIGURATION
NEXT_PUBLIC_API_URL=https://your-backend-url

# FIREBASE CONFIGURATION
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# GOOGLE PAGESPEED API
GOOGLE_PAGESPEED_API_KEY=your_pagespeed_api_key

# (Add any other required variables from .env.example or deployment docs)
```

### 4. **Run the Development Server**

```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📦 Common Commands

| Command                | Description                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| `npm run dev`          | Start the Next.js development server                                        |
| `npm run build`        | Build the app for production                                                |
| `npm start`            | Start the production server (after build)                                   |
| `npm run lint`         | Run ESLint to check for code issues                                         |
| `npm run test`         | (If tests are added) Run the test suite                                     |
| `npm run deploy`       | Deploy the static site (if using gh-pages or similar)                       |

---

## 🔑 Environment Variables

- **Frontend**: All `NEXT_PUBLIC_` variables are exposed to the browser.
- **Backend/API**: Variables like `GOOGLE_PAGESPEED_API_KEY` must be set in your deployment environment (Vercel, Netlify, etc.).
- See `.env.local` or deployment guides for a full list.

---

## 🏗️ Project Structure

```
sitegrip/
├── src/
│   ├── app/                # Next.js app directory (pages, API routes)
│   ├── components/         # React UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries (Firebase, Playwright, etc.)
│   ├── types/              # TypeScript types
│   ├── utils/              # Utility functions
│   └── ...                 # More features and modules
├── functions/              # Firebase Cloud Functions (backend)
├── public/                 # Static assets
├── .env.local              # Local environment variables
├── package.json            # NPM scripts and dependencies
└── README.md               # This file
```

---

## 🚀 Deployment

### **Vercel (Recommended for Frontend)**

1. Push your code to GitHub.
2. Connect your repo to [Vercel](https://vercel.com/).
3. Add all required environment variables in the Vercel dashboard.
4. Deploy!

### **Firebase Functions (Backend)**

See `FIREBASE_FUNCTIONS_DEPLOYMENT.md` for full instructions.

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

---

## 🧪 Testing

- See `TESTING_GUIDE.md` for detailed testing instructions.
- Run the app locally and test all features (monitoring, SEO tools, etc.).
- Check logs and browser console for errors.

---

## 📝 Useful Documentation

- [Production Deployment Guide](./PRODUCTION_DEPLOYMENT_GUIDE.md)
- [Monitoring Setup](./PRODUCTION_MONITORING_SETUP.md)
- [Frontend Uptime Monitoring](./FRONTEND_UPTIME_MONITORING.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [Firebase Functions Deployment](./FIREBASE_FUNCTIONS_DEPLOYMENT.md)

---

## 🤝 Contributing

1. Fork the repo
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your fork and open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 💬 Support

For questions, open an issue or contact the maintainer.

---

## 🗂️ Common Git Commands

| Command                                 | Description                                      |
|-----------------------------------------|--------------------------------------------------|
| `git clone <repo-url>`                  | Clone the repository to your local machine        |
| `git pull`                              | Pull the latest changes from the remote repo      |
| `git add .`                             | Stage all changes for commit                     |
| `git commit -m "your message"`         | Commit staged changes with a message              |
| `git push`                              | Push your commits to the remote repository        |
| `git checkout -b feature/your-feature`  | Create and switch to a new branch                |
| `git status`                            | Show the status of your working directory        |
| `git log`                               | View commit history                              |

**Typical workflow to update and push changes:**

```bash
git pull
git add .
git commit -m "Describe your changes"
git push
```

---
