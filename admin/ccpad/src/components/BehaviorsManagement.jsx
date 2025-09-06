import React, { useState, useEffect } from "react";
import { db } from "../firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  Plus,
  Search,
  Filter,
  Users,
  Award,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  UserCheck,
  UserX,
  X,
  User,
} from "lucide-react";
import { behaviorsData } from "../data/BehaviorsData.jsx";

import {
  importBehaviorsToFirebase,
  checkBehaviorsData,
} from "../utils/importBehaviors.jsx";

function BehaviorsManagement() {
  const [behaviors, setBehaviors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    fetchBehaviors();
  }, []);

  const fetchBehaviors = async () => {
    try {
      setLoading(true);
      const behaviorsRef = collection(db, "behaviors");
      const q = query(behaviorsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const behaviorsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || null,
      }));

      setBehaviors(behaviorsData);
    } catch (error) {
      console.error("Error fetching behaviors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportBehaviors = async () => {
    try {
      const result = await importBehaviorsToFirebase();
      if (result.success) {
        alert(result.message);
        fetchBehaviors(); // Refresh data
        setShowImportModal(false);
      } else {
        alert(`Lỗi: ${result.message}`);
      }
    } catch (error) {
      alert("Có lỗi xảy ra khi import dữ liệu biểu hiện");
    }
  };

  const handleCheckBehaviors = async () => {
    try {
      const result = await checkBehaviorsData();
      alert(
        `Trạng thái dữ liệu biểu hiện: ${
          result.exists ? `Có ${result.count} biểu hiện` : "Chưa có dữ liệu"
        }`
      );
    } catch (error) {
      alert("Có lỗi xảy ra khi kiểm tra dữ liệu biểu hiện");
    }
  };

  const exportToCSV = () => {
    const headers = ["STT", "Mã biểu hiện", "Mô tả", "Điểm", "Ngày tạo"];
    const csvContent = [
      headers.join(","),
      ...behaviors.map((behavior, index) =>
        [
          index + 1,
          behavior.code || "",
          `"${behavior.description || ""}"`,
          behavior.points || "",
          behavior.createdAt
            ? behavior.createdAt.toLocaleDateString("vi-VN")
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
      `danh_sach_bieu_hien_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredBehaviors = behaviors.filter((behavior) => {
    const matchesSearch =
      !searchTerm ||
      behavior.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      behavior.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu biểu hiện...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Quản lý Biểu hiện
                </h1>
                <p className="text-gray-600 mt-1">
                  Quản lý danh sách biểu hiện tích cực của học sinh
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchBehaviors}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <RefreshCw size={20} />
                  Làm mới
                </button>

                <button
                  onClick={handleCheckBehaviors}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <User size={20} />
                  Kiểm tra
                </button>

                <button
                  onClick={() => setShowImportModal(true)}
                  className="px-4 py-2 text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <User size={20} />
                  Import biểu hiện
                </button>

                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Xuất CSV
                </button>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm theo mã hoặc mô tả..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Behaviors List */}
          <div className="px-6 py-4">
            {behaviors.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Chưa có dữ liệu biểu hiện</p>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Import dữ liệu biểu hiện
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã biểu hiện
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mô tả
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Điểm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBehaviors.map((behavior, index) => (
                      <tr key={behavior.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            {behavior.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-md">{behavior.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            +{behavior.points} điểm
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {behavior.createdAt
                            ? behavior.createdAt.toLocaleDateString("vi-VN")
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination Info */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-700 text-center">
              Hiển thị {filteredBehaviors.length} trong tổng số{" "}
              {behaviors.length} biểu hiện
            </div>
          </div>
        </div>

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Import dữ liệu biểu hiện</h2>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 mb-4">
                  Dữ liệu biểu hiện sẽ được import từ danh sách cố định với{" "}
                  {behaviorsData.length} biểu hiện.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Lưu ý:</strong> Nếu đã có dữ liệu biểu hiện, hệ
                    thống sẽ bỏ qua import để tránh trùng lặp.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleImportBehaviors}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                >
                  Import
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BehaviorsManagement;
