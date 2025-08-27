import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase.js";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Brain,
  Target,
  ArrowLeft,
  AlertCircle,
  BookOpen,
  Microscope,
  Calculator,
  Globe,
  Palette,
  Users,
  TrendingUp,
  CheckCircle,
  Award,
  Briefcase,
  Wrench,
  Search,
  Heart,
  FileText,
  ExternalLink,
} from "lucide-react";
import AIKhaiPhaAssistant from "../Career/AIKhaiPhaAssistant";

// Helper function để format AI text (copy từ AIKhaiPhaAssistant)
function formatAIText(text) {
  if (!text) return "";
  let html = text;
  // Bold **text**
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // Italic *text*
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  // Headings ## ...
  html = html.replace(
    /^### (.*)$/gm,
    '<h3 class="text-lg font-bold text-purple-700 mt-6 mb-2">$1</h3>'
  );
  html = html.replace(
    /^## (.*)$/gm,
    '<h2 class="text-2xl font-extrabold text-purple-800 mt-8 mb-3 flex items-center gap-2">🔮 $1</h2>'
  );
  html = html.replace(
    /^# (.*)$/gm,
    '<h1 class="text-3xl font-extrabold text-purple-900 mt-10 mb-4 flex items-center gap-2">🌟 $1</h1>'
  );
  // Unordered list
  html = html.replace(
    /\n\s*\* (.*?)(?=\n|$)/g,
    '<li class="ml-6 list-disc">$1</li>'
  );
  // Ordered list
  html = html.replace(
    /\n\s*\d+\. (.*?)(?=\n|$)/g,
    '<li class="ml-6 list-decimal">$1</li>'
  );
  // Wrap lists in <ul> or <ol>
  html = html.replace(
    /(<li class="ml-6 list-disc">[\s\S]*?<\/li>)/g,
    '<ul class="mb-2">$1</ul>'
  );
  html = html.replace(
    /(<li class="ml-6 list-decimal">[\s\S]*?<\/li>)/g,
    '<ol class="mb-2">$1</ol>'
  );
  // Line breaks
  html = html.replace(/\n{2,}/g, "<br/><br/>");
  html = html.replace(/\n/g, "<br/>");
  return html;
}
// Helper function để tạo URL cho major group
const getMajorGroupUrl = (majorName) => {
  // Tạo slug từ tên ngành
  const slug = majorName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s_]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .trim("_");
  return `/major/${slug}`;
};

const RIASEC_GROUPS = [
  {
    type: "R",
    name: "Kỹ thuật (Realistic)",
    description: "Thích làm việc với tay, máy móc, công cụ",
  },
  {
    type: "I",
    name: "Nghiên cứu (Investigative)",
    description: "Thích tìm hiểu, phân tích, nghiên cứu",
  },
  {
    type: "A",
    name: "Nghệ thuật (Artistic)",
    description: "Thích sáng tạo, nghệ thuật, thể hiện bản thân",
  },
  {
    type: "S",
    name: "Xã hội (Social)",
    description: "Thích giúp đỡ, dạy dỗ, chăm sóc người khác",
  },
  {
    type: "E",
    name: "Quản lý (Enterprising)",
    description: "Thích lãnh đạo, thuyết phục, kinh doanh",
  },
  {
    type: "C",
    name: "Nghiệp vụ (Conventional)",
    description: "Thích tổ chức, sắp xếp, làm việc có hệ thống",
  },
];

const getTypeIcon = (type) => {
  switch (type) {
    case "R":
      return <Wrench className="w-6 h-6" />;
    case "I":
      return <Search className="w-6 h-6" />;
    case "A":
      return <Palette className="w-6 h-6" />;
    case "S":
      return <Heart className="w-6 h-6" />;
    case "E":
      return <Briefcase className="w-6 h-6" />;
    case "C":
      return <FileText className="w-6 h-6" />;
    default:
      return <Target className="w-6 h-6" />;
  }
};

