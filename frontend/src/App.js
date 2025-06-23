import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Analytics from "./components/Analytics";
import FeedbackTable from "./components/FeedbackTable";
import ClaimTable from "./components/ClaimTable";
import Navbar from "./components/Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { useSelector } from "react-redux";

function App() {
  const location = useLocation();

  const LoggedIn = useSelector((state) => state.login.isLoggedIn) || !!localStorage.getItem("access");
  const hideNavbar = LoggedIn

  return (
    <div className="App">
      {hideNavbar && <Navbar />}

      <div className="container mt-4">
        <Routes>
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/feedback" 
            element={
              <ProtectedRoute>
                <FeedbackTable />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/claims" 
            element={
              <ProtectedRoute>
                <ClaimTable />
              </ProtectedRoute>
            }
          />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
