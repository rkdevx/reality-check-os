import { useEffect, useState } from "react";
import axios from "axios";
import FeedbackModal from "./FeedbackModal";
import { toast } from "react-toastify";

export default function FeedbackTable() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchFeedbacks = () => {
    axios.get("http://localhost:8000/api/feedback/")
      .then(res => setFeedbacks(res.data))
      .catch(err => {
        console.error(err);
        toast.error("Failed to fetch feedbacks");
      });
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
    <div className="table-responsive mt-4">
      <h3>User Feedback</h3>
      <p>View user feedback and suggestions.</p>

      <button className="btn btn-success mb-3" onClick={() => setShowModal(true)}>+ Add Feedback</button>

      <table className="table table-striped table-bordered align-middle">
        <thead className="table-dark">
          <tr>
            <th style={{ minWidth: "200px" }}>Feedback</th>
            <th style={{ minWidth: "150px" }}>Score</th>
            <th style={{ minWidth: "100px" }}>Verdict</th>
          </tr>
        </thead>
        <tbody>
          {feedbacks.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center">No feedback found.</td>
            </tr>
          ) : (
            feedbacks.map(fb => (
              <tr key={fb.id}>
                <td>{fb.text}</td>
                <td>{(fb.user_score * 100).toFixed(1)}%</td>
                <td>
                  <span className={`badge ${fb.verdict === "Factual" ? "bg-success" : "bg-warning text-dark"}`}>
                    {fb.verdict}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <FeedbackModal 
        show={showModal} 
        onClose={() => setShowModal(false)} 
        refreshFeedback={fetchFeedbacks} 
      />
    </div>
  );
}
