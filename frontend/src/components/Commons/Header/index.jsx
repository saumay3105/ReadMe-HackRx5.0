import { Link } from "react-router-dom";
import "./Header.css";

function Header({ showNav = true }) {
  return (
    <header className="header">
      <div className="container">
        <img src="/logo1.png" alt="Logo" className="logo" />
        {showNav && (
          <nav>
            <ul>
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <Link to="/text-to-video" className="btn-nav-main">
                  Generate
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;
