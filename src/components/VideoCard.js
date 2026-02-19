import { useState, useRef, useEffect } from "react";

const VideoCard = ({ video }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [positionClass, setPositionClass] = useState("expand-center");
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const detail = video?.contentDetails?.[0];

  const handlePlayFullscreen = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.requestFullscreen();
      videoRef.current.play();
    }
  };

  const handleMouseEnter = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      if (rect.left < 100) {
        setPositionClass("expand-left");
      } else if (rect.right > screenWidth - 100) {
        setPositionClass("expand-right");
      } else {
        setPositionClass("expand-center");
      }
    }
    setShowPreview(true);
  };

  const handleMouseLeave = () => {
    setShowPreview(false);
  };

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  return (
    <>
      <div
        ref={cardRef}
        className={`videoCard ${showPreview ? `expanded ${positionClass}` : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {!showPreview && (
          <img src={video?.contentImage} alt={video?.contentCollName} />
        )}
        {showPreview && (
          <>
            <video
              ref={videoRef}
              src={detail?.contentUri}
              autoPlay
              muted
              loop
              className="previewVideo"
            />
            <div className="hoverContent">
              <h4>{video?.contentCollName}</h4>
              <div className="hoverActions">
                <button
                  className="playBtn"
                  onClick={handlePlayFullscreen}
                >
                  ▶ Play
                </button>
                <button
                  className="detailsBtn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(true);
                  }}
                >
                  Details
                </button>
              </div>
              <p className="meta">
                {Math.floor(detail?.contentDuration_sec / 60)} min • Video
              </p>
            </div>
          </>
        )}
      </div>
      {showModal && (
        <div
          className={`modalOverlay ${showModal ? "show" : ""}`}
          style={{ pointerEvents: showModal ? "auto" : "none" }}
          onClick={() => setShowModal(false)}
        >

          <div
            className="modalContent"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="closeBtn" onClick={() => setShowModal(false)}>
              ✕
            </span>
            <video
              src={detail?.contentUri}
              controls
              autoPlay
              className="modalVideo"
            />
            <h2>{video?.contentCollName}</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: detail?.detailDescription || video?.description,
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default VideoCard;
