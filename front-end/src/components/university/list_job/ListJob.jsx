import React, { useEffect, useState, useCallback } from "react";
import Header from "../../Header/header";
import {
  ArrowLeft,
  ArrowUp,
  Search,
  GraduationCap,
  Building2,
  MapPin,
  Globe,
  Users,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_UNIVERSITY_API_URL || "http://localhost:8000";

function getSchoolCodeFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("school") || "";
}

const ListJob = () => {
  // State
  const [university, setUniversity] = useState(null);
  const [majors, setMajors] = useState([]);
  const [filteredMajors, setFilteredMajors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [availableMethods, setAvailableMethods] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [apiStatus, setApiStatus] = useState("loading");
  const [successMsg, setSuccessMsg] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // API fetch
  const fetchUniversityData = useCallback(async () => {
    setLoading(true);
    setError("");
    setApiStatus("loading");
    const schoolCode = getSchoolCodeFromURL();
    if (!schoolCode) {
      setError("Không tìm thấy mã trường trong URL");
      setLoading(false);
      return;
    }
    try {
      // Fetch university info
      const uniRes = await fetch(`${API_BASE_URL}/universities/${schoolCode}`);
      if (!uniRes.ok)
        throw new Error(`HTTP ${uniRes.status}: ${uniRes.statusText}`);
      const uniData = await uniRes.json();
      setUniversity(uniData);
      // Fetch majors
      const majorsRes = await fetch(
        `${API_BASE_URL}/universities/${schoolCode}`
      );
      if (!majorsRes.ok)
        throw new Error(`HTTP ${majorsRes.status}: ${majorsRes.statusText}`);
      const majorsData = await majorsRes.json();
      // Parse majors from tables
      let allMajors = [];
      let methods = new Set();
      let years = new Set();
      if (majorsData.tables && majorsData.tables.length > 0) {
        majorsData.tables.forEach((table) => {
          if (table.data && Array.isArray(table.data)) {
            // Parse method & year from table title
            const yearMatch = table.table_title.match(/năm\s*(\d{4})/i);
            const year = yearMatch ? yearMatch[1] : null;
            let method = table.table_title;
            if (yearMatch)
              method = table.table_title.replace(/năm\s*\d{4}/i, "").trim();
            method = method
              .replace(/^Điểm chuẩn theo phương thức\s*/i, "")
              .trim();
            if (method) methods.add(method);
            if (year) years.add(year);
            table.data.forEach((major) => {
              allMajors.push({
                ...major,
                table_title: table.table_title,
                method,
                year,
              });
            });
          }
        });
      }
      setMajors(allMajors);
      setFilteredMajors(allMajors);
      setAvailableMethods(Array.from(methods).sort());
      setAvailableYears(Array.from(years).sort((a, b) => b - a));
      setApiStatus("online");
      setSuccessMsg(`Đã tải xong ${allMajors.length} ngành!`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setApiStatus("offline");
      setError("Không thể tải dữ liệu: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount: fetch data
  useEffect(() => {
    fetchUniversityData();
    // Health check định kỳ
    const interval = setInterval(() => {
      fetch(`${API_BASE_URL}/health`)
        .then((res) => {
          setApiStatus(res.ok ? "online" : "offline");
        })
        .catch(() => setApiStatus("offline"));
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchUniversityData]);

  // Handle scroll event to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Search/filter handler
  useEffect(() => {
    let data = majors;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(
        (major) =>
          (major["Tên ngành"] &&
            major["Tên ngành"].toLowerCase().includes(lower)) ||
          (major["Tổ hợp môn"] &&
            major["Tổ hợp môn"].toLowerCase().includes(lower)) ||
          (major["Mã ngành"] && major["Mã ngành"].toLowerCase().includes(lower))
      );
    }
    if (scoreFilter !== "all") {
      data = data.filter((major) => {
        const score = parseFloat(major["Điểm chuẩn"]) || 0;
        switch (scoreFilter) {
          case "high":
            return score > 25;
          case "medium":
            return score >= 20 && score <= 25;
          case "low":
            return score < 20 && score > 0;
          default:
            return true;
        }
      });
    }
    if (methodFilter !== "all") {
      data = data.filter((major) => major.method === methodFilter);
    }
    if (yearFilter !== "all") {
      data = data.filter((major) => major.year === yearFilter);
    }
    setFilteredMajors(data);
  }, [majors, searchTerm, scoreFilter, methodFilter, yearFilter]);

  // UI render
  return (
    <div className="min-h-screen" style={{ background: "#FFEFF2" }}>
      {/* Top Menu Bar */}
      <Header />

      {/* API Status */}
      <div
        className={`fixed top-20 right-6 px-4 py-2 rounded-full text-white text-sm z-50 flex items-center gap-2 ${
          apiStatus === "online"
            ? "bg-green-600"
            : apiStatus === "offline"
            ? "bg-red-600"
            : "bg-yellow-500 animate-pulse"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
        {apiStatus === "online" && <span>🟢 API Online</span>}
        {apiStatus === "offline" && <span>🔴 API Offline</span>}
        {apiStatus === "loading" && <span>🟡 Đang kết nối...</span>}
      </div>

      {/* Offline Banner */}
      {apiStatus === "offline" && (
        <div className="fixed top-16 left-0 right-0 bg-red-600 text-white text-center font-bold py-3 z-40 animate-slide-in-down">
          ⚠️ Không thể kết nối với server. Một số tính năng có thể không hoạt
          động.
        </div>
      )}

      <div className="max-w-5xl mx-auto py-10 px-4">
        {/* University Header */}
        <div className="text-center mb-8 mt-20">
          {/* Back button - góc trái trên */}
          <button
            onClick={() => window.history.back()}
            className="absolute top-32 left-6 flex items-center space-x-2 px-3 py-2 rounded-lg shadow-md transition-all duration-200 border"
            style={{
              background: "#FFFFFF",
              color: "#064232",
              borderColor: "#568F87",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(245, 186, 187, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#FFFFFF";
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Quay lại</span>
          </button>

          <div className="flex flex-col items-center mb-4">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white border-4 mb-4"
              style={{
                background: "#568F87",
                borderColor: "rgba(245, 186, 187, 0.3)",
              }}
            >
              {university && university.school_name
                ? university.school_name.charAt(0).toUpperCase()
                : university && university.school_code
                ? university.school_code.charAt(0)
                : "🏛️"}
            </div>
            <div
              className="university-name glass rounded-2xl py-4 px-6 text-2xl font-bold shadow mb-2 border"
              style={{
                color: "#064232",
                borderColor: "#568F87",
              }}
            >
              {university
                ? university.school_name || `Trường ${university.school_code}`
                : "Đang tải..."}
            </div>
            <div
              className="university-code text-lg mb-2"
              style={{ color: "#06423299" }}
            >
              {university
                ? `Mã trường: ${university.school_code}`
                : "Mã trường: ..."}
            </div>
            <div className="university-meta flex flex-wrap gap-4 justify-center mt-2">
              {university && university.location && (
                <div
                  className="meta-item rounded-full px-4 py-2 flex items-center gap-2"
                  style={{
                    background: "#fce3e1",
                    color: "#064232",
                    border: "1px solid #F5BABB",
                  }}
                >
                  <MapPin className="h-4 w-4" />
                  {university.location}
                </div>
              )}
              {university && university.type && (
                <div
                  className="meta-item rounded-full px-4 py-2 flex items-center gap-2"
                  style={{
                    background: "#fffbfc",
                    color: "#064232",
                    border: "1px solid #F5BABB",
                  }}
                >
                  <Building2 className="h-4 w-4" />
                  {university.type}
                </div>
              )}
              {university && university.website && (
                <div
                  className="meta-item rounded-full px-4 py-2 flex items-center gap-2"
                  style={{
                    background: "#fffbfc",
                    color: "#064232",
                    border: "1px solid #F5BABB",
                  }}
                >
                  <Globe className="h-4 w-4" />
                  <a
                    href={university.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Website
                  </a>
                </div>
              )}
              {university && university.major_count && (
                <div
                  className="meta-item rounded-full px-4 py-2 flex items-center gap-2"
                  style={{
                    background: "#fffbfc",
                    color: "#064232",
                    border: "1px solid #F5BABB",
                  }}
                >
                  <GraduationCap className="h-4 w-4" />
                  {university.major_count} ngành đào tạo
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div
          className="glass rounded-xl p-6 shadow mb-8 border"
          style={{ borderColor: "#568F87" }}
        >
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <input
              type="text"
              className="flex-1 min-w-[200px] px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
              style={{
                borderColor: "#568F87",
                background: "#FFFFFF",
                color: "#064232",
              }}
              placeholder="Tìm kiếm ngành học, tổ hợp môn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="text-white font-bold px-6 py-3 rounded-lg shadow transition flex items-center gap-2"
              style={{ background: "linear-gradient(90deg,#064232,#568F87)" }}
              onMouseEnter={(e) => {
                e.target.style.background =
                  "linear-gradient(90deg,#568F87,#064232)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background =
                  "linear-gradient(90deg,#064232,#568F87)";
              }}
              onClick={() => setSearchTerm(searchTerm)}
            >
              <Search className="h-4 w-4" />
              Tìm kiếm
            </button>
            <button
              className="underline text-sm ml-2"
              style={{ color: "#EF4444" }}
              onClick={() => {
                setSearchTerm("");
                setScoreFilter("all");
                setMethodFilter("all");
                setYearFilter("all");
              }}
            >
              Xóa bộ lọc
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-6">
            {/* Score Filter */}
            <div className="flex flex-col gap-2 items-center">
              <span className="font-semibold" style={{ color: "#064232" }}>
                📊 Điểm chuẩn:
              </span>
              <div className="flex gap-2 flex-wrap">
                <button
                  className={`filter-btn px-4 py-2 rounded-full border-2 transition ${
                    scoreFilter === "all"
                      ? "text-white border-transparent"
                      : "border-2"
                  }`}
                  style={
                    scoreFilter === "all"
                      ? { background: "linear-gradient(90deg,#064232,#568F87)" }
                      : {
                          background: "#FFFFFF",
                          color: "#064232",
                          borderColor: "#568F87",
                        }
                  }
                  onClick={() => setScoreFilter("all")}
                >
                  Tất cả
                </button>
                <button
                  className={`filter-btn px-4 py-2 rounded-full border-2 transition ${
                    scoreFilter === "high"
                      ? "text-white border-transparent"
                      : "border-2"
                  }`}
                  style={
                    scoreFilter === "high"
                      ? { background: "linear-gradient(90deg,#064232,#568F87)" }
                      : {
                          background: "#FFFFFF",
                          color: "#064232",
                          borderColor: "#568F87",
                        }
                  }
                  onClick={() => setScoreFilter("high")}
                >
                  Cao (&gt;25)
                </button>
                <button
                  className={`filter-btn px-4 py-2 rounded-full border-2 transition ${
                    scoreFilter === "medium"
                      ? "text-white border-transparent"
                      : "border-2"
                  }`}
                  style={
                    scoreFilter === "medium"
                      ? { background: "linear-gradient(90deg,#064232,#568F87)" }
                      : {
                          background: "#FFFFFF",
                          color: "#064232",
                          borderColor: "#568F87",
                        }
                  }
                  onClick={() => setScoreFilter("medium")}
                >
                  Trung bình (20-25)
                </button>
                <button
                  className={`filter-btn px-4 py-2 rounded-full border-2 transition ${
                    scoreFilter === "low"
                      ? "text-white border-transparent"
                      : "border-2"
                  }`}
                  style={
                    scoreFilter === "low"
                      ? { background: "linear-gradient(90deg,#064232,#568F87)" }
                      : {
                          background: "#FFFFFF",
                          color: "#064232",
                          borderColor: "#568F87",
                        }
                  }
                  onClick={() => setScoreFilter("low")}
                >
                  Thấp (&lt;20)
                </button>
              </div>
            </div>
            {/* Method Filter */}
            <div className="flex flex-col gap-2 items-center">
              <span className="font-semibold" style={{ color: "#064232" }}>
                🎯 Phương thức:
              </span>
              <div className="flex gap-2 flex-wrap">
                <button
                  className={`filter-btn px-4 py-2 rounded-full border-2 transition ${
                    methodFilter === "all"
                      ? "text-white border-transparent"
                      : "border-2"
                  }`}
                  style={
                    methodFilter === "all"
                      ? { background: "linear-gradient(90deg,#064232,#568F87)" }
                      : {
                          background: "#FFFFFF",
                          color: "#064232",
                          borderColor: "#568F87",
                        }
                  }
                  onClick={() => setMethodFilter("all")}
                >
                  Tất cả
                </button>
                {availableMethods.map((method) => (
                  <button
                    key={method}
                    className={`filter-btn px-4 py-2 rounded-full border-2 transition ${
                      methodFilter === method
                        ? "text-white border-transparent"
                        : "border-2"
                    }`}
                    style={
                      methodFilter === method
                        ? {
                            background:
                              "linear-gradient(90deg,#064232,#568F87)",
                          }
                        : {
                            background: "#FFFFFF",
                            color: "#064232",
                            borderColor: "#568F87",
                          }
                    }
                    onClick={() => setMethodFilter(method)}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
            {/* Year Filter */}
            <div className="flex flex-col gap-2 items-center">
              <span className="font-semibold" style={{ color: "#064232" }}>
                📅 Năm học:
              </span>
              <div className="flex gap-2 flex-wrap">
                <button
                  className={`filter-btn px-4 py-2 rounded-full border-2 transition ${
                    yearFilter === "all"
                      ? "text-white border-transparent"
                      : "border-2"
                  }`}
                  style={
                    yearFilter === "all"
                      ? { background: "linear-gradient(90deg,#064232,#568F87)" }
                      : {
                          background: "#FFFFFF",
                          color: "#064232",
                          borderColor: "#568F87",
                        }
                  }
                  onClick={() => setYearFilter("all")}
                >
                  Tất cả
                </button>
                {availableYears.map((year) => (
                  <button
                    key={year}
                    className={`filter-btn px-4 py-2 rounded-full border-2 transition ${
                      yearFilter === year
                        ? "text-white border-transparent"
                        : "border-2"
                    }`}
                    style={
                      yearFilter === year
                        ? {
                            background:
                              "linear-gradient(90deg,#064232,#568F87)",
                          }
                        : {
                            background: "#FFFFFF",
                            color: "#064232",
                            borderColor: "#568F87",
                          }
                    }
                    onClick={() => setYearFilter(year)}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Success message */}
        {successMsg && (
          <div
            className="border px-4 py-3 rounded-lg shadow mb-4 text-center animate-fade-in"
            style={{
              background: "rgba(34, 197, 94, 0.1)",
              borderColor: "#22C55E",
              color: "#16A34A",
            }}
          >
            {successMsg}
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="border px-4 py-3 rounded-lg shadow mb-4 text-center animate-fade-in"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              borderColor: "#EF4444",
              color: "#DC2626",
            }}
          >
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div
              className="w-12 h-12 border-4 rounded-full animate-spin mb-4"
              style={{
                borderColor: "rgba(245, 186, 187, 0.3)",
                borderTopColor: "#568F87",
              }}
            ></div>
            <div className="font-medium" style={{ color: "#064232" }}>
              Đang tải dữ liệu...
            </div>
          </div>
        )}

        {/* Majors grid */}
        <div
          className="majors-grid grid grid-cols-1 md:grid-cols-2 gap-6"
          id="majorsGrid"
        >
          {!loading && filteredMajors.length === 0 && !error && (
            <div
              className="col-span-full text-center rounded-lg p-8 shadow border"
              style={{
                background: "#FFFFFF",
                borderColor: "#568F87",
                color: "#064232",
              }}
            >
              <div className="text-2xl mb-2">
                🔍 Không tìm thấy ngành học nào phù hợp
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <button
                  className="px-4 py-2 rounded-lg text-white"
                  style={{
                    background: "linear-gradient(90deg,#064232,#568F87)",
                  }}
                  onClick={() => {
                    setSearchTerm("");
                    setScoreFilter("all");
                    setMethodFilter("all");
                    setYearFilter("all");
                  }}
                >
                  Xóa bộ lọc
                </button>
                <button
                  className="px-4 py-2 rounded-lg"
                  style={{
                    background: "#FFFFFF",
                    color: "#064232",
                    border: "1px solid #568F87",
                  }}
                  onClick={() => window.location.reload()}
                >
                  Tải lại trang
                </button>
              </div>
            </div>
          )}
          {filteredMajors.map((major, idx) => {
            const majorIcon = major["Tên ngành"]
              ? major["Tên ngành"].charAt(0).toUpperCase()
              : "🎓";
            const score = major["Điểm chuẩn"] || "Chưa công bố";
            const subjects = major["Tổ hợp môn"]
              ? major["Tổ hợp môn"].split(";").map((s) => s.trim())
              : [];
            return (
              <div
                key={major["Mã ngành"] + idx}
                className="major-card glass rounded-2xl p-6 shadow hover:shadow-lg transition flex flex-col gap-2 border animate-fade-in"
                style={{
                  borderColor: "#568F87",
                  animationDelay: `${idx * 0.1}s`,
                }}
              >
                <div
                  className="major-name flex items-center gap-3 text-lg font-bold mb-2"
                  style={{ color: "#064232" }}
                >
                  <div
                    className="major-icon w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center text-2xl font-bold text-white border-2"
                    style={{
                      background: "#568F87",
                      borderColor: "rgba(245, 186, 187, 0.3)",
                    }}
                  >
                    {majorIcon}
                  </div>
                  {major["Tên ngành"] || "Chưa có tên ngành"}
                </div>

                <div className="major-info flex flex-col gap-2 mb-2">
                  {subjects.length > 0 && (
                    <div className="info-row flex gap-2 items-center text-sm">
                      <span
                        className="info-label font-semibold"
                        style={{ color: "#064232" }}
                      >
                        📚 Tổ hợp môn:
                      </span>
                      <div className="info-value flex flex-wrap gap-1">
                        {subjects.map((subject, i) => (
                          <span
                            key={i}
                            className="subject-combo px-2 py-1 rounded-full border text-xs font-medium mr-1 mb-1"
                            style={{
                              background: "rgba(245, 186, 187, 0.1)",
                              color: "#064232",
                              borderColor: "#F5BABB",
                            }}
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="info-row flex gap-2 items-center text-sm">
                    <span
                      className="info-label font-semibold"
                      style={{ color: "#064232" }}
                    >
                      📈 Điểm chuẩn:
                    </span>
                    <span className="info-value">
                      <span
                        className="score-highlight text-white px-3 py-1 rounded-full font-bold text-sm"
                        style={{ background: "#568F87" }}
                      >
                        {score}
                      </span>
                    </span>
                  </div>
                  {major["Chỉ tiêu"] && (
                    <div className="info-row flex gap-2 items-center text-sm">
                      <span
                        className="info-label font-semibold"
                        style={{ color: "#064232" }}
                      >
                        👥 Chỉ tiêu:
                      </span>
                      <span
                        className="info-value"
                        style={{ color: "#06423299" }}
                      >
                        {major["Chỉ tiêu"]} sinh viên
                      </span>
                    </div>
                  )}
                  {major["Mã ngành"] && (
                    <div className="info-row flex gap-2 items-center text-sm">
                      <span
                        className="info-label font-semibold"
                        style={{ color: "#064232" }}
                      >
                        🔖 Mã ngành:
                      </span>
                      <span
                        className="info-value"
                        style={{ color: "#06423299" }}
                      >
                        {major["Mã ngành"]}
                      </span>
                    </div>
                  )}
                  {(major.method || major.year) && (
                    <div className="info-row flex gap-2 items-center text-sm">
                      <span
                        className="info-label font-semibold"
                        style={{ color: "#064232" }}
                      >
                        📋 Phương thức:
                      </span>
                      <span
                        className="info-value font-bold"
                        style={{ color: "#06423299" }}
                      >
                        {major.method || "Chưa xác định"}
                        {major.year ? ` (${major.year})` : ""}
                      </span>
                    </div>
                  )}
                </div>
                {major["Ghi chú"] && (
                  <div
                    className="note-section border-l-4 p-3 rounded text-sm mt-2"
                    style={{
                      background: "rgba(245, 186, 187, 0.1)",
                      borderLeftColor: "#568F87",
                      color: "#064232",
                    }}
                  >
                    <strong>📝 Ghi chú:</strong> {major["Ghi chú"]}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 w-12 h-12 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center z-50"
            style={{ background: "linear-gradient(90deg,#064232,#568F87)" }}
            aria-label="Cuộn lên đầu trang"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ListJob;
