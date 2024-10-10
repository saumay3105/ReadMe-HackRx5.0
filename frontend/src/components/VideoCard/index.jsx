import React from "react";
import "./VideoCard.css";

const VideoCard = ({ video }) => {
  const truncateDescription = (text, maxLength) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const formatViews = (views) => {
    return views >= 1000000
      ? (views / 1000000).toFixed(1) + "M"
      : views >= 1000
      ? (views / 1000).toFixed(1) + "K"
      : views;
  };

  return (
    <div className="video-card">
      <div className="thumbnail">
        <img src={video.thumbnail} alt={video.title} />
        <span className="duration">{video.duration}</span>
      </div>
      <div className="details">
        <h3 className="title">{video.title}</h3>
        <p className="description">
          {truncateDescription(video.description, 95)}
        </p>
        <div className="meta">
          <span className="views">{formatViews(video.views)} views</span>
          <span className="date">{video.date}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
