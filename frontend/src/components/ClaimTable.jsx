import { useEffect, useState } from "react";
import axios from "axios";

export default function ClaimTable() {
  const [claims, setClaims] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);

  const fetchClaims = (url = "http://localhost:8000/api/history/") => {
    axios.get(url)
      .then(res => {
        setClaims(res.data.results);
        setNextPage(res.data.next);
        setPrevPage(res.data.previous);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  return (
    <>
      <div className="table-responsive">
        <table className="table table-striped table-bordered align-middle">
          <thead className="table-dark">
            <tr>
              <th style={{ minWidth: "200px" }}>Text</th>
              <th>Score</th>
              <th>Verdict</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {claims.map(c => (
              <tr key={c.id}>
                <td
                  style={{
                    maxWidth: "300px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    cursor: "pointer",
                    color: "#0d6efd",
                  }}
                  onClick={() => setSelectedClaim(c)}
                >
                  {c.text}
                </td>
                <td><strong>{(c.score * 100).toFixed(1)}%</strong></td>
                <td>
                  <span className={`badge ${c.verdict === "Factual" ? "bg-success" : "bg-warning text-dark"}`}>
                    {c.verdict}
                  </span>
                </td>
                <td>{new Date(c.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between my-3">
        <button className="btn btn-secondary" disabled={!prevPage} onClick={() => fetchClaims(prevPage)}>Prev</button>
        <button className="btn btn-secondary" disabled={!nextPage} onClick={() => fetchClaims(nextPage)}>Next</button>
      </div>

      {/* Modal */}
      {selectedClaim && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Full Claim Text</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedClaim(null)}></button>
              </div>
              <div className="modal-body">
                <p>{selectedClaim.text}</p>
                <p><strong>Score:</strong> {(selectedClaim.score * 100).toFixed(1)}%</p>
                <p><strong>Verdict:</strong> {selectedClaim.verdict}</p>
                <p><strong>Time:</strong> {new Date(selectedClaim.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
