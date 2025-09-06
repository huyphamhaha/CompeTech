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

class CriteriaService {
  // Lấy thông tin criteria từ Firebase
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

  // Thêm thông tin criteria mới vào Firebase
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

  // Cập nhật thông tin criteria trong Firebase
  async updateCriteriaInFirebase(criteriaId, criteriaData) {
    try {
      const criteriaRef = doc(db, "criteria_info", criteriaId);
      await updateDoc(criteriaRef, {
        ...criteriaData,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating criteria in Firebase:", error);
      throw error;
    }
  }

  // Xóa thông tin criteria khỏi Firebase
  async deleteCriteriaFromFirebase(criteriaId) {
    try {
      const criteriaRef = doc(db, "criteria_info", criteriaId);
      await deleteDoc(criteriaRef);
    } catch (error) {
      console.error("Error deleting criteria from Firebase:", error);
      throw error;
    }
  }

  // Lấy thông tin criteria cụ thể từ Firebase
  async getCriteriaFromFirebase(criteriaId) {
    try {
      const criteriaRef = doc(db, "criteria_info", criteriaId);
      const criteriaDoc = await getDoc(criteriaRef);

      if (criteriaDoc.exists()) {
        return {
          id: criteriaDoc.id,
          ...criteriaDoc.data(),
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching criteria from Firebase:", error);
      return null;
    }
  }

  // Tạo dữ liệu criteria mặc định từ JSON
  getDefaultCriteriaData() {
    return {
      // Yêu nước
      "PC1.1": {
        code: "PC1.1",
        description:
          "Tích cực, chủ động vận động người khác tham gia các hoạt động bảo vệ thiên nhiên.",
        point: 4,
        category: "yeu_nuoc",
        categoryName: "Yêu nước",
      },
      "PC1.2": {
        code: "PC1.2",
        description:
          "Tự giác thực hiện và vận động người khác thực hiện các quy định của pháp luật, góp phần bảo vệ và xây dựng Nhà nước xã hội chủ nghĩa Việt Nam.",
        point: 4,
        category: "yeu_nuoc",
        categoryName: "Yêu nước",
      },
      "PC1.3": {
        code: "PC1.3",
        description:
          "Chủ động, tích cực tham gia và vận động người khác tham gia các hoạt động bảo vệ, phát huy giá trị các di sản văn hoá.",
        point: 4,
        category: "yeu_nuoc",
        categoryName: "Yêu nước",
      },
      "PC1.4": {
        code: "PC1.4",
        description:
          "Đấu tranh với các âm mưu, hành động xâm phạm lãnh thổ, biên giới quốc gia, các vùng biển thuộc chủ quyền và quyền chủ quyền của quốc gia bằng thái độ và việc làm phù hợp với lứa tuổi, với quy định của pháp luật.",
        point: 4,
        category: "yeu_nuoc",
        categoryName: "Yêu nước",
      },
      "PC1.5": {
        code: "PC1.5",
        description: "Sẵn sàng thực hiện nghĩa vụ bảo vệ Tổ quốc.",
        point: 4,
        category: "yeu_nuoc",
        categoryName: "Yêu nước",
      },
      // Nhân ái
      "PC2.1": {
        code: "PC2.1",
        description: "Tôn trọng và quan tâm đến mọi người.",
        point: 4,
        category: "nhan_ai",
        categoryName: "Nhân ái",
      },
      "PC2.2": {
        code: "PC2.2",
        description: "Thể hiện lòng nhân ái với người khác.",
        point: 4,
        category: "nhan_ai",
        categoryName: "Nhân ái",
      },
      "PC2.3": {
        code: "PC2.3",
        description: "Tham gia các hoạt động từ thiện, nhân đạo.",
        point: 4,
        category: "nhan_ai",
        categoryName: "Nhân ái",
      },
      "PC2.4": {
        code: "PC2.4",
        description: "Giúp đỡ người khác khi gặp khó khăn.",
        point: 4,
        category: "nhan_ai",
        categoryName: "Nhân ái",
      },
      "PC2.5": {
        code: "PC2.5",
        description: "Thể hiện sự quan tâm đến cộng đồng.",
        point: 4,
        category: "nhan_ai",
        categoryName: "Nhân ái",
      },
      // Chăm chỉ
      "PC3.1": {
        code: "PC3.1",
        description: "Tự giác học tập, rèn luyện.",
        point: 4,
        category: "cham_chi",
        categoryName: "Chăm chỉ",
      },
      "PC3.2": {
        code: "PC3.2",
        description: "Tham gia tích cực các hoạt động học tập.",
        point: 4,
        category: "cham_chi",
        categoryName: "Chăm chỉ",
      },
      "PC3.3": {
        code: "PC3.3",
        description: "Hoàn thành tốt nhiệm vụ được giao.",
        point: 4,
        category: "cham_chi",
        categoryName: "Chăm chỉ",
      },
      "PC3.4": {
        code: "PC3.4",
        description: "Thể hiện tinh thần cần cù, siêng năng.",
        point: 4,
        category: "cham_chi",
        categoryName: "Chăm chỉ",
      },
      "PC3.5": {
        code: "PC3.5",
        description: "Duy trì thói quen học tập tốt.",
        point: 4,
        category: "cham_chi",
        categoryName: "Chăm chỉ",
      },
      // Trung thực
      "PC4.1": {
        code: "PC4.1",
        description: "Thể hiện sự trung thực trong học tập.",
        point: 4,
        category: "trung_thuc",
        categoryName: "Trung thực",
      },
      "PC4.2": {
        code: "PC4.2",
        description: "Thể hiện sự trung thực trong cuộc sống.",
        point: 4,
        category: "trung_thuc",
        categoryName: "Trung thực",
      },
      "PC4.3": {
        code: "PC4.3",
        description: "Thể hiện sự trung thực trong quan hệ với người khác.",
        point: 4,
        category: "trung_thuc",
        categoryName: "Trung thực",
      },
      "PC4.4": {
        code: "PC4.4",
        description: "Thể hiện sự trung thực trong công việc.",
        point: 4,
        category: "trung_thuc",
        categoryName: "Trung thực",
      },
      "PC4.5": {
        code: "PC4.5",
        description: "Thể hiện sự trung thực trong mọi tình huống.",
        point: 4,
        category: "trung_thuc",
        categoryName: "Trung thực",
      },
      // Trách nhiệm
      "PC5.1": {
        code: "PC5.1",
        description: "Thể hiện trách nhiệm với bản thân.",
        point: 4,
        category: "trach_nhiem",
        categoryName: "Trách nhiệm",
      },
      "PC5.2": {
        code: "PC5.2",
        description: "Thể hiện trách nhiệm với gia đình.",
        point: 4,
        category: "trach_nhiem",
        categoryName: "Trách nhiệm",
      },
      "PC5.3": {
        code: "PC5.3",
        description: "Thể hiện trách nhiệm với nhà trường.",
        point: 4,
        category: "trach_nhiem",
        categoryName: "Trách nhiệm",
      },
      "PC5.4": {
        code: "PC5.4",
        description: "Thể hiện trách nhiệm với cộng đồng.",
        point: 4,
        category: "trach_nhiem",
        categoryName: "Trách nhiệm",
      },
      "PC5.5": {
        code: "PC5.5",
        description: "Thể hiện trách nhiệm với xã hội.",
        point: 4,
        category: "trach_nhiem",
        categoryName: "Trách nhiệm",
      },
    };
  }
}

export default new CriteriaService();
