import React, { useState, useEffect } from "react";
import Header from "../Header/header";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowUp,
  Search,
  GraduationCap,
  Building2,
  Users,
  BookOpen,
  Target,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_MAJOR_API_URL || "http://localhost:8001";

// Helper function để tạo slug từ tên ngành
const createSlugFromName = (name) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s_]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .trim("_");
};

const icons = [
  "📊",
  "💰",
  "📈",
  "💻",
  "💡",
  "📢",
  "📚",
  "⚕️",
  "🐾",
  "🛡️",
  "🎮",
  "🏗️",
  "🌐",
  "🚢",
  "🏨",
  "🚗",
  "⚡",
  "🌊",
  "🚀",
  "🔬",
  "🥫",
  "🖨️",
  "🧬",
  "⚖️",
  "⛏️",
  "🎨",
  "🌱",
  "🧠",
  "⚽",
  "👗",
  "🦐",
  "➗",
  "👥",
  "🏛️",
  "🧪",
];

export default function MajorPage() {
  const { majorSlug } = useParams();
  const navigate = useNavigate();
  const [majorGroups, setMajorGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [majorsList, setMajorsList] = useState([]);
  const [tab, setTab] = useState("overview");
  const [majorTabsContent, setMajorTabsContent] = useState({});
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Load major groups on component mount
  useEffect(() => {
    const loadMajorGroups = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/api/majors`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setMajorGroups(data?.major_groups || []);
      } catch (err) {
        console.error("Error loading major groups:", err);
        setError("Không thể tải danh sách nhóm ngành. Vui lòng thử lại.");
        setMajorGroups([]);
      } finally {
        setLoading(false);
      }
    };

    loadMajorGroups();
  }, []);

  // Handle URL parameter for major detail
  useEffect(() => {
    if (majorSlug && majorGroups.length > 0) {
      const foundGroup = majorGroups.find((group) => {
        const groupSlug = createSlugFromName(group.name);
        return groupSlug === majorSlug;
      });
      if (foundGroup) {
        setDetail(foundGroup);
      }
    }
  }, [majorSlug, majorGroups]);

  // Load detail data when detail changes
  useEffect(() => {
    if (!detail?.filename) return;

    const loadDetailData = async () => {
      try {
        setDetailData(null);
        setMajorsList([]);
        setTab("overview");
        setMajorTabsContent({});

        const [detailResponse, majorsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/major/${detail.filename}`),
          fetch(`${API_BASE_URL}/api/major/${detail.filename}/majors`),
        ]);

        if (!detailResponse.ok || !majorsResponse.ok) {
          throw new Error("Failed to fetch detail data");
        }

        const [detailData, majorsData] = await Promise.all([
          detailResponse.json(),
          majorsResponse.json(),
        ]);

        setDetailData(detailData);
        setMajorsList(majorsData?.majors || []);
      } catch (err) {
        console.error("Error loading detail data:", err);
        setDetailData(null);
        setMajorsList([]);
      }
    };

    loadDetailData();
  }, [detail]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;

    try {
      setSearchResults({ loading: true, query: search });

      const response = await fetch(
        `${API_BASE_URL}/api/search?query=${encodeURIComponent(search.trim())}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults({
        ...data,
        loading: false,
        query: search.trim(),
        error: false,
      });
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults({
        error: true,
        loading: false,
        query: search.trim(),
        results: [],
        total: 0,
      });
    }
  };

  const loadMajorTab = async (majorIdx) => {
    if (!detail?.filename || majorIdx < 0) return;

    // If already loaded, just switch tab
    if (majorTabsContent[majorIdx] && !majorTabsContent[majorIdx].loading) {
      setTab(`major-${majorIdx}`);
      return;
    }

    try {
      setMajorTabsContent((prev) => ({
        ...prev,
        [majorIdx]: { loading: true },
      }));

      const response = await fetch(
        `${API_BASE_URL}/api/major/${detail.filename}/major/${majorIdx}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setMajorTabsContent((prev) => ({
        ...prev,
        [majorIdx]: {
          ...data.major,
          loading: false,
          error: false,
        },
      }));

      setTab(`major-${majorIdx}`);
    } catch (err) {
      console.error("Error loading major tab:", err);
      setMajorTabsContent((prev) => ({
        ...prev,
        [majorIdx]: {
          error: true,
          loading: false,
        },
      }));
      setTab(`major-${majorIdx}`);
    }
  };

  const clearSearch = () => {
    setSearchResults(null);
    setSearch("");
  };

  const goBack = () => {
    setDetail(null);
    setDetailData(null);
    setMajorsList([]);
    setMajorTabsContent({});
    setTab("overview");
    navigate("/major");
  };

  const handleMajorGroupClick = (group) => {
    if (group && group.name) {
      const slug = createSlugFromName(group.name);
      navigate(`/major/${slug}`);
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Handle scroll event to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#FFEFF2" }}>
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-10 py-10 mt-10">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{
              background: "#fffbfc",
              color: "#064232",
              border: "1px solid #F5BABB",
            }}
          >
            Major Groups Directory
          </span>
          <h1
            className="text-4xl mb-2 font-extrabold"
            style={{ color: "#064232" }}
          >
            🎓 Danh sách nhóm ngành đào tạo
          </h1>
          <p className="text-lg font-medium" style={{ color: "#06423299" }}>
            Khám phá các nhóm ngành và tìm hiểu thông tin tuyển sinh chi tiết
          </p>
        </div>

        {/* Search */}
        <div
          className="glass p-6 rounded-2xl shadow-lg mb-8 border"
          style={{ borderColor: "#568F87" }}
        >
          <form
            className="flex flex-col sm:flex-row gap-4 mb-4"
            onSubmit={handleSearch}
          >
            <input
              type="text"
              className="flex-1 p-4 border-2 rounded-lg text-base focus:outline-none transition-all"
              style={{
                borderColor: "#568F87",
                background: "#FFFFFF",
                color: "#064232",
              }}
              placeholder="Tìm kiếm trường đại học, ngành học..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="p-4 px-6 text-white rounded-lg font-semibold shadow transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(90deg,#064232,#568F87)" }}
              onMouseLeave={(e) => {
                e.target.style.background =
                  "linear-gradient(90deg,#064232,#568F87)";
              }}
              type="submit"
              disabled={!search.trim()}
            >
              <Search className="h-4 w-4" />
              Tìm kiếm
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="border px-4 py-3 rounded-lg mb-6"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              borderColor: "#EF4444",
              color: "#DC2626",
            }}
          >
            {error}
          </div>
        )}

        {/* Search Results */}
        {searchResults && (
          <div
            className="glass rounded-2xl shadow-lg p-6 mt-6 border"
            style={{ borderColor: "#568F87" }}
          >
            {searchResults.loading ? (
              <div
                className="text-center py-10 flex flex-col items-center"
                style={{ color: "#06423299" }}
              >
                <Spinner />
                Đang tìm kiếm...
              </div>
            ) : searchResults.error ? (
              <div
                className="text-center py-6 rounded-lg"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#DC2626",
                }}
              >
                Lỗi tìm kiếm. Vui lòng thử lại.
              </div>
            ) : !searchResults.results || searchResults.results.length === 0 ? (
              <div className="text-center py-10" style={{ color: "#06423299" }}>
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: "#064232" }}
                >
                  ❌ Không tìm thấy kết quả
                </h3>
                <p>
                  Không có kết quả nào cho từ khóa{" "}
                  <strong>"{searchResults.query}"</strong>
                </p>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <h3
                    className="text-lg font-extrabold"
                    style={{ color: "#064232" }}
                  >
                    🔍 Kết quả tìm kiếm cho{" "}
                    <strong>"{searchResults.query}"</strong>
                  </h3>
                  <p
                    className="text-sm font-bold"
                    style={{ color: "#06423299" }}
                  >
                    Tìm thấy {searchResults.total || 0} kết quả
                  </p>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {searchResults.results.map((result, idx) => (
                    <div
                      className="p-5 border rounded-lg hover:bg-opacity-50 transition"
                      style={{
                        borderColor: "#568F87",
                        background: "rgba(245, 186, 187, 0.1)",
                      }}
                      key={`search-result-${idx}`}
                    >
                      <div
                        className="font-bold mb-2 text-base"
                        style={{ color: "#064232" }}
                      >
                        {result.truong || "Tên trường không xác định"}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <strong style={{ color: "#064232" }}>
                            Nhóm ngành:
                          </strong>{" "}
                          <span style={{ color: "#06423299" }}>
                            {result.nhom_nganh || "N/A"}
                          </span>
                        </div>
                        <div>
                          <strong style={{ color: "#064232" }}>Ngành:</strong>{" "}
                          <span style={{ color: "#06423299" }}>
                            {result.nganh || "N/A"}
                          </span>
                        </div>
                        <div>
                          <strong style={{ color: "#064232" }}>
                            Chuyên ngành:
                          </strong>{" "}
                          <span style={{ color: "#06423299" }}>
                            {result.chuyen_nganh || "N/A"}
                          </span>
                        </div>
                        <div>
                          <strong
                            style={{ color: "#01302399", fontWeight: "600" }}
                          >
                            Tổ hợp môn:
                          </strong>{" "}
                          <span style={{ color: "#06423299" }}>
                            {result.to_hop_mon || "Chưa cập nhật"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-4 flex-wrap mt-3">
                        <span className="flex items-center gap-2">
                          <strong style={{ color: "#064232" }}>
                            Điểm 2024:
                          </strong>
                          <span
                            className="px-2 py-1 rounded font-bold text-white"
                            style={{ background: "#568F87" }}
                          >
                            {result.diem_chuan_2024 || "Chưa có"}
                          </span>
                        </span>
                        <span className="flex items-center gap-2">
                          <strong style={{ color: "#064232" }}>
                            Điểm 2023:
                          </strong>
                          <span
                            className="px-2 py-1 rounded font-bold text-white"
                            style={{ background: "#568F87" }}
                          >
                            {result.diem_chuan_2023 || "Chưa có"}
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <button
              className="mt-6 px-4 py-2 rounded-lg font-bold transition"
              style={{
                background: "rgba(245, 186, 187, 0.1)",
                color: "#064232",
                border: "1px solid #F5BABB",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(245, 186, 187, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(245, 186, 187, 0.1)";
              }}
              onClick={clearSearch}
            >
              ← Quay lại
            </button>
          </div>
        )}

        {/* Major Groups */}
        {!searchResults && !detail && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
            {loading ? (
              <div
                className="col-span-full text-center py-10 flex flex-col items-center"
                style={{ color: "#06423299" }}
              >
                <Spinner />
                Đang tải dữ liệu...
              </div>
            ) : majorGroups.length === 0 ? (
              <div
                className="col-span-full text-center py-10"
                style={{ color: "#06423299" }}
              >
                <p>Không có dữ liệu nhóm ngành</p>
              </div>
            ) : (
              majorGroups.map((group, idx) => (
                <div
                  className="glass p-8 rounded-2xl shadow-xl cursor-pointer text-center relative overflow-hidden border hover:-translate-y-2 hover:shadow-2xl transition"
                  style={{ borderColor: "#568F87" }}
                  key={group?.filename || `group-${idx}`}
                  onClick={() => handleMajorGroupClick(group)}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-4 mx-auto"
                    style={{ background: "#fce3e1" }}
                  >
                    {icons[idx % icons.length]}
                  </div>
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{ color: "#064232" }}
                  >
                    {group?.name || "Nhóm chưa có tên"}
                  </h3>
                </div>
              ))
            )}
          </div>
        )}

        {/* Major Detail */}
        {detail && (
          <div
            className="glass rounded-2xl shadow-lg overflow-hidden border mb-10"
            style={{ borderColor: "#568F87" }}
          >
            <div
              className="px-8 py-8 text-white"
              style={{ background: "linear-gradient(90deg,#064232,#568F87)" }}
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <button
                  className="bg-white/20 text-white border-2 border-white/30 px-4 py-2 rounded-lg hover:bg-white/30 hover:border-white/50 transition text-sm font-bold"
                  onClick={goBack}
                >
                  ← Quay lại
                </button>
                <h2 className="flex-1 text-center text-2xl font-extrabold">
                  {detail?.name || "Nhóm ngành không xác định"}
                </h2>
                <div></div>
              </div>
              {detailData?.statistics && (
                <div className="bg-white/20 p-5 rounded-xl mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-extrabold">
                      {detailData.statistics.total_majors || 0}
                    </div>
                    <div className="text-sm font-bold opacity-80">Ngành</div>
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold">
                      {detailData.statistics.total_schools || 0}
                    </div>
                    <div className="text-sm font-bold opacity-80">Trường</div>
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold">
                      {detailData.statistics.total_programs || 0}
                    </div>
                    <div className="text-sm font-bold opacity-80">
                      Chương trình
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div
              className="border-b"
              style={{
                borderColor: "#568F87",
                background: "rgba(245, 186, 187, 0.05)",
              }}
            >
              <div className="flex flex-nowrap overflow-x-auto">
                <button
                  className={`px-6 py-4 text-sm font-bold border-t-4 transition whitespace-nowrap ${
                    tab === "overview" ? "font-bold" : "hover:opacity-80"
                  }`}
                  style={
                    tab === "overview"
                      ? {
                          color: "#064232",
                          borderTopColor: "#568F87",
                          background: "#FFFFFF",
                        }
                      : {
                          color: "#06423299",
                          borderTopColor: "transparent",
                          background: "transparent",
                        }
                  }
                  onClick={() => setTab("overview")}
                >
                  📊 Tổng quan
                </button>
                {majorsList.map((major, idx) => (
                  <button
                    key={`major-tab-${idx}`}
                    className={`px-6 py-4 text-sm font-bold border-t-4 transition whitespace-nowrap ${
                      tab === `major-${idx}` ? "font-bold" : "hover:opacity-80"
                    }`}
                    style={
                      tab === `major-${idx}`
                        ? {
                            color: "#064232",
                            borderTopColor: "#568F87",
                            background: "#FFFFFF",
                          }
                        : {
                            color: "#06423299",
                            borderTopColor: "transparent",
                            background: "transparent",
                          }
                    }
                    onClick={() => loadMajorTab(idx)}
                  >
                    {major?.name || "Ngành chưa có tên"}
                    <small className="opacity-70 ml-1">
                      ({major?.school_count || 0} trường)
                    </small>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {tab === "overview" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {majorsList.length === 0 ? (
                    <div
                      className="col-span-full text-center py-10"
                      style={{ color: "#06423299" }}
                    >
                      <p>Chưa có dữ liệu ngành học</p>
                    </div>
                  ) : (
                    majorsList.map((major, idx) => (
                      <div
                        className="p-6 rounded-xl border-l-4 cursor-pointer hover:-translate-y-1 shadow transition"
                        style={{
                          background: "rgba(245, 186, 187, 0.1)",
                          borderLeftColor: "#568F87",
                        }}
                        key={`major-overview-${idx}`}
                        onClick={() => loadMajorTab(idx)}
                      >
                        <h4
                          className="font-bold mb-2"
                          style={{ color: "#064232" }}
                        >
                          {major?.name || "Ngành chưa có tên"}
                        </h4>
                        <div
                          className="flex gap-4 text-sm font-bold"
                          style={{ color: "#06423299" }}
                        >
                          <span>🏫 {major?.school_count || 0} trường</span>
                          <span>
                            📚 {major?.program_count || 0} chương trình
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <MajorTabContent
                  content={majorTabsContent[parseInt(tab.split("-")[1])]}
                  majorIndex={parseInt(tab.split("-")[1])}
                />
              )}
            </div>
          </div>
        )}

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
}

function Spinner() {
  return (
    <div
      className="w-10 h-10 border-4 rounded-full animate-spin mb-4"
      style={{
        borderColor: "rgba(245, 186, 187, 0.3)",
        borderTopColor: "#568F87",
      }}
    ></div>
  );
}

function MajorTabContent({ content, majorIndex }) {
  const [filter, setFilter] = useState("");

  if (!content) {
    return (
      <div
        className="text-center py-10 flex flex-col items-center"
        style={{ color: "#06423299" }}
      >
        <Spinner />
        Đang tải dữ liệu ngành...
      </div>
    );
  }

  if (content.loading) {
    return (
      <div
        className="text-center py-10 flex flex-col items-center"
        style={{ color: "#06423299" }}
      >
        <Spinner />
        Đang tải dữ liệu ngành...
      </div>
    );
  }

  if (content.error) {
    return (
      <div
        className="text-center py-6 rounded-lg"
        style={{
          background: "rgba(239, 68, 68, 0.1)",
          color: "#DC2626",
        }}
      >
        Lỗi tải dữ liệu ngành. Vui lòng thử lại.
      </div>
    );
  }

  const schools = content.data || [];
  const filteredSchools = schools.filter((school) =>
    (school?.ten_truong || "").toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Filter */}
      <div
        className="p-4 rounded-xl"
        style={{ background: "rgba(245, 186, 187, 0.1)" }}
      >
        <input
          type="text"
          className="w-full p-3 border-2 rounded-lg text-sm focus:outline-none transition-all"
          style={{
            borderColor: "#568F87",
            background: "#FFFFFF",
            color: "#064232",
          }}
          placeholder="Lọc theo tên trường..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* School List */}
      <div className="space-y-6">
        {filteredSchools.length === 0 ? (
          <div className="text-center py-10" style={{ color: "#06423299" }}>
            {filter ? (
              <p>Không tìm thấy trường nào với từ khóa "{filter}"</p>
            ) : (
              <p>Chưa có dữ liệu trường học</p>
            )}
          </div>
        ) : (
          filteredSchools.map((school, idx) => (
            <div
              className="glass p-6 rounded-xl shadow border-l-4"
              style={{ borderLeftColor: "#568F87" }}
              key={`school-${majorIndex}-${idx}`}
            >
              <div
                className="text-lg font-extrabold mb-3"
                style={{ color: "#064232" }}
              >
                {school?.ten_truong || "Tên trường không xác định"}
              </div>

              {/* Programs */}
              <div className="space-y-3">
                {(school?.data_school || []).length === 0 ? (
                  <div style={{ color: "#06423299" }} className="italic">
                    Chưa có thông tin chương trình đào tạo
                  </div>
                ) : (
                  (school.data_school || []).map((program, pidx) => (
                    <div
                      className="p-4 rounded-lg"
                      style={{ background: "rgba(245, 186, 187, 0.1)" }}
                      key={`program-${majorIndex}-${idx}-${pidx}`}
                    >
                      <div
                        className="font-extrabold mb-2"
                        style={{ color: "#064232" }}
                      >
                        {program?.ten_nganh ||
                          "Tên chương trình không xác định"}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-bold"
                            style={{ color: "#064232" }}
                          >
                            Tổ hợp môn:
                          </span>
                          <span
                            style={{ color: "#01302399", fontWeight: "600" }}
                          >
                            {program?.to_hop_mon || "Chưa cập nhật"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="font-bold"
                            style={{ color: "#064232" }}
                          >
                            Điểm chuẩn 2024:
                          </span>
                          <span
                            className="px-2 py-1 rounded font-bold text-white"
                            style={{ background: "#568F87" }}
                          >
                            {program?.diem_chuan_2024 || "Chưa có"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="font-bold"
                            style={{ color: "#064232" }}
                          >
                            Điểm chuẩn 2023:
                          </span>
                          <span
                            className="px-2 py-1 rounded font-bold text-white"
                            style={{ background: "#568F87" }}
                          >
                            {program?.diem_chuan_2023 || "Chưa có"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
