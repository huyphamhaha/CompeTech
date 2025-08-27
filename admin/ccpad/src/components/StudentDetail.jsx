import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase.js";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  ArrowLeft,
  User,
  Award,
  Minus,
  Calendar,
  Edit,
  Trash2,
  Plus,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
} from "lucide-react";

function StudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [points, setPoints] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddPointsModal, setShowAddPointsModal] = useState(false);
  const [newPoint, setNewPoint] = useState({
    type: "reward",
    points: "",
    description: "",
    ruleId: "",
  });

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStudent(),
        fetchPoints(),
        fetchEvidence(),
        fetchRules(),
      ]);
    } catch (error) {
      // Silent error handling for production
    } finally {
      setLoading(false);
    }
  };

  const fetchStudent = async () => {
    try {
      const studentDoc = await getDoc(doc(db, "users", studentId));
      if (studentDoc.exists()) {
        const studentData = { id: studentDoc.id, ...studentDoc.data() };
        setStudent(studentData);
      }
    } catch (error) {
      // Silent error handling for production
    }
  };

  const fetchPoints = async () => {
    try {
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
        awardedAt: doc.data().awardedAt?.toDate?.() || new Date(),
      }));

      setPoints(pointsData);
    } catch (error) {
      // Silent error handling for production
    }
  };

  const fetchEvidence = async () => {
    try {
      const evidenceRef = collection(db, "evidence");
      const q = query(
        evidenceRef,
        where("studentId", "==", studentId),
        orderBy("submittedAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      const evidenceData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate?.() || new Date(),
        reviewedAt: doc.data().reviewedAt?.toDate?.() || new Date(),
      }));

      setEvidence(evidenceData);
    } catch (error) {
      // Silent error handling for production
    }
  };

  const fetchRules = async () => {
    try {
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
      // Silent error handling for production
    }
  };

  const handleDeletePoint = async (pointId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa điểm này?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "studentPoints", pointId));
      fetchPoints();
    } catch (error) {
      alert("Có lỗi xảy ra khi xóa điểm!");
    }
  };

  const getPointsSummary = () => {
    const summary = {
      totalReward: 0,
      totalPenalty: 0,
      netPoints: 0,
    };

    points.forEach((point) => {
      if (point.status === "approved") {
        if (point.type === "reward") {
          summary.totalReward += point.points || 0;
        } else if (point.type === "penalty") {
          summary.totalPenalty += point.points || 0;
        }
      }
    });

    // Tính điểm từ evidence đã được duyệt
    evidence.forEach((item) => {
      if (item.status === "approved" && item.approvedPoints) {
        summary.totalReward += item.approvedPoints;
      }
    });

    summary.netPoints = summary.totalReward - summary.totalPenalty;
    return summary;
  };

  const pointsSummary = getPointsSummary();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin học sinh...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Không tìm thấy học sinh
          </h2>
          <p className="text-gray-600 mb-4">
            Học sinh với ID {studentId} không tồn tại
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const getStudentPointsHistory = () => {
    // Lấy điểm từ studentPoints
    const pointsHistory = points.map((point) => ({
      ...point,
      source: "manual",
      date: point.awardedAt || point.createdAt,
      title: point.description,
    }));

    // Lấy điểm từ evidence đã được duyệt
    const evidenceHistory = evidence.map((item) => ({
      id: item.id,
      studentId: item.studentId,
      ruleId: item.ruleId,
      ruleCode: item.ruleCode,
      type: "reward",
      points: item.approvedPoints,
      description: item.ruleDescription,
      status: item.status,
      createdAt: item.submittedAt,
      awardedAt: item.reviewedAt,
      createdBy: "evidence",
      source: "evidence",
      title: item.title,
      date: item.reviewedAt || item.submittedAt,
    }));

    // Gộp và sắp xếp theo ngày
    const allHistory = [...pointsHistory, ...evidenceHistory];
    return allHistory.sort((a, b) => {
      const dateA = a.date;
      const dateB = b.date;
      return dateB - dateA;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-20">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/points")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Quay lại quản lý điểm
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            Chi tiết học sinh: {student.firstName} {student.lastName}
          </h1>
        </div>

        {/* Student Info & Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Student Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <User size={24} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Thông tin học sinh
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Họ và tên:
                </span>
                <p className="text-gray-900">
                  {student.firstName} {student.lastName}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Mã học sinh:
                </span>
                <p className="text-gray-900 font-mono">{student.studentId}</p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-600">Lớp:</span>
                <p className="text-gray-900">{student.className}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Email:
                </span>
                <p className="text-gray-900">{student.email}</p>
              </div>
            </div>
          </div>

          {/* Points Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Award size={24} className="text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Tổng kết điểm
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tổng điểm:</span>
                <span
                  className={`text-lg font-bold ${
                    pointsSummary.netPoints >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {pointsSummary.netPoints >= 0
                    ? `+${pointsSummary.netPoints}`
                    : pointsSummary.netPoints}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Điểm cộng:</span>
                <span className="text-green-600 font-medium">
                  +{pointsSummary.totalReward}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Điểm trừ:</span>
                <span className="text-red-600 font-medium">
                  -{pointsSummary.totalPenalty}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Số lần cộng:</span>
                <span className="text-green-600 font-medium">
                  {
                    points.filter(
                      (p) => p.status === "approved" && p.type === "reward"
                    ).length
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Số lần trừ:</span>
                <span className="text-red-600 font-medium">
                  {
                    points.filter(
                      (p) => p.status === "approved" && p.type === "penalty"
                    ).length
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tổng số điểm:</span>
                <span className="text-blue-600 font-medium">
                  {points.length + evidence.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Points History */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Lịch sử điểm chi tiết
            </h3>
            <p className="text-sm text-gray-500">
              Lịch sử điểm và minh chứng của học sinh
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Điểm
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã quy tắc
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getStudentPointsHistory().map((point, index) => {
                  const rule = rules.find((r) => r.id === point.ruleId);
                  return (
                    <tr
                      key={point.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">
                            {point.title ||
                              point.description ||
                              rule?.description ||
                              "Không có mô tả"}
                          </div>
                          {point.source === "evidence" && (
                            <div className="text-xs text-blue-600 mt-1">
                              📎 Từ minh chứng
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            point.points > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {point.points > 0 ? "Điểm cộng" : "Điểm trừ"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`text-lg font-bold ${
                            point.points > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {point.points > 0 ? `+${point.points}` : point.points}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {rule?.code || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-500">
                        <div className="flex items-center justify-center gap-1">
                          <Calendar size={14} />
                          {point.date.toLocaleString("vi-VN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {point.source === "manual" ? (
                          <button
                            onClick={() => handleDeletePoint(point.id)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
                          >
                            <Trash2 size={14} className="mr-1" />
                            Xóa
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Không thể xóa
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {getStudentPointsHistory().length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Chưa có lịch sử điểm nào</p>
              <p className="text-sm text-gray-400 mt-2">
                Tổng số: {points.length + evidence.length} bản ghi
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDetail;
