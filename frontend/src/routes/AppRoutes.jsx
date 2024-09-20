import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import TextToVideo from "../pages/TextToVideo";
import Quiz from "../pages/Quiz";
import ScriptEditor from "../pages/ScriptEditor";
import VideoPreview from "../pages/VideoPreview";
// import Editor from "../pages/Editor";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route index path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/text-to-video" element={<TextToVideo />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/script-editor" element={<ScriptEditor />} />
        <Route path="/video-preview" element={<VideoPreview />} />
        {/* <Route path="/editor" element={<Editor />} /> */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;
