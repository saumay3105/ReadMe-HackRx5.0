import { Link } from "react-router-dom";
import "./Header.css";

function Header({ isLoggedIn = true }) {
  return (
    <header className="header">
      <div className="header__container">
        <span className="logo"><Link to='/'>ReadMe.ai</Link> </span>
        <nav>
          {!isLoggedIn ? (
            <ul>
              <li>
                <Link to="/text-to-video" className="btn-nav-main">
                  Generate
                </Link>
              </li>
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <Link to="/login" className="">
                  Log-in
                </Link>
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
                <Link to="/dashboard">Dashboard</Link>
              </li>
              <li>
                <Link to="/profile">Profile</Link>
              </li>
            </ul>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
