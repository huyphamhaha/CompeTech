import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

const API_KEY = "AIzaSyDHabYfby9JrvSEzDmsJzZLFZcQYzKh_7Q";

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
    '<h3 class="text-lg font-bold mt-6 mb-2" style="color: #064232">$1</h3>'
  );
  html = html.replace(
    /^## (.*)$/gm,
    '<h2 class="text-2xl font-extrabold mt-8 mb-3 flex items-center gap-2" style="color: #064232">🔮 $1</h2>'
  );
  html = html.replace(
    /^# (.*)$/gm,
    '<h1 class="text-3xl font-extrabold mt-10 mb-4 flex items-center gap-2" style="color: #064232">🌟 $1</h1>'
  );
  // Unordered list
  html = html.replace(
    /\n\s*\* (.*?)(?=\n|$)/g,
    '<li class="ml-6 list-disc" style="color: #094033">$1</li>'
  );
  // Ordered list
  html = html.replace(
    /\n\s*\d+\. (.*?)(?=\n|$)/g,
    '<li class="ml-6 list-decimal" style="color: #094033">$1</li>'
  );
  // Wrap lists in <ul> or <ol>
  html = html.replace(
    /(<li class="ml-6 list-disc" style="color: #094033">[\s\S]*?<\/li>)/g,
    '<ul class="mb-2">$1</ul>'
  );
  html = html.replace(
    /(<li class="ml-6 list-decimal" style="color: #094033">[\s\S]*?<\/li>)/g,
    '<ol class="mb-2">$1</ol>'
  );
  // Line breaks
  html = html.replace(/\n{2,}/g, "<br/><br/>");
  html = html.replace(/\n/g, "<br/>");
  return html;
}

async function callGeminiAPI(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  const data = await response.json();
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Không có phản hồi từ AI."
  );
}

