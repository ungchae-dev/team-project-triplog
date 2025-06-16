// jukebox.js : 여행 블로그 - 주크박스 페이지 전용 기능

(function() {
    'use strict';
    
    // === 곡 배열 ===
    const tracks = [];

    const tracksPerPage = 10; // 페이지당 곡 수
    let currentPage = 1;

    // === 트랙 리스트 렌더링 ===
 function renderTrackLists() {
    const leftList = document.getElementById('track-list-left');
    const rightInfo = document.getElementById('track-info-right'); // 변경됨

    if (!leftList || !rightInfo) {
        console.error('주크박스 리스트 요소를 찾을 수 없습니다');
        return;
    }

    const pageStart = (currentPage - 1) * tracksPerPage;
    const pageTracks = tracks.slice(pageStart, pageStart + tracksPerPage);

    // 현재 재생 중인 곡
    const currentTrack = window.getCurrentlyPlayingTrack?.();

    // 좌측 리스트 초기화
    leftList.innerHTML = '';

    // 1. 현재 곡이 있으면 가장 위에 고정 + 스타일 강조
    if (currentTrack) {
        const li = document.createElement('li');
        li.innerHTML = `🎵 ${currentTrack.title} - ${currentTrack.artist}`;
        li.classList.add('now-playing-highlight');
        li.addEventListener('click', () => {
            renderNowPlaying(currentTrack);
        });
        leftList.appendChild(li);
    }

    // 2. 나머지 곡들 표시 (중복 제거: 현재곡 제외)
    pageTracks.slice(0, 13).forEach((track, idx) => {
        // 현재곡은 건너뜀
        if (currentTrack && track.title === currentTrack.title && track.artist === currentTrack.artist) return;

        const li = document.createElement('li');
        li.textContent = `${pageStart + idx + 1}. ${track.title} - ${track.artist}`;
        li.addEventListener('click', () => {
            renderNowPlaying(track);
        });
        leftList.appendChild(li);
    });

    // 우측 정보: 현재 재생 곡 우선 표시
    renderNowPlaying(currentTrack || pageTracks[0]);
}

function renderNowPlaying(track) {
    const rightInfo = document.getElementById('track-info-right');
    if (!rightInfo) return;

     if (!track) {
        rightInfo.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999; word-break: keep-all;">
                🎧 현재 보유한 음악이 없습니다.
                <br><a href="/blog/@${getCurrentNickname()}/shop" style="color: #ff8888; text-decoration: underline;">
                    상점에서 음악을 구매해보세요!
                </a>
            </div>
        `;
        return;
    }

      rightInfo.innerHTML = `
    <div class="now-playing-container">
      <div class="now-playing-label">🎶 현재 재생 중인 음악</div>
      <img src="${track.album}" alt="앨범 커버" class="now-playing-album">
      <div class="now-playing-title">🎧 ${track.title}</div>
      <div class="now-playing-artist">👤 ${track.artist}</div>
    </div>
  `;
}

async function loadOwnerMusic() {
    const nickname = getCurrentNickname();
    const res = await fetch(`/api/music/owned/${nickname}`);
    const data = await res.json();
    tracks.length = 0;
    tracks.push(...data);
    renderTrackLists();
    renderPagination();
}

    // === 페이지네이션 렌더링 ===
    function renderPagination() {
        const pagDiv = document.getElementById('pagination');
        if (!pagDiv) return;

        const totalPages = Math.ceil(tracks.length / tracksPerPage);
        pagDiv.innerHTML = '';

        // 이전 버튼
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '이전';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderTrackLists();
                renderPagination();
            }
        };
        pagDiv.appendChild(prevBtn);

        // 페이지 버튼
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            if (i === currentPage) btn.classList.add('active');
            btn.onclick = () => {
                currentPage = i;
                renderTrackLists();
                renderPagination();
            };
            pagDiv.appendChild(btn);
        }

        // 다음 버튼
        const nextBtn = document.createElement('button');
        nextBtn.textContent = '다음';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderTrackLists();
                renderPagination();
            }
        };
        pagDiv.appendChild(nextBtn);
    }

    // === 주크박스 페이지 초기화 ===
    function initJukeboxPage() {
        console.log('주크박스 페이지 초기화 시작');
        renderTrackLists();
        loadOwnerMusic();
        renderPagination();

        // 공통 스킨 로드
        if (typeof window.maintainDefaultSkinForInactiveUsers === 'function') {
            window.maintainDefaultSkinForInactiveUsers();
        }

        console.log('주크박스 페이지 초기화 완료');
    }

    // === 스킨 로드 함수 시작 ===
    async function loadBlogSkin() {
        const currentNickname = getCurrentNickname();
        if (!currentNickname) return;

        try {
            const encodedNickname = encodeURIComponent(currentNickname);
            const response = await fetch(`/blog/api/@${encodedNickname}/skin`);

            if (response.ok) {
                const skinData = await response.json();
                console.log('주크박스 페이지 스킨 데이터:', skinData);

                if (skinData.skinActive === 'Y' && skinData.skinImage) {
                    applySkin(skinData.skinImage);
                }  else {
                    console.log('스킨이 비활성화되어 있음 - layout.js가 기본 스킨 처리');
                }
            } else {
                console.log('스킨 정보를 가져올 수 없습니다:', response.status);
            }
        } catch (error) {
            console.error('스킨 로드 중 오류:', error);
        }
    }

    function getCurrentNickname() {
        const currentPath = window.location.pathname;
        const match = currentPath.match(/^\/blog\/@([^\/]+)/);
        return match ? decodeURIComponent(match[1]) : null;
    }

    function applySkin(skinImageUrl) {
        const frame = document.querySelector('.frame');
        if (frame && skinImageUrl) {
            const img = new Image();
            img.onload = () => {
                frame.style.backgroundImage = `url(${skinImageUrl})`;
                frame.classList.add('has-skin');
                console.log('주크박스 페이지 스킨 적용 완료:', skinImageUrl);
            };
            img.src = skinImageUrl;
        }
    }

    function removeSkin() {
        const frame = document.querySelector('.frame');
        if (frame) {
            frame.style.backgroundImage = '';
            frame.classList.remove('has-skin');
            console.log('주크박스 페이지 스킨 제거 완료');
        }
    }

    // === 전역 함수로 노출 ===
    window.setupJukeboxFeatures = initJukeboxPage;
    window.addEventListener('music:trackChanged', (e) => {
    console.log('🎧 현재 곡이 변경됨:', e.detail);
    renderTrackLists();
    });
    window.loadBlogSkin = loadBlogSkin;

    // === 스킨 로드 함수 끝 ===

    // === 페이지 로드 시 초기화 ===
    document.addEventListener('DOMContentLoaded', initJukeboxPage);

})();