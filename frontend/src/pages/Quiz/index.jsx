import React, { useState, useEffect } from "react";
import "./Quiz.css";
import Question from "../../components/Questions";
import Header from "../../components/Commons/Header";

function Quiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [points, setPoints] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [quizData, setQuizData] = useState([]);

  useEffect(() => {
    const fetchedQuizData = JSON.parse(localStorage.getItem("quizQuestions"));

    if (fetchedQuizData) {
      setQuizData(fetchedQuizData);
    } else {
      console.error("No quiz questions found.");
    }
  }, []);

  const handleOptionChange = (e) => {
    const { value } = e.target;
    setSelectedOptions({
      ...selectedOptions,
      [currentQuestionIndex]: value,
    });
  };

  const handleSubmit = () => {
    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < 9) {
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      setIsQuizFinished(true);
      calculateScore(); 
    }
  };

  const handlePrevious = () => {
    const prevQuestionIndex = currentQuestionIndex - 1;
    if (prevQuestionIndex >= 0) {
      setCurrentQuestionIndex(prevQuestionIndex);
    }
  };

  const handleNext = () => {
    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < 10) {
      setCurrentQuestionIndex(nextQuestionIndex);
    }
  };

  const calculateScore = () => {
    let parsedQuizData;
  
    try {
      parsedQuizData = typeof quizData === 'string' ? JSON.parse(quizData) : quizData;
    } catch (error) {
      console.error("Failed to parse quizData:", error);
      return; 
    }
  
    let score = 0;
    parsedQuizData.forEach((question, index) => {
      if (selectedOptions[index] === question.correctAnswer) {
        score += 1;
      }
    });
    setPoints(score);
  };
  

  if (quizData.length === 0) {
    return <div>Loading quiz...</div>;
  }

  const currentQuestion = JSON.parse(quizData)[currentQuestionIndex];

  return (
    <div className="quiz-container">
      <video autoPlay muted loop className="background-video">
        <source src="/bg3.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="head">
        <Header showNav={false} />
      </div>
      <div className="main">
        {isQuizFinished ? (
          <div className="result-container">
            <h2>
              Your Score: {points} out of {10}
            </h2>
          </div>
        ) : (
          <div className="question-container">
            <div className="score">Score: {points}</div>
            <Question
              title={`Question ${currentQuestionIndex + 1}`}
              question={currentQuestion.question}
              options={currentQuestion.options}
              selectedOption={selectedOptions[currentQuestionIndex] || ""}
              handleOptionChange={handleOptionChange}
              handleSubmit={handleSubmit}
            />
            <div className="navigation-buttons">
              <button
                className="prev-btn"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>
              {currentQuestionIndex < 10 - 1 ? (
                <button
                  className="next-btn"
                  onClick={handleNext}
                  disabled={!selectedOptions[currentQuestionIndex]}
                >
                  Next
                </button>
              ) : (
                <button
                  className="submit-btn"
                  onClick={handleSubmit}
                  disabled={!selectedOptions[currentQuestionIndex]}
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Quiz;
