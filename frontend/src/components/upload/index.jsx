import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./upload.css";
import axios from "axios";

const FileUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Handles file input changes
  const handleFileChange = (event) => {
    setSelectedFiles(Array.from(event.target.files));
  };

  // Handles the file upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select a file before uploading.", {
        position: "top-right",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFiles[0]);

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
      }
    } catch (error) {
      toast.error("Failed to upload the document. Please try again.", {
        position: "top-right",
      });
    }
  };

  // Placeholder for handling video retrieval (if needed)
  const handleGetVideo = () => {
    toast.info("The function is being updated currently.", {
      position: "top-right",
    });
  };

  return (
    <div className="upload-container">
      <h2>Upload Files</h2>
      <input
        type="file"
        multiple
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
          Upload
        </button>
        <button className="video" onClick={handleGetVideo}>
          Get Video
        </button>
      </div>

      {/* ToastContainer to display notifications */}
      <ToastContainer />
    </div>
  );
};

export default FileUpload;
