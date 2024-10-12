import React from "react";
import "./VideoCard.css";
import { Link } from "react-router-dom";

const VideoCard = ({ video }) => {
  const truncateDescription = (text, maxLength) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };
  return (
    <Link to={`/video-player/${video.video_id}`} className="video-card-link">
      <div className="video-card">
        <div className="thumbnail">
          <img src="https://medicircle.in/uploads/2020/february2020/bajaj_finserv_edit.jpg "alt={video.title} />
          <span className="duration">{formatDuration(video.duration)} min</span>
        </div>
        <div className="details">
          <h3 className="title">{video.title}</h3>
          <p className="description">
            {truncateDescription(video.description, 95)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
