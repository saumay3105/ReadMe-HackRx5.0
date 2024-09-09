import React from "react";
import "./Questions.css";

function Question({ title, question, options, selectedOption, handleOptionChange, handleSubmit }) {
  return (
    <div className="quiz-container">
      <h2 className="quiz-title">{title}</h2>
      <div className="question-container">
        <h3 className="question">{question}</h3>
        <div className="options">
          {options.map((option, index) => (
            <label key={index} className={`option ${selectedOption === option ? 'selected' : ''}`}>
              <input
                type="radio"
                name="option"
                value={option}
                checked={selectedOption === option}
                onChange={handleOptionChange}
              />
              {option}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Question;
