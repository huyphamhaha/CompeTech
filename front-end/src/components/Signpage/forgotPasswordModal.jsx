import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase.js";
import { ArrowLeft, Mail, Send } from "lucide-react";

function ForgotPasswordModal() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(
        "Đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư và spam."
      );
    } catch (error) {
      console.error("Password reset error:", error);
      if (error.code === "auth/user-not-found") {
        setMessage("Không tìm thấy tài khoản với email này.");
      } else if (error.code === "auth/invalid-email") {
        setMessage("Email không hợp lệ.");
      } else if (error.code === "auth/too-many-requests") {
        setMessage("Quá nhiều yêu cầu. Vui lòng thử lại sau.");
      } else {
        setMessage("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex"
      style={{ background: "#FFEFF2" }}
    >
      <style>{`
        .auth-wave { position: absolute; inset: 0; background: radial-gradient(1200px 400px at -10% 0%, #F5BABB 0%, transparent 60%); opacity: 0.9; pointer-events: none; z-index: 0; }
        .noise { position: absolute; inset: 0; background-image: radial-gradient(circle at 20% 10%, rgba(245,186,187,0.35), transparent 45%); pointer-events: none; z-index: 0; }
        .blob { position: absolute; filter: blur(40px); opacity: 0.6; pointer-events: none; z-index: 0; }
        @keyframes floatSlow { 0% { transform: translateY(0) translateX(0) scale(1); } 50% { transform: translateY(-12px) translateX(8px) scale(1.03); } 100% { transform: translateY(0) translateX(0) scale(1); } }
      `}</style>
      <div className="auth-wave" />
      <div className="noise" />
      <div
        className="blob"
        style={{
          top: "10%",
          left: "-5%",
          width: 220,
          height: 220,
          background:
            "radial-gradient(circle at 30% 30%, #F5BABB, transparent 60%)",
          animation: "floatSlow 9s ease-in-out infinite",
        }}
      />
      <div
        className="blob"
        style={{
          bottom: "8%",
          right: "-4%",
          width: 240,
          height: 240,
          background:
            "radial-gradient(circle at 70% 70%, #568F87, transparent 55%)",
          animation: "floatSlow 11s ease-in-out infinite",
        }}
      />

      {/* Left Side - Themed Decoration */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-10">
        <div className="relative w-full max-w-md">
          <div
            className="glass rounded-3xl shadow-xl border"
            style={{
              borderColor: "#F5BABB",
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "saturate(160%) blur(12px)",
            }}
          >
            <div
              className="p-4 border-b flex items-center gap-2"
              style={{ borderColor: "#F5BABB" }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "#F5BABB" }}
              />
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "#568F87" }}
              />
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "#064232" }}
              />
              <span
                className="ml-2 text-sm font-semibold"
                style={{ color: "#064232" }}
              >
                Khôi phục mật khẩu
              </span>
            </div>
            <div className="p-5" style={{ color: "#064232" }}>
              Đừng lo lắng! Chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu đến
              email của bạn.
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-8"
        style={{ zIndex: 1 }}
      >
        <div className="w-full max-w-xl">
          <div
            className="rounded-2xl shadow-xl p-10 border"
            style={{ background: "#FFFFFF", borderColor: "#F5BABB" }}
          >
            <div className="text-center mb-8">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "#F5BABB", color: "#064232" }}
              >
                <span className="font-bold text-xl">CT</span>
              </div>
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: "#064232" }}
              >
                Đặt lại mật khẩu
              </h2>
              <p style={{ color: "#06423299" }}>
                Nhập email của bạn và chúng tôi sẽ gửi liên kết đặt lại mật khẩu
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#064232" }}
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                    style={{ color: "#568F87" }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập địa chỉ email của bạn"
                    className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:outline-none transition-all duration-200"
                    style={{
                      borderColor: "#568F87",
                      background: "#FFFFFF",
                      color: "#064232",
                    }}
                    required
                  />
                </div>
              </div>

              {message && (
                <div
                  className={`p-3 rounded-lg ${
                    message.includes("gửi đến email")
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      message.includes("gửi đến email")
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {message}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full px-6 py-3 font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
                style={{
                  backgroundImage: isLoading
                    ? undefined
                    : "linear-gradient(90deg,#064232,#568F87)",
                  color: "#FFFFFF",
                }}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Gửi liên kết
                  </>
                )}
              </button>

              <div className="text-center">
                <a
                  href="/login"
                  className="font-medium text-sm"
                  style={{ color: "#064232" }}
                >
                  Quay lại đăng nhập
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
