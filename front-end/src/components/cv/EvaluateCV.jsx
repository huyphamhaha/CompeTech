import React, { useState, useRef, useEffect } from "react";
import CVFileList from "./CVFileList";
import EnhancedAnalysisResults from "./EnhancedAnalysisResults";
import Header from "../Header/header";
import { auth } from "../firebase.js";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Upload,
  Settings,
  Briefcase,
  Brain,
  Target,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";

const POSSIBLE_ENDPOINTS = [
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  "http://127.0.0.1:5000",
];

const EvaluateCV = () => {
  // State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [industry, setIndustry] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [criteriaOption, setCriteriaOption] = useState("ats");
  const [customCriteria, setCustomCriteria] = useState("");
  const [showCustomCriteria, setShowCustomCriteria] = useState(false);
  const [progress, setProgress] = useState({
    show: false,
    message: "",
    percent: 0,
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [results, setResults] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({
    show: false,
    connected: false,
    geminiConfigured: false,
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [apiBaseUrl, setApiBaseUrl] = useState(POSSIBLE_ENDPOINTS[0]);
  const [isLoading, setIsLoading] = useState(true);

  const fileInputRef = useRef();
  const navigate = useNavigate();

  // Kiểm tra auth khi mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login");
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line
  }, [navigate]);

  // Event handlers
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files);
  };
  const getAuthHeaders = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      return {
        Authorization: `Bearer ${token}`,
      };
    } catch (error) {
      console.error("Error getting auth token:", error);
      return {};
    }
  };
  const handleFileSelection = (files) => {
    const maxFiles = 10;
    const validFiles = files.filter((file) => {
      if (file.type !== "application/pdf") {
        showError(`File "${file.name}" không phải PDF và đã bị bỏ qua.`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        showError(`File "${file.name}" quá lớn (>10MB) và đã bị bỏ qua.`);
        return false;
      }
      return true;
    });
    setSelectedFiles((prev) => {
      let newFiles = [...prev];
      validFiles.forEach((file) => {
        const exists = newFiles.some(
          (f) => f.name === file.name && f.size === file.size
        );
        if (!exists && newFiles.length < maxFiles) {
          newFiles.push(file);
        } else if (newFiles.length >= maxFiles) {
          showError(`Chỉ được chọn tối đa ${maxFiles} file.`);
        }
      });
      return newFiles;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCriteriaChange = (e) => {
    setCriteriaOption(e.target.value);
    setShowCustomCriteria(e.target.value === "custom");
  };

  // Connection check
  const findWorkingEndpoint = async () => {
    for (const endpoint of POSSIBLE_ENDPOINTS) {
      try {
        const authHeaders = await getAuthHeaders();
        const response = await fetch(`${endpoint}/health`, {
          method: "GET",
          mode: "cors",
          headers: authHeaders,
          signal: AbortSignal.timeout(3000),
        });
        if (response.ok) {
          const data = await response.json();
          setApiBaseUrl(endpoint);
          setConnectionStatus({
            show: true,
            connected: true,
            geminiConfigured: data.services?.gemini_api || false,
          });
          if (!data.services?.gemini_api) {
            showError(
              "⚠️ Backend kết nối thành công nhưng Gemini API chưa được cấu hình."
            );
            return false;
          }
          return true;
        }
      } catch {
        continue;
      }
    }
    setConnectionStatus({
      show: true,
      connected: false,
      geminiConfigured: false,
    });
    showError(
      `❌ Không thể kết nối đến server. Đã thử: ${POSSIBLE_ENDPOINTS.join(
        ", "
      )}`
    );
    return false;
  };

  // Analyze CV
  const analyzeCV = async () => {
    setErrorMsg("");
    setResults(null);
    if (selectedFiles.length === 0) {
      showError("📄 Vui lòng chọn ít nhất 1 file CV.");
      return;
    }
    if (!industry.trim()) {
      showError("🏢 Vui lòng nhập ngành nghề ứng tuyển.");
      return;
    }
    if (criteriaOption === "custom" && !customCriteria.trim()) {
      showError("📝 Vui lòng nhập tiêu chí tùy chỉnh.");
      return;
    }

    setProgress({
      show: true,
      message: "Kiểm tra kết nối server...",
      percent: 0,
    });

    const isConnected = await findWorkingEndpoint();
    if (!isConnected) {
      setProgress({ show: false, message: "", percent: 0 });
      return;
    }

    setProgress({ show: true, message: "Chuẩn bị dữ liệu...", percent: 10 });

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("cvs", file);
      });
      formData.append("industry", industry);
      formData.append("criteria_option", criteriaOption);
      if (criteriaOption === "custom") {
        formData.append("custom_criteria", customCriteria);
      }
      if (jobDescription.trim()) {
        formData.append("job_description", jobDescription.trim());
      }

      setProgress({
        show: true,
        message: "Đang gửi dữ liệu lên server...",
        percent: 20,
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      // THÊM authorization headers
      const authHeaders = await getAuthHeaders();

      const response = await fetch(`${apiBaseUrl}/evaluate`, {
        method: "POST",
        body: formData,
        mode: "cors",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          ...authHeaders, // THÊM dòng này
        },
      });

      clearTimeout(timeoutId);

      setProgress({
        show: true,
        message: "Nhận kết quả từ server...",
        percent: 80,
      });

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.error ||
            `HTTP ${response.status}: ${response.statusText}`;
        } catch {
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      setProgress({ show: true, message: "Hoàn thành!", percent: 100 });

      // Extract results array from response
      const results = responseData.results || responseData;

      if (!Array.isArray(results)) {
        throw new Error("Dữ liệu trả về không đúng định dạng.");
      }

      setTimeout(() => {
        setProgress({ show: false, message: "", percent: 0 });
        setResults(results);
        setSuccessMsg(`✅ Phân tích hoàn thành cho ${results.length} file CV.`);
        setTimeout(() => setSuccessMsg(""), 5000);
      }, 1000);
    } catch (error) {
      setProgress({ show: false, message: "", percent: 0 });
      if (error.name === "AbortError") {
        showError("⏱️ Quá thời gian chờ. Vui lòng thử lại với ít file hơn.");
      } else if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        showError("🌐 Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.");
      } else {
        showError(`❌ ${error.message}`);
      }
    }
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => {
      const el = document.getElementById("error");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  // On mount: check backend
  useEffect(() => {
    findWorkingEndpoint();
    // eslint-disable-next-line
  }, []);

  // UI render
  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: "#FFEFF2" }}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-32 w-32 border-b-2 mb-4"
              style={{ borderColor: "#064232" }}
            ></div>
            <p style={{ color: "#064232" }}>Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      {results ? (
        // Show enhanced results full screen
        <EnhancedAnalysisResults
          results={results}
          onBack={() => setResults(null)}
        />
      ) : (
        // Show CV evaluation form
        <div className="min-h-screen" style={{ background: "#FFEFF2" }}>
          <div className="container mx-auto p-4 max-w-6xl pt-28">
            {/* Header */}
            <header className="text-center mb-8">
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-4"
                style={{
                  background: "#FFFFFF",
                  color: "#064232",
                  border: "1px solid #568F87",
                }}
              >
                AI-Powered CV Analysis
              </span>
              <h1
                className="text-4xl sm:text-5xl font-extrabold mb-4"
                style={{ color: "#064232" }}
              >
                Đánh Giá CV Theo Chuẩn ATS
              </h1>
              <div className="flex items-center justify-center space-x-3 mb-4">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    background: "#FFFFFF",
                    color: "#064232",
                    border: "1px solid #568F87",
                  }}
                >
                  AI-Powered
                </span>
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ background: "#568F87", color: "#FFFFFF" }}
                >
                  Multi-PDF
                </span>
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ background: "#064232", color: "#FFFFFF" }}
                >
                  Instant Analysis
                </span>
              </div>
              <p
                className="text-lg max-w-2xl mx-auto"
                style={{ color: "#06423299" }}
              >
                Phân tích CV chuyên nghiệp với Gemini AI - Tối ưu hóa cho hệ
                thống ATS
              </p>
            </header>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left: Upload & Settings */}
              <section
                className="glass rounded-2xl p-6 shadow-lg border"
                style={{ borderColor: "#568F87" }}
              >
                <h2
                  className="text-xl font-semibold mb-6 flex items-center"
                  style={{ color: "#064232" }}
                >
                  <Upload
                    className="h-6 w-6 mr-3"
                    style={{ color: "#568F87" }}
                  />
                  Upload CV và Cài đặt
                </h2>

                {/* Upload CV */}
                <div className="mb-6">
                  <label
                    htmlFor="cv-upload"
                    className="block text-sm font-medium mb-3"
                    style={{ color: "#064232" }}
                  >
                    Tải lên CV (PDF) - Có thể chọn nhiều file
                  </label>
                  <div
                    className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 hover:shadow-md"
                    style={{
                      borderColor: "#568F87",
                      background: "#FFFFFF",
                    }}
                    id="dropzone"
                    onClick={() =>
                      fileInputRef.current && fileInputRef.current.click()
                    }
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.currentTarget.style.borderColor = "#064232";
                      event.currentTarget.style.background =
                        "rgba(245, 186, 187, 0.1)";
                    }}
                    onDragLeave={(event) => {
                      event.preventDefault();
                      event.currentTarget.style.borderColor = "#568F87";
                      event.currentTarget.style.background = "#FFFFFF";
                    }}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="cv-upload"
                      accept=".pdf"
                      multiple
                      className="hidden"
                      ref={fileInputRef}
                      onChange={(e) =>
                        handleFileSelection(Array.from(e.target.files))
                      }
                    />
                    <Upload
                      className="h-12 w-12 mx-auto mb-3"
                      style={{ color: "#F5BABB" }}
                    />
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#064232" }}
                    >
                      Kéo và thả <strong>nhiều file CV</strong> hoặc{" "}
                      <span style={{ color: "#568F87" }}>chọn file</span>
                    </p>
                    <p className="text-xs mt-2" style={{ color: "#06423299" }}>
                      Chỉ hỗ trợ file PDF | Tối đa 10 file
                    </p>
                  </div>

                  {/* File list */}
                  <CVFileList
                    files={selectedFiles}
                    onRemove={removeFile}
                    onClear={clearFiles}
                  />
                </div>

                {/* Industry input */}
                <div className="mb-6">
                  <label
                    htmlFor="industry-input"
                    className="block text-sm font-medium mb-3"
                    style={{ color: "#064232" }}
                  >
                    Ngành nghề ứng tuyển
                  </label>
                  <input
                    type="text"
                    id="industry-input"
                    className="w-full p-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{
                      border: "1px solid #568F87",
                      background: "#FFFFFF",
                      color: "#064232",
                      "&:focus": {
                        ringColor: "#F5BABB",
                      },
                    }}
                    placeholder="Ví dụ: IT, Data Science, Marketing, v.v."
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </div>

                {/* Criteria radio */}
                <div className="mb-6">
                  <label
                    className="block text-sm font-medium mb-3"
                    style={{ color: "#064232" }}
                  >
                    Tiêu chí đánh giá
                  </label>
                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="criteria"
                        value="ats"
                        checked={criteriaOption === "ats"}
                        onChange={handleCriteriaChange}
                        style={{ accentColor: "#F5BABB" }}
                      />
                      <span
                        className="ml-2 text-sm font-medium"
                        style={{ color: "#064232" }}
                      >
                        Chuẩn ATS
                      </span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="criteria"
                        value="tshape"
                        checked={criteriaOption === "tshape"}
                        onChange={handleCriteriaChange}
                        style={{ accentColor: "#F5BABB" }}
                      />
                      <span
                        className="ml-2 text-sm font-medium"
                        style={{ color: "#064232" }}
                      >
                        T-Shape Skills
                      </span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="criteria"
                        value="custom"
                        checked={criteriaOption === "custom"}
                        onChange={handleCriteriaChange}
                        style={{ accentColor: "#F5BABB" }}
                      />
                      <span
                        className="ml-2 text-sm font-medium"
                        style={{ color: "#064232" }}
                      >
                        Tùy chỉnh
                      </span>
                    </label>
                  </div>
                </div>

                {/* Custom criteria */}
                {showCustomCriteria && (
                  <div className="mb-6">
                    <label
                      htmlFor="custom-criteria"
                      className="block text-sm font-medium mb-3"
                      style={{ color: "#064232" }}
                    >
                      Tiêu chí tùy chỉnh
                    </label>
                    <textarea
                      id="custom-criteria"
                      rows={4}
                      className="w-full p-3 rounded-lg transition-all duration-200 resize-none focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      style={{
                        border: "1px solid #568F87",
                        background: "#FFFFFF",
                        color: "#064232",
                        "&:focus": {
                          ringColor: "#F5BABB",
                        },
                      }}
                      placeholder="Nhập tiêu chí đánh giá tùy chỉnh..."
                      value={customCriteria}
                      onChange={(e) => setCustomCriteria(e.target.value)}
                    />
                  </div>
                )}

                {/* Analyze button */}
                <button
                  onClick={analyzeCV}
                  className={`w-full py-3 px-4 rounded-lg transition-all duration-200 shadow-md flex items-center justify-center font-medium ${
                    progress.show
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:opacity-90"
                  }`}
                  style={{
                    background: progress.show
                      ? "linear-gradient(90deg,#568F87,#064232)"
                      : "linear-gradient(90deg,#064232,#568F87)",
                    color: "#FFFFFF",
                  }}
                  disabled={progress.show}
                >
                  {progress.show ? (
                    <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <Brain className="h-5 w-5 mr-2" />
                  )}
                  {progress.show
                    ? "Đang xử lý..."
                    : "Phân Tích CV Với Gemini AI"}
                </button>
              </section>

              {/* Right: Job Description */}
              <section
                className="glass rounded-2xl p-6 shadow-lg border"
                style={{ borderColor: "#568F87" }}
              >
                <h2
                  className="text-xl font-semibold mb-6 flex items-center"
                  style={{ color: "#064232" }}
                >
                  <Briefcase
                    className="h-6 w-6 mr-3"
                    style={{ color: "#568F87" }}
                  />
                  Mô tả công việc (JD)
                </h2>

                <div className="mb-6">
                  <label
                    htmlFor="job-description"
                    className="block text-sm font-medium mb-3"
                    style={{ color: "#064232" }}
                  >
                    Nhập mô tả công việc để so sánh với CV
                  </label>
                  <textarea
                    id="job-description"
                    rows={12}
                    className="w-full p-3 rounded-lg transition-all duration-200 resize-none focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{
                      border: "1px solid #568F87",
                      background: "#FFFFFF",
                      color: "#064232",
                      "&:focus": {
                        ringColor: "#F5BABB",
                      },
                    }}
                    placeholder={`Dán mô tả công việc (JD) vào đây để AI có thể so sánh CV với yêu cầu cụ thể...\n\nVí dụ:\n- Yêu cầu 3+ năm kinh nghiệm với React, Node.js\n- Thành thạo JavaScript, TypeScript, HTML/CSS\n- Kinh nghiệm với cơ sở dữ liệu MongoDB, PostgreSQL\n- Hiểu biết về Agile/Scrum\n- Tiếng Anh giao tiếp tốt\n- Khả năng làm việc độc lập và theo nhóm`}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>

                <div
                  className="p-4 rounded-lg border"
                  style={{
                    background: "rgba(245, 186, 187, 0.05)",
                    borderColor: "#568F87",
                  }}
                >
                  <h3
                    className="font-medium text-sm mb-2 flex items-center"
                    style={{ color: "#064232" }}
                  >
                    <Info
                      className="h-4 w-4 mr-2"
                      style={{ color: "#568F87" }}
                    />
                    Lưu ý:
                  </h3>
                  <p className="text-sm" style={{ color: "#06423299" }}>
                    Khi cung cấp JD, AI sẽ phân tích mức độ phù hợp cho{" "}
                    <strong>tất cả CV</strong> và tăng trọng số đánh giá phù hợp
                    lên 30%.
                  </p>
                </div>
              </section>
            </div>

            {/* Connection Status */}
            {connectionStatus.show && (
              <div
                className={`mt-6 p-4 rounded-lg border ${
                  connectionStatus.connected &&
                  connectionStatus.geminiConfigured
                    ? "bg-green-50 border-green-200"
                    : connectionStatus.connected
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center">
                  <div className="mr-3">
                    {connectionStatus.connected &&
                    connectionStatus.geminiConfigured ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : connectionStatus.connected ? (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    {connectionStatus.connected &&
                    connectionStatus.geminiConfigured ? (
                      <span className="text-green-700">
                        ✅ Kết nối server thành công
                      </span>
                    ) : connectionStatus.connected ? (
                      <span className="text-yellow-700">
                        ⚠️ Server OK, cần cấu hình Gemini API
                      </span>
                    ) : (
                      <span className="text-red-700">
                        ❌ Không thể kết nối server
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Progress Bar & Loading */}
            {progress.show && (
              <div className="mt-6">
                <div
                  className="glass p-4 rounded-lg shadow-lg border"
                  style={{ borderColor: "#568F87" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#064232" }}
                    >
                      Tiến trình phân tích
                    </span>
                    <span className="text-sm" style={{ color: "#568F87" }}>
                      {progress.percent}%
                    </span>
                  </div>
                  <div
                    className="w-full h-3 rounded-full overflow-hidden"
                    style={{ background: "rgba(245, 186, 187, 0.3)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${progress.percent}%`,
                        background: "#568F87",
                      }}
                    ></div>
                  </div>
                  <div className="text-xs mt-2" style={{ color: "#06423299" }}>
                    {progress.message}
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {errorMsg && (
              <section
                id="error"
                className="text-center my-6 p-4 rounded-lg border"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  borderColor: "#EF4444",
                  color: "#DC2626",
                }}
              >
                <div className="flex items-start justify-center">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-800">Có lỗi xảy ra</h4>
                    <p className="text-red-700 text-sm mt-1">{errorMsg}</p>
                  </div>
                </div>
              </section>
            )}

            {/* Success message */}
            {successMsg && (
              <div
                className="fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm border"
                style={{
                  background: "rgba(34, 197, 94, 0.1)",
                  borderColor: "#22C55E",
                  color: "#16A34A",
                }}
              >
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-green-500" />
                  <span className="text-sm">{successMsg}</span>
                </div>
              </div>
            )}

            {/* ATS Info */}
            <section
              className="glass p-6 rounded-2xl shadow-lg border mt-8"
              style={{ borderColor: "#568F87" }}
            >
              <h2
                className="text-xl font-semibold mb-6 flex items-center"
                style={{ color: "#064232" }}
              >
                <Target className="h-6 w-6 mr-3" style={{ color: "#568F87" }} />
                Hệ thống ATS đánh giá CV dựa trên các tiêu chí:
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  className="p-4 rounded-lg border"
                  style={{
                    background: "#FFFFFF",
                    borderColor: "#568F87",
                  }}
                >
                  <h3 className="font-medium mb-2" style={{ color: "#064232" }}>
                    🎯 Từ khóa phù hợp (30%)
                  </h3>
                  <p className="text-sm" style={{ color: "#06423299" }}>
                    CV chứa từ khóa liên quan đến công việc trong JD
                  </p>
                </div>
                <div
                  className="p-4 rounded-lg border"
                  style={{
                    background: "#FFFFFF",
                    borderColor: "#568F87",
                  }}
                >
                  <h3 className="font-medium mb-2" style={{ color: "#064232" }}>
                    📄 Định dạng chuẩn (20%)
                  </h3>
                  <p className="text-sm" style={{ color: "#06423299" }}>
                    PDF/DOCX, font chữ đơn giản, bố cục rõ ràng
                  </p>
                </div>
                <div
                  className="p-4 rounded-lg border"
                  style={{
                    background: "#FFFFFF",
                    borderColor: "#568F87",
                  }}
                >
                  <h3 className="font-medium mb-2" style={{ color: "#064232" }}>
                    🏗️ Cấu trúc logic (15%)
                  </h3>
                  <p className="text-sm" style={{ color: "#06423299" }}>
                    Thông tin cá nhân, kinh nghiệm, kỹ năng
                  </p>
                </div>
                <div
                  className="p-4 rounded-lg border"
                  style={{
                    background: "#FFFFFF",
                    borderColor: "#568F87",
                  }}
                >
                  <h3 className="font-medium mb-2" style={{ color: "#064232" }}>
                    🎯 Phù hợp với JD (20%)
                  </h3>
                  <p className="text-sm" style={{ color: "#06423299" }}>
                    ATS so sánh CV với mô tả công việc
                  </p>
                </div>
                <div
                  className="p-4 rounded-lg border"
                  style={{
                    background: "#FFFFFF",
                    borderColor: "#568F87",
                  }}
                >
                  <h3 className="font-medium mb-2" style={{ color: "#064232" }}>
                    ✍️ Không lỗi chính tả (10%)
                  </h3>
                  <p className="text-sm" style={{ color: "#06423299" }}>
                    Grammar và spelling chính xác
                  </p>
                </div>
                <div
                  className="p-4 rounded-lg border"
                  style={{
                    background: "#FFFFFF",
                    borderColor: "#568F87",
                  }}
                >
                  <h3 className="font-medium mb-2" style={{ color: "#064232" }}>
                    🔗 Hồ sơ trực tuyến (5%)
                  </h3>
                  <p className="text-sm" style={{ color: "#06423299" }}>
                    LinkedIn, GitHub, Portfolio
                  </p>
                </div>
              </div>
            </section>

            <footer
              className="text-center mt-8 p-4"
              style={{ color: "#06423299" }}
            >
              <p>
                CV được đánh giá chi tiết theo từng tiêu chí, giúp bạn tối ưu để
                vượt qua hệ thống ATS
              </p>
              <p className="mt-2">
                Công cụ đánh giá CV theo chuẩn ATS | Gemini AI | Hỗ trợ
                Multi-PDF
              </p>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default EvaluateCV;
