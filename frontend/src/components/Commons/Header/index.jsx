import { Link } from "react-router-dom";
import "./Header.css";

function Header() {
  return (
    <header className="header">
      <div className="container">
        <img src="public/logo1.png" alt="ReadMe" className="logo" />
        <nav>
          <ul>
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
            <Link to="/editor" className="btn-nav-main">
              Generate
            </Link>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
