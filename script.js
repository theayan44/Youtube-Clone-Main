const API_KEY = "AIzaSyCe5SjkdrnTsashxs7m6Onapx2hIYjgzpE";
//  AIzaSyDa10bzkEkDWGOq8eDED9o8bp-zLK5WxX8   AIzaSyBBcS3HWwHT3FjEigMBYuLHWMMy1q--lTA  AIzaSyCe5SjkdrnTsashxs7m6Onapx2hIYjgzpE
const BASE_URL = "https://www.googleapis.com/youtube/v3";

//type of details while fetching video details
const STATISTICS = "statistics"; // this will give like_count, comment_count etc.
const CONTENT_DETAILS = "contentDetails"; // this will give duration, hd or not etc.
const SNIPPET = "snippet";// this will give main details

const videosDiv = document.getElementsByClassName("videos")[0];
const searchInput = document.getElementById("search-input");
const searchIcon = document.getElementById("search-icon");
let searchQuery = "";

if (localStorage.getItem("searchQuery") == null)
    searchVideos("cricket", 24);
else
    searchVideos(localStorage.getItem("searchQuery"), 24);


// Window.onLoad = searchVideos("cricket", 24);


searchInput.addEventListener("keyup", (e) => {
    e.preventDefault();
    e.stopPropagation();
    searchQuery = e.target.value;
});

searchIcon.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (searchQuery.trim().length > 0) {
        localStorage.setItem("searchQuery", searchQuery);
        location.href = "index.html";
        // await searchVideos(searchQuery, 24);        
    }
})

async function searchVideos(searchValue = "trending", maxResults = 12) {
    localStorage.removeItem("searchQuery");
    searchInput.value = "";
    searchQuery = "";
    try {
        const response = await fetch(
            BASE_URL +
            "/search" +
            `?key=${API_KEY}` +
            `&q=${searchValue}` +
            "&part=snippet" +
            `&maxResults=${maxResults}` +
            "&type=video"
        );
        const data = await response.json();
        if (maxResults != 5)
            showVideo(data.items);
        else
            return data.items;
    } catch (error) {
        console.log(error);
    }
}

async function showVideo(videos) {
    videosDiv.innerHTML = "";
    for (let i = 0; i < videos.length; i++) {
        const channelDetails = await getChannelDetails(videos[i].snippet.channelId, SNIPPET);
        const videoStats = await getVideoStats(videos[i].id.videoId, STATISTICS);
        const singleVideo = document.createElement("div");
        singleVideo.setAttribute("class", "single-video");
        singleVideo.setAttribute("onclick", `playVideo("${videos[i].id.videoId}")`);
        singleVideo.innerHTML = `
            <img class="thumbnail-image" src="${videos[i].snippet.thumbnails.default.url}" alt="thumbnail-image">
            <div class="video-details">
                <img class="channel-logo" src=${channelDetails.items[0].snippet.thumbnails.default.url} alt="channel-logo">
                <div>
                    <p class="video-title" >${videos[i].snippet.title}</p>
                    <p class="channel-name">${videos[i].snippet.channelTitle}</p>
                    <p class="video-stats">${getViewCount(videoStats.items[0].statistics.viewCount)} Views. ${getPublishTime(videos[i].snippet.publishedAt)} ago</p>
                </div>
            </div>
        `;

        videosDiv.appendChild(singleVideo);
    }
}

async function getChannelDetails(channelId, type_of_details) {
    try {
        const response = await fetch(
            BASE_URL +
            "/channels" +
            `?key=${API_KEY}` +
            `&part=${type_of_details}` +
            `&id=${channelId}`
        );
        const channelDetails = await response.json();
        return channelDetails;
    } catch (error) {
        console.log(error);
    }
}

async function getVideoStats(videoId, type_of_details) {
    try {
        const response = await fetch(
            BASE_URL +
            "/videos" +
            `?key=${API_KEY}` +
            `&part=${type_of_details}` +
            `&id=${videoId}`
        );
        const videoStats = await response.json();
        return videoStats;
    } catch (error) {
        console.log(error);
    }
}

function getViewCount(viewCount) {
    if (viewCount > 1000000000)
        return `${Math.trunc(viewCount / 1000000000)}B`;
    else if (viewCount >= 1000000)
        return `${Math.trunc(viewCount / 1000000)}M`;
    else if (viewCount >= 1000)
        return `${Math.trunc(viewCount / 1000)}K`;
    else
        return viewCount;
}

function getPublishTime(publishTime) {
    let present_date = new Date();
    let publishDate = new Date(publishTime);
    let milisecs = present_date.getTime() - publishDate.getTime();
    let days = Math.round(milisecs / (1000 * 3600 * 24));
    if (days == 0) {
        let secs = Math.round(milisecs / 1000);
        if (secs >= 3600)
            return `${Math.trunc(secs / 3600)} hour`;
        else if (secs >= 60)
            return `${Math.trunc(secs / 60)} minute`;
        else
            return `${secs} second`;
    }
    else if (days >= 365)
        return `${Math.trunc(days / 365)} year`;
    else if (days >= 30)
        return `${Math.trunc(days / 30)} month`;
    else if (days >= 7)
        return `${Math.trunc(days / 7)} week`;
    else
        return `${days} day`;
}

function playVideo(videoId) {
    localStorage.setItem("videoId", videoId);
    console.log(videoId);
    window.open("playvideo.html", '_blank');
}






// searchVideos("ICC", 20);
// getVideoStats("jm2r5xzYx-A", STATISTICS);
// getChannelDetails("UCWhlwos9_SzVUbfqlVt7RFQ");

