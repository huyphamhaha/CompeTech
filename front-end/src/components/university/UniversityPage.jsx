import React from "react";
import Header from "../Header/header";
import { useNavigate } from "react-router-dom";
import { GraduationCap, FolderOpen } from "lucide-react";

const UniversityPage = () => {
  const navigate = useNavigate();
  return (
    <>
      <Header />
      <div className="min-h-screen" style={{ background: "#FFEFF2" }}>
        <div className="flex flex-col items-center justify-center pt-28 pb-16">
          <div className="text-center mb-8">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{
                background: "#FFFFFF",
                color: "#064232",
                border: "1px solid #568F87",
              }}
            >
              University & Major Guide
            </span>
            <h1
              className="text-4xl sm:text-5xl font-extrabold mb-4"
              style={{ color: "#064232" }}
            >
              Hướng Dẫn Đại Học & Ngành Học
            </h1>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: "#06423299" }}
            >
              Khám phá thông tin chi tiết về các trường đại học và ngành học phù
              hợp với bạn
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl px-4">
            {/* Card: Danh sách đại học */}
            <div
              className="flex-1 cursor-pointer glass rounded-2xl shadow-lg py-10 px-10 flex flex-col items-center justify-center hover:shadow-xl transition group border"
              style={{ borderColor: "#568F87" }}
              onClick={() => navigate("/university/list_university")}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition"
                style={{ background: "#fce3e1" }}
              >
                <GraduationCap
                  className="h-8 w-8"
                  style={{ color: "#064232" }}
                />
              </div>
              <div
                className="text-2xl font-bold mb-2"
                style={{ color: "#064232" }}
              >
                Danh sách đại học
              </div>
              <div className="text-center" style={{ color: "#06423299" }}>
                Khám phá các trường đại học, thông tin tuyển sinh, ngành đào
                tạo...
              </div>
            </div>

            {/* Card: Nhóm ngành đào tạo */}
            <div
              className="flex-1 cursor-pointer glass rounded-2xl shadow-lg py-10 px-10 flex flex-col items-center justify-center hover:shadow-xl transition group border"
              style={{ borderColor: "#568F87" }}
              onClick={() => navigate("/major")}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition"
                style={{ background: "#fce3e1" }}
              >
                <FolderOpen className="h-8 w-8" style={{ color: "#064232" }} />
              </div>
              <div
                className="text-2xl font-bold mb-2"
                style={{ color: "#064232" }}
              >
                Nhóm ngành đào tạo
              </div>
              <div className="text-center" style={{ color: "#06423299" }}>
                Xem các nhóm ngành, tổng quan và thống kê ngành học...
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UniversityPage;
