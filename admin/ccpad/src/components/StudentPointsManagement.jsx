import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase.js";
import { useAuth } from "../contexts/AuthContext";
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
  onSnapshot,
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
  User,
  ChevronRight,
  ChevronDown,
  GraduationCap,
} from "lucide-react";
import rulesService from "../services/rulesService.jsx";

function StudentPointsManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [rules, setRules] = useState([]);
  const [studentPoints, setStudentPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showAddPointsModal, setShowAddPointsModal] = useState(false);
  const [pointsType, setPointsType] = useState("penalty"); // penalty, reward
  const [selectedRules, setSelectedRules] = useState([]); // Thay đổi từ selectedRule thành selectedRules array

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  const [approvedEvidence, setApprovedEvidence] = useState([]);
  const [ruleSearchTerm, setRuleSearchTerm] = useState("");
  const [availableRules, setAvailableRules] = useState([]);
  const [progressiveLevels, setProgressiveLevels] = useState({});
  const [conditionalSelections, setConditionalSelections] = useState({});

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
    if (user) {
      // Tự động set lớp cho giáo viên
      if (user.role === "teacher") {
        setSelectedClass(user.class);
      } else {
        setSelectedClass("Tất cả");
      }
      fetchData();
    }

    // Set up real-time listeners
    const unsubscribeStudents = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const studentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        }));
        setStudents(studentsData);
      },
      (error) => {
        console.error("Error listening to students:", error);
      }
    );

    const unsubscribePoints = onSnapshot(
      collection(db, "studentPoints"),
      (snapshot) => {
        const pointsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          awardedAt: doc.data().awardedAt?.toDate?.() || null,
        }));
        setStudentPoints(pointsData);
      },
      (error) => {
        console.error("Error listening to student points:", error);
      }
    );

    // Add real-time listener for rules
    const unsubscribeRules = onSnapshot(
      collection(db, "rules"),
      (snapshot) => {
        // Refetch rules when Firebase rules change
        fetchRules();
      },
      (error) => {
        console.error("Error listening to rules:", error);
      }
    );

    // Add real-time listener for rules_items
    const unsubscribeRulesItems = onSnapshot(
      collection(db, "rules_items"),
      (snapshot) => {
        // Refetch rules when Firebase rules change
        fetchRules();
      },
      (error) => {
        console.error("Error listening to rules_items:", error);
      }
    );

    // Add real-time listener for criteria_info
    const unsubscribeCriteria = onSnapshot(
      collection(db, "criteria_info"),
      (snapshot) => {
        // Refetch rules when criteria change
        fetchRules();
      },
      (error) => {
        console.error("Error listening to criteria_info:", error);
      }
    );

    // Cleanup listeners on unmount
    return () => {
      unsubscribeStudents();
      unsubscribePoints();
      unsubscribeRules();
      unsubscribeRulesItems();
      unsubscribeCriteria();
    };
  }, [user]);

  // Reset quy tắc khi chuyển loại điểm
  useEffect(() => {
    setSelectedRules([]); // Thay đổi từ setSelectedRule("") thành setSelectedRules([])
    fetchRules(); // Refetch rules when pointsType changes
  }, [pointsType]);

  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  // Helper function to sort rules by code (PC1.1, PC1.2, PC2.1, etc.)
  const sortRulesByCode = (rules) => {
    return rules.sort((a, b) => {
      // Extract category and criterion numbers from code
      const aMatch = a.code.match(/PC(\d+)\.(\d+)/);
      const bMatch = b.code.match(/PC(\d+)\.(\d+)/);

      if (!aMatch || !bMatch) return 0;

      const aCategory = parseInt(aMatch[1]);
      const aCriterion = parseInt(aMatch[2]);
      const bCategory = parseInt(bMatch[1]);
      const bCriterion = parseInt(bMatch[2]);

      // First sort by category (PC1, PC2, PC3...)
      if (aCategory !== bCategory) {
        return aCategory - bCategory;
      }

      // Then sort by criterion within category (PC1.1, PC1.2, PC1.3...)
      return aCriterion - bCriterion;
    });
  };

  // Helper function to organize Firebase data like front-end
  const organizeFirebaseData = (
    firebaseRules,
    firebaseCriteria,
    targetType
  ) => {
    const organizedData = {};

    // Helper function to map codes to categories (same as front-end)
    const getCategoryFromCode = (code) => {
      const codeToCategory = {
        // Yêu nước
        "PC1.1": "yeu_nuoc",
        "PC1.2": "yeu_nuoc",
        "PC1.3": "yeu_nuoc",
        "PC1.4": "yeu_nuoc",
        "PC1.5": "yeu_nuoc",
        // Nhân ái
        "PC2.1": "nhan_ai",
        "PC2.2": "nhan_ai",
        "PC2.3": "nhan_ai",
        "PC2.4": "nhan_ai",
        "PC2.5": "nhan_ai",
        "PC2.6": "nhan_ai",
        // Chăm chỉ
        "PC3.1": "cham_chi",
        "PC3.2": "cham_chi",
        "PC3.3": "cham_chi",
        "PC3.4": "cham_chi",
        "PC3.5": "cham_chi",
        // Trung thực
        "PC4.1": "trung_thuc",
        "PC4.2": "trung_thuc",
        "PC4.3": "trung_thuc",
        "PC4.4": "trung_thuc",
        "PC4.5": "trung_thuc",
        // Trách nhiệm
        "PC5.1": "trach_nhiem",
        "PC5.2": "trach_nhiem",
        "PC5.3": "trach_nhiem",
        "PC5.4": "trach_nhiem",
        "PC5.5": "trach_nhiem",
        "PC5.6": "trach_nhiem",
        "PC5.7": "trach_nhiem",
        "PC5.8": "trach_nhiem",
        "PC5.9": "trach_nhiem",
        "PC5.10": "trach_nhiem",
      };
      return codeToCategory[code] || "unknown";
    };

    const getCategoryName = (categoryKey) => {
      const categoryNames = {
        yeu_nuoc: "Yêu nước",
        nhan_ai: "Nhân ái",
        cham_chi: "Chăm chỉ",
        trung_thuc: "Trung thực",
        trach_nhiem: "Trách nhiệm",
        unknown: "Khác",
      };
      return categoryNames[categoryKey] || "Khác";
    };

    // Create all criteria first (from criteriaRules)
    firebaseCriteria.forEach((criterionInfo) => {
      if (!criterionInfo.code || !criterionInfo.code.trim()) return;

      const categoryKey = getCategoryFromCode(criterionInfo.code);

      // Initialize category if not exists
      if (!organizedData[categoryKey]) {
        organizedData[categoryKey] = {
          name: getCategoryName(categoryKey),
          total_points: 0,
          criteria: {},
        };
      }

      // Create criterion
      organizedData[categoryKey].criteria[criterionInfo.code] = {
        code: criterionInfo.code,
        description: criterionInfo.description || "Không có mô tả",
        point: criterionInfo.point || 0,
        [targetType === "plus" ? "plus" : "minus"]: {},
      };
    });

    // Organize rules by type
    const typeRules = firebaseRules.filter((rule) => rule.type === targetType);

    typeRules.forEach((rule) => {
      if (!rule.parentCode || !rule.parentCode.trim()) return;

      const {
        parentCode,
        code,
        description,
        point,
        pointType,
        conditions,
        levels,
      } = rule;
      const categoryKey = getCategoryFromCode(parentCode);

      // Add rule to criterion
      if (
        organizedData[categoryKey] &&
        organizedData[categoryKey].criteria[parentCode]
      ) {
        const ruleType = targetType === "plus" ? "plus" : "minus";
        organizedData[categoryKey].criteria[parentCode][ruleType][code] = {
          code,
          description,
          point: pointType === "fixed" ? point : pointType,
          pointType,
          conditions: conditions || [],
          levels: levels || [],
          id: rule.id,
          isFirebaseRule: true,
        };
      }
    });

    return organizedData;
  };

  // Test function để kiểm tra Firebase
  const testFirebaseConnection = async () => {
    try {
      console.log("🔍 Testing Firebase connection...");
      const rules = await rulesService.getRulesFromFirebase();
      console.log("📊 All Firebase rules:", rules);

      // Kiểm tra từng rule
      rules.forEach((rule, index) => {
        console.log(`Rule ${index + 1}:`, {
          id: rule.id,
          code: rule.code,
          type: rule.type,
          point: rule.point,
          description: rule.description,
        });
      });

      // Kiểm tra xem có rules nào phù hợp với loại điểm hiện tại không
      const matchingRules = rules.filter((rule) => rule.type === pointsType);
      console.log(
        `🔍 Rules matching current type (${pointsType}):`,
        matchingRules
      );

      // Kiểm tra xem có rules nào có type khác không
      const otherTypes = [...new Set(rules.map((rule) => rule.type))];
      console.log("🔍 All rule types found:", otherTypes);

      alert(
        `Tìm thấy ${rules.length} rules trong Firebase\n${
          matchingRules.length
        } rules phù hợp với loại ${pointsType}\nCác loại rules: ${otherTypes.join(
          ", "
        )}\nKiểm tra console để xem chi tiết`
      );
    } catch (error) {
      console.error("❌ Error testing Firebase:", error);
      alert("Lỗi khi lấy dữ liệu từ Firebase: " + error.message);
    }
  };

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

      // Tạo query dựa trên quyền người dùng
      let q;
      if (user?.role === "teacher") {
        // Giáo viên chỉ lấy học sinh của lớp mình
        q = query(
          usersRef,
          where("className", "==", user.class),
          orderBy("createdAt", "desc")
        );
      } else {
        // Admin lấy tất cả học sinh
        q = query(usersRef, orderBy("createdAt", "desc"));
      }

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
      console.log("🔍 Fetching rules for type:", pointsType);

      // Get rules from Firebase
      const firebaseRules = await rulesService.getRulesFromFirebase();
      console.log("📊 Firebase rules:", firebaseRules);

      // Get criteria from Firebase (like front-end does)
      const firebaseCriteria = await rulesService.getCriteriaFromFirebase();
      console.log("📋 Firebase criteria:", firebaseCriteria);

      // Map admin types to Firebase types
      const typeMapping = {
        reward: "plus", // Admin reward = Firebase plus
        penalty: "minus", // Admin penalty = Firebase minus
      };

      const firebaseType = typeMapping[pointsType];
      console.log(`🔍 Looking for Firebase type: ${firebaseType}`);

      // Organize Firebase data like front-end
      const organizedData = organizeFirebaseData(
        firebaseRules,
        firebaseCriteria,
        firebaseType
      );
      console.log("🏗️ Organized Firebase data:", organizedData);

      // Convert organized data to flat rules array for admin UI
      const transformedRules = [];

      Object.entries(organizedData).forEach(([categoryKey, category]) => {
        Object.entries(category.criteria).forEach(
          ([criterionCode, criterion]) => {
            const ruleType = firebaseType === "plus" ? "plus" : "minus";
            const rules = criterion[ruleType] || {};

            Object.entries(rules).forEach(([ruleCode, rule]) => {
              transformedRules.push({
                id: rule.id || ruleCode,
                code: rule.code,
                description: rule.description,
                points: rule.point,
                pointType: rule.pointType || "fixed",
                levels: rule.levels || [],
                conditions: rule.conditions || [],
                type: pointsType,
                category: category.name,
                categoryKey: categoryKey,
                criterion: criterionCode,
                criterionDescription: criterion.description,
                source: "firebase",
                isFirebaseRule: true,
              });
            });
          }
        );
      });

      console.log("🔄 Transformed rules from Firebase:", transformedRules);

      // Sort rules by code (PC1.1, PC1.2, PC2.1, etc.)
      const sortedRules = sortRulesByCode(transformedRules);

      console.log("🎯 Final Firebase rules:", sortedRules);
      setRules(sortedRules);
      setAvailableRules(sortedRules);
    } catch (error) {
      console.error("❌ Error fetching rules:", error);
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

  // Filter rules based on search term
  const filteredRules = availableRules.filter((rule) => {
    const searchLower = ruleSearchTerm.toLowerCase();
    return (
      rule.description.toLowerCase().includes(searchLower) ||
      rule.code.toLowerCase().includes(searchLower)
    );
  });

  const handleRuleSearch = (searchTerm) => {
    setRuleSearchTerm(searchTerm);
  };

  const handleProgressiveLevelChange = (ruleCode, level) => {
    setProgressiveLevels((prev) => ({
      ...prev,
      [ruleCode]: level,
    }));
  };

  const handleConditionalSelection = (ruleCode, conditionType) => {
    setConditionalSelections((prev) => ({
      ...prev,
      [ruleCode]: conditionType,
    }));
  };

  const getStudentTotalPoints = (studentId) => {
    // Tính điểm từ studentPoints collection
    const studentPointsList = studentPoints.filter(
      (point) => point.studentId === studentId
    );
    let total = 0; // Điểm ban đầu là 0

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
      if (evidence.status === "approved") {
        // Tính điểm từ behaviors - sử dụng dữ liệu từ Firebase
        if (evidence.behaviors && Array.isArray(evidence.behaviors)) {
          evidence.behaviors.forEach((ruleId) => {
            // Tìm behavior trong availableRules (từ Firebase)
            const behavior = availableRules.find((b) => b.code === ruleId);
            if (behavior) {
              total += behavior.points;
            }
          });
        }
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
      alert("Vui lòng chọn ít nhất một quy tắc từ nội quy");
      return;
    }

    try {
      const pointsData = [];

      // Tạo điểm cho từng học sinh với từng quy tắc đã chọn
      for (const studentId of selectedStudents) {
        for (const ruleId of selectedRules) {
          // Find the rule from available rules
          const rule = availableRules.find((r) =>
            pointsType === "behavior" ? r.code === ruleId : r.id === ruleId
          );

          if (!rule) continue;

          let points = rule.points;
          let level = 1;
          let ruleType = "fixed";

          // Handle progressive and conditional rules
          if (rule.pointType === "progressive") {
            ruleType = "progressive";
            const selectedLevel = progressiveLevels[rule.code] || 1;
            const result = await rulesService.applyRule(
              studentId,
              rule.code,
              "progressive",
              { level: selectedLevel }
            );
            if (result.success) {
              points = result.points;
              level = result.level;
            }
          } else if (rule.pointType === "conditional") {
            ruleType = "conditional";
            const selectedCondition =
              conditionalSelections[rule.code] || "không phép";
            const result = await rulesService.applyRule(
              studentId,
              rule.code,
              "conditional",
              {
                conditionType: selectedCondition,
              }
            );
            if (result.success) {
              points = result.points;
            }
          }

          // Fix logic for penalty points - ensure negative values
          if (pointsType === "penalty" && points > 0) {
            points = -Math.abs(points);
          }

          // For behaviors, ensure they are not cumulative
          if (pointsType === "behavior") {
            // Check if student already has this behavior
            const existingBehavior = studentPoints.find(
              (point) =>
                point.studentId === studentId &&
                point.ruleCode === rule.code &&
                point.type === "behavior" &&
                point.status === "approved"
            );

            if (existingBehavior) {
              alert(
                `Học sinh đã có biểu hiện ${rule.code}. Biểu hiện không thể cộng dồn.`
              );
              continue;
            }
          }

          pointsData.push({
            studentId,
            ruleId: ruleId,
            ruleCode: rule.code,
            type: pointsType,
            points: points,
            description: rule.description,
            ruleType: ruleType,
            level: level,
            status: "approved",
            createdAt: new Date(),
            awardedAt: new Date(),
            createdBy: "admin",
          });
        }
      }

      // Thêm điểm cho từng học sinh
      for (const pointData of pointsData) {
        await addDoc(collection(db, "studentPoints"), pointData);
      }

      // Reset form
      setSelectedStudents([]);
      setShowAddPointsModal(false);
      setSelectedRules([]);
      setRuleSearchTerm("");

      // Refresh data
      fetchStudentPoints();

      // Thông báo thành công
      alert(
        `Đã thêm điểm thành công cho ${selectedStudents.length} học sinh với ${
          selectedRules.length
        } ${pointsType === "behavior" ? "biểu hiện" : "quy tắc"} từ Firebase!`
      );
    } catch (error) {
      console.error("Error adding points:", error);
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

    // Enhanced validation
    if (!editingPoint.points || editingPoint.points === 0) {
      alert("Vui lòng nhập điểm hợp lệ");
      return;
    }

    if (!editingPoint.description || editingPoint.description.trim() === "") {
      alert("Vui lòng nhập mô tả");
      return;
    }

    // Validate point type consistency
    if (editingPoint.type === "penalty" && editingPoint.points > 0) {
      alert("Điểm trừ phải là số âm");
      return;
    }

    if (editingPoint.type === "reward" && editingPoint.points < 0) {
      alert("Điểm cộng phải là số dương");
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

  // Helper function để sắp xếp categories theo thứ tự mong muốn
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

    // Thêm các categories khác nếu có
    Object.entries(data).forEach(([categoryName, category]) => {
      if (!categoryOrder.includes(categoryName)) {
        sortedEntries.push([categoryName, category]);
      }
    });

    return sortedEntries;
  };

  // Helper function để sắp xếp criteria theo thứ tự tăng dần (PC1.1, PC1.2, PC1.3, ...)
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

  // Group rules by category and criterion
  const getGroupedRules = () => {
    const grouped = {};

    filteredRules.forEach((rule) => {
      const category = rule.category || "Khác";
      const criterion = rule.criterion || "Khác";

      if (!grouped[category]) {
        grouped[category] = {};
      }
      if (!grouped[category][criterion]) {
        grouped[category][criterion] = {
          code: criterion,
          description: rule.criterionDescription || "",
          rules: [],
        };
      }
      grouped[category][criterion].rules.push(rule);
    });

    // Sắp xếp rules trong mỗi criterion theo thứ tự
    Object.values(grouped).forEach((category) => {
      Object.values(category).forEach((criterion) => {
        criterion.rules.sort((a, b) => {
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
      });
    });

    return grouped;
  };

  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [collapsedCriteria, setCollapsedCriteria] = useState({});

  const toggleCategory = (categoryName) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  const toggleCriterion = (categoryName, criterionCode) => {
    const key = `${categoryName}-${criterionCode}`;
    setCollapsedCriteria((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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
                  Thêm điểm cộng/trừ cho học sinh - Real-time updates
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live updates</span>
                </div>
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
            <div
              className={`grid grid-cols-1 ${
                user?.role === "admin" ? "md:grid-cols-3" : "md:grid-cols-2"
              } gap-4`}
            >
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

              {/* Chỉ hiển thị dropdown lớp cho admin */}
              {user?.role === "admin" && (
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
              )}

              {/* Hiển thị thông tin lớp cho giáo viên */}
              {user?.role === "teacher" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lớp được phân công
                  </label>
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                    <GraduationCap className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-gray-700">{user.class}</span>
                  </div>
                </div>
              )}

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
                              totalPoints >= 85
                                ? "text-green-600"
                                : totalPoints >= 70
                                ? "text-yellow-600"
                                : totalPoints >= 50
                                ? "text-orange-600"
                                : "text-red-600"
                            }`}
                          >
                            {totalPoints} điểm
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {(() => {
                              const pointsHistory = getStudentPointsHistory(
                                student.id
                              );
                              const reward = pointsHistory
                                .filter((p) => p.type === "reward")
                                .reduce((sum, p) => sum + p.points, 0);
                              const penalty = pointsHistory
                                .filter((p) => p.type === "penalty")
                                .reduce(
                                  (sum, p) => sum + Math.abs(p.points),
                                  0
                                );
                              const behavior = pointsHistory
                                .filter((p) => p.type === "behavior")
                                .reduce((sum, p) => sum + p.points, 0);
                              return `Cộng: ${reward} | Trừ: ${penalty} | Biểu hiện: ${behavior}`;
                            })()}
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
            <div className="bg-white rounded-lg p-6 w-full max-w-7xl max-h-[90vh] overflow-y-auto">
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

                {/* Rule Selection - Modern Table Layout */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Chọn quy tắc từ nội quy đã tạo (có thể chọn nhiều)
                  </label>

                  {/* Thông báo về rules mới từ Firebase */}
                  {availableRules.some((rule) => rule.source === "firebase")}

                  {/* Search Bar */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <input
                        type="text"
                        value={ruleSearchTerm}
                        onChange={(e) => handleRuleSearch(e.target.value)}
                        placeholder="Tìm kiếm quy tắc..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {ruleSearchTerm && (
                      <p className="text-sm text-gray-500 mt-1">
                        Tìm thấy {filteredRules.length} kết quả
                      </p>
                    )}
                  </div>

                  {filteredRules.length === 0 ? (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
                      <p className="text-sm text-orange-800">
                        💡 Chưa có nội quy{" "}
                        {pointsType === "penalty" ? "điểm trừ" : "điểm cộng"}{" "}
                        nào trong Firebase. Vui lòng tạo trong trang quản lý nội
                        quy trước.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {getSortedCategories(getGroupedRules()).map(
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
                                  <h3 className="font-semibold text-gray-900">
                                    {categoryName}
                                  </h3>
                                </div>
                              </div>
                            </div>

                            {!collapsedCategories[categoryName] && (
                              <div className="p-4 space-y-4">
                                {getSortedCriteria(criteria).map(
                                  ([criterionCode, criterion]) => (
                                    <div
                                      key={criterionCode}
                                      className="border border-gray-200 rounded-lg"
                                    >
                                      <div
                                        className={`px-4 py-3 ${
                                          pointsType === "penalty"
                                            ? "bg-red-50"
                                            : "bg-green-50"
                                        }`}
                                      >
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
                                              <h4 className="font-medium text-gray-900">
                                                {criterion.code}
                                              </h4>
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
                                        <div className="p-4">
                                          {criterion.rules.map(
                                            (rule, index) => {
                                              const isSelected =
                                                selectedRules.includes(rule.id);
                                              return (
                                                <div
                                                  key={rule.id}
                                                  className={`flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 cursor-pointer ${
                                                    isSelected
                                                      ? "bg-blue-50 border-blue-200"
                                                      : "hover:bg-gray-50"
                                                  }`}
                                                  onClick={() =>
                                                    toggleRuleSelection(rule.id)
                                                  }
                                                >
                                                  <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                      <span className="text-sm font-medium text-gray-700">
                                                        {rule.code}
                                                      </span>
                                                      <span
                                                        className={`text-sm font-medium ${
                                                          rule.points > 0
                                                            ? "text-green-600"
                                                            : "text-red-600"
                                                        }`}
                                                      >
                                                        {rule.pointType ===
                                                        "conditional"
                                                          ? "Điều kiện"
                                                          : rule.pointType ===
                                                            "progressive"
                                                          ? "Tiến triển"
                                                          : rule.points > 0
                                                          ? `+${rule.points} điểm`
                                                          : `${rule.points} điểm`}
                                                      </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                      {rule.description}
                                                    </p>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                    {rule.pointType ===
                                                      "progressive" && (
                                                      <select
                                                        value={
                                                          progressiveLevels[
                                                            rule.code
                                                          ] || 1
                                                        }
                                                        onChange={(e) =>
                                                          handleProgressiveLevelChange(
                                                            rule.code,
                                                            parseInt(
                                                              e.target.value
                                                            )
                                                          )
                                                        }
                                                        className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        onClick={(e) =>
                                                          e.stopPropagation()
                                                        }
                                                      >
                                                        {rule.levels ? (
                                                          rule.levels.map(
                                                            (level) => (
                                                              <option
                                                                key={
                                                                  level.level
                                                                }
                                                                value={
                                                                  level.level
                                                                }
                                                              >
                                                                L{level.level}:{" "}
                                                                {level.point}{" "}
                                                                điểm
                                                              </option>
                                                            )
                                                          )
                                                        ) : (
                                                          <>
                                                            <option value={1}>
                                                              L1: -2 điểm
                                                            </option>
                                                            <option value={2}>
                                                              L2: -4 điểm
                                                            </option>
                                                            <option value={3}>
                                                              L3: -6 điểm
                                                            </option>
                                                          </>
                                                        )}
                                                      </select>
                                                    )}
                                                    {rule.pointType ===
                                                      "conditional" && (
                                                      <select
                                                        value={
                                                          conditionalSelections[
                                                            rule.code
                                                          ] ||
                                                          (rule.conditions &&
                                                            rule.conditions[0]
                                                              ?.type) ||
                                                          "không phép"
                                                        }
                                                        onChange={(e) =>
                                                          handleConditionalSelection(
                                                            rule.code,
                                                            e.target.value
                                                          )
                                                        }
                                                        className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                        onClick={(e) =>
                                                          e.stopPropagation()
                                                        }
                                                      >
                                                        {rule.conditions ? (
                                                          rule.conditions.map(
                                                            (condition) => (
                                                              <option
                                                                key={
                                                                  condition.type
                                                                }
                                                                value={
                                                                  condition.type
                                                                }
                                                              >
                                                                {condition.type}
                                                                :{" "}
                                                                {
                                                                  condition.point
                                                                }{" "}
                                                                điểm
                                                              </option>
                                                            )
                                                          )
                                                        ) : (
                                                          <>
                                                            <option value="không phép">
                                                              Không phép: -6
                                                              điểm
                                                            </option>
                                                            <option value="có phép">
                                                              Có phép: -1 điểm
                                                            </option>
                                                          </>
                                                        )}
                                                      </select>
                                                    )}
                                                    <input
                                                      type="checkbox"
                                                      checked={isSelected}
                                                      onChange={() =>
                                                        toggleRuleSelection(
                                                          rule.id
                                                        )
                                                      }
                                                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                                                      onClick={(e) =>
                                                        e.stopPropagation()
                                                      }
                                                    />
                                                  </div>
                                                </div>
                                              );
                                            }
                                          )}
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
