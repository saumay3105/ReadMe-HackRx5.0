import VideoCard from "../../components/VideoCard";
import SearchBar from "../../components/SearchBar";
import "./Explore.css";

const Explore = ({ videos }) => {
  return (
    <>
      <SearchBar />
      <div className="video-collection">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </>
  );
};

export default Explore;
