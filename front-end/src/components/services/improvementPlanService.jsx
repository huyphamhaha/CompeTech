import { GoogleGenerativeAI } from "@google/generative-ai";

// Khởi tạo Gemini API với API key
const API_KEY = "AIzaSyDMR05DsPJ87XmaQEuTf4o4Cn5FywOCkI0";
const genAI = new GoogleGenerativeAI(API_KEY);

// Cấu hình cho mô hình
const modelConfig = {
  temperature: 0.2,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1024,
};

// Phân tích dữ liệu hoạt động
const analyzeActivityData = (activities) => {
  // Tính toán các chỉ số cơ bản
  const totalPoints = activities.reduce(
    (sum, activity) => sum + activity.points,
    0
  );
  const totalActivities = activities.length;

  // Phân tích theo loại hoạt động
  const categoryAnalysis = activities.reduce((acc, activity) => {
    if (!acc[activity.category]) {
      acc[activity.category] = {
        count: 0,
        points: 0,
        activities: [],
      };
    }
    acc[activity.category].count++;
    acc[activity.category].points += activity.points;
    acc[activity.category].activities.push(activity);
    return acc;
  }, {});

  // Phân tích theo thời gian
  const monthlyAnalysis = activities.reduce((acc, activity) => {
    const month = new Date(activity.date).toLocaleString("vi-VN", {
      month: "long",
    });
    if (!acc[month]) {
      acc[month] = {
        count: 0,
        points: 0,
      };
    }
    acc[month].count++;
    acc[month].points += activity.points;
    return acc;
  }, {});

  return {
    totalPoints,
    totalActivities,
    categoryAnalysis,
    monthlyAnalysis,
  };
};

// Tạo kế hoạch cải thiện
export const generateImprovementPlan = async (activities) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      ...modelConfig,
    });

    // Phân tích dữ liệu
    const analysis = analyzeActivityData(activities);

    // Chuẩn bị dữ liệu cho prompt
    const categoryData = Object.entries(analysis.categoryAnalysis)
      .map(
        ([category, data]) =>
          `- ${category}: ${data.count} hoạt động, ${data.points} điểm`
      )
      .join("\n");

    const monthlyData = Object.entries(analysis.monthlyAnalysis)
      .map(
        ([month, data]) =>
          `- ${month}: ${data.count} hoạt động, ${data.points} điểm`
      )
      .join("\n");

    const prompt = `
    Dựa trên dữ liệu hoạt động của sinh viên:
    
    Tổng quan:
    - Tổng điểm: ${analysis.totalPoints}
    - Tổng số hoạt động: ${analysis.totalActivities}
    
    Phân tích theo loại hoạt động:
    ${categoryData}
    
    Phân tích theo tháng:
    ${monthlyData}
    
    Hãy tạo một kế hoạch cải thiện chi tiết với 4 bước, mỗi bước cần có:
    1. Tiêu đề ngắn gọn
    2. Mô tả chi tiết về bước thực hiện
    3. Mục tiêu cụ thể cần đạt được
    4. Thời gian dự kiến hoàn thành
    
    Trả về kết quả dưới dạng JSON với format:
    {
      "plan": [
        {
          "title": "Tiêu đề bước",
          "description": "Mô tả chi tiết",
          "target": "Mục tiêu cụ thể",
          "timeline": "Thời gian dự kiến"
        }
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Xử lý response để lấy JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const plan = JSON.parse(jsonMatch[0]);
      return plan.plan;
    }

    // Fallback nếu không thể parse JSON
    return [
      {
        title: "Tăng cường tham gia hoạt động học thuật",
        description:
          "Tham gia thêm các hoạt động học thuật như seminar, workshop để cải thiện kiến thức chuyên môn",
        target: "Tham gia ít nhất 2 hoạt động học thuật trong tháng tới",
        timeline: "1 tháng",
      },
      {
        title: "Phát triển kỹ năng mềm",
        description:
          "Tham gia các khóa học và workshop về kỹ năng mềm như giao tiếp, làm việc nhóm",
        target: "Hoàn thành 1 khóa học kỹ năng mềm",
        timeline: "2 tháng",
      },
      {
        title: "Tăng cường hoạt động tình nguyện",
        description:
          "Tham gia các hoạt động tình nguyện để phát triển kỹ năng xã hội và đóng góp cho cộng đồng",
        target: "Tham gia ít nhất 3 hoạt động tình nguyện",
        timeline: "3 tháng",
      },
      {
        title: "Xây dựng mạng lưới quan hệ",
        description:
          "Tham gia các sự kiện networking và kết nối với các chuyên gia trong lĩnh vực",
        target: "Kết nối với ít nhất 5 chuyên gia trong lĩnh vực",
        timeline: "3 tháng",
      },
    ];
  } catch (error) {
    console.error("Lỗi khi tạo kế hoạch cải thiện:", error);
    return [];
  }
};
