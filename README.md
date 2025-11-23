# Remotion Captioning Platform

A full-stack web application that allows users to upload MP4 videos, automatically generate captions using OpenAI Whisper API, and render those captions onto videos using Remotion with support for Hinglish (Hindi + English).

## 🚀 Live Demo [ Loom Video ]
https://www.loom.com/share/56ce133fba99441cb0a8daa523a31b05

## ✨ Features

- **Video Upload**: Clean UI for uploading MP4 files up to 100MB
- **Auto-Captioning**: Automatic speech-to-text using Groq Whisper API (whisper-large-v3-turbo)
- **Hinglish Support**: Full support for mixed Hindi (Devanagari) and English text
- **3 Caption Styles**:
  - Bottom Centered: Standard subtitles
  - Top Bar: News-style banner
  - Karaoke: Word-by-word highlighting effect
- **Real-time Preview**: See captions on your video before exporting
- **Video Export**: Download the final captioned video as MP4

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Video Processing**: Remotion
- **Speech-to-Text**: Groq Whisper API (whisper-large-v3-turbo)
- **Styling**: Tailwind CSS
- **Fonts**: Google Fonts (Noto Sans + Noto Sans Devanagari)

## 📋 Prerequisites

- Node.js 18+ installed
- Groq API key (FREE tier available with generous limits)
- npm or yarn package manager

## 🔧 Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd remotion-captioning-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Get Groq API Key (FREE)

