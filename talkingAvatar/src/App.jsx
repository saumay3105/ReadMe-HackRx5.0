import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import React, { useContext, useEffect, useState } from "react";
import {SpeakingContext} from "./contexts/AvatarState";

const quizQuestions = [
  {
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    correct: 2,
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Saturn"],
    correct: 1,
  },
];
function App() {
  const {speaking, setSpeaking} = useContext(SpeakingContext)

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isCorrect, setIsCorrect] = useState(null);

  const handleAnswer = (index) => {
    const correct = quizQuestions[currentQuestion].correct === index;
    setIsCorrect(correct);
    setSpeaking(true); 
    setTimeout(() => {
      setCurrentQuestion((prev) => (prev + 1) % quizQuestions.length);
      setIsCorrect(null);
    }, 2000); 
  };



  return (
    <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
      
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "30vw", height: "30vh" }}>
        <Canvas shadows camera={{ position: [0, 0, 8], fov: 42 }}>
          <color attach="background" args={["#ececec"]} />
          <Experience isCorrect={isCorrect} />
        </Canvas>
      </div>

      
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
                padding: "10px 20px",
                margin: "10px",
                backgroundColor: isCorrect === null ? "#f0f0f0" : isCorrect ? "#4CAF50" : "#f44336",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;