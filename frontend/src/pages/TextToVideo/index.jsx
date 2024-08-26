import React from "react";
import Header from "../../components/Commons/Header";
import FileUpload from "../../components/upload";
import "./TextToVideo.css";

const TextToVideo = () => {
  return (
    <div className="text-to-video-container">
      <Header showNav={false} />
      <div className="file-upload-container">
        <FileUpload />
      </div>
    </div>
  );
}

export default TextToVideo;
