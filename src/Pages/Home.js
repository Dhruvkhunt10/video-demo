import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import VideoRow from "../components/VideoRow";

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

const Home = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [userPersonlizationvideo, setUserPersonlizationvideo] = useState([]);
  const [tags, setTags] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [token, setToken] = useState(null);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [loadingUserPersonlizationVideos, setLoadingUserPersonlizationVideos] = useState(false);

  const renewToken = async (loginToken, refreshToken) => {
    try {
      const formData = new FormData();
      formData.append("token", encodeURIComponent(refreshToken));
      const res = await axios.post(
        `https://api.klimatenet.io/api/v1/user/token/renew`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${loginToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data;
    } catch {
      return null;
    }
  };

  const getValidToken = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.token) return null;
    const decodedJwt = parseJwt(user.token);
    const now = Math.floor(Date.now() / 1000);
    if (decodedJwt?.exp <= now + 120) {
      const newTokens = await renewToken(user.token, user.refreshToken);
      if (newTokens?.result?.token) {
        const updatedUser = {
          ...user,
          token: newTokens.result.token.token,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser.token;
      } else {
        localStorage.removeItem("user");
        return null;
      }
    }
    return user.token;
  };

  const getVideo = async (token, tagUids = []) => {
    try {
      setLoadingVideos(true);
      const res = await axios.post(
        "https://api.klimatenet.io/api/v1/content/filter",
        { contentTagUids: tagUids },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setVideos(res?.data?.result || []);
    } catch (err) {
      console.error(err);
      setVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  };

  const userPersonlization = async (token) => {
    try {
      setLoadingUserPersonlizationVideos(true);
      const res = await axios.get(
        "https://api.klimatenet.io/api/v1/user-personalization/UserPersonlization",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserPersonlizationvideo(res?.data?.result?.map((item) => item?.up_content)?.flat())
    } catch (err) {
      console.error(err);
      setVideos([]);
    } finally {
      setLoadingUserPersonlizationVideos(false);
    }
  };

  const getTags = async (token) => {
    try {
      const res = await axios.get(
        "https://api.klimatenet.io/api/v1/tags",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTags(res?.data?.result || []);
    } catch (err) {
      console.error(err);
    } finally {
    }
  };

  const toggleTag = (uid) => {
    setSelectedTags((prev) =>
      prev.includes(uid)
        ? prev.filter((t) => t !== uid)
        : [...prev, uid]
    );
  };

  const applyFilter = () => {
    setDrawerOpen(false);
    getVideo(token, selectedTags);
  };

  const clearFilter = () => {
    setSelectedTags([]);
    setDrawerOpen(false);
    getVideo(token, []);
  };

  useEffect(() => {
    const init = async () => {
      const t = await getValidToken();
      if (!t) return navigate("/login");
      setToken(t);
      getVideo(t);
      getTags(t);
      userPersonlization(t)
    };
    init();
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [drawerOpen]);

  return (
    <div className="home">
      <Header />
      <h2 style={{ margin: "20px 0px 0px 20px" }}>Featured Videos</h2>
      {loadingUserPersonlizationVideos ? (
        <div className="loader">Loading videos...</div>
      ) : userPersonlizationvideo?.up_content === 0 ? (
        <div className="noData">No videos found</div>
      ) : (
        <VideoRow isFeatured videos={userPersonlizationvideo} />
      )}
      <div className="filterBar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: "0px 0px 0px 20px" }}>All Videos</h2>
        <button className="filterBtn" onClick={() => setDrawerOpen(true)}>
          Filter
          {selectedTags.length > 0 && <span className="filterDot" />}
        </button>
      </div>
      {loadingVideos ? (
        <div className="loader">Loading videos...</div>
      ) : videos.length === 0 ? (
        <div className="noData">No videos found</div>
      ) : (
        <VideoRow videos={videos} />
      )}
      <div className={`drawerOverlay ${drawerOpen ? "open" : ""}`}>
        <div className="drawer">
          <div className="drawerHeader">
            <h3>Filter by Tags</h3>
            <span
              className="closeBtnDrawer"
              onClick={() => setDrawerOpen(false)}
            >
              ✕
            </span>
          </div>
          <div className="tagList">
            {tags.map((tag) => (
              <div
                key={tag.uid}
                className={`tagItem ${selectedTags.includes(tag.uid) ? "selected" : ""
                  }`}
                onClick={() => toggleTag(tag.uid)}
              >
                {tag.name}
              </div>
            ))}
          </div>
          <div className="drawerFooter">
            <button className="clearBtn" onClick={clearFilter}>
              Clear
            </button>
            <button className="applyBtn" onClick={applyFilter}>
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
