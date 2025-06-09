// jukebox.js : 여행 블로그 - 주크박스 페이지 전용 기능

(function() {
    'use strict';
    
    // === 곡 배열(96곡 예시) ===
    const tracks = Array.from({length: 96}, (_, i) => ({
        title: `노래 제목 ${i + 1}`,
        artist: `아티스트 ${i + 1}`
    }));

    const tracksPerPage = 26; // 1~13, 14~26 (총 26곡이 한 페이지)
    let currentPage = 1;

    // === 트랙 리스트 렌더링 ===
    function renderTrackLists() {
        const leftList = document.getElementById('track-list-left');
        const rightList = document.getElementById('track-list-right');
        
        if (!leftList || !rightList) {
            console.error('주크박스 리스트 요소를 찾을 수 없습니다');
            return;
        }

        // 각 페이지에 보여줄 곡 범위 계산
        const pageStart = (currentPage - 1) * tracksPerPage;
        const pageTracks = tracks.slice(pageStart, pageStart + tracksPerPage);

        // 좌측(1~13)
        leftList.innerHTML = '';
        pageTracks.slice(0, 13).forEach((track, idx) => {
            const li = document.createElement('li');
            li.textContent = `${pageStart + idx + 1}. ${track.title} - ${track.artist}`;
            leftList.appendChild(li);
        });

        // 우측(14~26)
        rightList.innerHTML = '';
        pageTracks.slice(13, 26).forEach((track, idx) => {
            const li = document.createElement('li');
            li.textContent = `${pageStart + idx + 14}. ${track.title} - ${track.artist}`;
            rightList.appendChild(li);
        });

        // 스크롤 상단으로
        if (leftList.parentElement) leftList.parentElement.scrollTop = 0;
        if (rightList.parentElement) rightList.parentElement.scrollTop = 0;
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
    window.loadBlogSkin = loadBlogSkin;

    // === 스킨 로드 함수 끝 ===

    // === 페이지 로드 시 초기화 ===
    document.addEventListener('DOMContentLoaded', initJukeboxPage);

})();