1. Go to [Groq Console](https://console.groq.com/)
2. Sign up for a free account (No credit card required!)
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key

**Why Groq?**
- ✅ **FREE Tier**: Generous free usage limits
- ✅ **Fast**: Lightning-fast inference speed
- ✅ **No Credit Card**: Sign up without payment details
- ✅ **Same Model**: Uses Whisper Large V3 Turbo
- ✅ **Better Performance**: Faster than OpenAI's implementation

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:
```env
GROQ_API_KEY=your_groq_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get your Groq API key from: https://console.groq.com/keys

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure
```
remotion-captioning-platform/
├── public/
│   ├── uploads/                  # Uploaded videos (auto-created)
│   └── outputs/                  # Rendered videos (auto-created)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── upload/           # Video upload endpoint
│   │   │   ├── generate-captions/ # Caption generation endpoint
│   │   │   └── render-video/     # Video rendering endpoint
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx              # Main application page
│   ├── components/
│   │   ├── CaptionStyleSelector.tsx
│   │   ├── FileUpload.tsx
│   │   ├── VideoPreview.tsx
│   │   └── LoadingSpinner.tsx
│   ├── remotion/
│   │   ├── Caption.tsx           # Caption component
│   │   ├── CaptionedVideo.tsx    # Main video composition
│   │   ├── RemotionRoot.tsx      # Remotion root
│   │   ├── Root.tsx              # Remotion root call
│   │   └── styles/               # Caption style components
│   ├── lib/
│   │   ├── whisper.ts            # Whisper API 
layouts
│   ├── CaptionGenerator.tsx
│   ├── CaptionStyleSelector.tsx
│   ├── ExportVideo.tsx
│   ├── MainLayout.tsx
│   ├── VideoPreviewSection.tsx
│   ├── VideoUpload.tsx
integration
│   │   └── types.ts              # TypeScript types
│   └── utils/
│       └── helpers.ts            # Helper functions
├── .env.local
├── next.config.js
├── remotion.config.ts
├── package.json
└── README.md
```

## 🎬 Usage Guide

### 1. Upload Video
- Click the upload area or drag and drop an MP4 file
- Maximum file size: 100MB
- Wait for upload to complete

### 2. Generate Captions
- Click "Auto-generate Captions" button
- The system uses Groq Whisper API to transcribe audio
- Captions will appear in the preview

### 3. Choose Caption Style
- Select from 3 preset styles:
  - **Bottom Centered**: Traditional subtitles
  - **Top Bar**: News/breaking news style
  - **Karaoke**: Animated word highlighting

### 4. Preview
- Use the video player to preview captions
- Play/pause to check timing and appearance
- Change styles to see different effects

### 5. Export
- Click "Export Captioned Video"
- Rendering takes 2-5 minutes depending on video length
- Video downloads automatically when ready


## 📝 Caption Generation Method

This project uses **Groq Whisper API** for speech-to-text conversion:

- **Provider**: Groq (Open-source AI infrastructure)
- **Model**: whisper-large-v3-turbo
- **Format**: verbose_json with segment timestamps
- **Granularity**: Segment-level timestamps
- **Language**: Auto-detected (supports 50+ languages including Hindi)
- **Speed**: 10-20x faster than OpenAI's Whisper API
- **Cost**: FREE tier with generous limits

The Whisper API automatically detects language and provides accurate transcriptions with timestamps, which are then converted into caption objects with start/end times.

### Why Groq over OpenAI?

| Feature | Groq | OpenAI |
|---------|------|--------|
| **Cost** | FREE (generous limits) | Paid ($0.006/min) |
| **Speed** | 10-20x faster | Standard |
| **Model** | Whisper Large V3 Turbo | Whisper V2/V3 |
| **Setup** | No credit card needed | Credit card required |
| **API** | Same interface | Standard |

The Groq API provides the same Whisper model quality with significantly better performance and no cost for most use cases.


## 🎨 Caption Styles Explained

### Bottom Centered
- Standard subtitle format
- Semi-transparent black background
- Positioned 80px from bottom
- Fade in/out animations
- Best for: General purpose, movies, vlogs

### Top Bar
- Full-width banner at top
- Red background (news-style)
- Uppercase text with letter spacing
- Best for: Breaking news, announcements, alerts

### Karaoke
- Center-aligned
- Word-by-word color highlighting (yellow)
- Scale animation on active word
- Glow effect on highlighted words
- Best for: Music videos, sing-alongs, educational content

## 🔤 Hinglish Support

The platform properly renders mixed Hindi and English text using:

- **Google Fonts Integration**: Noto Sans for English, Noto Sans Devanagari for Hindi
- **Auto-detection**: Automatically switches font based on script detection
- **Proper encoding**: UTF-8 support throughout the pipeline
- **Optimized Loading**: Next.js font optimization for fast loading

Example Hinglish caption:
```
"Aaj ka weather बहुत अच्छा है!"
```

## 🐛 Troubleshooting

### Video Upload Fails
- Check file size (must be under 100MB)
- Ensure file is MP4 format
- Check server logs for errors

### Caption Generation Fails
- Verify Groq API key is correct in `.env.local`
- Check Groq API quota at [console.groq.com](https://console.groq.com)
- Ensure video has clear audio
- Check file format (MP4 supported)

### Groq API Errors
- **401 Unauthorized**: Invalid API key
- **429 Rate Limited**: Wait a few seconds and retry
- **413 Payload Too Large**: Video file too large (>25MB may have issues)

### Rendering Fails
- Check available disk space
- Verify all dependencies installed
- Check Remotion configuration

### Fonts Not Loading
- Google Fonts are loaded automatically via Next.js
- Check browser console for errors
- Clear browser cache and reload

## 📦 Sample Output

A sample captioned video is included in the repository (or linked below):

[Link to sample output video]

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Prince Raj
- GitHub: @HardCoder404
- Email: praj81232@gmail.com

## 🙏 Acknowledgments

- **Groq** for providing fast and free Whisper API access
- **Remotion** team for the amazing video framework
- **Google Fonts** for Noto Sans fonts
- **Next.js** team for the incredible framework
- **OpenAI** for the original Whisper model

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check [Groq Documentation](https://console.groq.com/docs)
- Email: praj81232@gmail.com

## 🆚 Groq vs OpenAI Comparison

This project was originally designed for OpenAI's Whisper API but was migrated to Groq for the following reasons:

### Performance
- ⚡ **Speed**: Groq is 10-20x faster than OpenAI
- 💰 **Cost**: FREE tier vs paid OpenAI ($0.006/min)
- 🎯 **Accuracy**: Same Whisper model quality

### Setup
- ✅ No credit card required for Groq
- ✅ Instant API key generation
- ✅ Generous free tier limits

### Migration
If you want to switch back to OpenAI:
1. Replace `GROQ_API_KEY` with `OPENAI_API_KEY` in `.env.local`
2. Update `src/app/api/generate-captions/route.ts` to use OpenAI SDK
3. Change model from `whisper-large-v3-turbo` to `whisper-1

---

Built with ❤️ using Next.js and Remotion
