# WesAI 🚀

Your AI-powered personal assistant and creative partner with **cloud storage** and **cross-device sync**.

WesAI is a product of [ScaleSmart](https://wescode.vercel.app/). It's a web application that uses Google's AI models (Gemini for text and Imagen for images) to help you with intelligent assistance, creating content, generating images, and having interactive conversations. Now with **persistent cloud storage** powered by Supabase!

[![Netlify Status](https://api.netlify.com/api/v1/badges/2ec1707c-0c5a-49a4-821e-ee7d82bdd95d/deploy-status)](https://app.netlify.com/projects/wesai-pa/deploys)

## 🌟 What's New - Cloud Storage & Sync!

**🔄 Cross-Device Sync**: Your chat sessions now sync across all your devices when you log in
**☁️ Cloud Persistence**: Never lose your chat history again - everything is stored securely in the cloud
**🔐 Enhanced Security**: Row-level security ensures your data stays private and isolated
**📱 Access Anywhere**: Start a conversation on your laptop, continue on your phone

## 🚀 What WesAI Can Do

### Core Features

- **🔐 Secure Access**: Google OAuth authentication with persistent sessions
- **🔑 API Key Management**: Safely save and manage your Google Gemini API key
- **🎨 Customizable Look**: Switch between light and dark themes
- **🤖 AI-Powered Assistance**:
  - **Content Creation**: Generate blog posts, emails, documentation, social media content
  - **Image Generation**: Create unique images from text descriptions
  - **Interactive Chat**: Have conversations about your content with live previews
- **💾 Cloud Storage**: All chat sessions automatically saved and synced

### Advanced Features

- **📊 Session Management**: Save, rename, duplicate, and delete chat sessions
- **🔄 Real-time Sync**: Changes appear instantly across all logged-in devices
- **🔍 Search & Organize**: Find your conversations easily with organized session names
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS with theme support
- **AI Models**: Google Gemini API (text) + Imagen API (images)
- **Backend**: Supabase (PostgreSQL + Authentication + Real-time)
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

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Supabase Setup (For Cloud Storage)

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Run the database schema** using the provided `supabase_schema.sql` file
3. **Configure Google OAuth** in your Supabase project settings
4. **Update your environment variables** with your Supabase credentials

Detailed setup instructions are in [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md)

## 📖 How to Use

### For New Users

1. **Login**: Use Google OAuth or demo credentials (user: `demo`, password: `password`)
2. **Set API Key**: Add your Google Gemini API key in settings
3. **Choose Your Mode**:
   - **Content**: Generate written content
   - **Image**: Create images from descriptions
   - **Chat**: Interactive conversations
4. **Save Sessions**: Your work is automatically saved to the cloud

### For Power Users

- **Session Management**: Right-click on chat sessions to rename, duplicate, or delete
- **Theme Toggle**: Click the sun/moon icon for light/dark mode
- **Keyboard Shortcuts**: Enter to send messages, Ctrl+Enter for new lines
- **Export**: Copy generated content with one click

## 🏗️ Architecture Overview

### Cloud Storage Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Your Device   │    │   Supabase      │    │   Google APIs   │
│                 │◄──►│   PostgreSQL    │    │   Gemini/Imagen │
│  React + TS     │    │   Authentication│◄──►│                 │
│  Zustand Store  │    │   Row Level     │    │                 │
│  Local Storage  │    │   Security      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

1. **Authentication**: Google OAuth → Supabase Auth → Session Management
2. **Chat Storage**: User Input → Zustand → Supabase → Cross-device Sync
3. **AI Processing**: User Input → Gemini API → Response → Cloud Storage

## 🔒 Security & Privacy

### Data Protection

- **Row Level Security**: Users can only access their own data
- **Encrypted Storage**: All data encrypted at rest in PostgreSQL
- **Secure Authentication**: Google OAuth with JWT tokens
- **API Key Isolation**: API keys never touch our servers

### Privacy Policy

- **No Data Mining**: We don't analyze or sell your data
- **No Tracking**: No analytics, cookies, or third-party tracking
- **Local First**: API keys stored only in your browser
- **User Control**: You can delete all your data at any time

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
   - Configure environment variables
   - Set up your Supabase project

See [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md) for detailed deployment instructions.

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
│   ├── services/           # API and Supabase services
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
├── supabase_schema.sql     # Database schema
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

- **Google AI**: Gemini and Imagen APIs for AI capabilities
- **Supabase**: PostgreSQL database and authentication
- **React Community**: Excellent ecosystem and tools
- **Tailwind CSS**: Beautiful, utility-first CSS framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/johnwesleyquintero/wesai-personal-assistant/issues)
- **Discussions**: [GitHub Discussions](https://github.com/johnwesleyquintero/wesai-personal-assistant/discussions)
- **Email**: Contact through GitHub profile

---

**🌟 Star this repo if you find it helpful!**

**Happy Creating with WesAI! 🚀**
