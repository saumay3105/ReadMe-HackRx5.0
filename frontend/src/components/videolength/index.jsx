import React, { useState } from 'react';
import './VideoLengthSelector.css';  

const VideoLengthSelector = () => {
  const [videoLength, setVideoLength] = useState([60, 300]);

  const secondsToMinutes = (seconds) => Math.floor(seconds / 60);
  const minutesToSeconds = (minutes) => minutes * 60;

  const handleSliderChange = (event) => {
    const value = Number(event.target.value);
    setVideoLength([value, value + 60]);
  };

  return (
    <div className="slider-container">
      <label>
        Video Length: {secondsToMinutes(videoLength[0])}m - {secondsToMinutes(videoLength[1])}m
      </label>
      <input 
        type="range" 
        min={minutesToSeconds(0)}
        max={minutesToSeconds(5)}
        value={videoLength[0]} 
        onChange={handleSliderChange} 
        className="slider"
      />
    </div>
  );
};

export default VideoLengthSelector;
