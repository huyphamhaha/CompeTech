import React, { useState, useEffect } from "react";
import { db } from "../firebase.js";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  query,
  where,
  orderBy,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  FileText,
  Image,
  File,
  CheckCircle,
  X,
  Clock,
  AlertCircle,
  Download,
  Eye,
  Filter,
  Search,
  Award,
  User,
  Calendar,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Star,
} from "lucide-react";

const EvidenceManagement = () => {
  const [evidenceList, setEvidenceList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPoints, setSelectedPoints] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState("");
  const [userDetailsMap, setUserDetailsMap] = useState({});

  useEffect(() => {
    fetchEvidence();

    // Set up real-time listener for evidence
    const unsubscribeEvidence = onSnapshot(
      collection(db, "evidence"),
      (snapshot) => {
        const evidenceData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          submittedAt: doc.data().submittedAt?.toDate?.() || new Date(),
          reviewedAt: doc.data().reviewedAt?.toDate?.() || null,
        }));

        // Kiểm tra và sửa dữ liệu cũ nếu cần
        const cleanedEvidenceData = evidenceData.map((evidence) => {
          if (!evidence.uid && evidence.studentId) {
            evidence.uid = evidence.studentId;
          }
          return evidence;
        });

        setEvidenceList(cleanedEvidenceData);
        fetchUserDetailsForEvidence(cleanedEvidenceData);
      },
      (error) => {
        console.error("Error listening to evidence:", error);
      }
    );

    return () => {
      unsubscribeEvidence();
    };
  }, []);

  const fetchEvidence = async () => {
    try {
      setLoading(true);
      const evidenceRef = collection(db, "evidence");
      const q = query(evidenceRef, orderBy("submittedAt", "desc"));
      const querySnapshot = await getDocs(q);

      const evidenceData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate?.() || new Date(),
        reviewedAt: doc.data().reviewedAt?.toDate?.() || null,
      }));

      // Kiểm tra và sửa dữ liệu cũ nếu cần
      const cleanedEvidenceData = evidenceData.map((evidence) => {
        // Nếu evidence không có uid nhưng có studentId, thêm uid
        if (!evidence.uid && evidence.studentId) {
          evidence.uid = evidence.studentId; // Giả sử studentId cũ là UID
        }
        return evidence;
      });

      setEvidenceList(cleanedEvidenceData);

      // Fetch user details for all evidence
      await fetchUserDetailsForEvidence(cleanedEvidenceData);
    } catch (error) {
      // Silent error handling for production
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetailsForEvidence = async (evidenceList) => {
    try {
      // Lấy tất cả UID từ evidence (cả studentId và uid)
      const allUserIds = new Set();
      evidenceList.forEach((evidence) => {
        if (evidence.studentId) allUserIds.add(evidence.studentId);
        if (evidence.uid) allUserIds.add(evidence.uid);
      });

      const userDetailsMap = {};

      for (const userId of allUserIds) {
        try {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            userDetailsMap[userId] = userDoc.data();
          }
        } catch (error) {
          // Silent error handling for production
        }
      }

      setUserDetailsMap(userDetailsMap);
    } catch (error) {
      // Silent error handling for production
    }
  };

  useEffect(() => {
    let filtered = evidenceList;

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (evidence) => evidence.status === statusFilter
      );
    }

    if (searchTerm) {
      filtered = filtered.filter((evidence) => {
        const studentInfo = getStudentInfo(evidence);
        return (
          studentInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          studentInfo.studentId
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          evidence.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          evidence.ruleDescription
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
      });
    }

    setFilteredList(filtered);
  }, [evidenceList, statusFilter, searchTerm]);

  const handleViewEvidence = (evidence) => {
    setSelectedEvidence(evidence);
    setIsModalOpen(true);
  };

  const handleReviewEvidence = (evidence) => {
    setSelectedEvidence(evidence);
    setSelectedPoints(evidence.categoryPoints.toString());
    setRejectionReason("");
    setIsReviewModalOpen(true);
  };

  const handlePreviewFile = (file) => {
    setPreviewFile(file);
    if (file.type.includes("image")) {
      setPreviewType("image");
    } else if (file.type.includes("pdf")) {
      setPreviewType("pdf");
    } else if (file.type.includes("text")) {
      setPreviewType("text");
    } else if (file.type.includes("video")) {
      setPreviewType("video");
    } else {
      setPreviewType("other");
    }
    setIsPreviewOpen(true);
  };

  const handleApprove = async () => {
    const points = parseInt(selectedPoints);
    if (!selectedPoints || isNaN(points) || points <= 0) {
      alert("Vui lòng chọn số điểm phù hợp");
      return;
    }

    setIsProcessing(true);
    try {
      console.log("Approving evidence:", selectedEvidence.id);
      console.log("Selected points:", points);

      // Update evidence status
      await updateDoc(doc(db, "evidence", selectedEvidence.id), {
        status: "approved",
        approvedPoints: points,
        reviewedAt: new Date(),
        reviewedBy: "Admin",
      });

      console.log("Evidence updated successfully");

      // Add points to student with improved logic
      const studentId = selectedEvidence.uid || selectedEvidence.studentId;
      if (!studentId) {
        throw new Error("Không tìm thấy thông tin học sinh");
      }

      const studentPointData = {
        studentId: studentId,
        ruleId: selectedEvidence.ruleId || "unknown",
        ruleCode: selectedEvidence.ruleCode || "unknown",
        type: "reward",
        points: points,
        description:
          selectedEvidence.title ||
          selectedEvidence.ruleDescription ||
          "Minh chứng được duyệt",
        status: "approved",
        createdAt: new Date(),
        awardedAt: new Date(),
        createdBy: "evidence_approval",
        evidenceId: selectedEvidence.id,
        // Add additional metadata
        category: selectedEvidence.category || "evidence",
        categoryPoints: selectedEvidence.categoryPoints || points,
        approvedPoints: points,
      };

      console.log("Student point data:", studentPointData);
      await addDoc(collection(db, "studentPoints"), studentPointData);
      console.log("Student points added successfully");

      await fetchEvidence();
      setIsReviewModalOpen(false);
      setSelectedEvidence(null);
      setSelectedPoints("");
      alert("Đã duyệt minh chứng thành công!");
    } catch (error) {
      console.error("Error approving evidence:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      alert("Có lỗi xảy ra khi duyệt minh chứng: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    setIsProcessing(true);
    try {
      await updateDoc(doc(db, "evidence", selectedEvidence.id), {
        status: "rejected",
        rejectionReason: rejectionReason.trim(),
        reviewedAt: new Date(),
        reviewedBy: "Admin",
      });

      await fetchEvidence();
      setIsReviewModalOpen(false);
      setSelectedEvidence(null);
      setRejectionReason("");
      alert("Đã từ chối minh chứng!");
    } catch (error) {
      console.error("Error rejecting evidence:", error);
      alert("Có lỗi xảy ra khi từ chối minh chứng");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateStudentPoint = async (evidence) => {
    try {
      const studentPointData = {
        studentId: evidence.studentId || evidence.uid,
        ruleId: evidence.ruleId,
        ruleCode: evidence.ruleCode,
        type: "reward",
        points: evidence.approvedPoints,
        description: evidence.ruleDescription,
        status: "approved",
        createdAt: new Date(),
        awardedAt: new Date(),
        createdBy: "evidence",
        evidenceId: evidence.id,
      };

      await addDoc(collection(db, "studentPoints"), studentPointData);
      await updateDoc(doc(db, "evidence", evidence.id), {
        studentPointCreated: true,
        updatedAt: new Date(),
      });

      // Refresh data
      fetchEvidence();
      alert("Đã tạo điểm thành công!");
    } catch (error) {
      alert("Có lỗi xảy ra khi tạo điểm!");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xét duyệt";
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Từ chối";
      default:
        return "Không xác định";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "approved":
        return "text-green-600 bg-green-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileIcon = (type) => {
    if (type.includes("image")) {
      return <Image className="w-4 h-4 text-blue-500" />;
    } else if (type.includes("pdf")) {
      return <FileText className="w-4 h-4 text-red-500" />;
    } else {
      return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const getFileTypeLabel = (type) => {
    if (type.includes("image")) {
      return "Hình ảnh";
    } else if (type.includes("pdf")) {
      return "PDF";
    } else if (type.includes("word")) {
      return "Word";
    } else {
      return "File";
    }
  };

  const getStudentInfo = (evidence) => {
    // Ưu tiên tìm user details theo studentId trước, sau đó theo uid
    const userDetails =
      userDetailsMap[evidence.studentId] || userDetailsMap[evidence.uid];

    return {
      name:
        userDetails?.firstName ||
        evidence.firstName ||
        evidence.studentName ||
        "Không xác định",
      studentId: userDetails?.studentId || evidence.studentId,
      className: userDetails?.className || evidence.studentClass || "N/A",
    };
  };

  const renderStudentInfo = (evidence) => {
    const studentInfo = getStudentInfo(evidence);
    return (
      <>
        <div>
          <label className="text-sm font-medium text-gray-600">
            Tên học sinh
          </label>
          <p className="text-gray-900 mt-1">{studentInfo.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">
            Mã học sinh
          </label>
          <p className="text-gray-900 mt-1 font-mono">
            {studentInfo.studentId}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Lớp</label>
          <p className="text-gray-900 mt-1">{studentInfo.className}</p>
        </div>
      </>
    );
  };

  return (
    <div className="p-6 ">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Quản lý minh chứng
            </h1>
            <p className="text-gray-600">
              Xét duyệt minh chứng và cấp điểm cộng cho học sinh
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chờ xét duyệt</p>
              <p className="text-2xl font-bold text-gray-900">
                {evidenceList.filter((e) => e.status === "pending").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
              <p className="text-2xl font-bold text-gray-900">
                {evidenceList.filter((e) => e.status === "approved").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Từ chối</p>
              <p className="text-2xl font-bold text-gray-900">
                {evidenceList.filter((e) => e.status === "rejected").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng cộng</p>
              <p className="text-2xl font-bold text-gray-900">
                {evidenceList.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên học sinh, mã học sinh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xét duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>
        </div>
      </div>

      {/* Evidence List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Học sinh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Minh chứng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Files
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày gửi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredList.map((evidence) => {
                const studentInfo = getStudentInfo(evidence);
                return (
                  <tr key={evidence.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div
                            className="text-sm font-medium text-gray-900 truncate max-w-32"
                            title={studentInfo.name}
                          >
                            {studentInfo.name}
                          </div>
                          <div
                            className="text-sm text-gray-500 truncate max-w-32"
                            title={`${studentInfo.studentId} - ${studentInfo.className}`}
                          >
                            {studentInfo.studentId} - {studentInfo.className}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div
                          className="text-sm font-medium text-gray-900 truncate max-w-xs"
                          title={evidence.ruleCode || evidence.title}
                        >
                          {evidence.ruleCode || evidence.title}
                        </div>
                        <div
                          className="text-sm text-gray-500 truncate max-w-xs"
                          title={evidence.ruleDescription}
                        >
                          {evidence.ruleDescription}
                        </div>
                        <div className="flex items-center mt-1">
                          <Award className="w-3 h-3 text-yellow-500 mr-1" />
                          <span className="text-xs text-gray-500">
                            Mặc định: +{evidence.categoryPoints} điểm
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {evidence.files?.slice(0, 3).map((file, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {getFileIcon(file.type)}
                            <span className="ml-1">
                              {getFileTypeLabel(file.type)}
                            </span>
                          </span>
                        ))}
                        {evidence.files?.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                            +{evidence.files.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(evidence.status)}
                        <span
                          className={`ml-2 text-xs px-2 py-1 rounded-full ${getStatusColor(
                            evidence.status
                          )}`}
                        >
                          {getStatusText(evidence.status)}
                        </span>
                      </div>
                      {evidence.approvedPoints && (
                        <div className="text-xs text-green-600 mt-1">
                          Đã cấp: +{evidence.approvedPoints} điểm
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(evidence.submittedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewEvidence(evidence)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Xem
                        </button>
                        {evidence.status === "pending" && (
                          <button
                            onClick={() => handleReviewEvidence(evidence)}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors flex items-center"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Xét duyệt
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>Không có minh chứng nào</p>
          </div>
        ) : null}
      </div>

      {/* View Evidence Modal */}
      {isModalOpen && selectedEvidence && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-xl">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Chi tiết minh chứng
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {/* Row 1: Student Info + Evidence Details */}
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Student Info */}
                  <div className="flex-1">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm h-full">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-600" />
                        Thông tin học sinh
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {renderStudentInfo(selectedEvidence)}
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Ngày gửi
                          </label>
                          <p className="text-gray-900 mt-1">
                            {formatDate(selectedEvidence.submittedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Evidence Details */}
                  <div className="flex-1">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm h-full">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-green-600" />
                        Chi tiết minh chứng
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Tiêu đề
                          </label>
                          <p className="text-gray-900 mt-1 font-medium">
                            {selectedEvidence.ruleCode ||
                              selectedEvidence.title}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Phân loại
                          </label>
                          <p className="text-gray-900 mt-1">
                            {selectedEvidence.ruleDescription}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Điểm mặc định
                          </label>
                          <p className="text-green-600 font-bold text-lg mt-1">
                            +{selectedEvidence.categoryPoints} điểm
                          </p>
                        </div>
                        {selectedEvidence.note && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Ghi chú
                            </label>
                            <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded-md">
                              {selectedEvidence.note}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Review Info + Files */}
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Files */}
                  <div className="flex-1">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm h-full">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Download className="w-5 h-5 mr-2 text-orange-600" />
                        Files đính kèm ({selectedEvidence.files?.length || 0})
                      </h3>
                      <div className="space-y-3">
                        {selectedEvidence.files?.map((file, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <div className="flex-shrink-0">
                                  {getFileIcon(file.type)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p
                                    className="text-sm font-medium text-gray-900 truncate"
                                    title={file.name}
                                  >
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-1 ml-2">
                                <button
                                  onClick={() => handlePreviewFile(file)}
                                  className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                                  title="Xem trước"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                                  title="Tải xuống"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-200">
                {selectedEvidence.status === "pending" && (
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      handleReviewEvidence(selectedEvidence);
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Xét duyệt ngay
                  </button>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {isPreviewOpen && previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {previewFile.name}
              </h3>
              <div className="flex space-x-2">
                <a
                  href={previewFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Mở trong tab mới"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-4">
              {previewType === "image" ? (
                <div className="flex justify-center">
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                  />
                </div>
              ) : previewType === "pdf" ? (
                <div className="h-[70vh]">
                  <iframe
                    src={previewFile.url}
                    className="w-full h-full border-0 rounded-lg shadow-lg"
                    title={previewFile.name}
                  />
                </div>
              ) : previewType === "video" ? (
                <div className="flex justify-center">
                  <video
                    src={previewFile.url}
                    controls
                    className="max-w-full max-h-[70vh] rounded-lg shadow-lg"
                  >
                    Trình duyệt của bạn không hỗ trợ video.
                  </video>
                </div>
              ) : previewType === "text" ? (
                <div className="h-[70vh] overflow-auto">
                  <iframe
                    src={previewFile.url}
                    className="w-full h-full border-0 rounded-lg shadow-lg"
                    title={previewFile.name}
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Không thể xem trước file này
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      Loại file: {previewFile.type}
                    </p>
                    <p className="text-sm text-gray-500">
                      Kích thước: {(previewFile.size / 1024 / 1024).toFixed(2)}{" "}
                      MB
                    </p>
                    <a
                      href={previewFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Tải xuống để xem
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Evidence Modal */}
      {isReviewModalOpen && selectedEvidence && (
        <div className=" fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-xl">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Xét duyệt minh chứng
                </h2>
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Student Info & Evidence Details - Modal 2 */}
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-600" />
                      Thông tin học sinh
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {renderStudentInfo(selectedEvidence)}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-green-600" />
                      Chi tiết minh chứng
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Tiêu đề
                        </label>
                        <p className="text-gray-900 mt-1 font-medium">
                          {selectedEvidence.ruleCode || selectedEvidence.title}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Phân loại
                        </label>
                        <p className="text-gray-900 mt-1">
                          {selectedEvidence.ruleDescription}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Điểm mặc định
                        </label>
                        <p className="text-green-600 font-bold text-lg mt-1">
                          +{selectedEvidence.categoryPoints} điểm
                        </p>
                      </div>
                      {selectedEvidence.note && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Ghi chú của học sinh
                          </label>
                          <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-gray-900 text-sm">
                              {selectedEvidence.note}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedEvidence.status === "rejected" &&
                        selectedEvidence.rejectionReason && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Lý do từ chối
                            </label>
                            <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-start">
                                <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                <p className="text-red-800 text-sm">
                                  {selectedEvidence.rejectionReason}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Review Form & Files */}
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Star className="w-5 h-5 mr-2 text-yellow-600" />
                      Xét duyệt điểm
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số điểm cấp (mặc định:{" "}
                          {selectedEvidence.categoryPoints}, có thể điều chỉnh)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={selectedPoints}
                            onChange={(e) => setSelectedPoints(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium"
                            placeholder="Nhập số điểm"
                          />
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <Award className="w-5 h-5 text-yellow-600" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lý do từ chối (nếu có)
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={3}
                          className="w-full min-h-11 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nhập lý do từ chối..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Files Preview */}
                  {selectedEvidence.files &&
                    selectedEvidence.files.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                          <Download className="w-5 h-5 mr-2 text-orange-600" />
                          Files đính kèm ({selectedEvidence.files.length})
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedEvidence.files
                            .slice(0, 4)
                            .map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                {getFileIcon(file.type)}
                                <span className="ml-3 text-sm truncate flex-1">
                                  {file.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                              </div>
                            ))}
                          {selectedEvidence.files.length > 4 && (
                            <div className="flex items-center p-3 border border-gray-200 rounded-lg bg-gray-50">
                              <span className="text-sm text-gray-500">
                                +{selectedEvidence.files.length - 4} files khác
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  disabled={isProcessing}
                >
                  Hủy
                </button>
                <button
                  onClick={handleReject}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center font-medium transition-colors"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <ThumbsDown className="w-5 h-5 mr-2" />
                      Từ chối
                    </>
                  )}
                </button>
                <button
                  onClick={handleApprove}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center font-medium transition-colors"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <ThumbsUp className="w-5 h-5 mr-2" />
                      Duyệt
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceManagement;
