import React, { useEffect, useState } from "react";
import { auth, db, storage } from "../firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  collection,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import {
  Edit,
  LogOut,
  Upload,
  Calendar,
  User,
  Mail,
  X,
  AlertCircle,
  Brain,
  Target,
} from "lucide-react";
import Header from "../Header/header";

function Profile() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newStudentId, setNewStudentId] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [newGender, setNewGender] = useState("");
  const [newPhotoURL, setNewPhotoURL] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [userBlogs, setUserBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userTests, setUserTests] = useState([]); // <-- Add this state
  const [testLoading, setTestLoading] = useState(true); // <-- Loading state for tests
  const [testError, setTestError] = useState(null); // <-- Error state for tests

  // Gỡ bỏ lịch sử giao dịch theo yêu cầu (không fetch nữa)

  const fetchUserBlogs = async (uid) => {
    const q = query(collection(db, "blogs"), where("author.uid", "==", uid));
    const querySnapshot = await getDocs(q);
    const blogs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUserBlogs(blogs);
  };

  const fetchUserData = async (user) => {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      setUserDetails(userData);
    } else {
      // Tạo tài liệu người dùng mới nếu không tồn tại
      const newUserDetails = {
        firstName: user.displayName,
        email: user.email,
        photo: user.photoURL,
      };
      await setDoc(docRef, newUserDetails);
      setUserDetails(newUserDetails);
    }
    setLoading(false);
  };

  // Fetch user's career tests
  const fetchUserTests = async (uid) => {
    setTestLoading(true);
    setTestError(null);
    try {
      const testsRef = collection(db, "career_tests");
      const q = query(testsRef, where("userUid", "==", uid));
      const querySnapshot = await getDocs(q);
      const tests = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort by createdAt descending if available
      tests.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );
      setUserTests(tests);
    } catch {
      setTestError("Không thể tải dữ liệu bài test của bạn.");
      setUserTests([]);
    } finally {
      setTestLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user);
        fetchUserBlogs(user.uid);
        fetchUserTests(user.uid);
      } else {
        setLoading(false);
        setTestLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.clear();
      window.location.href = "/";
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  const handleEditProfile = () => {
    setEditing(true);
    setNewFirstName(userDetails.firstName || "");
    setNewStudentId(userDetails.studentId || "");
    setNewClassName(userDetails.className || "");
    setNewGender(userDetails.gender || "");
    setNewPhotoURL(userDetails.photo);
    setImageFile(null);
  };

  const handleSaveProfile = async () => {
    try {
      const updatedFirstName =
        newFirstName.trim() === "" ? userDetails.firstName : newFirstName;

      let updatedData = {
        firstName: updatedFirstName,
        studentId: newStudentId.trim(),
        className: newClassName.trim(),
        gender: newGender,
      };

      if (imageFile) {
        const storageRef = ref(storage, `profilePics/${auth.currentUser.uid}`);
        await uploadBytes(storageRef, imageFile);
        const downloadURL = await getDownloadURL(storageRef);
        updatedData.photo = downloadURL;
      }

      const docRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(docRef, updatedData);
      await fetchUserData(auth.currentUser);
      setEditing(false);
      setImageFile(null);
      console.log("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error.message);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setNewPhotoURL(URL.createObjectURL(file));
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setNewFirstName(userDetails.firstName || "");
    setNewStudentId(userDetails.studentId || "");
    setNewClassName(userDetails.className || "");
    setNewGender(userDetails.gender || "");
    setNewPhotoURL(userDetails.photo);
    setImageFile(null);
    if (newPhotoURL && newPhotoURL.startsWith("blob:")) {
      URL.revokeObjectURL(newPhotoURL);
    }
  };

  // Định dạng ngày/tiền không còn cần dùng ở phiên bản này

  // Bỏ hẳn component lịch sử giao dịch

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 w-full flex justify-center items-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-xl text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="relative min-h-screen" style={{ background: "#FFEFF2" }}>
        <style>{`
          .noise { position: absolute; inset: 0; background-image: radial-gradient(circle at 20% 10%, rgba(245,186,187,0.35), transparent 45%); pointer-events: none; }
          .glass { background: rgba(255,255,255,0.85); backdrop-filter: saturate(160%) blur(12px); -webkit-backdrop-filter: saturate(160%) blur(12px); }
          .profile-wave { position: absolute; inset: 0; background: radial-gradient(1200px 400px at -10% 0%, #F5BABB 0%, transparent 60%); opacity: 0.9; }
        `}</style>

        <section
          className="relative overflow-hidden"
          style={{ minHeight: "260px" }}
        >
          <div className="profile-wave" />
          <div className="noise" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-10">
            {userDetails ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                <div className="lg:col-span-12">
                  <div
                    className="glass rounded-3xl shadow-xl border"
                    style={{ borderColor: "#F5BABB" }}
                  >
                    <div
                      className="p-8 border-b flex items-center gap-2"
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
                        Hồ sơ người dùng
                      </span>
                    </div>
                    <div className="p-8">
                      <div className="flex flex-col md:flex-row md:items-center gap-8">
                        <div className="relative">
                          <div
                            className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-4"
                            style={{ borderColor: "#F5BABB" }}
                          >
                            <img
                              src={userDetails.photo || "/default-avatar.png"}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h1
                              className="text-3xl md:text-4xl font-extrabold"
                              style={{ color: "#064232" }}
                            >
                              {userDetails.firstName}
                            </h1>
                          </div>
                          <div
                            className="mt-2 text-sm"
                            style={{ color: "#06423299" }}
                          >
                            {userDetails.email}
                          </div>
                          <div className="mt-4 flex flex-wrap gap-3">
                            <button
                              onClick={handleEditProfile}
                              className="inline-flex items-center px-4 py-2 rounded-lg text-white shadow-sm hover:opacity-95 transition"
                              style={{
                                backgroundImage:
                                  "linear-gradient(90deg,#064232,#568F87)",
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" /> Chỉnh sửa hồ sơ
                            </button>
                            <button
                              onClick={handleLogout}
                              className="inline-flex items-center px-4 py-2 rounded-lg"
                              style={{
                                color: "#064232",
                                background: "#F5BABB",
                              }}
                            >
                              <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-24 pb-8">
                <div className="flex justify-center items-center">
                  <div
                    className="animate-spin rounded-full h-8 w-8 border-b-2"
                    style={{ borderColor: "#064232" }}
                  ></div>
                  <p className="text-xl ml-3" style={{ color: "#06423299" }}>
                    Loading...
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {userDetails && (
          <section className="pb-10" style={{ background: "#FFEFF2" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left sidebar (cleaned) */}
                <div className="lg:col-span-4 space-y-8">
                  <div
                    className="glass rounded-2xl p-6 border"
                    style={{ borderColor: "#568F87", background: "#FFFFFF" }}
                  >
                    <div className="text-sm mb-2" style={{ color: "#064232" }}>
                      Thông tin
                    </div>
                    <div
                      className="flex items-center gap-3 p-3 rounded-lg mb-2"
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #568F87",
                      }}
                    >
                      <User className="w-5 h-5" style={{ color: "#064232" }} />
                      <span className="text-sm" style={{ color: "#064232" }}>
                        {userDetails.firstName || "Chưa cập nhật"}
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-3 p-3 rounded-lg mb-2"
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #568F87",
                      }}
                    >
                      <Mail className="w-5 h-5" style={{ color: "#064232" }} />
                      <span className="text-sm" style={{ color: "#064232" }}>
                        {userDetails.email}
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-3 p-3 rounded-lg mb-2"
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #568F87",
                      }}
                    >
                      <User className="w-5 h-5" style={{ color: "#064232" }} />
                      <span className="text-sm" style={{ color: "#064232" }}>
                        Mã số: {userDetails.studentId || "Chưa cập nhật"}
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-3 p-3 rounded-lg mb-2"
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #568F87",
                      }}
                    >
                      <User className="w-5 h-5" style={{ color: "#064232" }} />
                      <span className="text-sm" style={{ color: "#064232" }}>
                        Lớp: {userDetails.className || "Chưa cập nhật"}
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #568F87",
                      }}
                    >
                      <User className="w-5 h-5" style={{ color: "#064232" }} />
                      <span className="text-sm" style={{ color: "#064232" }}>
                        Giới tính: {userDetails.gender || "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                  {/* Removed personality profile per request */}
                </div>

                {/* Feed */}
                <div className="lg:col-span-8 space-y-8">
                  {/* Blogs */}
                  <div
                    className="glass rounded-2xl border"
                    style={{ borderColor: "#568F87", background: "#FFFFFF" }}
                  >
                    <div
                      className="p-4 border-b"
                      style={{ borderColor: "#568F87" }}
                    >
                      <h2
                        className="text-lg font-semibold"
                        style={{ color: "#064232" }}
                      >
                        Bài viết gần đây
                      </h2>
                    </div>
                    <div className="p-4">
                      {userBlogs.length === 0 ? (
                        <div className="text-center py-8">
                          <Calendar
                            className="w-12 h-12 mx-auto mb-3"
                            style={{ color: "#06423266" }}
                          />
                          <p className="text-sm" style={{ color: "#06423299" }}>
                            Chưa có bài viết nào
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {userBlogs.map((blog) => (
                            <div
                              key={blog.id}
                              className="group cursor-pointer rounded-2xl border p-4 hover:shadow-sm transition"
                              style={{
                                background: "#FFFFFF",
                                borderColor: "#568F87",
                              }}
                              onClick={() => navigate(`/blog/${blog.id}`)}
                            >
                              <div className="flex gap-4 items-start">
                                <img
                                  src={blog.CoverURL}
                                  alt=""
                                  className="w-32 h-24 object-cover rounded-xl"
                                />
                                <div className="flex-1">
                                  <h3
                                    className="font-semibold mb-1 group-hover:underline"
                                    style={{ color: "#064232" }}
                                  >
                                    {blog.Title}
                                  </h3>
                                  <p
                                    className="text-sm line-clamp-2"
                                    style={{ color: "#06423299" }}
                                  >
                                    {blog.Sapo}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tests */}
                  <div
                    className="glass rounded-2xl border"
                    style={{ borderColor: "#568F87", background: "#FFFFFF" }}
                  >
                    <div
                      className="p-4 border-b"
                      style={{ borderColor: "#568F87" }}
                    >
                      <h2
                        className="text-lg font-semibold"
                        style={{ color: "#064232" }}
                      >
                        Bài test hướng nghiệp
                      </h2>
                    </div>
                    <div className="p-4">
                      {testLoading ? (
                        <div className="text-center py-8">
                          <div
                            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-3"
                            style={{ borderColor: "#064232" }}
                          ></div>
                          <p className="text-sm" style={{ color: "#06423299" }}>
                            Đang tải dữ liệu bài test...
                          </p>
                        </div>
                      ) : testError ? (
                        <div className="text-center py-8">
                          <AlertCircle
                            className="w-12 h-12 mx-auto mb-3"
                            style={{ color: "#F87171" }}
                          />
                          <p className="text-sm" style={{ color: "#B91C1C" }}>
                            {testError}
                          </p>
                        </div>
                      ) : userTests.length === 0 ? (
                        <div className="text-center py-8">
                          <Target
                            className="w-12 h-12 mx-auto mb-3"
                            style={{ color: "#06423266" }}
                          />
                          <p className="text-sm" style={{ color: "#06423299" }}>
                            Bạn chưa có bài test nào.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {/* MBTI tests */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: "#FCE3E1" }}
                              >
                                <Brain
                                  className="w-4 h-4"
                                  style={{ color: "#064232" }}
                                />
                              </div>
                              <h3
                                className="text-base font-semibold"
                                style={{ color: "#064232" }}
                              >
                                Bài test MBTI
                              </h3>
                            </div>
                            {userTests.filter((t) => t.type === "mbti_test")
                              .length === 0 ? (
                              <div
                                className="text-xs"
                                style={{ color: "#06423299" }}
                              >
                                Chưa có bài test MBTI.
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {userTests
                                  .filter((t) => t.type === "mbti_test")
                                  .map((test) => (
                                    <div
                                      key={test.id}
                                      className="rounded-2xl border p-4 hover:shadow-sm transition"
                                      style={{
                                        background: "#FFFFFF",
                                        borderColor: "#568F87",
                                      }}
                                    >
                                      <div className="flex items-center justify-between gap-4">
                                        <div>
                                          <div
                                            className="text-sm"
                                            style={{ color: "#06423299" }}
                                          >
                                            MBTI
                                          </div>
                                          <div
                                            className="font-semibold"
                                            style={{ color: "#064232" }}
                                          >
                                            {test.mbtiResult || "Kết quả"}
                                          </div>
                                          <div
                                            className="text-xs"
                                            style={{ color: "#06423299" }}
                                          >
                                            Ngày làm:{" "}
                                            {test.createdAt?.seconds
                                              ? new Date(
                                                  test.createdAt.seconds * 1000
                                                ).toLocaleString("vi-VN")
                                              : "Không rõ"}
                                          </div>
                                        </div>
                                        <button
                                          className="px-4 py-2 rounded-lg text-white shadow-sm hover:opacity-95 transition"
                                          style={{
                                            backgroundImage:
                                              "linear-gradient(90deg,#064232,#568F87)",
                                          }}
                                          onClick={() =>
                                            navigate(`/test-result/${test.id}`)
                                          }
                                        >
                                          Xem chi tiết
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>

                          {/* Full tests */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: "#E8F4F2" }}
                              >
                                <Target
                                  className="w-4 h-4"
                                  style={{ color: "#064232" }}
                                />
                              </div>
                              <h3
                                className="text-base font-semibold"
                                style={{ color: "#064232" }}
                              >
                                Bài test tổng hợp (MBTI + RIASEC)
                              </h3>
                            </div>
                            {userTests.filter((t) => t.type === "full_test")
                              .length === 0 ? (
                              <div
                                className="text-xs"
                                style={{ color: "#06423299" }}
                              >
                                Chưa có bài test tổng hợp.
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {userTests
                                  .filter((t) => t.type === "full_test")
                                  .map((test) => (
                                    <div
                                      key={test.id}
                                      className="rounded-2xl border p-4 hover:shadow-sm transition"
                                      style={{
                                        background: "#FFFFFF",
                                        borderColor: "#568F87",
                                      }}
                                    >
                                      <div className="flex items-center justify-between gap-4">
                                        <div>
                                          <div
                                            className="text-sm"
                                            style={{ color: "#06423299" }}
                                          >
                                            Tổng hợp (MBTI + RIASEC)
                                          </div>
                                          <div
                                            className="font-semibold"
                                            style={{ color: "#064232" }}
                                          >
                                            {test.mbtiResult || "Kết quả"}
                                          </div>
                                          <div
                                            className="text-xs"
                                            style={{ color: "#06423299" }}
                                          >
                                            Ngày làm:{" "}
                                            {test.createdAt?.seconds
                                              ? new Date(
                                                  test.createdAt.seconds * 1000
                                                ).toLocaleString("vi-VN")
                                              : "Không rõ"}
                                          </div>
                                        </div>
                                        <button
                                          className="px-4 py-2 rounded-lg text-white shadow-sm hover:opacity-95 transition"
                                          style={{
                                            backgroundImage:
                                              "linear-gradient(90deg,#064232,#568F87)",
                                          }}
                                          onClick={() =>
                                            navigate(`/test-result/${test.id}`)
                                          }
                                        >
                                          Xem chi tiết
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right sidebar removed (the page is now two-column) */}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Edit Profile Modal - redesigned to match theme */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={handleCancelEdit}
          />
          <div
            className="relative w-full max-w-lg rounded-3xl border shadow-xl glass"
            style={{ borderColor: "#F5BABB" }}
          >
            <div
              className="p-5 border-b flex items-center gap-2 rounded-t-3xl"
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
                Chỉnh sửa hồ sơ
              </span>
              <button
                className="ml-auto text-gray-600 hover:opacity-80"
                onClick={handleCancelEdit}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#064232" }}
                >
                  Họ và tên
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: "#568F87" }}
                  />
                  <input
                    type="text"
                    maxLength="50"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none"
                    style={{
                      borderColor: "#568F87",
                      background: "#FFFFFF",
                      color: "#064232",
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#064232" }}
                  >
                    Mã số học viên
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                      style={{ color: "#568F87" }}
                    />
                    <input
                      type="text"
                      maxLength="20"
                      value={newStudentId}
                      onChange={(e) => setNewStudentId(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none"
                      style={{
                        borderColor: "#568F87",
                        background: "#FFFFFF",
                        color: "#064232",
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#064232" }}
                  >
                    Lớp
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                      style={{ color: "#568F87" }}
                    />
                    <select
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none"
                      style={{
                        borderColor: "#568F87",
                        background: "#FFFFFF",
                        color: "#064232",
                      }}
                    >
                      <option value="">Chọn lớp</option>
                      <option value="10A">10A</option>
                      <option value="10B">10B</option>
                      <option value="10C">10C</option>
                      <option value="11A">11A</option>
                      <option value="11B">11B</option>
                      <option value="11C">11C</option>
                      <option value="12A">12A</option>
                      <option value="12B">12B</option>
                      <option value="12C">12C</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#064232" }}
                  >
                    Giới tính
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                      style={{ color: "#568F87" }}
                    />
                    <select
                      value={newGender}
                      onChange={(e) => setNewGender(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none"
                      style={{
                        borderColor: "#568F87",
                        background: "#FFFFFF",
                        color: "#064232",
                      }}
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#064232" }}
                >
                  Ảnh đại diện
                </label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-full overflow-hidden border-2"
                    style={{ borderColor: "#F5BABB" }}
                  >
                    <img
                      src={
                        newPhotoURL ||
                        userDetails.photo ||
                        "/default-avatar.png"
                      }
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label
                    className="px-4 py-2 rounded-lg cursor-pointer text-white"
                    style={{
                      backgroundImage: "linear-gradient(90deg,#064232,#568F87)",
                    }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Chọn ảnh
                    </span>
                    <input
                      id="newPhoto"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>
            </div>
            <div
              className="p-6 border-t rounded-b-3xl flex justify-end gap-3"
              style={{ borderColor: "#F5BABB" }}
            >
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 rounded-lg"
                style={{ color: "#064232", background: "#F5BABB" }}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-6 py-2 rounded-lg text-white"
                style={{
                  backgroundImage: "linear-gradient(90deg,#064232,#568F87)",
                }}
              >
                <span className="inline-flex items-center gap-2">
                  <Edit className="w-4 h-4" /> Lưu thay đổi
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;
