import React, { useEffect } from "react";
import Header from "../Header/header";
import {
  Search,
  Star,
  Heart,
  Eye,
  MessageCircle,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  CheckCircle,
  Bot,
  FileText,
  Brain,
  MessageSquare,
  Target,
  Zap,
} from "lucide-react";

const Home = () => {
  useEffect(() => {
    const nav = document.getElementById("mainNav");
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      if (currentScroll <= 0) {
        nav.classList.remove("fixed");
        nav.classList.add("block");
      } else {
        nav.classList.remove("block");
        nav.classList.add("fixed");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style>{`
        .noise {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 20% 10%, rgba(245,186,187,0.35), transparent 45%);
          pointer-events: none;
        }
        .glass {
          background: rgba(255,255,255,0.75);
          backdrop-filter: saturate(160%) blur(12px);
          -webkit-backdrop-filter: saturate(160%) blur(12px);
        }
        .hero-wave {
          position: absolute;
          inset: 0;
          background: radial-gradient(1200px 400px at -10% 0%, #F5BABB 0%, transparent 60%);
          opacity: 0.9;
        }
      `}</style>

      <Header />

      {/* HERO */}
      <section
        className="relative overflow-hidden min-h-screen flex items-center"
        style={{ backgroundColor: "#FFEFF2" }}
      >
        <div className="hero-wave" />
        <div className="noise" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6">
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: "#F5BABB", color: "#064232" }}
              >
                ĐI ĐÀ LẠT =))))
              </span>
              <h1
                className="mt-6 text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight"
                style={{ color: "#064232" }}
              >
                Định hướng rèn luyện cùng
                <span
                  className="block mt-2 italic"
                  style={{ color: "#064232" }}
                >
                  CompeTech 🌟
                </span>
              </h1>
              <p
                className="mt-6 text-lg max-w-xl"
                style={{ color: "#064232CC" }}
              >
                Nền tảng học tập công nghệ số giúp học sinh có thể kiểm tra điểm
                rèn luyện, định hướng nghề nghiệp và đánh giá năng lực học tập
                của bản thân cùng các Chatbot AI tiên tiến nhất !
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href="../pv/interview.html"
                  className="font-semibold inline-flex items-center justify-center px-6 py-3 rounded-lg text-white shadow-sm hover:opacity-95 transition"
                  style={{
                    backgroundImage: "linear-gradient(90deg,#064232,#568F87)",
                  }}
                >
                  Khám phá ngay
                </a>
                <a
                  href="https://www.facebook.com/nctstemists"
                  className="font-semibold inline-flex items-center justify-center px-6 py-3 rounded-lg transition"
                  style={{ color: "#064232", background: "#F5BABB" }}
                >
                  Xem demo
                </a>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-6 text-center">
                <div
                  className="glass rounded-xl p-4 shadow-sm"
                  style={{ border: "1px solid #568F87" }}
                >
                  <div
                    className="text-2xl font-extrabold"
                    style={{ color: "#064232" }}
                  >
                    AI
                  </div>
                  <div className="text-sm" style={{ color: "#06423299" }}>
                    Đánh giá thông minh
                  </div>
                </div>
                <div
                  className="glass rounded-xl p-4 shadow-sm"
                  style={{ border: "1px solid #568F87" }}
                >
                  <div
                    className="text-2xl font-extrabold"
                    style={{ color: "#064232" }}
                  >
                    24/7
                  </div>
                  <div className="text-sm" style={{ color: "#06423299" }}>
                    Luyện tập mọi lúc
                  </div>
                </div>
                <div
                  className="glass rounded-xl p-4 shadow-sm"
                  style={{ border: "1px solid #568F87" }}
                >
                  <div
                    className="text-2xl font-extrabold"
                    style={{ color: "#064232" }}
                  >
                    Realtime
                  </div>
                  <div className="text-sm" style={{ color: "#06423299" }}>
                    Phản hồi tức thì
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative">
                <div
                  className="absolute -top-8 -left-8 w-28 h-28 rounded-2xl blur-2xl"
                  style={{
                    background: "linear-gradient(135deg,#F5BABB, #FFEFF2)",
                  }}
                />
                <div
                  className="glass rounded-3xl shadow-xl border"
                  style={{ borderColor: "#F5BABB" }}
                >
                  <div
                    className="p-4 border-b flex items-center gap-2"
                    style={{ borderColor: "#F5BABB" }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: "#F5BABB" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: "#568F87" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: "#064232" }}
                    />
                    <span
                      className="ml-2 text-sm font-semibold"
                      style={{ color: "#064232" }}
                    >
                      AI Interview Coach
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex gap-3 items-start">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: "#F5BABB", color: "#064232" }}
                      >
                        AI
                      </div>
                      <div
                        className="max-w-[75%] rounded-2xl px-4 py-3"
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid #F5BABB",
                          color: "#064232",
                        }}
                      >
                        Chào bạn! Hãy giới thiệu ngắn gọn về bản thân và mục
                        tiêu nghề nghiệp của bạn nhé.
                      </div>
                    </div>
                    <div className="flex gap-3 items-start justify-end">
                      <div
                        className="max-w-[75%] rounded-2xl px-4 py-3"
                        style={{ background: "#F5BABB", color: "#064232" }}
                      >
                        Mình là sinh viên năm cuối CNTT, muốn theo hướng
                        Frontend.
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: "#568F87", color: "#FFF" }}
                      >
                        AI
                      </div>
                      <div
                        className="max-w-[75%] rounded-2xl px-4 py-3"
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid #568F87",
                          color: "#064232",
                        }}
                      >
                        Rất tốt! Bạn hãy mô tả một dự án cá nhân khiến bạn tự
                        hào nhất và những thách thức bạn đã vượt qua.
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          background: "#FFEFF2",
                          color: "#064232",
                          border: "1px solid #F5BABB",
                        }}
                      >
                        Behavioral
                      </span>
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          background: "#FFEFF2",
                          color: "#064232",
                          border: "1px solid #568F87",
                        }}
                      >
                        Frontend
                      </span>
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          background: "#FFEFF2",
                          color: "#064232",
                          border: "1px solid #064232",
                        }}
                      >
                        System Design
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className="absolute -top-6 right-0 glass rounded-2xl shadow-lg p-4 border"
                  style={{ borderColor: "#568F87" }}
                >
                  <div
                    className="text-sm font-semibold"
                    style={{ color: "#064232" }}
                  >
                    Điểm CV
                  </div>
                  <div
                    className="mt-1 text-3xl font-extrabold"
                    style={{ color: "#064232" }}
                  >
                    8.6<span className="text-base align-super">/10</span>
                  </div>
                  <div
                    className="mt-2 h-2 rounded-full overflow-hidden"
                    style={{ background: "#FFEFF2" }}
                  >
                    <div
                      className="h-full"
                      style={{
                        width: "86%",
                        background: "linear-gradient(90deg,#F5BABB,#568F87)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* METRICS / TRUST */}
      <section className="py-12" style={{ background: "#FFEFF2" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div
              className="rounded-xl p-6 border"
              style={{ borderColor: "#568F87", background: "#FFFFFF" }}
            >
              <div
                className="text-3xl font-extrabold"
                style={{ color: "#064232" }}
              >
                10K+
              </div>
              <div className="text-sm" style={{ color: "#06423299" }}>
                Buổi luyện tập
              </div>
            </div>
            <div
              className="rounded-xl p-6 border"
              style={{ borderColor: "#568F87", background: "#FFFFFF" }}
            >
              <div
                className="text-3xl font-extrabold"
                style={{ color: "#064232" }}
              >
                2K+
              </div>
              <div className="text-sm" style={{ color: "#06423299" }}>
                CV được đánh giá
              </div>
            </div>
            <div
              className="rounded-xl p-6 border"
              style={{ borderColor: "#568F87", background: "#FFFFFF" }}
            >
              <div
                className="text-3xl font-extrabold"
                style={{ color: "#064232" }}
              >
                95%
              </div>
              <div className="text-sm" style={{ color: "#06423299" }}>
                Hài lòng người dùng
              </div>
            </div>
            <div
              className="rounded-xl p-6 border"
              style={{ borderColor: "#568F87", background: "#FFFFFF" }}
            >
              <div
                className="text-3xl font-extrabold"
                style={{ color: "#064232" }}
              >
                24/7
              </div>
              <div className="text-sm" style={{ color: "#06423299" }}>
                Sẵn sàng hỗ trợ
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="py-20"
        style={{ background: "#FFEFF2" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2
              className="text-3xl sm:text-4xl font-extrabold"
              style={{ color: "#064232" }}
            >
              I. Tính năng nổi bật
            </h2>
            <p className="mt-3 text-lg" style={{ color: "#06423299" }}>
              Khám phá những tính năng độc đáo giúp bạn chuẩn bị tốt nhất cho sự
              nghiệp
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div
              className="group relative rounded-2xl border p-6 shadow-sm hover:shadow-md transition"
              style={{ background: "#FFFFFF", borderColor: "#568F87" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "#FCE3E1" }}
              >
                <Bot className="w-6 h-6" style={{ color: "#064232" }} />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: "#064232" }}
              >
                Phỏng vấn thông minh
              </h3>
              <p className="mt-2" style={{ color: "#06423299" }}>
                Luyện tập với AI Coach, mô phỏng các tình huống phỏng vấn thực
                tế
              </p>
            </div>

            <div
              className="group relative rounded-2xl border p-6 shadow-sm hover:shadow-md transition"
              style={{ background: "#FFFFFF", borderColor: "#568F87" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "#FCE3E1" }}
              >
                <FileText className="w-6 h-6" style={{ color: "#064232" }} />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: "#064232" }}
              >
                Đánh giá CV
              </h3>
              <p className="mt-2" style={{ color: "#06423299" }}>
                Phân tích và chấm điểm hồ sơ, phát hiện điểm yếu cần cải thiện
              </p>
            </div>

            <div
              className="group relative rounded-2xl border p-6 shadow-sm hover:shadow-md transition"
              style={{ background: "#FFFFFF", borderColor: "#568F87" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "#FCE3E1" }}
              >
                <TrendingUp className="w-6 h-6" style={{ color: "#064232" }} />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: "#064232" }}
              >
                Lộ trình phát triển
              </h3>
              <p className="mt-2" style={{ color: "#06423299" }}>
                Đề xuất kế hoạch cải thiện kỹ năng dựa trên đánh giá AI
              </p>
            </div>

            <div
              className="group relative rounded-2xl border p-6 shadow-sm hover:shadow-md transition"
              style={{ background: "#FFFFFF", borderColor: "#568F87" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "#FCE3E1" }}
              >
                <MessageSquare
                  className="w-6 h-6"
                  style={{ color: "#064232" }}
                />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: "#064232" }}
              >
                Phản hồi tức thì
              </h3>
              <p className="mt-2" style={{ color: "#06423299" }}>
                Nhận đánh giá chi tiết và gợi ý cải thiện ngay sau mỗi buổi
                luyện tập
              </p>
            </div>

            <div
              className="group relative rounded-2xl border p-6 shadow-sm hover:shadow-md transition"
              style={{ background: "#FFFFFF", borderColor: "#568F87" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "#FCE3E1" }}
              >
                <Brain className="w-6 h-6" style={{ color: "#064232" }} />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: "#064232" }}
              >
                AI thông minh
              </h3>
              <p className="mt-2" style={{ color: "#06423299" }}>
                Sử dụng công nghệ AI tiên tiến để phân tích và đánh giá toàn
                diện
              </p>
            </div>

            <div
              className="group relative rounded-2xl border p-6 shadow-sm hover:shadow-md transition"
              style={{ background: "#FFFFFF", borderColor: "#568F87" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "#FCE3E1" }}
              >
                <Target className="w-6 h-6" style={{ color: "#064232" }} />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: "#064232" }}
              >
                Bài tập tình huống
              </h3>
              <p className="mt-2" style={{ color: "#06423299" }}>
                Thực hành với các tình huống thực tế từ nhiều ngành nghề khác
                nhau
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="py-20"
        style={{ background: "#FFEFF2" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2
              className="text-3xl sm:text-4xl font-extrabold"
              style={{ color: "#064232" }}
            >
              II. Cách sử dụng
            </h2>
            <p className="mt-3 text-lg" style={{ color: "#06423299" }}>
              Sản phẩm CompeTech nổi bật và vượt trội với 4 tính năng chính cùng
              vô vàng công cụ hỗ trợ khá, giúp hỗ trợ học sinh học tập, định
              hướng nghề nghiệp và đánh giá năng lực
            </p>
          </div>

          <div className="mt-12 relative">
            {/* <div
              className="absolute left-4 sm:left-1/2 sm:-translate-x-1/2 h-full w-px"
              style={{ background: "linear-gradient(#F5BABB,#568F87)" }}
            /> */}

            <div className="space-y-16">
              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1 md:pr-10">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex items-center justify-center h-12 w-12 rounded-full text-white"
                      style={{ background: "#064232" }}
                    >
                      1
                    </div>
                    <h3
                      className="text-2xl font-bold"
                      style={{ color: "#064232" }}
                    >
                      Nhập thông tin cá nhân
                    </h3>
                  </div>
                  <p className="mt-4 text-lg" style={{ color: "#06423299" }}>
                    Điền Họ và tên, Trường, Lớp và một số thông tin cơ bản để
                    bắt đầu hành trình của bạn.
                  </p>
                </div>
                <div className="order-1 md:order-2">
                  <div
                    className="glass rounded-3xl shadow-xl border"
                    style={{ borderColor: "#F5BABB" }}
                  >
                    <div
                      className="p-4 border-b flex items-center gap-2"
                      style={{ borderColor: "#F5BABB" }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#F5BABB" }}
                      />
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#568F87" }}
                      />
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#064232" }}
                      />
                      <span
                        className="ml-2 text-sm font-semibold"
                        style={{ color: "#064232" }}
                      >
                        Nhập thông tin cá nhân
                      </span>
                    </div>
                    <div className="p-6 grid grid-cols-1 gap-4">
                      <div>
                        <label
                          className="block text-sm font-medium mb-1"
                          style={{ color: "#064232" }}
                        >
                          Họ và tên
                        </label>
                        <div
                          className="rounded-lg px-3 py-2 border"
                          style={{
                            borderColor: "#568F87",
                            background: "#FFFFFF",
                            color: "#064232",
                          }}
                        >
                          Nguyễn Văn A
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#064232" }}
                          >
                            Trường
                          </label>
                          <div
                            className="rounded-lg px-3 py-2 border"
                            style={{
                              borderColor: "#568F87",
                              background: "#FFFFFF",
                              color: "#064232",
                            }}
                          >
                            THPT ABC
                          </div>
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#064232" }}
                          >
                            Lớp
                          </label>
                          <div
                            className="rounded-lg px-3 py-2 border"
                            style={{
                              borderColor: "#568F87",
                              background: "#FFFFFF",
                              color: "#064232",
                            }}
                          >
                            11A1
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#064232" }}
                          >
                            Email
                          </label>
                          <div
                            className="rounded-lg px-3 py-2 border"
                            style={{
                              borderColor: "#568F87",
                              background: "#FFFFFF",
                              color: "#064232",
                            }}
                          >
                            a.nguyen@example.com
                          </div>
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#064232" }}
                          >
                            SĐT
                          </label>
                          <div
                            className="rounded-lg px-3 py-2 border"
                            style={{
                              borderColor: "#568F87",
                              background: "#FFFFFF",
                              color: "#064232",
                            }}
                          >
                            09xx xxx xxx
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          className="px-4 py-2 rounded-lg text-white"
                          style={{
                            background:
                              "linear-gradient(90deg,#064232,#568F87)",
                          }}
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="order-1">
                  <div
                    className="glass rounded-3xl shadow-xl border"
                    style={{ borderColor: "#F5BABB" }}
                  >
                    <div
                      className="p-4 border-b flex items-center gap-2"
                      style={{ borderColor: "#F5BABB" }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#F5BABB" }}
                      />
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#568F87" }}
                      />
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#064232" }}
                      />
                      <span
                        className="ml-2 text-sm font-semibold"
                        style={{ color: "#064232" }}
                      >
                        Báo cáo thành tích cá nhân
                      </span>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className="rounded-xl p-4 border"
                        style={{
                          borderColor: "#568F87",
                          background: "#FFFFFF",
                        }}
                      >
                        <div className="text-sm" style={{ color: "#06423299" }}>
                          Điểm rèn luyện
                        </div>
                        <div
                          className="mt-1 text-3xl font-extrabold"
                          style={{ color: "#064232" }}
                        >
                          85<span className="text-base">/100</span>
                        </div>
                        <div
                          className="mt-2 h-2 rounded-full overflow-hidden"
                          style={{ background: "#FFEFF2" }}
                        >
                          <div
                            className="h-full"
                            style={{
                              width: "85%",
                              background:
                                "linear-gradient(90deg,#F5BABB,#568F87)",
                            }}
                          />
                        </div>
                      </div>
                      <div
                        className="rounded-xl p-4 border"
                        style={{
                          borderColor: "#568F87",
                          background: "#FFFFFF",
                        }}
                      >
                        <div className="text-sm" style={{ color: "#06423299" }}>
                          Hạnh kiểm
                        </div>
                        <div
                          className="mt-1 text-3xl font-extrabold"
                          style={{ color: "#064232" }}
                        >
                          Tốt
                        </div>
                        <div className="mt-2 flex gap-2">
                          <span
                            className="text-xs px-2 py-1 rounded-full"
                            style={{
                              background: "#FFEFF2",
                              border: "1px solid #568F87",
                              color: "#064232",
                            }}
                          >
                            Chuyên cần
                          </span>
                          <span
                            className="text-xs px-2 py-1 rounded-full"
                            style={{
                              background: "#FFEFF2",
                              border: "1px solid #F5BABB",
                              color: "#064232",
                            }}
                          >
                            Kỷ luật
                          </span>
                        </div>
                      </div>
                      <div
                        className="rounded-xl p-4 border md:col-span-2"
                        style={{
                          borderColor: "#568F87",
                          background: "#FFFFFF",
                        }}
                      >
                        <div
                          className="text-sm mb-2"
                          style={{ color: "#064232" }}
                        >
                          Tổng quan học kỳ
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center">
                            <div
                              className="text-2xl font-bold"
                              style={{ color: "#064232" }}
                            >
                              12
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: "#06423299" }}
                            >
                              Hoạt động
                            </div>
                          </div>
                          <div className="text-center">
                            <div
                              className="text-2xl font-bold"
                              style={{ color: "#064232" }}
                            >
                              4
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: "#06423299" }}
                            >
                              Khen thưởng
                            </div>
                          </div>
                          <div className="text-center">
                            <div
                              className="text-2xl font-bold"
                              style={{ color: "#064232" }}
                            >
                              0
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: "#06423299" }}
                            >
                              Nhắc nhở
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-2">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex items-center justify-center h-12 w-12 rounded-full text-white"
                      style={{ background: "#064232" }}
                    >
                      2
                    </div>
                    <h3
                      className="text-2xl font-bold"
                      style={{ color: "#064232" }}
                    >
                      Xem báo cáo thành tích cá nhân
                    </h3>
                  </div>
                  <p className="mt-4 text-lg" style={{ color: "#06423299" }}>
                    Theo dõi điểm rèn luyện, hạnh kiểm và kết quả tổng quan theo
                    từng học kỳ.
                  </p>
                </div>
              </div>

              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1 md:pr-10">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex items-center justify-center h-12 w-12 rounded-full text-white"
                      style={{ background: "#064232" }}
                    >
                      3
                    </div>
                    <h3
                      className="text-2xl font-bold"
                      style={{ color: "#064232" }}
                    >
                      Bài test năng lực chung và STEM
                    </h3>
                  </div>
                  <p className="mt-4 text-lg" style={{ color: "#06423299" }}>
                    Thực hiện bài test trắc nghiệm để đánh giá năng lực chung và
                    năng lực STEM, nhận phản hồi ngay.
                  </p>
                </div>
                <div className="order-1 md:order-2">
                  <div
                    className="glass rounded-3xl shadow-xl border"
                    style={{ borderColor: "#F5BABB" }}
                  >
                    <div
                      className="p-4 border-b flex items-center gap-2"
                      style={{ borderColor: "#F5BABB" }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#F5BABB" }}
                      />
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#568F87" }}
                      />
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#064232" }}
                      />
                      <span
                        className="ml-2 text-sm font-semibold"
                        style={{ color: "#064232" }}
                      >
                        Bài test năng lực
                      </span>
                    </div>
                    <div className="p-6 space-y-4">
                      <div
                        className="rounded-xl p-4 border"
                        style={{
                          borderColor: "#568F87",
                          background: "#FFFFFF",
                        }}
                      >
                        <div
                          className="text-sm mb-2"
                          style={{ color: "#06423299" }}
                        >
                          Câu 1/10 · STEM
                        </div>
                        <div
                          className="font-semibold mb-3"
                          style={{ color: "#064232" }}
                        >
                          Điện trở R nối tiếp R cho tổng là?
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div
                            className="rounded-lg px-3 py-2 border"
                            style={{ borderColor: "#568F87", color: "#064232" }}
                          >
                            2R
                          </div>
                          <div
                            className="rounded-lg px-3 py-2 border"
                            style={{ borderColor: "#568F87", color: "#064232" }}
                          >
                            R/2
                          </div>
                          <div
                            className="rounded-lg px-3 py-2 border"
                            style={{ borderColor: "#568F87", color: "#064232" }}
                          >
                            R
                          </div>
                          <div
                            className="rounded-lg px-3 py-2 border"
                            style={{ borderColor: "#568F87", color: "#064232" }}
                          >
                            4R
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div
                            className="text-xs"
                            style={{ color: "#06423299" }}
                          >
                            Thời gian: 01:10
                          </div>
                          <button
                            className="px-3 py-2 rounded-lg text-white"
                            style={{
                              background:
                                "linear-gradient(90deg,#064232,#568F87)",
                            }}
                          >
                            Trả lời
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="order-1">
                  <div
                    className="glass rounded-3xl shadow-xl border"
                    style={{ borderColor: "#F5BABB" }}
                  >
                    <div
                      className="p-4 border-b flex items-center gap-2"
                      style={{ borderColor: "#F5BABB" }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#F5BABB" }}
                      />
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#568F87" }}
                      />
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#064232" }}
                      />
                      <span
                        className="ml-2 text-sm font-semibold"
                        style={{ color: "#064232" }}
                      >
                        Nội quy trường và lớp
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <button
                          className="px-3 py-1.5 rounded-lg text-sm"
                          style={{ background: "#F5BABB", color: "#064232" }}
                        >
                          Trường
                        </button>
                        <button
                          className="px-3 py-1.5 rounded-lg text-sm"
                          style={{
                            background: "#FFEFF2",
                            color: "#064232",
                            border: "1px solid #F5BABB",
                          }}
                        >
                          Lớp
                        </button>
                      </div>
                      <div className="space-y-3 max-h-56 overflow-auto pr-2">
                        <div
                          className="rounded-lg p-3 border"
                          style={{
                            borderColor: "#568F87",
                            background: "#FFFFFF",
                          }}
                        >
                          <div
                            className="font-semibold"
                            style={{ color: "#064232" }}
                          >
                            Đi học đúng giờ
                          </div>
                          <div
                            className="text-sm"
                            style={{ color: "#06423299" }}
                          >
                            Có mặt trước giờ vào học 5 phút.
                          </div>
                        </div>
                        <div
                          className="rounded-lg p-3 border"
                          style={{
                            borderColor: "#568F87",
                            background: "#FFFFFF",
                          }}
                        >
                          <div
                            className="font-semibold"
                            style={{ color: "#064232" }}
                          >
                            Đồng phục
                          </div>
                          <div
                            className="text-sm"
                            style={{ color: "#06423299" }}
                          >
                            Mặc đúng đồng phục theo quy định vào các ngày đầu
                            tuần.
                          </div>
                        </div>
                        <div
                          className="rounded-lg p-3 border"
                          style={{
                            borderColor: "#568F87",
                            background: "#FFFFFF",
                          }}
                        >
                          <div
                            className="font-semibold"
                            style={{ color: "#064232" }}
                          >
                            Giữ gìn vệ sinh
                          </div>
                          <div
                            className="text-sm"
                            style={{ color: "#06423299" }}
                          >
                            Không xả rác; vệ sinh lớp sau giờ học.
                          </div>
                        </div>
                        <div
                          className="rounded-lg p-3 border"
                          style={{
                            borderColor: "#568F87",
                            background: "#FFFFFF",
                          }}
                        >
                          <div
                            className="font-semibold"
                            style={{ color: "#064232" }}
                          >
                            Thiết bị học tập
                          </div>
                          <div
                            className="text-sm"
                            style={{ color: "#06423299" }}
                          >
                            Mang đầy đủ sách vở, dụng cụ học tập theo thời khóa
                            biểu.
                          </div>
                        </div>

                        <div
                          className="rounded-lg p-3 border"
                          style={{
                            borderColor: "#568F87",
                            background: "#FFFFFF",
                          }}
                        >
                          <div
                            className="font-semibold"
                            style={{ color: "#064232" }}
                          >
                            Trật tự nề nếp
                          </div>
                          <div
                            className="text-sm"
                            style={{ color: "#06423299" }}
                          >
                            Giữ gìn sạch sẽ, trật tự trong lớp học.
                          </div>
                        </div>

                        <div
                          className="rounded-lg p-3 border"
                          style={{
                            borderColor: "#568F87",
                            background: "#FFFFFF",
                          }}
                        >
                          <div
                            className="font-semibold"
                            style={{ color: "#064232" }}
                          >
                            Học tập chăm chỉ
                          </div>
                          <div
                            className="text-sm"
                            style={{ color: "#06423299" }}
                          >
                            Học tập đầy đủ, không để trống hay bỏ bài, chuẩn bị
                            bài.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-2">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex items-center justify-center h-12 w-12 rounded-full text-white"
                      style={{ background: "#064232" }}
                    >
                      4
                    </div>
                    <h3
                      className="text-2xl font-bold"
                      style={{ color: "#064232" }}
                    >
                      Xem nội quy của trường và lớp
                    </h3>
                  </div>
                  <p className="mt-4 text-lg" style={{ color: "#06423299" }}>
                    Nắm rõ các quy định quan trọng của trường và lớp để tuân thủ
                    tốt trong học tập.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section
        id="testimonials"
        className="py-20"
        style={{ background: "#FFEFF2" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2
              className="text-3xl sm:text-4xl font-extrabold"
              style={{ color: "#064232" }}
            >
              III. Đánh giá từ người dùng
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div
              className="rounded-2xl p-6 border"
              style={{ borderColor: "#568F87", background: "#FFFFFF" }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-full text-white flex items-center justify-center"
                  style={{ background: "#064232" }}
                >
                  NH
                </div>
                <div>
                  <div className="font-bold" style={{ color: "#064232" }}>
                    Nguyễn Thị Hương
                  </div>
                  <div className="text-sm" style={{ color: "#06423299" }}>
                    Sinh viên ĐH Bách Khoa
                  </div>
                </div>
              </div>
              <p style={{ color: "#064232" }}>
                "AI Interview Coach đã giúp tôi tự tin hơn rất nhiều trong các
                buổi phỏng vấn thực tế. Các phản hồi rất chi tiết và hữu ích!"
              </p>
            </div>

            <div
              className="rounded-2xl p-6 border"
              style={{ borderColor: "#568F87", background: "#FFFFFF" }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-full text-white flex items-center justify-center"
                  style={{ background: "#064232" }}
                >
                  TM
                </div>
                <div>
                  <div className="font-bold" style={{ color: "#064232" }}>
                    Trần Văn Minh
                  </div>
                  <div className="text-sm" style={{ color: "#06423299" }}>
                    Sinh viên ĐH Kinh tế
                  </div>
                </div>
              </div>
              <p style={{ color: "#064232" }}>
                "Tôi đã cải thiện kỹ năng trả lời phỏng vấn đáng kể nhờ vào các
                bài tập tình huống thực tế từ nền tảng này."
              </p>
            </div>

            <div
              className="rounded-2xl p-6 border"
              style={{ borderColor: "#568F87", background: "#FFFFFF" }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-full text-white flex items-center justify-center"
                  style={{ background: "#064232" }}
                >
                  LA
                </div>
                <div>
                  <div className="font-bold" style={{ color: "#064232" }}>
                    Lê Thị Anh
                  </div>
                  <div className="text-sm" style={{ color: "#06423299" }}>
                    Sinh viên ĐH Ngoại thương
                  </div>
                </div>
              </div>
              <p style={{ color: "#064232" }}>
                "Phần đánh giá CV rất hữu ích, giúp tôi phát hiện và khắc phục
                những điểm yếu trong hồ sơ của mình."
              </p>
            </div>

            <div
              className="rounded-2xl p-6 border"
              style={{ borderColor: "#568F87", background: "#FFFFFF" }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-full text-white flex items-center justify-center"
                  style={{ background: "#064232" }}
                >
                  NT
                </div>
                <div>
                  <div className="font-bold" style={{ color: "#064232" }}>
                    Nguyễn Thị Thu Thảo
                  </div>
                  <div className="text-sm" style={{ color: "#06423299" }}>
                    Sinh viên ĐH Bách Khoa
                  </div>
                </div>
              </div>
              <p style={{ color: "#064232" }}>
                "Nhờ AI Interview Coach, tôi đã cảm thấy tự tin hơn hẳn mỗi khi
                tham gia phỏng vấn. Những góp ý từ hệ thống thực sự rõ ràng"
              </p>
            </div>

            <div
              className="rounded-2xl p-6 border"
              style={{ borderColor: "#568F87", background: "#FFFFFF" }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-full text-white flex items-center justify-center"
                  style={{ background: "#064232" }}
                >
                  PB
                </div>
                <div>
                  <div className="font-bold" style={{ color: "#064232" }}>
                    Phạm Gia Bảo
                  </div>
                  <div className="text-sm" style={{ color: "#06423299" }}>
                    Sinh viên ĐH Kinh tế
                  </div>
                </div>
              </div>
              <p style={{ color: "#064232" }}>
                "Tôi đã nâng cao kỹ năng trả lời phỏng vấn rõ rệt nhờ vào những
                tình huống thực tế mà nền tảng cung cấp."
              </p>
            </div>

            <div
              className="rounded-2xl p-6 border"
              style={{ borderColor: "#568F87", background: "#FFFFFF" }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-full text-white flex items-center justify-center"
                  style={{ background: "#064232" }}
                >
                  NA
                </div>
                <div>
                  <div className="font-bold" style={{ color: "#064232" }}>
                    Nguyễn Thị Ánh
                  </div>
                  <div className="text-sm" style={{ color: "#06423299" }}>
                    Sinh viên ĐH Ngoại thương
                  </div>
                </div>
              </div>
              <p style={{ color: "#064232" }}>
                "Phần đánh giá CV rất hữu ích, giúp tôi phát hiện và khắc phục
                những điểm yếu trong hồ sơ của mình."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20" style={{ background: "#FFEFF2" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2
              className="text-3xl sm:text-4xl font-extrabold"
              style={{ color: "#064232" }}
            >
              IV. Câu hỏi thường gặp
            </h2>
            <p className="mt-3 text-lg" style={{ color: "#06423299" }}>
              Một vài thắc mắc phổ biến khi bắt đầu với CompeTech
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className="rounded-2xl p-6 border"
              style={{ borderColor: "#568F87", background: "#FFFFFF" }}
            >
              <h3 className="font-semibold" style={{ color: "#064232" }}>
                CompeTech có miễn phí không?
              </h3>
              <p className="mt-2" style={{ color: "#06423299" }}>
                Bạn có thể bắt đầu với gói miễn phí để dùng thử tính năng. Các
                gói nâng cao sẽ mở khóa thêm nội dung và phân tích chuyên sâu.
              </p>
            </div>
            <div
              className="rounded-2xl p-6 border"
              style={{ borderColor: "#568F87", background: "#FFFFFF" }}
            >
              <h3 className="font-semibold" style={{ color: "#064232" }}>
                Dữ liệu cá nhân của tôi có an toàn?
              </h3>
              <p className="mt-2" style={{ color: "#06423299" }}>
                Chúng tôi tuân thủ nghiêm ngặt các tiêu chuẩn bảo mật và chỉ sử
                dụng dữ liệu cho mục đích trải nghiệm học tập.
              </p>
            </div>
            <div
              className="rounded-2xl p-6 border"
              style={{ borderColor: "#568F87", background: "#FFFFFF" }}
            >
              <h3 className="font-semibold" style={{ color: "#064232" }}>
                AI có hỗ trợ tiếng Việt?
              </h3>
              <p className="mt-2" style={{ color: "#06423299" }}>
                Có. AI hỗ trợ tiếng Việt và nhiều ngôn ngữ khác, tối ưu cho ngữ
                cảnh phỏng vấn trong nước.
              </p>
            </div>
            <div
              className="rounded-2xl p-6 border"
              style={{ borderColor: "#568F87", background: "#FFFFFF" }}
            >
              <h3 className="font-semibold" style={{ color: "#064232" }}>
                Tôi có thể tải kết quả đánh giá không?
              </h3>
              <p className="mt-2" style={{ color: "#06423299" }}>
                Bạn có thể tải báo cáo đánh giá dưới dạng PDF và chia sẻ với cố
                vấn hoặc nhà tuyển dụng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20" style={{ background: "#FFEFF2" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="glass rounded-3xl p-10 text-center border"
            style={{ borderColor: "#568F87" }}
          >
            <h3
              className="text-3xl font-extrabold"
              style={{ color: "#064232" }}
            >
              Sẵn sàng chinh phục buổi phỏng vấn tiếp theo?
            </h3>
            <p className="mt-3 text-lg" style={{ color: "#06423299" }}>
              Bắt đầu luyện tập cùng AI Coach và nhận phản hồi theo thời gian
              thực.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <a
                href="../pv/interview.html"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-white shadow-sm hover:opacity-95 transition"
                style={{
                  backgroundImage: "linear-gradient(90deg,#064232,#568F87)",
                }}
              >
                Bắt đầu ngay
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg"
                style={{ color: "#064232", background: "#F5BABB" }}
              >
                Khám phá tính năng
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="" style={{ background: "#064232" }}>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "#F5BABB" }}
                >
                  <span className="text-white font-bold text-sm">CT</span>
                </div>
                <span className="text-xl font-bold text-white">CompeTech</span>
              </div>
              <p className="text-gray-200 mb-4">
                Nền tảng AI hàng đầu giúp bạn phát triển kỹ năng phỏng vấn và
                định hướng nghề nghiệp
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <span className="sr-only">Facebook</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <span className="sr-only">LinkedIn</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                Sản phẩm
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Luyện phỏng vấn
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Đánh giá CV
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Định hướng nghề nghiệp
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Kỹ năng mềm
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                Hỗ trợ
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Trung tâm trợ giúp
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Liên hệ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Điều khoản
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Bảo mật
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8" style={{ borderTop: "1px solid #568F87" }}>
            <p className="text-white/80 text-center">
              &copy; 2025 CompeTech. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;
