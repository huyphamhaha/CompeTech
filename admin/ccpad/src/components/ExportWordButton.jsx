import React from "react";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import { Download, FileText } from "lucide-react";

const ExportWordButton = ({ student, points, evidence, behaviors }) => {
  // Hàm tính điểm tổng và xếp loại hạnh kiểm
  const calculatePointsAndGrade = () => {
    let totalReward = 0;
    let totalPenalty = 0;
    let totalBehavior = 0;

    // Tính điểm từ studentPoints
    points.forEach((point) => {
      if (point.status === "approved") {
        if (point.type === "reward") {
          totalReward += point.points || 0;
        } else if (point.type === "penalty") {
          totalPenalty += Math.abs(point.points) || 0;
        } else if (point.type === "behavior") {
          totalBehavior += point.points || 0;
        }
      }
    });

    // Tính điểm từ evidence đã được duyệt
    evidence.forEach((item) => {
      if (item.status === "approved" && item.approvedPoints) {
        totalReward += item.approvedPoints;
      }
    });

    const netPoints = totalReward + totalBehavior - totalPenalty;

    // Xếp loại hạnh kiểm
    let grade = "";
    let gradeColor = "";
    if (netPoints >= 85) {
      grade = "TỐT";
      gradeColor = "green";
    } else if (netPoints >= 70) {
      grade = "KHÁ";
      gradeColor = "blue";
    } else if (netPoints >= 50) {
      grade = "ĐẠT";
      gradeColor = "orange";
    } else {
      grade = "CHƯA ĐẠT";
      gradeColor = "red";
    }

    return {
      totalReward,
      totalPenalty,
      totalBehavior,
      netPoints,
      grade,
      gradeColor,
    };
  };

  // Hàm tạo bảng điểm biểu hiện
  const createBehaviorPointsTable = () => {
    const behaviorPoints = points.filter(
      (point) =>
        point.studentId === student.id &&
        point.type === "behavior" &&
        point.status === "approved"
    );

    if (behaviorPoints.length === 0) {
      return new Paragraph({
        children: [
          new TextRun({
            text: "Chưa có điểm biểu hiện nào",
            italics: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
      });
    }

    const headerRow = new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: "STT", bold: true })],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 10, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Mã biểu hiện", bold: true })],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Mô tả", bold: true })],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 50, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Điểm", bold: true })],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
      ],
    });

    const dataRows = behaviorPoints.map((point, index) => {
      return new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: (index + 1).toString() })],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: point.ruleCode || "N/A" })],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: point.description || "Không có mô tả",
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `+${point.points}`,
                    bold: true,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        ],
      });
    });

    return new Table({
      rows: [headerRow, ...dataRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
    });
  };

  // Hàm tạo bảng điểm cộng
  const createRewardPointsTable = () => {
    const rewardPoints = points
      .filter(
        (point) =>
          point.studentId === student.id &&
          point.type === "reward" &&
          point.status === "approved"
      )
      .map((point) => ({
        ...point,
        date: point.awardedAt || point.createdAt || new Date(),
      }));

    // Thêm điểm từ evidence đã được duyệt
    const evidenceRewards = evidence
      .filter((item) => item.status === "approved" && item.approvedPoints)
      .map((item) => ({
        id: item.id,
        studentId: item.studentId,
        ruleId: item.ruleId,
        ruleCode: item.ruleCode,
        type: "reward",
        points: item.approvedPoints,
        description: item.ruleDescription,
        status: item.status,
        createdAt: item.submittedAt,
        awardedAt: item.reviewedAt,
        createdBy: "evidence",
        source: "evidence",
        title: item.title,
        date: item.reviewedAt || item.submittedAt || new Date(),
      }));

    const allRewardPoints = [...rewardPoints, ...evidenceRewards];
    allRewardPoints.sort((a, b) => b.date - a.date);

    if (allRewardPoints.length === 0) {
      return new Paragraph({
        children: [
          new TextRun({
            text: "Chưa có điểm cộng nào",
            italics: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
      });
    }

    const headerRow = new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: "STT", bold: true })],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 10, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Mã quy tắc", bold: true })],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Mô tả", bold: true })],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 40, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Điểm", bold: true })],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 15, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Thời gian", bold: true })],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 15, type: WidthType.PERCENTAGE },
        }),
      ],
    });

    const dataRows = allRewardPoints.map((point, index) => {
      return new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: (index + 1).toString() })],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: point.ruleCode || "N/A" })],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: point.title || point.description || "Không có mô tả",
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `+${point.points}`,
                    bold: true,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: point.date
                      ? point.date.toLocaleDateString("vi-VN")
                      : "N/A",
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        ],
      });
    });

    return new Table({
      rows: [headerRow, ...dataRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
    });
  };

  // Hàm tạo bảng điểm trừ
  const createPenaltyPointsTable = () => {
    const penaltyPoints = points
      .filter(
        (point) =>
          point.studentId === student.id &&
          point.type === "penalty" &&
          point.status === "approved"
      )
      .map((point) => ({
        ...point,
        date: point.awardedAt || point.createdAt || new Date(),
      }));

    if (penaltyPoints.length === 0) {
      return new Paragraph({
        children: [
          new TextRun({
            text: "Chưa có điểm trừ nào",
            italics: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
      });
    }

    const headerRow = new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: "STT", bold: true })],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 10, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Mã quy tắc", bold: true })],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Mô tả", bold: true })],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 40, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Điểm", bold: true })],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 15, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Thời gian", bold: true })],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 15, type: WidthType.PERCENTAGE },
        }),
      ],
    });

    const dataRows = penaltyPoints.map((point, index) => {
      return new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: (index + 1).toString() })],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: point.ruleCode || "N/A" })],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: point.description || "Không có mô tả",
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: point.points.toString(),
                    bold: true,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: point.date
                      ? point.date.toLocaleDateString("vi-VN")
                      : "N/A",
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        ],
      });
    });

    return new Table({
      rows: [headerRow, ...dataRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
    });
  };

  const handleExportWord = async () => {
    try {
      const pointsData = calculatePointsAndGrade();
      const currentDate = new Date().toLocaleDateString("vi-VN");

      // Tạo document Word
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              // Tiêu đề chính
              new Paragraph({
                children: [
                  new TextRun({
                    text: "BÁO CÁO ĐIỂM THI ĐUA HỌC SINH",
                    bold: true,
                    size: 32,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
              }),

              // Thông tin học sinh
              new Paragraph({
                children: [
                  new TextRun({
                    text: "THÔNG TIN HỌC SINH",
                    bold: true,
                    size: 24,
                  }),
                ],
                spacing: { before: 200, after: 200 },
              }),

              // Bảng thông tin học sinh
              new Table({
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: "Họ và tên:", bold: true }),
                            ],
                          }),
                        ],
                        width: { size: 30, type: WidthType.PERCENTAGE },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: `${student.firstName} `,
                              }),
                            ],
                          }),
                        ],
                        width: { size: 70, type: WidthType.PERCENTAGE },
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: "Mã học sinh:", bold: true }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: student.studentId }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: "Lớp:", bold: true }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: student.className }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: "Email:", bold: true }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: student.email })],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1 },
                  bottom: { style: BorderStyle.SINGLE, size: 1 },
                  left: { style: BorderStyle.SINGLE, size: 1 },
                  right: { style: BorderStyle.SINGLE, size: 1 },
                  insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                  insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                },
              }),

              // Tổng kết điểm
              new Paragraph({
                children: [
                  new TextRun({
                    text: "TỔNG KẾT ĐIỂM THI ĐUA",
                    bold: true,
                    size: 24,
                  }),
                ],
                spacing: { before: 400, after: 200 },
              }),

              // Bảng tổng kết điểm
              new Table({
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: "Loại điểm", bold: true }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        width: { size: 40, type: WidthType.PERCENTAGE },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: "Số điểm", bold: true }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        width: { size: 30, type: WidthType.PERCENTAGE },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: "Ghi chú", bold: true }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        width: { size: 30, type: WidthType.PERCENTAGE },
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: "Điểm cộng" })],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: `+${pointsData.totalReward}`,
                                bold: true,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "Từ các hoạt động tích cực",
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: "Điểm biểu hiện" })],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: `+${pointsData.totalBehavior}`,
                                bold: true,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: "Từ các biểu hiện đã chọn" }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: "Điểm trừ" })],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: `-${pointsData.totalPenalty}`,
                                bold: true,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: "Từ các vi phạm" })],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: "TỔNG ĐIỂM", bold: true }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text:
                                  pointsData.netPoints >= 0
                                    ? `+${pointsData.netPoints}`
                                    : pointsData.netPoints.toString(),
                                bold: true,
                                size: 28,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: `Xếp loại: ${pointsData.grade}`,
                                bold: true,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1 },
                  bottom: { style: BorderStyle.SINGLE, size: 1 },
                  left: { style: BorderStyle.SINGLE, size: 1 },
                  right: { style: BorderStyle.SINGLE, size: 1 },
                  insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                  insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                },
              }),

              // Thang điểm xếp loại
              new Paragraph({
                children: [
                  new TextRun({
                    text: "THANG ĐIỂM XẾP LOẠI HẠNH KIỂM",
                    bold: true,
                    size: 24,
                  }),
                ],
                spacing: { before: 400, after: 200 },
              }),

              new Table({
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: "Xếp loại", bold: true }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        width: { size: 25, type: WidthType.PERCENTAGE },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: "Thang điểm", bold: true }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        width: { size: 50, type: WidthType.PERCENTAGE },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: "Ghi chú", bold: true }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        width: { size: 25, type: WidthType.PERCENTAGE },
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "TỐT",
                                bold: true,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: "Từ 85 điểm trở lên" }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: "Xuất sắc" })],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "KHÁ",
                                bold: true,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: "Từ 70 – 84 điểm" }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: "Tốt" })],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "ĐẠT",
                                bold: true,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: "Từ 50 – 69 điểm" }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: "Trung bình" })],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "CHƯA ĐẠT",
                                bold: true,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: "0 – 49 điểm" })],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: "Cần cải thiện" })],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1 },
                  bottom: { style: BorderStyle.SINGLE, size: 1 },
                  left: { style: BorderStyle.SINGLE, size: 1 },
                  right: { style: BorderStyle.SINGLE, size: 1 },
                  insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                  insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                },
              }),

              // Điểm biểu hiện
              new Paragraph({
                children: [
                  new TextRun({
                    text: "ĐIỂM BIỂU HIỆN",
                    bold: true,
                    size: 24,
                  }),
                ],
                spacing: { before: 400, after: 200 },
              }),

              createBehaviorPointsTable(),

              // Điểm cộng
              new Paragraph({
                children: [
                  new TextRun({
                    text: "ĐIỂM CỘNG",
                    bold: true,
                    size: 24,
                  }),
                ],
                spacing: { before: 400, after: 200 },
              }),

              createRewardPointsTable(),

              // Điểm trừ
              new Paragraph({
                children: [
                  new TextRun({
                    text: "ĐIỂM TRỪ",
                    bold: true,
                    size: 24,
                  }),
                ],
                spacing: { before: 400, after: 200 },
              }),

              createPenaltyPointsTable(),

              // Footer
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Ngày xuất báo cáo: ${currentDate}`,
                    italics: true,
                  }),
                ],
                alignment: AlignmentType.RIGHT,
                spacing: { before: 400 },
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: "--- Hết báo cáo ---",
                    italics: true,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 200 },
              }),
            ],
          },
        ],
      });

      // Xuất file
      const blob = await Packer.toBlob(doc);

      const fileName = `BaoCaoDiem_${student.studentId}_${
        student.firstName
      }_${currentDate.replace(/\//g, "-")}.docx`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error("Lỗi khi xuất file Word:", error);
      alert("Có lỗi xảy ra khi xuất file Word. Vui lòng thử lại!");
    }
  };

  return (
    <button
      onClick={handleExportWord}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      title="Xuất báo cáo điểm ra file Word"
    >
      <FileText size={20} />
      <span>Xuất Word</span>
    </button>
  );
};

export default ExportWordButton;
