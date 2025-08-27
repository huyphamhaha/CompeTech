import React, { useEffect, useMemo, useState } from "react";
import Header from "../Header/header.jsx";

function RulesPDF() {
  const [inputUrl, setInputUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");

  const queryUrl = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("url") || "";
    } catch (e) {
      return "";
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("rulesPdfUrl") || "";
    const initial = queryUrl || stored || "/noiquy.pdf";
    setPdfUrl(initial);
    setInputUrl(initial);
  }, [queryUrl]);

  const handleApply = () => {
    const trimmed = inputUrl.trim();
    setPdfUrl(trimmed);
    if (trimmed) localStorage.setItem("rulesPdfUrl", trimmed);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen" style={{ background: "#FFEFF2" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          {/* Title */}
          <div className="text-center mb-6">
            <h1
              className="text-3xl sm:text-4xl font-extrabold"
              style={{ color: "#064232" }}
            >
              Thang điểm rèn luyện
            </h1>
            <p className="mt-2 text-sm" style={{ color: "#064232CC" }}>
              Nội quy của trường học và thang điểm rèn luyện
            </p>
          </div>

          {/* PDF viewer */}
          <div
            className="bg-white rounded-2xl shadow-lg border p-2"
            style={{ borderColor: "#568F87" }}
          >
            {!pdfUrl ? (
              <div
                className="p-8 text-center text-sm"
                style={{ color: "#064232" }}
              >
                Chưa có URL PDF. Dán đường link ở trên để hiển thị.
              </div>
            ) : (
              <div className="w-full">
                {/* Aspect ratio box ~ A4 landscape (1.414:1) */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    paddingTop: `${100 / 1.414}%`,
                  }}
                >
                  <iframe
                    title="Nội quy PDF"
                    src={pdfUrl}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      border: 0,
                    }}
                    allow="fullscreen"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default RulesPDF;
