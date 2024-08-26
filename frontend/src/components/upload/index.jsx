import React, { useState } from 'react';
import './upload.css';

const FileUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    //backend
    console.log('Files to upload:', selectedFiles);
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
      <button className="upload-button" onClick={handleUpload}>
        Upload
      </button>
    </div>
  );
};

export default FileUpload;
