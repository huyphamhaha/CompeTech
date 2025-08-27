import React, { useEffect, useState, useCallback } from "react";
import Header from "../../Header/header";
import { ArrowUp, Search, GraduationCap, Building2, Users } from "lucide-react";
const API_BASE_URL =
  import.meta.env.VITE_UNIVERSITY_API_URL || "http://localhost:8000";
import { useNavigate } from "react-router-dom";

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function countMajors(data) {
  if (!data || !data.majors) return 0;
  return Array.isArray(data.majors)
    ? data.majors.length
    : Object.keys(data.majors).length;
}

const ListUniversity = () => {
  // State
  const [universities, setUniversities] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [apiStatus, setApiStatus] = useState("loading"); // online/offline/loading
  const [successMsg, setSuccessMsg] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // API fetch
  const fetchUniversities = useCallback(
    async (search = "", type_filter = "all") => {
      setLoading(true);
      setError("");
      setApiStatus("loading");
      try {
        const params = [];
        if (search) params.push(`search=${encodeURIComponent(search)}`);
        if (type_filter && type_filter !== "all")
          params.push(`type_filter=${encodeURIComponent(type_filter)}`);
        const url = `${API_BASE_URL}/universities${
          params.length ? "?" + params.join("&") : ""
        }`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const data = await res.json();
        setUniversities(data.universities || []);
        setFiltered(data.universities || []);
        setApiStatus("online");
        setSuccessMsg(
          `Đã tải thành công ${
            data.total || (data.universities || []).length
          } trường đại học từ API!`
        );
        setTimeout(() => setSuccessMsg(""), 3000);
      } catch (err) {
        setApiStatus("offline");
        setError("Không thể kết nối API. Đang chuyển sang chế độ offline.");
        // TODO: fallback local nếu cần
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // On mount: fetch data
  useEffect(() => {
    fetchUniversities();
    // Health check định kỳ
    const interval = setInterval(() => {
      fetch(`${API_BASE_URL}/health`)
        .then((res) => {
          setApiStatus(res.ok ? "online" : "offline");
        })
        .catch(() => setApiStatus("offline"));
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchUniversities]);

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

  // Search handler
  const handleSearch = debounce((value) => {
    setSearchTerm(value);
    if (!value) {
      setFiltered(universities);
      return;
    }
    const lower = value.toLowerCase();
    setFiltered(
      universities.filter(
        (uni) =>
          (uni.code && uni.code.toLowerCase().includes(lower)) ||
          (uni.data &&
            uni.data.school_name &&
            uni.data.school_name.toLowerCase().includes(lower))
      )
    );
  }, 400);

  // Filter handler
  const handleFilter = (type) => {
    setFilter(type);
    if (type === "all") {
      setFiltered(universities);
    } else {
      setFiltered(
        universities.filter(
          (uni) =>
            uni.data &&
            uni.data.type &&
            uni.data.type.toLowerCase().includes(type.toLowerCase())
        )
      );
    }
  };

  // Card click handler
  const navigate = useNavigate();
  const handleCardClick = (schoolCode) => {
    navigate(`/university/list_job?school=${schoolCode}`);
  };

  // Stats
  const totalUniversities = universities.length;
  const totalMajors = universities.reduce((sum, uni) => {
    const data = uni.data || uni;
    return sum + (uni.major_count || data.major_count || countMajors(data));
  }, 0);
  const displayedUniversities = filtered.length;

  // UI render
  return (
    <div className="min-h-screen" style={{ background: "#FFEFF2" }}>
      {/* Top Menu Bar (có thể tách thành component sau) */}
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
          🔴 Mất kết nối với server
        </div>
      )}

      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="text-center mb-8 mt-20">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{
              background: "#FFFFFF",
              color: "#064232",
              border: "1px solid #568F87",
            }}
          >
            University Directory
          </span>
          <h1
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: "#064232" }}
          >
            🎓 Danh sách các trường đại học
          </h1>
          <p className="text-lg mb-2" style={{ color: "#06423299" }}>
            Khám phá các trường đại học và ngành học phù hợp với bạn
          </p>
          <p
            className="text-sm rounded-full px-4 py-2 inline-block"
            style={{
              background: "rgb(255, 251, 252)",
              color: "#064232",
              border: "1px solid #F5BABB",
            }}
          >
            💡 <strong>Mẹo:</strong> Click vào card trường đại học để xem danh
            sách ngành đào tạo
          </p>
        </div>

        {/* Stats */}
        <div
          className="flex flex-wrap justify-center gap-6 mb-8 glass rounded-xl p-6 shadow border"
          style={{ borderColor: "#568F87" }}
        >
          <div className="text-center">
            <div
              className="text-2xl font-bold"
              style={{ color: "#064232" }}
              id="totalUniversities"
            >
              {totalUniversities}
            </div>
            <div className="text-sm" style={{ color: "#06423299" }}>
              Tổng số trường
            </div>
          </div>
          <div className="text-center">
            <div
              className="text-2xl font-bold"
              style={{ color: "#064232" }}
              id="totalMajors"
            >
              {totalMajors}
            </div>
            <div className="text-sm" style={{ color: "#06423299" }}>
              Tổng số ngành
            </div>
          </div>
          <div className="text-center">
            <div
              className="text-2xl font-bold"
              style={{ color: "#064232" }}
              id="displayedUniversities"
            >
              {displayedUniversities}
            </div>
            <div className="text-sm" style={{ color: "#06423299" }}>
              Đang hiển thị
            </div>
          </div>
        </div>

        {/* Search */}
        <div
          className="flex flex-wrap gap-4 items-center mb-8 glass rounded-xl p-6 shadow border"
          style={{ borderColor: "#568F87" }}
        >
          <input
            type="text"
            className="flex-1 min-w-[200px] px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
            style={{
              borderColor: "#568F87",
              background: "#FFFFFF",
              color: "#064232",
            }}
            placeholder="Tìm kiếm trường đại học, mã trường, hoặc ngành học..."
            onChange={(e) => handleSearch(e.target.value)}
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
            onClick={() => handleSearch(searchTerm)}
          >
            <Search className="h-4 w-4" />
            Tìm kiếm
          </button>
          <button
            className="underline text-sm ml-2"
            style={{ color: "#EF4444" }}
            onClick={() => {
              setSearchTerm("");
              setFiltered(universities);
            }}
          >
            Xóa bộ lọc
          </button>
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

        {/* Universities grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          id="universitiesGrid"
        >
          {!loading && filtered.length === 0 && !error && (
            <div
              className="col-span-full text-center rounded-lg p-8 shadow border"
              style={{
                background: "#FFFFFF",
                borderColor: "#568F87",
                color: "#064232",
              }}
            >
              <div className="text-2xl mb-2">
                🔍 Không tìm thấy trường đại học nào phù hợp
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <button
                  className="px-4 py-2 rounded-lg text-white"
                  style={{
                    background: "linear-gradient(90deg,#064232,#568F87)",
                  }}
                  onClick={() => {
                    setSearchTerm("");
                    setFiltered(universities);
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
          {filtered.map((uni, idx) => {
            const data = uni.data || uni;
            const code = uni.code || uni.school_code;
            const majorCount =
              uni.major_count || data.major_count || countMajors(data);
            const icon = data.school_name
              ? data.school_name.charAt(0).toUpperCase()
              : code.charAt(0);
            return (
              <div
                key={code}
                className="university-card glass rounded-2xl p-6 shadow hover:shadow-lg transition cursor-pointer flex flex-col gap-2 border animate-fade-in justify-between"
                style={{
                  borderColor: "#568F87",
                  animationDelay: `${idx * 0.1}s`,
                }}
                onClick={() => handleCardClick(code)}
              >
                <div className="flex items-center mb-3">
                  <div
                    className="w-14 h-14 flex-shrink-0 rounded-full flex items-center justify-center text-2xl font-bold text-white border-4 mr-4"
                    style={{
                      background: "#568F87",
                      borderColor: "rgba(245, 186, 187, 0.3)",
                    }}
                  >
                    {icon}
                  </div>
                  <div>
                    <div
                      className="text-lg font-bold"
                      style={{ color: "#064232" }}
                    >
                      {data.school_name || "Chưa có tên trường"}
                    </div>
                    <div
                      className="text-sm font-medium"
                      style={{ color: "#06423299" }}
                    >
                      Mã trường: {code}
                    </div>
                  </div>
                </div>
                <div>
                  <div
                    className="major-count text-white px-4 py-2 rounded-full text-sm font-bold inline-block mt-2"
                    style={{ background: "#568F87" }}
                  >
                    🎓 {majorCount} ngành đào tạo
                  </div>
                </div>
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

export default ListUniversity;
