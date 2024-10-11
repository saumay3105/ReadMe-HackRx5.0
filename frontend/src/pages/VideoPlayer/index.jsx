import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./VideoPlayer.css";

function VideoPlayer({ url, title, description }) {
  const { video_id } = useParams();
  console.log(video_id);
  console.lo("video_title");
  const navigate = useNavigate();

  const handleQuizRedirect = () => {
    navigate("/quiz");
  };

  return (
    <>
      <div className="video-player-container">
        <h2>{video_title}</h2>
        <div className="video-container">
          <video src={url} controls />
        </div>
        <button className="quiz-play-btn" onClick={handleQuizRedirect}>
          Play Quiz
        </button>
      </div>
    </>
  );
}

export default VideoPlayer;
