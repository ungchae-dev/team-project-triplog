// ✅ 주크박스 Deezer API 적용 버전

let ownedTracks = [];
let currentPage = 1;
const TRACKS_PER_PAGE = 32;
const MAX_PAGES = 10;

function renderJukeboxPage() {
    const savedTracks = localStorage.getItem("ownedTracks");
    if (savedTracks) {
        ownedTracks = JSON.parse(savedTracks);
    }

    const html = `
    <div id="jukebox-content" class="jukebox-content"></div>
    <div id="pagination" class="jukebox-pagination"></div>
    <div id="search-box">
      <input type="text" id="search-input" placeholder="곡 검색...">
      <button id="search-btn">검색</button>
    </div>
    <audio controls id="audio-player" style="width:100%; margin-top: 20px;"></audio>
  `;

    setTimeout(() => {
        setupJukeboxEvents();
        renderTracks();
        renderPagination();
    }, 0);

    return html;
}

function setupJukeboxEvents() {
    const searchBtn = document.getElementById("search-btn");
    if (searchBtn) {
        searchBtn.onclick = async () => {
            const query = document.getElementById("search-input").value.trim();
            if (!query) return;
            const results = await searchMusicFromDeezer(query);
            ownedTracks = results;
            currentPage = 1;
            renderTracks();
            renderPagination();
        };
    }
}

async function searchMusicFromDeezer(query) {
    try {
        const res = await fetch(`https://deezerdevs-deezer.p.rapidapi.com/search?q=${encodeURIComponent(query)}`, {
            method: "GET",
            headers: {
                "X-RapidAPI-Key": "f705a4641cmsh9f05c6eba5db2afp1418ddjsna6ab2254910f", // 🔐 여기에 본인 API 키 넣기
                "X-RapidAPI-Host": "deezerdevs-deezer.p.rapidapi.com"
            }
        });
        const data = await res.json();
        return data.data.map(track => ({
            title: track.title,
            artist: track.artist.name,
            cover: track.album.cover_medium,
            preview: track.preview
        }));
    } catch (err) {
        console.error("Deezer 검색 오류:", err);
        return [];
    }
}

function renderTracks() {
    const content = document.getElementById("jukebox-content");
    if (!content) return;

    content.innerHTML = '';

    if (ownedTracks.length === 0) {
        content.innerHTML = `<div class="alert-full">보유한 곡이 없습니다. 상점에서 구매해보세요!</div>`;
        return;
    }

    const start = (currentPage - 1) * TRACKS_PER_PAGE;
    const end = Math.min(start + TRACKS_PER_PAGE, ownedTracks.length);
    const current = ownedTracks.slice(start, end);

    const grid = document.createElement("div");
    grid.className = "track-list-grid";

    const left = document.createElement("div");
    left.className = "track-col";
    const right = document.createElement("div");
    right.className = "track-col";

    current.slice(0, 16).forEach((track, i) => left.appendChild(makeTrackItem(track, i + 1)));
    current.slice(16, 32).forEach((track, i) => right.appendChild(makeTrackItem(track, i + 17)));

    grid.appendChild(left);
    grid.appendChild(right);
    content.appendChild(grid);
}


function renderPagination() {
    const pageWrap = document.getElementById("pagination");
    if (!pageWrap) return;
    pageWrap.innerHTML = "";
    const totalPages = Math.ceil(ownedTracks.length / TRACKS_PER_PAGE);
    for (let i = 1; i <= Math.max(1, totalPages); i++) {
        const btn = document.createElement("button");
        btn.className = "pagination-btn" + (i === currentPage ? " active" : "");
        btn.innerText = i;
        btn.onclick = () => {
            currentPage = i;
            renderTracks();
            renderPagination();
        };
        pageWrap.appendChild(btn);
    }
}

function makeTrackItem(track, number) {
    const item = document.createElement("div");
    item.className = "track-item";
    item.innerHTML = `
    <img src="${track.cover}" class="track-cover">
    <span class="track-number">${number}.</span>
    <span class="track-title">${track.title}</span>
    <span class="track-artist">${track.artist}</span>
  `;
    item.onclick = () => {
        const audio = document.getElementById("audio-player");
        if (audio && track.preview) {
            audio.src = track.preview;
            audio.play();
        }
    };
    return item;
}
