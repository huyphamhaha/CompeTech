import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "./PointsChart.css";

// Đăng ký các thành phần Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PointsChart = ({ data = [] }) => {
  const chartData = {
    labels: data.map((item) => item.month),
    datasets: [
      {
        label: "Điểm rèn luyện",
        data: data.map((item) => item.points),
        fill: true,
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        borderColor: "#4caf50",
        tension: 0.4,
        pointBackgroundColor: "#4caf50",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
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
        callbacks: {
          title: (tooltipItems) => tooltipItems[0].label,
          label: (context) => `Điểm: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { family: "Helvetica", size: 12 },
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          font: { family: "Helvetica", size: 12 },
        },
      },
    },
  };

  return (
    <div style={{ height: "250px", width: "100%" }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default PointsChart;
