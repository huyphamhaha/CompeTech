import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  Plus,
  Search,
  Filter,
  Users,
  Award,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  UserCheck,
  UserX,
  X,
} from "lucide-react";

function StudentPointsManagement() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [rules, setRules] = useState([]);
  const [studentPoints, setStudentPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showAddPointsModal, setShowAddPointsModal] = useState(false);
  const [pointsType, setPointsType] = useState("penalty"); // penalty or reward
  const [selectedRules, setSelectedRules] = useState([]); // Thay đổi từ selectedRule thành selectedRules array

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  const [approvedEvidence, setApprovedEvidence] = useState([]);

  const classOptions = [
    "Tất cả",
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

  useEffect(() => {
    fetchData();
  }, []);

  // Reset quy tắc khi chuyển loại điểm
  useEffect(() => {
    setSelectedRules([]); // Thay đổi từ setSelectedRule("") thành setSelectedRules([])
  }, [pointsType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStudents(),
        fetchRules(),
        fetchStudentPoints(),
        fetchApprovedEvidence(),
      ]);
    } catch (error) {
      // Silent error handling for production
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const studentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));

      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching students:", error);
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

  const fetchStudentPoints = async () => {
    try {
      const pointsRef = collection(db, "studentPoints");
      const q = query(pointsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const pointsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        awardedAt: doc.data().awardedAt?.toDate?.() || null,
      }));

      setStudentPoints(pointsData);
    } catch (error) {
      console.error("Error fetching student points:", error);
    }
  };

  const fetchApprovedEvidence = async () => {
    try {
      const evidenceRef = collection(db, "evidence");
      const q = query(
        evidenceRef,
        where("status", "==", "approved"),
        orderBy("reviewedAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      const evidenceData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate?.() || new Date(),
        reviewedAt: doc.data().reviewedAt?.toDate?.() || null,
      }));

      // Kiểm tra và sửa dữ liệu evidence nếu cần
      const cleanedEvidenceData = evidenceData.map((evidence) => {
        // Nếu evidence không có uid nhưng có studentId, thêm uid
        if (!evidence.uid && evidence.studentId) {
          evidence.uid = evidence.studentId; // Giả sử studentId cũ là UID
        }
        return evidence;
      });

      console.log("Fetched approved evidence:", cleanedEvidenceData);
      setApprovedEvidence(cleanedEvidenceData);
    } catch (error) {
      // Silent error handling for production
    }
  };

  const getStudentTotalPoints = (studentId) => {
    // Tính điểm từ studentPoints collection
    const studentPointsList = studentPoints.filter(
      (point) => point.studentId === studentId
    );
    let total = 100; // Điểm mặc định

    studentPointsList.forEach((point) => {
      if (point.status === "approved") {
        total += point.points;
      }
    });

    // Tính điểm từ evidence đã được duyệt
    // Tìm theo cả studentId và uid
    const approvedEvidenceList = approvedEvidence.filter(
      (evidence) =>
        evidence.studentId === studentId || evidence.uid === studentId
    );

    approvedEvidenceList.forEach((evidence) => {
      if (evidence.status === "approved" && evidence.approvedPoints) {
        total += evidence.approvedPoints;
      }
    });
    return total;
  };

  const getStudentPointsHistory = (studentId) => {
    // Lấy điểm từ studentPoints
    const pointsHistory = studentPoints
      .filter((point) => point.studentId === studentId)
      .map((point) => ({
        ...point,
        source: "manual",
        date: point.awardedAt || point.createdAt,
      }));

    // Lấy điểm từ evidence đã được duyệt
    const evidenceHistory = approvedEvidence
      .filter(
        (evidence) =>
          evidence.studentId === studentId || evidence.uid === studentId
      )
      .map((evidence) => ({
        id: evidence.id,
        studentId: evidence.studentId || evidence.uid,
        ruleId: evidence.ruleId,
        ruleCode: evidence.ruleCode,
        type: "reward",
        points: evidence.approvedPoints,
        description: evidence.ruleDescription,
        status: evidence.status,
        createdAt: evidence.submittedAt,
        awardedAt: evidence.reviewedAt,
        createdBy: "evidence",
        source: "evidence",
        title: evidence.title,
        date: evidence.reviewedAt || evidence.submittedAt,
      }));

    // Gộp và sắp xếp theo ngày
    const allHistory = [...pointsHistory, ...evidenceHistory];
    return allHistory.sort((a, b) => {
      const dateA = a.date;
      const dateB = b.date;
      return dateB - dateA;
    });
  };

  const handleAddPoints = async () => {
    if (selectedStudents.length === 0) {
      alert("Vui lòng chọn ít nhất một học sinh");
      return;
    }

    if (selectedRules.length === 0) {
      // Thay đổi từ !selectedRule thành selectedRules.length === 0
      alert("Vui lòng chọn ít nhất một quy tắc từ nội quy");
      return;
    }

    // Kiểm tra tất cả quy tắc đã chọn có phù hợp với loại điểm không
    const invalidRules = selectedRules.filter((ruleId) => {
      const rule = rules.find((r) => r.id === ruleId);
      return rule && rule.type !== pointsType;
    });

    if (invalidRules.length > 0) {
      alert(
        `Có ${invalidRules.length} quy tắc không phù hợp với loại điểm ${
          pointsType === "penalty" ? "trừ" : "cộng"
        }. Vui lòng kiểm tra lại.`
      );
      return;
    }

    try {
      const pointsData = [];

      // Tạo điểm cho từng học sinh với từng quy tắc đã chọn
      for (const studentId of selectedStudents) {
        for (const ruleId of selectedRules) {
          const rule = rules.find((r) => r.id === ruleId);
          if (rule) {
            pointsData.push({
              studentId,
              ruleId: ruleId,
              ruleCode: rule.code,
              type: pointsType,
              points: rule.points,
              description: rule.description,
              status: "approved",
              createdAt: new Date(),
              awardedAt: new Date(),
              createdBy: "admin",
            });
          }
        }
      }

      // Thêm điểm cho từng học sinh
      for (const pointData of pointsData) {
        await addDoc(collection(db, "studentPoints"), pointData);
      }

      // Reset form
      setSelectedStudents([]);
      setShowAddPointsModal(false);
      setSelectedRules([]); // Thay đổi từ setSelectedRule("") thành setSelectedRules([])

      // Refresh data
      fetchStudentPoints();

      // Thông báo thành công
      alert(
        `Đã thêm điểm thành công cho ${selectedStudents.length} học sinh với ${selectedRules.length} quy tắc!`
      );
    } catch (error) {
      alert("Có lỗi xảy ra khi thêm điểm");
    }
  };

  const handleApprovePoints = async (pointId) => {
    try {
      await updateDoc(doc(db, "studentPoints", pointId), {
        status: "approved",
        updatedAt: new Date(),
      });
      fetchStudentPoints();
    } catch (error) {
      // Silent error handling for production
    }
  };

  const handleRejectPoints = async (pointId) => {
    try {
      await updateDoc(doc(db, "studentPoints", pointId), {
        status: "rejected",
        updatedAt: new Date(),
      });
      fetchStudentPoints();
    } catch (error) {
      // Silent error handling for production
    }
  };

  const handleEditPoint = (point) => {
    setEditingPoint(point);
    setShowEditModal(true);
  };

  const handleViewDetail = (student) => {
    navigate(`/student/${student.id}`);
  };

  const handleDeletePoint = async (pointId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa điểm này?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "studentPoints", pointId));
      alert("Đã xóa điểm thành công!");
      fetchStudentPoints();
      fetchData();
    } catch (error) {
      alert("Có lỗi xảy ra khi xóa điểm!");
    }
  };

  const handleUpdatePoint = async () => {
    if (!editingPoint) return;

    // Validation
    if (!editingPoint.points || editingPoint.points === 0) {
      alert("Vui lòng nhập điểm hợp lệ");
      return;
    }

    if (!editingPoint.description || editingPoint.description.trim() === "") {
      alert("Vui lòng nhập mô tả");
      return;
    }

    try {
      await updateDoc(doc(db, "studentPoints", editingPoint.id), {
        points: editingPoint.points,
        description: editingPoint.description.trim(),
        updatedAt: new Date(),
      });

      alert("Cập nhật điểm thành công!");
      setShowEditModal(false);
      setEditingPoint(null);
      fetchStudentPoints();
    } catch (error) {
      console.error("Error updating point:", error);
      alert("Có lỗi xảy ra khi cập nhật điểm: " + error.message);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      !searchTerm ||
      student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass =
      !selectedClass ||
      selectedClass === "Tất cả" ||
      student.className === selectedClass;

    return matchesSearch && matchesClass;
  });

  const filteredRules = rules.filter((rule) => rule.type === pointsType);

  // Hàm để thêm/xóa quy tắc khỏi danh sách đã chọn
  const toggleRuleSelection = (ruleId) => {
    setSelectedRules((prev) => {
      if (prev.includes(ruleId)) {
        return prev.filter((id) => id !== ruleId);
      } else {
        return [...prev, ruleId];
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Quản lý Điểm Học sinh
                </h1>
                <p className="text-gray-600 mt-1">
                  Thêm điểm cộng/trừ cho học sinh
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchData}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <RefreshCw size={20} />
                  Làm mới
                </button>

                <button
                  onClick={() => setShowAddPointsModal(true)}
                  disabled={selectedStudents.length === 0}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    selectedStudents.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  <Plus size={20} />
                  Thêm điểm ({selectedStudents.length})
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm theo tên, mã số..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lớp
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {classOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setSelectedStudents([])}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Bỏ chọn tất cả
                </button>
              </div>
            </div>
          </div>

          {/* Students List */}
          <div className="px-6 py-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Đang tải...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((student) => {
                  const totalPoints = getStudentTotalPoints(student.id);
                  const pointsHistory = getStudentPointsHistory(student.id);
                  const isSelected = selectedStudents.includes(student.id);

                  return (
                    <div
                      key={student.id}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedStudents(
                            selectedStudents.filter((id) => id !== student.id)
                          );
                        } else {
                          setSelectedStudents([
                            ...selectedStudents,
                            student.id,
                          ]);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {student.firstName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {student.studentId}
                          </p>
                          <p className="text-sm text-gray-500">
                            {student.className}
                          </p>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${
                              totalPoints >= 80
                                ? "text-green-600"
                                : totalPoints >= 60
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {totalPoints} điểm
                          </div>
                        </div>
                      </div>

                      {/* View Detail Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Ngăn chặn việc chọn học sinh
                          handleViewDetail(student);
                        }}
                        className="mt-3 w-full px-3 py-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye size={14} />
                        Xem chi tiết
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Add Points Modal */}
        {showAddPointsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Thêm điểm cho học sinh</h2>
                <button
                  onClick={() => setShowAddPointsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Hướng dẫn sử dụng */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                    i
                  </div>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Hướng dẫn thêm điểm:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Chọn loại điểm (cộng/trừ)</li>
                      <li>Chọn một hoặc nhiều quy tắc từ nội quy đã tạo</li>
                      <li>Chọn học sinh cần thêm điểm</li>
                      <li>Bấm vào quy tắc đã chọn để loại bỏ nếu cần</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại điểm
                  </label>
                  <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setPointsType("penalty");
                        setSelectedRules([]);
                      }}
                      className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                        pointsType === "penalty"
                          ? "bg-white text-red-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Minus size={16} />
                        Điểm trừ
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPointsType("reward");
                        setSelectedRules([]);
                      }}
                      className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                        pointsType === "reward"
                          ? "bg-white text-green-600 shadow-sm"
                          : "text-gray-900"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Award size={16} />
                        Điểm cộng
                      </div>
                    </button>
                  </div>
                </div>

                {/* Rule Selection - Modern Table Layout */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Chọn quy tắc từ nội quy đã tạo (có thể chọn nhiều)
                  </label>

                  {filteredRules.length === 0 ? (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
                      <p className="text-sm text-orange-800">
                        💡 Chưa có nội quy{" "}
                        {pointsType === "penalty" ? "điểm trừ" : "điểm cộng"}{" "}
                        nào. Vui lòng tạo trong tab "Nội quy" trước.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300 bg-white rounded-lg overflow-hidden shadow-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gray-100">
                              Mô tả
                            </th>
                            <th className="border border-gray-300 px-3 py-3 text-center text-sm font-semibold text-gray-700 bg-gray-100">
                              Mã quy tắc
                            </th>
                            <th className="border border-gray-300 px-3 py-3 text-center text-sm font-semibold text-gray-700 bg-gray-100">
                              Điểm
                            </th>
                            <th className="border border-gray-300 px-3 py-3 text-center text-sm font-semibold text-gray-700 bg-gray-100">
                              Chọn
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRules.map((rule, index) => {
                            const isSelected = selectedRules.includes(rule.id);
                            return (
                              <tr
                                key={rule.id}
                                className={`hover:bg-gray-50 cursor-pointer ${
                                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                } ${
                                  isSelected ? "bg-blue-50 border-blue-200" : ""
                                }`}
                                onClick={() => toggleRuleSelection(rule.id)}
                              >
                                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-800 align-top">
                                  <div className="flex items-start gap-2">
                                    <span className="text-red-500 font-medium text-xs">
                                      {index + 1})
                                    </span>
                                    <span className="leading-relaxed">
                                      {rule.description}
                                    </span>
                                  </div>
                                </td>
                                <td className="border border-gray-300 px-3 py-3 text-center text-sm text-gray-600 font-medium">
                                  {rule.code}
                                </td>
                                <td className="border border-gray-300 px-3 py-3 text-center">
                                  <span
                                    className={`text-lg font-bold ${
                                      rule.points > 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {rule.points > 0
                                      ? `+${rule.points}`
                                      : rule.points}
                                  </span>
                                </td>
                                <td className="border border-gray-300 px-3 py-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() =>
                                      toggleRuleSelection(rule.id)
                                    }
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Selected Students */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Học sinh được chọn ({selectedStudents.length})
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                    {selectedStudents.map((studentId) => {
                      const student = students.find((s) => s.id === studentId);
                      return (
                        <div
                          key={studentId}
                          className="text-sm text-gray-700 py-1"
                        >
                          {student?.firstName} - {student?.studentId} -{" "}
                          {student?.className}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowAddPointsModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleAddPoints}
                    disabled={selectedRules.length === 0} // Thay đổi từ !selectedRule thành selectedRules.length === 0
                    className={`px-4 py-2 rounded-md transition-colors ${
                      selectedRules.length === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    Thêm điểm ({selectedRules.length} quy tắc)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Point Modal */}
        {showEditModal && editingPoint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Chỉnh sửa điểm</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPoint(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Thông tin học sinh */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Học sinh:</strong>{" "}
                  {students.find((s) => s.id === editingPoint.studentId)
                    ?.firstName || "Không xác định"}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Loại:</strong>{" "}
                  {editingPoint.type === "penalty" ? "Điểm trừ" : "Điểm cộng"}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Điểm {editingPoint.type === "penalty" ? "trừ" : "cộng"}
                  </label>
                  <input
                    type="number"
                    value={editingPoint.points}
                    onChange={(e) =>
                      setEditingPoint({
                        ...editingPoint,
                        points: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={
                      editingPoint.type === "penalty"
                        ? "-2, -4, -6, -8"
                        : "2, 4, 6, 8"
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {editingPoint.type === "penalty"
                      ? "Nhập số âm: -2, -4, -6, -8"
                      : "Nhập số dương: 2, 4, 6, 8"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={editingPoint.description}
                    onChange={(e) =>
                      setEditingPoint({
                        ...editingPoint,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Mô tả lỗi vi phạm hoặc hành vi tốt..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingPoint(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleUpdatePoint}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    Cập nhật điểm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentPointsManagement;