const AIKhaiPhaAssistant = ({
  mbtiResult,
  mbtiDescription,
  mbtiPercentages,
  riasecScores,
  riasecAnswers,
  careerRecommendations,
  userInfo,
  onAnalysisComplete,
  aiAnalysisCompleted = false, // Thêm prop để kiểm tra xem đã hoàn thành chưa
  aiAnalysisResult = "", // Thêm prop để hiển thị kết quả từ Firebase
}) => {
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [error, setError] = useState("");
  const [hasClicked, setHasClicked] = useState(false);

  // Tạo key duy nhất cho AI analysis
  const getAnalysisKey = () => {
    const userKey = userInfo?.name || userInfo?.email || "anonymous";
    return `aiAnalysis_${userKey}_${mbtiResult}_${JSON.stringify(
      riasecScores
    )}`;
  };

  // Kiểm tra xem đã hoàn thành chưa từ localStorage hoặc Firebase
  useEffect(() => {
    const analysisKey = getAnalysisKey();
    const savedResult = localStorage.getItem(analysisKey);
    if (savedResult || aiAnalysisCompleted) {
      setAiResult(savedResult || aiAnalysisResult || "");
      setHasClicked(true);
    }
  }, [
    mbtiResult,
    riasecScores,
    userInfo,
    aiAnalysisCompleted,
    aiAnalysisResult,
  ]);

  const buildPrompt = () => {
    return `Bạn là một chuyên gia hướng nghiệp, hãy khai phá tiềm năng bản thân cho học sinh dựa trên toàn bộ dữ liệu sau. Hãy phân tích cực kỳ chi tiết, trả lời càng dài càng tốt, càng nhiều càng tốt, không giới hạn số lượng từ, càng sâu càng tốt, phân tích từng khía cạnh, từng chỉ số, từng ngành nghề, từng điểm mạnh/yếu, từng cơ hội phát triển, từng lời khuyên cá nhân hóa, từng ví dụ thực tế, từng con đường sự nghiệp, từng kỹ năng cần phát triển, từng rủi ro, từng nguồn lực, từng bước đi tiếp theo, từng ngành nghề phù hợp, từng lý do tại sao phù hợp, từng ngành không phù hợp, từng lời khuyên về học tập, phát triển bản thân, định hướng tương lai, v.v. Hãy trả lời thật dài, thật nhiều, thật chi tiết, không bỏ sót bất kỳ thông tin nào.\n\nThông tin học sinh: ${
      userInfo ? JSON.stringify(userInfo, null, 2) : "Không có"
    }\n\nKết quả MBTI: ${mbtiResult} - ${mbtiDescription}\nTỷ lệ MBTI: ${
      mbtiPercentages ? JSON.stringify(mbtiPercentages) : "Không có"
    }\n\nKết quả RIASEC: ${
      riasecScores ? JSON.stringify(riasecScores) : "Không có"
    }\n\nCâu trả lời RIASEC: ${
      riasecAnswers ? JSON.stringify(riasecAnswers) : "Không có"
    }\n\nTop ngành nghề gợi ý:\n${
      careerRecommendations
        ? careerRecommendations
            .map(
              (c, i) =>
                `#${i + 1} ${c.name}: ${
                  c.description
                } (MBTI: ${c.mbtiTypes?.join(
                  ", "
                )}, RIASEC: ${c.riasecTypes?.join(", ")}, Score: ${c.score})`
            )
            .join("\n")
        : "Không có"
    }\n\nHãy phân tích toàn diện, không bỏ sót bất kỳ dữ liệu nào, trả lời thật dài, thật nhiều, thật sâu, thật chi tiết, thật cá nhân hóa, thật thực tế, thật truyền cảm hứng, thật cụ thể, thật hữu ích. Không giới hạn số lượng từ. Hãy bắt đầu!`;
  };

  const callAI = async () => {
    if (hasClicked) return; // Không cho bấm nếu đã bấm rồi

    setHasClicked(true);
    setLoading(true);
    setError("");
    setAiResult("");
    try {
      const prompt = buildPrompt();
      const finalResult = await callGeminiAPI(prompt);

      setAiResult(finalResult);

      // Lưu vào localStorage để tránh mất khi reload
      const analysisKey = getAnalysisKey();
      localStorage.setItem(analysisKey, finalResult);

      // Gọi callback nếu có
      if (onAnalysisComplete) {
        onAnalysisComplete(finalResult);
      }
    } catch (e) {
      setError(e.message || "Lỗi không xác định");
      setHasClicked(false); // Reset nếu có lỗi
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="my-8 p-8 glass rounded-xl border shadow-lg"
        style={{ borderColor: "#568F87", borderWidth: "0.5px" }}
      >
        <div className="text-center mb-6">
          <h3
            className="text-3xl font-bold mb-3 flex items-center justify-center gap-3"
            style={{ color: "#064232" }}
          >
            🧑‍💼 Trợ lý AI khai phá tiềm năng bản thân
          </h3>
          <p
            className="text-lg font-medium leading-relaxed"
            style={{ color: "#094033" }}
          >
            Nhấn nút bên dưới để AI phân tích toàn diện tất cả dữ liệu kết quả
            và khai phá tiềm năng của bạn một cách chi tiết nhất.
          </p>
        </div>

        {aiAnalysisCompleted && (
          <div
            className="mb-4 p-3 rounded-lg"
            style={{
              background: "rgba(245, 186, 187, 0.1)",
              border: "1px solid #F5BABB",
            }}
          >
            <div
              className="flex items-center gap-2"
              style={{ color: "#064232" }}
            >
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                ✅ AI analysis đã được hoàn thành trước đó. Kết quả đã được lưu
                trong hệ thống.
              </span>
            </div>
          </div>
        )}
        <div className="text-center mb-6">
          <button
            onClick={callAI}
            disabled={loading || hasClicked}
            className={`px-10 py-4 text-white font-bold rounded-xl transition-colors duration-200 shadow-lg text-lg tracking-wide ${
              hasClicked || aiAnalysisCompleted
                ? "cursor-not-allowed"
                : "hover:shadow-xl"
            }`}
            style={
              hasClicked || aiAnalysisCompleted
                ? { background: "#9CA3AF" }
                : { background: "linear-gradient(90deg,#064232,#568F87)" }
            }
            onMouseEnter={(e) => {
              if (!(hasClicked || aiAnalysisCompleted)) {
                e.currentTarget.style.background =
                  "linear-gradient(90deg,#568F87,#064232)";
              }
            }}
            onMouseLeave={(e) => {
              if (!(hasClicked || aiAnalysisCompleted)) {
                e.currentTarget.style.background =
                  "linear-gradient(90deg,#064232,#568F87)";
              }
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>{" "}
                Đang phân tích...
              </span>
            ) : hasClicked || aiAnalysisCompleted ? (
              <span>✅ Đã hoàn thành phân tích (Chỉ được làm 1 lần)</span>
            ) : (
              <span>🔍 Khai phá tiềm năng (1 lần duy nhất)</span>
            )}
          </button>
        </div>
        {error && (
          <div
            className="mt-4 font-semibold text-lg"
            style={{ color: "#DC2626" }}
          >
            Lỗi: {error}
          </div>
        )}
        {aiResult && (
          <div className="mt-8">
            <div
              className="p-8 glass rounded-xl border shadow-lg max-h-[700px] overflow-y-auto relative group transition-all duration-300"
              style={{
                lineHeight: 1.8,
                fontSize: "1.05rem",
                fontFamily: '"Segoe UI", "Roboto", "Arial", sans-serif',
                letterSpacing: "0.01em",
                borderColor: "#568F87",
                borderWidth: "0.5px",
                color: "#064232",
                background: "rgba(255, 255, 255, 0.8)",
              }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: formatAIText(aiResult) }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AIKhaiPhaAssistant;
