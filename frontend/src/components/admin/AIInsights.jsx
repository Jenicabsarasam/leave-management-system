import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../../assets/styles/aiInsights.css"; // 👈 IMPORT THE NEW CSS

// Register chart.js components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AIInsights = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState("");
  const [reasonDistribution, setReasonDistribution] = useState({});
  const [monthlyTrends, setMonthlyTrends] = useState({});
  const [rawData, setRawData] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true); // Set loading to true at the start
      try {
        const res = await axios.get("http://localhost:5050/admin/ai-insights", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;

        setSummary(data.summary || "No AI summary available.");
        setReasonDistribution(data.reasonDistribution || {});
        setMonthlyTrends(data.monthlyTrends || {});
        setRawData(data.rawData || []);
      } catch (err) {
        console.error("Error fetching AI insights:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [token]);

  // Modern loading spinner
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading AI Insights...</p>
      </div>
    );
  }

  // Chart Data
  const pieData = {
    labels: Object.keys(reasonDistribution),
    datasets: [
      {
        data: Object.values(reasonDistribution),
        backgroundColor: [
          "#4F46E5",
          "#3B82F6",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
        ],
        hoverOffset: 4,
      },
    ],
  };

  const lineData = {
    labels: Object.keys(monthlyTrends),
    datasets: [
      {
        label: "Leaves per Month",
        data: Object.values(monthlyTrends),
        fill: true,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "#3B82F6",
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div className="ai-insights-container">
      {/* Header */}
      <header className="ai-insights-header">
        <h2>🧠 AI Insights</h2>
        <p>Automatic leave classification and trend analysis</p>
      </header>

      {/* Main Grid */}
      <div className="ai-insights-grid">
        {/* AI Summary Card */}
        <section className="insight-card ai-summary-card">
          <h3>🗒️ AI Summary</h3>
          <p>{summary}</p>
        </section>

        {/* Pie Chart Card */}
        <div className="insight-card chart-card-pie">
          <h3>📊 Leave Reason Distribution</h3>
          <div style={{ height: "300px" }}>
            <Pie data={pieData} options={chartOptions} />
          </div>
        </div>

        {/* Line Chart Card */}
        <div className="insight-card chart-card-line">
          <h3>📈 Monthly Trends</h3>
          <div style={{ height: "300px" }}>
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>

        {/* Raw Data Table Card */}
        <div className="insight-card raw-data-card">
          <h3>🧾 Raw Data Overview</h3>
          <div className="data-table-container">
            <table className="insight-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Reason</th>
                  <th>Category</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {rawData.length > 0 ? (
                  rawData.map((item, i) => (
                    <tr key={i}>
                      <td>{item.student || "N/A"}</td>
                      <td>{item.reason || "-"}</td>
                      <td>{item.category || "-"}</td>
                      <td>{item.date || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">
                      <div className="empty-table-state">
                        No raw data found.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;