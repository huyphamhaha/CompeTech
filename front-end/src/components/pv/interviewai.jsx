import React, { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  Search,
  User,
  Bell,
  Menu,
  X,
  Star,
  Heart,
  Eye,
  MessageCircle,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Check,
  AlertCircle,
  Info,
  AlertTriangle,
  Upload,
  Download,
  Play,
  Pause,
  Settings,
  Home,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Filter,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Send,
  ArrowLeft,
  RotateCcw,
  Volume2,
  Trash2,
  Clock,
  Brain,
  Book,
} from "lucide-react";
import { Link } from "react-router-dom";
import { auth, db } from "../firebase.js";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { apiClient, createAuthData } from "../../utils/apiClient";
const InterviewApp = () => {
  // Get auth from context
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();

  // State management
  const [currentScreen, setCurrentScreen] = useState("info-screen");
  const [interviewMode, setInterviewMode] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Đang xử lý...");
  const [interviewSeconds, setInterviewSeconds] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const chatInputRef = useRef();
  const [voiceAnswer, setVoiceAnswer] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [progress, setProgress] = useState({
    criteria_index: 0,
    criteria_total: 1,
  });
  const [results, setResults] = useState(null);
  const [careers, setCareers] = useState([]);

  // Check authentication and pro status
  useEffect(() => {
    console.log("🔄 Interview: Checking authentication...", {
      user,
      authLoading,
    });

    if (authLoading) {
      console.log("⏳ Still loading authentication state...");
      return;
    }

    if (!user) {
      console.log("❌ User not authenticated, redirecting to login");
      navigate("/login");
      return;
    }

    // Không cần kiểm tra premium
    console.log("✅ User authenticated");
    // Load careers data
    fetchCareers();
  }, [user, authLoading, navigate]);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [userInfo, setUserInfo] = useState({
    name: "",
    age: "",
    job: "",
  });
  const nameRef = useRef();
  const ageRef = useRef();

  // Refs
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // API base URL
  const API_BASE_URL =
    import.meta.env.VITE_INTERVIEW_API_URL || "http://localhost:5005";
  // Get auth headers for API calls
  const getAuthHeaders = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      };
    } catch (error) {
      console.error("Error getting auth token:", error);
      return {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
    }
  };
  // Initialize speech recognition
  useEffect(() => {
    initSpeechRecognition();
    fetchCareers();
  }, []);

  // Timer effect
  useEffect(() => {
    if (currentScreen === "voice-interview-screen" && !timerRef.current) {
      startInterviewTimer();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentScreen]);

  const initSpeechRecognition = () => {
    if ("webkitSpeechRecognition" in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      const recognition = recognitionRef.current;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "vi-VN";

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setVoiceAnswer((prev) => prev + (prev ? " " : "") + finalTranscript);
        }
      };

      recognition.onend = () => {
        if (isRecording) {
          try {
            recognition.start();
          } catch (e) {
            console.error("Error restarting recognition:", e);
            setIsRecording(false);
          }
        } else {
          setIsRecording(false);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (
          event.error === "not-allowed" ||
          event.error === "service-not-allowed"
        ) {
          setIsRecording(false);
          alert(
            "Vui lòng cấp quyền truy cập microphone để sử dụng chức năng phỏng vấn bằng giọng nói."
          );
        }
      };
    }
  };

  const fetchCareers = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/careers`, { headers });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setCareers(data.map((career) => career.name));
      console.log("✅ Careers loaded:", data.length, "careers");
    } catch (error) {
      console.error("❌ Error fetching careers:", error);
      // Fallback careers when backend is not available
      const fallbackCareers = [];
      setCareers(fallbackCareers);
      console.log("⚠️ Using fallback careers due to backend connection issue");
    }
  };

  const startInterviewTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setInterviewSeconds(0);
    timerRef.current = setInterval(() => {
      setInterviewSeconds((prev) => prev + 1);
    }, 1000);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Thay đổi validateInfoAndContinue để lấy giá trị từ ref
  const validateInfoAndContinue = () => {
    const nameValue = nameRef.current.value;
    const ageValue = ageRef.current.value;
    if (!nameValue.trim()) {
      alert("Vui lòng nhập họ và tên");
      return;
    }
    if (!ageValue || ageValue < 18 || ageValue > 100) {
      alert("Vui lòng nhập tuổi hợp lệ (18-100)");
      return;
    }
    if (!userInfo.job) {
      alert("Vui lòng chọn nghề nghiệp");
      return;
    }
    setName(nameValue);
    setAge(ageValue);
    setUserInfo((prev) => ({ ...prev, name: nameValue, age: ageValue }));
    setCurrentScreen("mode-screen");
  };

  const startInterview = async () => {
    if (!interviewMode) {
      alert("Vui lòng chọn phương thức phỏng vấn");
      return;
    }

    try {
      setIsLoading(true);
      setLoadingMessage("Đang bắt đầu phỏng vấn...");

      const response = await fetch(`${API_BASE_URL}/api/start-interview`, {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          name: name,
          age: parseInt(age), // Đảm bảo age là số
          job: userInfo.job,
          mode: interviewMode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setIsLoading(false);

      setSessionId(data.session_id);
      setCurrentQuestion(data.question);
      setProgress(data.progress);

      if (interviewMode === "text") {
        setChatMessages([
          {
            text: "Xin chào! Tôi là trợ lý phỏng vấn ảo. Tôi sẽ đặt những câu hỏi để đánh giá kỹ năng và kinh nghiệm của bạn. Hãy trả lời một cách đầy đủ và chân thực nhé.",
            sender: "interviewer",
            time: new Date().toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
          {
            text: data.question,
            sender: "interviewer",
            time: new Date().toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
        setCurrentScreen("chat-interview-screen");
      } else {
        setVoiceAnswer("");
        speakQuestion(data.question);
        setCurrentScreen("voice-interview-screen");
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error starting interview:", error);
      alert(`Không thể bắt đầu phỏng vấn: ${error.message}`);
    }
  };

  const speakQuestion = (text) => {
    if ("speechSynthesis" in window) {
      if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
        setIsRecording(false);
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "vi-VN";
      utterance.volume = 1.0;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const vietnameseVoice = voices.find((voice) => voice.lang === "vi-VN");
      if (vietnameseVoice) {
        utterance.voice = vietnameseVoice;
      }

      utterance.onend = () => {
        if (recognitionRef.current && !isMicMuted) {
          try {
            recognitionRef.current.start();
            setIsRecording(true);
          } catch (e) {
            console.error("Error starting recognition after speaking:", e);
          }
        }
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleMicrophone = () => {
    if (recognitionRef.current) {
      if (isRecording) {
        setIsRecording(false);
        recognitionRef.current.stop();
        setIsMicMuted(true);
      } else {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
          setIsMicMuted(false);
        } catch (e) {
          console.error("Error starting recognition:", e);
          alert("Không thể bắt đầu nhận dạng giọng nói. Vui lòng thử lại.");
        }
      }
    }
  };

  const sendChatMessage = () => {
    const inputValue = chatInputRef.current.value;
    if (!inputValue.trim()) return;

    const newMessage = {
      text: inputValue,
      sender: "user",
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChatMessages((prev) => [...prev, newMessage]);
    chatInputRef.current.value = "";
    submitAnswer(inputValue, "text");
  };

  const submitVoiceAnswer = () => {
    if (!voiceAnswer.trim()) {
      alert("Vui lòng trả lời câu hỏi trước khi tiếp tục.");
      return;
    }

    if (recognitionRef.current && isRecording) {
      setIsRecording(false);
      recognitionRef.current.stop();
    }

    submitAnswer(voiceAnswer, "voice");
  };

  const submitAnswer = async (answer, mode) => {
    if (!sessionId) {
      alert("Phiên phỏng vấn không hợp lệ. Vui lòng bắt đầu lại.");
      return;
    }

    try {
      setIsLoading(true);
      setLoadingMessage("Đang đánh giá câu trả lời...");

      const response = await fetch(`${API_BASE_URL}/api/submit-answer`, {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          session_id: sessionId,
          answer: answer,
          mode: mode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setIsLoading(false);

      if (data.complete) {
        if (mode === "text") {
          setChatMessages((prev) => [
            ...prev,
            {
              text: "Cảm ơn bạn! Buổi phỏng vấn đã kết thúc. Hệ thống sẽ tổng hợp kết quả.",
              sender: "interviewer",
              time: new Date().toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
        } else {
          setCurrentQuestion("Phỏng vấn đã kết thúc! Cảm ơn bạn đã tham gia.");
        }
        setTimeout(() => finishInterview(), 2000);
        return;
      }

      setCurrentQuestion(data.question);
      setProgress(data.progress);

      if (mode === "text") {
        setChatMessages((prev) => [
          ...prev,
          {
            text: data.question,
            sender: "interviewer",
            time: new Date().toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      } else {
        setVoiceAnswer("");
        speakQuestion(data.question);
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error submitting answer:", error);
      alert(`Không thể gửi câu trả lời: ${error.message}`);
    }
  };

  const finishInterview = async () => {
    if (!sessionId) {
      alert("Phiên phỏng vấn không hợp lệ. Vui lòng bắt đầu lại.");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      setIsLoading(true);
      setLoadingMessage("Đang hoàn thành phỏng vấn và tạo báo cáo...");

      const response = await fetch(`${API_BASE_URL}/api/finish-interview`, {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setIsLoading(false);

      setResults(data);
      setCurrentScreen("result-screen");
    } catch (error) {
      setIsLoading(false);
      console.error("Error finishing interview:", error);
      alert(`Không thể hoàn thành phỏng vấn: ${error.message}`);
    }
  };

  const restartInterview = () => {
    setSessionId(null);
    setInterviewMode(null);
    setCurrentQuestion("");
    setVoiceAnswer("");
    setChatMessages([]);
    // XÓA dòng này: setChatInput(""); // <-- State này không tồn tại
    setProgress({ criteria_index: 0, criteria_total: 1 });
    setResults(null);
    setInterviewSeconds(0);
    setName("");
    setAge("");

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    setCurrentScreen("info-screen");
  };

  const downloadResults = () => {
    if (!results) return;

    let resultText = `PHIẾU ĐÁNH GIÁ PHỎNG VẤN\n`;
    resultText += `==============================================\n\n`;
    resultText += `Thông tin ứng viên:\n`;
    resultText += `- Họ và tên: ${name}\n`;
    resultText += `- Tuổi: ${age}\n`;
    resultText += `- Vị trí ứng tuyển: ${userInfo.job}\n`;
    resultText += `- Phương thức phỏng vấn: ${
      interviewMode === "text" ? "Chat" : "Giọng nói"
    }\n\n`;
    resultText += `Kết quả đánh giá:\n`;
    resultText += `- Tổng điểm: ${results.total_score}/${results.max_score}\n\n`;

    if (results.detailed_results) {
      resultText += `Chi tiết đánh giá theo tiêu chí:\n`;
      results.detailed_results.forEach((result) => {
        resultText += `- ${result.criteria_name}: ${result.score}/4\n`;
        if (result.reasoning) {
          resultText += `  Nhận xét: ${result.reasoning}\n\n`;
        }
      });
    }

    resultText += `\nĐÁNH GIÁ TỔNG QUAN:\n${results.evaluation}\n\n`;
    resultText += `==============================================\n`;
    resultText += `Ngày đánh giá: ${new Date().toLocaleDateString("vi-VN")}\n`;

    const blob = new Blob([resultText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `phong-van-${name.replace(/\s+/g, "-")}-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Theme helpers (CompeTech)
  const THEME = {
    bgPage: "#FFEFF2",
    brandDark: "#064232",
    brandMid: "#568F87",
    brandSoft: "#F5BABB",
  };
  const gradient = (from = THEME.brandDark, to = THEME.brandMid) =>
    `linear-gradient(90deg,${from},${to})`;

  // Progress Steps Component
  const ProgressSteps = ({ currentStep }) => {
    const steps = [
      "Thông tin cá nhân",
      "Chọn phương thức",
      "Phỏng vấn",
      "Kết quả",
    ];

    const getProgressPercentage = () => {
      return ((currentStep - 1) / (steps.length - 1)) * 100;
    };

    return (
      <div className="px-4 mb-6">
        <div className="max-w-6xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div
              className="w-full rounded-full h-3 mb-4"
              style={{ background: "rgba(245, 186, 187, 0.3)" }}
            >
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${getProgressPercentage()}%`,
                  background: gradient(),
                }}
              />
            </div>

            {/* Progress Steps */}
            <div className="flex justify-between mb-8">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-all duration-200 ${
                      index < currentStep || index === currentStep - 1
                        ? "text-white"
                        : ""
                    }`}
                    style={
                      index < currentStep || index === currentStep - 1
                        ? { background: gradient() }
                        : {
                            background: "rgba(245, 186, 187, 0.3)",
                            color: THEME.brandDark,
                          }
                    }
                  >
                    {index < currentStep - 1 ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: THEME.brandDark }}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Screen components
  const InfoScreen = () => (
    <div className="min-h-screen" style={{ background: THEME.bgPage }}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4 pt-8">
          {/* Logo */}
          <Link to="/">
            <div className="flex items-center w-48">
              <img src={"./Logo_CC_tron.svg"} alt="Logo" className="h-20" />
            </div>
          </Link>
        </div>
        <h2
          className="text-2xl font-bold mb-2 flex items-center justify-center gap-2"
          style={{ color: THEME.brandDark }}
        >
          Phỏng vấn đánh giá năng lực
        </h2>
        <p
          className="text-lg flex items-center justify-center gap-2"
          style={{ color: THEME.brandDark }}
        >
          <BookOpen className="w-5 h-5" />
          Hoàn thành phỏng để nhận những cải thiện và đánh giá năng lực của thí
          sinh
        </p>
      </div>
      <ProgressSteps currentStep={1} />
      <div className="flex items-center justify-center p-4 max-w-6xl mx-auto">
        <div
          className="rounded-lg shadow-md p-8 border w-full"
          style={{ background: "#FFFFFF", borderColor: THEME.brandMid }}
        >
          <div className="space-y-6">
            <h3
              className="text-2xl font-bold mb-6 flex items-center gap-2"
              style={{ color: THEME.brandDark }}
            >
              <User className="w-6 h-6" />
              Thông tin cá nhân
            </h3>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: THEME.brandDark }}
              >
                Nghề nghiệp *
              </label>
              <div className="relative">
                <BookOpen
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                  style={{ color: THEME.brandDark }}
                />
                <select
                  value={userInfo.job}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, job: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 transition-all duration-200 appearance-none"
                  style={{
                    borderColor: THEME.brandMid,
                    background: "#FFFFFF",
                    color: THEME.brandDark,
                  }}
                >
                  <option value="">Chọn nghề nghiệp</option>
                  {careers.map((career, index) => (
                    <option key={index} value={career}>
                      {career}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: THEME.brandDark }}
                />
              </div>
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: THEME.brandDark }}
              >
                Họ và tên *
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                  style={{ color: THEME.brandDark }}
                />
                <input
                  type="text"
                  ref={nameRef}
                  placeholder="Nhập họ và tên của bạn"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 transition-all duration-200"
                  style={{
                    borderColor: THEME.brandMid,
                    background: "#FFFFFF",
                    color: THEME.brandDark,
                  }}
                />
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: THEME.brandDark }}
              >
                Tuổi *
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                  style={{ color: THEME.brandDark }}
                />
                <input
                  type="number"
                  ref={ageRef}
                  placeholder="Nhập tuổi của bạn"
                  min="18"
                  max="100"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 transition-all duration-200"
                  style={{
                    borderColor: THEME.brandMid,
                    background: "#FFFFFF",
                    color: THEME.brandDark,
                  }}
                />
              </div>
            </div>

            <button
              onClick={validateInfoAndContinue}
              className="w-full px-6 py-3 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              style={{ background: gradient() }}
            >
              Khám phá ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ModeScreen = () => (
    <div className="min-h-screen" style={{ background: THEME.bgPage }}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4 pt-8">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md"
            style={{ background: gradient() }}
          >
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold" style={{ color: THEME.brandDark }}>
            Questic
          </h1>
        </div>
        <h2
          className="text-2xl font-bold mb-2 flex items-center justify-center gap-2"
          style={{ color: THEME.brandDark }}
        >
          Tư vấn Tuyển sinh Đại học
        </h2>
        <p
          className="text-lg flex items-center justify-center gap-2"
          style={{ color: THEME.brandDark }}
        >
          <BookOpen className="w-5 h-5" />
          Hoàn thành thông tin để nhận gợi ý trường và ngành phù hợp
        </p>
      </div>
      <ProgressSteps currentStep={2} />
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: THEME.brandDark }}
          >
            Xin chào, {name}!
          </h1>
          <p className="font-medium text-lg" style={{ color: THEME.brandDark }}>
            Chọn phương thức phỏng vấn phù hợp với bạn
          </p>
        </div>

        <div className="flex justify-center gap-8 mb-8">
          <div
            onClick={() => setInterviewMode("text")}
            className={`w-80 rounded-lg shadow-md overflow-hidden transition-all duration-300 cursor-pointer transform hover:-translate-y-2 hover:shadow-xl ${
              interviewMode === "text" ? "ring-4 transform -translate-y-1" : ""
            }`}
            style={{ background: "#FFFFFF" }}
          >
            <div
              className="h-36 flex items-center justify-center"
              style={{ background: gradient() }}
            >
              <MessageCircle className="w-16 h-16 text-white" />
            </div>
            <div className="p-6 text-center">
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: THEME.brandDark }}
              >
                Phỏng vấn Chat
              </h3>
              <p
                className="mb-4 font-medium"
                style={{ color: THEME.brandDark }}
              >
                Trò chuyện qua tin nhắn văn bản với AI
              </p>
              <div
                className="text-sm space-y-1"
                style={{ color: THEME.brandDark }}
              >
                <div>✓ Dễ sử dụng</div>
                <div>✓ Có thời gian suy nghĩ</div>
                <div>✓ Không cần microphone</div>
              </div>
            </div>
          </div>

          <div
            onClick={() => setInterviewMode("voice")}
            className={`w-80 rounded-lg shadow-md overflow-hidden transition-all duration-300 cursor-pointer transform hover:-translate-y-2 hover:shadow-xl ${
              interviewMode === "voice" ? "ring-4 transform -translate-y-1" : ""
            }`}
            style={{ background: "#FFFFFF" }}
          >
            <div
              className="h-36 flex items-center justify-center"
              style={{ background: gradient() }}
            >
              <Mic className="w-16 h-16 text-white" />
            </div>
            <div className="p-6 text-center">
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: THEME.brandDark }}
              >
                Phỏng vấn Giọng nói
              </h3>
              <p
                className="mb-4 font-medium"
                style={{ color: THEME.brandDark }}
              >
                Nói chuyện trực tiếp với AI bằng giọng nói
              </p>
              <div
                className="text-sm space-y-1"
                style={{ color: THEME.brandDark }}
              >
                <div>✓ Tự nhiên như thật</div>
                <div>✓ Đọc câu hỏi tự động</div>
                <div>✓ Nhận dạng giọng nói</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => setCurrentScreen("info-screen")}
            className="px-6 py-3 bg-white font-medium rounded-lg border transition-all duration-200"
            style={{ color: THEME.brandDark, borderColor: THEME.brandDark }}
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Quay lại
          </button>
          <button
            onClick={startInterview}
            disabled={!interviewMode}
            className="px-6 py-3 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            style={{ background: gradient() }}
          >
            Trải nghiệm ngay
          </button>
        </div>
      </div>
    </div>
  );

  const ChatInterviewScreen = () => (
    <div className="min-h-screen" style={{ background: THEME.bgPage }}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4 pt-8">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md"
            style={{ background: gradient() }}
          >
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold" style={{ color: THEME.brandDark }}>
            Questic
          </h1>
        </div>
        <h2
          className="text-2xl font-bold mb-2 flex items-center justify-center gap-2"
          style={{ color: THEME.brandDark }}
        >
          Tư vấn Tuyển sinh Đại học
        </h2>
        <p
          className="text-lg flex items-center justify-center gap-2"
          style={{ color: THEME.brandDark }}
        >
          <BookOpen className="w-5 h-5" />
          Hoàn thành thông tin để nhận gợi ý trường và ngành phù hợp
        </p>
      </div>
      <ProgressSteps currentStep={3} />
      <div className="max-w-6xl mx-auto p-4">
        <div
          className="rounded-lg shadow-md p-6 mb-6"
          style={{ background: "#FFFFFF" }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h2
                className="text-2xl font-bold"
                style={{ color: THEME.brandDark }}
              >
                Phỏng vấn Chat
              </h2>
              <p className="font-medium" style={{ color: THEME.brandDark }}>
                Ứng viên: {name} ({age} tuổi) - {userInfo.job}
              </p>
            </div>
            <div
              className="text-sm font-medium"
              style={{ color: THEME.brandDark }}
            >
              Tiến độ: {progress.criteria_index + 1}/{progress.criteria_total}
            </div>
          </div>

          <div className="mt-4">
            <div
              className="w-full rounded-full h-3"
              style={{ background: "rgba(245, 186, 187, 0.3)" }}
            >
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    ((progress.criteria_index + 1) / progress.criteria_total) *
                    100
                  }%`,
                  background: gradient(),
                }}
              ></div>
            </div>
          </div>
        </div>

        <div
          className="rounded-lg shadow-md p-6"
          style={{ background: "#FFFFFF" }}
        >
          <div
            className="h-96 overflow-y-auto rounded-lg p-4 mb-4"
            style={{
              background: "rgba(245, 186, 187, 0.1)",
              border: `1px solid ${THEME.brandMid}`,
            }}
          >
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 flex flex-col ${
                  message.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                    message.sender === "user"
                      ? "text-white rounded-br-sm"
                      : "rounded-bl-sm"
                  }`}
                  style={
                    message.sender === "user"
                      ? { background: gradient() }
                      : {
                          background: "#FFFFFF",
                          color: THEME.brandDark,
                          border: `1px solid ${THEME.brandMid}`,
                        }
                  }
                >
                  {message.text}
                </div>
                <div
                  className="text-xs mt-1 font-medium"
                  style={{ color: THEME.brandDark }}
                >
                  {message.time}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              ref={chatInputRef}
              onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
              placeholder="Nhập câu trả lời của bạn..."
              className="flex-1 px-4 py-3 border rounded-full focus:ring-2"
              style={{
                borderColor: THEME.brandMid,
                background: "#FFFFFF",
                color: THEME.brandDark,
              }}
            />
            <button
              onClick={sendChatMessage}
              className="px-6 py-3 text-white rounded-full transition-all duration-200 shadow-md flex items-center gap-2"
              style={{ background: gradient() }}
            >
              <Send className="w-4 h-4" />
              Gửi
            </button>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentScreen("mode-screen")}
              className="px-6 py-3 bg-white font-medium rounded-lg border transition-colors flex items-center gap-2"
              style={{ color: THEME.brandDark, borderColor: THEME.brandDark }}
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </button>
            <button
              onClick={finishInterview}
              className="px-6 py-3 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              style={{ background: "#d14b4b" }}
            >
              <X className="w-4 h-4" />
              Kết thúc phỏng vấn
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const VoiceInterviewScreen = () => (
    <div className="min-h-screen" style={{ background: THEME.bgPage }}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4 pt-8">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md"
            style={{ background: gradient() }}
          >
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold" style={{ color: THEME.brandDark }}>
            Questic
          </h1>
        </div>
        <h2
          className="text-2xl font-bold mb-2 flex items-center justify-center gap-2"
          style={{ color: THEME.brandDark }}
        >
          Tư vấn Tuyển sinh Đại học
        </h2>
        <p
          className="text-lg flex items-center justify-center gap-2"
          style={{ color: THEME.brandDark }}
        >
          <BookOpen className="w-5 h-5" />
          Hoàn thành thông tin để nhận gợi ý trường và ngành phù hợp
        </p>
      </div>
      <ProgressSteps currentStep={3} />
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2
                className="text-2xl font-bold"
                style={{ color: THEME.brandDark }}
              >
                Phỏng vấn Giọng nói
              </h2>
              <p className="font-medium" style={{ color: THEME.brandDark }}>
                Ứng viên: {name} ({age} tuổi) - {userInfo.job}
              </p>
            </div>
            <div
              className="text-lg font-semibold"
              style={{ color: THEME.brandDark }}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Thời gian: {formatTime(interviewSeconds)}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div
              className="flex justify-between text-sm mb-2 font-medium"
              style={{ color: THEME.brandDark }}
            >
              <span>Tiến độ phỏng vấn</span>
              <span>
                {progress.criteria_index + 1}/{progress.criteria_total}
              </span>
            </div>
            <div
              className="w-full rounded-full h-3"
              style={{ background: "rgba(245, 186, 187, 0.3)" }}
            >
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    ((progress.criteria_index + 1) / progress.criteria_total) *
                    100
                  }%`,
                  background: gradient(),
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <h3
                  className="text-lg font-semibold mb-3 flex items-center gap-2"
                  style={{ color: THEME.brandDark }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Câu hỏi hiện tại:
                </h3>
                <div
                  className="p-4 rounded-lg"
                  style={{
                    background: "rgba(245, 186, 187, 0.1)",
                    borderLeft: `4px solid ${THEME.brandMid}`,
                  }}
                >
                  <p
                    className="font-medium leading-relaxed"
                    style={{ color: THEME.brandDark }}
                  >
                    {currentQuestion}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4
                    className="text-md font-semibold flex items-center gap-2"
                    style={{ color: THEME.brandDark }}
                  >
                    <Mic className="w-4 h-4" />
                    Câu trả lời của bạn:
                  </h4>
                  <div
                    className={`text-sm px-3 py-1 rounded-full font-medium ${
                      isRecording
                        ? "bg-red-100 text-red-700 border border-red-300"
                        : "bg-gray-100 text-gray-600 border border-gray-300"
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-full inline-block mr-2 animate-pulse"></div>
                        Đang ghi âm...
                      </>
                    ) : (
                      "Chưa bắt đầu ghi âm"
                    )}
                  </div>
                </div>

                <div
                  className="border rounded-lg overflow-hidden"
                  style={{
                    borderColor: THEME.brandMid,
                    background: "rgba(245, 186, 187, 0.1)",
                  }}
                >
                  <textarea
                    value={voiceAnswer}
                    onChange={(e) => setVoiceAnswer(e.target.value)}
                    placeholder="Bắt đầu nói hoặc gõ câu trả lời của bạn vào đây..."
                    className="w-full h-32 p-4 resize-none focus:outline-none focus:ring-2 bg-transparent"
                    style={{ color: THEME.brandDark }}
                  />
                </div>
              </div>

              <div className="flex justify-center gap-4 mb-6">
                <button
                  onClick={toggleMicrophone}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-md ${
                    isRecording
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "text-white"
                  }`}
                  style={!isRecording ? { background: gradient() } : {}}
                >
                  {isRecording ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                  {isRecording ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
                </button>

                <button
                  onClick={() => speakQuestion(currentQuestion)}
                  className="px-6 py-3 text-white rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md"
                  style={{ background: gradient() }}
                >
                  <Volume2 className="w-4 h-4" />
                  Đọc lại câu hỏi
                </button>

                <button
                  onClick={() => setVoiceAnswer("")}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-md"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa câu trả lời
                </button>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={submitVoiceAnswer}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Gửi câu trả lời
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div
              className="rounded-lg p-6 h-full"
              style={{
                background: "rgba(245, 186, 187, 0.1)",
                border: `1px solid ${THEME.brandMid}`,
              }}
            >
              <div className="text-center mb-6">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
                  style={{ background: gradient() }}
                >
                  <User className="w-12 h-12 text-white" />
                </div>
                <p
                  className="text-sm font-medium"
                  style={{ color: THEME.brandDark }}
                >
                  Trợ lý phỏng vấn AI
                </p>
              </div>

              <div
                className="rounded-lg p-4"
                style={{
                  background: "#FFFFFF",
                  border: `1px solid ${THEME.brandMid}`,
                }}
              >
                <h4
                  className="font-semibold mb-3 flex items-center gap-2"
                  style={{ color: THEME.brandDark }}
                >
                  <Award className="w-4 h-4" />
                  Mẹo phỏng vấn
                </h4>
                <ul
                  className="text-sm space-y-2"
                  style={{ color: THEME.brandDark }}
                >
                  <li className="flex items-start gap-2">
                    <span
                      className="font-bold"
                      style={{ color: THEME.brandDark }}
                    >
                      •
                    </span>
                    Nói chậm và rõ ràng
                  </li>
                  <li className="flex items-start gap-2">
                    <span
                      className="font-bold"
                      style={{ color: THEME.brandDark }}
                    >
                      •
                    </span>
                    Trả lời đầy đủ câu hỏi
                  </li>
                  <li className="flex items-start gap-2">
                    <span
                      className="font-bold"
                      style={{ color: THEME.brandDark }}
                    >
                      •
                    </span>
                    Đưa ra ví dụ cụ thể
                  </li>
                  <li className="flex items-start gap-2">
                    <span
                      className="font-bold"
                      style={{ color: THEME.brandDark }}
                    >
                      •
                    </span>
                    Thể hiện sự tự tin
                  </li>
                  <li className="flex items-start gap-2">
                    <span
                      className="font-bold"
                      style={{ color: THEME.brandDark }}
                    >
                      •
                    </span>
                    Có thể chỉnh sửa bằng tay
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentScreen("mode-screen")}
              className="px-6 py-3 bg-white font-medium rounded-lg border transition-colors flex items-center gap-2"
              style={{ color: THEME.brandDark, borderColor: THEME.brandDark }}
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </button>
            <button
              onClick={finishInterview}
              className="px-6 py-3 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              style={{ background: "#d14b4b" }}
            >
              <X className="w-4 h-4" />
              Kết thúc phỏng vấn
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ResultScreen = () => {
    const [expandedReasoning, setExpandedReasoning] = useState({});

    const toggleReasoning = (index) => {
      setExpandedReasoning((prev) => ({
        ...prev,
        [index]: !prev[index],
      }));
    };

    return (
      <div className="min-h-screen" style={{ background: THEME.bgPage }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4 pt-8">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md"
              style={{ background: gradient() }}
            >
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1
              className="text-4xl font-bold"
              style={{ color: THEME.brandDark }}
            >
              Questic
            </h1>
          </div>
          <h2
            className="text-2xl font-bold mb-2 flex items-center justify-center gap-2"
            style={{ color: THEME.brandDark }}
          >
            Tư vấn Tuyển sinh Đại học
          </h2>
          <p
            className="text-lg flex items-center justify-center gap-2"
            style={{ color: THEME.brandDark }}
          >
            <BookOpen className="w-5 h-5" />
            Hoàn thành thông tin để nhận gợi ý trường và ngành phù hợp
          </p>
        </div>
        <ProgressSteps currentStep={4} />
        <div className="max-w-6xl mx-auto p-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg"
                style={{ background: gradient() }}
              >
                <Check className="w-8 h-8 text-white" />
              </div>
              <h1
                className="text-4xl font-bold mb-2"
                style={{ color: THEME.brandDark }}
              >
                Kết quả phỏng vấn
              </h1>
              <p className="font-medium" style={{ color: THEME.brandDark }}>
                Phân tích chi tiết và đánh giá tổng quan
              </p>
            </div>

            {results && (
              <>
                <div
                  className="rounded-lg p-6 mb-8"
                  style={{
                    background: "rgba(245, 186, 187, 0.1)",
                    border: `1px solid ${THEME.brandMid}`,
                  }}
                >
                  <h2
                    className="text-2xl font-bold mb-4 flex items-center gap-2"
                    style={{ color: THEME.brandDark }}
                  >
                    <User
                      className="w-6 h-6"
                      style={{ color: THEME.brandMid }}
                    />
                    Thông tin ứng viên
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div
                      className="bg-white rounded-lg p-3"
                      style={{ border: `1px solid ${THEME.brandMid}` }}
                    >
                      <p
                        className="text-sm font-medium"
                        style={{ color: THEME.brandDark }}
                      >
                        Họ và tên
                      </p>
                      <p
                        className="font-semibold"
                        style={{ color: THEME.brandDark }}
                      >
                        {name}
                      </p>
                    </div>
                    <div
                      className="bg-white rounded-lg p-3"
                      style={{ border: `1px solid ${THEME.brandMid}` }}
                    >
                      <p
                        className="text-sm font-medium"
                        style={{ color: THEME.brandDark }}
                      >
                        Tuổi
                      </p>
                      <p
                        className="font-semibold"
                        style={{ color: THEME.brandDark }}
                      >
                        {age}
                      </p>
                    </div>
                    <div
                      className="bg-white rounded-lg p-3"
                      style={{ border: `1px solid ${THEME.brandMid}` }}
                    >
                      <p
                        className="text-sm font-medium"
                        style={{ color: THEME.brandDark }}
                      >
                        Vị trí
                      </p>
                      <p
                        className="font-semibold"
                        style={{ color: THEME.brandDark }}
                      >
                        {userInfo.job}
                      </p>
                    </div>
                    <div
                      className="bg-white rounded-lg p-3"
                      style={{ border: `1px solid ${THEME.brandMid}` }}
                    >
                      <p
                        className="text-sm font-medium"
                        style={{ color: THEME.brandDark }}
                      >
                        Phương thức
                      </p>
                      <p
                        className="font-semibold"
                        style={{ color: THEME.brandDark }}
                      >
                        {interviewMode === "text" ? "Chat" : "Giọng nói"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h2
                    className="text-2xl font-bold mb-4 flex items-center gap-2"
                    style={{ color: THEME.brandDark }}
                  >
                    <TrendingUp
                      className="w-6 h-6"
                      style={{ color: THEME.brandMid }}
                    />
                    Điểm tổng kết
                  </h2>
                  <div
                    className="rounded-lg p-6"
                    style={{
                      background: "rgba(245, 186, 187, 0.1)",
                      border: `1px solid ${THEME.brandMid}`,
                    }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span
                        className="text-lg font-semibold"
                        style={{ color: THEME.brandDark }}
                      >
                        Tổng điểm
                      </span>
                      <span
                        className="text-3xl font-bold"
                        style={{ color: THEME.brandDark }}
                      >
                        {results.total_score}/{results.max_score}
                      </span>
                    </div>
                    <div
                      className="w-full rounded-full h-4"
                      style={{ background: "rgba(245, 186, 187, 0.3)" }}
                    >
                      <div
                        className="h-4 rounded-full transition-all duration-1000 shadow-sm"
                        style={{
                          width: `${results.score_percentage}%`,
                          background: gradient(),
                        }}
                      ></div>
                    </div>
                    <p
                      className="text-sm mt-3 font-medium"
                      style={{ color: THEME.brandDark }}
                    >
                      Tỷ lệ: {results.score_percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {results.detailed_results && (
                  <div className="mb-8">
                    <h2
                      className="text-2xl font-bold mb-4 flex items-center gap-2"
                      style={{ color: THEME.brandDark }}
                    >
                      <Award
                        className="w-6 h-6"
                        style={{ color: THEME.brandMid }}
                      />
                      Chi tiết theo tiêu chí
                    </h2>
                    <div className="space-y-4">
                      {results.detailed_results.map((result, index) => {
                        const scorePercentage = (result.score / 4) * 100;
                        return (
                          <div
                            key={index}
                            className="bg-white rounded-lg p-6 hover:shadow-md transition-shadow"
                            style={{ border: `1px solid ${THEME.brandMid}` }}
                          >
                            <div className="mb-3">
                              <div className="flex justify-between items-center mb-3">
                                <h3
                                  className="font-semibold text-lg"
                                  style={{ color: THEME.brandDark }}
                                >
                                  {result.criteria_name}
                                </h3>
                                <span
                                  className="text-xl font-bold"
                                  style={{
                                    color: THEME.brandDark,
                                    background: "#fffbfc",
                                    border: `1px solid ${THEME.brandSoft}`,
                                    borderRadius: 9999,
                                    padding: "4px 12px",
                                  }}
                                >
                                  {result.score}/4
                                </span>
                              </div>
                              <div
                                className="w-full rounded-full h-3"
                                style={{
                                  background: "rgba(245, 186, 187, 0.3)",
                                }}
                              >
                                <div
                                  className="h-3 rounded-full transition-all duration-1000 shadow-sm"
                                  style={{
                                    width: `${scorePercentage}%`,
                                    background: gradient(),
                                  }}
                                ></div>
                              </div>
                            </div>

                            {result.reasoning && (
                              <div>
                                <button
                                  onClick={() => toggleReasoning(index)}
                                  className="font-medium text-sm flex items-center gap-2 transition-colors"
                                  style={{
                                    color: THEME.brandDark,
                                    background: "rgba(245, 186, 187, 0.1)",
                                    borderRadius: 8,
                                    padding: "8px 12px",
                                  }}
                                >
                                  <ChevronDown
                                    className={`w-4 h-4 transition-transform ${
                                      expandedReasoning[index]
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                  />
                                  {expandedReasoning[index]
                                    ? "Ẩn đánh giá"
                                    : "Xem đánh giá"}
                                </button>
                                {expandedReasoning[index] && (
                                  <div
                                    className="mt-3 p-4 rounded-lg"
                                    style={{
                                      background: "#FFFFFF",
                                      border: `1px solid ${THEME.brandMid}`,
                                    }}
                                  >
                                    <p
                                      className="leading-relaxed"
                                      style={{ color: THEME.brandDark }}
                                    >
                                      {result.reasoning}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <h2
                    className="text-2xl font-bold mb-4 flex items-center gap-2"
                    style={{ color: THEME.brandDark }}
                  >
                    <MessageCircle
                      className="w-6 h-6"
                      style={{ color: THEME.brandMid }}
                    />
                    Đánh giá tổng quan
                  </h2>
                  <div
                    className="rounded-lg p-6"
                    style={{
                      background: "#fffbfc",
                      borderLeft: `4px solid ${THEME.brandSoft}`,
                      border: `1px solid ${THEME.brandSoft}`,
                    }}
                  >
                    <p
                      className="leading-relaxed whitespace-pre-wrap font-medium"
                      style={{ color: THEME.brandDark }}
                    >
                      {results.evaluation}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={downloadResults}
                    className="px-6 py-3 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                    style={{ background: gradient() }}
                  >
                    <Download className="w-4 h-4" />
                    Tải báo cáo
                  </button>
                  <button
                    onClick={restartInterview}
                    className="px-6 py-3 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                    style={{ background: gradient() }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Phỏng vấn mới
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const LoadingOverlay = () => (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="rounded-lg p-8 text-center shadow-xl"
        style={{ background: "#FFFFFF" }}
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-4 mx-auto mb-4"
          style={{ borderColor: THEME.brandMid, borderTopColor: "transparent" }}
        ></div>
        <p className="text-lg font-medium" style={{ color: THEME.brandDark }}>
          {loadingMessage}
        </p>
      </div>
    </div>
  );

  // Main render
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-blue-700 font-medium">
            Đang kiểm tra quyền truy cập...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: THEME.bgPage }}>
      {/* Back button - góc trái trên */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 flex items-center space-x-2 px-3 py-2 rounded-lg shadow-md transition-all duration-200 border"
        style={{
          background: "#FFFFFF",
          color: THEME.brandDark,
          borderColor: THEME.brandMid,
        }}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Quay lại</span>
      </button>

      {currentScreen === "info-screen" && <InfoScreen />}
      {currentScreen === "mode-screen" && <ModeScreen />}
      {currentScreen === "chat-interview-screen" && <ChatInterviewScreen />}
      {currentScreen === "voice-interview-screen" && <VoiceInterviewScreen />}
      {currentScreen === "result-screen" && <ResultScreen />}
      {isLoading && <LoadingOverlay />}
    </div>
  );
};

export default InterviewApp;
