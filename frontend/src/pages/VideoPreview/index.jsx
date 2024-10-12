import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/Commons/Header";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
<<<<<<< Updated upstream
import 'react-toastify/dist/ReactToastify.css';
import QuizPreview from "../../components/Quiz-Preview";
=======
>>>>>>> Stashed changes
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
  const [error, setError] = useState("");

  useEffect(() => {
    // Retrieve jobId from local storage
    const storedJobId = localStorage.getItem("currentJobId");
    if (storedJobId) {
      handleGenerateVideo(storedJobId);
    } else {
      setError("Job ID not found in local storage.");
      setLoading(false);
    }
  }, []);

  const handleGenerateVideo = async (jobId) => {
    try {
      const generateResponse = await axios.get(
        `http://localhost:8000/generate-video/${jobId}/`,
      );

      const videoJobId = generateResponse.data.video_job_id;

      localStorage.setItem("video_job_id", videoJobId);

      pollVideoStatus(videoJobId);
    } catch (err) {
      console.error(err);
      setError("Failed to generate video. Please check the job ID.");
      setLoading(false);
    }
  };


// Function to poll the video status
const pollVideoStatus = (jobId) => {
  const pollInterval = setInterval(async () => {
    try {
      const statusResponse = await axios.get(
        `http://localhost:8000/video-status/${jobId}/`
      );

      status = statusResponse.data.status;

      console.log(statusResponse.data)

      if (status === "completed") {
        // Video generation is completed, set video URL and stop polling
        setVideoData(statusResponse.data);
        setLoading(false);
        clearInterval(pollInterval); // Stop polling
      } else if (status === "failed") {
        // Handle failure, show error message, and stop polling
        setError("Video generation failed.");
        setLoading(false);
        clearInterval(pollInterval);

      } else {
        // If status is still pending, keep polling
        console.log(`Video is still processing (status: ${status})`);
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching video status.");
      setLoading(false);
      clearInterval(pollInterval); // Stop polling if there's an error
    }
  }, 5000); // Poll every 5 seconds (adjust as necessary)
};

  const handleQuizGeneration = async () => {
    if (!jobId) {
      toast.error("No job ID found. Please upload a document first.");
      return;
    }

    try {
      toast.success("Generating questions. Please wait.");
      const questionsResponse = await axios.post(
        `http://127.0.0.1:8000/generate-questions/${jobId}/`
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVideoData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  async function handlePublishVideo() {
      const video_job_id = localStorage.getItem("video_job_id");
if (!video_job_id) {
    toast.error("Job ID not found. Cannot publish video.");
    return;
  }

  try {
    // Construct the API URL for publishing video
    const publishUrl = `http://localhost:8000/publish-video/${video_job_id}/`;

    // Create payload data
    const payload = {
      title: videoData.title,
      description: videoData.description,
    };

    // Make the POST request to publish the video
    const response = await axios.post(publishUrl, payload);

    if (response.status === 201) {
      // If the response is successful, display a success message
      toast.success("Video published successfully!");
      console.log("Published video:", response.data);
      navigate(`/video-player`); // Navigate to the published video page
    } else {
      toast.error("Failed to publish video.");
    }
  } catch (error) {
    // Handle any errors that occur during the publishing process
    toast.error("Error publishing video: " + error.message);
    console.error("Publish error:", error);
  }
  }

  return (
    <>
      <div className="video-preview-container">
        <div className="video-content">
          <h1>Video Preview</h1>
          <div className="video-container">
            {error && !videoData.video_url && <div className="error">{error}</div>}
            {loading ? (
              <div className="loading-message">
                Your video is being generated, please wait...
              </div>
            ) : (
              videoData.video_url && <video src={videoData.video_url} controls />
            )}
          </div>
          <button className="video-preview-btn" onClick={handleQuizGeneration}>
            Get Quiz
          </button>
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
                value=""
                disabled
              />
            </div>
            <div>
              <button className="btn" onClick={handlePublishVideo}>Publish</button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default VideoPreview;
