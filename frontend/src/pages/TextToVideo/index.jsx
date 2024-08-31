import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Commons/Header";
import FileUpload from "../../components/upload";
import VideoLengthSelector from "../../components/videolength"; 
import "./TextToVideo.css";

const TextToVideo = () => {
  return (
    <div className="text-to-video-container">
      <video autoPlay muted loop className="background-video">
        <source src="/bg3.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <Header showNav={false} />
      <div className="file-upload-container">
        <FileUpload />
        <VideoLengthSelector /> 
        <Link to="/quiz" className="btn-primary">
          Take Quiz
        </Link>
      </div>
    </div>
  );
}

export default TextToVideo;
