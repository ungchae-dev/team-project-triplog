(async function() {
  'use strict';
  
  function getCurrentNickname() {
    const m = window.location.pathname.match(/^\/blog\/@([^\/]+)/);
    return m ? decodeURIComponent(m[1]) : '';
  }
  
  const tracks = [];
  const tracksPerPage = 10;
  let currentPage = 1;

  function renderTrackLists() {
    const leftList = document.getElementById('track-list-left');
    if (!leftList) return;

    const currentTrack = window.getCurrentlyPlayingTrack?.();
    const pageStart   = (currentPage - 1) * tracksPerPage;
    const pageTracks  = tracks.slice(pageStart, pageStart + tracksPerPage);
    const frag        = document.createDocumentFragment();

    if (currentTrack) {
      const li = document.createElement('li');
      li.textContent = `🎵 ${currentTrack.title} - ${currentTrack.artist}`;
      li.classList.add('now-playing-highlight');
      li.onclick = () => renderNowPlaying(currentTrack);
      frag.appendChild(li);
    }

    if (pageTracks.length === 0 && !currentTrack) {
      const emptyLi = document.createElement('li');
      emptyLi.textContent = '🎧 보유한 음악이 없습니다';
      frag.appendChild(emptyLi);
    } else {
      pageTracks.forEach((track, idx) => {
        if (currentTrack
            && track.title  === currentTrack.title
            && track.artist === currentTrack.artist) return;
        const li = document.createElement('li');
        li.textContent = `${pageStart + idx + 1}. ${track.title} - ${track.artist}`;
        li.onclick = () => renderNowPlaying(track);
        frag.appendChild(li);
      });
    }

    leftList.innerHTML = '';
    leftList.appendChild(frag);

    renderNowPlaying(currentTrack || pageTracks[0]);
  }

  window.addEventListener('music:trackChanged', e => {
  console.log('🎧 트랙 변경 감지:', e.detail);
  renderTrackLists();
});

  function renderNowPlaying(track) {
    const rightInfo = document.getElementById('track-info-right');
    if (!rightInfo) return;

    if (!track) {
      rightInfo.innerHTML = `
        <div style="text-align:center; padding:40px; color:#999;">
          🎧 현재 보유한 음악이 없습니다.
          <br><a href="/blog/@${getCurrentNickname()}/shop" style="color:#ff8888; text-decoration:underline;">
            상점에서 음악을 구매해보세요!
          </a>
        </div>`;
      return;
    }

    rightInfo.innerHTML = `
      <div class="now-playing-container">
        <div class="now-playing-label">🎶 현재 재생 중인 음악</div>
        <img src="${track.album}" alt="앨범 커버" class="now-playing-album">
        <div class="now-playing-title">🎧 ${track.title}</div>
        <div class="now-playing-artist">👤 ${track.artist}</div>
      </div>`;
  }

  async function loadOwnerMusic() {
    let data;
    if (window._jukeboxPrefetch) {
      data = window._jukeboxPrefetch;
      console.log('🎧 주크박스: 캐시된 데이터 사용');
    } else {
      const nickname = getCurrentNickname();
      const res = await fetch(`/api/music/owned/${nickname}`);
      data = await res.json();
      console.log('🎧 주크박스: 서버에서 데이터 로드');
    }
    tracks.length = 0;
    tracks.push(...data);
  }

  function renderPagination() {
    const pagDiv    = document.getElementById('pagination');
    if (!pagDiv) return;
    const totalPages = Math.ceil(tracks.length / tracksPerPage);
    pagDiv.innerHTML = '';

    const mkBtn = (txt, disabled, onClick) => {
      const b = document.createElement('button');
      b.textContent = txt;
      b.disabled = disabled;
      b.onclick = onClick;
      return b;
    };

    pagDiv.appendChild(mkBtn('이전', currentPage === 1, () => {
      currentPage--; renderTrackLists(); renderPagination();
    }));

    for (let i = 1; i <= totalPages; i++) {
      const b = mkBtn(i, false, () => {
        currentPage = i; renderTrackLists(); renderPagination();
      });
      if (i === currentPage) b.classList.add('active');
      pagDiv.appendChild(b);
    }

    pagDiv.appendChild(mkBtn('다음', currentPage === totalPages, () => {
      currentPage++; renderTrackLists(); renderPagination();
    }));
  }

  async function loadAndRender() {
    await loadOwnerMusic();
    renderTrackLists();
    renderPagination();
    // 스킨 적용 (layout.js 함수가 있을 때)
    window.maintainDefaultSkinForInactiveUsers?.();
  }

  async function initJukeboxPage() {
    console.log('주크박스 페이지 초기화 시작');
    const leftList = document.getElementById('track-list-left');
    if (leftList) leftList.innerHTML = '<li>로딩 중…</li>';

    // DOM이 그려진 다음에 네트워크+렌더 호출
    requestAnimationFrame(loadAndRender);
  }
 
  window.setupJukeboxFeatures = initJukeboxPage;
  document.addEventListener('DOMContentLoaded', initJukeboxPage);

  // 실시간 트랙 변경 반영(원래 이벤트)
  window.addEventListener('music:trackChanged', e => {
    console.log('🎧 트랙 변경 감지:', e.detail);
    renderTrackLists();
  });

})();
