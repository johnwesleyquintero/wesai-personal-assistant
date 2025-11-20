# WesAI Personal Assistant

Your AI-powered personal assistant and creative partner.

WesAI Personal Assistant is a product of [ScaleSmart](https://wescode.vercel.app/). It is a web application that uses Google's AI models (Gemini for text and Imagen for images) to help you with intelligent assistance, creating content, generating images, and having interactive conversations. It's designed with a focus on boosting your personal productivity and creativity.

This document explains the WesAI Personal Assistant application.

![WesAI Personal Assistant Screenshot](https://github.com/user-attachments/assets/df9ed07b-9e5d-416b-af24-c63e3f4be11a)

**Note:** You can also view this documentation directly within the WesAI application under the "Documentation" tab.

[![Netlify Status](https://api.netlify.com/api/v1/badges/2ec1707c-0c5a-49a4-821e-ee7d82bdd95d/deploy-status)](https://app.netlify.com/projects/wesai-pa/deploys)

## What WesAI Can Do

- **Secure Access:** A simple login page helps protect access to the application and your API key.
- **API Key Management:** Safely save and remove your Google Gemini API key directly in your browser. Your key is stored securely in your browser's local storage and you'll be asked for confirmation before it's removed.
- **Customizable Look:** Easily switch between light and dark themes for comfortable viewing, and the app remembers your preference.

- **Create Written Content:** Generate various types of text, like blog posts, social media updates, documentation, or emails, just by describing what you need.
- **Generate Images:** Create unique images from your descriptions using Google's Imagen model, with an option to download your creations.
- **Interactive Chat:**
  - Ask follow-up questions about the content or images the AI creates.
  - Get general help with different tasks.
  - See a live preview for some types of content generated in the chat, now with enhanced support for common styling utilities.
- **Built-in Help:** Access this documentation anytime directly within the application.
- **Modern Design:** Enjoy a clean, responsive interface built with modern web technologies, featuring theme support and easy-to-use clear input buttons.

## Getting Started

To use WesAI Personal Assistant, you will need:

- A modern web browser (like Chrome, Firefox, Edge, or Safari).
- A **Google Gemini API Key**. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey). Make sure this key works for both the Gemini API (for text) and the Imagen API (for images).

Once you have the application files and your API key:

1.  Open the application in your web browser.
2.  You will see a login page. The user and password for local/personal use are **`demo`**, **`password`**.
3.  After logging in, go to the "Manage Gemini API Key" section.
4.  Enter your Google Gemini API Key into the input field and click "Save Key". Your key will be stored securely in your browser's local storage so you don't have to enter it every time.

**Important Security Note:** Storing API keys in your browser is convenient for personal tools but is not recommended for applications used by many people. For those cases, API keys should be handled on a secure server.

## How to Use

1.  **Login** to the application.
2.  **Set your API Key** if you haven't already.
3.  **Change Theme (Optional):** Click the sun/moon icon in the top bar to switch between light and dark modes.
4.  **Choose what you want to do:**
    - **Content:** Describe the text you want to create (like a blog post or email) and click "Create Content."
    - **Image:** Type a description (a "prompt") for the image you want and click "Generate Image." You can then download the image.
    - **Chat:** Click the "Chat" tab to ask questions about previous AI outputs or get general help. Some content types will show a live preview here.
    - **Documentation:** Click the "Documentation" tab to read this guide.
5.  **See the Results:** The generated text, images, or chat responses will appear on the screen.
6.  **Copy Output:** Use the copy buttons next to the generated content or chat messages.
7.  **Clear Inputs:** Click the "X" icon next to the input boxes to quickly clear them.
8.  **Logout:** Click the "Logout" button in the API key management section. This will also remove your API key from the browser.

## Where to Find the Code

- GitHub: [https://github.com/johnwesleyquintero/wesai-personal-assistant](https://github.com/johnwesleyquintero/wesai-personal-assistant).

## Thanks To

- Powered by the Google Gemini and Imagen APIs.
- Built with React.
- Styled with Tailwind CSS.
- Developed using Vite.

## Privacy Policy

Your privacy is important. Here's how WesAI Personal Assistant handles your data:

- **API Keys:** Your Gemini API key is stored only in your browser's local storage. It is never sent to our servers or shared with anyone else. You can save or remove your key whenever you want.
- **Your Inputs:** Any text or image descriptions you enter are sent directly to the Google Gemini API for processing. We do not save, record, or look at this information ourselves. Google's rules apply to how they use data from the API.
- **Local Storage:** Besides your API key, your preference for light or dark mode is also saved in your browser's local storage.
- **No Tracking:** WesAI Personal Assistant does not use any third-party tracking, cookies, or analytics.

## Terms of Service

By using WesAI Personal Assistant, you agree to these terms:

- **API Key:** You are responsible for getting and managing your own Google Gemini API key. Your use of the Gemini API must follow Google's Terms of Service.
- **No Guarantees:** WesAI Personal Assistant is provided "as is," without any promises or guarantees. We cannot guarantee that the AI-generated content or code will be accurate or complete.
- **Limited Responsibility:** We are not responsible for any problems or damages that happen from using or not being able to use this application.
- **Personal Use:** This application is meant for personal and learning use. It is not built for important or production systems.
- **Changes:** We might change or stop offering the application at any time without telling you first.

## License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2025 John Wesley Quintero

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

For any questions about privacy or terms, please check the Google Gemini API documentation or contact us through the GitHub repository.

**Happy Creating with WesAI!**
