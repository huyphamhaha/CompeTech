import React, { useState } from "react";
import rulesService from "../services/rulesService.js";

const MigrateToFirebase = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [status, setStatus] = useState("");

  const migrateAllDataToFirebase = async () => {
    if (isMigrating) return;

    setIsMigrating(true);
    setStatus("Đang migrate dữ liệu...");

    try {
      console.log("Bắt đầu migrate dữ liệu từ JSON lên Firebase...");

      // Lấy dữ liệu từ JSON
      const behaviorsData = rulesService.getRulesByType("behaviors");
      const plusData = rulesService.getRulesByType("plus");
      const minusData = rulesService.getRulesByType("minus");

      let migratedCount = 0;

      // Migrate behaviors
      Object.values(behaviorsData).forEach((category) => {
        Object.values(category.criteria).forEach((criterion) => {
          // Thêm criterion vào Firebase
          rulesService.addCriteriaToFirebase({
            code: criterion.code,
            description: criterion.description,
            point: criterion.point,
            category: category.name,
            categoryName: category.name,
          });

          if (criterion.behaviors) {
            Object.values(criterion.behaviors).forEach((behavior) => {
              // Thêm behavior vào Firebase
              rulesService.addRuleToFirebase({
                parentCode: criterion.code,
                code: behavior.code,
                description: behavior.description,
                point: behavior.point,
                pointType: "fixed",
                type: "behaviors",
                conditions: [],
                levels: [],
              });
              migratedCount++;
            });
          }
        });
      });

      // Migrate plus rules
      Object.values(plusData).forEach((category) => {
        Object.values(category.criteria).forEach((criterion) => {
          if (criterion.plus) {
            Object.values(criterion.plus).forEach((plusItem) => {
              rulesService.addRuleToFirebase({
                parentCode: criterion.code,
                code: plusItem.code,
                description: plusItem.description,
                point: plusItem.point,
                pointType: "fixed",
                type: "plus",
                conditions: [],
                levels: [],
              });
              migratedCount++;
            });
          }
        });
      });

      // Migrate minus rules
      Object.values(minusData).forEach((category) => {
        Object.values(category.criteria).forEach((criterion) => {
          if (criterion.minus) {
            Object.values(criterion.minus).forEach((minusItem) => {
              rulesService.addRuleToFirebase({
                parentCode: criterion.code,
                code: minusItem.code,
                description: minusItem.description,
                point: minusItem.point,
                pointType: "fixed",
                type: "minus",
                conditions: [],
                levels: [],
              });
              migratedCount++;
            });
          }
        });
      });

      setStatus(
        `Hoàn thành! Đã migrate ${migratedCount} nội quy lên Firebase.`
      );
      console.log(`Hoàn thành migrate ${migratedCount} nội quy lên Firebase!`);
    } catch (error) {
      setStatus("Lỗi: " + error.message);
      console.error("Lỗi khi migrate:", error);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        textAlign: "center",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <h2>Migrate Dữ liệu từ JSON lên Firebase</h2>
      <p>
        Component này sẽ chuyển tất cả dữ liệu từ JSON files lên Firebase để đảm
        bảo tính nhất quán.
        <strong>Chỉ sử dụng khi cần thiết!</strong>
      </p>

      <div style={{ margin: "20px 0" }}>
        <button
          onClick={migrateAllDataToFirebase}
          disabled={isMigrating}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: isMigrating ? "#ccc" : "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: isMigrating ? "not-allowed" : "pointer",
          }}
        >
          {isMigrating ? "Đang migrate..." : "Migrate từ JSON lên Firebase"}
        </button>
      </div>

      <div
        style={{
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "5px",
          margin: "20px 0",
        }}
      >
        <strong>Trạng thái:</strong> {status}
      </div>

      <div
        style={{
          padding: "15px",
          backgroundColor: "#fff3cd",
          borderRadius: "5px",
          margin: "20px 0",
          textAlign: "left",
        }}
      >
        <h4>⚠️ Cảnh báo:</h4>
        <ul>
          <li>Chỉ sử dụng khi cần khôi phục dữ liệu từ JSON</li>
          <li>Dữ liệu có thể bị trùng lặp nếu đã có trong Firebase</li>
          <li>Sau khi migrate, xóa component này khỏi App.jsx</li>
        </ul>
      </div>
    </div>
  );
};

export default MigrateToFirebase;
