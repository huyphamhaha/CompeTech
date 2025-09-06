import { db } from "../firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDoc,
} from "firebase/firestore";

// Import JSON data
import behaviorsData from "../components/bieuhien.json";
import plusData from "../components/diemcong.json";
import minusData from "../components/diemtru.json";

class RulesService {
  constructor() {
    this.behaviorsData = behaviorsData;
    this.plusData = plusData;
    this.minusData = minusData;
  }

  // Calculate total behavior points
  calculateTotalBehaviorPoints() {
    let total = 0;
    Object.values(this.behaviorsData).forEach((category) => {
      Object.values(category.criteria).forEach((criterion) => {
        total += criterion.point;
      });
    });
    return total;
  }

  // Get all rules data
  getAllRulesData() {
    return {
      behaviors: this.behaviorsData,
      plus: this.plusData,
      minus: this.minusData,
    };
  }

  // Get rules by type
  getRulesByType(type) {
    switch (type) {
      case "behaviors":
        return this.behaviorsData;
      case "plus":
        return this.plusData;
      case "minus":
        return this.minusData;
      default:
        return {};
    }
  }

  // Generate next code for a rule
  generateNextCode(parentCode, type) {
    const data = this.getRulesByType(type);
    const category = Object.values(data).find((cat) =>
      Object.values(cat.criteria).some((crit) => crit.code === parentCode)
    );

    if (!category) return `${parentCode}.A1`;

    const criterion = Object.values(category.criteria).find(
      (crit) => crit.code === parentCode
    );
    if (!criterion) return `${parentCode}.A1`;

    const items =
      criterion.behaviors || criterion.plus || criterion.minus || {};
    const existingCodes = Object.keys(items);

    if (existingCodes.length === 0) {
      const suffix = type === "behaviors" ? "A" : type === "plus" ? "C" : "B";
      return `${parentCode}.${suffix}1`;
    }

    // Find the highest number
    const numbers = existingCodes.map((code) => {
      const match = code.match(new RegExp(`${parentCode}\\.([ABC])(\\d+)`));
      return match ? parseInt(match[2]) : 0;
    });

    const maxNumber = Math.max(...numbers);
    const suffix = type === "behaviors" ? "A" : type === "plus" ? "C" : "B";
    return `${parentCode}.${suffix}${maxNumber + 1}`;
  }

  // Find rule by code from all rule types
  findRuleByCode(ruleCode) {
    const behaviorsData = this.getRulesByType("behaviors");
    const plusData = this.getRulesByType("plus");
    const minusData = this.getRulesByType("minus");

    // Search in behaviors
    for (const category of Object.values(behaviorsData)) {
      for (const criterion of Object.values(category.criteria)) {
        if (criterion.behaviors) {
          for (const behavior of Object.values(criterion.behaviors)) {
            if (behavior.code === ruleCode) {
              return behavior;
            }
          }
        }
      }
    }

    // Search in plus rules
    for (const category of Object.values(plusData)) {
      for (const criterion of Object.values(category.criteria)) {
        if (criterion.plus) {
          for (const plusItem of Object.values(criterion.plus)) {
            if (plusItem.code === ruleCode) {
              return plusItem;
            }
          }
        }
      }
    }

    // Search in minus rules
    for (const category of Object.values(minusData)) {
      for (const criterion of Object.values(category.criteria)) {
        if (criterion.minus) {
          for (const minusItem of Object.values(criterion.minus)) {
            if (minusItem.code === ruleCode) {
              return minusItem;
            }
          }
        }
      }
    }

    return null;
  }

  // Calculate progressive points with improved logic
  calculateProgressivePoints(ruleCode, violationCount) {
    const progressiveRules = {
      "PC3.5.B2": {
        // Ngủ trong giờ học
        levels: [
          { level: 1, point: -2 },
          { level: 2, point: -4 },
          { level: 3, point: -6 },
        ],
      },
      "PC5.1.B6": {
        // Đi học trễ
        levels: [
          { level: 1, point: -2 },
          { level: 2, point: -4 },
          { level: 3, point: -6 },
        ],
      },
    };

    const rule = progressiveRules[ruleCode];
    if (!rule) return 0;

    // Ensure violationCount is within bounds
    const maxLevel = rule.levels.length;
    const actualLevel = Math.min(violationCount, maxLevel);

    const level = rule.levels.find((l) => l.level === actualLevel);
    if (level) return level.point;

    // If violation count exceeds max level, use the highest penalty
    return rule.levels[rule.levels.length - 1].point;
  }

