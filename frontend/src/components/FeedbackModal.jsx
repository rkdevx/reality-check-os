import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function FeedbackModal({ show, onClose, refreshFeedback }) {
  const [text, setText] = useState("");
  const [userScore, setUserScore] = useState(0.5); // Default mid score

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (text.trim().length < 5) {
      toast.error("Please enter meaningful feedback.");
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/feedback/", {
        text,
        user_score: userScore,
        verdict: userScore > 0.6 ? "Factual" : "Possibly Manipulative",
      });
      toast.success("Feedback submitted!");
      setText("");
      setUserScore(0.5);
      onClose();
      refreshFeedback();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit feedback.");
    }
  };

  if (!show) return null;

  return (
    <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          
          <div className="modal-header">
            <h5 className="modal-title">Submit Feedback</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>Your Feedback</label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  value={text} 
                  onChange={(e) => setText(e.target.value)} 
                  required 
                />
              </div>

              <div className="mb-3">
                <label>How trustworthy is this claim? (0 = Untrustworthy, 1 = Highly Factual)</label>
                <input 
                  type="range" 
                  className="form-range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={userScore} 
                  onChange={(e) => setUserScore(parseFloat(e.target.value))} 
                />
                <div className="text-center"><strong>{(userScore * 100).toFixed(0)}%</strong></div>
              </div>

              <button className="btn btn-primary w-100" type="submit">Submit</button>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}
