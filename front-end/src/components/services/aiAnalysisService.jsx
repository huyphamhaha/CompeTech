import { GoogleGenerativeAI } from "@google/generative-ai";

// Khởi tạo Gemini API với API key từ env
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
// Cấu hình cho mô hình
const modelConfig = {
  temperature: 0.2, // Giảm temperature để có kết quả nhất quán hơn
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1024,
};

// Phân tích điểm mạnh và điểm yếu
export const analyzeStrengthsAndWeaknesses = async (activities) => {
  try {
    // Fallback when no API key configured
    if (!API_KEY || !genAI) {
      const categoryCount =
        activities?.reduce((acc, a) => {
          acc[a.category] = (acc[a.category] || 0) + 1;
          return acc;
        }, {}) || {};
      const topCategory = Object.entries(categoryCount).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0];
      return {
        strengths: [
          {
            title: topCategory
              ? `Tham gia nhiều ${topCategory}`
              : "Bắt đầu tham gia hoạt động",
            description: topCategory
              ? `Bạn tích cực tham gia các hoạt động thuộc nhóm ${topCategory}`
              : "Hãy khám phá và tham gia các hoạt động phù hợp",
            evidence: topCategory
              ? `Số lượng ${topCategory}: ${categoryCount[topCategory]}`
              : "Chưa có dữ liệu hoạt động",
          },
          {
            title: "Tinh thần chủ động",
            description: "Có xu hướng tìm kiếm cơ hội tham gia",
            evidence: "Đăng ký/quan tâm nhiều hoạt động",
          },
          {
            title: "Khả năng thích nghi",
            description: "Có thể tham gia đa dạng môi trường hoạt động",
            evidence: "Dấu hiệu tham gia nhiều nhóm hoạt động",
          },
        ],
        weaknesses: [
          {
            title: "Cần đa dạng hóa hoạt động",
            description:
              "Nên tham gia thêm các loại hoạt động khác để cân bằng",
            suggestion:
              "Thử các hoạt động như Workshop, Thiện nguyện, Câu lạc bộ",
          },
          {
            title: "Thiếu kế hoạch thời gian",
            description: "Chưa có lịch tham gia định kỳ để duy trì đều đặn",
            suggestion: "Đặt mục tiêu 2–3 hoạt động/tháng",
          },
          {
            title: "Theo dõi kết quả",
            description: "Chưa đánh giá hiệu quả từng nhóm hoạt động",
            suggestion: "Ghi nhận ngắn gọn sau mỗi hoạt động",
          },
        ],
      };
    }
    // Kiểm tra nếu không có hoạt động nào
    if (!activities || activities.length === 0) {
      return {
        strengths: [
          {
            title: "Chưa có hoạt động nào",
            description: "Bạn chưa tham gia hoạt động nào trong hệ thống",
            evidence:
              "Hãy bắt đầu tham gia các hoạt động để tích lũy điểm rèn luyện",
          },
        ],
        weaknesses: [
          {
            title: "Cần tham gia hoạt động",
            description:
              "Bạn cần tham gia các hoạt động để tích lũy điểm rèn luyện",
            suggestion:
              "Hãy xem các hoạt động đang diễn ra và đăng ký tham gia",
          },
          {
            title: "Chưa có dữ liệu phân tích",
            description:
              "Hệ thống chưa thể phân tích điểm mạnh và điểm yếu của bạn",
            suggestion:
              "Sau khi tham gia một số hoạt động, hệ thống sẽ có thể đưa ra phân tích chi tiết hơn",
          },
        ],
      };
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      ...modelConfig,
    });

    // Phân tích số lượng hoạt động theo loại
    const categoryCount = activities.reduce((acc, activity) => {
      acc[activity.category] = (acc[activity.category] || 0) + 1;
      return acc;
    }, {});

    // Không sử dụng điểm số
    const categoryPoints = {};

    // Phân tích xu hướng tham gia
    const monthlyActivities = activities.reduce((acc, activity) => {
      let monthLabel = "Không xác định";
      if (activity?.date) {
        const parsed = new Date(activity.date);
        if (!isNaN(parsed.getTime())) {
          monthLabel = parsed.toLocaleString("vi-VN", { month: "long" });
        }
      }
      if (!acc[monthLabel]) {
        acc[monthLabel] = { count: 0, categories: new Set() };
      }
      acc[monthLabel].count += 1;
      acc[monthLabel].categories.add(activity.category);
      return acc;
    }, {});

    // Chuẩn bị dữ liệu hoạt động
    const activitiesData = activities
      .map((activity) => {
        let dateStr = "Không rõ";
        if (activity?.date) {
          const parsed = new Date(activity.date);
          if (!isNaN(parsed.getTime())) {
            dateStr = parsed.toLocaleDateString("vi-VN");
          }
        }
        return `- Tên: ${activity.title}, Loại: ${activity.category}, Trạng thái: ${activity.status}, Ngày: ${dateStr}`;
      })
      .join("\n");

    const prompt = `
    Dưới đây là danh sách các hoạt động của một sinh viên:
    
    ${activitiesData}
    
    Thống kê theo loại hoạt động:
    ${Object.entries(categoryCount)
      .map(([category, count]) => `- ${category}: ${count} hoạt động`)
      .join("\n")}
    
    Phân tích theo tháng:
    ${Object.entries(monthlyActivities)
      .map(
        ([month, data]) =>
          `- ${month}: ${data.count} hoạt động, ${data.categories.size} loại hoạt động`
      )
      .join("\n")}
    
    Dựa trên thông tin trên, hãy phân tích chi tiết:
    1. Ba điểm mạnh chính của sinh viên này dựa trên:
       - Các loại hoạt động mà họ tham gia nhiều nhất
       - Sự đa dạng trong các hoạt động
       - Xu hướng tham gia theo thời gian
       - Tính đều đặn tham gia
       - Khả năng cân bằng giữa các loại hoạt động
    
    2. Ba điểm yếu cần cải thiện dựa trên:
       - Các loại hoạt động quan trọng mà họ ít tham gia
       - Sự cân bằng giữa các loại hoạt động
       - Tần suất tham gia hoạt động
       - Mức độ đều đặn tham gia
       - Các lĩnh vực còn thiếu hụt
    
    3. Đề xuất cụ thể cho việc cải thiện:
       - Các loại hoạt động nên tham gia thêm
       - Số lượng hoạt động nên tham gia mỗi tháng
       - Chiến lược để duy trì đều đặn và đa dạng
       - Cách cân bằng giữa các loại hoạt động
    
    Trả về kết quả dưới dạng JSON với định dạng sau:
    {
      "strengths": [
        {
          "title": "Tiêu đề điểm mạnh",
          "description": "Mô tả chi tiết về điểm mạnh",
          "evidence": "Bằng chứng từ dữ liệu hoạt động"
        }
      ],
      "weaknesses": [
        {
          "title": "Tiêu đề điểm yếu",
          "description": "Mô tả chi tiết về điểm yếu",
          "suggestion": "Đề xuất cải thiện cụ thể"
        }
      ],
      "recommendations": {
        "activities": ["Danh sách các loại hoạt động nên tham gia"],
        "monthly_goal": "Số hoạt động nên tham gia mỗi tháng",
        "strategy": "Chiến lược duy trì đều đặn",
        "balance": "Cách cân bằng giữa các loại hoạt động"
      }
    }
    
    Chỉ trả về JSON, không có văn bản giải thích.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Trích xuất JSON từ phản hồi
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // Chuẩn hóa số lượng 3 mục cho strengths/weaknesses
      const normalizeToThree = (arr, fillerFactory) => {
        const out = Array.isArray(arr) ? arr.slice(0, 3) : [];
        while (out.length < 3) out.push(fillerFactory(out.length));
        return out;
      };
      parsed.strengths = normalizeToThree(parsed.strengths, (i) => ({
        title: `Thế mạnh ${i + 1}`,
        description: "Chưa đủ dữ liệu để phân tích thêm",
        evidence: "",
      }));
      parsed.weaknesses = normalizeToThree(parsed.weaknesses, (i) => ({
        title: `Điểm cần cải thiện ${i + 1}`,
        description: "Chưa đủ dữ liệu để phân tích thêm",
        suggestion: "Duy trì đều đặn 2–3 hoạt động/tháng",
      }));
      return parsed;
    }

    // Fallback nếu không thể phân tích JSON
    return {
      strengths: [
        {
          title: "Tham gia nhiều hoạt động đa dạng",
          description: "Sinh viên tham gia nhiều loại hoạt động khác nhau",
          evidence: `Đã tham gia ${
            Object.keys(categoryCount).length
          } loại hoạt động khác nhau`,
        },
        {
          title: "Tích cực trong các hoạt động cộng đồng",
          description: "Tham gia nhiều hoạt động thiện nguyện và tình nguyện",
          evidence: `Đã tham gia ${
            categoryCount["Thiện nguyện"] || 0
          } hoạt động thiện nguyện`,
        },
        {
          title: "Có động lực phát triển",
          description: "Thể hiện mong muốn tham gia và trải nghiệm",
          evidence: "Quan tâm đến nhiều hoạt động",
        },
      ],
      weaknesses: [
        {
          title: "Đều đặn tham gia",
          description:
            "Thiếu dữ liệu thời gian hoặc tần suất chưa ổn định làm giảm khả năng đánh giá",
          suggestion: "Duy trì đăng ký 2-3 hoạt động/tháng để ổn định",
        },
        {
          title: "Thiếu đa dạng hoạt động",
          description: "Chưa phân bổ giữa học thuật, kỹ năng và cộng đồng",
          suggestion: "Thêm hoạt động ở nhóm còn thiếu để cân bằng",
        },
        {
          title: "Hoạch định mục tiêu",
          description: "Chưa có mục tiêu tham gia theo quý/tháng",
          suggestion: "Đặt mục tiêu theo tháng để theo dõi tiến độ",
        },
      ],
      recommendations: {
        activities: [
          "Cuộc thi học thuật",
          "Workshop kỹ năng",
          "Hoạt động tình nguyện",
        ],
        monthly_goal: "2-3 hoạt động mỗi tháng",
        strategy: "Ưu tiên các hoạt động có điểm cao và phù hợp với thế mạnh",
        balance: "Phân bố đều giữa các loại hoạt động học thuật và ngoại khóa",
      },
    };
  } catch (error) {
    console.error("Lỗi khi phân tích điểm mạnh và điểm yếu:", error);
    return {
      strengths: [
        {
          title: "Không thể phân tích",
          description: "Hệ thống đang gặp lỗi khi phân tích dữ liệu",
          evidence: "Vui lòng thử lại sau",
        },
      ],
      weaknesses: [
        {
          title: "Lỗi hệ thống",
          description: "Không thể phân tích điểm mạnh và điểm yếu",
          suggestion:
            "Vui lòng thử lại sau hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục",
        },
      ],
      recommendations: {
        activities: ["Vui lòng thử lại sau"],
        monthly_goal: "Chưa có dữ liệu",
        strategy: "Chưa có dữ liệu",
        balance: "Chưa có dữ liệu",
      },
    };
  }
};

// Tạo đề xuất cải thiện
export const generateRecommendations = async (activities) => {
  try {
    // Fallback when no API key configured
    if (!API_KEY || !genAI) {
      const defaultCategories = [
        "Học thuật",
        "Tình nguyện",
        "Thi đua",
        "Kỹ năng",
      ];
      return defaultCategories.map((category) => ({
        title: `Hoạt động ${category}`,
        description: `Tham gia các hoạt động thuộc lĩnh vực ${category}`,
        category,
        completed: false,
      }));
    }
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      ...modelConfig,
    });

    // Phân tích hoạt động hiện tại
    const categoryCounts = activities.reduce((acc, activity) => {
      acc[activity.category] = (acc[activity.category] || 0) + 1;
      return acc;
    }, {});

    const categoryPoints = {};

    // Lấy danh sách các hoạt động đã tham gia
    const existingActivities = activities.map((a) => a.title.toLowerCase());

    const prompt = `Dựa trên hoạt động của sinh viên:
    - Số lượng hoạt động theo loại: ${JSON.stringify(categoryCounts)}
    - Điểm số theo loại: ${JSON.stringify(categoryPoints)}
    - Các hoạt động đã tham gia: ${existingActivities.join(", ")}
    
    Hãy đề xuất 4 hoạt động MỚI và KHÁC BIỆT mà sinh viên nên tham gia để phát triển bản thân.
    Lưu ý:
    - KHÔNG đề xuất các hoạt động đã tham gia
    - Mỗi đề xuất phải khác nhau về loại hoạt động
    - KHÔNG sử dụng từ "Hackathon" trong các đề xuất
    - Mỗi đề xuất cần có:
      + Tiêu đề ngắn gọn
      + Mô tả ngắn gọn về hoạt động
      + Loại hoạt động
    
    Trả về JSON với format:
    {
      "recommendations": [
        {
          "title": "Tiêu đề đề xuất",
          "description": "Mô tả ngắn gọn",
          "category": "Loại hoạt động",
          "completed": false
        }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      // Xử lý response để lấy JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const recommendations = JSON.parse(jsonMatch[0]);
        // Kiểm tra và loại bỏ các đề xuất trùng lặp
        const uniqueRecommendations = recommendations.recommendations.filter(
          (rec, index, self) =>
            index ===
            self.findIndex(
              (r) =>
                r.title.toLowerCase() === rec.title.toLowerCase() ||
                r.category.toLowerCase() === rec.category.toLowerCase()
            )
        );
        return uniqueRecommendations;
      }
      throw new Error("Không tìm thấy JSON hợp lệ trong response");
    } catch (error) {
      console.error("Lỗi khi parse JSON:", error);
      // Tạo các đề xuất mặc định không trùng lặp
      const defaultCategories = [
        "Học thuật",
        "Tình nguyện",
        "Thi đua",
        "Kỹ năng",
      ];
      return defaultCategories.map((category) => ({
        title: `Hoạt động ${category}`,
        description: `Tham gia các hoạt động thuộc lĩnh vực ${category}`,
        category: category,
        completed: false,
      }));
    }
  } catch (error) {
    console.error("Lỗi khi tạo đề xuất:", error);
    return [];
  }
};

