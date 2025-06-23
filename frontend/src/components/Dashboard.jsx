import { useEffect, useState } from "react";
import axios from "axios";
import ClaimTable from "./ClaimTable";

export default function Dashboard() {
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/api/history/")
      .then(res => setClaims(res.data))
      .catch(err => console.error(err));
  }, []);
  return (
    <div>
        <div className="container mt-4">
        <h1>Dashboard</h1>
        <p>Welcome to the dashboard! Here you can view claims, analytics, and user feedback.</p>
        <div className="row">
            <div className="col-md-8">
            <ClaimTable />
            </div>
        </div>
        </div>
    </div>
    );
}
