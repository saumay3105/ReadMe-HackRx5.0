import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import "./Header.css";

function Header() {
  const { user, loading } = useContext(AuthContext);

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/">
          <span className="logo">
            <img
              width="30"
              height="45"
              src="https://pbs.twimg.com/profile_images/1664193730826366978/6pjJJhSV_400x400.jpg"
              alt="Logo"
            />
            ReadMe.AI
          </span>
        </Link>
        <nav>
          {!user ? (
            <ul>
              <li>
                <Link to="/upload-document" className="btn-nav-main">
                  Get Started
                </Link>
              </li>
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <Link to="/login">Log-in</Link>
              </li>
            </ul>
          ) : (
            <ul>
              <li>
                <Link to="/explore">Explore</Link>
              </li>
              <li>
                <Link to="/upload-document">Create</Link>
              </li>
              <li>
                <Link to="/analytics-dashboard">Dashboard</Link>
              </li>
              <li>
                <Link to="/profile">{user.full_name.split(" ")[0]}</Link>
              </li>
            </ul>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