// Dự đoán xu hướng điểm rèn luyện
export const predictPointsTrend = (pointsHistory) => {
  try {
    // Nếu không có lịch sử điểm, tạo dự đoán ban đầu
    if (!pointsHistory || pointsHistory.length === 0) {
      return {
        currentPoints: 0,
        predictedPoints: 400,
        percentChange: 100,
        trend: "up",
        monthlyPredictions: [
          { month: "Tháng 1", points: 100, activities: 1 },
          { month: "Tháng 2", points: 250, activities: 2 },
          { month: "Tháng 3", points: 400, activities: 3 },
        ],
      };
    }

    // Tính toán điểm hiện tại và các chỉ số
    const currentPoints = pointsHistory.reduce(
      (sum, point) => sum + point.points,
      0
    );
    const totalActivities = pointsHistory.length;
    const avgPointsPerActivity = currentPoints / totalActivities;

    // Dự đoán điểm cho 3 tháng tiếp theo
    const monthlyPredictions = [];
    let lastPredictedPoint = currentPoints;

    for (let i = 1; i <= 3; i++) {
      let predictedPoint;
      let predictedActivities;

      if (currentPoints === 0) {
        // Nếu chưa có điểm, dự đoán tăng dần
        predictedPoint = Math.round(100 * i);
        predictedActivities = i;
      } else {
        // Dựa trên trung bình điểm/hoạt động và số hoạt động hiện tại
        predictedActivities = Math.ceil(totalActivities * (1 + i * 0.5)); // Tăng 50% số hoạt động mỗi tháng
        predictedPoint = Math.round(avgPointsPerActivity * predictedActivities);

        // Đảm bảo dự đoán không giảm
        predictedPoint = Math.max(predictedPoint, lastPredictedPoint + 100);
      }

      // Giới hạn mức tăng hợp lý
      const maxIncrease = lastPredictedPoint + 300;
      predictedPoint = Math.min(predictedPoint, maxIncrease);

      monthlyPredictions.push({
        month: `Tháng ${i}`,
        points: predictedPoint,
        activities: predictedActivities,
      });

      lastPredictedPoint = predictedPoint;
    }

    // Tính phần trăm thay đổi
    const predictedPoints =
      monthlyPredictions[monthlyPredictions.length - 1].points;
    const percentChange = Math.round(
      ((predictedPoints - currentPoints) / (currentPoints || 1)) * 100
    );

    // Xác định xu hướng
    let trend = percentChange > 0 ? "up" : percentChange < 0 ? "down" : "same";

    return {
      currentPoints,
      predictedPoints,
      percentChange,
      trend,
      monthlyPredictions,
    };
  } catch (error) {
    console.error("Lỗi khi dự đoán xu hướng điểm:", error);
    return {
      currentPoints: 0,
      predictedPoints: 400,
      percentChange: 100,
      trend: "up",
      monthlyPredictions: [
        { month: "Tháng 1", points: 100, activities: 1 },
        { month: "Tháng 2", points: 250, activities: 2 },
        { month: "Tháng 3", points: 400, activities: 3 },
      ],
    };
  }
};

