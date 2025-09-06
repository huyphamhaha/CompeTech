import React, { useState, useEffect } from "react";
import Header from "../Header/header.jsx";
import {
  AlertTriangle,
  Award,
  Minus,
  BookOpen,
  Eye,
  Clock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { db } from "../firebase.js";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import rulesService from "../../services/rulesService.js";

function RulesView() {
  const [activeTab, setActiveTab] = useState("behaviors"); // behaviors, plus, minus
  const [collapsedSections, setCollapsedSections] = useState({});
  const [behaviorsData, setBehaviorsData] = useState({});
  const [plusData, setPlusData] = useState({});
  const [minusData, setMinusData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRulesData();
  }, []);

  // Helper functions to map codes to categories
  const getCategoryFromCode = (code) => {
    // Map criterion codes to category keys
    const codeToCategory = {
      // Yêu nước
      "PC1.1": "yeu_nuoc",
      "PC1.2": "yeu_nuoc",
      "PC1.3": "yeu_nuoc",
      "PC1.4": "yeu_nuoc",
      "PC1.5": "yeu_nuoc",
      // Nhân ái
      "PC2.1": "nhan_ai",
      "PC2.2": "nhan_ai",
      "PC2.3": "nhan_ai",
      "PC2.4": "nhan_ai",
      "PC2.5": "nhan_ai",
      "PC2.6": "nhan_ai",
      // Chăm chỉ
      "PC3.1": "cham_chi",
      "PC3.2": "cham_chi",
      "PC3.3": "cham_chi",
      "PC3.4": "cham_chi",
      "PC3.5": "cham_chi",
      // Trung thực
      "PC4.1": "trung_thuc",
      "PC4.2": "trung_thuc",
      "PC4.3": "trung_thuc",
      "PC4.4": "trung_thuc",
      "PC4.5": "trung_thuc",
      // Trách nhiệm
      "PC5.1": "trach_nhiem",
      "PC5.2": "trach_nhiem",
      "PC5.3": "trach_nhiem",
      "PC5.4": "trach_nhiem",
      "PC5.5": "trach_nhiem",
      "PC5.6": "trach_nhiem",
      "PC5.7": "trach_nhiem",
      "PC5.8": "trach_nhiem",
      "PC5.9": "trach_nhiem",
      "PC5.10": "trach_nhiem",
    };

    const result = codeToCategory[code] || "unknown";
    console.log(`Code ${code} mapped to category: ${result}`);

    // Nếu kết quả là unknown, in ra cảnh báo chi tiết
    if (result === "unknown") {
      console.log(
        `❌ ERROR: Unknown code "${code}" - please check Firebase data`
      );
      console.log(`Available codes:`, Object.keys(codeToCategory));
    }

    return result;
  };

  const getCategoryName = (categoryKey) => {
    const categoryNames = {
      yeu_nuoc: "Yêu nước",
      nhan_ai: "Nhân ái",
      cham_chi: "Chăm chỉ",
      trung_thuc: "Trung thực",
      trach_nhiem: "Trách nhiệm",
      unknown: "Khác",
    };
    return categoryNames[categoryKey] || "Khác";
  };

  // Sắp xếp categories theo thứ tự mong muốn
  const getSortedCategories = (data) => {
    const categoryOrder = [
      "yeu_nuoc",
      "nhan_ai",
      "cham_chi",
      "trung_thuc",
      "trach_nhiem",
    ];
    const sortedEntries = [];

    categoryOrder.forEach((categoryKey) => {
      if (data[categoryKey]) {
        sortedEntries.push([categoryKey, data[categoryKey]]);
      }
    });

    return sortedEntries;
  };

  // Sắp xếp criteria theo thứ tự tăng dần (PC1.1, PC1.2, PC1.3, ...)
  const getSortedCriteria = (criteria) => {
    if (!criteria || typeof criteria !== "object") {
      return [];
    }

    // Lọc bỏ những criterion trống (không có behaviors/plus/minus)
    const filteredCriteria = Object.entries(criteria).filter(
      ([code, criterion]) => {
        const hasBehaviors =
          criterion.behaviors && Object.keys(criterion.behaviors).length > 0;
        const hasPlus =
          criterion.plus && Object.keys(criterion.plus).length > 0;
        const hasMinus =
          criterion.minus && Object.keys(criterion.minus).length > 0;
        return hasBehaviors || hasPlus || hasMinus;
      }
    );

    return filteredCriteria.sort(([a], [b]) => {
      // Sắp xếp theo thứ tự số học: PC1.1, PC1.2, PC1.10, PC2.1, PC2.2, ...
      const aMatch = a.match(/PC(\d+)\.(\d+)/);
      const bMatch = b.match(/PC(\d+)\.(\d+)/);

      if (aMatch && bMatch) {
        const aCategory = parseInt(aMatch[1]);
        const aSub = parseInt(aMatch[2]);
        const bCategory = parseInt(bMatch[1]);
        const bSub = parseInt(bMatch[2]);

        // So sánh category trước
        if (aCategory !== bCategory) {
          return aCategory - bCategory;
        }
        // Nếu cùng category thì so sánh sub
        return aSub - bSub;
      }

      // Fallback về localeCompare nếu không match pattern
      return a.localeCompare(b);
    });
  };

  // Sắp xếp behaviors/plus/minus items theo thứ tự tăng dần
  const getSortedItems = (items) => {
    if (!items || typeof items !== "object") {
      return [];
    }

    // Lọc bỏ những item trống
    const filteredItems = Object.entries(items).filter(([code, item]) => {
      return item && item.code && item.description;
    });

    return filteredItems.sort(([a], [b]) => {
      // Sắp xếp theo thứ tự số học: PC1.1.A1, PC1.1.A2, PC1.1.A10, PC1.2.A1, ...
      const aMatch = a.match(/PC(\d+)\.(\d+)\.([A-Z])(\d+)/);
      const bMatch = b.match(/PC(\d+)\.(\d+)\.([A-Z])(\d+)/);

      if (aMatch && bMatch) {
        const aCategory = parseInt(aMatch[1]);
        const aSub = parseInt(aMatch[2]);
        const aType = aMatch[3];
        const aItem = parseInt(aMatch[4]);
        const bCategory = parseInt(bMatch[1]);
        const bSub = parseInt(bMatch[2]);
        const bType = bMatch[3];
        const bItem = parseInt(bMatch[4]);

        // So sánh category trước
        if (aCategory !== bCategory) {
          return aCategory - bCategory;
        }
        // Nếu cùng category thì so sánh sub
        if (aSub !== bSub) {
          return aSub - bSub;
        }
        // Nếu cùng sub thì so sánh type (A, B, C)
        if (aType !== bType) {
          return aType.localeCompare(bType);
        }
        // Nếu cùng type thì so sánh item number
        return aItem - bItem;
      }

      // Fallback về localeCompare nếu không match pattern
      return a.localeCompare(b);
    });
  };

  const fetchRulesData = async () => {
    try {
      setLoading(true);

      // Lấy dữ liệu từ Firebase
      const firebaseRules = await rulesService.getRulesFromFirebase();
      console.log("Firebase rules:", firebaseRules);

      // Lấy thông tin criterion từ Firebase
      const criteriaRules = await rulesService.getCriteriaFromFirebase();
      console.log("Criteria rules:", criteriaRules);

      // Tổ chức dữ liệu theo cấu trúc mong muốn
      const organizedBehaviors = {};
      const organizedPlus = {};
      const organizedMinus = {};

      // Phân loại rules theo type
      const behaviorsRules = firebaseRules.filter(
        (rule) => rule.type === "behaviors"
      );
      const plusRules = firebaseRules.filter((rule) => rule.type === "plus");
      const minusRules = firebaseRules.filter((rule) => rule.type === "minus");

      console.log("Behaviors rules count:", behaviorsRules.length);
      console.log("Plus rules count:", plusRules.length);
      console.log("Minus rules count:", minusRules.length);

      // Debug: In ra tất cả các mã có trong Firebase
      console.log("=== ALL CODES IN FIREBASE ===");
      console.log(
        "Criteria codes:",
        criteriaRules.map((c) => c.code)
      );
      console.log(
        "Behavior parent codes:",
        behaviorsRules.map((r) => r.parentCode)
      );
      console.log(
        "Plus parent codes:",
        plusRules.map((r) => r.parentCode)
      );
      console.log(
        "Minus parent codes:",
        minusRules.map((r) => r.parentCode)
      );
      console.log("=== END CODES DEBUG ===");

      // Tạo tất cả criterion trước (từ criteriaRules)
      criteriaRules.forEach((criterionInfo) => {
        console.log("Processing criterionInfo:", criterionInfo);

        // Bỏ qua những criterion trống hoặc không có mã
        if (!criterionInfo.code || !criterionInfo.code.trim()) {
          console.log("Skipping criterion with empty code:", criterionInfo);
          return;
        }

        const categoryKey = getCategoryFromCode(criterionInfo.code);
        console.log(
          `Criterion ${criterionInfo.code} -> Category: ${categoryKey}`
        );

        // Khởi tạo category nếu chưa tồn tại
        if (!organizedBehaviors[categoryKey]) {
          organizedBehaviors[categoryKey] = {
            name: getCategoryName(categoryKey),
            total_points: 0,
            criteria: {},
          };
        }
        if (!organizedPlus[categoryKey]) {
          organizedPlus[categoryKey] = {
            name: getCategoryName(categoryKey),
            total_points: 0,
            criteria: {},
          };
        }
        if (!organizedMinus[categoryKey]) {
          organizedMinus[categoryKey] = {
            name: getCategoryName(categoryKey),
            total_points: 0,
            criteria: {},
          };
        }

        // Tạo criterion trong tất cả 3 loại
        organizedBehaviors[categoryKey].criteria[criterionInfo.code] = {
          code: criterionInfo.code,
          description: criterionInfo.description || "Không có mô tả",
          point: criterionInfo.point || 0,
          behaviors: {},
        };
        organizedPlus[categoryKey].criteria[criterionInfo.code] = {
          code: criterionInfo.code,
          description: criterionInfo.description || "Không có mô tả",
          point: criterionInfo.point || 0,
          plus: {},
        };
        organizedMinus[categoryKey].criteria[criterionInfo.code] = {
          code: criterionInfo.code,
          description: criterionInfo.description || "Không có mô tả",
          point: criterionInfo.point || 0,
          minus: {},
        };
      });

      // Tổ chức behaviors data
      behaviorsRules.forEach((rule) => {
        console.log("Processing behavior rule:", rule);

        // Bỏ qua những rule trống hoặc không có parentCode
        if (!rule.parentCode || !rule.parentCode.trim()) {
          console.log("Skipping behavior rule with empty parentCode:", rule);
          return;
        }

        const {
          parentCode,
          code,
          description,
          point,
          pointType,
          conditions,
          levels,
        } = rule;

        // Lấy category từ parentCode
        const categoryKey = getCategoryFromCode(parentCode);
        console.log(
          `Behavior rule ${code} (parent: ${parentCode}) -> Category: ${categoryKey}`
        );

        // Thêm behavior vào criterion (criterion đã được tạo ở trên)
        if (
          organizedBehaviors[categoryKey] &&
          organizedBehaviors[categoryKey].criteria[parentCode]
        ) {
          organizedBehaviors[categoryKey].criteria[parentCode].behaviors[code] =
            {
              code,
              description,
              point: pointType === "fixed" ? point : pointType,
              pointType,
              conditions: conditions || [],
              levels: levels || [],
              id: rule.id,
              isFirebaseRule: true,
            };
        } else {
          console.log(
            `WARNING: Cannot add behavior ${code} to category ${categoryKey}, criterion ${parentCode}`
          );
        }
      });

      // Tổ chức plus data
      plusRules.forEach((rule) => {
        // Bỏ qua những rule trống hoặc không có parentCode
        if (!rule.parentCode || !rule.parentCode.trim()) {
          console.log("Skipping plus rule with empty parentCode:", rule);
          return;
        }

        const {
          parentCode,
          code,
          description,
          point,
          pointType,
          conditions,
          levels,
        } = rule;

        // Lấy category từ parentCode
        const categoryKey = getCategoryFromCode(parentCode);

        // Thêm plus item vào criterion (criterion đã được tạo ở trên)
        if (
          organizedPlus[categoryKey] &&
          organizedPlus[categoryKey].criteria[parentCode]
        ) {
          organizedPlus[categoryKey].criteria[parentCode].plus[code] = {
            code,
            description,
            point: pointType === "fixed" ? point : pointType,
            pointType,
            conditions: conditions || [],
            levels: levels || [],
            id: rule.id,
            isFirebaseRule: true,
          };
        }
      });

      // Tổ chức minus data
      minusRules.forEach((rule) => {
        // Bỏ qua những rule trống hoặc không có parentCode
        if (!rule.parentCode || !rule.parentCode.trim()) {
          console.log("Skipping minus rule with empty parentCode:", rule);
          return;
        }

        const {
          parentCode,
          code,
          description,
          point,
          pointType,
          conditions,
          levels,
        } = rule;

        // Lấy category từ parentCode
        const categoryKey = getCategoryFromCode(parentCode);

        // Thêm minus item vào criterion (criterion đã được tạo ở trên)
        if (
          organizedMinus[categoryKey] &&
          organizedMinus[categoryKey].criteria[parentCode]
        ) {
          organizedMinus[categoryKey].criteria[parentCode].minus[code] = {
            code,
            description,
            point: pointType === "fixed" ? point : pointType,
            pointType,
            conditions: conditions || [],
            levels: levels || [],
            id: rule.id,
            isFirebaseRule: true,
          };
        }
      });

      console.log("Organized behaviors:", organizedBehaviors);
      console.log("Organized plus:", organizedPlus);
      console.log("Organized minus:", organizedMinus);

      setBehaviorsData(organizedBehaviors);
      setPlusData(organizedPlus);
      setMinusData(organizedMinus);
    } catch (error) {
      console.error("Error fetching rules data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total points for behaviors only (không tính cho plus và minus)
  const calculateTotalPoints = () => {
    let total = 0;
    if (!behaviorsData || typeof behaviorsData !== "object") {
      return total;
    }

    Object.values(behaviorsData).forEach((category) => {
      if (
        !category ||
        !category.criteria ||
        typeof category.criteria !== "object"
      ) {
        return;
      }

      let categoryTotal = 0;
      Object.values(category.criteria).forEach((criterion) => {
        if (
          !criterion ||
          !criterion.behaviors ||
          typeof criterion.behaviors !== "object"
        ) {
          return;
        }

        let criterionTotal = 0;
        Object.values(criterion.behaviors).forEach((behavior) => {
          if (behavior && typeof behavior.point === "number") {
            criterionTotal += behavior.point;
          }
        });

        // Cập nhật tổng điểm của criterion
        criterion.point = criterionTotal;
        categoryTotal += criterionTotal;
      });

      // Cập nhật tổng điểm của category
      category.total_points = categoryTotal;
      total += categoryTotal;
    });
    return total;
  };

  const totalPoints = calculateTotalPoints();

  const toggleSection = (sectionKey) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const renderBehaviorsSection = () => {
    console.log("Rendering behaviors section");
    console.log("behaviorsData:", behaviorsData);
    console.log("loading:", loading);

    return (
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50">
              <div className="flex items-center gap-3 mb-2">
                <Eye className="text-blue-600" size={20} />
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "#064232" }}
                >
                  Tổng quan biểu hiện đạo đức
                </h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm">
                Hệ thống đánh giá biểu hiện đạo đức học sinh theo 5 chuẩn mực:
                Yêu nước, Nhân ái, Chăm chỉ, Trung thực, Trách nhiệm.
              </p>
              <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Tổng điểm biểu hiện:
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      totalPoints === 100 ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {totalPoints}/100 điểm
                  </span>
                </div>
                {totalPoints !== 100 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    ⚠️ Hệ thống chưa đạt đủ 100 điểm
                  </p>
                )}
              </div>
            </div>

            {/* Categories */}
            {getSortedCategories(behaviorsData || {}).map(
              ([categoryKey, category]) => {
                console.log(`Rendering category: ${categoryKey}`, category);
                return (
                  <div
                    key={categoryKey}
                    className="border border-gray-200 rounded-lg"
                  >
                    <div
                      className="bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleSection(categoryKey)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {collapsedSections[categoryKey] ? (
                            <ChevronRight size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                          <h3 className="font-semibold text-gray-900">
                            {category.name}
                          </h3>
                          <span className="text-sm text-gray-500">
                            Tổng: {category.total_points} điểm
                          </span>
                        </div>
                      </div>
                    </div>

                    {!collapsedSections[categoryKey] && (
                      <div className="p-4 space-y-4">
                        {getSortedCriteria(category.criteria).map(
                          ([criterionKey, criterion]) => {
                            console.log(
                              `Rendering criterion: ${criterionKey}`,
                              criterion
                            );
                            return (
                              <div
                                key={criterionKey}
                                className="border border-gray-200 rounded-lg"
                              >
                                <div className="bg-blue-50 px-4 py-3">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-medium text-gray-900">
                                        {criterion.code}
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        {criterion.description}
                                      </p>
                                      <span className="text-sm text-blue-600 font-medium">
                                        {criterion.point} điểm
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-4">
                                  {getSortedItems(
                                    criterion.behaviors || {}
                                  ).map(([behaviorKey, behavior]) => {
                                    console.log(
                                      `Rendering behavior: ${behaviorKey}`,
                                      behavior
                                    );
                                    return (
                                      <div
                                        key={behaviorKey}
                                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                                      >
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-700">
                                              {behavior.code}
                                            </span>
                                            <span className="text-sm text-green-600 font-medium">
                                              +{behavior.point} điểm
                                            </span>
                                          </div>
                                          <p className="text-sm text-gray-600 mt-1">
                                            {behavior.description}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </>
        )}
      </div>
    );
  };

  const renderPlusSection = () => (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="p-4 rounded-xl border-2 border-green-200 bg-green-50">
            <div className="flex items-center gap-3 mb-2">
              <Award className="text-green-600" size={20} />
              <h3
                className="text-lg font-semibold"
                style={{ color: "#064232" }}
              >
                Tổng quan điểm cộng
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed text-sm">
              Các hành vi tốt sẽ được cộng điểm hạnh kiểm để khuyến khích học
              sinh phát triển tích cực.
            </p>
          </div>

          {/* Categories */}
          {getSortedCategories(plusData || {}).map(
            ([categoryKey, category]) => (
              <div
                key={categoryKey}
                className="border border-gray-200 rounded-lg"
              >
                <div
                  className="bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSection(categoryKey)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {collapsedSections[categoryKey] ? (
                        <ChevronRight size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                      <h3 className="font-semibold text-gray-900">
                        {category.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        Tổng: {category.total_points} điểm
                      </span>
                    </div>
                  </div>
                </div>

                {!collapsedSections[categoryKey] && (
                  <div className="p-4 space-y-4">
                    {getSortedCriteria(category.criteria).map(
                      ([criterionKey, criterion]) => (
                        <div
                          key={criterionKey}
                          className="border border-gray-200 rounded-lg"
                        >
                          <div className="bg-green-50 px-4 py-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {criterion.code}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {criterion.description}
                                </p>
                                <span className="text-sm text-green-600 font-medium">
                                  {criterion.point} điểm
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4">
                            {getSortedItems(criterion.plus || {}).map(
                              ([plusKey, plusItem]) => (
                                <div
                                  key={plusKey}
                                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-700">
                                        {plusItem.code}
                                      </span>
                                      <span className="text-sm text-green-600 font-medium">
                                        {plusItem.point === "conditional"
                                          ? "Điều kiện"
                                          : `+${plusItem.point} điểm`}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {plusItem.description}
                                    </p>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )
          )}
        </>
      )}
    </div>
  );

  const renderMinusSection = () => (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="p-4 rounded-xl border-2 border-red-200 bg-red-50">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="text-red-600" size={20} />
              <h3
                className="text-lg font-semibold"
                style={{ color: "#064232" }}
              >
                Tổng quan điểm trừ
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed text-sm">
              Các vi phạm sẽ bị trừ điểm hạnh kiểm theo mức độ nghiêm trọng.
              Điểm hạnh kiểm ban đầu là 100 điểm.
            </p>
          </div>

          {/* Categories */}
          {getSortedCategories(minusData || {}).map(
            ([categoryKey, category]) => (
              <div
                key={categoryKey}
                className="border border-gray-200 rounded-lg"
              >
                <div
                  className="bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSection(categoryKey)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {collapsedSections[categoryKey] ? (
                        <ChevronRight size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                      <h3 className="font-semibold text-gray-900">
                        {category.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        Tổng: {category.total_points} điểm
                      </span>
                    </div>
                  </div>
                </div>

                {!collapsedSections[categoryKey] && (
                  <div className="p-4 space-y-4">
                    {getSortedCriteria(category.criteria).map(
                      ([criterionKey, criterion]) => (
                        <div
                          key={criterionKey}
                          className="border border-gray-200 rounded-lg"
                        >
                          <div className="bg-red-50 px-4 py-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {criterion.code}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {criterion.description}
                                </p>
                                <span className="text-sm text-red-600 font-medium">
                                  {criterion.point} điểm
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4">
                            {getSortedItems(criterion.minus || {}).map(
                              ([minusKey, minusItem]) => (
                                <div
                                  key={minusKey}
                                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-700">
                                        {minusItem.code}
                                      </span>
                                      <span className="text-sm text-red-600 font-medium">
                                        {minusItem.point === "conditional"
                                          ? "Điều kiện"
                                          : minusItem.point === "progressive"
                                          ? "Tiến triển"
                                          : `${minusItem.point} điểm`}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {minusItem.description}
                                    </p>
                                    {minusItem.point === "progressive" &&
                                      minusItem.levels && (
                                        <div className="mt-2 text-xs text-gray-500">
                                          <p>
                                            Cấp độ:{" "}
                                            {minusItem.levels
                                              .map(
                                                (level) =>
                                                  `L${level.level}: ${level.point} điểm`
                                              )
                                              .join(", ")}
                                          </p>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )
          )}
        </>
      )}
    </div>
  );

  return (
    <>
      <Header />
      <div className="min-h-screen" style={{ background: "#FFEFF2" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "#FCE3E1" }}
              >
                <BookOpen className="w-6 h-6" style={{ color: "#064232" }} />
              </div>
            </div>
            <h1
              className="text-3xl sm:text-4xl font-extrabold leading-tight"
              style={{ color: "#064232" }}
            >
              Thang điểm rèn luyện
            </h1>
            <p
              className="mt-3 text-lg max-w-2xl mx-auto"
              style={{ color: "#064232CC" }}
            >
              Quy định về biểu hiện, điểm cộng và điểm trừ hạnh kiểm
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-6">
            <div
              className="w-full mx-auto flex space-x-1 bg-white p-1 rounded-xl shadow-lg border"
              style={{ borderColor: "#568F87" }}
            >
              <button
                onClick={() => setActiveTab("behaviors")}
                className={`w-full flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === "behaviors"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Eye size={16} />
                  Biểu hiện (A)
                </div>
              </button>
              <button
                onClick={() => setActiveTab("minus")}
                className={`w-full flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === "minus"
                    ? "bg-red-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Minus size={16} />
                  Điểm trừ (B)
                </div>
              </button>
              <button
                onClick={() => setActiveTab("plus")}
                className={`w-full flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === "plus"
                    ? "bg-green-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Award size={16} />
                  Điểm cộng (C)
                </div>
              </button>
            </div>
          </div>

          {/* Content */}
          <div
            className="bg-white rounded-2xl shadow-lg border p-6"
            style={{ borderColor: "#568F87" }}
          >
            {activeTab === "behaviors" && renderBehaviorsSection()}
            {activeTab === "plus" && renderPlusSection()}
            {activeTab === "minus" && renderMinusSection()}

            {/* Footer Note */}
            <div
              className="mt-6 p-4 rounded-xl border-2"
              style={{ background: "#FCE3E1", borderColor: "#568F87" }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: "#064232" }}
                >
                  i
                </div>
                <div>
                  <h4
                    className="font-semibold mb-2 text-sm"
                    style={{ color: "#064232" }}
                  >
                    Thông tin quan trọng
                  </h4>
                  <ul
                    className="space-y-1 text-sm"
                    style={{ color: "#064232" }}
                  >
                    <li className="flex items-start gap-2">
                      <span className="text-xs mt-1">•</span>
                      <span>
                        Điểm hạnh kiểm ban đầu của mỗi học sinh là 100 điểm
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-xs mt-1">•</span>
                      <span>Các vi phạm có thể được cộng dồn điểm trừ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-xs mt-1">•</span>
                      <span>
                        Điểm cộng sẽ được tính vào tổng điểm hạnh kiểm
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-xs mt-1">•</span>
                      <span>
                        Học sinh có thể xem lịch sử điểm của mình trong phần
                        "Điểm rèn luyện"
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-xs mt-1">•</span>
                      <span>
                        Một số vi phạm có tính chất tiến triển (progressive) sẽ
                        tăng mức phạt theo số lần vi phạm
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-xs mt-1">•</span>
                      <span>
                        Một số vi phạm có tính chất điều kiện (conditional) sẽ
                        được đánh giá theo tình huống cụ thể
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RulesView;
