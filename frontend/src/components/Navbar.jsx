import { Link, redirect } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/Login/loginSlice";
import axios from "axios";



const Navbar = () => {

const LoggedIn = useSelector((state) => state.login.isLoggedIn) || !!localStorage.getItem("access");
const username = useSelector((state) => state.login.user?.username || "Guest");
const dispatch = useDispatch();

const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    dispatch(logout());
    axios.defaults.headers.common["Authorization"] = "";
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/dashboard">🧠 RealityCheck OS</Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">Claim History</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/analytics">Analytics</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/feedback">User Feedback</Link>
            </li>
          </ul>
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                {!LoggedIn ? (
                <li className="nav-item">
                    <span className="nav-link">Welcome, {username}</span>
                </li>
                ) :
                <li className="nav-item">
                    <span className="nav-link">Welcome, {username}</span>
                </li>}

            </ul>
          {LoggedIn ? (
          <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
            ):<button className="btn btn-outline-light" onClick={() => navigate("/login")}>Login</button>}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
