import React, { useState, useEffect } from "react";
import { db } from "../firebase.js";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext.jsx";
import Header from "../Header/header.jsx";
import { Link } from "react-router-dom";
import {
  Award,
  Minus,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  BookOpen,
  AlertTriangle,
} from "lucide-react";

function StudentPoints() {
  const [studentPoints, setStudentPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // all, penalty, reward
  const { user, userDetails, isLoading: authLoading } = useAuth();

  useEffect(() => {
    // Chỉ gọi fetchStudentPoints khi user đã đăng nhập và userDetails đã được tải
    if (user && userDetails && !authLoading) {
      fetchStudentPoints();
    }
  }, [user, userDetails, authLoading]);

  const fetchStudentPoints = async () => {
    try {
      setLoading(true);

      // Kiểm tra xem user đã đăng nhập chưa
      if (!user || !userDetails) {
        console.error("User chưa đăng nhập hoặc chưa tải xong thông tin");
        setLoading(false);
        return;
      }

      // Sử dụng user.uid trực tiếp từ Firebase Auth
      const studentId = user.uid;

      // Lấy điểm của học sinh
      const pointsRef = collection(db, "studentPoints");
      const q = query(
        pointsRef,
        where("studentId", "==", studentId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      const pointsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || null,
        awardedAt: doc.data().awardedAt?.toDate?.() || null,
      }));

      setStudentPoints(pointsData);
    } catch (error) {
      console.error("Error fetching student points:", error);
      // Hiển thị thông báo lỗi cho user
      alert(
        "Có lỗi xảy ra khi tải dữ liệu điểm rèn luyện. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  const getTotalPoints = () => {
    let total = 100; // Điểm mặc định
    studentPoints.forEach((point) => {
      // Cộng trực tiếp tất cả điểm vào tổng
      // Điểm cộng (reward): points > 0, điểm trừ (penalty): points < 0
      total += point.points;
    });
    return Math.max(0, total); // Đảm bảo điểm không âm
  };

  const getPointsSummary = () => {
    // Tính tổng điểm trừ (lấy giá trị tuyệt đối để hiển thị)
    const totalPenalty = studentPoints
      .filter((p) => p.type === "penalty")
      .reduce((sum, p) => sum + Math.abs(p.points), 0);

    // Tính tổng điểm cộng
    const totalReward = studentPoints
      .filter((p) => p.type === "reward")
      .reduce((sum, p) => sum + p.points, 0);

    return {
      total: studentPoints.length,
      totalPenalty,
      totalReward,
    };
  };

  const filteredPoints = studentPoints.filter((point) => {
    if (activeTab === "all") return true;
    return point.type === activeTab;
  });

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <div className="min-h-screen" style={{ background: "#FFEFF2" }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
            <div className="text-center py-16">
              <div
                className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                style={{ borderColor: "#064232" }}
              ></div>
              <p className="text-lg" style={{ color: "#064232" }}>
                {authLoading
                  ? "Đang xác thực người dùng..."
                  : "Đang tải thông tin điểm..."}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen" style={{ background: "#FFEFF2" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "#FCE3E1" }}
              >
                <Award className="w-6 h-6" style={{ color: "#064232" }} />
              </div>
            </div>
            <h1
              className="text-3xl sm:text-4xl font-extrabold leading-tight"
              style={{ color: "#064232" }}
            >
              Điểm Rèn luyện
            </h1>
            <p
              className="mt-3 text-lg max-w-2xl mx-auto"
              style={{ color: "#064232CC" }}
            >
              Theo dõi điểm cộng, điểm trừ và hạnh kiểm của bạn
            </p>
          </div>

          {/* Student Info Card */}
          {userDetails && user ? (
            <div
              className="bg-white rounded-2xl shadow-lg border p-4 mb-6"
              style={{ borderColor: "#568F87" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base"
                  style={{ background: "#064232" }}
                >
                  {userDetails.firstName
                    ? userDetails.firstName.charAt(0)
                    : "H"}
                </div>
                <div>
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: "#064232" }}
                  >
                    {userDetails.firstName || "Học sinh"}
                  </h2>
                  <p className="text-sm" style={{ color: "#064232CC" }}>
                    {user.uid || "Mã học sinh"} •{" "}
                    {userDetails.className || "Lớp"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <h3 className="font-medium text-yellow-800 text-sm">
                    {authLoading
                      ? "Đang tải thông tin học sinh..."
                      : "Không thể tải thông tin học sinh"}
                  </h3>
                  <p className="text-xs text-yellow-700 mt-1">
                    {authLoading
                      ? "Vui lòng chờ trong giây lát..."
                      : "Vui lòng đăng nhập lại hoặc liên hệ quản trị viên"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Points Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div
              className="bg-white rounded-2xl shadow-lg border p-4 text-center"
              style={{ borderColor: "#568F87" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "#FCE3E1" }}
              >
                <TrendingUp className="w-5 h-5" style={{ color: "#064232" }} />
              </div>
              <div
                className="text-2xl font-bold mb-1"
                style={{ color: "#064232" }}
              >
                {getTotalPoints()}
              </div>
              <p className="text-xs" style={{ color: "#064232CC" }}>
                Điểm hiện tại
              </p>
            </div>

            <div
              className="bg-white rounded-2xl shadow-lg border p-4 text-center"
              style={{ borderColor: "#568F87" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "#FCE3E1" }}
              >
                <Award className="w-5 h-5" style={{ color: "#064232" }} />
              </div>
              <div
                className="text-2xl font-bold mb-1"
                style={{ color: "#064232" }}
              >
                {getPointsSummary().totalReward}
              </div>
              <p className="text-xs" style={{ color: "#064232CC" }}>
                Điểm cộng
              </p>
            </div>

            <div
              className="bg-white rounded-2xl shadow-lg border p-4 text-center"
              style={{ borderColor: "#568F87" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "#FCE3E1" }}
              >
                <Minus className="w-5 h-5" style={{ color: "#064232" }} />
              </div>
              <div
                className="text-2xl font-bold mb-1"
                style={{ color: "#064232" }}
              >
                {getPointsSummary().totalPenalty}
              </div>
              <p className="text-xs" style={{ color: "#064232CC" }}>
                Điểm trừ
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-6">
            <div
              className="flex space-x-1 bg-white p-1 rounded-xl shadow-lg border"
              style={{ borderColor: "#568F87" }}
            >
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "all"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setActiveTab("reward")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "reward"
                    ? "bg-green-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Điểm cộng
              </button>
              <button
                onClick={() => setActiveTab("penalty")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "penalty"
                    ? "bg-red-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Điểm trừ
              </button>
            </div>
          </div>

          {/* Points List */}
          <div
            className="bg-white rounded-2xl shadow-lg border p-6"
            style={{ borderColor: "#568F87" }}
          >
            {filteredPoints.length === 0 ? (
              <div className="text-center py-8">
                <div className="mb-3">
                  <BookOpen
                    size={48}
                    className="mx-auto"
                    style={{ color: "#064232" }}
                  />
                </div>
                <h3
                  className="text-lg font-medium mb-2"
                  style={{ color: "#064232" }}
                >
                  {studentPoints.length === 0
                    ? "Không thể tải dữ liệu điểm rèn luyện"
                    : "Bạn chưa có điểm cộng hoặc điểm trừ nào"}
                </h3>
                <p style={{ color: "#064232CC" }}>
                  {studentPoints.length === 0
                    ? "Vui lòng kiểm tra kết nối mạng hoặc thử lại sau"
                    : "Hãy tuân thủ nội quy để có điểm rèn luyện tốt!"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPoints.map((point) => (
                  <div
                    key={point.id}
                    className={`p-4 rounded-xl border-2 ${
                      point.type === "penalty"
                        ? "border-red-200 bg-red-50"
                        : "border-green-200 bg-green-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            point.type === "penalty"
                              ? "bg-red-500"
                              : "bg-green-500"
                          }`}
                        >
                          {point.type === "penalty" ? (
                            <Minus size={16} />
                          ) : (
                            <Award size={16} />
                          )}
                        </div>
                        <div>
                          <h4
                            className="text-lg font-semibold"
                            style={{ color: "#064232" }}
                          >
                            {point.ruleCode || "N/A"}
                          </h4>
                          <p className="text-xs" style={{ color: "#064232CC" }}>
                            Mã quy tắc
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-2xl font-bold ${
                            point.type === "reward"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {point.type === "reward"
                            ? `+${point.points} điểm`
                            : `${point.points} điểm`}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-800 leading-relaxed mb-3">
                        {point.description}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-gray-600 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>
                            Thời gian:{" "}
                            {formatDate(point.awardedAt || point.createdAt)}
                          </span>
                        </div>
                        {point.updatedAt && (
                          <div className="flex items-center gap-2">
                            <Clock size={14} />
                            <span>Cập nhật: {formatDate(point.updatedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div
            className="mt-6 p-4 rounded-xl border-2"
            style={{ background: "#FCE3E1", borderColor: "#568F87" }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: "#064232" }}
              >
                i
              </div>
              <div>
                <h4
                  className="font-semibold mb-2 text-sm"
                  style={{ color: "#064232" }}
                >
                  Thông tin về điểm rèn luyện
                </h4>
                <ul className="space-y-1 text-sm" style={{ color: "#064232" }}>
                  <li className="flex items-start gap-2">
                    <span className="text-xs mt-1">•</span>
                    <span>
                      Điểm hạnh kiểm ban đầu của mỗi học sinh là 100 điểm
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-xs mt-1">•</span>
                    <span>Điểm trừ sẽ làm giảm điểm hạnh kiểm</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-xs mt-1">•</span>
                    <span>Điểm cộng sẽ được tính vào tổng điểm hạnh kiểm</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-xs mt-1">•</span>
                    <span>
                      Xem nội quy bản PDF:{" "}
                      <Link
                        to="/points/rules-pdf"
                        className="underline text-blue-700"
                      >
                        mở trang nội quy PDF
                      </Link>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default StudentPoints;
