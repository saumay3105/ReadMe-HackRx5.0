import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./upload.css";
import axios from "axios";
import VideoLengthSelector from "../videolength";

const FileUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false); // New loading state
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setSelectedFiles(Array.from(event.target.files));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select a file before uploading.", {
        position: "top-right",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFiles[0]);

    setLoading(true); // Set loading to true when uploading starts

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/upload-document/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 202) {
        toast.success("Document uploaded successfully! Processing started.", {
          position: "bottom-center",
        });

        // Store the job_id in localStorage
        localStorage.setItem("currentJobId", response.data.job_id);

        // Start polling for job status
        pollJobStatus(response.data.job_id);
      }
    } catch (error) {
      setLoading(false); // Reset loading state on error
      toast.error("Failed to upload the document. Please try again.", {
        position: "top-right",
      });
    }
  };

  const pollJobStatus = async (jobId) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/document-status/${jobId}/`
        );
        if (response.data.processing_status === "successful") {
          clearInterval(pollInterval);
          toast.success("Script generation completed!", {
            position: "bottom-center",
          });
          navigate("/script-editor");
        } else if (response.data.processing_status === "failed") {
          clearInterval(pollInterval);
          setLoading(false); // Reset loading state on failure
          toast.error("Script generation failed. Please try again.", {
            position: "top-right",
          });
        }
      } catch (error) {
        console.error("Error polling job status:", error);
      }
    }, 5000); // Poll every 5 seconds
  };

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Processing your document...</h2>
        <img src='./public/load-35.gif' alt="Description of GIF" className="img-load" />
      </div>
    );
  }

  return (
    <div className="upload-container">
      <h2>Upload Files</h2>
      <input
        type="file"
        accept=".pdf"
        className="file-input"
        onChange={handleFileChange}
      />
      <div className="file-preview">
        {selectedFiles.length > 0 && (
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="buttons">
        <button className="upload-button" onClick={handleUpload}>
          Start Generating
        </button>
      </div>
      <VideoLengthSelector/>
      <ToastContainer />
    </div>
  );
};

export default FileUpload;
