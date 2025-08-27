import React, { useState } from "react";
import { auth, db } from "../firebase.js";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import {
  User,
  Hash,
  GraduationCap,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

function UserInfoModal({ isOpen, onClose, onComplete }) {
  const [fname, setFname] = useState("");
  const [studentId, setStudentId] = useState("");
  const [className, setClassName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const classOptions = [
    "10A", "10B", "10C",
    "11A", "11B", "11C", 
    "12A", "12B", "12C"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate required fields
    if (!fname.trim() || !studentId.trim() || !className) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      setLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("Không tìm thấy thông tin người dùng");
        setLoading(false);
        return;
      }

      // Update user document in Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        firstName: fname,
        studentId: studentId,
        className: className,
        updatedAt: new Date(),
      });

      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error) {
      console.error("Error updating user info:", error);
      setError("Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        {!success ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-full" style={{ background: "#F5BABB" }}>
                <AlertCircle className="w-6 h-6" style={{ color: "#064232" }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: "#064232" }}>
                  Thông tin bắt buộc
                </h2>
                <p className="text-sm text-gray-600">
                  Vui lòng cập nhật thông tin cá nhân để tiếp tục
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
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
                className="w-full px-6 py-3 font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundImage: "linear-gradient(90deg,#064232,#568F87)",
                  color: "#FFFFFF",
                }}
              >
                {loading ? "Đang cập nhật..." : "Cập nhật thông tin"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="p-3 rounded-full mx-auto mb-4" style={{ background: "#568F87", width: "fit-content" }}>
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: "#064232" }}>
              Cập nhật thành công!
            </h3>
            <p className="text-gray-600">
              Thông tin của bạn đã được cập nhật thành công.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserInfoModal;
