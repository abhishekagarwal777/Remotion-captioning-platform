Full-Stack Developer Task — Remotion Captioning Platform

Everything is reframed from scratch for evaluation, deployment, hosting, architecture, STT explanation, caption styles, Hinglish support, and deliverables.

🎬 Remotion Captioning Platform — Full-Stack Developer Assignment

A fully deployed full-stack web application that allows users to upload MP4 videos, generate captions automatically using a Speech-to-Text (STT) engine, and render those captions onto the final video using Remotion. The platform is designed with Hinglish caption support, multiple styling presets, and real-time preview.

🎯 Objective

Develop and deploy a production-ready web application that:

Accepts .mp4 video uploads

Generates automatic captions from audio

Renders captions onto the video using Remotion

Supports Hinglish text (English + Devanagari script)

Provides multiple caption styles

Allows preview + final video export

Is hosted live with source code and documentation

Live Demo- 
https://drive.google.com/file/d/1q0axpWsdvEgq0REb7-J9KVHVJtJilY2j/view?usp=drive_link

🚀 Live Deployment

Hosted Link: <https://vercel.com/abhishekagarwal777s-projects/Remotion-captioning-platform>
GitHub Repository: <https://github.com/abhishekagarwal777/Remotion-captioning-platform>

✨ Key Features
1️⃣ Video Upload

Clean and intuitive UI for uploading MP4 videos.

Supports files up to 100MB (configurable).

Secure server-side storage for processing.

2️⃣ Automatic Caption Generation

"Generate Captions" button triggers the STT pipeline.

Uses Whisper Large V3 Turbo through Groq API (or OpenAI/AssemblyAI as alternatives).

Returns segment-level timestamps for accurate syncing.

Handles Hinglish content seamlessly.

STT Engine Used:
Groq Whisper API — whisper-large-v3-turbo
Lightning-fast transcription with free-tier support.

3️⃣ Hinglish Caption Support

Full compatibility with mixed English + Hindi (Devanagari) text.

Loaded fonts:

Noto Sans (English)

Noto Sans Devanagari (Hindi)

Correct rendering, encoding, and alignment for hybrid captions like:

"Aaj ka weather bahut अच्छा lag raha hai."

4️⃣ Caption Style Presets (3 Styles)

At least 3 ready-to-use caption designs:

✔ Bottom-Centered (Standard)

Classic subtitle style

Semi-transparent background

✔ Top-Bar (News Style)

Full-width top banner

Bold, highly legible format

✔ Karaoke Style (Bonus)

Word-by-word highlighting

Smooth transitions for sing-along effects

Users can switch between styles from the UI before exporting.

5️⃣ Preview Player

Real-time video preview with captions using Remotion Player.

Lets users play, pause, scrub timeline, and inspect caption timing before export.

6️⃣ Video Rendering (Export to MP4)

Final rendering is handled using Remotion’s rendering pipeline.

Outputs downloadable .mp4 files.

Supports both:

UI-based export

Developer CLI export command (documented)

7️⃣ Deployment

Fully deployed on Vercel / Render / Netlify.

Publicly accessible link included.

API routes powered by Next.js Server Actions / Next.js API Routes.

🛠️ Tech Stack
Layer	Technology
Framework	Next.js 14 (App Router + Edge/Node runtimes)
Language	TypeScript
Video Rendering	Remotion
STT Model	Whisper Large V3 Turbo (Groq API)
Styling	Tailwind CSS
Fonts	Noto Sans + Noto Sans Devanagari
Deployment	Vercel / Render
📁 Project Structure
src/
├── app/
│   ├── api/
│   │   ├── upload/            # Upload endpoint
│   │   ├── generate-captions/ # STT + Whisper integration
│   │   └── render-video/      # Remotion rendering endpoint
│   ├── page.tsx               # Main UI
│   └── layout.tsx
├── components/
│   ├── VideoUpload.tsx
│   ├── CaptionGenerator.tsx
│   ├── CaptionStyleSelector.tsx
│   ├── VideoPreviewSection.tsx
│   └── ExportVideo.tsx
├── remotion/
│   ├── CaptionedVideo.tsx
│   ├── Caption.tsx
│   ├── styles/
│   ├── Root.tsx
│   └── RemotionRoot.tsx
├── lib/
│   └── whisper.ts             # Whisper STT integration
└── utils/
    └── helpers.ts

⚙️ Environment Setup
📌 Prerequisites

Node.js 18+

Groq API Key (free)

Git

📌 Installation
git clone <repo-url>
cd remotion-captioning-platform
npm install

📌 Environment Variables — .env.local
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000

📌 Start Development Server
npm run dev

🔍 Caption Generation Pipeline (Documentation)

User uploads .mp4 file

File is stored temporarily

API route sends audio to Groq Whisper

Whisper returns:

text

segments with start/end timestamps

App formats segments into caption objects

Caption objects passed to Remotion

Remotion overlays captions frame-accurately

Exported as final MP4

🧪 Sample Output

A fully rendered captioned example video is included here:

👉 <insert Google Drive / GitHub link to sample MP4>

📦 Deliverables Checklist
✔ Required

 Live hosted application

 GitHub repository

 Complete README

 Setup + deployment instructions

 Caption generation documentation

 At least one sample captioned MP4

✔ Optional (Bonus)

 Offline Whisper (whisper.cpp)

 Import/export SRT/VTT files

 Advanced caption styling & animations

 Docker setup

 Optimized bundling for production