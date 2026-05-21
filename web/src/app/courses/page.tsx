"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { DynamicBackground } from "@/components/dynamic-background";
import { 
  Cpu, 
  BookOpen, 
  Loader2, 
  ArrowRight, 
  Play, 
  Pause, 
  X, 
  Trophy, 
  Volume2, 
  Award, 
  Zap, 
  HelpCircle, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  SkipBack,
  SkipForward
} from "lucide-react";
import { db } from "@/services/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { AlanService } from "@/services/alan-service";
import { useVoiceStore } from "@/hooks/use-voice-store";

interface Lesson {
  title: string;
  content: string;
}

interface Course {
  id?: string;
  name: string;
  category: "technical" | "non-technical";
  episodes: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  description?: string;
  lessons?: Lesson[];
}

const DEFAULT_COURSES: Course[] = [
  { 
    name: "DSA Mastery", 
    category: "technical", 
    episodes: 4, 
    level: "Intermediate", 
    description: "Master core algorithms, structures, and asymptotic runtimes.",
    lessons: [
      { title: "Introduction to Data Structures", content: "A data structure is a specialized format for organizing, processing, retrieving, and storing data. Selecting the correct structure is foundational to optimization." },
      { title: "Linked Lists Demystified", content: "A linked list is a linear collection of data elements whose order is not given by their physical placement in memory. Nodes dynamically link via pointers." },
      { title: "Stacks & Queues in Action", content: "Stacks operate on a Last-In, First-Out basis for call tracing, while Queues maintain a First-In, First-Out sequence for buffer streams." },
      { title: "Binary Search Trees", content: "A binary search tree keeps its keys in sorted order, allowing fast binary search lookups, insertions, and traversal operations." }
    ]
  },
  { 
    name: "Fullstack Web", 
    category: "technical", 
    episodes: 4, 
    level: "Advanced", 
    description: "Build scalable, responsive web portals using Next.js.",
    lessons: [
      { title: "Introduction to Next.js", content: "Next.js is a React framework for building high-performance, search engine optimized fullstack applications with integrated routing." },
      { title: "React Server Components", content: "Server Components execute on the server, significantly reducing client-side javascript payloads and optimizing network efficiency." },
      { title: "Client Hydration Patterns", content: "Hydration is the process of attaching event listeners to static HTML pre-rendered on the server, rendering it fully interactive." },
      { title: "Dynamic Routing & API Fetching", content: "Next.js utilizes a file-system based router, allowing seamless API routing and incremental static regeneration of content." }
    ]
  },
  { 
    name: "Python Basics", 
    category: "technical", 
    episodes: 4, 
    level: "Beginner", 
    description: "Learn variables, loops, lists, and function scopes.",
    lessons: [
      { title: "Variables & Memory Scope", content: "Python is a dynamically typed, interpreted language where variables serve as labels referencing dynamically allocated objects in memory." },
      { title: "Lists & Tuples Sequences", content: "Lists are mutable sequences suitable for collections of uniform data, while Tuples are immutable, preventing accidental side effects." },
      { title: "Loops & Conditional Logic", content: "For loops iterate over iterable objects, while conditional block execution paths direct logical program branching cleanly." },
      { title: "Function Scopes & Definitions", content: "Functions encapsulate reusable modules of logic, defining localized variable namespaces and modular structure." }
    ]
  },
  { 
    name: "Public Speaking", 
    category: "non-technical", 
    episodes: 4, 
    level: "Beginner", 
    description: "Speak with cadence, pitch control, and powerful outlines.",
    lessons: [
      { title: "The Classical Rule of Three", content: "Expressing critical concepts in triads or groups of three significantly increases retention and audience emotional resonance." },
      { title: "Voice Pitch & Cadence Control", content: "Varying voice cadence, rhythm, volume, and inserting tactical silent pauses transforms simple text into an engaging experience." },
      { title: "Connecting with Dynamic Audiences", content: "Establishing structured eye contact with individual listeners builds personal validation, and helps gauge overall room vibes." },
      { title: "Structuring a Speech Outline", content: "An outline acts as a visual map, keeping the speaker focused on key milestones without memorizing blocks of script." }
    ]
  },
  { 
    name: "Project Management", 
    category: "non-technical", 
    episodes: 4, 
    level: "Intermediate", 
    description: "Agile methodologies, sprint cycles, and risk backlogs.",
    lessons: [
      { title: "Agile & Scrum Frameworks", content: "Agile promotes collaborative iterative cycles, short-term commitments, customer feedback loops, and highly responsive workflows." },
      { title: "Sprint Backlog Prioritization", content: "The sprint backlog represents a highly prioritized set of deliverables chosen by the product owner for hyper-focus in the active cycle." },
      { title: "Mapping Path Dependencies", content: "Identifying project path dependencies early prevents cascading blockers and keeps pacing expectations realistic." },
      { title: "Executing Retro Iterations", content: "A retrospective provides the team space to reflect on friction points, celebrating wins and designing proactive solutions." }
    ]
  },
  { 
    name: "UI/UX Design", 
    category: "non-technical", 
    episodes: 4, 
    level: "Intermediate", 
    description: "Master accessible layouts, contrasts, and client typography.",
    lessons: [
      { title: "Contrast Ratios & Colors", content: "Contrast ratios measure the luminosity difference between foreground text and its background, determining basic readability levels." },
      { title: "Accessibility-First Design", content: "Accessibility is a vital responsibility, ensuring that navigation, visual contrast, and interactive layouts work perfectly for everyone." },
      { title: "Client Typography Hierarchy", content: "Selecting complementary font pairings and balancing line-heights, letter spacing, and sizing creates visual clarity." },
      { title: "Wireframing User Flows", content: "Wireframes establish low-fidelity layout balancing, mapping user journeys cleanly before design elements are finalized." }
    ]
  }
];

