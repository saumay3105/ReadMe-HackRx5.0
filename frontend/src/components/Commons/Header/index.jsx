import { Link } from "react-router-dom";
import "./Header.css";

function Header({ showNav = true }) {
  return (
    <header className="header">
      <div className="container">
        <h1 className="logo">ReadMe</h1>
        {showNav && (
          <nav>
            <ul>
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
              <Link to="/text-to-video" className="btn-nav-main">
                Generate
              </Link>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;
