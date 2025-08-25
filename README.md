
# 🚀 AI Resume & Job Match SaaS

A modern **AI-powered platform** for resume analysis, job matching, and cover letter generation.  

**Stack:** Next.js 15 (App Router, `/src` structure) · React 19 · OpenAI · Cloudinary · MongoDB Atlas · NextAuth (Google) · Tailwind CSS · JavaScript (ES6+)

---

## ✨ Features

- 🔎 **AI Resume Analyzer** — Automatic scoring, insights, improvement tips  
- 🎯 **Job Match Engine** — AI-powered job description matching  
- ✍️ **AI Cover Letter Generator**  
- 📄 **PDF Resume Upload** to Cloudinary  
- 🔐 **Google Authentication** via NextAuth  
- 🗄️ **MongoDB Atlas** storage for user & resume metadata  
- 🎨 **Animated UI** powered by [Motion for React](https://motion.dev/docs/react)  
- ☁️ **Production Deployment** on Vercel  

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/your-org/ai-resume-saas.git
cd ai-resume-saas
npm install
````

### 2. Configure Environment

Create a `.env.local` at the project root:

```env
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ai-resume-saas

OPENAI_API_KEY=your-openai-api-key

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Run Locally

```bash
npm run dev
```

➡️ Open [http://localhost:3000](http://localhost:3000)

---

## 🗂️ Project Structure (`src/`)

```
src/
  app/
    api/
      auth/[...nextauth]/   # NextAuth.js (Google)
      resume/               # Resume upload, analyze
      job/                  # Job match endpoint
      ai/                   # AI endpoints (cover letter, summarizer)
    layout.js               # Root layout
    page.js                 # Dashboard/homepage
    globals.css             # Tailwind styles

  components/
    features/               # ResumeUpload, ResumeAnalysis, etc
    ui/                     # UI primitives (Button, etc)
    Providers.js            # Session provider

  lib/
    openai.js
    mongodb.js
    cloudinary.js
```

---

## 📝 Example Resume Line

> Built AI-powered Resume & Job Match SaaS (Next.js + OpenAI + Cloudinary + MongoDB Atlas) using JavaScript (ES6+) over TypeScript.

---

## 🛠️ Technologies

* [Next.js 15](https://nextjs.org/) (App Router, `/src` directory)
* [React 19](https://react.dev/)
* [Motion for React](https://motion.dev/docs/react) — animations
* [OpenAI Node SDK](https://www.npmjs.com/package/openai)
* [Cloudinary Node SDK](https://cloudinary.com/documentation/node_image_and_video_upload)
* [MongoDB Atlas](https://www.mongodb.com/atlas)
* [NextAuth.js](https://next-auth.js.org/) (Google sign-in)
* [Tailwind CSS v4](https://tailwindcss.com/)

---

## 🧑‍💻 Scripts

* `npm run dev` — Development
* `npm run build` — Production build
* `npm start` — Run production server
* `npm run lint` — Lint code

---

## ⚡ Deployment

1. Push repo to **GitHub/GitLab**
2. Connect project to **[Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)**
3. Add environment variables in Vercel Dashboard
4. Deploy 🚀

---

## 📄 License

[MIT](LICENSE)

---

## 🙏 Credits

* Built with **Next.js, Motion for React, and OpenAI**
* Storage by **MongoDB Atlas & Cloudinary**

---

For any questions or issues, please open a GitHub issue.

```
