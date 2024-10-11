import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./VideoPlayer.css";

function VideoPlayer() {
  const { video_id } = useParams(); // Get video_id from URL
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch video details based on video_id
    const fetchVideo = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/videos/${video_id}/`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch video");
        }
        const data = await response.json();
        setVideoData(data.video); // Assuming the API returns { "video": { video data } }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchVideo();
  }, [video_id]);

  const handleQuizRedirect = () => {
    navigate("/quiz");
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="video-player-container">
      <h2>{videoData.title}</h2>
      <div className="video-container">
        <video
          src={"http://127.0.0.1:8000" + videoData.video_file}
          controls
        />
      </div>
      <p>{videoData.description}</p>
      <button className="quiz-play-btn" onClick={handleQuizRedirect}>
        Play Quiz
      </button>
    </div>
  );
}

export default VideoPlayer;
