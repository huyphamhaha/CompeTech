// Script để khởi tạo dữ liệu criteria vào Firebase
import { db } from "../components/firebase.js";
import { collection, addDoc } from "firebase/firestore";
import criteriaService from "../services/criteriaService.js";

const initializeCriteriaData = async () => {
  try {
    console.log("Bắt đầu khởi tạo dữ liệu criteria...");

    const defaultCriteria = criteriaService.getDefaultCriteriaData();
    const criteriaRef = collection(db, "criteria_info");

    for (const [code, criteria] of Object.entries(defaultCriteria)) {
      try {
        await addDoc(criteriaRef, {
          ...criteria,
          createdAt: new Date(),
        });
        console.log(`Đã thêm criteria: ${code}`);
      } catch (error) {
        console.error(`Lỗi khi thêm criteria ${code}:`, error);
      }
    }

    console.log("Hoàn thành khởi tạo dữ liệu criteria!");
  } catch (error) {
    console.error("Lỗi khi khởi tạo dữ liệu criteria:", error);
  }
};

// Chạy script này một lần để khởi tạo dữ liệu
// initializeCriteriaData();

export default initializeCriteriaData;
