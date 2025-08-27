import React, { useState, useEffect } from "react";
import { db } from "../firebase.js";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Header from "../Header/header.jsx";
import {
  AlertTriangle,
  Award,
  Minus,
  BookOpen,
  Eye,
  Clock,
} from "lucide-react";

function RulesView() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("penalty");

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const rulesRef = collection(db, "rules");
      const q = query(rulesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const rulesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));

      setRules(rulesData);
    } catch (error) {
      console.error("Error fetching rules:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRules = rules.filter((rule) => rule.type === activeTab);

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
                <BookOpen className="w-6 h-6" style={{ color: "#064232" }} />
              </div>
            </div>
            <h1
              className="text-3xl sm:text-4xl font-extrabold leading-tight"
              style={{ color: "#064232" }}
            >
              Nội quy Nhà trường
            </h1>
            <p
              className="mt-3 text-lg max-w-2xl mx-auto"
              style={{ color: "#064232CC" }}
            >
              Quy định về điểm cộng và điểm trừ hạnh kiểm
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-6 ">
            <div
              className="w-full mx-auto flex space-x-1 bg-white p-1 rounded-xl shadow-lg border"
              style={{ borderColor: "#568F87" }}
            >
              <button
                onClick={() => setActiveTab("penalty")}
                className={`w-full flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === "penalty"
                    ? "bg-red-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Minus size={16} />
                  Điểm trừ
                </div>
              </button>
              <button
                onClick={() => setActiveTab("reward")}
                className={`w-full flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === "reward"
                    ? "bg-green-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Award size={16} />
                  Điểm cộng
                </div>
              </button>
            </div>
          </div>

          {/* Rules Content */}
          <div
            className="bg-white rounded-2xl shadow-lg border p-6"
            style={{ borderColor: "#568F87" }}
          >
            {loading ? (
              <div className="text-center py-8">
                <div
                  className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto"
                  style={{ borderColor: "#064232" }}
                ></div>
                <p className="mt-3" style={{ color: "#064232" }}>
                  Đang tải nội quy...
                </p>
              </div>
            ) : filteredRules.length === 0 ? (
              <div className="text-center py-8">
                <div className="mb-3">
                  {activeTab === "penalty" ? (
                    <AlertTriangle
                      size={48}
                      className="mx-auto"
                      style={{ color: "#064232" }}
                    />
                  ) : (
                    <Award
                      size={48}
                      className="mx-auto"
                      style={{ color: "#064232" }}
                    />
                  )}
                </div>
                <h3
                  className="text-lg font-medium mb-2"
                  style={{ color: "#064232" }}
                >
                  Chưa có nội quy{" "}
                  {activeTab === "penalty" ? "điểm trừ" : "điểm cộng"}
                </h3>
                <p style={{ color: "#064232CC" }}>
                  Nội quy sẽ được cập nhật sớm nhất
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary */}
                <div
                  className={`p-4 rounded-xl border-2 ${
                    activeTab === "penalty"
                      ? "border-red-200 bg-red-50"
                      : "border-green-200 bg-green-50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {activeTab === "penalty" ? (
                      <AlertTriangle className="text-red-600" size={20} />
                    ) : (
                      <Award className="text-green-600" size={20} />
                    )}
                    <h3
                      className="text-lg font-semibold"
                      style={{ color: "#064232" }}
                    >
                      Tổng quan{" "}
                      {activeTab === "penalty" ? "điểm trừ" : "điểm cộng"}
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {activeTab === "penalty"
                      ? "Các vi phạm sẽ bị trừ điểm hạnh kiểm theo mức độ nghiêm trọng. Điểm hạnh kiểm ban đầu là 100 điểm."
                      : "Các hành vi tốt sẽ được cộng điểm hạnh kiểm để khuyến khích học sinh phát triển tích cực."}
                  </p>
                </div>

                {/* Rules List */}
                <div className="space-y-4">
                  {filteredRules.map((rule, index) => (
                    <div
                      key={rule.id}
                      className={`p-4 rounded-xl border-2 ${
                        rule.type === "penalty"
                          ? "border-red-200 bg-red-50"
                          : "border-green-200 bg-green-50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                              rule.type === "penalty"
                                ? "bg-red-500"
                                : "bg-green-500"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <h4
                              className="text-lg font-semibold"
                              style={{ color: "#064232" }}
                            >
                              {rule.code}
                            </h4>
                            <p
                              className="text-xs"
                              style={{ color: "#064232CC" }}
                            >
                              Mã quy tắc
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-2xl font-bold ${
                              rule.type === "penalty"
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {(rule.points > 0
                              ? `+${rule.points}`
                              : rule.points) + " điểm"}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-800 leading-relaxed">
                          {rule.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Note */}
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
                        Thông tin quan trọng
                      </h4>
                      <ul
                        className="space-y-1 text-sm"
                        style={{ color: "#064232" }}
                      >
                        <li className="flex items-start gap-2">
                          <span className="text-xs mt-1">•</span>
                          <span>
                            Điểm hạnh kiểm ban đầu của mỗi học sinh là 100 điểm
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-xs mt-1">•</span>
                          <span>Các vi phạm có thể được cộng dồn điểm trừ</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-xs mt-1">•</span>
                          <span>
                            Điểm cộng sẽ được tính vào tổng điểm hạnh kiểm
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-xs mt-1">•</span>
                          <span>
                            Học sinh có thể xem lịch sử điểm của mình trong phần
                            "Điểm rèn luyện"
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default RulesView;
