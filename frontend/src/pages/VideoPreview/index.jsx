import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/Commons/Header";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "./VideoPreview.css";

function VideoPreview() {
  const navigate = useNavigate();

  const [jobId, setJobId] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true); // Start loading initially
  const [error, setError] = useState("");

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
      setVideoUrl(videoBlobUrl);
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
      toast.success("Generating questions. Please wait.");
      const questionsResponse = await axios.post(
        "http://127.0.0.1:8000/generate-questions/",
        { job_id: jobId } // Send job ID if needed
      );

      const questions = questionsResponse.data.questions;

      if (questions) {
        localStorage.setItem("quizQuestions", JSON.stringify(questions));
        toast.success("Questions generated successfully.");
        navigate("/quiz");
      } else {
        toast.error("Failed to generate quiz questions.");
      }
    } catch (error) {
      toast.error("Failed to generate quiz questions: " + error.message);
    }
  };

  return (
    <div className="video-preview-container">
      <Header showNav={false} />
      <h1>Video Preview</h1>

      {error && <div className="error">{error}</div>}
      {loading ? (
        <div className="loading-message">
          Your video is being generated, please wait...
        </div>
      ) : (
        <div className="video-container">
          {videoUrl && <video src={videoUrl} controls />}
        </div>
      )}
      <button onClick={handleQuizGeneration}>Get Quiz</button>
      <ToastContainer />
    </div>
  );
}

export default VideoPreview;