  // Calculate conditional points with improved logic
  calculateConditionalPoints(ruleCode, conditionType, context = {}) {
    const conditionalRules = {
      "PC3.5.B5": {
        // Nghỉ học
        conditions: [
          { type: "không phép", point: -6 },
          {
            type: "có phép",
            point: -1,
            exceptions: [
              "Gia đình có tang",
              "HS bệnh có giấy bệnh viện",
              "tham gia cuộc thi của trường và cấp ngành, Thành phố tổ chức",
            ],
          },
        ],
      },
      "PC5.6.B1": {
        // Vắng các buổi lễ
        conditions: [
          { type: "khong_phep", point: -2 },
          { type: "co_phep", point: -1 },
          { type: "khong_tru_diem", point: 0 },
        ],
      },
      "PC1.2.C1": {
        // Tham gia hoặc tổ chức cuộc thi tìm hiểu pháp luật
        conditions: [
          { type: "tham_gia", point: 2 },
          { type: "to_chuc", point: 4 },
        ],
      },
      "PC3.5.C1": {
        // Tham gia hoặc tổ chức hội thảo, ngày hội nghề nghiệp
        conditions: [
          { type: "tham_gia", point: 2 },
          { type: "to_chuc", point: 4 },
        ],
      },
      "PC3.5.C2": {
        // Đạt giải trong các kỳ thi
        conditions: [
          { type: "quan", point: 2 },
          { type: "thanh_pho", point: 4 },
          { type: "quoc_gia", point: 6 },
        ],
      },
    };

    const rule = conditionalRules[ruleCode];
    if (!rule) return 0;

    const condition = rule.conditions.find((c) => c.type === conditionType);
    if (!condition) return 0;

    // Check for exceptions
    if (condition.exceptions && context.reason) {
      const hasException = condition.exceptions.some((exception) =>
        context.reason.toLowerCase().includes(exception.toLowerCase())
      );
      if (hasException) {
        return 0; // No penalty for exceptions
      }
    }

    return condition.point;
  }

  // Get violation history for a student and rule
  async getViolationHistory(studentId, ruleCode) {
    try {
      const violationsRef = collection(db, "progressive_violations");
      const q = query(
        violationsRef,
        where("studentId", "==", studentId),
        where("ruleCode", "==", ruleCode)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error("Error getting violation history:", error);
      return 0;
    }
  }

  // Apply rule with proper logic for progressive and conditional points
  async applyRule(studentId, ruleCode, ruleType, options = {}) {
    try {
      let points = 0;
      let level = 1;

      if (ruleType === "progressive") {
        const violationCount = await this.getViolationHistory(
          studentId,
          ruleCode
        );
        points = this.calculateProgressivePoints(ruleCode, violationCount + 1);
        level = Math.min(violationCount + 1, 3); // Max level is 3
      } else if (ruleType === "conditional") {
        const { conditionType } = options;
        points = this.calculateConditionalPoints(
          ruleCode,
          conditionType,
          options
        );
      } else {
        // For fixed points, get from rule data
        const rule = this.findRuleByCode(ruleCode);
        if (rule) {
          points = rule.point;
        }
      }

      return {
        success: true,
        points: points,
        level: level,
        ruleCode: ruleCode,
        ruleType: ruleType,
      };
    } catch (error) {
      console.error("Error applying rule:", error);
      return {
        success: false,
        points: 0,
        error: error.message,
      };
    }
  }

  // Add a new rule to Firebase
  async addRule(ruleData) {
    try {
      const ruleDoc = {
        ...ruleData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, "rules_items"), ruleDoc);
      return {
        success: true,
        message: "Thêm nội quy thành công",
        ruleId: docRef.id,
      };
    } catch (error) {
      console.error("Error adding rule:", error);
      return {
        success: false,
        message: "Lỗi khi thêm nội quy",
        error: error.message,
      };
    }
  }

  // Update a rule in Firebase
  async updateRule(ruleId, ruleData) {
    try {
      const ruleRef = doc(db, "rules_items", ruleId);
      await updateDoc(ruleRef, {
        ...ruleData,
        updatedAt: new Date(),
      });

      return {
        success: true,
        message: "Cập nhật nội quy thành công",
      };
    } catch (error) {
      console.error("Error updating rule:", error);
      return {
        success: false,
        message: "Lỗi khi cập nhật nội quy",
        error: error.message,
      };
    }
  }

  // Delete a rule from Firebase
  async deleteRule(ruleId) {
    try {
      await deleteDoc(doc(db, "rules_items", ruleId));
      return {
        success: true,
        message: "Xóa nội quy thành công",
      };
    } catch (error) {
      console.error("Error deleting rule:", error);
      return {
        success: false,
        message: "Lỗi khi xóa nội quy",
        error: error.message,
      };
    }
  }

