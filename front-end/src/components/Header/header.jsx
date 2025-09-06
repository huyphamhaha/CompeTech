import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import "./HeaderMobile.css";
import {
  Compass,
  Sparkles,
  Zap,
  Star,
  X,
  Lock,
  ArrowRight,
  GraduationCap,
  BookOpen,
  Users,
  FileText,
  Target,
  MessageSquare,
  Award,
  Shield,
  FileCheck,
  MessageCircle,
  BarChart3,
  Phone,
  Menu,
  Activity,
  Trophy,
} from "lucide-react";

function Header() {
  const { userDetails, isLoading } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    // Authentication đã được handle trong AuthContext
    // Không cần thêm logic ở đây
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.clear();
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAvatarClick = () => {
    setIsModalVisible((prev) => !prev);
  };

  // Đóng mobile menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMobileMenu && !event.target.closest(".mobile-menu")) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMobileMenu]);

  // Ngăn body scroll khi mobile menu mở
  useEffect(() => {
    if (showMobileMenu) {
      document.body.classList.add("mobile-menu-open");
    } else {
      document.body.classList.remove("mobile-menu-open");
    }

    return () => {
      document.body.classList.remove("mobile-menu-open");
    };
  }, [showMobileMenu]);

  return (
    <nav
      className="bg-white/80 backdrop-blur block w-full z-40 fixed border-b"
      style={{ borderColor: "#568F87" }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="flex items-center w-32 sm:w-40 lg:w-48">
              <img
                src={"/Logo_CC_tron.svg"}
                alt="Logo"
                className="h-8 sm:h-9 lg:h-10"
              />
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden xl:flex items-center space-x-8 font-medium relative">
            {/* 1. Điểm rèn luyện Dropdown */}
            <div className="relative group">
              <div className="flex items-center gap-2 text-gray-700 hover:text-[#064232] transition-colors duration-200 font-medium py-2 cursor-pointer">
                <BookOpen className="w-4 h-4" style={{ color: "#064232" }} />
                Điểm rèn luyện
              </div>

              <div
                className="absolute top-full 
                 mt-2 w-[640px] bg-white rounded-xl shadow-xl border overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                style={{ borderColor: "#568F87", zIndex: 9999 }}
              >
                <div className="p-6">
                  <div
                    className="text-sm font-semibold uppercase tracking-wider mb-4"
                    style={{ color: "#064232" }}
                  >
                    Học tập và rèn luyện
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/rules"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "#FCE3E1" }}
                      >
                        <Shield
                          className="w-4 h-4"
                          style={{ color: "#064232" }}
                        />
                      </div>
                      <div>
                        <div
                          className="font-medium"
                          style={{ color: "#064232" }}
                        >
                          Thang điểm rèn luyện
                        </div>
                        <div className="text-sm" style={{ color: "#06423299" }}>
                          Quy định thang điểm rèn luyện
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/points"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "#FCE3E1" }}
                      >
                        <Award
                          className="w-4 h-4"
                          style={{ color: "#064232" }}
                        />
                      </div>
                      <div>
                        <div
                          className="font-medium"
                          style={{ color: "#064232" }}
                        >
                          Điểm rèn luyện
                        </div>
                        <div className="text-sm" style={{ color: "#06423299" }}>
                          Xem điểm cộng trừ
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/points/rules-pdf"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "#FCE3E1" }}
                      >
                        <Trophy
                          className="w-4 h-4"
                          style={{ color: "#064232" }}
                        />
                      </div>
                      <div>
                        <div
                          className="font-medium"
                          style={{ color: "#064232" }}
                        >
                          Nội quy
                        </div>
                        <div className="text-sm" style={{ color: "#06423299" }}>
                          Quy định nội quy
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/minhchung"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "#FCE3E1" }}
                      >
                        <FileText
                          className="w-4 h-4"
                          style={{ color: "#064232" }}
                        />
                      </div>
                      <div>
                        <div
                          className="font-medium"
                          style={{ color: "#064232" }}
                        >
                          Minh chứng
                        </div>
                        <div className="text-sm" style={{ color: "#06423299" }}>
                          Tài liệu chứng minh
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Hoạt động Dropdown */}
            <div className="relative group">
              <div className="flex items-center gap-2 text-gray-700 hover:text-[#064232] transition-colors duration-200 font-medium py-2 cursor-pointer">
                <Activity className="w-4 h-4" style={{ color: "#064232" }} />
                Hoạt động
              </div>

              <div
                className="absolute top-full right-0 mt-2 w-[480px] bg-white rounded-xl shadow-xl border overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                style={{ borderColor: "#568F87", zIndex: 9999 }}
              >
                <div className="p-6">
                  <div
                    className="text-sm font-semibold uppercase tracking-wider mb-4"
                    style={{ color: "#064232" }}
                  >
                    Hoạt động và phân tích
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/activity"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "#FCE3E1" }}
                      >
                        <Users
                          className="w-4 h-4"
                          style={{ color: "#064232" }}
                        />
                      </div>
                      <div>
                        <div
                          className="font-medium"
                          style={{ color: "#064232" }}
                        >
                          Hoạt động
                        </div>
                        <div className="text-sm" style={{ color: "#06423299" }}>
                          Sự kiện, câu lạc bộ
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/ai-analysis"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "#FCE3E1" }}
                      >
                        <BarChart3
                          className="w-4 h-4"
                          style={{ color: "#064232" }}
                        />
                      </div>
                      <div>
                        <div
                          className="font-medium"
                          style={{ color: "#064232" }}
                        >
                          AI phân tích
                        </div>
                        <div className="text-sm" style={{ color: "#06423299" }}>
                          Phân tích hoạt động
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Hướng nghiệp Dropdown */}
            <div className="relative group">
              <div className="flex items-center gap-2 text-gray-700 hover:text-[#064232] transition-colors duration-200 font-medium py-2 cursor-pointer">
                <Compass className="w-4 h-4" style={{ color: "#064232" }} />
                Hướng nghiệp
              </div>

              <div
                className="absolute top-full right-0 mt-2 w-[640px] bg-white rounded-xl shadow-xl border overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                style={{ borderColor: "#568F87", zIndex: 9999 }}
              >
                <div className="p-6">
                  <div
                    className="text-sm font-semibold uppercase tracking-wider mb-4"
                    style={{ color: "#064232" }}
                  >
                    Định hướng nghề nghiệp
                  </div>
                  {/* Grid 2 cột, mỗi cột 2 mục */}
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/interview"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "#FCE3E1" }}
                      >
                        <Target
                          className="w-4 h-4"
                          style={{ color: "#064232" }}
                        />
                      </div>
                      <div>
                        <div
                          className="font-medium"
                          style={{ color: "#064232" }}
                        >
                          Phỏng vấn nghề nghiệp
                        </div>
                        <div className="text-sm" style={{ color: "#06423299" }}>
                          Luyện tập với AI Coach
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/evaluatecv"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "#FCE3E1" }}
                      >
                        <FileCheck
                          className="w-4 h-4"
                          style={{ color: "#064232" }}
                        />
                      </div>
                      <div>
                        <div
                          className="font-medium"
                          style={{ color: "#064232" }}
                        >
                          Kiểm tra CV
                        </div>
                        <div className="text-sm" style={{ color: "#06423299" }}>
                          Đánh giá và cải thiện hồ sơ
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/university"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "#FCE3E1" }}
                      >
                        <GraduationCap
                          className="w-4 h-4"
                          style={{ color: "#064232" }}
                        />
                      </div>
                      <div>
                        <div
                          className="font-medium"
                          style={{ color: "#064232" }}
                        >
                          Danh sách đại học
                        </div>
                        <div className="text-sm" style={{ color: "#06423299" }}>
                          Thông tin các trường đại học
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/career"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "#FCE3E1" }}
                      >
                        <Compass
                          className="w-4 h-4"
                          style={{ color: "#064232" }}
                        />
                      </div>
                      <div>
                        <div
                          className="font-medium"
                          style={{ color: "#064232" }}
                        >
                          Hướng nghiệp
                        </div>
                        <div className="text-sm" style={{ color: "#06423299" }}>
                          Tư vấn nghề nghiệp
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Chatbot AI - Mục menu riêng biệt */}
            <Link
              to="/chatbot"
              className="flex items-center gap-2 text-gray-700 hover:text-[#064232] transition-colors duration-200 font-medium py-2"
            >
              <MessageSquare className="w-4 h-4" style={{ color: "#064232" }} />
              Chatbot AI
            </Link>

            {/* 5. Diễn đàn - Mục menu riêng biệt */}
            <Link
              to="/blog"
              className="flex items-center gap-2 text-gray-700 hover:text-[#064232] transition-colors duration-200 font-medium py-2"
            >
              <MessageCircle className="w-4 h-4" style={{ color: "#064232" }} />
              Diễn đàn
            </Link>

            {/* 6. Liên hệ - Mục menu riêng biệt */}
            <Link
              to="/contact"
              className="flex items-center gap-2 text-gray-700 hover:text-[#064232] transition-colors duration-200 font-medium py-2"
            >
              <Phone className="w-4 h-4" style={{ color: "#064232" }} />
              Liên hệ
            </Link>

            {/* User Profile */}
            {!isLoading && userDetails ? (
              <>
                <div className="relative">
                  <div className="relative">
                    <img
                      src={userDetails.photo || "/default-avatar.png"}
                      alt="Avatar"
                      className={`h-10 w-10 rounded-full cursor-pointer border-2 transition-all duration-200 ${""}`}
                      onClick={handleAvatarClick}
                    />
                  </div>

                  {isModalVisible && (
                    <div
                      className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border overflow-hidden"
                      style={{ borderColor: "#568F87", zIndex: 9999 }}
                    >
                      <div className={`p-4 flex items-center space-x-3 ${""}`}>
                        <div className="relative">
                          <img
                            src={userDetails.photo || "/default-avatar.png"}
                            alt="Avatar"
                            className={`h-10 w-10 rounded-full border-2 ${""}`}
                          />
                        </div>
                        <div>
                          <div
                            className={`font-semibold ${""}`}
                            style={{ color: "#064232" }}
                          >
                            {userDetails.firstName}
                          </div>
                          <div
                            className={`text-ellipsis line-clamp-1 truncate w-[160px] text-sm ${""}`}
                            style={{ color: "#06423299" }}
                          >
                            {userDetails.email}
                          </div>
                        </div>
                      </div>
                      <hr style={{ borderColor: "#FCE3E1" }} />
                      <ul className="py-2 text-sm">
                        <li>
                          <Link
                            to="/profile"
                            className="block px-4 py-3 hover:bg-gray-100 transition-colors duration-200 font-medium"
                            style={{ color: "#064232" }}
                          >
                            Trang cá nhân
                          </Link>
                        </li>
                      </ul>
                      <hr style={{ borderColor: "#FCE3E1" }} />
                      <div
                        className="px-4 py-3 cursor-pointer text-sm font-medium transition-colors duration-200"
                        onClick={handleLogout}
                        style={{ color: "#B91C1C" }}
                      >
                        Đăng xuất
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-6 py-2 font-medium rounded-lg border-2 transition-all duration-200"
                  style={{ color: "#064232", borderColor: "#568F87" }}
                >
                  Đăng ký
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-2 !ml-5 text-white border-2 font-medium rounded-lg transition-all duration-200 shadow-md hover:opacity-95"
                  style={{
                    borderColor: "#568F87",
                    backgroundImage: "linear-gradient(90deg,#064232,#568F87)",
                  }}
                >
                  Đăng nhập
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="xl:hidden flex items-center space-x-2">
            {/* User Profile trên mobile (nếu đã đăng nhập) */}
            {!isLoading && userDetails && (
              <div className="relative">
                <img
                  src={userDetails.photo || "/default-avatar.png"}
                  alt="Avatar"
                  className="h-8 w-8 rounded-full border-2 cursor-pointer"
                  style={{ borderColor: "#568F87" }}
                  onClick={handleAvatarClick}
                />

                {isModalVisible && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border overflow-hidden"
                    style={{ borderColor: "#568F87", zIndex: 9999 }}
                  >
                    <div className="p-3 flex items-center space-x-3">
                      <img
                        src={userDetails.photo || "/default-avatar.png"}
                        alt="Avatar"
                        className="h-8 w-8 rounded-full border-2"
                        style={{ borderColor: "#568F87" }}
                      />
                      <div>
                        <div
                          className="font-semibold text-sm"
                          style={{ color: "#064232" }}
                        >
                          {userDetails.firstName}
                        </div>
                        <div
                          className="text-xs truncate max-w-[120px]"
                          style={{ color: "#06423299" }}
                        >
                          {userDetails.email}
                        </div>
                      </div>
                    </div>
                    <hr style={{ borderColor: "#FCE3E1" }} />
                    <Link
                      to="/profile"
                      className="block px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
                      style={{ color: "#064232" }}
                    >
                      Trang cá nhân
                    </Link>
                    <hr style={{ borderColor: "#FCE3E1" }} />
                    <div
                      className="px-3 py-2 cursor-pointer text-sm font-medium transition-colors"
                      onClick={handleLogout}
                      style={{ color: "#B91C1C" }}
                    >
                      Đăng xuất
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              className="p-2 text-white font-medium rounded-lg transition-all duration-200 shadow-md"
              style={{
                backgroundImage: "linear-gradient(90deg,#064232,#568F87)",
              }}
              onClick={() => setShowMobileMenu(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div
          className="mobile-menu-container fixed inset-0 z-50 flex xl:hidden"
          style={{ zIndex: 9999 }}
        >
          {/* Side menu */}
          <div className="mobile-menu bg-white w-80 max-w-[85vw] h-full shadow-lg p-4 sm:p-6 flex flex-col animate-slideInLeft relative overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold" style={{ color: "#064232" }}>
                Menu
              </h2>
              <button
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Điểm rèn luyện Section */}
            <div className="mb-6">
              <div
                className="text-sm font-semibold uppercase tracking-wider mb-3 px-2"
                style={{ color: "#064232" }}
              >
                Điểm rèn luyện
              </div>
              <div className="space-y-1">
                <Link
                  to="/rules"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                  style={{ color: "#064232" }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "#FCE3E1" }}
                  >
                    <Shield className="w-4 h-4" style={{ color: "#064232" }} />
                  </div>
                  <span className="text-sm">Thang điểm rèn luyện</span>
                </Link>
                <Link
                  to="/points"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                  style={{ color: "#064232" }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "#FCE3E1" }}
                  >
                    <Award className="w-4 h-4" style={{ color: "#064232" }} />
                  </div>
                  <span className="text-sm">Điểm rèn luyện</span>
                </Link>
                <Link
                  to="/points/rules-pdf"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                  style={{ color: "#064232" }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "#FCE3E1" }}
                  >
                    <Trophy className="w-4 h-4" style={{ color: "#064232" }} />
                  </div>
                  <span className="text-sm">Nội quy</span>
                </Link>
                <Link
                  to="/minhchung"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                  style={{ color: "#064232" }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "#FCE3E1" }}
                  >
                    <FileText
                      className="w-4 h-4"
                      style={{ color: "#064232" }}
                    />
                  </div>
                  <span className="text-sm">Minh chứng</span>
                </Link>
              </div>
            </div>

            {/* Mobile Hoạt động Section */}
            <div className="mb-6">
              <div
                className="text-sm font-semibold uppercase tracking-wider mb-3 px-2"
                style={{ color: "#064232" }}
              >
                Hoạt động
              </div>
              <div className="space-y-1">
                <Link
                  to="/activity"
                  className="menu-item flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                  style={{ color: "#064232" }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "#FCE3E1" }}
                  >
                    <Users className="w-4 h-4" style={{ color: "#064232" }} />
                  </div>
                  <span className="text-sm">Hoạt động</span>
                </Link>
                <Link
                  to="/ai-analysis"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                  style={{ color: "#064232" }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "#FCE3E1" }}
                  >
                    <BarChart3
                      className="w-4 h-4"
                      style={{ color: "#064232" }}
                    />
                  </div>
                  <span className="text-sm">AI phân tích</span>
                </Link>
              </div>
            </div>

            {/* Mobile Hướng nghiệp Section */}
            <div className="mb-6">
              <div
                className="text-sm font-semibold uppercase tracking-wider mb-3 px-2"
                style={{ color: "#064232" }}
              >
                Hướng nghiệp
              </div>
              <div className="space-y-1">
                <Link
                  to="/interview"
                  className="menu-item flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                  style={{ color: "#064232" }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "#FCE3E1" }}
                  >
                    <Target className="w-4 h-4" style={{ color: "#064232" }} />
                  </div>
                  <span className="text-sm">Phỏng vấn nghề nghiệp</span>
                </Link>
                <Link
                  to="/evaluatecv"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                  style={{ color: "#064232" }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "#FCE3E1" }}
                  >
                    <FileCheck
                      className="w-4 h-4"
                      style={{ color: "#064232" }}
                    />
                  </div>
                  <span className="text-sm">Kiểm tra CV</span>
                </Link>
                <Link
                  to="/university"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                  style={{ color: "#064232" }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "#FCE3E1" }}
                  >
                    <GraduationCap
                      className="w-4 h-4"
                      style={{ color: "#064232" }}
                    />
                  </div>
                  <span className="text-sm">Danh sách đại học</span>
                </Link>
                <Link
                  to="/career"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                  style={{ color: "#064232" }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "#FCE3E1" }}
                  >
                    <Compass className="w-4 h-4" style={{ color: "#064232" }} />
                  </div>
                  <span className="text-sm">Hướng nghiệp</span>
                </Link>
              </div>
            </div>

            {/* Mobile Chatbot AI Section */}
            <div className="mb-6">
              <div
                className="text-sm font-semibold uppercase tracking-wider mb-3 px-2"
                style={{ color: "#064232" }}
              >
                Hỗ trợ
              </div>
              <div className="space-y-1">
                <Link
                  to="/chatbot"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                  style={{ color: "#064232" }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "#FCE3E1" }}
                  >
                    <MessageSquare
                      className="w-4 h-4"
                      style={{ color: "#064232" }}
                    />
                  </div>
                  <span className="text-sm">Chatbot AI</span>
                </Link>
                <Link
                  to="/blog"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                  style={{ color: "#064232" }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "#FCE3E1" }}
                  >
                    <MessageCircle
                      className="w-4 h-4"
                      style={{ color: "#064232" }}
                    />
                  </div>
                  <span className="text-sm">Diễn đàn</span>
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                  style={{ color: "#064232" }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "#FCE3E1" }}
                  >
                    <Phone className="w-4 h-4" style={{ color: "#064232" }} />
                  </div>
                  <span className="text-sm">Liên hệ</span>
                </Link>
              </div>
            </div>

            {/* Mobile Auth Section */}
            {!isLoading && userDetails ? (
              <div className="mt-auto pt-4 border-t border-gray-100">
                <div className="px-2 mb-3">
                  <div
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "#064232" }}
                  >
                    Tài khoản
                  </div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors mb-2"
                  style={{ color: "#064232" }}
                >
                  <img
                    src={userDetails.photo || "/default-avatar.png"}
                    alt="Avatar"
                    className="h-8 w-8 rounded-full border-2"
                    style={{ borderColor: "#568F87" }}
                  />
                  <div>
                    <div className="font-medium text-sm">
                      {userDetails.firstName}
                    </div>
                    <div
                      className="text-xs truncate max-w-[120px]"
                      style={{ color: "#06423299" }}
                    >
                      {userDetails.email}
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    handleLogout();
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                  style={{ color: "#B91C1C" }}
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="mt-auto pt-4 border-t border-gray-100">
                <div className="px-2 mb-3">
                  <div
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "#064232" }}
                  >
                    Đăng nhập
                  </div>
                </div>
                <div className="space-y-2">
                  <Link
                    to="/register"
                    className="block w-full text-center p-3 rounded-lg border-2 font-medium transition-all duration-200"
                    onClick={() => setShowMobileMenu(false)}
                    style={{ color: "#064232", borderColor: "#568F87" }}
                  >
                    Đăng ký
                  </Link>
                  <Link
                    to="/login"
                    className="block w-full text-center p-3 text-white border-2 font-medium rounded-lg transition-all duration-200 shadow-md"
                    onClick={() => setShowMobileMenu(false)}
                    style={{
                      borderColor: "#568F87",
                      backgroundImage: "linear-gradient(90deg,#064232,#568F87)",
                    }}
                  >
                    Đăng nhập
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Overlay background */}
          <div
            className="flex-1 bg-black/40"
            onClick={() => setShowMobileMenu(false)}
          ></div>
        </div>
      )}
    </nav>
  );
}

export default Header;
