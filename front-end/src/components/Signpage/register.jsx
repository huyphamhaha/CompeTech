import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import React, { useState } from "react";
import { auth, db } from "../firebase.js";
import { setDoc, doc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Upload,
  Camera,
  GraduationCap,
  Hash,
} from "lucide-react";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [studentId, setStudentId] = useState("");
  const [className, setClassName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(""); // State to hold error message
  const navigate = useNavigate(); // Hook to manage navigation

  const classOptions = [
    "10A",
    "10B",
    "10C",
    "11A",
    "11B",
    "11C",
    "12A",
    "12B",
    "12C",
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // Validate required fields
    if (!fname.trim() || !studentId.trim() || !className) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      console.log(user);

      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          email: email,
          firstName: fname,
          studentId: studentId,
          className: className,
          createdAt: new Date(),
        });

        await signInWithEmailAndPassword(auth, email, password);
      }

      navigate("/profile"); // Redirect to home or another desired page
      console.log("User Registered Successfully!!");
    } catch (error) {
      console.log(error.message);
      setError(error.message); // Set error message to state
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
        @keyframes spinOrbit { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
        @keyframes morphBlob { 0% { border-radius: 32% 68% 60% 40% / 42% 38% 62% 58%; } 50% { border-radius: 68% 32% 40% 60% / 58% 62% 38% 42%; } 100% { border-radius: 32% 68% 60% 40% / 42% 38% 62% 58%; } }
        @keyframes cardFloat { 0% { transform: translateY(0) rotate(-6deg); } 50% { transform: translateY(-6px) rotate(-6deg); } 100% { transform: translateY(0) rotate(-6deg); } }
      `}</style>
      <div className="auth-wave" />
      <div className="noise" />
      <div
        className="blob"
        style={{
          top: "12%",
          left: "-6%",
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
          bottom: "6%",
          right: "-5%",
          width: 260,
          height: 260,
          background:
            "radial-gradient(circle at 70% 70%, #568F87, transparent 55%)",
          animation: "floatSlow 10s ease-in-out infinite",
        }}
      />

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
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#064232" }}
                >
                  Họ và Tên <span style={{ color: "#F5BABB" }}>*</span>
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                    style={{ color: "#568F87" }}
                  />
                  <input
                    maxLength="50"
                    type="text"
                    value={fname}
                    onChange={(e) => setFname(e.target.value)}
                    placeholder="Nhập họ và tên đầy đủ"
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
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#064232" }}
                >
                  Mã số học viên <span style={{ color: "#F5BABB" }}>*</span>
                </label>
                <div className="relative">
                  <Hash
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                    style={{ color: "#568F87" }}
                  />
                  <input
                    maxLength="20"
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Nhập mã số học viên"
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
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#064232" }}
                >
                  Lớp <span style={{ color: "#F5BABB" }}>*</span>
                </label>
                <div className="relative">
                  <GraduationCap
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                    style={{ color: "#568F87" }}
                  />
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 appearance-none"
                    style={{
                      borderColor: "#568F87",
                      background: "#FFFFFF",
                      color: "#064232",
                    }}
                    required
                  >
                    <option value="">Chọn lớp</option>
                    {classOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

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

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#064232" }}
                >
                  Mật khẩu
                </label>
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
                    className="w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:ring-2 focus:outline-none transition-all duration-200"
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
                className="w-full px-6 py-3 font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                style={{
                  backgroundImage: "linear-gradient(90deg,#064232,#568F87)",
                  color: "#FFFFFF",
                }}
              >
                Tạo tài khoản
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div
                    className="w-full border-t"
                    style={{ borderColor: "#e5e7eb" }}
                  ></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span
                    className="px-2"
                    style={{ background: "#FFFFFF", color: "#6b7280" }}
                  >
                    hoặc
                  </span>
                </div>
              </div>

              <p className="text-center text-gray-600">
                Đã có tài khoản?{" "}
                <Link
                  to="/login"
                  className="font-medium"
                  style={{ color: "#064232" }}
                >
                  Đăng nhập
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
      {/* Left Side - Themed Decoration (Register - Morphing Blobs + Cards) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-10">
        <div className="relative w-full max-w-2xl aspect-square">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(#06423222 1px, transparent 1px)",
              backgroundSize: "16px 16px",
              opacity: 0.2,
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          <div
            className="absolute"
            style={{
              top: "8%",
              left: "-6%",
              width: 220,
              height: 220,
              background: "linear-gradient(135deg,#F5BABB,#FFEFF2)",
              animation: "morphBlob 12s ease-in-out infinite",
              opacity: 0.45,
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
          <div
            className="absolute"
            style={{
              bottom: "-4%",
              right: "-4%",
              width: 260,
              height: 260,
              background: "linear-gradient(135deg,#568F87,#FFEFF2)",
              animation: "morphBlob 16s ease-in-out infinite",
              opacity: 0.45,
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          <div
            className="absolute left-1/2 top-1/2"
            style={{ transform: "translate(-50%, -50%)" }}
          >
            <div className="relative" style={{ width: 420, height: 320 }}>
              <div
                className="absolute inset-0 rounded-3xl shadow-xl border"
                style={{
                  transform: "rotate(-10deg) translate(-18px, -12px)",
                  background: "#FFFFFF",
                  borderColor: "#F5BABB",
                  opacity: 0.9,
                }}
              />
              <div
                className="absolute inset-0 rounded-3xl shadow-xl border"
                style={{
                  transform: "rotate(-6deg) translate(-9px, -6px)",
                  background: "#FFFFFF",
                  borderColor: "#568F87",
                  opacity: 0.95,
                }}
              />
              <div
                className="absolute inset-0 rounded-3xl shadow-2xl border"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  backdropFilter: "saturate(160%) blur(8px)",
                  borderColor: "#064232",
                }}
              >
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
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
                      className="text-sm font-semibold"
                      style={{ color: "#064232" }}
                    >
                      Tạo tài khoản
                    </span>
                  </div>
                  <div
                    className="rounded-xl p-3 border"
                    style={{
                      borderColor: "#F5BABB",
                      color: "#064232",
                      background: "#FFFFFF",
                    }}
                  >
                    Nền tảng CompeTech
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div
                      className="rounded-xl p-3 border text-sm"
                      style={{
                        borderColor: "#064232",
                        color: "#064232",
                        background: "#FFFFFF",
                      }}
                    >
                      Điểm rèn luyện
                    </div>
                    <div
                      className="rounded-xl p-3 border text-sm"
                      style={{
                        borderColor: "#064232",
                        color: "#064232",
                        background: "#FFFFFF",
                      }}
                    >
                      Định hướng nghề
                    </div>
                    <div
                      className="rounded-xl p-3 border text-sm"
                      style={{
                        borderColor: "#064232",
                        color: "#064232",
                        background: "#FFFFFF",
                      }}
                    >
                      Đánh giá năng lực
                    </div>
                    <div
                      className="rounded-xl p-3 border text-sm"
                      style={{
                        borderColor: "#064232",
                        color: "#064232",
                        background: "#FFFFFF",
                      }}
                    >
                      Nội quy trường
                    </div>
                    <div
                      className="rounded-xl p-3 border text-sm"
                      style={{
                        borderColor: "#064232",
                        color: "#064232",
                        background: "#FFFFFF",
                      }}
                    >
                      Hỗ trợ học tập
                    </div>
                    <div
                      className="rounded-xl p-3 border text-sm"
                      style={{
                        borderColor: "#064232",
                        color: "#064232",
                        background: "#FFFFFF",
                      }}
                    >
                      Lên kế hoạch
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute"
            style={{
              top: "10%",
              right: "6%",
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
              <div className="text-sm font-semibold">Đăng ký dễ dàng</div>
              <div className="text-xs" style={{ color: "#06423299" }}>
                2 phút là xong
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
