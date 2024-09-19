import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Commons/Header";
import axios from "axios";
import "./ScriptEditor.css";

const TextEditor = () => {
  const [script, setScript] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchScript = async () => {
      const jobId = localStorage.getItem("currentJobId");
      console.log("Job ID from localStorage:", jobId);

      if (!jobId) {
        toast.error("No job ID found. Please upload a document first.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/get-script/${jobId}/`
        );

        if (response.data && response.data.extracted_script) {
          setScript(response.data.extracted_script);
        } else {
          toast.error("Unexpected response from server");
        }
      } catch (error) {
        console.error("Error fetching script:", error);
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
        }
        toast.error(`Failed to fetch the script: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScript();
  }, []);

  const handleScriptChange = (e) => {
    setScript(e.target.value);
  };

  const handleSubmit = async () => {
    const jobId = localStorage.getItem("currentJobId");
    if (!jobId) {
      toast.error("No job ID found. Please upload a document first.");
      return;
    }

    try {
      await axios.post(`http://127.0.0.1:8000/submit-script/${jobId}/`, {
        script,
      });

      toast.success("Script submitted successfully. Video generation started.");

      toast.success("Generating questions. Please wait.");
      const questionsResponse = await axios.post(
        "http://127.0.0.1:8000/generate-questions/",
        { script_text: script }
      );

      const questions = questionsResponse.data.questions;

      if (questions) {
        localStorage.setItem("quizQuestions", JSON.stringify(questions));

        toast.success(
          "Script submitted successfully. Video generation started."
        );
        navigate("/quiz");
      } else {
        toast.error("Failed to generate quiz questions.");
      }
    } catch (error) {
      toast.error("Failed to submit the script. Please try again." + error);
    }
  };

  if (isLoading) {
    return <div>Loading script...</div>;
  }

  return (
    <div className="editor-container">
      <Header showNav={false} />
      <textarea
        className="text-area"
        value={script}
        onChange={handleScriptChange}
        placeholder="Start typing here..."
      />
      <button className="submit-btn" onClick={handleSubmit}>
        Submit
      </button>
      <ToastContainer />
    </div>
  );
};

export default TextEditor;
