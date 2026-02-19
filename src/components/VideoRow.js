import VideoCard from "./VideoCard";

const VideoRow = ({ videos }) => {
  return (
    <div className="row">
      <div className="videoGrid">
        {videos?.map((v) => (
          <VideoCard key={v.uid} video={v} />
        ))}
      </div>
    </div>
  );
};

export default VideoRow;
