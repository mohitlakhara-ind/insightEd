# InsightEd Web Platform (Accessibility-First Vocational Training)

InsightEd is a modern, accessibility-first web application designed to empower visually impaired learners with high-quality vocational training. The platform features an intelligent, client-side, self-learning voice assistant, real-time speech pronunciation feedback, access-optimized mind games, and collaborative peer community spaces.

---

## 🌟 Key Features

### 1. Hands-Free Voice Assistant Companion
- **Continuous Phonetic Wake-Word Detection**: Runs a background Web Speech listener supporting various phonetic pronunciations of "Alan" (e.g., *Allen*, *Ellen*, *Alon*, *Elena*, *Allan*) and activation prefixes (e.g., *Hello*, *Hey*, *Hi*, *Ok*).
- **Direct Command Activation**: The continuous passive listener immediately detects direct commands (e.g., *"courses"*, *"open games"*, *"speech coach"*, *"join peer rooms"*) and navigates the user immediately, bypassing any greeting delay for instant response times.
- **Client-Side Self-Learning Query Router**:
  - **Explicit Teaching**: Users can say *"remember study tracks means courses"* or *"when I say let's play open mind games"*. The companion parses this via natural regex matching and registers the mapping.
  - **Implicit Learning (UI Alignment)**: If the user says an unrecognized phrase (e.g., *"social deck"*), the companion logs it as a pending query. If the user clicks a button or executes a valid command within 20 seconds, the assistant automatically associates the unrecognized phrase with that route.
  - **Persistence**: All learned shortcuts are saved locally in `localStorage` (`insightEd_learned_commands`) to persist across page reloads.

### 2. Audio & Vocational Courses Library (`/courses`)
- Adaptive layout optimized for high-contrast visibility.
- Comprehensive vocational course player supporting audio narration, adaptive reading speed controls, and persistent progress tracking.

### 3. AI Speech & Pronunciation Coach (`/pronunciation`)
- Evaluates real-time spoken audio inputs against reference sentences.
- Provides immediate visual and audio-described pronunciation scores and phonetic mismatch analysis.

### 4. Accessibility-Optimized Mind Games (`/games`)
- **Memory Match**: Classic cognitive training board with screen-reader friendly high-contrast cards and sonic feedback.
- **Storytelling**: Text-to-speech enabled prompt completion and interactive path branching.

### 5. Peer Community Rooms (`/community`)
- Collaboration hubs allowing students to connect, converse, and peer-learn using WebRTC/live audio sharing.

### 6. Domain-Based Auto-Role Authentication
- Seamless Firebase Authentication integration.
- Automatically assigns user roles based on sign-up credentials:
  - Email addresses ending with `@insighted.org` or `admin@insighted.com` are auto-configured as `'educator'`.
  - All other emails default to `'student'`.

---

## 🛠️ Project Structure

The project follows a standard Next.js directory hierarchy:

```text
web/
├── public/                 # Static assets (images, logos)
├── src/
│   ├── app/                # Next.js Pages & Router
│   │   ├── community/      # Live Peer Rooms
│   │   ├── courses/        # Vocational Courses & Player
│   │   ├── educator/       # Educator Dashboard
│   │   ├── games/          # Accessibility-First Mind Games
│   │   ├── pronunciation/  # AI Speech/Pronunciation Coach
│   │   ├── sign-in/        # Authentication screen
│   │   ├── layout.tsx      # Main layout wrapper
│   │   └── page.tsx        # Homepage / Landing page
│   ├── components/         # Reusable UI Components
│   │   └── voice-assistant-overlay.tsx # Floating Voice UI companion
│   ├── context/            # Auth and Firebase Context providers
│   ├── hooks/              # Zustand state hooks (useVoiceStore)
│   ├── lib/                # Shared utilities & configurations
│   └── services/           # Service Singletons
│       ├── alan-service.ts          # Speech recognition/synthesis handler
│       ├── wake-word-detector.ts    # Background wake word listener
│       └── voice-analytics.ts       # Telemetry logging to Firestore
└── firestore.rules         # Secure database access rules
```

---

## 🚀 Getting Started & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository_url>
   cd web
   ```

2. **Configure Environment Variables**
   Create a `.env.local` file in the root `web` directory and add your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🔒 Security & Deployment

- **Firebase Rules**: Secured with Firestore security rules ensuring user profile modifications are restricted to authenticated owners, and voice telemetry records are write-only for audit tracking.
- **Production Build**: 
  Compile and build the optimized static production application using:
  ```bash
  npm run build
  npm run start
  ```
