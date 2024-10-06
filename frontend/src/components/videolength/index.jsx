import React, { useState, useEffect } from 'react';
import './VideoLengthSelector.css';  

const VideoLengthSelector = ({ setVideoLength }) => {
  const [videoLength, setLocalVideoLength] = useState([60, 300]);

  const secondsToMinutes = (seconds) => Math.floor(seconds / 60);
  const minutesToSeconds = (minutes) => minutes * 60;

  const handleSliderChange = (event) => {
    const value = Number(event.target.value);
    const newLength = [value, value + 60];
    setLocalVideoLength(newLength);
    setVideoLength(newLength); // Update parent state
  };

  useEffect(() => {
    setVideoLength(videoLength);
  }, [videoLength, setVideoLength]);

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
