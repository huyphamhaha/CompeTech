import React, { useEffect, useRef } from "react";
import Header from "../Header/header.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { apiClient, createAuthData } from "../../utils/apiClient.js";
import {
  Bot,
  MessageSquare,
  Send,
  Sparkles,
  Target,
  FileText,
  GraduationCap,
  TrendingUp,
} from "lucide-react";

const quickQuestions = [
  {
    text: "Lựa chọn nghề nghiệp",
    question: "Tôi nên chọn ngành nghề gì phù hợp với bản thân?",
    icon: Target,
    color: "#FCE3E1",
  },
  {
    text: "Viết CV",
    question: "Làm thế nào để viết CV ấn tượng?",
    icon: FileText,
    color: "#FCE3E1",
  },
  {
    text: "Phỏng vấn",
    question: "Cách chuẩn bị cho buổi phỏng vấn?",
    icon: GraduationCap,
    color: "#FCE3E1",
  },
  {
    text: "Xu hướng việc làm",
    question: "Xu hướng việc làm hiện tại như thế nào?",
    icon: TrendingUp,
    color: "#FCE3E1",
  },
];

function Chatbot() {
  const { user, authToken, getAuthToken } = useAuth();
  const messageInputRef = useRef(null);
  const sendButtonRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const chatFormRef = useRef(null);
  const typingIndicatorRef = useRef(null);
  const statusDotRef = useRef(null);
  const statusTextRef = useRef(null);
  const messageHistory = useRef([]);
  const isTyping = useRef(false);

  useEffect(() => {
    checkSystemStatus();
    setupAutoResize();
    const interval = setInterval(() => checkSystemStatus(), 30000);
    return () => clearInterval(interval);
  }, []);

  const setupAutoResize = () => {
    const input = messageInputRef.current;
    if (!input) return;
    const resize = () => {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 120) + "px";
    };
    input.addEventListener("input", resize);
    resize();
  };

  const checkSystemStatus = async () => {
    try {
      const data = await apiClient.checkStatus();
      updateStatus(
        data.status === "healthy",
        data.status === "healthy" ? "Trực tuyến" : "Đang khởi động..."
      );
    } catch (error) {
      updateStatus(false, "Ngoại tuyến");
      console.error("Status check failed:", error);
    }
  };

  const updateStatus = (isOnline, statusText) => {
    if (statusDotRef.current) {
      statusDotRef.current.classList.toggle("bg-[#2ed573]", isOnline);
      statusDotRef.current.classList.toggle("bg-[#ff4757]", !isOnline);
    }
    if (statusTextRef.current) {
      statusTextRef.current.textContent = statusText;
    }
  };

  const sendMessage = async (messageText = null) => {
    const message = messageText || messageInputRef.current.value.trim();
    if (!message || isTyping.current) return;

    // Kiểm tra authentication
    if (!user) {
      addMessage("Vui lòng đăng nhập để sử dụng chatbot AI.", "bot", {
        type: "error",
      });
      return;
    }

    addMessage(message, "user");
    if (!messageText) {
      messageInputRef.current.value = "";
      messageInputRef.current.style.height = "auto";
    }
    showTyping(true);

    try {
      // Tạo auth data cho API request
      const authData = createAuthData(user, authToken, getAuthToken);

      // Gọi API thông qua apiClient
      const data = await apiClient.askChatbot(message, authData);

      showTyping(false);
      addMessage(data.response || "Xin lỗi, có lỗi xảy ra.", "bot", data);
    } catch (error) {
      showTyping(false);
      console.error("Chat error:", error);

      // Xử lý các loại lỗi khác nhau
      let errorMessage = "Không thể kết nối đến server. Vui lòng thử lại.";

      if (error.message?.includes("401")) {
        errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      } else if (error.message?.includes("403")) {
        errorMessage = "Bạn không có quyền sử dụng tính năng này.";
      } else if (error.message?.includes("Gemini API")) {
        errorMessage =
          "⚠️ Hệ thống AI chưa được cấu hình. Vui lòng liên hệ quản trị viên.";
      }

      addMessage(errorMessage, "bot", { type: "error" });
    }
    messageInputRef.current?.focus();
  };

  const addMessage = (content, sender, metadata = {}) => {
    const welcomeMessage =
      chatMessagesRef.current?.querySelector(".welcome-message");
    if (welcomeMessage) welcomeMessage.remove();

    const messageDiv = document.createElement("div");
    messageDiv.className = `w-full flex mb-6 ${
      sender === "user" ? "justify-end" : "justify-start"
    }`;

    // Tạo avatar cho bot
    if (sender === "bot") {
      const avatarDiv = document.createElement("div");
      avatarDiv.className = "flex-shrink-0 w-10 h-10 mr-3 mb-2";
      avatarDiv.innerHTML = `
        <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style="background: #F5BABB;">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" style="color: #064232;">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      `;
      messageDiv.appendChild(avatarDiv);
    }

    const messageContent = document.createElement("div");
    messageContent.className =
      "relative max-w-[85%] md:max-w-[70%] px-5 py-4 rounded-3xl shadow-lg break-words " +
      (sender === "user"
        ? "text-white font-semibold rounded-br-md border-2 backdrop-blur-sm"
        : "text-gray-900 border-2 font-normal rounded-bl-md backdrop-blur-sm leading-relaxed");

    if (sender === "user") {
      messageContent.style.background =
        "linear-gradient(90deg,#064232,#568F87)";
      messageContent.style.borderColor = "#568F87";
    } else {
      messageContent.style.background = "rgba(255,255,255,0.75)";
      messageContent.style.borderColor = "#F5BABB";
      messageContent.style.backdropFilter = "saturate(160%) blur(12px)";
    }

    if (metadata.type === "error") {
      messageContent.style.background = "#B91C1C";
      messageContent.style.borderColor = "#B91C1C";
      messageContent.style.color = "white";
    }

    messageContent.innerHTML = formatMessage(content);

    // Tạo avatar cho user (ở bên phải)
    if (sender === "user") {
      const userAvatarDiv = document.createElement("div");
      userAvatarDiv.className = "flex-shrink-0 w-10 h-10 ml-3 mb-2";
      userAvatarDiv.innerHTML = `
        <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style="background: #568F87;">
          <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      `;
      messageDiv.appendChild(messageContent);
      messageDiv.appendChild(userAvatarDiv);
    } else {
      messageDiv.appendChild(messageContent);
    }

    const timestamp = document.createElement("div");
    timestamp.className =
      "hidden text-xs opacity-60 mt-8 absolute right-4 bottom--2";
    timestamp.textContent = new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    messageContent.appendChild(timestamp);

    chatMessagesRef.current.appendChild(messageDiv);
    messageHistory.current.push({
      content,
      sender,
      timestamp: new Date(),
      metadata,
    });
    scrollToBottom();
  };

  const formatMessage = (content) => {
    return (
      content
        .replace(/\n/g, "<br>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(
          /`(.*?)`/g,
          '<code class="px-2 py-1 rounded text-sm font-mono" style="background: #FCE3E1; color: #064232;">$1</code>'
        )
        // Thêm auto line break cho câu dài
        .replace(/(.{80,}?)(\s)/g, "$1<br>$2")
        // Format lists
        .replace(/^- (.+)$/gm, '<div class="ml-4 mb-1">• $1</div>')
        .replace(/^\d+\. (.+)$/gm, '<div class="ml-4 mb-1">$1</div>')
    );
  };

  const showTyping = (show) => {
    isTyping.current = show;
    if (typingIndicatorRef.current)
      typingIndicatorRef.current.style.display = show ? "flex" : "none";
    if (sendButtonRef.current) sendButtonRef.current.disabled = show;
    if (show) scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatMessagesRef.current) {
        chatMessagesRef.current.scrollTop =
          chatMessagesRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleQuickQuestion = (question) => sendMessage(question);

  return (
    <>
      <style>{`
        .noise {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 20% 10%, rgba(245,186,187,0.35), transparent 45%);
          pointer-events: none;
        }
        .glass {
          background: rgba(255,255,255,0.75);
          backdrop-filter: saturate(160%) blur(12px);
          -webkit-backdrop-filter: saturate(160%) blur(12px);
        }
        .chatbot-wave {
          position: absolute;
          inset: 0;
          background: radial-gradient(1200px 400px at -10% 0%, #F5BABB 0%, transparent 60%);
          opacity: 0.9;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(245,186,187,0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #F5BABB, #568F87);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #568F87, #064232);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.7; }
          40% { transform: translateY(-8px); opacity: 1; }
        }
        .animate-bounce {
          animation: bounce 1.4s ease-in-out infinite;
        }
      `}</style>

      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: "#FFEFF2" }}
      >
        <div className="chatbot-wave" />
        <div className="noise" />

        <Header />

        <div className="flex-1 flex flex-col pt-[72px] md:pt-[80px] relative">
          {/* Content + Input */}
          <div className="flex-1 flex flex-col min-h-0 justify-between">
            <div
              ref={chatMessagesRef}
              className="flex-1 overflow-y-auto px-4 md:px-16 lg:px-32 py-6 custom-scrollbar space-y-4"
              style={{
                scrollBehavior: "smooth",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                maxHeight: "calc(100vh - 165px)",
              }}
            >
              <div
                className="welcome-message text-center py-8 px-2 md:px-5 rounded-2xl border shadow-lg max-w-2xl mx-auto glass"
                style={{ borderColor: "#568F87" }}
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "#FCE3E1" }}
                  >
                    <Bot className="w-6 h-6" style={{ color: "#064232" }} />
                  </div>
                  <h3
                    className="text-xl font-bold"
                    style={{ color: "#064232" }}
                  >
                    Xin chào! Tôi là trợ lý AI tư vấn nghề nghiệp
                  </h3>
                </div>
                <p className="mb-5" style={{ color: "#06423299" }}>
                  Tôi có thể giúp bạn về:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {quickQuestions.map((q, idx) => {
                    const IconComponent = q.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickQuestion(q.question)}
                        className="flex items-center gap-3 p-4 rounded-xl border-2 transition-all hover:shadow-lg"
                        style={{
                          borderColor: q.color,
                          background: "#FFFFFF",
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: q.color }}
                        >
                          <IconComponent
                            className="w-4 h-4"
                            style={{ color: "#064232" }}
                          />
                        </div>
                        <span
                          className="font-medium"
                          style={{ color: "#064232" }}
                        >
                          {q.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Typing indicator với animation dots và style đẹp hơn */}
              <div
                ref={typingIndicatorRef}
                className="hidden w-full flex justify-start mb-6"
              >
                {/* Bot Avatar */}
                <div className="flex-shrink-0 w-10 h-10 mr-3 mb-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                    style={{ background: "#F5BABB" }}
                  >
                    <Bot className="w-6 h-6" style={{ color: "#064232" }} />
                  </div>
                </div>

                <div
                  className="relative max-w-[80%] md:max-w-[60%] px-5 py-4 rounded-3xl rounded-bl-md glass shadow-lg"
                  style={{
                    borderColor: "#F5BABB",
                    border: "2px solid #F5BABB",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ background: "#064232" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{
                          background: "#064232",
                          animationDelay: "0.1s",
                        }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{
                          background: "#064232",
                          animationDelay: "0.2s",
                        }}
                      ></div>
                    </div>
                    <span className="text-sm" style={{ color: "#064232" }}>
                      Trợ lý đang suy nghĩ...
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Input form */}
            <div
              className="glass border-t p-3"
              style={{ borderColor: "#568F87" }}
            >
              <form
                className="flex gap-2 items-end w-full max-w-2xl mx-auto"
                ref={chatFormRef}
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
              >
                <textarea
                  ref={messageInputRef}
                  placeholder="Nhập câu hỏi của bạn..."
                  rows={1}
                  className="flex-1 resize-none overflow-hidden p-3 rounded-lg border-2 transition-all text-base shadow-sm"
                  style={{
                    maxHeight: 120,
                    borderColor: "#568F87",
                    background: "#FFFFFF",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  onInput={() => {
                    const input = messageInputRef.current;
                    if (!input) return;
                    input.style.height = "auto";
                    input.style.height =
                      Math.min(input.scrollHeight, 120) + "px";
                  }}
                />
                <button
                  type="submit"
                  ref={sendButtonRef}
                  className="w-14 h-14 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                  style={{
                    backgroundImage: "linear-gradient(90deg,#064232,#568F87)",
                  }}
                >
                  <Send className="w-6 h-6" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chatbot;
