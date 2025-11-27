# 🤖 Gemini Chat - Real-time AI Streaming Chat Application

A modern, real-time chat application powered by Google's Gemini 2.0 Flash API with streaming responses, built with Next.js 14, TypeScript, and Tailwind CSS.

## 📋 Project Description

This is a production-ready chat application that demonstrates real-time streaming of AI responses using Google's Gemini API. The application features a beautiful, responsive UI with glassmorphism design, real-time message streaming, conversation history, and robust error handling.

---

## 🚀 Setup Instructions

Follow these steps to set up and run the project locally:

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- Google AI Studio API key

### Step 1: Clone the Repository
```bash
git clone <your-repository-url>
cd gemini-chat
```

### Step 2: Install Dependencies
```bash
npm install
# or
yarn install
```

### Step 3: Configure Environment Variables
Create a `.env.local` file in the root directory:

```bash
touch .env.local
```

Add your Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**To get your API key:**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key and paste it in `.env.local`

### Step 4: Run the Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 5: Build for Production (Optional)
```bash
npm run build
npm start
# or
yarn build
yarn start
```

---

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key from AI Studio | ✅ Yes |

---

## 📦 Tech Stack & Libraries

### Core Technologies
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **React 18** - UI library with hooks
- **Tailwind CSS** - Utility-first CSS framework

### Key Libraries
- **lucide-react** (^0.263.1) - Beautiful icon library
- **uuid** (^9.0.0) - Unique ID generation for messages

### API Integration
- **Google Gemini 2.0 Flash** - AI model for chat responses
- **Server-Sent Events (SSE)** - Real-time streaming protocol
- **Fetch API** - HTTP client with streaming support

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **PostCSS** - CSS processing

---

## ✨ Features Implemented

### Core Features
- [x] Real-time message streaming from Gemini API
- [x] Server-Sent Events (SSE) for live response streaming
- [x] Conversation history (last 10 messages sent as context)
- [x] Message persistence during session
- [x] Auto-scroll to latest message
- [x] Typing indicator while waiting for response
- [x] Character counter on input field

### UI/UX Features
- [x] Modern glassmorphism design
- [x] Responsive layout (mobile, tablet, desktop)
- [x] Gradient avatars for user and AI
- [x] Copy message functionality
- [x] Timestamp for each message
- [x] Empty state with welcome message
- [x] Loading states and animations
- [x] Smooth scroll behavior

### Advanced Features
- [x] Connection status indicator (Connected/Disconnected)
- [x] Clear chat functionality with confirmation
- [x] Request cancellation on clear
- [x] Error handling and display
- [x] Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- [x] Input validation (prevent empty messages)
- [x] Disabled state during streaming
- [x] Abort controller for request cancellation

### Performance Optimizations
- [x] Single component architecture (reduced from 9 to 1 main component)
- [x] Minimal re-renders
- [x] Efficient state management
- [x] Streaming chunk processing
- [x] Memory leak prevention with cleanup

### Code Quality
- [x] TypeScript strict mode
- [x] Type-safe API responses
- [x] Error boundaries
- [x] Clean code architecture
- [x] Proper async/await handling
- [x] Component reusability

---

## 🎯 Commands to Run the Project

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

---

## ⏱️ Time Spent on Assignment

| Task | Time Spent |
|------|------------|
| Initial setup & API integration | 1.5 hours |
| UI/UX design & components | 2 hours |
| Streaming implementation | 2 hours |
| Error handling & optimization | 1.5 hours |
| Component refactoring (9 → 1) | 1 hour |
| Testing & bug fixes | 1 hour |
| Documentation & README | 1 hour |
| **Total** | **10 hours** |

---

## 🎥 Demo Video

**[Watch the Demo Video Here](#)** *(Link to be added after recording)*

### Video Contents:
1. **Live Demonstration** (1-2 min)
   - Sending messages and streaming responses
   - Error handling scenarios
   - Connection status indicators
   - Copy and clear functionality

2. **Code Walkthrough** (1-2 min)
   - SSE streaming implementation
   - Component architecture
   - State management approach
   - API route structure

3. **Technical Discussion** (1 min)
   - Challenges and solutions
   - Design decisions and trade-offs
   - Performance optimizations

---

## 🏗️ Project Structure

```
gemini-chat/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # API endpoint for Gemini streaming
│   ├── components/
│   │   └── Chat.tsx               # Main chat component (all-in-one)
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Home page
├── public/                        # Static assets
├── .env.local                     # Environment variables (not in repo)
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 🔧 API Implementation Details

### Endpoint: `/api/chat`
- **Method:** POST
- **Content-Type:** application/json
- **Response:** text/event-stream (SSE)

### Request Body:
```json
{
  "message": "User's message",
  "history": [
    { "id": "1", "role": "user", "content": "Hello" },
    { "id": "2", "role": "assistant", "content": "Hi there!" }
  ]
}
```

### Response Stream Format:
```
data: {"text":"Hello"}\n\n
data: {"text":" how"}\n\n
data: {"text":" can"}\n\n
data: [DONE]\n\n
```

---

## 🐛 Known Issues & Solutions

### Issue 1: API 404 Error
**Problem:** Using incorrect Gemini model name or API version.
**Solution:** Use `gemini-2.0-flash` with `/v1beta/` endpoint.

### Issue 2: Empty Messages Saved
**Problem:** Streaming content saved before completion.
**Solution:** Accumulate content in local variable, save only when `[DONE]` received.

### Issue 3: Memory Leaks
**Problem:** EventSource not properly closed.
**Solution:** Use AbortController with fetch API for better cleanup.

---

## 🎨 Design Decisions

### Why Single Component Architecture?
- **Performance:** Fewer re-renders, single state source
- **Maintainability:** Easier to understand and modify
- **Bundle Size:** Smaller JavaScript bundle
- **Developer Experience:** Less prop drilling, clearer data flow

### Why Server-Sent Events over WebSocket?
- **Simplicity:** Unidirectional flow, simpler implementation
- **HTTP/2:** Native browser support, no additional libraries
- **Firewall Friendly:** Works through proxies and firewalls
- **Reconnection:** Automatic reconnection handling

### Why Gemini 2.0 Flash?
- **Speed:** Fastest response times for chat
- **Cost:** More economical than Pro version
- **Quality:** Excellent for conversational AI
- **Streaming:** Native SSE support

---

## 🚧 Future Enhancements

- [ ] Message editing and deletion
- [ ] Markdown rendering for code blocks
- [ ] File upload support
- [ ] Voice input integration
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Export chat history
- [ ] User authentication
- [ ] Conversation search
- [ ] Message reactions

---

## 📝 License

This project is created for educational purposes as part of an assignment.

---

## 🤝 Contributing

This is an assignment project, but feedback and suggestions are welcome!

---

## 📧 Contact

For questions or feedback about this project, please contact: [Your Email/GitHub]

---

## 🙏 Acknowledgments

- Google AI Studio for Gemini API
- Next.js team for the amazing framework
- Lucide for beautiful icons
- Tailwind CSS for styling utilities

---

**Made with ❤️ using Next.js and Gemini AI**
