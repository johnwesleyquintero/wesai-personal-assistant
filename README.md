# WesAI 🚀

The ultimate **AI Agent Builder** and **Workflow Optimizer** with **local storage** and **private sessions**.

WesAI is a product of [ScaleSmart](https://wescode.vercel.app/). It's a powerful web application that empowers you to build, deploy, and optimize custom AI agents using Google's Gemini models. Streamline your professional workflows and automate complex tasks with specialized intelligence, all while keeping your data 100% on your device.

## 🌟 Private & Local

**🔒 Local Persistence**: Your chat sessions and agent configurations are stored securely on your device using LocalStorage.
**🕵️ Privacy First**: No cloud database means your conversations and proprietary workflows stay between you and your AI.
**⚡ Fast & Offline-Ready**: Access your agents and saved sessions instantly without waiting for cloud sync.

## 🚀 What WesAI Can Do

### Core Features

- **🤖 AI Agent Builder**: Create custom AI agents with specialized system instructions using Markdown.
- **⚙️ Workflow Optimizer**: Streamline complex tasks and professional workflows with targeted AI assistance.
- **🔐 Secure Access**: Google-styled authentication with persistent local sessions.
- **🔑 API Key Management**: Safely save and manage your Google Gemini API key.
- **🎨 Customizable Look**: Switch between light and dark themes.
- **💾 Local Storage**: All agent profiles and chat sessions automatically saved to your browser.

### Advanced Features

- **📊 Session Management**: Save, rename, duplicate, and delete chat sessions.
- **🔍 Search & Organize**: Find your conversations easily with organized session names.
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile.

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS with theme support
- **AI Models**: Google Gemini API (Text & Chat)
- **State Management**: Zustand with persistent storage
- **Deployment**: Netlify

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Google Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/johnwesleyquintero/wesai-personal-assistant.git
   cd wesai-personal-assistant
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📖 How to Use

### For New Users

1. **Login**: Use Google Sign-In to start your session
2. **Set API Key**: Add your Google Gemini API key in settings
3. **Choose Your Mode**:
   - **Content**: Generate written content
   - **Image**: Create images from descriptions
   - **Chat**: Interactive conversations
4. **Save Sessions**: Your work is automatically saved to your local storage

### For Power Users

- **Session Management**: Right-click on chat sessions to rename, duplicate, or delete
- **Theme Toggle**: Click the sun/moon icon for light/dark mode
- **Keyboard Shortcuts**: Enter to send messages, Ctrl+Enter for new lines
- **Export**: Copy generated content with one click

## 🏗️ Architecture Overview

### Local Storage Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Your Device   │    │   Google APIs   │
│                 │    │   Gemini API    │
│  React + TS     │◄──►│                 │
│  Zustand Store  │    │                 │
│  Local Storage  │    │                 │
└─────────────────┘    └─────────────────┘
```

The application is built as a pure client-side application. All data persistence is handled via the browser's `LocalStorage` API, and authentication is managed via Google's Identity Services. No server-side database is used, ensuring maximum privacy and speed.

### Data Flow

1. **Authentication**: Google Sign-In → Local Session Management
2. **Chat Storage**: User Input → Zustand → LocalStorage
3. **AI Processing**: User Input → Gemini API → Response → Local Storage

## 🔒 Security & Privacy

### Data Protection

- **Local Storage**: All your data stays on your device
- **Secure Authentication**: Google Identity Services for sign-in
- **API Key Isolation**: API keys are stored only in your browser's LocalStorage

### Privacy Policy

- **No Data Mining**: We don't analyze or sell your data
- **No Tracking**: No analytics, cookies, or third-party tracking
- **Local First**: Everything is stored only in your browser
- **User Control**: You can delete all your data at any time by clearing your browser cache or logging out

## 🚀 Deployment

### Netlify Deployment

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/johnwesleyquintero/wesai-personal-assistant)

### Manual Deployment

1. **Build the project**

   ```bash
   npm run build
   ```

2. **Deploy to your hosting provider**
   - Upload the `dist` folder to your web server
   - Configure environment variables (if any)

## 🧪 Development

### Code Quality

```bash
# Run all checks
npm run check

# Individual checks
npm run lint      # ESLint
npm run typecheck # TypeScript
npm run format    # Prettier
```

### Project Structure

```
wesai-personal-assistant/
├── src/                    # Source code
│   ├── components/          # React components
│   ├── services/           # API services
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google AI**: Gemini API for advanced AI capabilities
- **React Community**: Excellent ecosystem and tools
- **Tailwind CSS**: Beautiful, utility-first CSS framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/johnwesleyquintero/wesai-personal-assistant/issues)
- **Discussions**: [GitHub Discussions](https://github.com/johnwesleyquintero/wesai-personal-assistant/discussions)
- **Email**: Contact through GitHub profile

---

**🌟 Star this repo if you find it helpful!**

**Happy Creating with WesAI! 🚀**
