import React, { useState, useEffect } from "react";
import "./VideoPlayer.css";
import ReactPlayer from "react-player";

function VideoPlayer() {
  return (
    <>
      <div className="video-player-container">
        <h2>Video Title</h2>
        <div className="video-container">
          <video src="" controls />
        </div>

        <button className="quiz-play-btn" onClick={() => {}}>
          Play Quiz
        </button>
      </div>
    </>
  );
}

export default VideoPlayer;