const traitMap = {
  EI: { left: "Hướng ngoại", right: "Hướng nội" },
  SN: { left: "Trực giác", right: "Tinh ý" },
  TF: { left: "Lý trí", right: "Cảm xúc" },
  JP: { left: "Có tổ chức", right: "Linh hoạt" },
};

const TestResultDetail = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiAnalysisCompleted, setAiAnalysisCompleted] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, "career_tests", testId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const testData = { id: docSnap.id, ...docSnap.data() };
          console.log("Test data loaded:", testData);
          console.log(
            "Career recommendations:",
            testData.careerRecommendations
          );
          setTest(testData);
          // Kiểm tra xem AI analysis đã hoàn thành chưa
          setAiAnalysisCompleted(
            !!testData.aiAnalysisResult || testData.aiAnalysisCompleted
          );
        } else {
          setError("Không tìm thấy bài test này.");
        }
      } catch {
        setError("Lỗi khi tải dữ liệu bài test.");
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  // Callback function để lưu AI result vào Firebase
  const handleAIAnalysisComplete = async (aiResult) => {
    if (!test || aiAnalysisCompleted) return;

    try {
      const docRef = doc(db, "career_tests", testId);

      // Đảm bảo lưu được bằng cách set merge: true
      await updateDoc(
        docRef,
        {
          aiAnalysisResult: aiResult,
          aiAnalysisCompletedAt: serverTimestamp(),
          aiAnalysisCompleted: true, // Thêm flag để đánh dấu đã hoàn thành
        },
        { merge: true }
      );

      // Cập nhật state local để UI refresh
      setAiAnalysisCompleted(true);
      setTest((prevTest) => ({
        ...prevTest,
        aiAnalysisResult: aiResult,
        aiAnalysisCompletedAt: new Date(),
        aiAnalysisCompleted: true,
      }));

      console.log("AI analysis result saved to Firebase successfully");
    } catch (error) {
      console.error("Error saving AI analysis result:", error);
      // Nếu updateDoc fail, thử dùng setDoc
      try {
        const docRef = doc(db, "career_tests", testId);
        await setDoc(
          docRef,
          {
            aiAnalysisResult: aiResult,
            aiAnalysisCompletedAt: serverTimestamp(),
            aiAnalysisCompleted: true,
          },
          { merge: true }
        );

        setAiAnalysisCompleted(true);
        setTest((prevTest) => ({
          ...prevTest,
          aiAnalysisResult: aiResult,
          aiAnalysisCompletedAt: new Date(),
          aiAnalysisCompleted: true,
        }));

        console.log("AI analysis result saved to Firebase using setDoc");

        // Hiển thị thông báo thành công
        alert("✅ AI analysis đã hoàn thành và được lưu vào hệ thống!");
      } catch (setError) {
        console.error("Error saving AI analysis result with setDoc:", setError);
      }
    }
  };

  // Helper for MBTI trait bars
  const renderTraitBars = (mbtiPercentages) => {
    if (!mbtiPercentages) return null;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {Object.entries(traitMap).map(([key, trait]) => {
          const leftPercent = mbtiPercentages[key];
          const rightPercent = 100 - leftPercent;
          return (
            <div
              key={key}
              className="bg-white rounded-lg p-6 shadow-md border border-blue-200"
            >
              <div className="flex justify-between mb-3">
                <span className="text-blue-700 font-medium">
                  {trait.left} {leftPercent}%
                </span>
                <span className="text-red-500 font-medium">
                  {rightPercent}% {trait.right}
                </span>
              </div>
              <div className="flex h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500"
                  style={{ width: `${leftPercent}%` }}
                />
                <div
                  className="bg-gradient-to-r from-red-400 to-red-500 h-full transition-all duration-500"
                  style={{ width: `${rightPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Helper for career fields (MBTI AI analysis)
  const getFieldIcon = (fieldName) => {
    if (fieldName.includes("Khối A")) return <Calculator className="w-6 h-6" />;
    if (fieldName.includes("Khối B")) return <Microscope className="w-6 h-6" />;
    if (fieldName.includes("Khối C")) return <BookOpen className="w-6 h-6" />;
    if (fieldName.includes("Khối D")) return <Globe className="w-6 h-6" />;
    if (fieldName.includes("năng khiếu"))
      return <Palette className="w-6 h-6" />;
    return <Target className="w-6 h-6" />;
  };

  // Helper for RIASEC results
  const renderRIASECResults = (riasecScores) => {
    if (!riasecScores) return null;
    const maxScore = 14 * 5;
    const sortedScores = Object.entries(riasecScores)
      .map(([type, score]) => ({
        type,
        score,
        percentage: Math.round((score / maxScore) * 100),
        ...RIASEC_GROUPS.find((g) => g.type === type),
      }))
      .sort((a, b) => b.score - a.score);
    return (
      <>
        {/* Top 3 RIASEC Types */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-8 text-white text-center shadow-lg mb-6">
          <h4 className="text-2xl font-bold mb-4">
            Top 3 nhóm sở thích của bạn
          </h4>
          <div className="flex justify-center items-center gap-8">
            {sortedScores.slice(0, 3).map((item, index) => (
              <div key={item.type} className="text-center">
                <div className="text-4xl font-bold mb-2">#{index + 1}</div>
                <div className="flex items-center justify-center mb-2">
                  {getTypeIcon(item.type)}
                </div>
                <div className="text-lg font-semibold">{item.name}</div>
                <div className="text-green-100">{item.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
        {/* Detailed RIASEC Scores */}
        <div className="space-y-4">
          {sortedScores.map((item, index) => (
            <div
              key={item.type}
              className="bg-white rounded-lg p-6 shadow-md border border-blue-200"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                  <div className="text-blue-600">{getTypeIcon(item.type)}</div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-blue-700 flex items-center gap-2">
                    #{index + 1} {item.name}
                    <div className="ml-auto flex items-center gap-2 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-bold">
                        {item.percentage}%
                      </span>
                    </div>
                  </h4>
                  <p className="text-blue-600 text-sm">{item.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-blue-700">
                  Điểm số: {item.score}/{maxScore}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* RIASEC Pairs Table */}
        <div className="mt-8 bg-white rounded-lg shadow-md border border-blue-200 overflow-hidden">
          <div className="p-6">
            <h4 className="text-lg font-bold text-blue-800 mb-4">
              Bảng so sánh theo cặp
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="border border-blue-200 p-3 text-left font-semibold text-blue-800">
                      Tên nhóm
                    </th>
                    <th className="border border-blue-200 p-3 text-left font-semibold text-blue-800">
                      Mô tả
                    </th>
                    <th className="border border-blue-200 p-3 text-left font-semibold text-blue-800">
                      Điểm số
                    </th>
                    <th className="border border-blue-200 p-3 text-left font-semibold text-blue-800">
                      Tên nhóm
                    </th>
                    <th className="border border-blue-200 p-3 text-left font-semibold text-blue-800">
                      Mô tả
                    </th>
                    <th className="border border-blue-200 p-3 text-left font-semibold text-blue-800">
                      Điểm số
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["R", "S"],
                    ["I", "E"],
                    ["A", "C"],
                  ].map(([leftType, rightType]) => {
                    const leftGroup = RIASEC_GROUPS.find(
                      (g) => g.type === leftType
                    );
                    const rightGroup = RIASEC_GROUPS.find(
                      (g) => g.type === rightType
                    );
                    const leftScore = riasecScores[leftType];
                    const rightScore = riasecScores[rightType];
                    return (
                      <tr
                        key={`${leftType}-${rightType}`}
                        className="hover:bg-blue-50"
                      >
                        <td className="border border-blue-200 p-3 font-medium text-blue-700">
                          {leftGroup.name}
                        </td>
                        <td className="border border-blue-200 p-3 text-blue-600">
                          {leftGroup.description}
                        </td>
                        <td className="border border-blue-200 p-3 font-semibold text-blue-800">
                          {leftScore}/70
                        </td>
                        <td className="border border-blue-200 p-3 font-medium text-blue-700">
                          {rightGroup.name}
                        </td>
                        <td className="border border-blue-200 p-3 text-blue-600">
                          {rightGroup.description}
                        </td>
                        <td className="border border-blue-200 p-3 font-semibold text-blue-800">
                          {rightScore}/70
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: "#FFEFF2" }}>
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 flex items-center space-x-2 px-3 py-2 rounded-lg shadow-md transition-all duration-200 border"
        style={{
          background: "#FFFFFF",
          color: "#0e614b",
          borderColor: "#568F87",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(245, 186, 187, 0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#FFFFFF";
        }}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Quay lại</span>
      </button>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center w-48">
              <img src={"../Logo_CC_tron.svg"} alt="Logo" className="h-20" />
            </div>
          </div>
          <h2
            className="text-2xl font-bold mb-2 flex items-center justify-center gap-2"
            style={{ color: "#0e614b" }}
          >
            {test?.type === "full_test"
              ? "Test Sở thích Nghề nghiệp RIASEC"
              : "Tư vấn Tuyển sinh Đại học"}
          </h2>
          <p
            className="text-lg flex items-center justify-center gap-2"
            style={{ color: "#0e614b99" }}
          >
            {test?.type === "full_test" ? (
              <Target className="w-5 h-5" />
            ) : (
              <BookOpen className="w-5 h-5" />
            )}
            {test?.type === "full_test"
              ? "Khám phá sở thích và năng khiếu nghề nghiệp của bạn"
              : "Hoàn thành thông tin để nhận gợi ý trường và ngành phù hợp"}
          </p>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div
              className="w-16 h-16 border-4 rounded-full animate-spin mb-4"
              style={{
                borderColor: "rgba(245, 186, 187, 0.3)",
                borderTopColor: "#568F87",
              }}
            />
            <p className="text-xl" style={{ color: "#0e614b" }}>
              Đang tải dữ liệu...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24">
            <AlertCircle
              className="w-16 h-16 mb-4"
              style={{ color: "#DC2626" }}
            />
            <p className="text-xl" style={{ color: "#DC2626" }}>
              {error}
            </p>
          </div>
        ) : !test ? null : (
          <div className="space-y-8">
            {/* AI Khai phá tiềm năng - Hiển thị cho tất cả test có dữ liệu MBTI */}
            {test.mbtiResult && (
              <div>
                {aiAnalysisCompleted ? (
                  // Hiển thị kết quả AI đã lưu (theme xanh lá)
                  <div
                    className="my-8 p-6 glass rounded-xl border shadow-lg"
                    style={{ borderColor: "#568F87", borderWidth: "0.5px" }}
                  >
                    <h3
                      className="text-2xl font-bold mb-4 flex items-center gap-2"
                      style={{ color: "#0e614b" }}
                    >
                      🧑‍💼 Phân tích AI khai phá tiềm năng
                    </h3>
                    <div
                      className="p-6 glass rounded-lg border shadow-md max-h-[600px] overflow-y-auto relative group transition-all duration-300"
                      style={{
                        lineHeight: 1.9,
                        fontSize: "1.05rem",
                        fontFamily: '"Segoe UI", "Roboto", "Arial", sans-serif',
                        letterSpacing: "0.01em",
                        borderColor: "#568F87",
                        color: "#0e614b",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: formatAIText(test.aiAnalysisResult),
                      }}
                    />
                  </div>
                ) : (
                  // Hiển thị AI assistant để bấm
                  <div className="my-8">
                    <div
                      className="mb-4 p-4 rounded-lg"
                      style={{
                        background: "rgba(245, 186, 187, 0.1)",
                        border: "1px solid #F5BABB",
                      }}
                    >
                      <div
                        className="flex items-center gap-2"
                        style={{ color: "#0e614b" }}
                      >
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">
                          ⚠️ Lưu ý: AI khai phá tiềm năng chỉ có thể sử dụng 1
                          lần. Kết quả sẽ được lưu trong hệ thống.
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MBTI Result Section */}
            <div
              className="rounded-lg p-8 text-white text-center shadow-lg"
              style={{ background: "linear-gradient(90deg,#0e614b,#568F87)" }}
            >
              <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                {test.type === "mbti_test"
                  ? "Kết quả MBTI"
                  : "Kết quả tổng hợp (MBTI + RIASEC)"}
              </h3>
              <div className="text-6xl font-bold mb-4 flex items-center justify-center gap-4">
                <Brain className="w-12 h-12" />
                {test.mbtiResult}
              </div>
              <p
                className="text-lg"
                style={{ color: "rgba(255, 255, 255, 0.9)" }}
              >
                {test.aiData?.mbti_description || test.mbtiDescription}
              </p>
              {test.mbtiResult && (
                <a
                  href={`https://tuansu-lonewolf.github.io/MBTI_informations/pages/detail.html?code=${test.mbtiResult}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div
                    className="group transition-all duration-200 hover:shadow-lg rounded-lg p-4 text-center mt-8 cursor-pointer"
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    <div className="text-lg font-medium text-white flex items-center justify-center gap-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200"
                        style={{ background: "rgba(255, 255, 255, 0.3)" }}
                      >
                        <AlertCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="transition-colors duration-200">
                        Cùng CompeTech hiểu rõ hơn về nhóm tính cách này nhé
                      </span>
                    </div>
                  </div>
                </a>
              )}
            </div>
            {/* MBTI Trait Bars */}
            {test.mbtiPercentages && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {Object.entries(test.mbtiPercentages).map(
                  ([key, leftPercent]) => {
                    const rightPercent = 100 - leftPercent;
                    return (
                      <div
                        key={key}
                        className="glass rounded-lg p-6 shadow-md border"
                        style={{ borderColor: "#568F87", borderWidth: "0.5px" }}
                      >
                        <div className="flex justify-between mb-3">
                          <span
                            className="font-medium"
                            style={{ color: "#0e614b" }}
                          >
                            {traitMap[key]?.left} {leftPercent}%
                          </span>
                          <span
                            className="font-medium"
                            style={{ color: "#0e614b" }}
                          >
                            {rightPercent}% {traitMap[key]?.right}
                          </span>
                        </div>
                        <div
                          className="flex h-4 rounded-full overflow-hidden"
                          style={{ background: "rgba(245, 186, 187, 0.3)" }}
                        >
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${leftPercent}%`,
                              background: "#568F87",
                            }}
                          />
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${rightPercent}%`,
                              background: "#F5BABB",
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
            {/* Career Suggestions (MBTI AI) - Only for non-full tests */}
            {test.type !== "full_test" && test.aiData?.career_fields && (
              <div>
                <h3 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  Gợi ý khối ngành phù hợp
                </h3>
                <div className="space-y-4">
                  {test.aiData.career_fields.map((field, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-lg p-6 shadow-md border border-blue-200 hover:shadow-lg transition-all duration-200 hover:border-blue-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <div className="text-blue-600">
                            {getFieldIcon(field.name)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-blue-700 mb-3 flex items-center gap-2">
                            {field.name}
                            <div className="ml-auto flex items-center gap-2 text-green-600">
                              <TrendingUp className="w-4 h-4" />
                              <span className="text-sm font-bold">
                                {field.compatibility}
                              </span>
                            </div>
                          </h4>
                          <p className="text-blue-600 mb-3 text-sm leading-relaxed">
                            {field.description}
                          </p>
                          <div className="flex items-start gap-2 mb-4">
                            <Users className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-600 text-sm">
                              {field.career}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-blue-700">
                              Độ phù hợp:
                            </span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2 relative overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: field.compatibility }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* RIASEC Section for full_test */}
            {test.type === "full_test" && test.riasecScores && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-green-900 mb-6 flex items-center gap-2">
                  <Target className="w-6 h-6" />
                  Kết quả RIASEC
                </h3>
                {/* RIASEC Results - Theme xanh lá */}
                {(() => {
                  const maxScore = 14 * 5;
                  const sorted = Object.entries(test.riasecScores)
                    .map(([type, score]) => ({
                      type,
                      score,
                      percentage: Math.round((score / maxScore) * 100),
                      ...RIASEC_GROUPS.find((g) => g.type === type),
                    }))
                    .sort((a, b) => b.score - a.score);
                  return (
                    <>
                      <div
                        className="rounded-lg p-8 text-white text-center shadow-lg mb-6"
                        style={{
                          background: "linear-gradient(90deg,#0e614b,#568F87)",
                        }}
                      >
                        <h4 className="text-2xl font-bold mb-4">
                          Top 3 nhóm sở thích của bạn
                        </h4>
                        <div className="flex justify-center items-center gap-8">
                          {sorted.slice(0, 3).map((item, idx) => (
                            <div key={item.type} className="text-center">
                              <div className="text-4xl font-bold mb-2">
                                #{idx + 1}
                              </div>
                              <div className="flex items-center justify-center mb-2">
                                {getTypeIcon(item.type)}
                              </div>
                              <div className="text-lg font-semibold">
                                {item.name}
                              </div>
                              <div
                                style={{ color: "rgba(255, 255, 255, 0.9)" }}
                              >
                                {item.percentage}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        {sorted.map((item, index) => (
                          <div
                            key={item.type}
                            className="glass rounded-lg p-6 shadow-md border"
                            style={{
                              borderColor: "#568F87",
                              borderWidth: "0.5px",
                            }}
                          >
                            <div className="flex items-center gap-4 mb-4">
                              <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center"
                                style={{ background: "#fce3e1" }}
                              >
                                <div style={{ color: "#0e614b" }}>
                                  {getTypeIcon(item.type)}
                                </div>
                              </div>
                              <div className="flex-1">
                                <h4
                                  className="text-lg font-bold flex items-center gap-2"
                                  style={{ color: "#0e614b" }}
                                >
                                  #{index + 1} {item.name}
                                  <div
                                    className="ml-auto flex items-center gap-2"
                                    style={{ color: "#568F87" }}
                                  >
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="text-sm font-bold">
                                      {item.percentage}%
                                    </span>
                                  </div>
                                </h4>
                                <p
                                  className="text-sm"
                                  style={{ color: "#0e614b99" }}
                                >
                                  {item.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className="text-sm font-medium"
                                style={{ color: "#0e614b" }}
                              >
                                Điểm số: {item.score}/{maxScore}
                              </span>
                              <div
                                className="flex-1 rounded-full h-3 relative overflow-hidden"
                                style={{
                                  background: "rgba(245, 186, 187, 0.3)",
                                }}
                              >
                                <div
                                  className="h-3 rounded-full transition-all duration-1000 ease-out"
                                  style={{
                                    width: `${item.percentage}%`,
                                    background:
                                      "linear-gradient(90deg,#0e614b,#568F87)",
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div
                        className="mt-8 glass rounded-lg shadow-md border overflow-hidden"
                        style={{ borderColor: "#568F87", borderWidth: "0.5px" }}
                      >
                        <div className="p-6">
                          <h4
                            className="text-lg font-bold mb-4"
                            style={{ color: "#0e614b" }}
                          >
                            Bảng so sánh theo cặp
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr
                                  style={{
                                    background: "rgba(245, 186, 187, 0.1)",
                                  }}
                                >
                                  <th
                                    className="border p-3 text-left font-semibold"
                                    style={{
                                      borderColor: "#568F87",
                                      color: "#0e614b",
                                    }}
                                  >
                                    Tên nhóm
                                  </th>
                                  <th
                                    className="border p-3 text-left font-semibold"
                                    style={{
                                      borderColor: "#568F87",
                                      color: "#0e614b",
                                    }}
                                  >
                                    Mô tả
                                  </th>
                                  <th
                                    className="border p-3 text-left font-semibold"
                                    style={{
                                      borderColor: "#568F87",
                                      color: "#0e614b",
                                    }}
                                  >
                                    Điểm số
                                  </th>
                                  <th
                                    className="border p-3 text-left font-semibold"
                                    style={{
                                      borderColor: "#568F87",
                                      color: "#0e614b",
                                    }}
                                  >
                                    Tên nhóm
                                  </th>
                                  <th
                                    className="border p-3 text-left font-semibold"
                                    style={{
                                      borderColor: "#568F87",
                                      color: "#0e614b",
                                    }}
                                  >
                                    Mô tả
                                  </th>
                                  <th
                                    className="border p-3 text-left font-semibold"
                                    style={{
                                      borderColor: "#568F87",
                                      color: "#0e614b",
                                    }}
                                  >
                                    Điểm số
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {[
                                  ["R", "S"],
                                  ["I", "E"],
                                  ["A", "C"],
                                ].map(([l, r]) => {
                                  const lg = RIASEC_GROUPS.find(
                                    (g) => g.type === l
                                  );
                                  const rg = RIASEC_GROUPS.find(
                                    (g) => g.type === r
                                  );
                                  return (
                                    <tr
                                      key={`${l}-${r}`}
                                      style={{
                                        background: "rgba(245, 186, 187, 0.05)",
                                      }}
                                    >
                                      <td
                                        className="border p-3 font-medium"
                                        style={{
                                          borderColor: "#568F87",
                                          color: "#0e614b",
                                        }}
                                      >
                                        {lg.name}
                                      </td>
                                      <td
                                        className="border p-3"
                                        style={{
                                          borderColor: "#568F87",
                                          color: "#0e614b99",
                                        }}
                                      >
                                        {lg.description}
                                      </td>
                                      <td
                                        className="border p-3 font-semibold"
                                        style={{
                                          borderColor: "#568F87",
                                          color: "#0e614b",
                                        }}
                                      >
                                        {test.riasecScores[l]}/70
                                      </td>
                                      <td
                                        className="border p-3 font-medium"
                                        style={{
                                          borderColor: "#568F87",
                                          color: "#0e614b",
                                        }}
                                      >
                                        {rg.name}
                                      </td>
                                      <td
                                        className="border p-3"
                                        style={{
                                          borderColor: "#568F87",
                                          color: "#0e614b99",
                                        }}
                                      >
                                        {rg.description}
                                      </td>
                                      <td
                                        className="border p-3 font-semibold"
                                        style={{
                                          borderColor: "#568F87",
                                          color: "#0e614b",
                                        }}
                                      >
                                        {test.riasecScores[r]}/70
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Career Recommendations Section */}
            {test.type === "full_test" &&
              test.careerRecommendations &&
              test.careerRecommendations.length > 0 && (
                <div className="mt-12">
                  <h3
                    className="text-2xl font-bold mb-6 flex items-center gap-2"
                    style={{ color: "#0e614b" }}
                  >
                    <Briefcase className="w-6 h-6" />
                    Top 5 Ngành Nghề Phù Hợp
                  </h3>

                  {/* Detailed Career Scores */}
                  <div className="space-y-4">
                    {test.careerRecommendations.map((career, index) => (
                      <div
                        key={career.name}
                        className="glass rounded-lg p-6 shadow-md border hover:shadow-lg transition-all duration-200 cursor-pointer group"
                        style={{ borderColor: "#568F87", borderWidth: "0.5px" }}
                        onClick={() => {
                          const majorUrl = getMajorGroupUrl(career.name);
                          window.open(majorUrl, "_blank");
                        }}
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200"
                            style={{ background: "#fce3e1" }}
                          >
                            <div style={{ color: "#0e614b" }}>
                              <Briefcase className="w-6 h-6" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4
                              className="text-lg font-bold flex items-center gap-2 transition-colors"
                              style={{ color: "#0e614b" }}
                            >
                              #{index + 1} {career.name}
                              <div
                                className="ml-auto flex items-center gap-2"
                                style={{ color: "#568F87" }}
                              >
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-sm font-bold">
                                  {career.score.toFixed(1)}/5.0
                                </span>
                              </div>
                            </h4>
                            <p
                              className="text-sm transition-colors"
                              style={{ color: "#0e614b99" }}
                            >
                              {career.description}
                            </p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <ExternalLink
                              className="w-5 h-5"
                              style={{ color: "#0e614b" }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                          <span
                            className="text-sm font-medium"
                            style={{ color: "#0e614b" }}
                          >
                            Độ tương thích: {career.score.toFixed(1)}/5.0
                          </span>
                          <div
                            className="flex-1 rounded-full h-3 relative overflow-hidden"
                            style={{ background: "rgba(245, 186, 187, 0.3)" }}
                          >
                            <div
                              className="h-3 rounded-full transition-all duration-1000 ease-out"
                              style={{
                                width: `${(career.score / 5) * 100}%`,
                                background:
                                  "linear-gradient(90deg,#0e614b,#568F87)",
                              }}
                            />
                          </div>
                        </div>

                        {/* Compatibility Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div
                            className="p-4 rounded-lg border"
                            style={{
                              background: "rgba(245, 186, 187, 0.1)",
                              borderColor: "#F5BABB",
                            }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Brain
                                className="w-4 h-4"
                                style={{ color: "#0e614b" }}
                              />
                              <span
                                className="text-sm font-semibold"
                                style={{ color: "#0e614b" }}
                              >
                                MBTI phù hợp:
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {career.mbtiTypes.map((type, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-1 rounded-full font-medium"
                                  style={{
                                    background: "#FFFFFF",
                                    color: "#0e614b",
                                    border: "1px solid #568F87",
                                  }}
                                >
                                  {type}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div
                            className="p-4 rounded-lg border"
                            style={{
                              background: "rgba(245, 186, 187, 0.1)",
                              borderColor: "#F5BABB",
                            }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Target
                                className="w-4 h-4"
                                style={{ color: "#0e614b" }}
                              />
                              <span
                                className="text-sm font-semibold"
                                style={{ color: "#0e614b" }}
                              >
                                RIASEC phù hợp:
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {career.riasecTypes.map((type, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-1 rounded-full font-medium"
                                  style={{
                                    background: "#FFFFFF",
                                    color: "#0e614b",
                                    border: "1px solid #568F87",
                                  }}
                                >
                                  {type}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Click hint */}
                        <div className="mt-4 text-center">
                          <span
                            className="text-xs font-medium"
                            style={{ color: "#0e614b99" }}
                          >
                            👆 Click để xem chi tiết ngành {career.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <AIKhaiPhaAssistant
                    mbtiResult={test.mbtiResult || ""}
                    mbtiDescription={
                      test.mbtiDescription ||
                      test.aiData?.mbti_description ||
                      ""
                    }
                    mbtiPercentages={test.mbtiPercentages || {}}
                    riasecScores={test.riasecScores || {}}
                    riasecAnswers={test.riasecAnswers || {}}
                    careerRecommendations={test.careerRecommendations || []}
                    userInfo={{
                      name: test.name || "",
                      grade: test.grade || "",
                      province: test.province || "",
                      email: test.email || "",
                      phone: test.phone || "",
                    }}
                    aiAnalysisCompleted={aiAnalysisCompleted}
                    aiAnalysisResult={test.aiAnalysisResult || ""}
                    onAnalysisComplete={handleAIAnalysisComplete}
                  />
                  {/* Information Box */}
                  <div
                    className="mt-8 rounded-xl p-6 border shadow-md"
                    style={{
                      background: "rgba(245, 186, 187, 0.1)",
                      borderColor: "#568F87",
                      borderWidth: "0.5px",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                        style={{ background: "#568F87" }}
                      >
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4
                          className="text-lg font-bold mb-3"
                          style={{ color: "#0e614b" }}
                        >
                          Lưu ý về kết quả
                        </h4>
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: "#0e614b99" }}
                        >
                          Kết quả này được tính toán dựa trên sự kết hợp giữa
                          tính cách MBTI (60%) và sở thích RIASEC (40%). Đây chỉ
                          là gợi ý tham khảo, bạn nên cân nhắc thêm các yếu tố
                          khác như khả năng, đam mê và cơ hội thực tế.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestResultDetail;
