import React, { useState, useEffect } from "react";
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
  ChevronDown,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

// Import rules service
import rulesService from "../services/rulesService.jsx";

function RulesManagement() {
  const [activeTab, setActiveTab] = useState("behaviors"); // behaviors, plus, minus
  const [collapsedSections, setCollapsedSections] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [firebaseRules, setFirebaseRules] = useState([]);
  const [firebaseCriteria, setFirebaseCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasFirebaseData, setHasFirebaseData] = useState(false);
  const [formData, setFormData] = useState({
    parentCode: "",
    code: "",
    description: "",
    point: 0,
    pointType: "fixed", // fixed, conditional, progressive
    conditions: [],
    levels: [],
  });

  // Fetch rules from Firebase on component mount
  useEffect(() => {
    fetchFirebaseRules();
    fetchFirebaseCriteria();
  }, []);

  const fetchFirebaseRules = async () => {
    try {
      setLoading(true);
      const rules = await rulesService.getRulesFromFirebase();
      setFirebaseRules(rules);
      setHasFirebaseData(rules.length > 0);
    } catch (error) {
      console.error("Error fetching Firebase rules:", error);
      setHasFirebaseData(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchFirebaseCriteria = async () => {
    try {
      setLoading(true);
      const criteria = await rulesService.getCriteriaFromFirebase();
      setFirebaseCriteria(criteria);
    } catch (error) {
      console.error("Error fetching Firebase criteria:", error);
    } finally {
      setLoading(false);
    }
  };

  // Count total rules in JSON for comparison
  const countRulesInJSON = (type) => {
    const data = rulesService.getRulesByType(type);
    let count = 0;

    Object.values(data).forEach((category) => {
      Object.values(category.criteria).forEach((criterion) => {
        if (type === "behaviors" && criterion.behaviors) {
          count += Object.keys(criterion.behaviors).length;
        } else if (type === "plus" && criterion.plus) {
          count += Object.keys(criterion.plus).length;
        } else if (type === "minus" && criterion.minus) {
          count += Object.keys(criterion.minus).length;
        }
      });
    });

    return count;
  };

  // Helper function to check if a rule already exists in Firebase
  const ruleExistsInFirebase = (ruleData, existingRules) => {
    return existingRules.some(
      (existingRule) =>
        existingRule.parentCode === ruleData.parentCode &&
        existingRule.code === ruleData.code &&
        existingRule.type === ruleData.type
    );
  };

  // Helper function to check if a rule has been modified
  const ruleHasBeenModified = (ruleData, existingRules) => {
    const existingRule = existingRules.find(
      (existingRule) =>
        existingRule.parentCode === ruleData.parentCode &&
        existingRule.code === ruleData.code &&
        existingRule.type === ruleData.type
    );

    if (!existingRule) return false;

    // So sánh các trường quan trọng
    return (
      existingRule.description !== ruleData.description ||
      existingRule.point !== ruleData.point ||
      existingRule.pointType !== ruleData.pointType ||
      JSON.stringify(existingRule.conditions) !==
        JSON.stringify(ruleData.conditions) ||
      JSON.stringify(existingRule.levels) !== JSON.stringify(ruleData.levels)
    );
  };

  // Use default scoring table - restore all rules from JSON to Firebase
  const useDefaultScoringTable = async () => {
    try {
      setLoading(true);

      // First, delete all existing rules and criteria from Firebase
      console.log("🗑️ Deleting all existing Firebase data...");

      // Delete all rules
      for (const rule of firebaseRules) {
        try {
          await rulesService.deleteRule(rule.id);
        } catch (error) {
          console.log(`Failed to delete rule ${rule.id}:`, error);
        }
      }

      // Delete all criteria
      for (const criteria of firebaseCriteria) {
        try {
          await rulesService.deleteCriteriaFromFirebase(criteria.id);
        } catch (error) {
          console.log(`Failed to delete criteria ${criteria.id}:`, error);
        }
      }

      console.log("✅ All existing Firebase data deleted");

      // Get all rules from JSON
      const behaviorsRules = rulesService.getRulesByType("behaviors");
      const plusRules = rulesService.getRulesByType("plus");
      const minusRules = rulesService.getRulesByType("minus");

      let migratedCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;

      // Migrate criteria from JSON
      const allCategories = [
        ...Object.values(behaviorsRules),
        ...Object.values(plusRules),
        ...Object.values(minusRules),
      ];
      const uniqueCriteria = new Map();

      allCategories.forEach((category) => {
        Object.values(category.criteria).forEach((criterion) => {
          if (!uniqueCriteria.has(criterion.code)) {
            uniqueCriteria.set(criterion.code, {
              code: criterion.code,
              description: criterion.description,
              point: criterion.point,
              category: category.name,
              categoryName: category.name,
            });
          }
        });
      });

      // Add all criteria to Firebase
      for (const criterion of uniqueCriteria.values()) {
        await rulesService.addCriteriaToFirebase(criterion);
        migratedCount++;
      }

      // Migrate behaviors from JSON
      for (const [categoryKey, category] of Object.entries(behaviorsRules)) {
        for (const [criterionKey, criterion] of Object.entries(
          category.criteria
        )) {
          if (criterion.behaviors) {
            for (const [behaviorKey, behavior] of Object.entries(
              criterion.behaviors
            )) {
              const ruleData = {
                parentCode: criterion.code,
                code: behavior.code,
                description: behavior.description,
                point: behavior.point,
                pointType: "fixed",
                type: "behaviors",
                conditions: behavior.conditions || [],
                levels: behavior.levels || [],
              };

              await rulesService.addRule(ruleData);
              migratedCount++;
            }
          }
        }
      }

      // Migrate plus rules from JSON
      for (const [categoryKey, category] of Object.entries(plusRules)) {
        for (const [criterionKey, criterion] of Object.entries(
          category.criteria
        )) {
          if (criterion.plus) {
            for (const [plusKey, plusItem] of Object.entries(criterion.plus)) {
              const ruleData = {
                parentCode: criterion.code,
                code: plusItem.code,
                description: plusItem.description,
                point: plusItem.point,
                pointType:
                  typeof plusItem.point === "string" ? plusItem.point : "fixed",
                conditions: plusItem.conditions || [],
                levels: plusItem.levels || [],
                type: "plus",
              };

              await rulesService.addRule(ruleData);
              migratedCount++;
            }
          }
        }
      }

      // Migrate minus rules from JSON
      for (const [categoryKey, category] of Object.entries(minusRules)) {
        for (const [criterionKey, criterion] of Object.entries(
          category.criteria
        )) {
          if (criterion.minus) {
            for (const [minusKey, minusItem] of Object.entries(
              criterion.minus
            )) {
              const ruleData = {
                parentCode: criterion.code,
                code: minusItem.code,
                description: minusItem.description,
                point: minusItem.point,
                pointType:
                  typeof minusItem.point === "string"
                    ? minusItem.point
                    : "fixed",
                conditions: minusItem.conditions || [],
                levels: minusItem.levels || [],
                type: "minus",
              };

              await rulesService.addRule(ruleData);
              migratedCount++;
            }
          }
        }
      }

      // Refetch Firebase data to update UI
      await fetchFirebaseRules();
      await fetchFirebaseCriteria();

      alert(
        `Đã khôi phục bảng thang điểm mặc định!\n` +
          `🗑️ Đã xóa tất cả dữ liệu cũ\n` +
          `✅ Đã thêm: ${migratedCount} nội quy từ JSON\n` +
          `📊 Firebase giờ đã đồng bộ với dữ liệu gốc`
      );
    } catch (error) {
      console.error("Error restoring default scoring table:", error);
      alert("Có lỗi xảy ra khi khôi phục bảng thang điểm mặc định");
    } finally {
      setLoading(false);
    }
  };

  // Get rules from Firebase only (no merging with JSON)
  const getFirebaseRules = (type) => {
    const firebaseRulesOfType = firebaseRules.filter(
      (rule) => rule.type === type
    );

    // Get ALL criteria from Firebase (including empty ones)
    const firebaseCriteriaOfType = firebaseCriteria.filter((criteria) => {
      // Map criteria to category based on code pattern
      const codeToCategory = {
        // Yêu nước
        "PC1.1": "Yêu nước",
        "PC1.2": "Yêu nước",
        "PC1.3": "Yêu nước",
        "PC1.4": "Yêu nước",
        "PC1.5": "Yêu nước",
        // Nhân ái
        "PC2.1": "Nhân ái",
        "PC2.2": "Nhân ái",
        "PC2.3": "Nhân ái",
        "PC2.4": "Nhân ái",
        "PC2.5": "Nhân ái",
        "PC2.6": "Nhân ái",
        // Chăm chỉ
        "PC3.1": "Chăm chỉ",
        "PC3.2": "Chăm chỉ",
        "PC3.3": "Chăm chỉ",
        "PC3.4": "Chăm chỉ",
        "PC3.5": "Chăm chỉ",
        // Trung thực
        "PC4.1": "Trung thực",
        "PC4.2": "Trung thực",
        "PC4.3": "Trung thực",
        // Trách nhiệm
        "PC5.1": "Trách nhiệm",
        "PC5.2": "Trách nhiệm",
        "PC5.3": "Trách nhiệm",
        "PC5.4": "Trách nhiệm",
        "PC5.5": "Trách nhiệm",
        "PC5.6": "Trách nhiệm",
        "PC5.7": "Trách nhiệm",
        "PC5.8": "Trách nhiệm",
        "PC5.9": "Trách nhiệm",
        "PC5.10": "Trách nhiệm",
      };

      const categoryName =
        codeToCategory[criteria.code] ||
        criteria.categoryName ||
        criteria.category;

      // Only include criteria that belong to the current type's category
      if (type === "behaviors") {
        return [
          "Yêu nước",
          "Nhân ái",
          "Chăm chỉ",
          "Trung thực",
          "Trách nhiệm",
        ].includes(categoryName);
      } else if (type === "plus") {
        return [
          "Yêu nước",
          "Nhân ái",
          "Chăm chỉ",
          "Trung thực",
          "Trách nhiệm",
        ].includes(categoryName);
      } else if (type === "minus") {
        return [
          "Yêu nước",
          "Nhân ái",
          "Chăm chỉ",
          "Trung thực",
          "Trách nhiệm",
        ].includes(categoryName);
      }

      return false;
    });

    // Group rules by category and criterion
    const groupedRules = {};

    firebaseCriteriaOfType.forEach((criteria) => {
      const categoryName = criteria.categoryName || criteria.category;

      if (!groupedRules[categoryName]) {
        groupedRules[categoryName] = {
          name: categoryName,
          criteria: {},
        };
      }

      if (!groupedRules[categoryName].criteria[criteria.code]) {
        groupedRules[categoryName].criteria[criteria.code] = {
          code: criteria.code,
          description: criteria.description,
          point: criteria.point,
          [type]: {}, // Initialize the type-specific items
        };
      }

      // Add rules for this criterion
      const criterionRules = firebaseRulesOfType.filter(
        (rule) => rule.parentCode === criteria.code
      );

      criterionRules.forEach((rule) => {
        groupedRules[categoryName].criteria[criteria.code][type][rule.code] = {
          code: rule.code,
          description: rule.description,
          point: rule.pointType === "fixed" ? rule.point : rule.pointType,
          pointType: rule.pointType,
          conditions: rule.conditions || [],
          levels: rule.levels || [],
          id: rule.id,
          isFirebaseRule: true,
        };
      });
    });

    // Sort categories and rules
    return sortRulesByOrder(groupedRules, type);
  };

  // Sort rules by predefined order
  const sortRulesByOrder = (groupedRules, type) => {
    // Define category order: Yêu nước, nhân ái, chăm chỉ, trung thực, trách nhiệm
    const categoryOrder = [
      "Yêu nước",
      "Nhân ái",
      "Chăm chỉ",
      "Trung thực",
      "Trách nhiệm",
    ];

    // Create sorted result
    const sortedRules = {};

    // Sort categories by predefined order
    categoryOrder.forEach((categoryName) => {
      if (groupedRules[categoryName]) {
        sortedRules[categoryName] = {
          ...groupedRules[categoryName],
          criteria: {},
        };

        // Sort criteria by code (PC1.1, PC1.2, PC2.1, etc.)
        const sortedCriteria = Object.entries(
          groupedRules[categoryName].criteria
        ).sort(([a], [b]) => {
          // Extract numbers from codes like PC1.1, PC1.2, PC2.1
          const getCodeNumbers = (code) => {
            const match = code.match(/PC(\d+)\.(\d+)/);
            if (match) {
              return [parseInt(match[1]), parseInt(match[2])];
            }
            return [0, 0];
          };

          const [aMajor, aMinor] = getCodeNumbers(a);
          const [bMajor, bMinor] = getCodeNumbers(b);

          // First sort by major number, then by minor number
          if (aMajor !== bMajor) {
            return aMajor - bMajor;
          }
          return aMinor - bMinor;
        });

        // Add sorted criteria
        sortedCriteria.forEach(([criteriaCode, criteria]) => {
          sortedRules[categoryName].criteria[criteriaCode] = {
            ...criteria,
            [type]: {},
          };

          // Sort rules within each criterion by code
          const sortedRulesInCriterion = Object.entries(
            criteria[type] || {}
          ).sort(([a], [b]) => {
            // Extract numbers from rule codes like PC1.1.A1, PC1.1.A2, etc.
            const getRuleNumbers = (code) => {
              const match = code.match(/PC(\d+)\.(\d+)\.([ABC])(\d+)/);
              if (match) {
                return [
                  parseInt(match[1]),
                  parseInt(match[2]),
                  match[3],
                  parseInt(match[4]),
                ];
              }
              return [0, 0, "A", 0];
            };

            const [aMajor, aMinor, aType, aNum] = getRuleNumbers(a);
            const [bMajor, bMinor, bType, bNum] = getRuleNumbers(b);

            // Sort by major, minor, type (A, B, C), then number
            if (aMajor !== bMajor) return aMajor - bMajor;
            if (aMinor !== bMinor) return aMinor - bMinor;
            if (aType !== bType) return aType.localeCompare(bType);
            return aNum - bNum;
          });

          // Add sorted rules
          sortedRulesInCriterion.forEach(([ruleCode, rule]) => {
            sortedRules[categoryName].criteria[criteriaCode][type][ruleCode] =
              rule;
          });
        });
      }
    });

    // Add any remaining categories that weren't in the predefined order
    Object.entries(groupedRules).forEach(([categoryName, category]) => {
      if (!categoryOrder.includes(categoryName)) {
        sortedRules[categoryName] = category;
      }
    });

    return sortedRules;
  };

  // Calculate total points for behaviors (Firebase rules only)
  const calculateTotalPoints = () => {
    const firebaseBehaviors = getFirebaseRules("behaviors");
    let total = 0;
    Object.values(firebaseBehaviors).forEach((category) => {
      Object.values(category.criteria).forEach((criterion) => {
        if (criterion.behaviors) {
          Object.values(criterion.behaviors).forEach((behavior) => {
            if (typeof behavior.point === "number") {
              total += behavior.point;
            }
          });
        }
      });
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

  const generateNextCode = (parentCode, type) => {
    return rulesService.generateNextCode(parentCode, type);
  };

  const handleAddItem = (parentCode, type) => {
    const nextCode = generateNextCode(parentCode, type);
    setFormData({
      parentCode,
      code: nextCode,
      description: "",
      point: 0,
      pointType: "fixed",
      conditions: [],
      levels: [],
    });
    setEditingItem(null);
    setShowAddForm(true);
  };

  const handleEditItem = (item, parentCode, type) => {
    setFormData({
      parentCode,
      code: item.code,
      description: item.description,
      point: typeof item.point === "number" ? item.point : 0,
      pointType: typeof item.point === "string" ? item.point : "fixed",
      conditions: item.conditions || [],
      levels: item.levels || [],
    });
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handleDeleteItem = async (item, parentCode, type) => {
    if (window.confirm(`Bạn có chắc muốn xóa nội quy "${item.code}"?`)) {
      try {
        // Delete from Firebase
        if (item.id) {
          const result = await rulesService.deleteRule(item.id);
          if (result.success) {
            alert("Xóa nội quy thành công!");
            await fetchFirebaseRules(); // Refresh Firebase rules
          } else {
            alert(result.message);
          }
        } else {
          alert("Không thể xóa nội quy này!");
        }
      } catch (error) {
        alert("Có lỗi xảy ra khi xóa nội quy");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      alert("Vui lòng nhập mô tả nội quy");
      return;
    }

    // For behaviors, check if total points would exceed 100
    if (activeTab === "behaviors" && formData.pointType === "fixed") {
      const currentTotal = calculateTotalPoints();
      const newTotal = currentTotal + formData.point;
      if (newTotal > 100) {
        alert(
          `Tổng điểm biểu hiện không được vượt quá 100. Hiện tại: ${currentTotal}, Sau khi thêm: ${newTotal}`
        );
        return;
      }
    }

    try {
      setLoading(true);

      const ruleData = {
        parentCode: formData.parentCode,
        code: formData.code,
        description: formData.description,
        point: formData.point,
        pointType: formData.pointType,
        conditions: formData.conditions,
        levels: formData.levels,
        type: activeTab,
      };

      if (editingItem && editingItem.id) {
        // Update existing Firebase rule
        const result = await rulesService.updateRule(editingItem.id, ruleData);
        if (result.success) {
          alert("Cập nhật nội quy thành công!");
        } else {
          alert(result.message);
        }
      } else {
        // Add new rule to Firebase
        const result = await rulesService.addRule(ruleData);
        if (result.success) {
          alert("Thêm nội quy thành công!");
        } else {
          alert(result.message);
        }
      }

      await fetchFirebaseRules();
      setShowAddForm(false);
      setFormData({
        parentCode: "",
        code: "",
        description: "",
        point: 0,
        pointType: "fixed",
        conditions: [],
        levels: [],
      });
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving rule:", error);
      alert("Có lỗi xảy ra khi lưu nội quy");
    } finally {
      setLoading(false);
    }
  };

  const addLevel = () => {
    setFormData((prev) => ({
      ...prev,
      levels: [...prev.levels, { level: prev.levels.length + 1, point: 0 }],
    }));
  };

  const updateLevel = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      levels: prev.levels.map((level, i) =>
        i === index ? { ...level, [field]: value } : level
      ),
    }));
  };

  const removeLevel = (index) => {
    setFormData((prev) => ({
      ...prev,
      levels: prev.levels.filter((_, i) => i !== index),
    }));
  };

  const addCondition = () => {
    setFormData((prev) => ({
      ...prev,
      conditions: [...prev.conditions, { type: "", point: 0, exceptions: [] }],
    }));
  };

  const updateCondition = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) =>
        i === index ? { ...condition, [field]: value } : condition
      ),
    }));
  };

  const removeCondition = (index) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }));
  };

  const renderBehaviorsSection = () => {
    const behaviorsData = getFirebaseRules("behaviors");
    return (
      <div className="space-y-4">
        {totalPoints !== 100 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-yellow-600" size={20} />
              <span className="text-yellow-800 font-medium">
                Cảnh báo: Tổng điểm biểu hiện hiện tại là {totalPoints}/100 điểm
              </span>
            </div>
          </div>
        )}

        {Object.entries(behaviorsData).map(([categoryKey, category]) => (
          <div key={categoryKey} className="border border-gray-200 rounded-lg">
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
                {Object.entries(category.criteria).map(
                  ([criterionKey, criterion]) => (
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
                          <button
                            onClick={() =>
                              handleAddItem(criterion.code, "behaviors")
                            }
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 whitespace-pre"
                          >
                            Thêm biểu hiện
                          </button>
                        </div>
                      </div>

                      <div className="p-4">
                        {Object.keys(criterion.behaviors || {}).length > 0 ? (
                          Object.entries(criterion.behaviors || {}).map(
                            ([behaviorKey, behavior]) => (
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
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      handleEditItem(
                                        behavior,
                                        criterion.code,
                                        "behaviors"
                                      )
                                    }
                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                  >
                                    Sửa
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteItem(
                                        behavior,
                                        criterion.code,
                                        "behaviors"
                                      )
                                    }
                                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              </div>
                            )
                          )
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <p>Chưa có biểu hiện nào</p>
                            <p className="text-sm mt-1">
                              Nhấn "Thêm biểu hiện" để thêm mới
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPlusSection = () => {
    const plusData = getFirebaseRules("plus");
    return (
      <div className="space-y-4">
        {Object.entries(plusData).map(([categoryKey, category]) => (
          <div key={categoryKey} className="border border-gray-200 rounded-lg">
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
                </div>
              </div>
            </div>

            {!collapsedSections[categoryKey] && (
              <div className="p-4 space-y-4">
                {Object.entries(category.criteria).map(
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
                          <button
                            onClick={() =>
                              handleAddItem(criterion.code, "plus")
                            }
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 whitespace-pre"
                          >
                            Thêm điểm cộng
                          </button>
                        </div>
                      </div>

                      <div className="p-4">
                        {Object.keys(criterion.plus || {}).length > 0 ? (
                          Object.entries(criterion.plus || {}).map(
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
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      handleEditItem(
                                        plusItem,
                                        criterion.code,
                                        "plus"
                                      )
                                    }
                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                  >
                                    Sửa
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteItem(
                                        plusItem,
                                        criterion.code,
                                        "plus"
                                      )
                                    }
                                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              </div>
                            )
                          )
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <p>Chưa có điểm cộng nào</p>
                            <p className="text-sm mt-1">
                              Nhấn "Thêm điểm cộng" để thêm mới
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderMinusSection = () => {
    const minusData = getFirebaseRules("minus");
    return (
      <div className="space-y-4">
        {Object.entries(minusData).map(([categoryKey, category]) => (
          <div key={categoryKey} className="border border-gray-200 rounded-lg">
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
                </div>
              </div>
            </div>

            {!collapsedSections[categoryKey] && (
              <div className="p-4 space-y-4">
                {Object.entries(category.criteria).map(
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
                          <button
                            onClick={() =>
                              handleAddItem(criterion.code, "minus")
                            }
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 whitespace-pre"
                          >
                            Thêm điểm trừ
                          </button>
                        </div>
                      </div>

                      <div className="p-4">
                        {Object.keys(criterion.minus || {}).length > 0 ? (
                          Object.entries(criterion.minus || {}).map(
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
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      handleEditItem(
                                        minusItem,
                                        criterion.code,
                                        "minus"
                                      )
                                    }
                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                  >
                                    Sửa
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteItem(
                                        minusItem,
                                        criterion.code,
                                        "minus"
                                      )
                                    }
                                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              </div>
                            )
                          )
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <p>Chưa có điểm trừ nào</p>
                            <p className="text-sm mt-1">
                              Nhấn "Thêm điểm trừ" để thêm mới
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 ">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 ">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Quản lý Nội quy Học sinh
                </h1>
                <p className="text-gray-600">
                  Quản lý biểu hiện, điểm cộng và điểm trừ theo chuẩn mực đạo
                  đức
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={useDefaultScoringTable}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Dùng bảng thang điểm rèn luyện mặc định
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          {hasFirebaseData && (
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-md">
                <button
                  onClick={() => setActiveTab("behaviors")}
                  className={`flex-1 py-2 px-4 rounded font-medium ${
                    activeTab === "behaviors"
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Eye size={16} />
                    Biểu hiện (A)
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("minus")}
                  className={`flex-1 py-2 px-4 rounded font-medium ${
                    activeTab === "minus"
                      ? "bg-red-500 text-white"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Minus size={16} />
                    Điểm trừ (B)
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("plus")}
                  className={`flex-1 py-2 px-4 rounded font-medium ${
                    activeTab === "plus"
                      ? "bg-green-500 text-white"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Award size={16} />
                    Điểm cộng (C)
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-6">
            {!hasFirebaseData ? (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-lg p-8">
                  <div className="text-gray-400 mb-4">
                    <svg
                      className="mx-auto h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có dữ liệu nội quy
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Bấm nút "Dùng bảng thang điểm rèn luyện mặc định" để bắt đầu
                    sử dụng hệ thống quản lý nội quy.
                  </p>
                  <button
                    onClick={useDefaultScoringTable}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                  >
                    Dùng bảng thang điểm rèn luyện mặc định
                  </button>
                </div>
              </div>
            ) : (
              <>
                {activeTab === "behaviors" && renderBehaviorsSection()}
                {activeTab === "plus" && renderPlusSection()}
                {activeTab === "minus" && renderMinusSection()}
              </>
            )}
          </div>

          {/* Add/Edit Form Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-800">
                    {editingItem ? "Sửa nội quy" : "Thêm nội quy mới"}
                  </h3>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Mã nội quy <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            code: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="VD: PC1.1.A1"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Loại điểm <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.pointType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pointType: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="fixed">Điểm cố định</option>
                        <option value="conditional">Điều kiện</option>
                        <option value="progressive">Tiến triển</option>
                      </select>
                    </div>
                  </div>

                  {formData.pointType === "fixed" && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Điểm <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.point}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            point: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập số điểm"
                        required
                      />
                    </div>
                  )}

                  {formData.pointType === "progressive" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">
                          Cấp độ vi phạm <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={addLevel}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Thêm cấp độ
                        </button>
                      </div>
                      {formData.levels.map((level, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Cấp độ {level.level}
                            </label>
                            <input
                              type="number"
                              value={level.point}
                              onChange={(e) =>
                                updateLevel(
                                  index,
                                  "point",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Điểm"
                              required
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLevel(index)}
                            className="px-3 py-2 text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.pointType === "conditional" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">
                          Điều kiện <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={addCondition}
                          className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                        >
                          Thêm điều kiện
                        </button>
                      </div>
                      {formData.conditions.map((condition, index) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 rounded-lg space-y-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Loại điều kiện
                              </label>
                              <input
                                type="text"
                                value={condition.type}
                                onChange={(e) =>
                                  updateCondition(index, "type", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                placeholder="VD: không phép, có phép"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Điểm
                              </label>
                              <input
                                type="number"
                                value={condition.point}
                                onChange={(e) =>
                                  updateCondition(
                                    index,
                                    "point",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                placeholder="Điểm"
                                required
                              />
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <button
                              type="button"
                              onClick={() => removeCondition(index)}
                              className="px-3 py-2 text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Mô tả <span className="text-red-500">*</span>
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
                      placeholder="Mô tả chi tiết về nội quy..."
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                    >
                      {editingItem ? "Cập nhật" : "Tạo mới"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RulesManagement;
