import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js";
import { useAuth } from "../../contexts/AuthContext";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  // Updated handleSubmit to use Firebase auth directly
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("🔄 Logging in with Firebase...");

      // Sign in with Firebase directly
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("✅ Firebase login successful:", userCredential.user.email);

      // AuthContext will automatically handle the rest
      // Navigate based on user type (will be handled after AuthContext updates)
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("❌ Login error:", error);

      // Display user-friendly error messages
      if (error.code === "auth/user-not-found") {
        setError("Không tìm thấy tài khoản với email này");
      } else if (error.code === "auth/wrong-password") {
        setError("Mật khẩu không chính xác");
      } else if (error.code === "auth/invalid-email") {
        setError("Email không hợp lệ");
      } else if (error.code === "auth/invalid-credential") {
        setError("Thông tin đăng nhập không chính xác");
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại.");
      }

      setTimeout(() => {
        setError("");
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  // Check if user is already logged in via AuthContext
  useEffect(() => {
    if (!isLoading && user) {
      console.log("✅ User already logged in, redirecting...");
      navigate("/");
    }
  }, [user, isLoading, navigate]);

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
        @keyframes spinOrbit { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
      `}</style>
      <div className="auth-wave" />
      <div className="noise" />
      <div
        className="blob"
        style={{
          top: "10%",
          left: "-5%",
          width: 240,
          height: 240,
          background:
            "radial-gradient(circle at 30% 30%, #F5BABB, transparent 60%)",
          animation: "floatSlow 8s ease-in-out infinite",
        }}
      />
      <div
        className="blob"
        style={{
          bottom: "5%",
          right: "-4%",
          width: 260,
          height: 260,
          background:
            "radial-gradient(circle at 70% 70%, #568F87, transparent 55%)",
          animation: "floatSlow 10s ease-in-out infinite",
        }}
      />

      {/* Left Side - Themed Decoration */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-10">
        <div className="relative w-full max-w-2xl aspect-square">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(#06423222 1px, transparent 1px)",
              backgroundSize: "16px 16px",
              opacity: 0.25,
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: 120,
              height: 360,
              transform: "translate(-50%,-50%) rotate(25deg)",
              background: "linear-gradient(180deg,#F5BABB,#568F87)",
              filter: "blur(30px)",
              opacity: 0.35,
              borderRadius: 9999,
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: 360,
              height: 360,
              transform: "translate(-50%, -50%)",
              border: "2px dashed #568F87",
              borderRadius: 9999,
              opacity: 0.35,
              animation: "spinOrbit 24s linear infinite",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: 500,
              height: 500,
              transform: "translate(-50%, -50%)",
              border: "2px dashed #F5BABB",
              borderRadius: 9999,
              opacity: 0.3,
              animation: "spinOrbit 38s linear infinite",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: 260,
              height: 260,
              transform: "translate(-50%, -50%)",
              border: "2px solid #064232",
              borderRadius: 9999,
              opacity: 0.2,
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          <div
            className="absolute left-1/2 top-1/2"
            style={{ transform: "translate(-50%, -50%)" }}
          >
            <div
              className="rounded-3xl shadow-2xl border"
              style={{
                width: 160,
                height: 160,
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "saturate(160%) blur(12px)",
                borderColor: "#F5BABB",
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div
                  className="rounded-2xl"
                  style={{
                    width: 96,
                    height: 96,
                    background: "linear-gradient(135deg,#064232,#568F87)",
                    boxShadow: "inset 0 0 20px rgba(255,255,255,0.2)",
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white font-extrabold text-3xl">
                      CT
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute"
            style={{
              top: "10%",
              right: "8%",
              pointerEvents: "none",
              zIndex: 0,
            }}
          >
            <div
              className="rounded-2xl shadow-lg border px-4 py-3"
              style={{
                background: "#FFFFFF",
                borderColor: "#568F87",
                color: "#064232",
              }}
            >
              <div className="text-sm font-semibold">AI Coach</div>
              <div className="text-xs" style={{ color: "#06423299" }}>
                Realtime feedback
              </div>
            </div>
          </div>

          <div
            className="absolute"
            style={{
              bottom: "12%",
              left: "6%",
              pointerEvents: "none",
              zIndex: 0,
            }}
          >
            <div
              className="rounded-2xl shadow-lg border px-4 py-3 w-44"
              style={{
                background: "#FFFFFF",
                borderColor: "#F5BABB",
                color: "#064232",
              }}
            >
              <div className="text-sm font-semibold">CV Score</div>
              <div className="text-lg font-extrabold">
                8.6<span className="text-xs">/10</span>
              </div>
              <div
                className="mt-2 h-1.5 rounded-full overflow-hidden"
                style={{ background: "#FFEFF2" }}
              >
                <div
                  className="h-full"
                  style={{
                    width: "86%",
                    background: "linear-gradient(90deg,#F5BABB,#568F87)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-6"
        style={{ zIndex: 1 }}
      >
        <div className="w-full max-w-xl">
          <div
            className="rounded-xl shadow-lg p-8 border"
            style={{ background: "#FFFFFF", borderColor: "#F5BABB" }}
          >
            <div className="text-center mb-6 justify-center items-center flex flex-col">
              <div className="mb-4">
                <img src={"./Logo_CC_tron.svg"} alt="Logo" className="h-12" />
              </div>
              <h2
                className="text-xl font-bold mb-2"
                style={{ color: "#064232" }}
              >
                Chào mừng bạn trở lại!
              </h2>
              <p className="text-sm" style={{ color: "#06423299" }}>
                Rất vui được gặp bạn! Vui lòng đăng nhập để tiếp tục
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="w-full pl-10 pr-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:outline-none transition-all duration-200"
                    style={{
                      borderColor: "#568F87",
                      background: "#FFFFFF",
                      color: "#064232",
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className="text-sm font-medium"
                    style={{ color: "#064232" }}
                  >
                    Mật khẩu
                  </label>
                  <Link
                    to="/forgotpass"
                    className="text-sm font-medium"
                    style={{ color: "#064232" }}
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                    style={{ color: "#568F87" }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu của bạn"
                    className="w-full pl-10 pr-12 py-2.5 border-2 rounded-lg focus:ring-2 focus:outline-none transition-all duration-200"
                    style={{
                      borderColor: "#568F87",
                      background: "#FFFFFF",
                      color: "#064232",
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: "#568F87" }}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className="p-3 border rounded-lg"
                  style={{ background: "#FCE3E1", borderColor: "#F5BABB" }}
                >
                  <p className="text-sm" style={{ color: "#8b0000" }}>
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full px-6 py-2.5 font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
                  loading ? "cursor-not-allowed opacity-70" : ""
                }`}
                style={{
                  backgroundImage: loading
                    ? undefined
                    : "linear-gradient(90deg,#064232,#568F87)",
                  color: "#FFFFFF",
                }}
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>

              <p className="text-center" style={{ color: "#064232" }}>
                Chưa có tài khoản?{" "}
                <Link
                  to="/register"
                  className="font-medium"
                  style={{ color: "#064232" }}
                >
                  Đăng ký
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
