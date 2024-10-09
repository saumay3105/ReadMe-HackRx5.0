import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Trophy, Target, Clock, Zap } from "lucide-react";
import "./Result.css";

const Result = ({
  finalScore,
  correctAnswers,
  totalQuestions,
  highestStreak,
  timeSpent,
  onRestart,
}) => {
  const [error, setError] = useState(null);

  const incorrectAnswers = totalQuestions - correctAnswers;
  const averageTime = Math.round(
    timeSpent.reduce((a, b) => a + b, 0) / totalQuestions
  );

  const data = [
    { name: "Correct", value: correctAnswers },
    { name: "Incorrect", value: incorrectAnswers },
  ];

  const COLORS = ["#4CAF50", "#F44336"];

  // Effect to send results to the backend
  useEffect(() => {
    const sendResultsToBackend = async () => {
      const analyticsData = {
        finalScore,
        highestStreak,
        questionResults: Array(totalQuestions)
          .fill()
          .map((_, i) => ({
            isCorrect: i < correctAnswers, // Example structure, adjust as necessary
          })),
        timeSpent,
      };

      try {
        const response = await fetch("http://localhost:8000/api/results/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(analyticsData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Failed to send results: ${errorData.error || "Unknown error"}`
          );
        }

        const data = await response.json();
        console.log("Results sent successfully:", data);
      } catch (err) {
        setError(err.message);
        console.error("Error sending results:", err); // Log the error for debugging
      } finally {
      }
    };

    sendResultsToBackend();
  }, [finalScore, highestStreak, correctAnswers, totalQuestions, timeSpent]);

  return (
    <div className="result-container">
      <h2 className="result-title">Quiz Results</h2>

      <div className="result-grid">
        <div className="result-item result-score">
          <Trophy className="result-icon" />
          <p className="result-label">Final Score</p>
          <p className="result-value">{finalScore}</p>
        </div>
        <div className="result-item result-accuracy">
          <Target className="result-icon" />
          <p className="result-label">Accuracy</p>
          <p className="result-value">
            {Math.round((correctAnswers / totalQuestions) * 100)}%
          </p>
        </div>
        <div className="result-item result-streak">
          <Zap className="result-icon" />
          <p className="result-label">Highest Streak</p>
          <p className="result-value">{highestStreak}</p>
        </div>
        <div className="result-item result-time">
          <Clock className="result-icon" />
          <p className="result-label">Avg. Time per Question</p>
          <p className="result-value">{averageTime}s</p>
        </div>
      </div>

      <div className="result-chart">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="result-legend">
          <div className="legend-item">
            <div className="legend-color legend-correct"></div>
            <span className="legend-label">Correct ({correctAnswers})</span>
          </div>
          <div className="legend-item">
            <div className="legend-color legend-incorrect"></div>
            <span className="legend-label">Incorrect ({incorrectAnswers})</span>
          </div>
        </div>
      </div>

      <button className="restart-button" onClick={onRestart}>
        Restart Quiz
      </button>
    </div>
  );
};

export default Result;
