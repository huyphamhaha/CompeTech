"use client";

import { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaSearch,
  FaCheck,
  FaTimes,
  FaUserPlus,
  FaStopCircle,
  FaInfoCircle,
  FaStar,
  FaCheckCircle,
} from "react-icons/fa";
// Removed framer-motion to avoid dependency
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
import "./Events.css";
import React from "react";
import Header from "../Header/Header";
// Optional: toast can be wired later if available
// import { showWarningToast } from "../Toast/Toast";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState({});
  const [buttonCooldowns, setButtonCooldowns] = useState({});
  const COOLDOWN_TIME = 2000; // 2 giây

  const auth = getAuth();
  const db = getFirestore();

  // URL ảnh mặc định
  const DEFAULT_AVATAR = "./default-avatar.png";
  const DEFAULT_COVER = "./bg-profile.jpg";

  // Kiểm tra xem người dùng đã đăng ký sự kiện chưa
  const isRegistered = (eventId) => {
    const event = events.find((e) => e.id === eventId);
    return event?.registrations?.some(
      (reg) => reg.userId === auth.currentUser?.uid
    );
  };

  // Hàm kiểm tra và xử lý cooldown cho nút
  const handleButtonClick = (buttonId, callback) => {
    const now = Date.now();
    const lastClickTime = buttonCooldowns[buttonId] || 0;

    if (now - lastClickTime < COOLDOWN_TIME) {
      const remainingTime = Math.ceil(
        (COOLDOWN_TIME - (now - lastClickTime)) / 1000
      );
      // showWarningToast(`Vui lòng đợi ${remainingTime} giây trước khi thực hiện lại`);
      return;
    }

    setButtonCooldowns((prev) => ({
      ...prev,
      [buttonId]: now,
    }));

    callback();
  };

  // Xử lý đăng ký/hủy đăng ký sự kiện
  const handleRegistration = async (eventId) => {
    handleButtonClick(`register-${eventId}`, async () => {
      try {
        const eventRef = doc(db, "events", eventId);
        const eventDoc = await getDoc(eventRef);
        const eventData = eventDoc.data();

        if (isRegistered(eventId)) {
          // Hủy đăng ký
          const updatedRegistrations = eventData.registrations.filter(
            (reg) => reg.userId !== auth.currentUser.uid
          );
          await updateDoc(eventRef, {
            registrations: updatedRegistrations,
          });
        } else {
          // Đăng ký mới
          const newRegistration = {
            userId: auth.currentUser.uid,
            displayName: auth.currentUser.displayName || "Người dùng",
            email: auth.currentUser.email,
            photoURL: auth.currentUser.photoURL,
            status: "pending",
            registeredAt: new Date().toISOString(),
          };

          await updateDoc(eventRef, {
            registrations: arrayUnion(newRegistration),
          });
        }

        // Refresh danh sách sự kiện
        const eventsQuery = query(collection(db, "events"));
        const querySnapshot = await getDocs(eventsQuery);
        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsData);
      } catch (error) {
        console.error("Lỗi khi xử lý đăng ký:", error);
        setError("Không thể xử lý đăng ký sự kiện");
      }
    });
  };

  // Kiểm tra quyền admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setIsAdmin(userDoc.data().isAdmin || false);
        }
      }
    };
    checkAdminStatus();
  }, [auth.currentUser]);

  // Hàm lấy thông tin người tham gia từ collection users
  const fetchParticipantInfo = async (userId) => {
    if (!userId || participants[userId]) return;

    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setParticipants((prev) => ({
          ...prev,
          [userId]: {
            displayName: userData.firstName || "Người dùng",
            photoURL: userData.photo || DEFAULT_AVATAR,
            email: userData.email,
            studentId: userData.studentId,
            className: userData.className,
            gender: userData.gender,
          },
        }));
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người tham gia:", error);
    }
  };

  // Cập nhật useEffect để lấy thông tin người tham gia
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsQuery = query(collection(db, "events"));
        const querySnapshot = await getDocs(eventsQuery);
        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsData);

        // Lấy thông tin người tham gia cho mỗi sự kiện
        eventsData.forEach((event) => {
          if (event.registrations) {
            event.registrations.forEach((registration) => {
              if (registration.userId) {
                fetchParticipantInfo(registration.userId);
              }
            });
          }
        });
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sự kiện:", error);
        setError("Không thể tải danh sách sự kiện");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilter = (category) => {
    setCategoryFilter(category);
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    "Workshop",
    "Cuộc thi",
    "Thiện nguyện",
    "Câu lạc bộ",
    "Sự kiện",
  ];

  // Hàm kiểm tra trạng thái đăng ký của người dùng
  const getRegistrationStatus = (eventId) => {
    const event = events.find((e) => e.id === eventId);
    if (!event?.registrations) return null;

    const registration = event.registrations.find(
      (reg) => reg.userId === auth.currentUser?.uid
    );
    return registration?.status || null;
  };

  // Hàm kiểm tra xem người dùng có thể đăng ký/hủy đăng ký không
  const canModifyRegistration = (eventId) => {
    const status = getRegistrationStatus(eventId);
    return !status || status === "pending";
  };

  // Hàm hiển thị trạng thái đăng ký
  const renderRegistrationStatus = (eventId) => {
    const status = getRegistrationStatus(eventId);
    if (!status || status === "pending") return null;

    const statusConfig = {
      approved: {
        icon: <FaCheck />,
        text: "Đã được duyệt",
        className: "approved",
      },
      rejected: {
        icon: <FaTimes />,
        text: "Đã bị từ chối",
        className: "rejected",
      },
    };

    const config = statusConfig[status];
    return (
      <div className={`w-full registration-status ${config.className}`}>
        {config.icon}
        {config.text}
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 w-full flex justify-center items-center">
          <div className="flex items-center space-x-3">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: "#144435" }}
            ></div>
            <p className="text-xl" style={{ color: "#144435" }}>
              Đang tải danh sách sự kiện...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="relative min-h-screen" style={{ background: "#FFEFF2" }}>
        <style>{`
        .noise { position: absolute; inset: 0; background-image: radial-gradient(circle at 20% 10%, rgba(245,186,187,0.35), transparent 45%); pointer-events: none; }
        .glass { background: rgba(255,255,255,0.85); backdrop-filter: saturate(160%) blur(12px); -webkit-backdrop-filter: saturate(160%) blur(12px); }
        .events-wave { position: absolute; inset: 0; background: radial-gradient(1200px 400px at -10% 0%, #F5BABB 0%, transparent 60%); opacity: 0.9; }
      `}</style>

        <div className="events-wave" />
        <div className="noise" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-10">
          <div className="section-header text-center mb-12">
            <h1
              className="font-extrabold text-4xl md:text-5xl mb-4"
              style={{ color: "#144435" }}
            >
              Khám phá <span style={{ color: "#568F87" }}>Sự Kiện</span> Mới
            </h1>
            <p className="text-lg" style={{ color: "#14443599" }}>
              Tham gia các sự kiện thú vị và kết nối với cộng đồng
            </p>
          </div>

          <div
            className="glass rounded-3xl p-6 mb-8 border shadow-xl"
            style={{ borderColor: "#F5BABB" }}
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: "#568F87" }}
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm sự kiện..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{
                    borderColor: "#568F87",
                    background: "#FFFFFF",
                    color: "#144435",
                    focusRingColor: "#568F87",
                  }}
                />
              </div>

              <div className="md:w-48">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{
                    borderColor: "#568F87",
                    background: "#FFFFFF",
                    color: "#144435",
                    focusRingColor: "#568F87",
                  }}
                >
                  <option value="all">Tất cả danh mục</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Cuộc thi">Cuộc thi</option>
                  <option value="Thiện nguyện">Thiện nguyện</option>
                  <option value="Câu lạc bộ">Câu lạc bộ</option>
                  <option value="Sự kiện">Sự kiện</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="glass rounded-2xl overflow-hidden border shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                style={{ borderColor: "#F5BABB" }}
              >
                <div className="relative">
                  <img
                    src={event.image || DEFAULT_COVER}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3">
                    <div
                      className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-lg"
                      style={{
                        background: "linear-gradient(90deg,#144435,#568F87)",
                      }}
                    >
                      <FaCalendarAlt className="inline mr-1" />
                      {event.category}
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    {event.status === "closed" ? (
                      <div
                        className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-lg"
                        style={{ background: "#EF4444" }}
                      >
                        <FaStopCircle className="inline mr-1" />
                        Đã đóng
                      </div>
                    ) : (
                      <div
                        className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-lg"
                        style={{ background: "#10B981" }}
                      >
                        <FaCheckCircle className="inline mr-1" />
                        Đang mở
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <h3
                    className="text-xl font-bold mb-3 line-clamp-2"
                    style={{ color: "#144435" }}
                  >
                    {event.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div
                      className="flex items-center text-sm"
                      style={{ color: "#14443599" }}
                    >
                      <FaCalendarAlt
                        className="w-4 h-4 mr-2"
                        style={{ color: "#568F87" }}
                      />
                      <span>{event.date}</span>
                    </div>
                    <div
                      className="flex items-center text-sm"
                      style={{ color: "#14443599" }}
                    >
                      <FaClock
                        className="w-4 h-4 mr-2"
                        style={{ color: "#568F87" }}
                      />
                      <span>{event.time}</span>
                    </div>
                    <div
                      className="flex items-center text-sm"
                      style={{ color: "#14443599" }}
                    >
                      <FaMapMarkerAlt
                        className="w-4 h-4 mr-2"
                        style={{ color: "#568F87" }}
                      />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div
                      className="flex items-center text-sm"
                      style={{ color: "#14443599" }}
                    >
                      <FaUsers
                        className="w-4 h-4 mr-2"
                        style={{ color: "#568F87" }}
                      />
                      <span>
                        {event.registrations?.filter(
                          (reg) => reg.status === "approved"
                        ).length || 0}
                        /{event.maxParticipants} người tham gia
                      </span>
                    </div>
                  </div>

                  <p
                    className="text-sm mb-4 line-clamp-3"
                    style={{ color: "#14443599" }}
                  >
                    {event.description}
                  </p>

                  <div className="flex flex-col gap-2">
                    <button
                      className="w-full px-4 py-2 rounded-xl text-white font-medium transition hover:opacity-95"
                      style={{
                        backgroundImage:
                          "linear-gradient(90deg,#144435,#568F87)",
                      }}
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowEventDetailsModal(true);
                      }}
                    >
                      <FaInfoCircle className="inline mr-2" /> Chi tiết
                    </button>

                    {!isAdmin &&
                      event.status === "active" &&
                      canModifyRegistration(event.id) && (
                        <button
                          className={`w-full px-4 py-2 rounded-xl font-medium transition hover:opacity-95 ${
                            isRegistered(event.id) ? "text-white" : "text-white"
                          }`}
                          style={{
                            backgroundImage: isRegistered(event.id)
                              ? "linear-gradient(90deg,#EF4444,#DC2626)"
                              : "linear-gradient(90deg,#10B981,#059669)",
                          }}
                          onClick={() => handleRegistration(event.id)}
                        >
                          {isRegistered(event.id) ? (
                            <>
                              <FaTimes className="inline mr-2" /> Hủy đăng ký
                            </>
                          ) : (
                            <>
                              <FaUserPlus className="inline mr-2" /> Đăng ký
                              tham gia
                            </>
                          )}
                        </button>
                      )}
                  </div>

                  {auth.currentUser && renderRegistrationStatus(event.id)}
                </div>
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: "#F5BABB" }}
              >
                <FaCalendarAlt
                  className="w-8 h-8"
                  style={{ color: "#144435" }}
                />
              </div>
              <p className="text-lg font-medium" style={{ color: "#144435" }}>
                Không tìm thấy sự kiện nào
              </p>
              <p className="text-sm" style={{ color: "#14443599" }}>
                Hãy thử thay đổi từ khóa tìm kiếm hoặc danh mục
              </p>
            </div>
          )}

          {showEventDetailsModal && selectedEvent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => {
                  setShowEventDetailsModal(false);
                  setSelectedEvent(null);
                }}
              />
              <div
                className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl glass"
                style={{ borderColor: "#F5BABB" }}
              >
                <div
                  className="sticky top-0 z-10 p-6 border-b rounded-t-3xl flex items-center justify-between"
                  style={{
                    borderColor: "#F5BABB",
                    background: "rgba(255,255,255,0.95)",
                  }}
                >
                  <div className="flex items-center gap-2">
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
                      style={{ background: "#144435" }}
                    />
                    <span
                      className="ml-2 text-lg font-semibold"
                      style={{ color: "#144435" }}
                    >
                      Chi tiết sự kiện
                    </span>
                  </div>
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                    onClick={() => {
                      setShowEventDetailsModal(false);
                      setSelectedEvent(null);
                    }}
                  >
                    <FaTimes className="w-5 h-5" style={{ color: "#144435" }} />
                  </button>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div>
                      <img
                        src={selectedEvent.image || DEFAULT_COVER}
                        alt={selectedEvent.title}
                        className="w-full h-64 object-cover rounded-2xl"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <div className="flex gap-2 mb-4">
                        <span
                          className="px-3 py-1 rounded-full text-sm font-medium text-white"
                          style={{
                            background:
                              "linear-gradient(90deg,#144435,#568F87)",
                          }}
                        >
                          <FaCalendarAlt className="inline mr-1" />{" "}
                          {selectedEvent.category}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
                            selectedEvent.status === "active"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        >
                          {selectedEvent.status === "active" ? (
                            <>
                              <FaCheckCircle className="inline mr-1" /> Đang mở
                            </>
                          ) : (
                            <>
                              <FaStopCircle className="inline mr-1" /> Đã đóng
                            </>
                          )}
                        </span>
                      </div>
                      <h2
                        className="text-3xl font-bold mb-4"
                        style={{ color: "#144435" }}
                      >
                        {selectedEvent.title}
                      </h2>
                      <p
                        className="text-lg mb-6"
                        style={{ color: "#14443599" }}
                      >
                        {selectedEvent.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div
                      className="glass rounded-2xl p-4 border text-center"
                      style={{ borderColor: "#F5BABB" }}
                    >
                      <div
                        className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
                        style={{ background: "#F5BABB" }}
                      >
                        <FaCalendarAlt
                          className="w-6 h-6"
                          style={{ color: "#144435" }}
                        />
                      </div>
                      <h4
                        className="font-semibold mb-1"
                        style={{ color: "#144435" }}
                      >
                        Ngày diễn ra
                      </h4>
                      <p className="text-sm" style={{ color: "#14443599" }}>
                        {selectedEvent.date}
                      </p>
                    </div>

                    <div
                      className="glass rounded-2xl p-4 border text-center"
                      style={{ borderColor: "#F5BABB" }}
                    >
                      <div
                        className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
                        style={{ background: "#F5BABB" }}
                      >
                        <FaClock
                          className="w-6 h-6"
                          style={{ color: "#144435" }}
                        />
                      </div>
                      <h4
                        className="font-semibold mb-1"
                        style={{ color: "#144435" }}
                      >
                        Thời gian
                      </h4>
                      <p className="text-sm" style={{ color: "#14443599" }}>
                        {selectedEvent.time}
                      </p>
                    </div>

                    <div
                      className="glass rounded-2xl p-4 border text-center"
                      style={{ borderColor: "#F5BABB" }}
                    >
                      <div
                        className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
                        style={{ background: "#F5BABB" }}
                      >
                        <FaMapMarkerAlt
                          className="w-6 h-6"
                          style={{ color: "#144435" }}
                        />
                      </div>
                      <h4
                        className="font-semibold mb-1"
                        style={{ color: "#144435" }}
                      >
                        Địa điểm
                      </h4>
                      <p className="text-sm" style={{ color: "#14443599" }}>
                        {selectedEvent.location}
                      </p>
                    </div>

                    <div
                      className="glass rounded-2xl p-4 border text-center"
                      style={{ borderColor: "#F5BABB" }}
                    >
                      <div
                        className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
                        style={{ background: "#F5BABB" }}
                      >
                        <FaUsers
                          className="w-6 h-6"
                          style={{ color: "#144435" }}
                        />
                      </div>
                      <h4
                        className="font-semibold mb-1"
                        style={{ color: "#144435" }}
                      >
                        Số người tham gia
                      </h4>
                      <p className="text-sm" style={{ color: "#14443599" }}>
                        {selectedEvent.registrations?.filter(
                          (reg) => reg.status === "approved"
                        ).length || 0}
                        /{selectedEvent.maxParticipants} người
                      </p>
                    </div>
                  </div>

                  <div
                    className="glass rounded-2xl p-6 border mb-8"
                    style={{ borderColor: "#F5BABB" }}
                  >
                    <h4
                      className="text-xl font-semibold mb-4 flex items-center gap-2"
                      style={{ color: "#144435" }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "#F5BABB" }}
                      >
                        <FaUsers
                          className="w-4 h-4"
                          style={{ color: "#144435" }}
                        />
                      </div>
                      Danh sách người tham gia
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedEvent.registrations?.filter(
                        (reg) => reg.status === "approved"
                      ).length > 0 ? (
                        selectedEvent.registrations
                          .filter((reg) => reg.status === "approved")
                          .map((registration, index) => {
                            const participantInfo =
                              participants[registration.userId];
                            return (
                              <div
                                key={index}
                                className="glass rounded-xl p-4 border"
                                style={{ borderColor: "#F5BABB" }}
                              >
                                <div className="flex items-center gap-3">
                                  <img
                                    src={
                                      participantInfo?.photoURL ||
                                      registration.photoURL ||
                                      DEFAULT_AVATAR
                                    }
                                    alt={
                                      participantInfo?.displayName ||
                                      registration.displayName
                                    }
                                    className="w-12 h-12 rounded-full object-cover border-2"
                                    style={{ borderColor: "#F5BABB" }}
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="flex-1">
                                    <p
                                      className="font-semibold text-sm"
                                      style={{ color: "#144435" }}
                                    >
                                      {participantInfo?.displayName ||
                                        registration.displayName}
                                    </p>
                                    <p
                                      className="text-xs"
                                      style={{ color: "#14443599" }}
                                    >
                                      {participantInfo?.email ||
                                        registration.email}
                                    </p>
                                    {participantInfo?.studentId && (
                                      <p
                                        className="text-xs"
                                        style={{ color: "#14443599" }}
                                      >
                                        Mã số: {participantInfo.studentId}
                                      </p>
                                    )}
                                    {participantInfo?.className && (
                                      <p
                                        className="text-xs"
                                        style={{ color: "#14443599" }}
                                      >
                                        Lớp: {participantInfo.className}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                      ) : (
                        <div className="col-span-full text-center py-8">
                          <div
                            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                            style={{ background: "#F5BABB" }}
                          >
                            <FaUsers
                              className="w-8 h-8"
                              style={{ color: "#144435" }}
                            />
                          </div>
                          <p className="text-sm" style={{ color: "#14443599" }}>
                            Chưa có người tham gia nào
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className="sticky bottom-0 p-6 border-t rounded-b-3xl flex justify-end gap-3"
                  style={{
                    borderColor: "#F5BABB",
                    background: "rgba(255,255,255,0.95)",
                  }}
                >
                  {!isAdmin &&
                    selectedEvent.status === "active" &&
                    canModifyRegistration(selectedEvent.id) && (
                      <button
                        className={`px-6 py-3 rounded-xl font-medium transition hover:opacity-95 ${
                          isRegistered(selectedEvent.id)
                            ? "text-white"
                            : "text-white"
                        }`}
                        style={{
                          backgroundImage: isRegistered(selectedEvent.id)
                            ? "linear-gradient(90deg,#EF4444,#DC2626)"
                            : "linear-gradient(90deg,#10B981,#059669)",
                        }}
                        onClick={() => handleRegistration(selectedEvent.id)}
                      >
                        {isRegistered(selectedEvent.id) ? (
                          <>
                            <FaTimes className="inline mr-2" /> Hủy đăng ký
                          </>
                        ) : (
                          <>
                            <FaUserPlus className="inline mr-2" /> Đăng ký tham
                            gia
                          </>
                        )}
                      </button>
                    )}
                  <button
                    className="px-6 py-3 rounded-xl font-medium transition hover:opacity-95"
                    style={{ color: "#144435", background: "#F5BABB" }}
                    onClick={() => {
                      setShowEventDetailsModal(false);
                      setSelectedEvent(null);
                    }}
                  >
                    <FaTimes className="inline mr-2" /> Đóng
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div
              className="glass rounded-2xl p-4 border text-center"
              style={{ borderColor: "#EF4444", background: "#FEF2F2" }}
            >
              <div className="flex items-center justify-center gap-2">
                <FaTimes className="w-5 h-5" style={{ color: "#EF4444" }} />
                <span style={{ color: "#B91C1C" }}>{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Events;
