import { useState, useEffect, useContext } from "react";
import { Canvas } from "@react-three/fiber";
import "./Quiz.css";
import trophy from "../../assets/trophy.png";
import streakicon from "../../assets/streak.png";
import higheststreakicon from "../../assets/higheststreakicon.png";
import timericon from "../../assets/timericon.png";
import correctSound from "../../assets/correctsound.mp3";
import incorrectSound from "../../assets/incorrectsound.mp3";
import Result from "../Result";
import quizData from "./quizData";
import { SpeakingContext } from "../../context/AvatarState";
import { Experience } from "../../components/Experience";
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

  const { speaking, setSpeaking } = useContext(SpeakingContext);
  const [isCorrect, setIsCorrect] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [isRevising, setIsRevising] = useState(false);
  const [script, setScript] = useState("");

  const handleAnswer = (index) => {
    const correct = quizQuestions[currentQuestion].correct === index;
    setIsCorrect(correct);
    setSpeaking(true);

    // Set the script for correct/incorrect response
    setScript(correct ? "correct" : "incorrect");

    setTimeout(() => {
      setCurrentQuestion((prev) => (prev + 1) % quizQuestions.length);
      setIsCorrect(null);
    }, 2000);
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setIsRevising(false);
    setScript("correct"); // Only accept correct/incorrect now
  };

  const startRevision = () => {
    setIsRevising(true);
    setQuizStarted(false);
    setScript("introduction");
    setSpeaking(true);

    // Play introduction, then summary
    setTimeout(() => {
      setScript("summary");
    }, 5000); // Adjust timing as needed for introduction audio length
  };


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
    <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
      <div style={{ position: "absolute", bottom: 10, left: "35vw", width: "30vw", height: "45vh" }}>
        <Canvas shadows camera={{ position: [0, 0, 8], fov: 42 }}>
          <color attach="background" args={["#e2e2e2"]} />
          <Experience isCorrect={isCorrect} script={script} />
        </Canvas>
      </div>

      {!quizStarted && !isRevising && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <button onClick={startQuiz} style={buttonStyle}>
            Start Quiz
          </button>
          <button onClick={startRevision} style={buttonStyle}>
            Revise
          </button>
        </div>
      )}

      {quizStarted && (
        <div
          style={{
            position: "absolute",
            top: "10vh",
            left: "50%",
            transform: "translateX(-50%)",
            width: "40vw",
            textAlign: "center",
          }}
        >
          <h2>{quizQuestions[currentQuestion].question}</h2>
          <div>
            {quizQuestions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                style={{
                  ...buttonStyle,
                  backgroundColor:
                    isCorrect === null ? "#f0f0f0" : isCorrect ? "#4CAF50" : "#f44336",
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {isRevising && (
        <div
          style={{
            position: "absolute",
            top: "10vh",
            left: "50%",
            transform: "translateX(-50%)",
            width: "40vw",
            textAlign: "center",
          }}
        >
          <h2>Revising the content...</h2>
        </div>
      )}
    </div>
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

const buttonStyle = {
  padding: "10px 20px",
  margin: "10px",
  backgroundColor: "#008CBA",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default Quiz;
