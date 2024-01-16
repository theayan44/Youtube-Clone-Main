window.addEventListener("load", () => {
    if (YT) {
        const videoId = localStorage.getItem("videoId");
        if (videoId) {
            new YT.Player("video-player", {
                videoId,
            });
            loadContents(videoId);
        }
    }
});


async function loadContents(videoId) {
    const videoDetails = await getVideoStats(videoId, SNIPPET);
    const videoStats = await getVideoStats(videoId, STATISTICS);
    const channelDetails = await getChannelDetails(videoDetails.items[0].snippet.channelId, SNIPPET);
    const subscriberDetails = await getChannelDetails(videoDetails.items[0].snippet.channelId, STATISTICS);

    // console.log(videoDetails, videoStats, channelDetails, subscriberDetails);
    const relatedSuggestions = document.getElementById("related-suggestions");
    relatedSuggestions.innerText = "From " + channelDetails.items[0].snippet.title;

    loadVideoContents(videoDetails, videoStats);
    loadChannelContents(videoDetails, channelDetails, subscriberDetails);
    fetchComments(videoId);
    fetchRelatedVideos(videoDetails, channelDetails);
}


function loadVideoContents(videoDetails, videoStats) {
    const videoContents = document.createElement("div");
    videoContents.setAttribute("class", "video-contents");
    videoContents.innerHTML = `
        <h4>${videoDetails.items[0].snippet.title}</h4>
        <div class="video-statistics">
            <div>
                <span>${videoStats.items[0].statistics.viewCount} views</span>
                <span>${new Date(videoDetails.items[0].snippet.publishedAt).toDateString()}</span>
            </div>
            <div class="like-dislike-icon">
                <span><img src="./images/sidebar-liked-videos-icon.png" alt="likes" class="sidebar-icon"> ${getViewCount(videoStats.items[0].statistics.likeCount)}</span>
                <span><img src="./images/dislike-icon.png" alt="dislikes" class="sidebar-icon">DISLIKE</span>
                <span><img src="./images/share-icon.png" alt="share" class="sidebar-icon">SHARE</span>
                <span><img src="./images/save-icon.png" alt="save" class="sidebar-icon">SAVE</span>
            </div>
        </div>
    `;

    const main_video_details = document.getElementsByClassName("main-video-details")[0];
    main_video_details.appendChild(videoContents);
}

function loadChannelContents(videoDetails, channelDetails, subscriberDetails) {
    const channelContents = document.createElement("div");
    channelContents.setAttribute("class", "channel-contents");
    channelContents.innerHTML = `
        <div class="channel-details">
            <div class="channel-logo-and-name">
                <img class="channel-logo" src=${channelDetails.items[0].snippet.thumbnails.default.url} alt="channel-logo">
                <p>
                    <span>${channelDetails.items[0].snippet.title}</span>
                    <span>${getViewCount(subscriberDetails.items[0].statistics.subscriberCount)} subscribers</span>
                </p>
            </div>
            <button>SUBSCRIBES</button>
        </div>
        <div class="video-description">
            <p id="desccription">${videoDetails.items[0].snippet.description}</p>
            <span id="show-more">SHOW MORE</span>
        </div>
    `;

    const main_video_details = document.getElementsByClassName("main-video-details")[0];
    main_video_details.after(channelContents);

    const showMore = document.getElementById("show-more");
    const videoDescription = document.getElementById("desccription");

    showMore.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.target.innerText == "SHOW MORE") {
            videoDescription.style.height = "fit-content";
            e.target.innerText = "SHOW LESS";
        } else {
            videoDescription.style.height = "55px";
            e.target.innerText = "SHOW MORE";
        }
    })
}

async function fetchComments(videoId) {
    try {
        const response = await fetch(
            BASE_URL +
            "/commentThreads" +
            `?key=${API_KEY}` +
            `&videoId=${videoId}` +
            "&part=snippet" +
            `&maxResults=10`
        );
        const data = await response.json();
        // console.log(data.items);
        loadComments(data.items);
    } catch (error) {
        console.log(error);
    }
}

async function loadComments(data) {
    const comments = document.getElementsByClassName("comments")[0];
    comments.innerHTML = "<h3>Comments</h3>";
    if (!data) {
        const disabled = document.createElement("h4");
        disabled.innerText = "Comments are disabled!"
        comments.appendChild(disabled);
    } else {
        for (let i = 0; i < data.length; i++) {
            const singleComment = document.createElement("div");
            singleComment.setAttribute("class", "single-comment");
            singleComment.innerHTML = `
                <h5>${data[i].snippet.topLevelComment.snippet.authorDisplayName}</h5>
                <p>${data[i].snippet.topLevelComment.snippet.textDisplay}</p>
            `;

            comments.appendChild(singleComment);
        }
    }
}

async function fetchRelatedVideos(videoDetails, channelDetails) {
    let relatedVideos = await searchVideos(channelDetails.items[0].snippet.title, 5);
    relatedVideos = [...relatedVideos, ... await searchVideos(videoDetails.items[0].snippet.title, 5)]
    // console.log(relatedVideos);

    let relatedVideosId = [];
    for (let i = 0; i < relatedVideos.length; i++) {
        relatedVideosId.push(relatedVideos[i].id.videoId);
    }
    showRelatedVideos(relatedVideosId);
}

async function showRelatedVideos(relatedVideosId) {
    const related_videos_div = document.getElementsByClassName("related-videos")[0];
    related_videos_div.innerHTML = "";

    for (let i = 0; i < relatedVideosId.length; i++) {
        const videoDetails = await getVideoStats(relatedVideosId[i], SNIPPET);
        const videoStats = await getVideoStats(relatedVideosId[i], STATISTICS);
        const channelDetails = await getChannelDetails(videoDetails.items[0].snippet.channelId, SNIPPET);
        // if (i == 0) console.log(videoDetails);

        const card = document.createElement("div");
        card.setAttribute("class", "card");
        card.setAttribute("onclick", `playVideo("${relatedVideosId[i]}")`)
        card.innerHTML = `
            <img src=${videoDetails.items[0].snippet.thumbnails.default.url} alt="thumbnail">
            <div class="details">
                <h4>${videoDetails.items[0].snippet.title}</h4>
                <p>${channelDetails.items[0].snippet.title}</p>
                <p>
                    <span>${getViewCount(videoStats.items[0].statistics.viewCount)} views .</span>
                    <span>${getPublishTime(videoDetails.items[0].snippet.publishedAt)} ago</span>
                </p>
            </div>
        `;

        related_videos_div.appendChild(card);
    }
}