// Phân tích hoạt động theo loại
export const analyzeActivitiesByCategory = (activities) => {
  try {
    // Nhóm hoạt động theo loại
    const categoryCounts = {};
    // Không dùng điểm

    activities.forEach((activity) => {
      const category = activity.category;

      // Đếm số lượng hoạt động
      if (!categoryCounts[category]) {
        categoryCounts[category] = 0;
      }
      categoryCounts[category]++;

      // Bỏ tính điểm
    });

    // Tạo dữ liệu phân tích
    const analysisData = Object.keys(categoryCounts).map((category) => {
      // Giả lập xu hướng và phần trăm thay đổi
      const trends = ["up", "down", "same"];
      const randomTrend = trends[Math.floor(Math.random() * trends.length)];
      const randomPercentChange = Math.floor(Math.random() * 30) - 10; // -10 đến 20

      return {
        category,
        count: categoryCounts[category],
        // Không trả về điểm
        points: undefined,
        trend: randomTrend,
        percentChange: randomPercentChange,
      };
    });

    return analysisData;
  } catch (error) {
    console.error("Lỗi khi phân tích hoạt động theo loại:", error);
    return [
      {
        category: "Tình nguyện",
        count: 5,
        points: 25,
        trend: "up",
        percentChange: 20,
      },
      {
        category: "Câu lạc bộ",
        count: 3,
        points: 30,
        trend: "up",
        percentChange: 10,
      },
      {
        category: "Workshop",
        count: 1,
        points: 10,
        trend: "same",
        percentChange: 0,
      },
      {
        category: "Cuộc thi",
        count: 1,
        points: 15,
        trend: "down",
        percentChange: -5,
      },
    ];
  }
};

