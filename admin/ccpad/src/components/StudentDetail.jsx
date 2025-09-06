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
  addDoc,
  updateDoc,
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
  CheckSquare,
  Square,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import rulesService from "../services/rulesService.jsx";
import ExportWordButton from "./ExportWordButton.jsx";

function StudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [points, setPoints] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // all, reward, penalty, behavior
  const [showAddPointsModal, setShowAddPointsModal] = useState(false);
  const [newPoint, setNewPoint] = useState({
    type: "reward",
    points: "",
    description: "",
    ruleId: "",
  });
  const [behaviors, setBehaviors] = useState([]);
  const [selectedBehaviors, setSelectedBehaviors] = useState([]);
  const [showBehaviorsModal, setShowBehaviorsModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [collapsedCriteria, setCollapsedCriteria] = useState({});

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
        fetchBehaviors(),
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

  const fetchBehaviors = async () => {
    try {
      // Chỉ lấy behaviors từ Firebase
      const firebaseRules = await rulesService.getRulesFromFirebase();
      const firebaseBehaviors = firebaseRules.filter(
        (rule) => rule.type === "behaviors"
      );

      // Lấy criteria từ Firebase để có thông tin đầy đủ
      const firebaseCriteria = await rulesService.getCriteriaFromFirebase();

      // Tổ chức behaviors từ Firebase theo cấu trúc
      const allBehaviors = [];

      firebaseBehaviors.forEach((firebaseBehavior) => {
        // Tìm criterion tương ứng
        const criterion = firebaseCriteria.find(
          (c) => c.code === firebaseBehavior.parentCode
        );

        allBehaviors.push({
          code: firebaseBehavior.code,
          description: firebaseBehavior.description,
          point: firebaseBehavior.point,
          pointType: firebaseBehavior.pointType || "fixed",
          conditions: firebaseBehavior.conditions || [],
          levels: firebaseBehavior.levels || [],
          category: criterion?.categoryName || criterion?.category || "Khác",
          categoryKey: "firebase",
          criterion: firebaseBehavior.parentCode || "Firebase",
          criterionDescription:
            criterion?.description || firebaseBehavior.description,
          isFirebaseRule: true,
          id: firebaseBehavior.id,
        });
      });

      setBehaviors(allBehaviors);

      // Không cần set selectedBehaviors nữa vì đã chuyển sang sử dụng points trực tiếp
      // selectedBehaviors sẽ được tính toán từ points khi cần thiết
    } catch (error) {
      console.error("Error fetching behaviors:", error);
    }
  };

  const handleDeletePoint = async (pointId) => {
    // Tìm điểm cần xóa để kiểm tra loại
    const pointToDelete = points.find((p) => p.id === pointId);

    if (!pointToDelete) {
      alert("Không tìm thấy điểm cần xóa!");
      return;
    }

    // Không cho phép xóa điểm biểu hiện từ bảng lịch sử
    if (pointToDelete.type === "behavior") {
      alert(
        "Điểm biểu hiện chỉ có thể quản lý trong phần 'Quản lý biểu hiện'!"
      );
      return;
    }

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

  const handleToggleBehavior = async (behavior) => {
    try {
      // Kiểm tra xem behavior đã được chọn chưa (từ studentPoints)
      const isSelected = points.some(
        (point) =>
          point.studentId === studentId &&
          point.ruleCode === behavior.code &&
          point.type === "behavior" &&
          point.status === "approved"
      );

      if (isSelected) {
        // Bỏ chọn behavior - xóa từ studentPoints
        const selectedPoint = points.find(
          (point) =>
            point.studentId === studentId &&
            point.ruleCode === behavior.code &&
            point.type === "behavior" &&
            point.status === "approved"
        );

        if (selectedPoint) {
          await deleteDoc(doc(db, "studentPoints", selectedPoint.id));
        }
      } else {
        // Chọn behavior - thêm vào studentPoints
        const pointData = {
          studentId,
          ruleId: behavior.id || behavior.code,
          ruleCode: behavior.code,
          type: "behavior",
          points: behavior.pointType === "conditional" ? 0 : behavior.point,
          description: behavior.description,
          ruleType: behavior.pointType || "fixed",
          level: 1,
          status: "approved",
          createdAt: new Date(),
          awardedAt: new Date(),
          createdBy: "admin",

          // Thêm fields cho behavior
          behaviorCode: behavior.code,
          category: behavior.category,
          criterion: behavior.criterion,
          conditions: behavior.conditions || [],
          levels: behavior.levels || [],
        };

        await addDoc(collection(db, "studentPoints"), pointData);
      }

      await fetchPoints(); // Refresh points để cập nhật UI
    } catch (error) {
      console.error("Error toggling behavior:", error);
      alert("Có lỗi xảy ra khi thay đổi biểu hiện!");
    }
  };

  const getSelectedBehaviorsTotal = () => {
    // Tính từ studentPoints (cho hiển thị tổng điểm)
    const pointsTotal = points.reduce((total, point) => {
      if (point.status === "approved" && point.type === "behavior") {
        return total + (point.points || 0);
      }
      return total;
    }, 0);

    return pointsTotal;
  };

  // Helper function để lấy behaviors đã chọn từ points
  const getSelectedBehaviors = () => {
    return points.filter(
      (point) =>
        point.studentId === studentId &&
        point.type === "behavior" &&
        point.status === "approved"
    );
  };

  const toggleCategory = (categoryName) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  const toggleCriterion = (categoryName, criterionCode) => {
    setCollapsedCriteria((prev) => ({
      ...prev,
      [`${categoryName}-${criterionCode}`]:
        !prev[`${categoryName}-${criterionCode}`],
    }));
  };

  // Sắp xếp categories theo thứ tự mong muốn
  const getSortedCategories = (data) => {
    const categoryOrder = [
      "Yêu nước",
      "Nhân ái",
      "Chăm chỉ",
      "Trung thực",
      "Trách nhiệm",
    ];
    const sortedEntries = [];

    categoryOrder.forEach((categoryName) => {
      if (data[categoryName]) {
        sortedEntries.push([categoryName, data[categoryName]]);
      }
    });

    return sortedEntries;
  };

  // Sắp xếp criteria theo thứ tự tăng dần (PC1.1, PC1.2, PC1.3, ...)
  const getSortedCriteria = (criteria) => {
    if (!criteria || typeof criteria !== "object") {
      return [];
    }

    return Object.entries(criteria).sort(([a], [b]) => {
      // Sắp xếp theo thứ tự số học: PC1.1, PC1.2, PC1.10, PC2.1, PC2.2, ...
      const aMatch = a.match(/PC(\d+)\.(\d+)/);
      const bMatch = b.match(/PC(\d+)\.(\d+)/);

      if (aMatch && bMatch) {
        const aCategory = parseInt(aMatch[1]);
        const aSub = parseInt(aMatch[2]);
        const bCategory = parseInt(bMatch[1]);
        const bSub = parseInt(bMatch[2]);

        // So sánh category trước
        if (aCategory !== bCategory) {
          return aCategory - bCategory;
        }
        // Nếu cùng category thì so sánh sub
        return aSub - bSub;
      }

      // Fallback về localeCompare nếu không match pattern
      return a.localeCompare(b);
    });
  };

  // Sắp xếp behaviors theo thứ tự tăng dần
  const getSortedBehaviors = (behaviors) => {
    if (!behaviors || !Array.isArray(behaviors)) {
      return [];
    }

    return behaviors.sort((a, b) => {
      // Sắp xếp theo thứ tự số học: PC1.1.A1, PC1.1.A2, PC1.1.A10, PC1.2.A1, ...
      const aMatch = a.code.match(/PC(\d+)\.(\d+)\.([A-Z])(\d+)/);
      const bMatch = b.code.match(/PC(\d+)\.(\d+)\.([A-Z])(\d+)/);

      if (aMatch && bMatch) {
        const aCategory = parseInt(aMatch[1]);
        const aSub = parseInt(aMatch[2]);
        const aType = aMatch[3];
        const aItem = parseInt(aMatch[4]);
        const bCategory = parseInt(bMatch[1]);
        const bSub = parseInt(bMatch[2]);
        const bType = bMatch[3];
        const bItem = parseInt(bMatch[4]);

        // So sánh category trước
        if (aCategory !== bCategory) {
          return aCategory - bCategory;
        }
        // Nếu cùng category thì so sánh sub
        if (aSub !== bSub) {
          return aSub - bSub;
        }
        // Nếu cùng sub thì so sánh type (A, B, C)
        if (aType !== bType) {
          return aType.localeCompare(bType);
        }
        // Nếu cùng type thì so sánh item number
        return aItem - bItem;
      }

      // Fallback về localeCompare nếu không match pattern
      return a.code.localeCompare(b.code);
    });
  };

  const getBehaviorsByCategory = () => {
    const grouped = {};
    behaviors.forEach((behavior) => {
      const category = behavior.category || "Khác";
      const criterion = behavior.criterion || "Khác";

      if (!grouped[category]) {
        grouped[category] = {};
      }
      if (!grouped[category][criterion]) {
        grouped[category][criterion] = {
          code: criterion,
          description: behavior.criterionDescription || "",
          behaviors: [],
        };
      }
      grouped[category][criterion].behaviors.push(behavior);
    });

    // Sắp xếp behaviors trong mỗi criterion
    Object.values(grouped).forEach((category) => {
      Object.values(category).forEach((criterion) => {
        criterion.behaviors = getSortedBehaviors(criterion.behaviors);
      });
    });

    return grouped;
  };

  const getPointsSummary = () => {
    const summary = {
      totalReward: 0,
      totalPenalty: 0,
      totalBehavior: 0,
      netPoints: 0,
    };

    // Tính điểm từ studentPoints
    points.forEach((point) => {
      if (point.status === "approved") {
        if (point.type === "reward") {
          summary.totalReward += point.points || 0;
        } else if (point.type === "penalty") {
          summary.totalPenalty += Math.abs(point.points) || 0;
        } else if (point.type === "behavior") {
          summary.totalBehavior += point.points || 0;
        }
      }
    });

    // Tính điểm từ evidence đã được duyệt
    evidence.forEach((item) => {
      if (item.status === "approved" && item.approvedPoints) {
        summary.totalReward += item.approvedPoints;
      }
    });

    // Tính điểm tổng: Điểm cộng + Điểm biểu hiện - Điểm trừ
    summary.netPoints =
      summary.totalReward + summary.totalBehavior - summary.totalPenalty;
    return summary;
  };

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

  const getFilteredPointsHistory = () => {
    const allHistory = getStudentPointsHistory();
    if (activeTab === "all") return allHistory;
    return allHistory.filter((point) => point.type === activeTab);
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
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              Chi tiết học sinh: {student.firstName}
            </h1>
            <ExportWordButton
              student={student}
              points={points}
              evidence={evidence}
              behaviors={behaviors}
            />
          </div>
        </div>

        {/* Student Info & Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
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
                <p className="text-gray-900">{student.firstName}</p>
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

          {/* Reward Points */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Plus size={24} className="text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Điểm cộng</h3>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                +{pointsSummary.totalReward}
              </div>
              <p className="text-sm text-gray-600">
                {
                  points.filter(
                    (p) => p.status === "approved" && p.type === "reward"
                  ).length
                }{" "}
                lần
              </p>
            </div>
          </div>

          {/* Penalty Points */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Minus size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Điểm trừ</h3>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-2">
                -{pointsSummary.totalPenalty}
              </div>
              <p className="text-sm text-gray-600">
                {
                  points.filter(
                    (p) => p.status === "approved" && p.type === "penalty"
                  ).length
                }{" "}
                lần
              </p>
            </div>
          </div>

          {/* Behavior Points */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <User size={24} className="text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Điểm biểu hiện
              </h3>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                +{getSelectedBehaviorsTotal()}
              </div>
              <p className="text-sm text-gray-600">
                {getSelectedBehaviors().length} biểu hiện
                {points.some(
                  (point) =>
                    point.studentId === studentId &&
                    point.type === "behavior" &&
                    point.status === "approved" &&
                    point.ruleType === "conditional"
                ) && <span className="text-blue-600 ml-1">(có điều kiện)</span>}
              </p>
              <button
                onClick={() => setShowBehaviorsModal(true)}
                className="mt-2 px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
              >
                Quản lý
              </button>
            </div>
          </div>
        </div>

        {/* Total Points Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Award size={24} className="text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Điểm hiện tại</h3>
          </div>
          <div className="text-center">
            <div
              className={`text-3xl font-bold mb-2 ${
                pointsSummary.netPoints >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {pointsSummary.netPoints >= 0
                ? `+${pointsSummary.netPoints}`
                : pointsSummary.netPoints}
            </div>
            <p className="text-sm text-gray-600">Tổng điểm</p>
          </div>
        </div>

        {/* Points History with Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Lịch sử điểm chi tiết
            </h3>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("all")}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === "all"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setActiveTab("reward")}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === "reward"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Điểm cộng
              </button>
              <button
                onClick={() => setActiveTab("behavior")}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === "behavior"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Điểm biểu hiện
              </button>
              <button
                onClick={() => setActiveTab("penalty")}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === "penalty"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Điểm trừ
              </button>
            </div>
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
                {getFilteredPointsHistory().map((point, index) => {
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
                            point.type === "reward"
                              ? "bg-green-100 text-green-800"
                              : point.type === "behavior"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {point.type === "reward"
                            ? "Điểm cộng"
                            : point.type === "behavior"
                            ? "Điểm biểu hiện"
                            : "Điểm trừ"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`text-lg font-bold ${
                            point.type === "penalty"
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {point.type === "penalty"
                            ? point.points
                            : `+${point.points}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {rule?.code || point.ruleCode || "N/A"}
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
                        {point.source === "manual" &&
                        point.type !== "behavior" ? (
                          <button
                            onClick={() => handleDeletePoint(point.id)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
                          >
                            <Trash2 size={14} className="mr-1" />
                            Xóa
                          </button>
                        ) : point.type === "behavior" ? (
                          <span className="text-xs text-purple-600 font-medium">
                            Quản lý trong biểu hiện
                          </span>
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
          {getFilteredPointsHistory().length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {activeTab === "all"
                  ? "Chưa có lịch sử điểm nào"
                  : `Chưa có điểm ${
                      activeTab === "reward"
                        ? "cộng"
                        : activeTab === "behavior"
                        ? "biểu hiện"
                        : "trừ"
                    } nào`}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Hiển thị {getFilteredPointsHistory().length} trong tổng số{" "}
                {getStudentPointsHistory().length} bản ghi
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Behaviors Management Modal */}
      {showBehaviorsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-7xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-800">
                Quản lý biểu hiện - {student.firstName} {student.lastName}
              </h3>
              <button
                onClick={() => setShowBehaviorsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                Thoát
              </button>
            </div>

            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>Lưu ý:</strong> Mỗi biểu hiện chỉ có thể chọn một
                    lần. Tổng điểm biểu hiện hiện tại:{" "}
                    <strong>{getSelectedBehaviorsTotal()}/100</strong>
                    {points.some(
                      (point) =>
                        point.studentId === studentId &&
                        point.type === "behavior" &&
                        point.status === "approved" &&
                        point.ruleType === "conditional"
                    ) && (
                      <span className="text-blue-600 ml-1">
                        (có điểm điều kiện)
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-800">
                    Đã chọn: <strong>{getSelectedBehaviors().length}</strong>{" "}
                    biểu hiện
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {getSortedCategories(getBehaviorsByCategory()).map(
                ([categoryName, criteria]) => (
                  <div
                    key={categoryName}
                    className="border border-gray-200 rounded-lg"
                  >
                    <div
                      className="bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleCategory(categoryName)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {collapsedCategories[categoryName] ? (
                            <ChevronRight size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                          <h4 className="font-medium text-gray-900">
                            {categoryName}
                          </h4>
                        </div>
                        <span className="text-sm text-gray-500">
                          {collapsedCategories[categoryName] ? "▼" : "▲"}
                        </span>
                      </div>
                    </div>

                    {!collapsedCategories[categoryName] && (
                      <div className="p-4 space-y-3">
                        {getSortedCriteria(criteria).map(
                          ([criterionCode, criterion]) => (
                            <div
                              key={criterionCode}
                              className="border border-gray-200 rounded-lg"
                            >
                              <div className="bg-blue-50 px-4 py-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() =>
                                        toggleCriterion(
                                          categoryName,
                                          criterionCode
                                        )
                                      }
                                      className="flex items-center gap-2"
                                    >
                                      {collapsedCriteria[
                                        `${categoryName}-${criterionCode}`
                                      ] ? (
                                        <ChevronRight size={16} />
                                      ) : (
                                        <ChevronDown size={16} />
                                      )}
                                    </button>
                                    <div>
                                      <h5 className="font-medium text-gray-900">
                                        {criterion.code}
                                      </h5>
                                      <p className="text-sm text-gray-600">
                                        {criterion.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {!collapsedCriteria[
                                `${categoryName}-${criterionCode}`
                              ] && (
                                <div className="p-4 space-y-3">
                                  {criterion.behaviors.map((behavior) => {
                                    // Kiểm tra xem behavior đã được chọn chưa (từ studentPoints)
                                    const isSelected = points.some(
                                      (point) =>
                                        point.studentId === studentId &&
                                        point.ruleCode === behavior.code &&
                                        point.type === "behavior" &&
                                        point.status === "approved"
                                    );
                                    return (
                                      <div
                                        key={behavior.code}
                                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                          isSelected
                                            ? "border-green-500 bg-green-50"
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                        }`}
                                        onClick={() =>
                                          handleToggleBehavior(behavior)
                                        }
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="text-sm font-medium text-gray-700">
                                                {behavior.code}
                                              </span>
                                              <span className="text-sm text-green-600 font-medium">
                                                {behavior.pointType ===
                                                "conditional"
                                                  ? "(Điểm có điều kiện)"
                                                  : `+${behavior.point} điểm`}
                                              </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-1">
                                              {behavior.description}
                                            </p>
                                            <div className="text-xs text-gray-500">
                                              <span className="font-medium">
                                                {behavior.criterion}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="ml-4">
                                            {isSelected ? (
                                              <CheckSquare
                                                size={20}
                                                className="text-green-600"
                                              />
                                            ) : (
                                              <Square
                                                size={20}
                                                className="text-gray-400"
                                              />
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
              <button
                onClick={() => setShowBehaviorsModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDetail;
