import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import TextToVideo from "../pages/TextToVideo";
import Quiz from "../pages/Quiz";
import ScriptEditor from "../pages/ScriptEditor";
import VideoPreview from "../pages/VideoPreview";
import AnalyticsDashboard from "../pages/AnalyticsDashboard";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Explore from "../pages/Explore";
import Header from "../components/Commons/Header";
import PrivateRoute from "./PrivateRoutes";
import VideoPlayer from "../pages/VideoPlayer";

// import Editor from "../pages/Editor";

const sampleVideos = [
  {
    id: 1,
    title: "React Fundamentals",
    description:
      "Learn the basics of React in this comprehensive tutorial. We'll cover components, state, props, and more!",
    thumbnail:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmVVrYsn_xMPMKupj8yd0jls5_Wtn57xRQ9w&s",
    duration: "15:30",
    views: 1500000,
    date: "2023-10-15",
  },
  {
    id: 2,
    title: "CSS Grid Layout",
    description:
      "Master CSS Grid Layout with this in-depth guide. Create complex layouts with ease!",
    thumbnail: "https://cms-api-in.myhealthcare.co/image/20220910103120.jpeg",
    duration: "10:45",
    views: 750000,
    date: "2023-11-02",
  },
  {
    id: 3,
    title: "CSS Grid Layout",
    description:
      "Master CSS Grid Layout with this in-depth guide. Create complex layouts with ease!",
    thumbnail: "https://cms-api-in.myhealthcare.co/image/20220910103120.jpeg",
    duration: "10:45",
    views: 750000,
    date: "2023-11-02",
  },
  {
    id: 4,
    title: "CSS Grid Layout",
    description:
      "Master CSS Grid Layout with this in-depth guide. Create complex layouts with ease!",
    thumbnail: "https://cms-api-in.myhealthcare.co/image/20220910103120.jpeg",
    duration: "10:45",
    views: 750000,
    date: "2023-11-02",
  },
  // Add more sample videos here
];

const AppRoutes = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route index path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/upload-document"
          element={<PrivateRoute element={TextToVideo} />}
        />
        <Route path="/quiz" element={<PrivateRoute element={Quiz} />} />
        <Route
          path="/script-editor"
          element={<PrivateRoute element={ScriptEditor} />}
        />
        <Route
          path="/video-preview"
          element={<PrivateRoute element={VideoPreview} />}
        />
        <Route
          path="/analytics-dashboard"
          element={<PrivateRoute element={AnalyticsDashboard} />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/explore" element={<Explore videos={sampleVideos} />} />
        <Route path="/video-player/:video_id :video_title" element={<VideoPlayer />} />
        {/* <Route path="/editor" element={<Editor />} /> */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;
