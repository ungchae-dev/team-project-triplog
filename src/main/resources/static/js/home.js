document.addEventListener('DOMContentLoaded', () => {
    const titleEl = document.getElementById('page-title');
    const contentEl = document.getElementById('right-content');
    const listBtn = document.getElementById('list-btn');

    if (listBtn) {
        listBtn.addEventListener('click', () => {
            // '주크박스' 탭을 강제로 실행
            const jukeboxTab = document.querySelector('.tab-btn[data-page="jukebox"]');
            if (jukeboxTab) {
                jukeboxTab.click();
            }
        });
    }

    // 각 페이지별 제목과 내용 (필요에 따라 수정)
    const mainTitles = {
        home: "홈",
        shop: "상점",
        profile: "프로필",
        post: "게시판",
        jukebox: "주크박스",
        mylog: "마이로그",
        guestbook: "방명록"
    };

    const mainPages = {
        home: `
    <div class="top-sections">
      <div class="section">
        <div class="section-title">방명록</div>
        <ul>
          <li>nick1: 오늘도 힘내세요!</li>
          <li>nick2: 멋진 여행이네요~</li>
          <li>nick3: 잘 보고 갑니다 :)</li>
        </ul>
      </div>
      <div class="section">
        <div class="section-title">이웃 최신글</div>
        <ul>
          <li><strong>alice</strong> 제주도 여행 기록!</li>
          <li><strong>bob</strong> 맛집 추천</li>
          <li><strong>carol</strong> 새 사진 올렸어요!</li>
        </ul>
      </div>
    </div>

    <div class="photo-section section">
      <div class="section-title">대표 사진 & 제목</div>
      <div class="photos">
        <div class="photo-card">
          <div class="photo"><img src="https://via.placeholder.com/110x90?text=Trip1" alt="사진1" /></div>
          <div class="caption">벚꽃길 따라</div>
        </div>
        <div class="photo-card">
          <div class="photo"><img src="https://via.placeholder.com/110x90?text=Trip2" alt="사진2" /></div>
          <div class="caption">야경 명소</div>
        </div>
        <div class="photo-card">
          <div class="photo"><img src="https://via.placeholder.com/110x90?text=Trip3" alt="사진3" /></div>
          <div class="caption">해변 산책</div>
        </div>
      </div>
    </div>
  `,
        shop: `<div class="shop-inner-tab-list">
             <button id="btn-emoticon" class="shop-inner-tab active">이모티콘</button>
             <button id="btn-music" class="shop-inner-tab">음악</button>
           </div>
           <div class="shop-section-row">
             <div class="shop-section-box" style="width:100%">
               <div class="emoticon-list" id="emoticon-list"></div>
               <div class="pagination" id="emoticon-pagination" style="display:none"></div>
             </div>
           </div>
           <div class="shop-section-row">
             <div class="shop-section-box" style="width:100%">
               <div class="music-list" id="music-list"></div>
               <div class="pagination" id="music-pagination" style="display:none"></div>
             </div>
           </div>`,

        profile: () => {
            setTimeout(() => { setupProfileSectionEvents(); }, 0);
            return `
      <div class="profile-container">
        <div class="profile-summary">
          <div class="profile-photo">
            <img id="profile-img" src="https://via.placeholder.com/120" alt="프로필 사진">
          </div>
          <div class="profile-meta">
            <div id="profile-nickname" class="nickname"><strong>예시닉</strong></div>
            <div id="profile-joindate" class="joindate">가입일: 05월 11일</div>
            <div id="profile-bio" class="bio">안녕하세요! 여행을 사랑하는 사람입니다.</div>
          </div>
        </div>
        <div class="profile-tab-nav">
          <button id="tab-btn-info" class="profile-tab-btn active">개인정보</button>
          <button id="tab-btn-inventory" class="profile-tab-btn">보유내역</button>
          <button id="tab-btn-photo" class="profile-tab-btn">사진변경</button>
        </div>
        <div class="profile-content">
          <div id="tab-info" class="tab-pane">
            <label>닉네임: <input type="text" id="nickname-input" value="예시닉"></label>
            <div>가입일: <span id="input-joindate">05월 11일</span></div>
            <label>자기소개:<br>
              <textarea id="bio-input" rows="3">안녕하세요! 여행을 사랑하는 사람입니다.</textarea>
            </label>
            <button id="save-profile-btn">저장</button>
          </div>
          <div id="tab-inventory" class="tab-pane hidden">
            <p><strong>내 도토리</strong>: <span class="highlight">128개</span></p>
            <p><strong>스킨</strong>: <a href="#">보기</a></p>
            <p><strong>보유 이모티콘</strong>: 😀 😎</p>
            <p><strong>보유 음악</strong>: 2곡</p>
          </div>
          <div id="tab-photo" class="tab-pane hidden">
            <input type="file" id="photo-input" accept="image/*">
            <button id="apply-photo-btn">사진 적용</button>
          </div>
        </div>
      </div>
    `;
        },




        post: () => {
        setTimeout(() => {
            if (typeof activatePostUI === 'function') {
                activatePostUI();
            }
        }, 0);
        return renderPostPage();
    }
        ,
        jukebox:  () =>{
            setTimeout(() => {
                if (typeof setupJukebox === 'function') {
                    setupJukebox();
                }
            }, 0);
            return
        },
        // ✅ jukebox.js에 정의된 함수 사용
        mylog: () => {
            setTimeout(() => {
                if (typeof setupMylog === 'function') {
                    setupMylog(); // 마커 렌더링 함수 호출
                }
            }, 0);

            return `
    <div class="mylog-container">
      <h2>📍 나의 여행 기록</h2>
      <div class="region-filter">
        <label for="region-select">지역 선택:</label>
        <select id="region-select">
          <option value="서울">서울</option>
          <option value="부산">부산</option>
          <option value="제주">제주</option>
        </select>
      </div>
      <div class="map-area" id="map-area"></div>
    </div>
  `;
        }
        ,
        guestbook: () => {
            setTimeout(() => {
                if (typeof setupGuestbook === 'function') {
                    setupGuestbook();
                }
            }, 0);
            return `
    <div class="guestbook-container">
      <h2>📘 방명록</h2>
      <ul id="guestbook-list" class="guestbook-list"></ul>
      <div class="pagination" id="guestbook-pagination"></div>
      <div class="guestbook-form">
        <input type="text" id="guestbook-topic" placeholder="~주제를 주제로~" />
        <textarea id="guestbook-content" placeholder="방명록을 남겨보세요!"></textarea>
        <label><input type="checkbox" id="guestbook-private" /> 비밀로 하기</label>
        <button id="guestbook-submit">등록</button>
      </div>
    </div>
  `;
        }

    };

    // 탭 버튼 이벤트 설정
    document.querySelectorAll('.tab-nav .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // 현재 활성화된 탭 버튼 active 클래스 제거
            document.querySelector('.tab-nav .tab-btn.active').classList.remove('active');
            // 클릭한 탭 버튼에 active 클래스 추가
            btn.classList.add('active');

            const page = btn.dataset.page;

            // 제목 변경
            if (mainTitles[page]) {
                titleEl.textContent = mainTitles[page];
            }

            // 콘텐츠 영역 완전 교체
            if (mainPages[page]) {
              content = typeof mainPages[page] === 'function'
                    ? mainPages[page]()   // ✅ 함수면 실행 결과 사용
                    : mainPages[page];    // 문자열이면 그대로

                contentEl.innerHTML = content;

                if (page === 'jukebox') {
                    setupJukeboxEvents();
                    renderTracks();
                    renderPagination();
                }

            }

            // 상점 탭이면 상점 내부 아이템 렌더링 함수 호출
            if (page === 'shop') {
                setupShopInnerTabs();
            }
        });
    });

    // 상점 탭 내부 이모티콘/음악 아이템 렌더링 함수
    function setupShopInnerTabs() {
        // 임시 데이터
        const emoticons = Array.from({ length: 100 }, (_, i) => ({ emoji: "😀", title: `이모티콘 ${i + 1}` }));
        const musics = Array.from({ length: 100 }, (_, i) => ({
            name: `음악 ${i + 1}`,
            artist: `아티스트 ${i + 1}`,
            cover: "https://via.placeholder.com/100",
            preview: "https://cdns-preview-c.dzcdn.net/stream/c-xxxxx.mp3"
        }));


        // 리스트 렌더 함수
        function renderItems(type, page, expanded) {
            const listId = type === 'emoticon' ? 'emoticon-list' : 'music-list';
            const paginationId = type === 'emoticon' ? 'emoticon-pagination' : 'music-pagination';
            const container = document.getElementById(listId);
            const pagination = document.getElementById(paginationId);
            const data = type === 'emoticon' ? emoticons : musics;
            const itemsPerPage = expanded ? 20 : 5;
            const totalPages = Math.min(10, Math.ceil(data.length / itemsPerPage));
            const start = (page - 1) * itemsPerPage;
            const items = data.slice(start, start + itemsPerPage);

            if (!container || !pagination) return;

            container.className = expanded
                ? (type === 'emoticon' ? 'emoticon-list expanded' : 'music-list expanded')
                : (type === 'emoticon' ? 'emoticon-list' : 'music-list');

            if (type === 'emoticon') {
                container.innerHTML = items.map(item => {
                    return `<div class="emoticon-item">
      ${item.emoji}
      <button class="buy-btn">구매</button>
    </div>`;
                }).join('');
            } else if (type === 'music') {
                container.innerHTML = items.map(item => {
                    const isOwned = ownedTracks.some(track => track.title === item.name);
                    return `<div class="music-item">
      ${item.name}
      <button class="buy-btn"
              onclick='buyTrack(${JSON.stringify(item)})'
              ${isOwned ? 'disabled' : ''}>
        ${isOwned ? '보유중' : '구매'}
      </button>
    </div>`;
                }).join('');
            }


            if (expanded) {
                pagination.style.display = 'flex';
                pagination.innerHTML = '';
                for (let i = 1; i <= totalPages; i++) {
                    const btn = document.createElement('button');
                    btn.textContent = i;
                    if (i === page) btn.classList.add('active');
                    btn.onclick = () => renderItems(type, i, true);
                    pagination.appendChild(btn);
                }
            } else {
                pagination.style.display = 'none';
                pagination.innerHTML = '';
            }
        }

        // 버튼 이벤트 연결
        const btnEmoticon = document.getElementById('btn-emoticon');
        const btnMusic = document.getElementById('btn-music');

        btnEmoticon.onclick = () => {
            btnEmoticon.classList.add('active');
            btnMusic.classList.remove('active');
            renderItems('emoticon', 1, true);

            document.getElementById('emoticon-list').parentElement.style.display = 'block';  // 추가
            document.getElementById('music-list').parentElement.style.display = 'none';
        };

        btnMusic.onclick = () => {
            btnMusic.classList.add('active');
            btnEmoticon.classList.remove('active');
            renderItems('music', 1, true);

            document.getElementById('music-list').parentElement.style.display = 'block';  // 추가
            document.getElementById('emoticon-list').parentElement.style.display = 'none';
        };


        // 초기 렌더링 (5x1 레이아웃)
        renderItems('emoticon', 1, false);
        renderItems('music', 1, false);
    }

    // 초기 페이지 설정 (홈)
    contentEl.innerHTML = mainPages.home;
    titleEl.textContent = mainTitles.home;
});
