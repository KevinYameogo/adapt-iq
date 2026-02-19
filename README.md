
# ADAPT IQ

https://github.com/user-attachments/assets/c3d09263-7624-4690-92b8-6b9468bed31e


**AI-Powered Presentation Intelligence for PowerPoint**

ADAPT AI is a PowerPoint add-in that transforms how you create and refine presentations. Built with AI-first design, it provides instant insights, speaker coaching, and persistent knowledge management—all without leaving PowerPoint.

---

## 🎯 What is ADAPT IQ?

ADAPT IQ is an intelligent presentation copilot that analyzes your slides, generates professional speaker notes, suggests research topics, and maintains a persistent library of insights. Designed for Mac and Windows, it works around platform limitations to deliver a seamless, crash-free experience.

## ✨ Features

### Smart Analysis
- **Executive Insights**: One-sentence summaries of slide content
- **AI Speaker Coach**: Professional scripts for presenting each slide
- **Research Engine**: Curated topic suggestions for deeper exploration

### Persistent Notes Library
- **Auto-Save**: Insights are saved locally with slide context
- **Deep Linking**: Open cloud presentations directly to specific slides
- **Export Reports**: Generate PDF/Word/Excel summaries of your curated insights

### Visual Generation
- **AI Slide Builder**: Generate complete slide decks from prompts
- **Voice Input**: Dictate presentation ideas with real-time transcription
- **Smart Layouts**: Automatic title, bullet, and notes formatting

### Robust & Reliable
- **Mac-Optimized**: Fail-safe text extraction with multi-layered fallbacks
- **Offline Storage**: Notes persist even after closing PowerPoint
- **Clipboard Fallback**: Works in restricted iframe environments

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 18** - UI components
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling

### AI & APIs
- **OpenAI GPT-4** - Natural language processing
- **Tavily API** - Web search and research integration
- **Office.js** - PowerPoint integration

### Export & Data
- **jsPDF** - PDF generation
- **docx** - Word document export
- **xlsx** - Excel spreadsheet export
- **localStorage** - Persistent notes storage

### Development
- **ESLint** - Code quality
- **HTTPS Dev Server** - Secure local development for Office add-ins

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 20+**
- **PowerPoint** (Desktop or Web)
- **OpenAI API Key**
- **Tavily API Key** (for research features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/adapt-id.git
   cd adapt-id
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
   NEXT_PUBLIC_TAVILY_API_KEY=your_tavily_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev:https
   ```
   The add-in will be available at `https://localhost:3000`

5. **Sideload the add-in**
   - Open PowerPoint
   - Go to **Insert** → **Get Add-ins** → **Upload My Add-in**
   - Select `manifest.xml` from the project root

---

## 📖 Usage

### Analyzing Slides
1. Select a slide in PowerPoint
2. Click **"Analyze"** in the ADAPT AI pane
3. Review the Executive Insight and Speaker Notes
4. Click **"+ SAVE TO LIBRARY"** to persist the insight

### Exporting Reports
1. Save insights from multiple slides to your Library
2. Click **"Export"** → Choose format (PDF/Word/Excel)
3. Download your curated presentation summary

### Generating Slides
1. Switch to the **"VISUALS"** tab
2. Enter your presentation topic or outline
3. Enable **"Research Mode"** for enhanced content
4. Click **"Generate Deck"** to create slides

---

## 🎓 Why Use ADAPT AI?

### For Presenters
- **Save Time**: Generate speaker notes instantly instead of writing them manually
- **Stay Organized**: Never lose insights with the persistent Notes Library
- **Present Confidently**: AI-generated scripts help you deliver polished presentations

### For Educators
- **Lecture Prep**: Quickly create structured slide decks from course outlines
- **Student Handouts**: Export curated notes as study guides

### For Business Professionals
- **Executive Summaries**: Distill complex presentations into key takeaways
- **Pitch Decks**: Generate compelling narratives with research-backed content
- **Meeting Prep**: Review saved insights before presenting

---

## 🏗️ Project Structure

```
adapt-id/
├── app/
│   └── taskpane/          # Main add-in UI
├── components/
│   ├── MagicDraft.tsx     # Smart analysis & library
│   ├── MagicScroll.tsx    # Research viewer
│   └── VisualGenerator.tsx # Slide generation
├── lib/
│   ├── ai.ts              # OpenAI integration
│   ├── office.ts          # PowerPoint API
│   ├── store.ts           # localStorage persistence
│   └── export.ts          # PDF/Word/Excel export
├── hooks/
│   ├── useMagicDraft.ts   # Slide generation logic
│   ├── useAudioMonitor.ts # Voice input
│   └── useEngagement.ts   # User interaction tracking
├── manifest.xml           # Office add-in manifest
└── package.json
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

Built for **St. John's Hacks** hackathon.

Powered by OpenAI GPT-4 and Microsoft Office.js.

---

## 📧 Support

For issues or questions, please open an issue on GitHub.
