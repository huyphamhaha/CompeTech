import React, { useState, useEffect } from "react";
import { db } from "../firebase.js";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import {
  Search,
  Filter,
  Users,
  Mail,
  GraduationCap,
  Hash,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  RefreshCw,
} from "lucide-react";

function StudentManagement() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [sortBy, setSortBy] = useState("firstName");
  const [sortOrder, setSortOrder] = useState("asc");

  // Tạo danh sách lớp dựa trên quyền người dùng
  const getClassOptions = () => {
    if (user?.role === "admin") {
      return [
        "Tất cả",
        "10A",
        "10B",
        "10C",
        "11A",
        "11B",
        "11C",
        "12A",
        "12B",
        "12C",
      ];
    } else if (user?.role === "teacher") {
      return [user.class]; // Giáo viên chỉ thấy lớp của mình
    }
    return [];
  };

  const classOptions = getClassOptions();

  const sortOptions = [
    { value: "firstName", label: "Họ và Tên" },
    { value: "studentId", label: "Mã số học viên" },
    { value: "className", label: "Lớp" },
    { value: "gender", label: "Giới tính" },
    { value: "email", label: "Email" },
    { value: "createdAt", label: "Ngày tạo" },
  ];

  useEffect(() => {
    if (user) {
      // Tự động set lớp cho giáo viên
      if (user.role === "teacher") {
        setSelectedClass(user.class);
      } else {
        setSelectedClass("Tất cả");
      }
      fetchStudents();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortStudents();
  }, [students, searchTerm, selectedClass, sortBy, sortOrder]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, "users");

      // Tạo query dựa trên quyền người dùng
      let q;
      if (user?.role === "teacher") {
        // Giáo viên chỉ lấy học sinh của lớp mình
        q = query(
          usersRef,
          where("className", "==", user.class),
          orderBy("createdAt", "desc")
        );
      } else {
        // Admin lấy tất cả học sinh
        q = query(usersRef, orderBy("createdAt", "desc"));
      }

      const querySnapshot = await getDocs(q);

      const studentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));

      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortStudents = () => {
    let filtered = [...students];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by class
    if (selectedClass && selectedClass !== "Tất cả") {
      filtered = filtered.filter(
        (student) => student.className === selectedClass
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || "";
      let bValue = b[sortBy] || "";

      if (sortBy === "createdAt") {
        aValue = a.createdAt || new Date(0);
        bValue = b.createdAt || new Date(0);
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredStudents(filtered);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const exportToCSV = () => {
    const headers = [
      "STT",
      "Họ và Tên",
      "Mã số học viên",
      "Lớp",
      "Giới tính",
      "Email",
      "Ngày tạo",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredStudents.map((student, index) =>
        [
          index + 1,
          student.firstName || "",
          student.studentId || "",
          student.className || "",
          student.gender || "",
          student.email || "",
          student.createdAt
            ? student.createdAt.toLocaleDateString("vi-VN")
            : "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `danh_sach_hoc_sinh_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getClassStats = () => {
    const stats = {};
    students.forEach((student) => {
      if (student.className) {
        stats[student.className] = (stats[student.className] || 0) + 1;
      }
    });
    return stats;
  };

  const classStats = getClassStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu học sinh...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quản lý học sinh
              </h1>
              <p className="text-gray-600">
                Tổng cộng {students.length} học sinh
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Xuất CSV
              </button>
              <button
                onClick={fetchStudents}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Làm mới
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            {classOptions.slice(1).map((className) => (
              <div
                key={className}
                className="bg-gray-50 rounded-lg p-4 text-center"
              >
                <div className="text-2xl font-bold text-blue-600">
                  {classStats[className] || 0}
                </div>
                <div className="text-sm text-gray-600">{className}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div
            className={`grid grid-cols-1 ${
              user?.role === "admin" ? "md:grid-cols-3" : "md:grid-cols-2"
            } gap-4`}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, mã số, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Chỉ hiển thị dropdown lớp cho admin */}
            {user?.role === "admin" && (
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {classOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}

            {/* Hiển thị thông tin lớp cho giáo viên */}
            {user?.role === "teacher" && (
              <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                <GraduationCap className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-gray-700">Lớp: {user.class}</span>
              </div>
            )}

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option
                  key={`${option.value}-asc`}
                  value={`${option.value}-asc`}
                >
                  {option.label} (A-Z)
                </option>
              ))}
              {sortOptions.map((option) => (
                <option
                  key={`${option.value}-desc`}
                  value={`${option.value}-desc`}
                >
                  {option.label} (Z-A)
                </option>
              ))}
            </select>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-10">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STT
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("firstName")}
                    >
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Họ và Tên
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("studentId")}
                    >
                      <div className="flex items-center gap-1">
                        <Hash className="w-4 h-4" />
                        Mã số học viên
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("className")}
                    >
                      <div className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        Lớp
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("gender")}
                    >
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Giới tính
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("email")}
                    >
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        Email
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Ngày tạo
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student, index) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={student.photo || "/default-avatar.png"}
                              alt=""
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.firstName || "Chưa cập nhật"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.studentId || "Chưa cập nhật"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {student.className || "Chưa cập nhật"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            student.gender === "Nam"
                              ? "bg-blue-100 text-blue-800"
                              : student.gender === "Nữ"
                              ? "bg-pink-100 text-pink-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {student.gender || "Chưa cập nhật"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.email || "Chưa cập nhật"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.createdAt
                          ? student.createdAt.toLocaleDateString("vi-VN")
                          : "Chưa cập nhật"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Không tìm thấy học sinh nào</p>
              </div>
            )}
          </div>
          {/* Pagination Info */}
          <div className="mt-4 text-sm text-gray-700 text-center">
            Hiển thị {filteredStudents.length} trong tổng số {students.length}{" "}
            học sinh
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentManagement;
