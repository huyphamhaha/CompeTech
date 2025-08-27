import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Facebook,
  Instagram,
  Linkedin,
  Sparkles,
} from "lucide-react";
import Header from "../header/header";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Tạm thời demo: mô phỏng gửi thành công
      await new Promise((r) => setTimeout(r, 600));
      setStatus({
        type: "success",
        message: "Đã gửi! Chúng tôi sẽ liên hệ sớm.",
      });
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus({ type: "error", message: "Có lỗi xảy ra. Vui lòng thử lại." });
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-16 relative overflow-hidden">
        {/* Background gradient + shapes */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(1200px 600px at 10% 10%, #FCE3E1 0%, transparent 60%), radial-gradient(1000px 500px at 90% 20%, #CDE6E1 0%, transparent 60%)",
          }}
        ></div>
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-40"
          style={{ background: "#CDE6E1" }}
        ></div>
        <div
          className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-40"
          style={{ background: "#FCE3E1" }}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm"
              style={{ borderColor: "#568F87", color: "#064232" }}
            >
              <Sparkles className="w-4 h-4" /> Kết nối cùng Competech
            </div>
            <h1
              className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight"
              style={{ color: "#064232" }}
            >
              Liên hệ để cùng tạo nên điều khác biệt
            </h1>
            <p
              className="mt-4 text-base sm:text-lg max-w-2xl mx-auto"
              style={{ color: "#06423299" }}
            >
              Bạn có câu hỏi, ý tưởng hợp tác hay cần hỗ trợ? Hãy nhắn cho chúng
              tôi.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Info cards */}
            <div className="space-y-4">
              <div
                className="rounded-2xl border p-6 bg-white/80 backdrop-blur"
                style={{ borderColor: "#CDE6E1" }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "#FCE3E1" }}
                  >
                    <Mail className="w-5 h-5" style={{ color: "#064232" }} />
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: "#064232" }}>
                      Email
                    </div>
                    <div className="text-sm" style={{ color: "#06423299" }}>
                      contact@competech.vn
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="rounded-2xl border p-6 bg-white/80 backdrop-blur"
                style={{ borderColor: "#CDE6E1" }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "#FCE3E1" }}
                  >
                    <Phone className="w-5 h-5" style={{ color: "#064232" }} />
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: "#064232" }}>
                      Hotline
                    </div>
                    <div className="text-sm" style={{ color: "#06423299" }}>
                      +84 909 000 000
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="rounded-2xl border p-6 bg-white/80 backdrop-blur"
                style={{ borderColor: "#CDE6E1" }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "#FCE3E1" }}
                  >
                    <MapPin className="w-5 h-5" style={{ color: "#064232" }} />
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: "#064232" }}>
                      Văn phòng
                    </div>
                    <div className="text-sm" style={{ color: "#06423299" }}>
                      THPT NCT
                    </div>
                  </div>
                </div>
              </div>

              {/* Socials */}
              <div
                className="rounded-2xl border p-6 bg-white/80 backdrop-blur"
                style={{ borderColor: "#CDE6E1" }}
              >
                <div
                  className="font-semibold mb-3"
                  style={{ color: "#064232" }}
                >
                  Mạng xã hội
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href="#"
                    className="p-3 rounded-xl border hover:opacity-90 transition"
                    style={{ borderColor: "#CDE6E1" }}
                  >
                    <Facebook
                      className="w-5 h-5"
                      style={{ color: "#064232" }}
                    />
                  </a>
                  <a
                    href="#"
                    className="p-3 rounded-xl border hover:opacity-90 transition"
                    style={{ borderColor: "#CDE6E1" }}
                  >
                    <Instagram
                      className="w-5 h-5"
                      style={{ color: "#064232" }}
                    />
                  </a>
                  <a
                    href="#"
                    className="p-3 rounded-xl border hover:opacity-90 transition"
                    style={{ borderColor: "#CDE6E1" }}
                  >
                    <Linkedin
                      className="w-5 h-5"
                      style={{ color: "#064232" }}
                    />
                  </a>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border p-6 sm:p-8 bg-white/90 backdrop-blur h-full"
                style={{ borderColor: "#CDE6E1" }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="text-sm font-medium"
                      style={{ color: "#064232" }}
                    >
                      Họ và tên
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Nguyễn Văn A"
                      className="mt-2 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
                      style={{ borderColor: "#CDE6E1" }}
                    />
                  </div>
                  <div>
                    <label
                      className="text-sm font-medium"
                      style={{ color: "#064232" }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="ban@abc.com"
                      className="mt-2 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
                      style={{ borderColor: "#CDE6E1" }}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      className="text-sm font-medium"
                      style={{ color: "#064232" }}
                    >
                      Nội dung
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="6"
                      placeholder="Hãy cho chúng tôi biết bạn cần gì..."
                      className="mt-2 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
                      style={{ borderColor: "#CDE6E1" }}
                    />
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  {status && (
                    <div
                      className={`text-sm ${
                        status.type === "success"
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {status.message}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium shadow-md hover:opacity-95 transition"
                    style={{
                      backgroundImage: "linear-gradient(90deg,#064232,#568F87)",
                    }}
                  >
                    <Send className="w-4 h-4" /> Gửi liên hệ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