  // Get all rules from Firebase
  async getRulesFromFirebase() {
    try {
      const rulesRef = collection(db, "rules_items");
      const q = query(rulesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      }));
    } catch (error) {
      console.error("Error fetching rules from Firebase:", error);
      return [];
    }
  }

  // Add progressive violation
  async addProgressiveViolation(studentId, ruleCode, description = "") {
    try {
      const violationCount = await this.getViolationHistory(
        studentId,
        ruleCode
      );
      const level = violationCount + 1;
      const points = this.calculateProgressivePoints(ruleCode, level);

      const violationDoc = {
        studentId,
        ruleCode,
        level,
        points,
        description,
        createdAt: new Date(),
      };

      const docRef = await addDoc(
        collection(db, "progressive_violations"),
        violationDoc
      );
      return {
        success: true,
        message: "Thêm vi phạm tiến triển thành công",
        violationId: docRef.id,
        level,
        points,
      };
    } catch (error) {
      console.error("Error adding progressive violation:", error);
      return {
        success: false,
        message: "Lỗi khi thêm vi phạm tiến triển",
        error: error.message,
      };
    }
  }

  // Get rules from Firebase
  async getRulesFromFirebase() {
    try {
      const rulesRef = collection(db, "rules_items");
      const q = query(rulesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));
    } catch (error) {
      console.error("Error fetching rules from Firebase:", error);
      return [];
    }
  }

  // Add a new rule to Firebase
  async addRule(ruleData) {
    try {
      const rulesRef = collection(db, "rules_items");
      const docRef = await addDoc(rulesRef, {
        ...ruleData,
        createdAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding rule to Firebase:", error);
      throw error;
    }
  }

  // Get criteria from Firebase
  async getCriteriaFromFirebase() {
    try {
      const criteriaRef = collection(db, "criteria_info");
      const q = query(criteriaRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));
    } catch (error) {
      console.error("Error fetching criteria from Firebase:", error);
      return [];
    }
  }

  // Add criteria to Firebase
  async addCriteriaToFirebase(criteriaData) {
    try {
      const criteriaRef = collection(db, "criteria_info");
      const docRef = await addDoc(criteriaRef, {
        ...criteriaData,
        createdAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding criteria to Firebase:", error);
      throw error;
    }
  }

  // Delete criteria from Firebase
  async deleteCriteriaFromFirebase(criteriaId) {
    try {
      await deleteDoc(doc(db, "criteria_info", criteriaId));
      return {
        success: true,
        message: "Xóa criteria thành công",
      };
    } catch (error) {
      console.error("Error deleting criteria:", error);
      return {
        success: false,
        message: "Lỗi khi xóa criteria",
        error: error.message,
      };
    }
  }

  // Search rules by text
  searchRules(searchTerm, type = "all") {
    const results = [];
    const searchLower = searchTerm.toLowerCase();

    const searchInData = (data, categoryName) => {
      Object.entries(data).forEach(([categoryKey, category]) => {
        Object.entries(category.criteria).forEach(
          ([criterionKey, criterion]) => {
            // Search in criterion description
            if (criterion.description.toLowerCase().includes(searchLower)) {
              results.push({
                code: criterion.code,
                description: criterion.description,
                point: criterion.point,
                type: "criterion",
                category: categoryName,
                categoryKey,
                criterionKey,
              });
            }

            // Search in items (behaviors, plus, minus)
            const items =
              criterion.behaviors || criterion.plus || criterion.minus || {};
            Object.entries(items).forEach(([itemKey, item]) => {
              if (
                item.code.toLowerCase().includes(searchLower) ||
                item.description.toLowerCase().includes(searchLower)
              ) {
                results.push({
                  code: item.code,
                  description: item.description,
                  point: item.point,
                  pointType:
                    typeof item.point === "string" ? item.point : "fixed",
                  levels: item.levels,
                  conditions: item.conditions,
                  type: "item",
                  category: categoryName,
                  categoryKey,
                  criterionKey,
                  itemKey,
                  parentCode: criterion.code,
                });
              }
            });
          }
        );
      });
    };

    if (type === "all" || type === "behaviors") {
      searchInData(this.behaviorsData, "behaviors");
    }
    if (type === "all" || type === "plus") {
      searchInData(this.plusData, "plus");
    }
    if (type === "all" || type === "minus") {
      searchInData(this.minusData, "minus");
    }

    return results;
  }
}

export default new RulesService();
