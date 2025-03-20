const API_URL = "https://api.freeapi.app/api/v1/public/youtube/videos";

const videoContainer = document.getElementById("video-container");
const searchInput = document.getElementById("search-input");
const loader = document.getElementById("loader");
const noVideosMessage = document.getElementById("no-video-message");

let videos = [];

async function fetchVideos() {
  try {
    loader.style.display = "block";
    videoContainer.style.display = "none";
    noVideosMessage.style.display = "none";

    const response = await fetch(API_URL);
    const data = await response.json();

    console.log("API Response:", data);

    if (data.statusCode === 200 && data.data && Array.isArray(data.data.data)) {
      videos = data.data.data.map((item) => {
        if (!item.items || !item.items.snippet || !item.items.id) return null;
        return {
          id: item.items.id,
          title: item.items.snippet.title,
          channel: item.items.snippet.channelTitle,
          thumbnail: item.items.snippet.thumbnails.high.url,
          url: `https://www.youtube.com/watch?v=${item.items.id}`,
          views: item.items.statistics?.viewCount || "N/A",
          likes: item.items.statistics?.likeCount || "N/A",
          comments: item.items.statistics?.commentCount || "N/A",
          duration: parseDuration(item.items.contentDetails?.duration || ""),
          uploadYear: new Date(item.items.snippet.publishedAt).getFullYear(),
        };
      }).filter(video => video !== null);

      displayVideos(videos);
    } else {
      throw new Error("Invalid API response format");
    }
  } catch (error) {
    console.error("Error fetching videos:", error);
    videoContainer.innerHTML = `<p class="no-videos">Something went wrong. Please try again later.</p>`;
  } finally {
    loader.style.display = "none";
    videoContainer.style.display = "grid";
  }
}


function parseDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;

  return hours > 0
    ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    : `${minutes}:${seconds.toString().padStart(2, "0")}`;
}


function displayVideos(videosToDisplay) {
  if (videosToDisplay.length === 0) {
    noVideosMessage.style.display = "block";
    videoContainer.style.display = "none";
    return;
  }

  noVideosMessage.style.display = "none";
  videoContainer.style.display = "grid";

  videoContainer.innerHTML = videosToDisplay.map(video => `
        <div class="video-card" onclick="window.open('${video.url}', '_blank')">
            <img class="thumbnail" src="${video.thumbnail}" alt="${video.title}"> 
            <div class="video-info">
                <h3 class="video-title">${video.title}</h3>
                <p class="channel-name">${video.channel}</p>
                <p class="video-stats">Views: ${video.views} | Likes: ${video.likes} | Year ${video.uploadYear}</p>
            </div>
        </div>
    `).join("");
}


searchInput.addEventListener("input", function () {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm) ||
    video.channel.toLowerCase().includes(searchTerm)
  );
  displayVideos(filteredVideos);
});

fetchVideos();
