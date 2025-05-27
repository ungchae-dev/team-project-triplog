document.addEventListener('DOMContentLoaded', () => {
    // 데이터 생성 (테스트용 100개)
    const emoticons = Array.from({ length: 100 }, (_, i) => ({
        emoji: "😀",
        title: `이모티콘 ${i + 1}`
    }));
    const musics = Array.from({ length: 100 }, (_, i) => ({
        name: `음악 ${i + 1}`
    }));

    // 요소 캐싱
    const btnEmoticon = document.getElementById('btn-emoticon');
    const btnMusic = document.getElementById('btn-music');
    const btnSkinActivate = document.getElementById('btn-skin-activate');

    const emoticonList = document.getElementById('emoticon-list');
    const musicList = document.getElementById('music-list');

    const shopEmoticonSection = document.querySelector('.shop-emoticon');
    const shopMusicSection = document.querySelector('.shop-music');

    const emoticonPagination = document.getElementById('emoticon-pagination');
    const musicPagination = document.getElementById('music-pagination');

    let currentMode = 'both'; // 'both', 'emoticon', 'music'
    let emoticonPage = 1;
    let musicPage = 1;
    const itemsPerPage = 20;

    // 페이지네이션 생성 함수
    function createPagination(container, totalPages, currentPage, onPageChange) {
        container.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            if (i === currentPage) btn.classList.add('active');
            btn.addEventListener('click', () => onPageChange(i));
            container.appendChild(btn);
        }
    }

    // 이모티콘 렌더링
    function renderEmoticons(page = 1) {
        const startIdx = (page - 1) * itemsPerPage;
        const pageItems = emoticons.slice(startIdx, startIdx + itemsPerPage);
        emoticonList.innerHTML = pageItems
            .map(
                (em) => `
      <div class="emoticon-item" title="${em.title}">
        ${em.emoji}
        <button class="buy-btn">구매</button>
      </div>`
            )
            .join('');
        setupBuyButtons();
    }

    // 음악 렌더링
    function renderMusics(page = 1) {
        const startIdx = (page - 1) * itemsPerPage;
        const pageItems = musics.slice(startIdx, startIdx + itemsPerPage);
        musicList.innerHTML = pageItems
            .map(
                (mu) => `
      <div class="music-item">
        ${mu.name}
        <button class="buy-btn">구매</button>
      </div>`
            )
            .join('');
        setupBuyButtons();
    }

    // 구매 버튼 이벤트 연결
    function setupBuyButtons() {
        document.querySelectorAll('.buy-btn').forEach((btn) => {
            btn.onclick = () => alert('구매 기능은 준비 중입니다.');
        });
    }

    // 전체 상점 보여주기 (5x1)
    function renderBoth() {
        currentMode = 'both';
        shopEmoticonSection.classList.add('active');
        shopMusicSection.classList.add('active');
        emoticonList.classList.remove('expanded');
        musicList.classList.remove('expanded');
        emoticonPagination.style.display = 'none';
        musicPagination.style.display = 'none';

        emoticonList.style.gridTemplateRows = 'auto';
        musicList.style.gridTemplateRows = 'auto';

        emoticonList.innerHTML = emoticons.slice(0, 5)
            .map(em => `<div class="emoticon-item" title="${em.title}">${em.emoji}<button class="buy-btn">구매</button></div>`)
            .join('');
        musicList.innerHTML = musics.slice(0, 5)
            .map(mu => `<div class="music-item">${mu.name} <button class="buy-btn">구매</button></div>`)
            .join('');
        setupBuyButtons();
    }

    // 이모티콘만 보기 (5x4)
    function renderEmoticonOnly() {
        currentMode = 'emoticon';
        shopEmoticonSection.classList.add('active');
        shopMusicSection.classList.remove('active');
        emoticonList.classList.add('expanded');
        emoticonPagination.style.display = 'flex';
        musicPagination.style.display = 'none';
        onEmoticonPageChange(emoticonPage);
    }

    // 음악만 보기 (5x4)
    function renderMusicOnly() {
        currentMode = 'music';
        shopEmoticonSection.classList.remove('active');
        shopMusicSection.classList.add('active');
        musicList.classList.add('expanded');
        musicPagination.style.display = 'flex';
        emoticonPagination.style.display = 'none';
        onMusicPageChange(musicPage);
    }

    // 페이지 변경 핸들러
    function onEmoticonPageChange(page) {
        emoticonPage = page;
        renderEmoticons(page);
        createPagination(
            emoticonPagination,
            Math.min(10, Math.ceil(emoticons.length / itemsPerPage)),
            page,
            onEmoticonPageChange
        );
    }
    function onMusicPageChange(page) {
        musicPage = page;
        renderMusics(page);
        createPagination(
            musicPagination,
            Math.min(10, Math.ceil(musics.length / itemsPerPage)),
            page,
            onMusicPageChange
        );
    }

    // 버튼 클릭 이벤트 바인딩
    btnEmoticon.onclick = () => {
        btnEmoticon.classList.add('active');
        btnMusic.classList.remove('active');
        btnSkinActivate.classList.remove('active');
        renderEmoticonOnly();
    };

    btnMusic.onclick = () => {
        btnMusic.classList.add('active');
        btnEmoticon.classList.remove('active');
        btnSkinActivate.classList.remove('active');
        renderMusicOnly();
    };

    btnSkinActivate.onclick = () => {
        btnSkinActivate.classList.add('active');
        btnEmoticon.classList.remove('active');
        btnMusic.classList.remove('active');
        if (
            confirm(
                "스킨 활성화를 구매하시겠습니까?\n(구매 후 버튼은 영구적으로 사라집니다.)"
            )
        ) {
            btnSkinActivate.style.display = "none";
            alert("스킨이 활성화되었습니다.");
        } else {
            btnSkinActivate.classList.remove("active");
        }
    };

    // 초기 화면 렌더링
    renderBoth();
});
