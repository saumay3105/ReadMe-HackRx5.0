import React from 'react';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  return (
    <div className="dashboard-container">
      <header className="header">
        <h1> ReadMe.AI </h1>
        <nav>
          <ul>
            <li>Dashboard</li>
            <li>Explore</li>
            <li>Analytics</li>
            <li>Hi, User</li>
          </ul>
        </nav>
      </header>

      <main>
        

        <div className="overview-section">
          <div className="overview-card">
            <h3>Overview</h3>
            <p>Total Videos Created: <b>23</b></p>
            <p>Total Views (All videos): <b>1003</b> <span className="positive">(+13 today)</span></p>
            <p>Average Watch time: <b>45 mins</b></p>
            <p>Average Completion Rate: <b>83%</b> <span className="negative">(-3%)</span></p>
            <p>Total Quiz Attempt Rate: <b>75%</b></p>
            <p>Average Quiz Score: <b>6.3</b></p>
          </div>

          <div className="best-videos-card">
            <h3>Best Performing Videos</h3>
            <p>Life Insurance (300 views)</p>
            <div className="progress-bar blue" style={{ width: '80%' }}></div>
            <p>Bajaj Finserv (212 views)</p>
            <div className="progress-bar blue" style={{ width: '60%' }}></div>
            <p>Health Insurance (112 views)</p>
            <div className="progress-bar blue" style={{ width: '40%' }}></div>
          </div>

          <div className="difficult-quiz-card">
            <h3>Most Difficult Quiz</h3>
            <p>Life Insurance (4.2 Avg score)</p>
            <p>Bajaj Finserv (5.3 Avg score)</p>
            <p>Health Insurance (6.4 Avg score)</p>
          </div>
        </div>

        <div className="charts-section">
          <div className="views-chart">
            <h3>Views</h3>
            <p>All Time: 30,837,156</p>
            <img src="g3.png" alt="Views graph" />
          </div>

          <div className="user-age-chart">
            <h3>Facebook - Users by Age</h3>
            <img src="g2.png" alt="Users by age" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsDashboard;
