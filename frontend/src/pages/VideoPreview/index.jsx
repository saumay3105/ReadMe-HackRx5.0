import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/Commons/Header";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import QuizPreview from "../../components/Quiz-Preview";
import "./VideoPreview.css";

function VideoPreview() {
  const navigate = useNavigate();

  const [jobId, setJobId] = useState("");
  const [videoData, setVideoData] = useState({
    title: "",
    description: "",
    videoUrl: "",
  });
  const [loading, setLoading] = useState(true); // Start loading initially
  const [quizLoading, setQuizLoading] = useState(false); // For quiz generation loading
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState();

  useEffect(() => {
    // Retrieve jobId from local storage
    const storedJobId = localStorage.getItem("currentJobId");
    if (storedJobId) {
      setJobId(storedJobId);
      handleGenerateVideo(storedJobId);
    } else {
      setError("Job ID not found in local storage.");
      setLoading(false);
    }
  }, []);

  const handleGenerateVideo = async (jobId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/generate-video/${jobId}/`,
        {
          responseType: "blob", // Important for receiving video file as a blob
        }
      );

      // Create a URL for the received blob (video)
      const videoBlobUrl = URL.createObjectURL(response.data);
      setVideoData((prevData) => ({
        ...prevData,
        videoUrl: videoBlobUrl,
      }));
      setLoading(false); // Stop loading after video is received
    } catch (err) {
      console.error(err);
      setError("Failed to generate video. Please check the job ID.");
      setLoading(false);
    }
  };

  const handleQuizGeneration = async () => {
    if (!jobId) {
      toast.error("No job ID found. Please upload a document first.");
      return;
    }

    try {
      setQuizLoading(true); // Start loading for quiz generation
      toast.success("Generating questions. Please wait.");
      const questionsResponse = await axios.post(
        `http://127.0.0.1:8000/generate-questions/${jobId}/`
      );

      let questions = JSON.parse(questionsResponse.data.questions);

      console.log(questions);

      if (questions) {
        localStorage.setItem("quizQuestions", JSON.stringify(questions));
        setQuestions(questions);
        // Stop the quiz loading animation
        setQuizLoading(false);
      } else {
        setQuizLoading(false);
        toast.error("Failed to generate quiz questions.");
      }
    } catch (error) {
      toast.error("Failed to generate quiz questions: " + error.message);
      setQuizLoading(false);
    }
  };

  useEffect(() => {
    // Simulating API fetch
    const fetchVideoData = async () => {
      // Replace this with your actual API call
      const response = await fetch("https://api.example.com/video");
      const data = await response.json();
      setVideoData(data);
    };

    fetchVideoData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVideoData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <>
      <div className="video-preview-container">
        <div className="video-content">
          <h1>Video Preview</h1>
          <div className="video-container">
            {error && <div className="error">{error}</div>}
            {loading ? (
              <div className="loading-message">
                Your video is being generated, please wait...
              </div>
            ) : (
              videoData.videoUrl && <video src={videoData.videoUrl} controls />
            )}
          </div>

          {!quizLoading && !questions && (
            <button
              className="video-preview-btn"
              onClick={handleQuizGeneration}
            >
              Get Quiz
            </button>
          )}

          {quizLoading && (
            <div className="loading-message">
              Generating quiz, please wait...
            </div>
          )}

          {questions && <QuizPreview questions={questions} />}
        </div>

        <div className="video-preview-sidebar">
          <h3>Video Details</h3>
          <div className="video-info">
            <input
              type="text"
              name="title"
              value={videoData.title}
              onChange={handleInputChange}
              className="video-title"
              placeholder="Title goes here"
            />
            <textarea
              name="description"
              value={videoData.description}
              onChange={handleInputChange}
              className="video-description"
              placeholder="Description goes here"
              rows="5"
            />
            <div>
              <span>Language: </span>English
            </div>
            <div>
              <span>Date created: </span>16 Jan 2024
            </div>
            <div>
              <span>Video URL:</span>
              <input
                type="text"
                value="asdjsafsghfsahfuiafnsafjsfsanjhdsadbdadsdsafas"
                disabled
              />
            </div>
            <div>
              <button className="btn">Publish</button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default VideoPreview;
