import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Đăng ký các thành phần Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ActivityChart = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.category),
    datasets: [
      {
        label: "Số hoạt động",
        data: data.map((item) => item.count),
        backgroundColor: "#4caf50",
        borderRadius: 5,
        yAxisID: "y",
      },
      // Bỏ dataset điểm
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            family: "Helvetica",
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#333",
        bodyColor: "#666",
        borderColor: "#ddd",
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "Helvetica",
            size: 12,
          },
        },
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Số hoạt động",
          font: {
            family: "Helvetica",
            size: 12,
          },
        },
        min: 0,
        max: 10,
        ticks: {
          stepSize: 1,
          font: {
            family: "Helvetica",
            size: 12,
          },
        },
      },
      // Bỏ trục điểm y1
    },
  };

  return (
    <div style={{ height: "300px", width: "100%" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ActivityChart;
