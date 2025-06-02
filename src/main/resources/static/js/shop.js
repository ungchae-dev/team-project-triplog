// === 샘플 데이터 (임시) ===
const emoticonList = [
    { id: 1, name: "이모티콘 1", icon: "😊", price: 20 },
    { id: 2, name: "이모티콘 2", icon: "😎", price: 25 },
    { id: 3, name: "이모티콘 3", icon: "😂", price: 30 },
    { id: 4, name: "이모티콘 4", icon: "😍", price: 35 },
    { id: 5, name: "이모티콘 5", icon: "🥳", price: 40 },
    { id: 6, name: "이모티콘 6", icon: "😭", price: 50 }
];
const musicList = [
    { id: 1, name: "음악 1", icon: "🎵", price: 50 },
    { id: 2, name: "음악 2", icon: "🎶", price: 50 },
    { id: 3, name: "음악 3", icon: "🎼", price: 50 },
    { id: 4, name: "음악 4", icon: "🎹", price: 50 },
    { id: 5, name: "음악 5", icon: "🎤", price: 50 }
];

let userDotori = 100;       // 현재 유저 도토리 잔액 (임시)
let skinActivated = false;  // 스킨 활성화 여부

const ITEMS_PER_PAGE = 6;   // 페이지당 아이템 수

// === 도토리 표시 갱신 ===
function renderDotori() {
    document.getElementById('point-display').innerText = `도토리: ${userDotori}개`;
}

// === 이모티콘 리스트 렌더링 ===
function renderEmoticonList(page = 1) {
    const listElem = document.getElementById('emoticon-list');
    const paginationElem = document.getElementById('emoticon-pagination');
    if (!listElem || !paginationElem) return;

    const totalItems = emoticonList.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const startIdx = (page - 1) * ITEMS_PER_PAGE;
    const items = emoticonList.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    listElem.innerHTML = '<div class="emoticon-grid">' +
        items.map(item => `
      <div class="shop-item">
        <div class="icon">${item.icon}</div>
        <div class="item-title">${item.name}</div>
        <button class="buy-btn" data-type="emoticon" data-id="${item.id}" ${userDotori < item.price ? "disabled" : ""}>
          ${userDotori < item.price ? "도토리 부족" : "구매"}
        </button>
      </div>
    `).join('') +
        '</div>';

    if (totalPages > 1) {
        paginationElem.style.display = 'flex';
        renderPagination('emoticon-pagination', totalItems, page, renderEmoticonList);
    } else {
        paginationElem.style.display = 'none';
        paginationElem.innerHTML = '';
    }
}

// === 음악 리스트 렌더링 ===
function renderMusicList(page = 1) {
    const listElem = document.getElementById('music-list');
    const paginationElem = document.getElementById('music-pagination');
    if (!listElem || !paginationElem) return;

    const totalItems = musicList.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const startIdx = (page - 1) * ITEMS_PER_PAGE;
    const items = musicList.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    listElem.innerHTML = '<div class="music-grid">' +
        items.map(item => `
      <div class="music-item">
        <div class="icon">${item.icon}</div>
        <div class="item-title">${item.name}</div>
        <button class="buy-btn" data-type="music" data-id="${item.id}" ${userDotori < item.price ? "disabled" : ""}>
          ${userDotori < item.price ? "도토리 부족" : "구매"}
        </button>
      </div>
    `).join('') +
        '</div>';

    if (totalPages > 1) {
        paginationElem.style.display = 'flex';
        renderPagination('music-pagination', totalItems, page, renderMusicList);
    } else {
        paginationElem.style.display = 'none';
        paginationElem.innerHTML = '';
    }
}

// === 페이징 UI 렌더링 ===
function renderPagination(containerId, totalItems, currentPage, onPageClick) {
    const pageCount = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    for (let i = 1; i <= pageCount; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = (i === currentPage) ? 'active' : '';
        btn.onclick = () => onPageClick(i);
        container.appendChild(btn);
    }
}

// === 구매 버튼 클릭 처리 ===
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('buy-btn')) {
        const id = parseInt(e.target.dataset.id);
        const type = e.target.dataset.type;
        let item;
        if (type === 'emoticon') item = emoticonList.find(i => i.id === id);
        if (type === 'music') item = musicList.find(i => i.id === id);

        if (!item) return;

        if (userDotori < item.price) {
            alert('도토리가 부족합니다');
            return;
        }

        if (confirm(`${item.name}을(를) 구매하시겠습니까?`)) {
            userDotori -= item.price;
            renderDotori();
            alert(`${item.name} 구매 완료!`);
            if (type === 'emoticon') renderEmoticonList();
            if (type === 'music') renderMusicList();
        }
    }
});

// === 스킨 활성화 구매 버튼 처리 ===
document.addEventListener('click', function (e) {
    if (e.target.id === 'btn-skin-activate' || e.target.id === 'btn-skin-purchase') {
        if (skinActivated) return;
        const skinPrice = 80;
        if (userDotori < skinPrice) {
            alert('도토리가 부족합니다');
            return;
        }
        if (confirm('스킨을 활성화하시겠습니까? 80 도토리가 차감됩니다.')) {
            userDotori -= skinPrice;
            skinActivated = true;
            renderDotori();
            e.target.style.display = 'none'; // 버튼 숨김
            alert('스킨이 성공적으로 활성화되었습니다!');
        }
    }
});

// === 탭 전환 함수 ===
function activateTab(tabName) {
    document.querySelectorAll('.shop-inner-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.shop-tab-content').forEach(tab => tab.classList.remove('active'));

    if (tabName === 'emoticon') {
        document.getElementById('btn-emoticon').classList.add('active');
        document.querySelector('.shop-emoticon').classList.add('active');
        renderEmoticonList();
    } else if (tabName === 'music') {
        document.getElementById('btn-music').classList.add('active');
        document.querySelector('.shop-music').classList.add('active');
        renderMusicList();
    } else if (tabName === 'skin') {
        document.getElementById('btn-skin-activate').classList.add('active');
        document.querySelector('.shop-skin').classList.add('active');
    }
}

// === 문서 로드 시 초기화 ===
document.addEventListener('DOMContentLoaded', () => {
    renderDotori();
    renderEmoticonList();
    document.getElementById('btn-emoticon').onclick = () => activateTab('emoticon');
    document.getElementById('btn-music').onclick = () => activateTab('music');
    document.getElementById('btn-skin-activate').onclick = () => activateTab('skin');
});
