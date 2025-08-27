import { useState, useEffect } from "react";
import {
  FaChartLine,
  FaLightbulb,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaCheckCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../firebase.js";
import { generateAIAnalysis } from "../services/aiAnalysisService";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import "./AIAnalysis.css";
import ActivityChart from "./ActivityChart";
import { generateImprovementPlan } from "../services/improvementPlanService";
import Header from "../Header/Header";

// Đã bỏ phần Recommendations

const ImprovementPlan = ({ activities, plan, setPlan }) => {
  const [loading, setLoading] = useState(false);
  const [regeneratingIndex, setRegeneratingIndex] = useState(null);
  const [initialized, setInitialized] = useState(() => {
    // Kiểm tra xem đã khởi tạo chưa từ localStorage
    return localStorage.getItem("improvementPlan") !== null;
  });

  useEffect(() => {
    const fetchImprovementPlan = async () => {
      // Chỉ fetch khi chưa có kế hoạch nào
      if (plan.length === 0 && !initialized) {
        try {
          const newPlan = await generateImprovementPlan(activities);
          setPlan(newPlan);
          setInitialized(true);
          // Lưu vào localStorage
          localStorage.setItem("improvementPlan", JSON.stringify(newPlan));
        } catch (error) {
          console.error("Lỗi khi tạo kế hoạch cải thiện:", error);
        }
      }
    };

    fetchImprovementPlan();
  }, [activities, plan.length, initialized]);

  const handleRegenerateStep = async (index) => {
    try {
      setRegeneratingIndex(index);
      setLoading(true);
      const newPlan = await generateImprovementPlan(activities);
      if (newPlan && newPlan.length > 0) {
        const updatedPlan = [...plan];
        updatedPlan[index] = newPlan[0]; // Lấy gợi ý đầu tiên từ kế hoạch mới
        setPlan(updatedPlan);
        // Cập nhật localStorage
        localStorage.setItem("improvementPlan", JSON.stringify(updatedPlan));
      }
    } catch (error) {
      console.error("Lỗi khi tạo gợi ý mới:", error);
    } finally {
      setRegeneratingIndex(null);
      setLoading(false);
    }
  };

  if (!plan || plan.length === 0) {
    return <div>Đang tạo kế hoạch cải thiện...</div>;
  }

  return (
    <>
      <div className="ai-analysis-improvement-plan">
        <h2>Kế hoạch cải thiện</h2>
        <div className="ai-improvement-plan-list">
          {plan.map((step, index) => (
            <div key={index} className="ai-improvement-plan-step">
              <div className="ai-step-header">
                <h3>{step.title}</h3>
                <div className="ai-step-actions">
                  <span className="ai-timeline">{step.timeline}</span>
                  <button
                    className="ai-regenerate-button"
                    onClick={() => handleRegenerateStep(index)}
                    disabled={regeneratingIndex === index}
                  >
                    {regeneratingIndex === index ? (
                      <span className="ai-loading">Đang tạo...</span>
                    ) : (
                      <span>Gợi ý mới</span>
                    )}
                  </button>
                </div>
              </div>
              <p className="ai-step-description">{step.description}</p>
              <div className="ai-step-target">
                <strong>Mục tiêu:</strong> {step.target}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const AIAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [error, setError] = useState(null);
  const [improvementPlan, setImprovementPlan] = useState(() => {
    // Khôi phục kế hoạch từ localStorage khi khởi tạo
    const savedPlan = localStorage.getItem("improvementPlan");
    return savedPlan ? JSON.parse(savedPlan) : [];
  });
  const [showPredictions, setShowPredictions] = useState(false);
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [improvementPlanLoaded, setImprovementPlanLoaded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const auth = getAuth();
  const db = getFirestore();
  const navigate = useNavigate();

  // Kiểm tra quyền admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          const isUserAdmin = userDoc.data().isAdmin || false;
          setIsAdmin(isUserAdmin);
          if (isUserAdmin) {
            navigate("/"); // Chuyển hướng về trang chủ nếu là admin
            return;
          }
        }
      }
      setLoading(false);
    };
    checkAdminStatus();
  }, [auth.currentUser, navigate]);

  // Hàm xử lý dữ liệu cho biểu đồ
  const processChartData = (activities) => {
    // Nhóm theo category và chỉ đếm số hoạt động đã được duyệt
    const categoryData = activities.reduce((acc, activity) => {
      if (!acc[activity.category]) {
        acc[activity.category] = {
          category: activity.category,
          count: 0,
        };
      }
      acc[activity.category].count += 1;
      return acc;
    }, {});

    return Object.values(categoryData);
  };

  // Lấy danh sách hoạt động của người dùng
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        if (!auth.currentUser) return;

        const eventsQuery = query(collection(db, "events"));
        const querySnapshot = await getDocs(eventsQuery);
        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Lọc các sự kiện mà người dùng đã đăng ký và được duyệt
        const userActivities = eventsData
          .filter((event) =>
            event.registrations?.some(
              (reg) =>
                reg.userId === auth.currentUser.uid && reg.status === "approved"
            )
          )
          .map((event) => {
            const registration = event.registrations.find(
              (reg) => reg.userId === auth.currentUser.uid
            );
            return {
              id: event.id,
              title: event.title,
              category: event.category,
              date: event.date,
              status: registration.status,
              description: event.description,
            };
          });

        setActivities(userActivities);

        // Xử lý dữ liệu cho biểu đồ
        const processedChartData = processChartData(userActivities);
        setChartData(processedChartData);

        // Tạo phân tích AI dựa trên hoạt động thực tế
        const analysisResult = await generateAIAnalysis(userActivities);
        setAnalysis(analysisResult);
        setError(null);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách hoạt động:", err);
        setError("Không thể tải danh sách hoạt động");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [auth.currentUser]);

  // Bỏ dự đoán điểm

  // Lấy kế hoạch cải thiện chỉ khi lần đầu vào tab improvement
  useEffect(() => {
    if (selectedTab === "improvement" && !improvementPlanLoaded) {
      const fetchImprovementPlan = async () => {
        try {
          const plan = await generateImprovementPlan(activities);
          setImprovementPlan(plan);
          setImprovementPlanLoaded(true);
        } catch (error) {
          console.error("Lỗi khi tạo kế hoạch cải thiện:", error);
        }
      };
      fetchImprovementPlan();
    }
  }, [selectedTab, improvementPlanLoaded, activities]);

  const renderTrend = (trend, percentChange) => {
    if (trend === "up") {
      return (
        <span className="ai-trend-up" style={{ display: "none" }}>
          <FaArrowUp /> {percentChange}%
        </span>
      );
    } else if (trend === "down") {
      return (
        <span className="ai-trend-down">
          <FaArrowDown /> {percentChange}%
        </span>
      );
    } else {
      return (
        <span className="ai-trend-same">
          <FaEquals /> {percentChange}%
        </span>
      );
    }
  };

  const renderOverview = () => {
    if (!analysis) return null;

    return (
      <div className="ai-analysis-overview">
        <div className="ai-overview-header">
          <div className="ai-overview-points">
            <h2>Tổng số hoạt động đã tham gia</h2>
            <div className="ai-points-value">{activities.length}</div>
            <div className="ai-overview-stats">
              <div className="ai-stat-item">
                <span className="ai-stat-label">Số loại hoạt động:</span>
                <span className="ai-stat-value">
                  {new Set(activities.map((a) => a.category)).size}
                </span>
              </div>
            </div>
          </div>
          <div className="ai-overview-chart">
            <ActivityChart data={chartData} />
          </div>
        </div>

        <div className="ai-overview-details">
          <div className="ai-strengths">
            <h3>
              <FaLightbulb /> Điểm mạnh
            </h3>
            <div className="ai-strengths-list">
              {analysis.overview.strengths.map((strength, index) => (
                <div key={index} className="ai-strength-item">
                  <h4>{strength.title}</h4>
                  <p>{strength.description}</p>
                  <div className="ai-strength-evidence">
                    <FaCheckCircle /> {strength.evidence}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ai-weaknesses">
            <h3>
              <FaChartLine /> Điểm yếu cần cải thiện
            </h3>
            <div className="ai-weaknesses-list">
              {analysis.overview.weaknesses.map((weakness, index) => (
                <div key={index} className="ai-weakness-item">
                  <h4>{weakness.title}</h4>
                  <p>{weakness.description}</p>
                  <div className="ai-weakness-suggestion">
                    <FaArrowUp /> {weakness.suggestion}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bỏ phần recommendations trong overview */}
        </div>
      </div>
    );
  };

  // Đã bỏ component Recommendations và renderRecommendations

  // Bỏ toàn bộ phần dự đoán và biểu đồ điểm

  const renderContent = () => (
    <>
      {selectedTab === "overview" && renderOverview()}
      {selectedTab === "improvement" && (
        <ImprovementPlan
          activities={activities}
          plan={improvementPlan}
          setPlan={setImprovementPlan}
        />
      )}
    </>
  );

  return (
    <>
      <Header />
      <div
        className="relative min-h-screen"
        style={{ background: "#FFEFF2", padding: "20px 0" }}
      >
        <style>{`
        .noise { position: absolute; inset: 0; background-image: radial-gradient(circle at 20% 10%, rgba(245,186,187,0.35), transparent 45%); pointer-events: none; }
        .glass { background: rgba(255,255,255,0.85); backdrop-filter: saturate(160%) blur(12px); -webkit-backdrop-filter: saturate(160%) blur(12px); }
        .ai-wave { position: absolute; inset: 0; background: radial-gradient(1200px 400px at -10% 0%, #F5BABB 0%, transparent 60%); opacity: 0.9; }
      `}</style>

        <div className="ai-wave" />
        <div className="noise" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10 mt-4">
          <div className="text-center mb-8">
            <h1
              className="text-3xl md:text-4xl font-extrabold mb-2"
              style={{ color: "#064232" }}
            >
              Phân tích hoạt động AI
            </h1>
            <p className="text-base" style={{ color: "#06423299" }}>
              Tổng quan hoạt động và kế hoạch cải thiện cá nhân hóa
            </p>
          </div>

          <div
            className="glass rounded-3xl p-4 mb-6 border shadow-xl"
            style={{ borderColor: "#F5BABB" }}
          >
            <div className="ai-tabs" style={{ borderBottomColor: "#F5BABB" }}>
              <div
                className={`ai-tab ${
                  selectedTab === "overview" ? "ai-active" : ""
                }`}
                onClick={() => setSelectedTab("overview")}
                style={
                  selectedTab === "overview"
                    ? {
                        color: "#fff",
                        backgroundImage:
                          "linear-gradient(90deg,#064232,#568F87)",
                      }
                    : { color: "#064232" }
                }
              >
                Tổng quan
              </div>
              <div
                className={`ai-tab ${
                  selectedTab === "improvement" ? "ai-active" : ""
                }`}
                onClick={() => setSelectedTab("improvement")}
                style={
                  selectedTab === "improvement"
                    ? {
                        color: "#fff",
                        backgroundImage:
                          "linear-gradient(90deg,#064232,#568F87)",
                      }
                    : { color: "#064232" }
                }
              >
                Kế hoạch cải thiện
              </div>
            </div>
          </div>

          <div
            className="glass rounded-3xl p-6 border shadow-xl"
            style={{
              borderColor: "#F5BABB",
              background: "rgba(255,255,255,0.88)",
            }}
          >
            {loading ? (
              <div className="flex items-center space-x-3">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2"
                  style={{ borderColor: "#064232" }}
                ></div>
                <p className="text-lg" style={{ color: "#064232" }}>
                  Đang tải dữ liệu phân tích AI...
                </p>
              </div>
            ) : error ? (
              <div className="text-center">
                <p className="error-message" style={{ color: "#B91C1C" }}>
                  {error}
                </p>
              </div>
            ) : (
              renderContent()
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AIAnalysis;
