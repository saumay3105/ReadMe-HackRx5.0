// src/SlideVideoMerger.js

import React, { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import coreURL from "@ffmpeg/core?url";
import wasmURL from "@ffmpeg/core/wasm?url";

// Sample presentation data
const react_presentation = {
  slides: [
    {
      slide_title: "What is React?",
      content:
        "React is a JavaScript library for building user interfaces. It allows developers to create reusable UI components, making it easy to manage complex UIs.",
    },
    {
      slide_title: "Key Features of React",
      content:
        "1. Component-based architecture\n2. Virtual DOM for performance optimization\n3. Declarative UI\n4. Unidirectional data flow",
    },
    {
      slide_title: "Components in React",
      content:
        "Components are the building blocks of a React application. They can be class-based or functional and can manage their own state.",
    },
    {
      slide_title: "JSX - JavaScript XML",
      content:
        "JSX is a syntax extension for JavaScript that looks similar to HTML. It allows you to write HTML-like code directly in JavaScript, which React converts into React elements.",
    },
    {
      slide_title: "State and Props",
      content:
        "State is a built-in object in React components used to hold data that may change over time. Props, short for properties, are inputs to components that allow data to be passed down from parent to child.",
    },
    {
      slide_title: "Lifecycle Methods",
      content:
        "Class components in React have special lifecycle methods, such as componentDidMount, componentDidUpdate, and componentWillUnmount, which help control component behavior at different stages.",
    },
    {
      slide_title: "React Hooks",
      content:
        "Hooks are functions that let you use state and other React features in functional components. Popular hooks include useState, useEffect, and useContext.",
    },
    {
      slide_title: "Handling Events",
      content:
        "In React, events are handled using camelCase syntax for event names, and you pass event handlers as functions to JSX elements.",
    },
    {
      slide_title: "Conditional Rendering",
      content:
        "React allows you to render different UI elements based on certain conditions. This can be achieved using JavaScript conditional operators like if-else or ternary operators.",
    },
    {
      slide_title: "React Router",
      content:
        "React Router is a library used to enable routing in a React application. It allows you to create dynamic routing and navigate between different components/pages.",
    },
    {
      slide_title: "Conclusion",
      content:
        "React is a powerful library for building scalable and maintainable user interfaces. Its component-based architecture, along with tools like hooks and routing, makes it an essential tool for modern web development.",
    },
  ],
};

const SlideVideoMerger = () => {
  const [ffmpeg] = useState(() => new FFmpeg());
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateSlides = async () => {
      const imageFiles = await Promise.all(
        react_presentation.slides.map(async (slide, index) => {
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = 1280; // Width of the slide
          canvas.height = 720; // Height of the slide

          // Draw background
          context.fillStyle = "white";
          context.fillRect(0, 0, canvas.width, canvas.height);

          // Set text properties
          context.fillStyle = "darkslategray"; // Text color
          context.font = "bold 40px Arial";
          context.textAlign = "left";
          context.fillText(slide.slide_title, 50, 100); // Draw slide title
          context.font = "30px Arial";
          context.fillText(slide.content, 50, 200); // Draw content

          return new Promise((resolve) => {
            canvas.toBlob((blob) => {
              const file = new File([blob], `slide-${index + 1}.png`, {
                type: "image/png",
              });
              resolve(file);
            });
          });
        })
      );

      setLoading(true);
      setError(null);

      try {
        console.log("Loading FFmpeg...");
        await ffmpeg.load({ coreURL, wasmURL }); // Load FFmpeg
        console.log("FFmpeg loaded successfully.");

        // Clear existing files (optional)
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const data = await fetchFile(file);
          console.log(`Writing file: ${file.name}`);
          await ffmpeg.writeFile(file.name, new Uint8Array(data));
        }
        console.log("Images written.");

        // Create a file list for FFmpeg
        const fileListContent = imageFiles
          .map((file) => `file '${file.name}'`)
          .join("\n");
        console.log("File list content:", fileListContent); // Log file list content
        await ffmpeg.writeFile(
          "fileList.txt",
          new TextEncoder().encode(fileListContent)
        );

        // Merge images into a video with 1 frame every 3 seconds
        await ffmpeg.exec([
          "-framerate", "1/3", // 1 frame every 3 seconds
          "-f", "concat",
          "-safe", "0",
          "-i", "fileList.txt",
          "-c:v", "libx264",
          "-pix_fmt", "yuv420p",
          "output.mp4",
        ]);
        console.log("Slides merged into video.");

        // Read the output file
        const outputData = await ffmpeg.readFile("output.mp4");
        const videoBlob = new Blob([outputData.buffer], { type: "video/mp4" });
        const url = URL.createObjectURL(videoBlob);

        setVideoUrl(url); // Set the video URL for rendering
      } catch (err) {
        setError("An error occurred while generating the video.");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    generateSlides();
  }, [ffmpeg]);

  return (
    <div className="video-merger">
      <h1>Slide Video Generator</h1>
      {loading && <p>Generating video...</p>}
      {error && <p className="error">{error}</p>}
      {videoUrl && (
        <div className="video-container">
          <video
            controls
            src={videoUrl}
            style={{ width: "100%", maxHeight: "500px" }}
          ></video>
        </div>
      )}
    </div>
  );
};

export default SlideVideoMerger;
