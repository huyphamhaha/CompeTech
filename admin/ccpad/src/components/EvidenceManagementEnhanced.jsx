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
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState("");

  useEffect(() => {
    fetchEvidence();
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

      setEvidenceList(evidenceData);
    } catch (error) {
      console.error("Error fetching evidence:", error);
    } finally {
      setLoading(false);
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
      filtered = filtered.filter(
        (evidence) =>
          evidence.studentName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          evidence.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          evidence.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          evidence.ruleDescription
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
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
    setIsReviewModalOpen(true);
  };

  const handlePreviewFile = (file) => {
    setPreviewFile(file);
    if (file.type.includes("image")) {
      setPreviewType("image");
    } else if (file.type.includes("pdf")) {
      setPreviewType("pdf");
    } else {
      setPreviewType("other");
    }
    setIsPreviewOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedPoints || selectedPoints <= 0) {
      alert("Vui lòng chọn số điểm phù hợp");
      return;
    }

    setIsProcessing(true);
    try {
      await updateDoc(doc(db, "evidence", selectedEvidence.id), {
        status: "approved",
        approvedPoints: parseInt(selectedPoints),
        reviewedAt: new Date(),
        reviewedBy: "Admin",
      });

      const studentPointData = {
        studentId: selectedEvidence.studentId,
        ruleId: selectedEvidence.ruleId,
        ruleCode: selectedEvidence.ruleCode,
        type: "reward",
        points: parseInt(selectedPoints),
        description: selectedEvidence.ruleDescription,
        status: "approved",
        createdAt: new Date(),
        awardedAt: new Date(),
        createdBy: "admin",
        evidenceId: selectedEvidence.id,
      };

      await addDoc(collection(db, "studentPoints"), studentPointData);
      await fetchEvidence();
      setIsReviewModalOpen(false);
      setSelectedEvidence(null);
      alert("Đã duyệt minh chứng thành công!");
    } catch (error) {
      console.error("Error approving evidence:", error);
      alert("Có lỗi xảy ra khi duyệt minh chứng: " + error.message);
    } finally {
      setIsProcessing(false);
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Quản lý minh chứng
        </h1>
        <p className="text-gray-600">
          Xét duyệt minh chứng và cấp điểm cộng cho học sinh
        </p>
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
              {filteredList.map((evidence) => (
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
                          title={evidence.studentName}
                        >
                          {evidence.studentName}
                        </div>
                        <div
                          className="text-sm text-gray-500 truncate max-w-32"
                          title={`${evidence.studentId} - ${evidence.studentClass}`}
                        >
                          {evidence.studentId} - {evidence.studentClass}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div
                        className="text-sm font-medium text-gray-900 truncate max-w-xs"
                        title={evidence.title}
                      >
                        {evidence.title}
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
                          +{evidence.categoryPoints} điểm
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
              ))}
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
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Chi tiết minh chứng
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Information */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-600" />
                      Thông tin học sinh
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Tên:</span>
                        <span className="text-gray-900">
                          {selectedEvidence.studentName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">
                          Mã học sinh:
                        </span>
                        <span className="text-gray-900">
                          {selectedEvidence.studentId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Lớp:</span>
                        <span className="text-gray-900">
                          {selectedEvidence.studentClass}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-green-600" />
                      Minh chứng
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-600 font-medium">
                          Tiêu đề:
                        </span>
                        <p className="text-gray-900 mt-1">
                          {selectedEvidence.title}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">
                          Phân loại:
                        </span>
                        <p className="text-gray-900 mt-1">
                          {selectedEvidence.ruleDescription}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">
                          Điểm tối đa:
                        </span>
                        <span className="text-green-600 font-bold">
                          +{selectedEvidence.categoryPoints} điểm
                        </span>
                      </div>
                      {selectedEvidence.note && (
                        <div>
                          <span className="text-gray-600 font-medium">
                            Ghi chú:
                          </span>
                          <p className="text-gray-900 mt-1">
                            {selectedEvidence.note}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedEvidence.reviewedAt && (
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-purple-600" />
                        Thông tin xét duyệt
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">
                            Ngày xét duyệt:
                          </span>
                          <span className="text-gray-900">
                            {formatDate(selectedEvidence.reviewedAt)}
                          </span>
                        </div>
                        {selectedEvidence.approvedPoints && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 font-medium">
                              Điểm được cấp:
                            </span>
                            <span className="text-green-600 font-bold">
                              +{selectedEvidence.approvedPoints} điểm
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Files */}
                <div>
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Download className="w-5 h-5 mr-2 text-orange-600" />
                      Files đính kèm ({selectedEvidence.files?.length || 0})
                    </h3>
                    <div className="space-y-4">
                      {selectedEvidence.files?.map((file, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-4 border border-orange-200 hover:shadow-md transition-all duration-200"
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
                            <div className="flex space-x-2 ml-4">
                              {file.type.includes("image") && (
                                <button
                                  onClick={() => handlePreviewFile(file)}
                                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                  title="Xem trước"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                title="Tải xuống"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                title="Mở trong tab mới"
                              >
                                <ExternalLink className="w-4 h-4" />
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
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end space-x-3">
                {selectedEvidence.status === "pending" && (
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      handleReviewEvidence(selectedEvidence);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Xét duyệt ngay
                  </button>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  />
                </div>
              ) : previewType === "pdf" ? (
                <div className="h-[70vh]">
                  <iframe
                    src={previewFile.url}
                    className="w-full h-full border-0 rounded-lg"
                    title={previewFile.name}
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Không thể xem trước file này
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Evidence Modal */}
      {isReviewModalOpen && selectedEvidence && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Xét duyệt minh chứng
                </h2>
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center mb-3">
                  <User className="w-6 h-6 text-blue-600 mr-3" />
                  <span className="text-lg font-semibold text-blue-900">
                    {selectedEvidence.studentName}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Minh chứng:</span>{" "}
                    {selectedEvidence.title}
                  </p>
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Phân loại:</span>{" "}
                    {selectedEvidence.ruleDescription}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
                <label className="block text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-600" />
                  Số điểm cấp (tối đa: {selectedEvidence.categoryPoints})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max={selectedEvidence.categoryPoints}
                    value={selectedPoints}
                    onChange={(e) => setSelectedPoints(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-lg font-medium"
                    placeholder="Nhập số điểm"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
              </div>

              {/* Quick Preview of Files */}
              {selectedEvidence.files && selectedEvidence.files.length > 0 && (
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
                  <label className="block text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Download className="w-5 h-5 mr-2 text-gray-600" />
                    Files đính kèm ({selectedEvidence.files.length})
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedEvidence.files.slice(0, 4).map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                      >
                        {getFileIcon(file.type)}
                        <span
                          className="ml-2 text-sm truncate"
                          title={file.name}
                        >
                          {file.name}
                        </span>
                      </div>
                    ))}
                    {selectedEvidence.files.length > 4 && (
                      <div className="flex items-center p-3 bg-white border border-gray-200 rounded-lg">
                        <span className="text-sm text-gray-500">
                          +{selectedEvidence.files.length - 4} files khác
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex space-x-4">
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  disabled={isProcessing}
                >
                  Hủy
                </button>
                <button
                  onClick={handleApprove}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 flex items-center justify-center font-medium shadow-lg hover:shadow-xl transition-all duration-200"
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