const CATEGORY_METADATA = [
  {
    id: "technical",
    title: "Technical Courses",
    description: "Master Data Structures, Algorithms, and Modern Programming Languages.",
    icon: <Cpu className="w-8 h-8 text-indigo-500" />,
    color: "indigo",
  },
  {
    id: "non-technical",
    title: "Non-Technical Skills",
    description: "Soft skills, Business Communication, and Creative Writing.",
    icon: <BookOpen className="w-8 h-8 text-rose-500" />,
    color: "rose",
  },
] as const;

// Accessibility quizzes tailored to each course
const COURSE_QUIZZES: Record<string, {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}[]> = {
  "DSA Mastery": [
    {
      question: "Which data structure operates on a First-In, First-Out (FIFO) basis?",
      options: ["Stack", "Queue", "Binary Tree", "Hash Map"],
      answer: 1,
      explanation: "A Queue operates on FIFO where elements are added at the back and removed from the front."
    },
    {
      question: "What is the worst-case time complexity of searching in a standard Binary Search Tree?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      answer: 2,
      explanation: "In the worst case (a skewed tree), a BST behaves like a linked list, requiring O(n) operations."
    }
  ],
  "Fullstack Web": [
    {
      question: "What is the primary purpose of server-side rendering (SSR) in React/Next.js?",
      options: ["Improve SEO and initial load time", "Delete client-side cookies", "Encrypt the database", "Disable css styling"],
      answer: 0,
      explanation: "SSR pre-renders page content, speeding up initial load times and boosting search engine indexes."
    }
  ],
  "Python Basics": [
    {
      question: "Which of the following is an immutable data type in Python?",
      options: ["List", "Dictionary", "Set", "Tuple"],
      answer: 3,
      explanation: "Tuples are immutable in Python, meaning their elements cannot be changed once created."
    }
  ],
  "Public Speaking": [
    {
      question: "What is the 'Rule of Three' in oral communication?",
      options: ["Speak for exactly 3 minutes", "Expressing concepts in triads for higher retention", "Only looking at 3 people", "Using 3 microphones"],
      answer: 1,
      explanation: "Humans naturally retain and enjoy points grouped into triads (sets of three) much better."
    }
  ],
  "Project Management": [
    {
      question: "What does the 'Sprint Backlog' represent in Agile/Scrum?",
      options: ["The company's long term vision", "A set of product items selected for the active sprint", "A list of team holidays", "A record of past completed tasks"],
      answer: 1,
      explanation: "The Sprint Backlog contains the items and tasks the team commits to building in the current cycle."
    }
  ],
  "UI/UX Design": [
    {
      question: "What does 'Contrast Ratio' measure in web accessibility?",
      options: ["The layout spacing", "The brightness difference between text and its background", "The page speed", "The number of colors used"],
      answer: 1,
      explanation: "Contrast determines legibility. WCAG requires at least 4.5:1 for standard body text."
    }
  ]
};

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  // Player and Quiz Modal State
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Quiz states inside the player
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    fetchCourses();
    return () => {
      stopAudio();
    };
  }, []);

  async function fetchCourses() {
    setLoading(true);
    
    // Set a strict 2.5 second timeout to prevent infinite hangs
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Firestore connection timed out. Loading local academy database...")), 2500)
    );

    const fetchPromise = (async () => {
      const querySnapshot = await getDocs(collection(db, "courses"));
      const coursesList: Course[] = [];
      querySnapshot.forEach((docSnap) => {
        coursesList.push({ id: docSnap.id, ...docSnap.data() } as Course);
      });

      if (coursesList.length === 0) {
        console.log("Seeding default courses to Firestore...");
        for (const item of DEFAULT_COURSES) {
          const docRef = await addDoc(collection(db, "courses"), item);
          coursesList.push({ id: docRef.id, ...item });
        }
      }
      return coursesList;
    })();

    try {
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      setCourses(result);
      setIsOffline(false);
    } catch (error) {
      console.warn("Firestore fetch error/timeout, loading defaults:", error);
      setCourses(DEFAULT_COURSES.map((c, i) => ({ ...c, id: `local-${i}` })));
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  }

  // Text-To-Speech (TTS) engine controls
  const announceSpeech = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = playbackSpeed;
      utterance.pitch = 1.0;
      utterance.onstart = () => {
        useVoiceStore.getState().setVoiceState("speaking");
      };
      utterance.onend = () => {
        if (!showQuiz) {
          stopAudio();
        }
        useVoiceStore.getState().setVoiceState("idle");
      };
      utterance.onerror = (e) => {
        console.error("[CoursesPage TTS] error:", e);
        useVoiceStore.getState().setVoiceState("idle");
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  const playAudio = (course: Course, lessonIdx: number = 0) => {
    setIsPlaying(true);
    const lessons = course.lessons || [];
    const activeLesson = lessons[lessonIdx];
    const audioText = activeLesson 
      ? `Playing ${activeLesson.title} for ${course.name}. ${activeLesson.content}`
      : `Playing Lesson 1 for ${course.name}. ${course.description || "In this lesson, we will explore core foundational skills required to excel in this specialized vocational track."}`;
    announceSpeech(audioText);

    // Simulate progress bar movement
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      setPlayProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressIntervalRef.current!);
          return 100;
        }
        return prev + 1;
      });
    }, 150 / playbackSpeed);
  };

  const pauseAudio = () => {
    setIsPlaying(false);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
    useVoiceStore.getState().setVoiceState("idle");
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  const resumeAudio = () => {
    setIsPlaying(false);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
        useVoiceStore.getState().setVoiceState("speaking");
        // resume interval
        progressIntervalRef.current = setInterval(() => {
          setPlayProgress((prev) => {
            if (prev >= 100) {
              clearInterval(progressIntervalRef.current!);
              return 100;
            }
            return prev + 1;
          });
        }, 150 / playbackSpeed);
      } else {
        if (selectedCourse) playAudio(selectedCourse, currentLessonIndex);
      }
    }
  };

  function stopAudio() {
    setIsPlaying(false);
    setPlayProgress(0);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    useVoiceStore.getState().setVoiceState("idle");
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  }

  const selectLesson = (idx: number) => {
    if (!selectedCourse) return;
    setCurrentLessonIndex(idx);
    setPlayProgress(0);
    playAudio(selectedCourse, idx);
  };

  const openPlayer = (course: Course) => {
    setSelectedCourse(course);
    setCurrentLessonIndex(0);
    setShowQuiz(false);
    setPlayProgress(0);
    setPlaybackSpeed(1.0);
    // Auto-play on modal open
    setTimeout(() => {
      playAudio(course, 0);
    }, 300);
  };

  const closePlayer = () => {
    stopAudio();
    setSelectedCourse(null);
    setCurrentLessonIndex(0);
    setShowQuiz(false);
  };

  // Quiz Handling
  const startQuiz = () => {
    stopAudio();
    setShowQuiz(true);
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setQuizSubmitted(false);
    setQuizScore(0);
    setQuizFinished(false);

    // Announce first question
    const courseName = selectedCourse?.name || "";
    const quizzes = COURSE_QUIZZES[courseName] || [];
    if (quizzes.length > 0) {
      setTimeout(() => {
        announceQuizQuestion(quizzes[0]);
      }, 500);
    }
  };

  const announceQuizQuestion = (quiz: {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
  }) => {
    const speech = `Question ${currentQuizIndex + 1}. ${quiz.question}. Option one: ${quiz.options[0]}. Option two: ${quiz.options[1]}. Option three: ${quiz.options[2]}. Option four: ${quiz.options[3]}. Choose your answer.`;
    announceSpeech(speech);
  };

  const handleSelectOption = (idx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswer(idx);
    announceSpeech(`Selected option ${idx + 1}: ${selectedCourse ? (COURSE_QUIZZES[selectedCourse.name]?.[currentQuizIndex]?.options[idx] || "") : ""}`);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || quizSubmitted) return;

    const quizzes = COURSE_QUIZZES[selectedCourse!.name] || [];
    const currentQuiz = quizzes[currentQuizIndex];
    const isCorrect = selectedAnswer === currentQuiz.answer;

    setQuizSubmitted(true);

    if (isCorrect) {
      setQuizScore((s) => s + 1);
      announceSpeech(`Correct! Excellent job. Explanation: ${currentQuiz.explanation}. Proceed to next step.`);
    } else {
      announceSpeech(`Incorrect. The correct answer was option ${currentQuiz.answer + 1}. Explanation: ${currentQuiz.explanation}. Continue.`);
    }
  };

  const handleNextQuestion = () => {
    const quizzes = COURSE_QUIZZES[selectedCourse!.name] || [];
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex((idx) => idx + 1);
      setSelectedAnswer(null);
      setQuizSubmitted(false);
      
      const nextQuiz = quizzes[currentQuizIndex + 1];
      setTimeout(() => {
        announceQuizQuestion(nextQuiz);
      }, 300);
    } else {
      setQuizFinished(true);
      announceSpeech(`Quiz finished! You scored ${quizScore} out of ${quizzes.length} correct. Experience points added successfully.`);
    }
  };

  // Voice Command integration
  const stateRef = useRef({
    selectedCourse,
    currentLessonIndex,
    isPlaying,
    showQuiz,
    currentQuizIndex,
    selectedAnswer,
    quizSubmitted,
    quizFinished,
    courses,
  });

  useEffect(() => {
    stateRef.current = {
      selectedCourse,
      currentLessonIndex,
      isPlaying,
      showQuiz,
      currentQuizIndex,
      selectedAnswer,
      quizSubmitted,
      quizFinished,
      courses,
    };
  }, [
    selectedCourse,
    currentLessonIndex,
    isPlaying,
    showQuiz,
    currentQuizIndex,
    selectedAnswer,
    quizSubmitted,
    quizFinished,
    courses,
  ]);

  const actionsRef = useRef({
    openPlayer,
    closePlayer,
    playAudio,
    pauseAudio,
    resumeAudio,
    stopAudio,
    selectLesson,
    startQuiz,
    handleSelectOption,
    handleSubmitAnswer,
    handleNextQuestion,
    setShowQuiz,
  });

  useEffect(() => {
    actionsRef.current = {
      openPlayer,
      closePlayer,
      playAudio,
      pauseAudio,
      resumeAudio,
      stopAudio,
      selectLesson,
      startQuiz,
      handleSelectOption,
      handleSubmitAnswer,
      handleNextQuestion,
      setShowQuiz,
    };
  });

  useEffect(() => {
    const courseKeywords = [
      { name: "DSA Mastery", keywords: ["dsa", "data structures", "dsa mastery"] },
      { name: "Fullstack Web", keywords: ["fullstack", "web", "full stack"] },
      { name: "Python Basics", keywords: ["python", "python basics"] },
      { name: "Public Speaking", keywords: ["public speaking", "speaking"] },
      { name: "Project Management", keywords: ["project management", "agile", "scrum"] },
      { name: "UI/UX Design", keywords: ["ui", "ux", "design", "ui/ux design", "ui ux design"] },
    ];

    const unsubscribe = AlanService.getInstance().registerCommandListener((query, cleanQuery) => {
      // 1. Course Selection / Switching (Always active if query contains a course keyword)
      let matchedCourseName = "";
      for (const item of courseKeywords) {
        if (item.keywords.some(kw => cleanQuery.includes(kw))) {
          const isExplicitSelect = ["open", "select", "start", "play", "go to", "choose"].some(prefix => cleanQuery.includes(prefix));
          if (isExplicitSelect || !stateRef.current.selectedCourse || item.keywords.some(kw => cleanQuery === kw)) {
            matchedCourseName = item.name;
            break;
          }
        }
      }

      if (matchedCourseName) {
        const course = stateRef.current.courses.find(c => c.name.toLowerCase() === matchedCourseName.toLowerCase());
        if (course) {
          useVoiceStore.getState().setAssistantResponse(`Opening the ${course.name} module.`);
          actionsRef.current.openPlayer(course);
          return true;
        }
      }

      // 2. Playback Control (when player is open and NOT showing quiz)
      if (stateRef.current.selectedCourse && !stateRef.current.showQuiz) {
        if (
          cleanQuery === "pause" ||
          cleanQuery.includes("pause lesson") ||
          cleanQuery.includes("pause audio") ||
          cleanQuery.includes("pause playback")
        ) {
          actionsRef.current.pauseAudio();
          useVoiceStore.getState().setAssistantResponse("Pausing playback.");
          useVoiceStore.getState().setVoiceState("idle");
          return true;
        }
        if (
          cleanQuery === "play" ||
          cleanQuery === "resume" ||
          cleanQuery.includes("play lesson") ||
          cleanQuery.includes("resume audio") ||
          cleanQuery.includes("start playback")
        ) {
          actionsRef.current.resumeAudio();
          useVoiceStore.getState().setAssistantResponse("Resuming playback.");
          return true;
        }
        if (
          cleanQuery === "stop" ||
          cleanQuery.includes("stop playback") ||
          cleanQuery.includes("stop audio")
        ) {
          actionsRef.current.stopAudio();
          useVoiceStore.getState().setAssistantResponse("Stopping audio.");
          useVoiceStore.getState().setVoiceState("idle");
          return true;
        }
      }

      // 3. Close Player / Exit Course
      if (stateRef.current.selectedCourse) {
        if (
          cleanQuery === "close" ||
          cleanQuery === "exit" ||
          cleanQuery.includes("close player") ||
          cleanQuery.includes("exit course") ||
          cleanQuery.includes("close course") ||
          cleanQuery.includes("exit player")
        ) {
          actionsRef.current.closePlayer();
          useVoiceStore.getState().setAssistantResponse("Closing course player.");
          useVoiceStore.getState().setVoiceState("idle");
          return true;
        }
      }

      // 4. Lesson Navigation (when player is open and NOT showing quiz)
      if (stateRef.current.selectedCourse && !stateRef.current.showQuiz) {
        if (
          cleanQuery.includes("next lesson") ||
          cleanQuery.includes("next episode") ||
          cleanQuery.includes("next track") ||
          cleanQuery.includes("nexttrack") ||
          cleanQuery === "next" ||
          cleanQuery.includes("go to next")
        ) {
          const lessons = stateRef.current.selectedCourse.lessons || [];
          const nextIdx = stateRef.current.currentLessonIndex + 1;
          if (nextIdx < lessons.length) {
            const nextLesson = lessons[nextIdx];
            useVoiceStore.getState().setAssistantResponse(`Playing next track: ${nextLesson.title}.`);
            actionsRef.current.selectLesson(nextIdx);
          } else {
            useVoiceStore.getState().setAssistantResponse("This is the final lesson of the course.");
            if (typeof window !== "undefined" && window.speechSynthesis) {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance("This is the final lesson of the course.");
              utterance.onstart = () => {
                useVoiceStore.getState().setVoiceState("speaking");
              };
              utterance.onend = () => {
                useVoiceStore.getState().setVoiceState("idle");
              };
              utterance.onerror = () => {
                useVoiceStore.getState().setVoiceState("idle");
              };
              window.speechSynthesis.speak(utterance);
            }
          }
          return true;
        }
        if (
          cleanQuery.includes("previous lesson") ||
          cleanQuery.includes("previous episode") ||
          cleanQuery.includes("previous track") ||
          cleanQuery.includes("previoustrack") ||
          cleanQuery === "previous" ||
          cleanQuery.includes("go back") ||
          cleanQuery.includes("go to previous")
        ) {
          const prevIdx = stateRef.current.currentLessonIndex - 1;
          if (prevIdx >= 0) {
            const lessons = stateRef.current.selectedCourse.lessons || [];
            const prevLesson = lessons[prevIdx];
            useVoiceStore.getState().setAssistantResponse(`Playing previous track: ${prevLesson.title}.`);
            actionsRef.current.selectLesson(prevIdx);
          } else {
            useVoiceStore.getState().setAssistantResponse("This is the first lesson of the course.");
            if (typeof window !== "undefined" && window.speechSynthesis) {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance("This is the first lesson of the course.");
              utterance.onstart = () => {
                useVoiceStore.getState().setVoiceState("speaking");
              };
              utterance.onend = () => {
                useVoiceStore.getState().setVoiceState("idle");
              };
              utterance.onerror = () => {
                useVoiceStore.getState().setVoiceState("idle");
              };
              window.speechSynthesis.speak(utterance);
            }
          }
          return true;
        }
      }

      // 5. Quiz Interactions
      if (stateRef.current.selectedCourse) {
        // Start Quiz
        if (!stateRef.current.showQuiz) {
          if (
            cleanQuery.includes("start quiz") ||
            cleanQuery.includes("take quiz") ||
            cleanQuery.includes("open quiz")
          ) {
            useVoiceStore.getState().setAssistantResponse("Starting course quiz.");
            actionsRef.current.startQuiz();
            return true;
          }
        } else {
          // Active Quiz / Option Selection
          if (!stateRef.current.quizFinished) {
            const optionMatch = cleanQuery.match(/(?:option|choice|number)\s+(one|two|three|four|1|2|3|4)/i) || 
                                cleanQuery.match(/^(one|two|three|four|1|2|3|4)$/i);
            if (optionMatch) {
              const optVal = optionMatch[1].toLowerCase();
              let optIdx = -1;
              if (optVal === "one" || optVal === "1") optIdx = 0;
              else if (optVal === "two" || optVal === "2") optIdx = 1;
              else if (optVal === "three" || optVal === "3") optIdx = 2;
              else if (optVal === "four" || optVal === "4") optIdx = 3;
              
              if (optIdx >= 0 && optIdx < 4) {
                useVoiceStore.getState().setAssistantResponse(`Selected option ${optIdx + 1}.`);
                actionsRef.current.handleSelectOption(optIdx);
                return true;
              }
            }

            if (
              cleanQuery === "submit" ||
              cleanQuery.includes("submit answer") ||
              cleanQuery.includes("submit quiz")
            ) {
              useVoiceStore.getState().setAssistantResponse("Submitting answer.");
              actionsRef.current.handleSubmitAnswer();
              return true;
            }

            if (
              cleanQuery.includes("next question") ||
              cleanQuery.includes("go to next question") ||
              cleanQuery === "continue" ||
              (stateRef.current.quizSubmitted && cleanQuery === "next")
            ) {
              useVoiceStore.getState().setAssistantResponse("Loading next question.");
              actionsRef.current.handleNextQuestion();
              return true;
            }
          } else {
            // Quiz completed view
            if (
              cleanQuery.includes("retake") ||
              cleanQuery.includes("restart") ||
              cleanQuery.includes("try again")
            ) {
              useVoiceStore.getState().setAssistantResponse("Restarting quiz.");
              actionsRef.current.startQuiz();
              return true;
            }
            if (
              cleanQuery.includes("back to player") ||
              cleanQuery.includes("close quiz") ||
              cleanQuery.includes("return")
            ) {
              useVoiceStore.getState().setAssistantResponse("Returning to course player.");
              actionsRef.current.setShowQuiz(false);
              useVoiceStore.getState().setVoiceState("idle");
              return true;
            }
          }
        }
      }

      return false;
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <main className="relative min-h-screen pt-28 pb-20 px-4 md:px-8 flex flex-col items-center">
      <DynamicBackground />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl flex items-center justify-between mb-8 relative z-10"
      >
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors group"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span> Back to Home
        </button>
        <h1 className="text-3xl font-extrabold tracking-tight text-white bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Vocational Academy
        </h1>
        <div className="w-24" />
      </motion.header>

      {/* Offline Resilient Banner */}
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-6xl p-4 mb-8 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl flex items-center gap-3 backdrop-blur-md relative z-10"
        >
          <Zap className="shrink-0 animate-pulse text-cyan-400" size={20} />
          <span className="text-xs font-bold uppercase tracking-wider">
            Offline Pacing Enabled · Audio tracks and interactive course quizzes loaded from standard catalog cache.
          </span>
        </motion.div>
      )}

      {loading ? (
        <div className="flex-grow flex flex-col items-center justify-center py-28 gap-4 relative z-10">
          <Loader2 className="animate-spin text-[var(--accent)]" size={48} />
          <span className="text-[var(--text-secondary)] font-bold text-lg">Curating courses from academy catalog...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl relative z-10">
          {CATEGORY_METADATA.map((cat, i) => {
            const categoryCourses = courses.filter(c => c.category === cat.id);

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 to-rose-500/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative h-full bg-[var(--surface-elevated)]/80 backdrop-blur-xl border border-[var(--border)] rounded-[3rem] p-8 md:p-10 flex flex-col shadow-xl">
                  <div className="size-16 rounded-2xl bg-[var(--background)] flex items-center justify-center mb-6 shadow-inner border border-[var(--border)]">
                    {cat.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                    {cat.title}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] mb-6">
                    {cat.description}
                  </p>
                  
                  <div className="space-y-4 mb-8 flex-grow">
                    {categoryCourses.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-[var(--background)]/35 border border-[var(--border)] text-center text-[var(--text-muted)] text-sm">
                        No courses available in this track yet.
                      </div>
                    ) : (
                      categoryCourses.map((course) => (
                        <div key={course.id} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--background)]/50 border border-[var(--border)] gap-4 hover:border-white/10 transition-colors">
                          <div className="flex-grow">
                            <h4 className="font-bold text-[var(--text-primary)] leading-tight text-sm md:text-base">{course.name}</h4>
                            <p className="text-[10px] text-[var(--text-muted)] mt-1 font-bold uppercase tracking-wider">{course.episodes} Episodes · {course.level}</p>
                          </div>
                          <button 
                            onClick={() => openPlayer(course)}
                            className="shrink-0 size-10 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center hover:bg-[var(--accent)] hover:text-white transition-all hover:scale-105 active:scale-95"
                          >
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Accessible Glassmorphic Player & Quiz Modal Overlay */}
      <AnimatePresence>
        {selectedCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[var(--background)]/60 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[var(--surface-elevated)]/90 border border-[var(--border)] rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-6 md:p-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Blur blobs */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-[var(--accent)]/10 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-[var(--accent-primary)]/10 blur-[80px] rounded-full pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={closePlayer}
                className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white transition-colors z-10"
              >
                <X size={18} />
              </button>

              <div className="relative z-10 flex-grow overflow-y-auto pr-1">
                <AnimatePresence mode="wait">
                  {!showQuiz ? (
                    /* Lesson Audio Player Panel */
                    <motion.div
                      key="player"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-6 py-2 text-center"
                    >
                      <div className="space-y-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-white/5 border border-white/5 text-[var(--accent)] tracking-widest">
                          {selectedCourse.name}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-4">
                          {selectedCourse.lessons && selectedCourse.lessons[currentLessonIndex] 
                            ? selectedCourse.lessons[currentLessonIndex].title 
                            : selectedCourse.name}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">
                          Track Category: {selectedCourse.category} · level: {selectedCourse.level}
                        </p>
                      </div>

                      {/* Waveform Pulse Visualizer */}
                      <div className="h-24 flex items-center justify-center gap-1 bg-black/10 border border-white/5 rounded-3xl p-4 relative overflow-hidden">
                        {[...Array(16)].map((_, idx) => (
                          <motion.div
                            key={idx}
                            animate={isPlaying ? {
                              height: [12, ((idx * 7) % 35) + 15, 12]
                            } : { height: 12 }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              delay: idx * 0.05,
                              ease: "easeInOut"
                            }}
                            className={`w-2 rounded-full ${
                              selectedCourse.category === "technical" 
                                ? "bg-indigo-500/60" 
                                : "bg-rose-500/60"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Lecture content overview */}
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-lg mx-auto text-left border-l-2 border-[var(--accent)] pl-4 max-h-32 overflow-y-auto pr-1">
                        {selectedCourse.lessons && selectedCourse.lessons[currentLessonIndex]
                          ? selectedCourse.lessons[currentLessonIndex].content
                          : (selectedCourse.description || "In this course lesson, we focus heavily on the sensory logic, industry standards, and accessible shortcuts crucial to mastering this vocational field.")}
                      </p>

                      {/* Dynamic Course Syllabus playlist */}
                      {selectedCourse.lessons && selectedCourse.lessons.length > 0 && (
                        <div className="space-y-3 text-left max-w-lg mx-auto bg-black/10 border border-white/5 rounded-3xl p-4">
                          <div className="flex items-center gap-2">
                            <BookOpen size={14} className="text-[var(--accent)]" />
                            <h4 className="text-xs font-black uppercase text-[var(--text-muted)] tracking-wider">Course Syllabus</h4>
                          </div>
                          <div className="space-y-2 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                            {selectedCourse.lessons.map((lesson, idx) => {
                              const isCurrent = idx === currentLessonIndex;
                              return (
                                <button
                                  key={idx}
                                  onClick={() => selectLesson(idx)}
                                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                                    isCurrent
                                      ? "bg-[var(--accent)]/15 border-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/5"
                                      : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-[var(--text-secondary)] hover:text-white"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className={`size-5 rounded-full flex items-center justify-center text-[10px] ${
                                      isCurrent ? "bg-[var(--accent)] text-white" : "bg-white/15 text-[var(--text-muted)]"
                                    }`}>
                                      {idx + 1}
                                    </span>
                                    <span>{lesson.title}</span>
                                  </div>
                                  {isCurrent ? <Volume2 size={14} className="text-[var(--accent)] animate-pulse" /> : <Play size={12} />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="space-y-2 max-w-lg mx-auto">
                        <div className="h-2 w-full rounded-full bg-white/10 relative overflow-hidden">
                          <div 
                            style={{ width: `${playProgress}%` }} 
                            className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent)] rounded-full transition-all duration-150"
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-black uppercase">
                          <span>
                            Lesson {currentLessonIndex + 1} of {selectedCourse.lessons?.length || 1}
                          </span>
                          <span>{playProgress}% Complete</span>
                        </div>
                      </div>

                      {/* Play Controls */}
                      <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
                        {/* Speed selector */}
                        <div className="flex items-center gap-1.5 border border-white/5 bg-white/5 rounded-full px-3 py-1.5">
                          <span className="text-[9px] text-[var(--text-muted)] font-black uppercase mr-1">Speed</span>
                          {[1.0, 1.25, 1.5].map((speed) => (
                            <button
                              key={speed}
                              onClick={() => {
                                setPlaybackSpeed(speed);
                                if (isPlaying) {
                                  announceSpeech(`Speech speed updated to ${speed} times.`);
                                }
                              }}
                              className={`text-[10px] font-black px-2 py-1 rounded-md transition-colors ${
                                playbackSpeed === speed 
                                  ? "bg-[var(--accent)] text-white" 
                                  : "text-[var(--text-secondary)] hover:text-white"
                              }`}
                            >
                              {speed}x
                            </button>
                          ))}
                        </div>

                        {/* Audio Controls Cluster */}
                        <div className="flex items-center gap-4">
                          <button
                            disabled={currentLessonIndex === 0}
                            onClick={() => selectLesson(currentLessonIndex - 1)}
                            className="p-3 rounded-full hover:bg-white/5 text-white disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                            title="Previous Lesson"
                          >
                            <SkipBack size={18} fill="currentColor" />
                          </button>

                          <button
                            onClick={isPlaying ? pauseAudio : resumeAudio}
                            className="size-16 rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent)] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
                          >
                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
                          </button>

                          <button
                            disabled={!selectedCourse.lessons || currentLessonIndex === selectedCourse.lessons.length - 1}
                            onClick={() => selectLesson(currentLessonIndex + 1)}
                            className="p-3 rounded-full hover:bg-white/5 text-white disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                            title="Next Lesson"
                          >
                            <SkipForward size={18} fill="currentColor" />
                          </button>
                        </div>

                        {/* Quiz Trigger button */}
                        <button
                          onClick={startQuiz}
                          className="h-12 px-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold text-xs hover:bg-cyan-500 hover:text-white transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/5"
                        >
                          <Award size={16} /> Take Course Quiz
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    /* Accessible Course Quiz Panel */
                    <motion.div
                      key="quiz"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-6 py-2"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                        <div className="flex items-center gap-2">
                          <HelpCircle className="text-[var(--accent)]" size={20} />
                          <h3 className="font-extrabold text-white text-base">Course Quiz Module</h3>
                        </div>
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-white/5 border border-white/5 text-[var(--text-muted)]">
                          Active: {selectedCourse.name}
                        </span>
                      </div>

                      {!(COURSE_QUIZZES[selectedCourse.name] && COURSE_QUIZZES[selectedCourse.name].length > 0) ? (
                        <div className="text-center py-10 space-y-4">
                          <AlertCircle className="size-12 text-[var(--text-muted)] mx-auto animate-bounce" />
                          <h4 className="font-extrabold text-white">Quiz catalog not loaded</h4>
                          <p className="text-xs text-[var(--text-secondary)]">Please test quizzes on technical courses like DSA Mastery or UI/UX Design.</p>
                          <button
                            onClick={() => setShowQuiz(false)}
                            className="h-10 px-6 rounded-full bg-white/5 border border-[var(--border)] text-white text-xs font-bold"
                          >
                            Return to Player
                          </button>
                        </div>
                      ) : !quizFinished ? (
                        /* Active Quiz Steps */
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-wider">
                              Question {currentQuizIndex + 1} of {COURSE_QUIZZES[selectedCourse.name].length}
                            </span>
                            <h4 className="text-lg md:text-xl font-bold leading-snug text-white">
                              {COURSE_QUIZZES[selectedCourse.name][currentQuizIndex].question}
                            </h4>
                          </div>

                          <div className="grid gap-3 pt-2">
                            {COURSE_QUIZZES[selectedCourse.name][currentQuizIndex].options.map((opt, oIdx) => {
                              const isSelected = selectedAnswer === oIdx;
                              const isAnsCorrect = oIdx === COURSE_QUIZZES[selectedCourse.name][currentQuizIndex].answer;

                              let cardStyle = "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20";
                              if (isSelected && !quizSubmitted) {
                                cardStyle = "bg-[var(--accent-subtle)] border-[var(--accent)]/40 text-white";
                              } else if (quizSubmitted) {
                                if (isAnsCorrect) {
                                  cardStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold";
                                } else if (isSelected) {
                                  cardStyle = "bg-rose-500/10 border-rose-500/30 text-rose-400";
                                } else {
                                  cardStyle = "opacity-30 bg-white/5 border-white/5";
                                }
                              }

                              return (
                                <button
                                  key={oIdx}
                                  onClick={() => handleSelectOption(oIdx)}
                                  disabled={quizSubmitted}
                                  className={`w-full p-4 rounded-xl text-left text-xs font-bold border transition-all flex items-center justify-between gap-3 ${cardStyle}`}
                                >
                                  <span>{oIdx + 1}. {opt}</span>
                                  {quizSubmitted && isAnsCorrect && <CheckCircle size={16} className="text-emerald-400 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>

                          {/* Submit / Proceed buttons */}
                          <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center">
                            <button
                              onClick={() => {
                                stopAudio();
                                setShowQuiz(false);
                              }}
                              className="text-xs font-bold text-[var(--text-secondary)] hover:text-white transition-colors"
                            >
                              Quit Quiz
                            </button>

                            {!quizSubmitted ? (
                              <button
                                onClick={handleSubmitAnswer}
                                disabled={selectedAnswer === null}
                                className="h-11 px-8 rounded-full bg-[var(--accent)] text-white font-bold text-xs disabled:opacity-40 transition-all shadow-lg active:scale-95"
                              >
                                Submit Answer
                              </button>
                            ) : (
                              <button
                                onClick={handleNextQuestion}
                                className="h-11 px-8 rounded-full bg-cyan-500 text-white font-bold text-xs transition-all shadow-lg active:scale-95 flex items-center gap-1.5"
                              >
                                {currentQuizIndex < COURSE_QUIZZES[selectedCourse.name].length - 1 ? "Next Question" : "Finish Quiz"}
                                <ArrowRight size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Quiz Finished / Score screen */
                        <div className="text-center py-6 space-y-6">
                          <div className="size-20 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center justify-center mx-auto">
                            <Trophy className="size-10 text-emerald-400 animate-bounce" />
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-extrabold text-white text-xl">Module Quiz Completed!</h4>
                            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                              Fantastic effort. You answered <span className="font-bold text-emerald-400">{quizScore} out of {COURSE_QUIZZES[selectedCourse.name].length}</span> questions correctly and completed the core assessment.
                            </p>
                          </div>

                          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 max-w-sm mx-auto flex items-center justify-between">
                            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Reward Unlocked:</span>
                            <span className="text-sm font-black text-white flex items-center gap-1">
                              <Zap className="size-4 text-yellow-400" />
                              +{quizScore * 100} XP Points
                            </span>
                          </div>

                          <div className="flex gap-4 justify-center pt-2">
                            <button
                              onClick={startQuiz}
                              className="h-11 px-6 rounded-full bg-white/5 border border-white/10 text-white font-bold text-xs flex items-center gap-1"
                            >
                              <RefreshCw size={14} /> Retake Quiz
                            </button>
                            <button
                              onClick={() => setShowQuiz(false)}
                              className="h-11 px-8 rounded-full bg-[var(--accent)] text-white font-bold text-xs"
                            >
                              Back to Player
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
