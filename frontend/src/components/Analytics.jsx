import { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Analytics() {
  const [scores, setScores] = useState([]);

useEffect(() => {
  axios.get("http://localhost:8000/api/history/")
    .then(res => {
      const scoreArray = res.data.results.map(c => c.score);  // .results ke andar se map karna hai
      setScores(scoreArray);
    })
    .catch(err => console.error(err));
}, []);


  const scoreBands = { "0-0.2": 0, "0.2-0.4": 0, "0.4-0.6": 0, "0.6-0.8": 0, "0.8-1": 0 };

  scores.forEach(s => {
    if (s <= 0.2) scoreBands["0-0.2"]++;
    else if (s <= 0.4) scoreBands["0.2-0.4"]++;
    else if (s <= 0.6) scoreBands["0.4-0.6"]++;
    else if (s <= 0.8) scoreBands["0.6-0.8"]++;
    else scoreBands["0.8-1"]++;
  });

  const chartData = {
    labels: Object.keys(scoreBands),
    datasets: [
      {
        label: "Claims",
        data: Object.values(scoreBands),
        backgroundColor: [
          "#4caf50",  // green
          "#ff9800",  // orange
          "#f44336",  // red
          "#2196f3",  // blue
          "#9c27b0"   // purple
        ],
        borderRadius: 6,
      }
    ]
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#ddd" },
        ticks: { color: "#333" }
      },
      x: {
        grid: { color: "#eee" },
        ticks: { color: "#333" }
      }
    },
    plugins: {
      legend: {
        labels: { color: "#333", font: { size: 14 } }
      },
      tooltip: {
        backgroundColor: "#333",
        titleColor: "#fff",
        bodyColor: "#fff"
      }
    }
  };

  return (
    <div style={{
      background: "#fff",
      padding: "20px",
      borderRadius: "12px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      marginTop: "20px",
      maxWidth: "600px",
      marginLeft: "auto",
      marginRight: "auto"
    }}>
      <h3 style={{ marginBottom: "15px", textAlign: "center" }}>Claim Score Distribution</h3>
      <Bar data={chartData} options={options} />
    </div>
  );
}
