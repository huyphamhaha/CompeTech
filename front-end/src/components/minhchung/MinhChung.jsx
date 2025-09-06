import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  Upload,
  FileText,
  Image,
  File,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  AlertTriangle,
  Info,
  Eye,
  Download,
  ExternalLink,
  Award,
  BookOpen,
  Search,
} from "lucide-react";
import Header from "../Header/header";

const MinhChung = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState("");
  const [note, setNote] = useState("");
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [showStatusNotification, setShowStatusNotification] = useState(false);
  const [statusChangeMessage, setStatusChangeMessage] = useState("");

  // Fetch categories từ Firebase Rules collection
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch user data và submissions
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await fetchUserData(user);
        setUserLoading(false);
      } else {
        setUserDetails(null);
        setSubmissions([]);
        setUserLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch submissions khi userDetails thay đổi
  useEffect(() => {
    let unsubscribe = null;

    if (userDetails && userDetails.uid) {
      fetchSubmissions(userDetails.uid);
      unsubscribe = setupRealtimeListener(userDetails.uid);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userDetails]);

  const setupRealtimeListener = (uid) => {
    if (!uid || !userDetails) return;

    const studentId = userDetails.studentId || uid;
    const evidenceRef = collection(db, "evidence");

    const q = query(
      evidenceRef,
      where("studentId", "in", [studentId, uid]),
      orderBy("submittedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const submissionsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          submittedAt: doc.data().submittedAt?.toDate?.() || new Date(),
          reviewedAt: doc.data().reviewedAt?.toDate?.() || null,
        }));

        // Detect status changes
        if (submissions.length > 0) {
          submissionsData.forEach((newSubmission) => {
            const oldSubmission = submissions.find(
              (s) => s.id === newSubmission.id
            );
            if (
              oldSubmission &&
              oldSubmission.status !== newSubmission.status
            ) {
              let message = "";
              switch (newSubmission.status) {
                case "approved":
                  message = `Minh chứng "${
                    newSubmission.ruleCode
                  }" đã được duyệt! +${
                    newSubmission.approvedPoints || newSubmission.categoryPoints
                  } điểm`;
                  break;
                case "rejected":
                  message = `Minh chứng "${newSubmission.ruleCode}" đã bị từ chối`;
                  break;
                default:
                  message = `Minh chứng "${newSubmission.ruleCode}" có cập nhật mới`;
              }
              setStatusChangeMessage(message);
              setShowStatusNotification(true);
              setTimeout(() => setShowStatusNotification(false), 8000);
            }
          });
        }

        // Remove duplicates
        const uniqueSubmissions = submissionsData.filter(
          (submission, index, self) =>
            index === self.findIndex((s) => s.id === submission.id)
        );

        setSubmissions(uniqueSubmissions);
        setLastUpdateTime(new Date());
      },
      (error) => {
        console.error("Error listening to submissions:", error);
      }
    );

    return unsubscribe;
  };

  const fetchUserData = async (user) => {
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUserDetails({ ...userData, uid: user.uid });
      } else {
        // Tạo tài liệu người dùng mới nếu không tồn tại
        const newUserDetails = {
          uid: user.uid,
          firstName: user.displayName,
          email: user.email,
          photo: user.photoURL,
        };
        setUserDetails(newUserDetails);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);

      // Chỉ lấy rules từ Firebase - những mục có điểm cộng
      const rulesRef = collection(db, "rules_items");
      const q = query(
        rulesRef,
        where("type", "==", "plus"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      const firebaseRules = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().description,
        points: doc.data().point,
        code: doc.data().code,
        pointType: doc.data().pointType || "fixed",
        conditions: doc.data().conditions || [],
        source: "firebase",
      }));

      setCategories(firebaseRules);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setErrorMessage("Không thể tải danh sách điểm cộng");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (uid) => {
    try {
      if (!uid || !userDetails) {
        setSubmissions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const evidenceRef = collection(db, "evidence");

      // Tìm kiếm theo cả studentId (mã học sinh thực tế) và UID (để tương thích với dữ liệu cũ)
      const studentId = userDetails.studentId || uid;

      // Tạo query để tìm theo cả hai trường hợp
      const q = query(
        evidenceRef,
        where("studentId", "in", [studentId, uid]),
        orderBy("submittedAt", "desc")
      );

      const querySnapshot = await getDocs(q);

      const submissionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate?.() || new Date(),
        reviewedAt: doc.data().reviewedAt?.toDate?.() || null,
      }));

      // Loại bỏ trùng lặp nếu có
      const uniqueSubmissions = submissionsData.filter(
        (submission, index, self) =>
          index === self.findIndex((s) => s.id === submission.id)
      );

      setSubmissions(uniqueSubmissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setErrorMessage("Không thể tải danh sách minh chứng");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    addFiles(uploadedFiles);
  };

  const addFiles = (uploadedFiles) => {
    const validFiles = uploadedFiles.filter((file) => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
      ];

      if (file.size > maxSize) {
        setErrorMessage(`File ${file.name} quá lớn (tối đa 10MB)`);
        return false;
      }

      if (!allowedTypes.includes(file.type)) {
        setErrorMessage(`File ${file.name} không được hỗ trợ`);
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      const newFiles = validFiles.map((file) => ({
        id: Date.now() + Math.random(),
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
      setErrorMessage("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategory) {
      setErrorMessage("Vui lòng chọn loại minh chứng");
      return;
    }

    if (files.length === 0) {
      setErrorMessage("Vui lòng tải lên ít nhất một file minh chứng");
      return;
    }

    if (!userDetails || !userDetails.uid) {
      setErrorMessage("Vui lòng đăng nhập để gửi minh chứng");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const selectedRule = categories.find((c) => c.id === selectedCategory);
      if (!selectedRule) {
        throw new Error("Không tìm thấy quy tắc được chọn");
      }

      // Upload files to Firebase Storage
      const uploadedFiles = [];
      for (const file of files) {
        const fileName = `${Date.now()}_${file.name}`;
        const storageRef = ref(
          storage,
          `evidence/${userDetails.uid}/${fileName}`
        );
        const snapshot = await uploadBytes(storageRef, file.file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        uploadedFiles.push({
          name: file.name,
          url: downloadURL,
          size: file.size,
          type: file.type,
        });
      }

      // Create evidence document in Firestore
      const evidenceData = {
        studentId: userDetails.studentId || userDetails.uid,
        uid: userDetails.uid,
        firstName: userDetails.firstName || "Không xác định",
        studentName: userDetails.firstName || "Không xác định",
        studentClass: userDetails.className || "N/A",
        ruleId: selectedCategory,
        ruleCode: selectedRule.code,
        ruleDescription: selectedRule.name,
        categoryPoints:
          selectedRule.pointType === "conditional"
            ? "conditional"
            : selectedRule.points,
        pointType: selectedRule.pointType,
        conditions: selectedRule.conditions || [],
        status: "pending",
        submittedAt: new Date(),
        files: uploadedFiles,
        note: note,
        title: selectedRule.name, // Sử dụng tên rule làm title
      };

      await addDoc(collection(db, "evidence"), evidenceData);

      // Reset form
      setFiles([]);
      setSelectedCategory("");
      setNote("");

      // Refresh submissions
      await fetchSubmissions(userDetails.uid);

      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Error submitting evidence:", error);
      setErrorMessage("Có lỗi xảy ra khi gửi minh chứng: " + error.message);
    } finally {
      setIsSubmitting(false);
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

  const getFileTypeLabel = (fileType) => {
    if (fileType.includes("image")) {
      return "Hình ảnh";
    } else if (fileType.includes("pdf")) {
      return "PDF";
    } else if (fileType.includes("word") || fileType.includes("document")) {
      return "Tài liệu";
    } else if (fileType.includes("excel") || fileType.includes("spreadsheet")) {
      return "Bảng tính";
    } else if (
      fileType.includes("powerpoint") ||
      fileType.includes("presentation")
    ) {
      return "Trình chiếu";
    } else {
      return "File khác";
    }
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

  const handleDeleteSubmission = async (submission) => {
    if (!window.confirm("Bạn có chắc muốn xóa minh chứng này?")) {
      return;
    }

    try {
      // Xóa files từ storage nếu có
      if (submission.files && submission.files.length > 0) {
        for (const file of submission.files) {
          try {
            const fileRef = ref(storage, file.url);
            await deleteObject(fileRef);
          } catch (error) {
            console.error("Error deleting file from storage:", error);
          }
        }
      }

      // Xóa document từ Firestore
      await deleteDoc(doc(db, "evidence", submission.id));
      await fetchSubmissions(userDetails.uid);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Error deleting submission:", error);
      setErrorMessage("Có lỗi xảy ra khi xóa minh chứng: " + error.message);
    }
  };

  return (
    <>
      <Header />

      {/* Real-time Status Notification */}
      {showStatusNotification && (
        <div className="fixed top-20 right-4 z-50 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center animate-bounce max-w-md">
          <div className="flex items-center">
            <div className="relative">
              <CheckCircle className="w-6 h-6 mr-3" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
            <div>
              <p className="font-semibold text-sm">Cập nhật trạng thái!</p>
              <p className="text-xs opacity-90">{statusChangeMessage}</p>
            </div>
          </div>
          <button
            onClick={() => setShowStatusNotification(false)}
            className="ml-4 text-white hover:text-gray-200 flex-shrink-0 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

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
              Minh Chứng
            </h1>
            <p
              className="mt-3 text-lg max-w-2xl mx-auto"
              style={{ color: "#064232CC" }}
            >
              Gửi minh chứng để được xét duyệt điểm cộng rèn luyện
            </p>
          </div>

          {/* Hướng dẫn */}
          <div
            className="mb-8 p-6 rounded-2xl border-2"
            style={{ background: "#FCE3E1", borderColor: "#568F87" }}
          >
            <div className="flex items-start">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 flex-shrink-0"
                style={{ background: "#064232" }}
              >
                i
              </div>
              <div>
                <h3
                  className="text-sm font-semibold mb-2"
                  style={{ color: "#064232" }}
                >
                  Hướng dẫn gửi minh chứng
                </h3>
                <ul className="space-y-1 text-sm" style={{ color: "#064232" }}>
                  <li className="flex items-start gap-2">
                    <span className="text-xs mt-1">•</span>
                    <span>
                      Chọn phân loại điểm cộng phù hợp với minh chứng của bạn
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-xs mt-1">•</span>
                    <span>
                      Tải lên file minh chứng (PDF, DOC, DOCX, JPG, PNG) - tối
                      đa 10MB/file
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-xs mt-1">•</span>
                    <span>
                      Minh chứng sẽ được admin xét duyệt trong vòng 3-5 ngày làm
                      việc
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form gửi minh chứng */}
            <div
              className="bg-white rounded-2xl shadow-lg border p-6"
              style={{ borderColor: "#568F87" }}
            >
              <h2
                className="text-xl font-semibold mb-6"
                style={{ color: "#064232" }}
              >
                Gửi minh chứng mới
              </h2>

              {!userDetails && (
                <div
                  className="mb-6 p-4 rounded-xl border-2"
                  style={{ background: "#FCE3E1", borderColor: "#568F87" }}
                >
                  <div className="flex items-center">
                    <AlertTriangle
                      className="w-5 h-5 mr-2"
                      style={{ color: "#064232" }}
                    />
                    <p className="text-sm" style={{ color: "#064232" }}>
                      Vui lòng đăng nhập để gửi minh chứng
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Phân loại điểm cộng */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#064232" }}
                  >
                    Phân loại điểm cộng *
                  </label>

                  {/* Search input */}
                  <div className="relative mb-3">
                    <input
                      type="text"
                      placeholder="Tìm kiếm phân loại điểm cộng..."
                      value={categorySearchTerm}
                      onChange={(e) => setCategorySearchTerm(e.target.value)}
                      className="w-full px-3 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      style={{
                        borderColor: "#568F87",
                        background: "#FFFFFF",
                        color: "#064232",
                      }}
                    />
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                      style={{ color: "#568F87" }}
                    />
                  </div>

                  {/* Category selection */}
                  <div
                    className="border rounded-lg max-h-60 overflow-y-auto"
                    style={{ borderColor: "#568F87" }}
                  >
                    {categories
                      .filter(
                        (category) =>
                          category.name
                            .toLowerCase()
                            .includes(categorySearchTerm.toLowerCase()) ||
                          category.code
                            ?.toLowerCase()
                            .includes(categorySearchTerm.toLowerCase())
                      )
                      .map((category) => (
                        <div
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`p-3 cursor-pointer transition-all duration-200 hover:bg-gray-50 border-b last:border-b-0 ${
                            selectedCategory === category.id
                              ? "bg-blue-50 border-l-4"
                              : ""
                          }`}
                          style={{
                            borderLeftColor:
                              selectedCategory === category.id
                                ? "#568F87"
                                : "transparent",
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4
                                className="font-medium text-sm"
                                style={{ color: "#064232" }}
                              >
                                {category.name}
                              </h4>
                              {category.code && (
                                <p
                                  className="text-xs mt-1"
                                  style={{ color: "#064232CC" }}
                                >
                                  Mã: {category.code}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              {category.pointType === "conditional" ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <Award className="w-3 h-3 mr-1" />
                                  Có điều kiện
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <Award className="w-3 h-3 mr-1" />+
                                  {category.points} điểm
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                    {categories.filter(
                      (category) =>
                        category.name
                          .toLowerCase()
                          .includes(categorySearchTerm.toLowerCase()) ||
                        category.code
                          ?.toLowerCase()
                          .includes(categorySearchTerm.toLowerCase())
                    ).length === 0 && (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        Không tìm thấy phân loại nào phù hợp
                      </div>
                    )}
                  </div>

                  {/* Selected category display */}
                  {selectedCategory && (
                    <div
                      className="mt-3 p-3 rounded-lg border"
                      style={{
                        backgroundColor: "#F0F9FF",
                        borderColor: "#568F87",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className="font-medium text-sm"
                            style={{ color: "#064232" }}
                          >
                            Đã chọn:{" "}
                            {
                              categories.find((c) => c.id === selectedCategory)
                                ?.name
                            }
                          </p>
                          {categories.find((c) => c.id === selectedCategory)
                            ?.code && (
                            <p
                              className="text-xs mt-1"
                              style={{ color: "#064232CC" }}
                            >
                              Mã:{" "}
                              {
                                categories.find(
                                  (c) => c.id === selectedCategory
                                )?.code
                              }
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedCategory("")}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload files */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#064232" }}
                  >
                    Tải lên minh chứng *
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                      isDragOver
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload
                        className="mx-auto h-12 w-12 mb-4"
                        style={{ color: "#568F87" }}
                      />
                      <p className="text-sm mb-2" style={{ color: "#064232" }}>
                        Kéo thả file vào đây hoặc click để chọn
                      </p>
                      <p className="text-xs" style={{ color: "#064232CC" }}>
                        Hỗ trợ: PDF, DOC, DOCX, JPG, PNG (Tối đa 10MB/file)
                      </p>
                    </label>
                  </div>

                  {/* Error message */}
                  {errorMessage && (
                    <div
                      className="mt-3 p-3 rounded-lg border-2"
                      style={{ background: "#FCE3E1", borderColor: "#568F87" }}
                    >
                      <div className="flex items-center">
                        <AlertTriangle
                          className="w-4 h-4 mr-2"
                          style={{ color: "#064232" }}
                        />
                        <p className="text-sm" style={{ color: "#064232" }}>
                          {errorMessage}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Success message */}
                  {showSuccessMessage && (
                    <div
                      className="mt-3 p-3 rounded-lg border-2"
                      style={{ background: "#FCE3E1", borderColor: "#568F87" }}
                    >
                      <div className="flex items-center">
                        <CheckCircle
                          className="w-4 h-4 mr-2"
                          style={{ color: "#064232" }}
                        />
                        <p className="text-sm" style={{ color: "#064232" }}>
                          Gửi minh chứng thành công!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* File list */}
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:bg-gray-50"
                          style={{
                            background: "#FFFFFF",
                            border: "1px solid #568F87",
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            {file.type.includes("image") ? (
                              <Image
                                className="w-5 h-5"
                                style={{ color: "#568F87" }}
                              />
                            ) : file.type.includes("pdf") ? (
                              <FileText
                                className="w-5 h-5"
                                style={{ color: "#568F87" }}
                              />
                            ) : (
                              <File
                                className="w-5 h-5"
                                style={{ color: "#568F87" }}
                              />
                            )}
                            <div>
                              <p
                                className="text-sm font-medium"
                                style={{ color: "#064232" }}
                              >
                                {file.name}
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: "#064232CC" }}
                              >
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ghi chú */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#064232" }}
                  >
                    Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Nhập ghi chú bổ sung cho minh chứng..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    style={{
                      borderColor: "#568F87",
                      background: "#FFFFFF",
                      color: "#064232",
                    }}
                  />
                  <p className="text-xs mt-1" style={{ color: "#064232CC" }}>
                    Ghi chú này sẽ giúp giáo viên hiểu rõ hơn về minh chứng của
                    bạn
                  </p>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !selectedCategory ||
                    files.length === 0 ||
                    !userDetails
                  }
                  className="w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200"
                  style={{
                    background: "linear-gradient(90deg,#064232,#568F87)",
                    color: "#FFFFFF",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Gửi minh chứng
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Danh sách minh chứng đã gửi */}
            <div
              className="bg-white rounded-2xl shadow-lg border p-6"
              style={{ borderColor: "#568F87" }}
            >
              <h2
                className="text-xl font-semibold mb-6"
                style={{ color: "#064232" }}
              >
                Minh chứng đã gửi
                {lastUpdateTime && (
                  <span
                    className="text-xs font-normal ml-2"
                    style={{ color: "#064232CC" }}
                  >
                    (Cập nhật: {lastUpdateTime.toLocaleTimeString("vi-VN")})
                  </span>
                )}
              </h2>

              <div className="space-y-4">
                {userLoading || loading ? (
                  <div className="text-center py-8">
                    <div
                      className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
                      style={{ borderColor: "#064232" }}
                    ></div>
                    <p style={{ color: "#064232" }}>Đang tải dữ liệu...</p>
                  </div>
                ) : !userDetails ? (
                  <div className="text-center py-8">
                    <FileText
                      className="mx-auto h-12 w-12 mb-4"
                      style={{ color: "#568F87" }}
                    />
                    <p style={{ color: "#064232" }}>
                      Vui lòng đăng nhập để xem minh chứng
                    </p>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText
                      className="mx-auto h-12 w-12 mb-4"
                      style={{ color: "#568F87" }}
                    />
                    <p style={{ color: "#064232" }}>
                      Chưa có minh chứng nào được gửi
                    </p>
                  </div>
                ) : (
                  submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="border rounded-xl p-4 transition-all duration-200 hover:shadow-md"
                      style={{ borderColor: "#568F87", background: "#FFFFFF" }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3
                            className="font-medium mb-1"
                            style={{ color: "#064232" }}
                          >
                            {submission.ruleCode}
                          </h3>
                          <p
                            className="text-sm mb-2"
                            style={{ color: "#064232CC" }}
                          >
                            {submission.ruleDescription ||
                              submission.category ||
                              "Không xác định"}
                          </p>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(submission.status)}
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                                submission.status
                              )}`}
                            >
                              {getStatusText(submission.status)}
                            </span>
                            {submission.approvedPoints && (
                              <span className="text-xs text-green-600 font-medium">
                                +{submission.approvedPoints} điểm
                              </span>
                            )}
                            {submission.pointType === "conditional" && (
                              <span className="text-xs text-blue-600 font-medium">
                                (Điểm có điều kiện)
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className="text-xs"
                          style={{ color: "#064232CC" }}
                        >
                          {formatDate(submission.submittedAt)}
                        </span>
                      </div>

                      {/* Action buttons for pending submissions */}
                      {submission.status === "pending" && (
                        <div className="flex space-x-2 mb-3">
                          <button
                            onClick={() => handleDeleteSubmission(submission)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors flex items-center text-xs"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Xóa
                          </button>
                        </div>
                      )}

                      {submission.note && (
                        <p
                          className="text-sm mb-3"
                          style={{ color: "#064232" }}
                        >
                          {submission.note}
                        </p>
                      )}

                      {submission.rejectionReason && (
                        <div
                          className="mb-3 p-3 rounded-lg border-2"
                          style={{
                            background: "#FCE3E1",
                            borderColor: "#568F87",
                          }}
                        >
                          <p className="text-sm" style={{ color: "#064232" }}>
                            <strong>Lý do từ chối:</strong>{" "}
                            {submission.rejectionReason}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {submission.files.map((file, index) => (
                          <div
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer hover:bg-gray-100"
                            style={{
                              background: "#FCE3E1",
                              color: "#064232",
                              border: "1px solid #568F87",
                            }}
                            onClick={() => handlePreviewFile(file)}
                          >
                            {file.type.includes("image") ? (
                              <Image
                                className="w-3 h-3 mr-1"
                                style={{ color: "#568F87" }}
                              />
                            ) : file.type.includes("pdf") ? (
                              <FileText
                                className="w-3 h-3 mr-1"
                                style={{ color: "#568F87" }}
                              />
                            ) : (
                              <File
                                className="w-3 h-3 mr-1"
                                style={{ color: "#568F87" }}
                              />
                            )}
                            <span className="mr-1">
                              {getFileTypeLabel(file.type)}
                            </span>
                            <Eye
                              className="w-3 h-3"
                              style={{ color: "#568F87" }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      {isPreviewOpen && previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-2xl">
            <div
              className="p-4 border-b flex justify-between items-center"
              style={{ borderColor: "#568F87" }}
            >
              <h3 className="text-lg font-medium" style={{ color: "#064232" }}>
                {previewFile.name}
              </h3>
              <div className="flex space-x-2">
                <a
                  href={previewFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 transition-colors hover:bg-gray-100 rounded"
                  style={{ color: "#568F87" }}
                  title="Mở trong tab mới"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
                <a
                  href={previewFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 transition-colors hover:bg-gray-100 rounded"
                  style={{ color: "#568F87" }}
                  title="Tải xuống"
                >
                  <Download className="w-5 h-5" />
                </a>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1 transition-colors hover:bg-gray-100 rounded"
                  style={{ color: "#568F87" }}
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
                  <File
                    className="w-16 h-16 mx-auto mb-4"
                    style={{ color: "#568F87" }}
                  />
                  <p className="mb-4" style={{ color: "#064232" }}>
                    Không thể xem trước file này
                  </p>
                  <a
                    href={previewFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-lg transition-all duration-200"
                    style={{
                      background: "linear-gradient(90deg,#064232,#568F87)",
                      color: "#FFFFFF",
                    }}
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
    </>
  );
};

export default MinhChung;