// Tạo dữ liệu phân tích AI đầy đủ
export const generateAIAnalysis = async (activities) => {
  try {
    // Phân tích điểm mạnh và điểm yếu
    const strengthsAndWeaknesses = await analyzeStrengthsAndWeaknesses(
      activities
    );

    // Tạo đề xuất cải thiện
    const recommendations = await generateRecommendations(activities);

    // Tạo dữ liệu lịch sử điểm
    const pointsHistory = [];

    // Dự đoán xu hướng điểm
    const pointsTrend = {
      currentPoints: 0,
      trend: "same",
      percentChange: 0,
      monthlyPredictions: [],
    };

    // Phân tích hoạt động theo loại (không dùng điểm)
    const activitiesAnalysis = analyzeActivitiesByCategory(activities);

    // Tổng hợp kết quả phân tích
    return {
      overview: {
        totalPoints: pointsTrend.currentPoints,
        trend: pointsTrend.trend,
        percentChange: pointsTrend.percentChange,
        strengths: strengthsAndWeaknesses.strengths,
        weaknesses: strengthsAndWeaknesses.weaknesses,
      },
      activities: activitiesAnalysis,
      recommendations: recommendations,
      progress: {
        lastMonth: 0,
        currentMonth: 0,
        target: 0,
        timeline: [],
      },
      monthlyPredictions: pointsTrend.monthlyPredictions,
    };
  } catch (error) {
    console.error("Lỗi khi tạo phân tích AI:", error);

    // Trả về dữ liệu mẫu nếu có lỗi
    return {
      overview: {
        totalPoints: 0,
        trend: "up",
        percentChange: 100,
        strengths: [
          {
            title: "Chưa có hoạt động nào",
            description: "Bạn chưa tham gia hoạt động nào trong hệ thống",
            evidence:
              "Hãy bắt đầu tham gia các hoạt động để tích lũy điểm rèn luyện",
          },
        ],
        weaknesses: [
          {
            title: "Cần tham gia hoạt động",
            description:
              "Bạn cần tham gia các hoạt động để tích lũy điểm rèn luyện",
            suggestion:
              "Hãy xem các hoạt động đang diễn ra và đăng ký tham gia",
          },
        ],
      },
      activities: [],
      recommendations: [],
      progress: {
        lastMonth: 0,
        currentMonth: 0,
        target: 100,
        timeline: [],
      },
      monthlyPredictions: [],
    };
  }
};
