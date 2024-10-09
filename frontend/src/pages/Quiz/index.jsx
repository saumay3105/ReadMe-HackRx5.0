import { useState, useEffect } from "react";
import "./Quiz.css";
import trophy from "../../assets/trophy.png";
import streakicon from "../../assets/streak.png";
import higheststreakicon from "../../assets/higheststreakicon.png";
import timericon from "../../assets/timericon.png";
import correctSound from "../../assets/correctsound.mp3";
import incorrectSound from "../../assets/incorrectsound.mp3";
import Result from "../Result";
import quizData from "./quizData"; // Import the quiz data
import Header from "../../components/Commons/Header";

function Quiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [points, setPoints] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [timer, setTimer] = useState(30);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [questionResults, setQuestionResults] = useState([]);
  const [timeSpent, setTimeSpent] = useState([]);
  const [finalScore, setFinalScore] = useState(0);
  const [isTimeoutOccurred, setIsTimeoutOccurred] = useState(false);

  useEffect(() => {
    let interval;

    if (timer > 0 && !answerLocked && !isTimeoutOccurred) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && !isTimeoutOccurred) {
      handleTimeout();
    }

    return () => clearInterval(interval);
  }, [timer, answerLocked, isTimeoutOccurred]);

  const handleOptionClick = (option) => {
    if (answerLocked || isTimeoutOccurred) return;

    const currentQuestion = quizData[currentQuestionIndex];

    const isCorrect = option === currentQuestion.correctAnswer;

    const audio = new Audio(isCorrect ? correctSound : incorrectSound);
    audio.play();

    setAnswerLocked(true);
    setSelectedOption(option);
    setTimeSpent((prev) => [...prev, 30 - timer]);

    if (isCorrect) {
      setPoints((prevPoints) => prevPoints + 10);
      setStreak((prevStreak) => {
        const newStreak = prevStreak + 1;
        setHighestStreak((prevHighest) => Math.max(prevHighest, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }

    setQuestionResults((prevResults) => [...prevResults, { isCorrect }]);

    if (currentQuestionIndex === quizData.length - 1) {
      finishQuiz(isCorrect);
    }
  };

  const handleTimeout = () => {
    if (isTimeoutOccurred) return;

    setIsTimeoutOccurred(true);
    const audio = new Audio(incorrectSound);
    audio.play();

    setAnswerLocked(true);
    setSelectedOption(null);
    setTimeSpent((prev) => [...prev, 30]);
    setStreak(0);
    setQuestionResults((prevResults) => [...prevResults, { isCorrect: false }]);

    if (currentQuestionIndex === quizData.length - 1) {
      finishQuiz(false);
    } else {
      setTimeout(handleNextQuestion, 2000); // Auto-move to next question after 2 seconds
    }
  };

  const finishQuiz = (lastQuestionCorrect) => {
    setIsQuizFinished(true);

    const allResults = [...questionResults, { isCorrect: lastQuestionCorrect }];
    let currentStreak = 0;
    let maxStreak = 0;
    let correctAnswers = 0;

    allResults.forEach((result) => {
      if (result.isCorrect) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
        correctAnswers++;
      } else {
        currentStreak = 0;
      }
    });

    const finalScore = correctAnswers * 10 + maxStreak * 10;
    setFinalScore(finalScore);

    const analyticsData = {
      finalScore,
      highestStreak: maxStreak,
      questionResults: allResults,
      timeSpent: [...timeSpent, 30 - timer],
      correctAnswers,
      totalQuestions: quizData.length,
    };

    console.log("Analytics Data:", analyticsData);

    fetch("http://localhost:8000/api/results/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(analyticsData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Analytics sent successfully:", data);
      })
      .catch((error) => {
        console.error("Error sending analytics:", error);
      });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setSelectedOption(null);
      setAnswerLocked(false);
      setTimer(30);
      setIsTimeoutOccurred(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setPoints(0);
    setSelectedOption(null);
    setIsQuizFinished(false);
    setAnswerLocked(false);
    setTimer(30);
    setStreak(0);
    setHighestStreak(0);
    setQuestionResults([]);
    setTimeSpent([]);
    setFinalScore(0);
    setIsTimeoutOccurred(false);
  };

  if (isQuizFinished) {
    return (
      <Result
        finalScore={finalScore}
        correctAnswers={questionResults.filter((r) => r.isCorrect).length}
        totalQuestions={quizData.length}
        highestStreak={highestStreak}
        timeSpent={timeSpent}
        onRestart={handleRestart}
      />
    );
  }

  const currentQuestion = quizData[currentQuestionIndex];

  return (
    <>
      <Header isLoggedIn={true} />
      <div className="quiz-container">
        <div className="quiz-header">
          <div className="quiz-question-number">
            Question {currentQuestionIndex + 1} / {quizData.length}
          </div>
          <div className="quiz-streak">
            <img src={streakicon} alt="" />
            Streak: {streak}
          </div>
          <div className="quiz-score">
            <img src={trophy} alt="" />
            Score: {points} points
          </div>
          <div className="quiz-highest-streak">
            <img src={higheststreakicon} alt="" />
            Highest Streak: {highestStreak}
          </div>
          <div className="quiz-timer">
            <img src={timericon} alt="" />
            Time: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
          </div>
        </div>

        <div className="question-container">
          <h3 className="question">{currentQuestion.question}</h3>
          <div className="options">
            {currentQuestion.options.map((option, index) => {
              const isCorrect = option === currentQuestion.correctAnswer;
              const isIncorrect =
                answerLocked && selectedOption === option && !isCorrect;
              const isSelected = selectedOption === option;

              return (
                <button
                  key={index}
                  className={`option 
                  ${isCorrect && answerLocked ? "correct" : ""}
                  ${isIncorrect ? "incorrect" : ""}
                  ${isSelected ? "selected" : ""}
                  ${answerLocked ? "disabled-hover" : ""}
                `}
                  onClick={() => handleOptionClick(option)}
                  disabled={answerLocked}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <div className="explanation-and-next">
            {answerLocked && (
              <p
                className={`explanation ${
                  selectedOption === currentQuestion.correctAnswer
                    ? "correct-explanation"
                    : "incorrect-explanation"
                }`}
              >
                {selectedOption === currentQuestion.correctAnswer
                  ? currentQuestion.explanation
                  : `That's not the right answer! ${currentQuestion.explanation}`}
              </p>
            )}
            {answerLocked && (
              <div className="navigation-buttons">
                <button
                  className="next-btn"
                  onClick={handleNextQuestion}
                  disabled={!answerLocked}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Quiz;
