import React, { useEffect, useState } from "react";
import axios from "axios";
import OverlayScore from "./components/OverlayScore";

function App() {
  const [score, setScore] = useState(null);

  useEffect(() => {
    const claim = "The earth revolves around the sun.";
    axios.post("http://localhost:8000/api/analyze/", { text: claim })
      .then(res => setScore(res.data.score));
  }, []);

  return (
    <div className="App">
      {score !== null && <OverlayScore score={score} />}
    </div>
  );
}

export default App;
