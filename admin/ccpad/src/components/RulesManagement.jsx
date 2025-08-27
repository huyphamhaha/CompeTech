import React, { useState, useEffect } from "react";
import { db } from "../firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  AlertTriangle,
  Award,
  Minus,
  Eye,
  EyeOff,
} from "lucide-react";

function RulesManagement() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [activeTab, setActiveTab] = useState("penalty"); // penalty or reward

  const [formData, setFormData] = useState({
    type: "penalty", // penalty or reward
    code: "",
    description: "",
    points: -2,
    customPoints: "",
  });

  const pointOptions = {
    penalty: [-2, -4, -6, -8, "custom"],
    reward: [2, 4, 6, 8, "custom"],
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const rulesRef = collection(db, "rules");
      const q = query(rulesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const rulesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));

      setRules(rulesData);
    } catch (error) {
      // Silent error handling for production
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate custom points
    if (formData.points === "custom") {
      const customValue = parseInt(formData.customPoints);
      if (isNaN(customValue) || customValue <= 0) {
        alert("Vui lòng nhập số nguyên dương cho điểm tùy chỉnh");
        return;
      }
    }

    try {
      const ruleData = {
        ...formData,
        points:
          formData.points === "custom"
            ? formData.type === "penalty"
              ? -parseInt(formData.customPoints)
              : parseInt(formData.customPoints)
            : formData.points,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (editingRule) {
        await updateDoc(doc(db, "rules", editingRule.id), {
          ...ruleData,
          updatedAt: new Date(),
        });
      } else {
        await addDoc(collection(db, "rules"), ruleData);
      }

      setFormData({
        type: "penalty",
        code: "",
        description: "",
        points: -2,
        customPoints: "",
      });
      setShowAddForm(false);
      setEditingRule(null);
      fetchRules();

      // Thông báo thành công
      if (editingRule) {
        alert("Cập nhật nội quy thành công!");
      } else {
        alert("Thêm nội quy thành công!");
      }
    } catch (error) {
      alert("Có lỗi xảy ra khi lưu nội quy");
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      type: rule.type,
      code: rule.code,
      description: rule.description,
      points: rule.points,
      customPoints: "",
    });
    setShowAddForm(true);
  };

  const handleDelete = async (ruleId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nội quy này?")) {
      try {
        await deleteDoc(doc(db, "rules", ruleId));
        fetchRules();
        alert("Xóa nội quy thành công!");
      } catch (error) {
        alert("Có lỗi xảy ra khi xóa nội quy");
      }
    }
  };

  const filteredRules = rules.filter((rule) => rule.type === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 p-6 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Quản lý Nội quy
                </h1>
                <p className="text-gray-600">
                  Tạo và quản lý quy tắc điểm cộng/trừ
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setEditingRule(null);
                  setFormData({
                    type: activeTab,
                    code: "",
                    description: "",
                    points: activeTab === "penalty" ? -2 : 2,
                    customPoints: "",
                  });
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2"
              >
                <Plus size={16} />
                Thêm nội quy
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-md">
              <button
                onClick={() => setActiveTab("penalty")}
                className={`flex-1 py-2 px-4 rounded font-medium ${
                  activeTab === "penalty"
                    ? "bg-red-500 text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Minus size={16} />
                  Điểm trừ
                </div>
              </button>
              <button
                onClick={() => setActiveTab("reward")}
                className={`flex-1 py-2 px-4 rounded font-medium ${
                  activeTab === "reward"
                    ? "bg-green-500 text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Award size={16} />
                  Điểm cộng
                </div>
              </button>
            </div>
          </div>

          {/* Add/Edit Form Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-800">
                      {editingRule ? "Chỉnh sửa nội quy" : "Thêm nội quy mới"}
                    </h3>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingRule(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="px-6 py-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Mã quy tắc <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.code}
                          onChange={(e) =>
                            setFormData({ ...formData, code: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="VD: V001, V002, T001, T002..."
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Loại điểm <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              type: e.target.value,
                              points: e.target.value === "penalty" ? -2 : 2,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="penalty">Điểm trừ</option>
                          <option value="reward">Điểm cộng</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Điểm <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.points}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              points:
                                e.target.value === "custom"
                                  ? "custom"
                                  : parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          {pointOptions[formData.type].map((point) => (
                            <option key={point} value={point}>
                              {point === "custom"
                                ? "Tùy chỉnh"
                                : (point > 0 ? `+${point}` : point) + " điểm"}
                            </option>
                          ))}
                        </select>
                      </div>

                      {formData.points === "custom" && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Điểm tùy chỉnh{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={formData.customPoints}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                customPoints: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={`Nhập số (VD: 2, 5, 10) - sẽ ${
                              formData.type === "penalty" ? "trừ" : "cộng"
                            } điểm`}
                            required
                          />
                          <p className="text-xs text-gray-500">
                            Chỉ nhập số dương, hệ thống sẽ tự động{" "}
                            {formData.type === "penalty" ? "trừ" : "cộng"} điểm
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Mô tả chi tiết <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        rows="4"
                        placeholder={`Mô tả chi tiết về ${
                          activeTab === "penalty"
                            ? "lỗi vi phạm"
                            : "hành vi tốt"
                        }...`}
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Mô tả rõ ràng để học sinh và giáo viên dễ hiểu
                      </p>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddForm(false);
                          setEditingRule(null);
                        }}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                      >
                        {editingRule ? "Cập nhật" : "Tạo mới"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Rules List - Modern Table Layout */}
          <div className="px-6 py-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Đang tải...</p>
              </div>
            ) : filteredRules.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Chưa có nội quy{" "}
                  {activeTab === "penalty" ? "điểm trừ" : "điểm cộng"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-3 py-3 text-left text-sm font-medium text-gray-700">
                        Mô tả
                      </th>
                      <th className="border border-gray-300 px-3 py-3 text-center text-sm font-medium text-gray-700">
                        Mã quy tắc
                      </th>
                      <th className="border border-gray-300 px-3 py-3 text-center text-sm font-medium text-gray-700">
                        Điểm
                      </th>
                      <th className="border border-gray-300 px-3 py-3 text-center text-sm font-medium text-gray-700">
                        Ngày tạo
                      </th>
                      <th className="border border-gray-300 px-3 py-3 text-center text-sm font-medium text-gray-700">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRules.map((rule, index) => (
                      <tr
                        key={rule.id}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="border border-gray-300 px-3 py-3 text-sm text-gray-800">
                          <div className="flex items-start gap-2">
                            <span className="text-gray-500 text-xs">
                              {index + 1})
                            </span>
                            <span>{rule.description}</span>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-3 py-3 text-center">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                            {rule.code}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-3 py-3 text-center">
                          <span
                            className={`font-medium ${
                              rule.points > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {rule.points > 0 ? `+${rule.points}` : rule.points}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-3 py-3 text-center text-xs text-gray-500">
                          {rule.createdAt.toLocaleString("vi-VN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="border border-gray-300 px-3 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(rule)}
                              className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(rule.id)}
                              className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RulesManagement;
