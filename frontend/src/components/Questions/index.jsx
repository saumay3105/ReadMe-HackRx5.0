import React from "react";
import "./Questions.css";

function Question({
  title,
  question,
  options,
  selectedOption,
  handleOptionChange,
  handleSubmit,
}) {
  // Check if options is defined and is an array
  const hasValidOptions = Array.isArray(options) && options.length > 0;

  return (
    <div className="quiz-container">
      <h2 className="quiz-title">{title}</h2>
      <div className="question-container">
        <h3 className="question">{question}</h3>
        {hasValidOptions ? (
          <div className="options">
            {options.map((option, index) => (
              <label
                key={index}
                className={`option ${
                  selectedOption === option ? "selected" : ""
                }`}
              >
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
        ) : (
          <p>No options available for this question.</p>
        )}
      </div>
    </div>
  );
}

export default Question;
