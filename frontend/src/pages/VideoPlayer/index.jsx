import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./VideoPlayer.css";

function VideoPlayer() {
  const { video_id } = useParams(); // Get video_id from URL
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(""); // State for acknowledgment message

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

  const handleShare = (platform) => {
    const currentUrl = window.location.href;
    let shareUrl;

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(currentUrl)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank');
  };

  const handleCopyToClipboard = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopySuccess("URL copied to clipboard!"); // Set acknowledgment message
      setTimeout(() => setCopySuccess(""), 3000); // Clear message after 3 seconds
    });
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
      <div className="share-buttons">
        <h3>Share this video:</h3>
        <button onClick={() => handleShare('facebook')}>Share on Facebook</button>
        <button onClick={() => handleShare('twitter')}>Share on Twitter</button>
        <button onClick={() => handleShare('linkedin')}>Share on LinkedIn</button>
        <button onClick={() => handleShare('whatsapp')}>Share on WhatsApp</button>
        <button onClick={handleCopyToClipboard}>Copy URL</button>
        {copySuccess && <p>{copySuccess}</p>} {/* Display acknowledgment message */}
      </div>
    </div>
  );
}

export default VideoPlayer;
