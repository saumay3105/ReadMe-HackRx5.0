import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './upload.css';

const FileUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to upload',{position:'top-right'});
      return;
    }
    toast.success('Files uploaded successfully!',{position : "bottom-center"});
    console.log('Files to upload:', selectedFiles);
  };

  const handleGetVideo = () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to upload',{position:'top-right'});
      return;
    }
    toast.info('processing',{position:"bottom-center"});
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
      <div className='buttons'>
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
