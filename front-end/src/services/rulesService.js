import { db } from "../components/firebase.js";
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
import behaviorsData from "../components/rules/bieuhien.json";
import plusData from "../components/rules/diemcong.json";
import minusData from "../components/rules/diemtru.json";

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

  // Add a new rule to Firebase
  async addRuleToFirebase(ruleData) {
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

  // Update a rule in Firebase
  async updateRuleInFirebase(ruleId, ruleData) {
    try {
      const ruleRef = doc(db, "rules_items", ruleId);
      await updateDoc(ruleRef, {
        ...ruleData,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating rule in Firebase:", error);
      throw error;
    }
  }

  // Delete a rule from Firebase
  async deleteRuleFromFirebase(ruleId) {
    try {
      const ruleRef = doc(db, "rules_items", ruleId);
      await deleteDoc(ruleRef);
    } catch (error) {
      console.error("Error deleting rule from Firebase:", error);
      throw error;
    }
  }

  // Get a specific rule from Firebase
  async getRuleFromFirebase(ruleId) {
    try {
      const ruleRef = doc(db, "rules_items", ruleId);
      const ruleDoc = await getDoc(ruleRef);

      if (ruleDoc.exists()) {
        return {
          id: ruleDoc.id,
          ...ruleDoc.data(),
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching rule from Firebase:", error);
      return null;
    }
  }

  // Calculate progressive points
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

    const level = Math.min(violationCount, rule.levels.length);
    return rule.levels[level - 1]?.point || 0;
  }

  // Calculate conditional points
  calculateConditionalPoints(ruleCode, condition) {
    const conditionalRules = {
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
      "PC4.2.C1": {
        // Tham gia hoặc tổ chức, viết bài về gương người tốt
        conditions: [
          { type: "tham_gia", point: 2 },
          { type: "to_chuc", point: 4 },
          { type: "viet_bai", point: 3 },
        ],
      },
      "PC5.2.C1": {
        // Tham gia hoặc tổ chức sự kiện về tiết kiệm
        conditions: [
          { type: "tham_gia", point: 2 },
          { type: "to_chuc", point: 4 },
        ],
      },
      "PC5.4.C1": {
        // Tham gia hoặc tổ chức hoạt động về bổn phận
        conditions: [
          { type: "tham_gia", point: 2 },
          { type: "to_chuc", point: 4 },
        ],
      },
      "PC5.6.B1": {
        // Vắng các buổi lễ
        conditions: [
          { type: "co_ly_do", point: -1 },
          { type: "khong_ly_do", point: -2 },
        ],
      },
    };

    const rule = conditionalRules[ruleCode];
    if (!rule) return 0;

    const matchedCondition = rule.conditions.find((c) => c.type === condition);
    return matchedCondition?.point || 0;
  }

  // Get student behavior violations
  async getStudentViolations(studentId) {
    try {
      const violationsRef = collection(db, "studentViolations");
      const q = query(
        violationsRef,
        where("studentId", "==", studentId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));
    } catch (error) {
      console.error("Error fetching student violations:", error);
      return [];
    }
  }

  // Add student violation
  async addStudentViolation(violationData) {
    try {
      const violationsRef = collection(db, "studentViolations");
      const docRef = await addDoc(violationsRef, {
        ...violationData,
        createdAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding student violation:", error);
      throw error;
    }
  }

  // Get violation count for a specific rule
  async getViolationCount(studentId, ruleCode) {
    try {
      const violationsRef = collection(db, "studentViolations");
      const q = query(
        violationsRef,
        where("studentId", "==", studentId),
        where("ruleCode", "==", ruleCode)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error("Error getting violation count:", error);
      return 0;
    }
  }
}

// Create and export a singleton instance
const rulesService = new RulesService();
export default rulesService;
