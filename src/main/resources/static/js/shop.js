// shop.js - 상점 페이지 기능 (스코프 분리)

(function() {
    'use strict';
    
    // === 전역 변수 (스코프 내에서만) ===
    let userDotori = 100;       // 현재 유저 도토리 잔액
    let skinActivated = false;  // 스킨 활성화 여부
    const ITEMS_PER_PAGE = 10;  // 페이지당 아이템 수 (1행 10개)

// === 더미 데이터 ===
const emoticonData = [];
const musicData = [];
const dotoriData = [
    { id: 1, amount: 100, price: 10000, size: 'small' },
    { id: 2, amount: 1000, price: 90000, size: 'medium' },
    { id: 3, amount: 10000, price: 800000, size: 'large' }
];

// 이모티콘 더미 데이터 생성 (30개)
for (let i = 1; i <= 30; i++) {
    const emojis = ['😊', '😎', '😂', '😍', '🥳', '😭', '🤔', '😴', '🤗', '😋'];
    emoticonData.push({
        id: i,
        name: `이모티콘${i}`,
        icon: emojis[(i - 1) % emojis.length],
        price: 10 + (i * 2)
    });
}

// 음악 더미 데이터 생성 (25개)
for (let i = 1; i <= 25; i++) {
    const artists = ['아이유', 'BTS', '블랙핑크', '뉴진스', '르세라핌'];
    const artist = artists[(i - 1) % artists.length];
    musicData.push({
        id: i,
        name: `${artist} - 제목${i}`,
        artist: artist,
        album: `앨범${i}`,
        price: 50
    });
}

// === 도토리 표시 갱신 ===
function updateDotoriDisplay() {
    const dotoriDisplay = document.getElementById('current-dotori');
    if (dotoriDisplay) {
        dotoriDisplay.textContent = userDotori;
    }
}

// === 이모티콘 리스트 렌더링 ===
function renderEmoticonList(page = 1) {
    const listElem = document.getElementById('emoticon-list');
    const paginationElem = document.getElementById('emoticon-pagination');
    
    if (!listElem || !paginationElem) return;

    const totalItems = emoticonData.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIdx = (page - 1) * ITEMS_PER_PAGE;
    const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, totalItems);

    // 아이템 리스트 생성
    let itemsHTML = '';
    for (let i = startIdx; i < endIdx; i++) {
        const item = emoticonData[i];
        const isAffordable = userDotori >= item.price;
        
        itemsHTML += `
            <div class="shop-item" data-id="${item.id}">
                <div class="icon">${item.icon}</div>
                <div class="item-title">${item.name}</div>
                <div class="item-price">${item.price} 도토리</div>
                <button class="buy-btn" 
                        data-type="emoticon" 
                        data-id="${item.id}" 
                        data-price="${item.price}"
                        ${!isAffordable ? 'disabled' : ''}>
                    ${!isAffordable ? '도토리 부족' : '구매'}
                </button>
            </div>
        `;
    }
    
    listElem.innerHTML = itemsHTML;
    renderPagination('emoticon', totalItems, page, renderEmoticonList);
}

// === 음악 리스트 렌더링 ===
function renderMusicList(page = 1) {
    const listElem = document.getElementById('music-list');
    const paginationElem = document.getElementById('music-pagination');
    
    if (!listElem || !paginationElem) return;

    const totalItems = musicData.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIdx = (page - 1) * ITEMS_PER_PAGE;
    const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, totalItems);

    // 아이템 리스트 생성
    let itemsHTML = '';
    for (let i = startIdx; i < endIdx; i++) {
        const item = musicData[i];
        const isAffordable = userDotori >= item.price;
        
        itemsHTML += `
            <div class="music-item" data-id="${item.id}">
                <div class="album-cover">🎵</div>
                <div class="item-title">${item.name}</div>
                <div class="item-price">${item.price} 도토리</div>
                <button class="buy-btn" 
                        data-type="music" 
                        data-id="${item.id}" 
                        data-price="${item.price}"
                        ${!isAffordable ? 'disabled' : ''}>
                    ${!isAffordable ? '도토리 부족' : '구매'}
                </button>
            </div>
        `;
    }
    
    listElem.innerHTML = itemsHTML;
    renderPagination('music', totalItems, page, renderMusicList);
}

// === 도토리 충전 리스트 렌더링 ===
function renderDotoriList() {
    const listElem = document.getElementById('dotori-list');
    if (!listElem) return;

    let itemsHTML = '';
    dotoriData.forEach(item => {
        itemsHTML += `
            <div class="dotori-item ${item.size}" data-id="${item.id}">
                <div class="dotori-image">🌰</div>
                <div class="item-title">${item.amount.toLocaleString()}개</div>
                <div class="item-price">${item.price.toLocaleString()}원</div>
                <button class="buy-btn" 
                        data-type="dotori" 
                        data-id="${item.id}" 
                        data-amount="${item.amount}"
                        data-price="${item.price}">
                    충전하기
                </button>
            </div>
        `;
    });
    
    listElem.innerHTML = itemsHTML;
}

// === 페이지네이션 렌더링 ===
function renderPagination(type, totalItems, currentPage, renderFunction) {
    const container = document.getElementById(`${type}-pagination`);
    if (!container) return;

    const pageCount = Math.ceil(totalItems / ITEMS_PER_PAGE);
    container.innerHTML = '';

    // 이전 버튼
    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '이전';
        prevBtn.className = 'prev-btn';
        prevBtn.addEventListener('click', () => renderFunction(currentPage - 1));
        container.appendChild(prevBtn);
    }

    // 페이지 번호 버튼들
    const startPage = Math.max(1, currentPage - 4);
    const endPage = Math.min(pageCount, startPage + 9);

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = (i === currentPage) ? 'active' : '';
        btn.addEventListener('click', () => renderFunction(i));
        container.appendChild(btn);
    }

    // 다음 버튼
    if (currentPage < pageCount) {
        const nextBtn = document.createElement('button');
        nextBtn.textContent = '다음';
        nextBtn.className = 'next-btn';
        nextBtn.addEventListener('click', () => renderFunction(currentPage + 1));
        container.appendChild(nextBtn);
    }
}

// === 구매 처리 ===
function handlePurchase(type, itemId, price, amount = null) {
    if (type === 'dotori') {
        // 도토리 충전 처리
        const dotoriItem = dotoriData.find(item => item.id === itemId);
        if (dotoriItem && confirm(`${dotoriItem.amount.toLocaleString()}개 도토리를 ${dotoriItem.price.toLocaleString()}원에 충전하시겠습니까?`)) {
            userDotori += dotoriItem.amount;
            updateDotoriDisplay();
            alert(`${dotoriItem.amount.toLocaleString()}개 도토리 충전 완료!`);
            
            // 다른 탭들 새로고침 (구매 가능 상태 업데이트)
            const activeTab = document.querySelector('.shop-tab-content.active');
            if (activeTab.classList.contains('shop-emoticon')) {
                renderEmoticonList();
            } else if (activeTab.classList.contains('shop-music')) {
                renderMusicList();
            }
        }
        return;
    }

    // 일반 아이템 구매 처리
    if (userDotori < price) {
        alert('도토리가 부족합니다');
        return;
    }

    const itemName = getItemName(type, itemId);
    if (confirm(`${itemName}을(를) 구매하시겠습니까? (${price} 도토리)`)) {
        userDotori -= price;
        updateDotoriDisplay();
        alert(`${itemName} 구매 완료!`);
        
        // 현재 탭의 아이템 리스트 다시 렌더링
        if (type === 'emoticon') {
            renderEmoticonList();
        } else if (type === 'music') {
            renderMusicList();
        }
    }
}

// === 아이템 이름 가져오기 ===
function getItemName(type, itemId) {
    if (type === 'emoticon') {
        const item = emoticonData.find(item => item.id === itemId);
        return item ? item.name : `이모티콘 ${itemId}`;
    } else if (type === 'music') {
        const item = musicData.find(item => item.id === itemId);
        return item ? item.name : `음악 ${itemId}`;
    }
    return `${type} ${itemId}`;
}

// === 스킨 활성화 처리 ===
function handleSkinActivation() {
    if (skinActivated) {
        alert('이미 스킨이 활성화되어 있습니다');
        return;
    }

    const skinPrice = 30;
    if (userDotori < skinPrice) {
        alert('도토리가 부족합니다');
        return;
    }

    if (confirm('스킨을 활성화하시겠습니까? 도토리 30개가 차감됩니다.')) {
        userDotori -= skinPrice;
        skinActivated = true;
        updateDotoriDisplay();
        alert('스킨이 성공적으로 활성화되었습니다!\n프로필 페이지에서 배경 이미지를 설정할 수 있습니다.');
        
        // 스킨 활성화 버튼 상태 변경
        const skinBtn = document.getElementById('btn-skin-activate');
        if (skinBtn) {
            skinBtn.classList.add('activated');
            skinBtn.textContent = '스킨 활성화됨';
        }
    }
}

// === 탭 전환 ===
function switchTab(tabName) {
    // 모든 탭 버튼과 컨텐츠 비활성화
    document.querySelectorAll('.shop-inner-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.shop-tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // 선택된 탭 활성화
    const tabBtn = document.getElementById(`btn-${tabName}`);
    const tabContent = document.querySelector(`.shop-${tabName}`);
    
    if (tabBtn && !tabBtn.classList.contains('skin-tab')) {
        tabBtn.classList.add('active');
    }
    if (tabContent) tabContent.classList.add('active');

    // 해당 탭의 데이터 로드
    if (tabName === 'emoticon') {
        renderEmoticonList();
    } else if (tabName === 'music') {
        renderMusicList();
    } else if (tabName === 'dotori') {
        renderDotoriList();
    }
}

// === 이벤트 리스너 등록 ===
function setupEventListeners() {
    // 구매 버튼 클릭 이벤트 (이벤트 위임)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('buy-btn') && !e.target.disabled) {
            const type = e.target.dataset.type;
            const itemId = parseInt(e.target.dataset.id);
            const price = parseInt(e.target.dataset.price);
            const amount = e.target.dataset.amount ? parseInt(e.target.dataset.amount) : null;
            
            handlePurchase(type, itemId, price, amount);
        }
    });

    // 탭 버튼 클릭 이벤트
    const emoticonBtn = document.getElementById('btn-emoticon');
    const musicBtn = document.getElementById('btn-music');
    const dotoriBtn = document.getElementById('btn-dotori');
    const skinBtn = document.getElementById('btn-skin-activate');

    if (emoticonBtn) {
        emoticonBtn.addEventListener('click', () => switchTab('emoticon'));
    }
    if (musicBtn) {
        musicBtn.addEventListener('click', () => switchTab('music'));
    }
    if (dotoriBtn) {
        dotoriBtn.addEventListener('click', () => switchTab('dotori'));
    }
    if (skinBtn) {
        skinBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleSkinActivation();
        });
    }
}

// === 상점 페이지 초기화 ===
function initShopPage() {
    updateDotoriDisplay();
    renderEmoticonList(); // 기본적으로 이모티콘 탭 표시
    setupEventListeners();
    
    console.log('상점 페이지 초기화 완료');
}

    // === 외부에서 호출 가능한 함수들 (SPA 네비게이션 연동용) ===
    window.setupShopFeatures = initShopPage;

    // === 페이지 로드 시 초기화 ===
    document.addEventListener('DOMContentLoaded', initShopPage);

})(); // 즉시 실행 함수 종료// shop.js - 상점 페이지 기능만 담당

// === 전역 변수 ===
let userDotori = 100;       // 현재 유저 도토리 잔액
let skinActivated = false;  // 스킨 활성화 여부
const ITEMS_PER_PAGE = 6;   // 페이지당 아이템 수

// === 아이템 데이터 (JavaScript에서 관리) ===
const itemData = {
    emoticon: [
        { id: 1, name: "행복한 미소", icon: "😊", price: 20 },
        { id: 2, name: "멋진 선글라스", icon: "😎", price: 25 },
        { id: 3, name: "웃음 폭탄", icon: "😂", price: 30 },
        { id: 4, name: "하트 눈", icon: "😍", price: 35 },
        { id: 5, name: "파티 모자", icon: "🥳", price: 40 },
        { id: 6, name: "슬픈 눈물", icon: "😭", price: 50 }
    ],
    music: [
        { id: 1, name: "클래식 선율", icon: "🎵", price: 50 },
        { id: 2, name: "팝 뮤직", icon: "🎶", price: 50 },
        { id: 3, name: "악보 모음", icon: "🎼", price: 50 },
        { id: 4, name: "피아노 연주", icon: "🎹", price: 50 },
        { id: 5, name: "노래방 음악", icon: "🎤", price: 50 }
    ]
};

// === 도토리 표시 갱신 ===
function updateDotoriDisplay() {
    const pointDisplay = document.getElementById('point-display');
    if (pointDisplay) {
        pointDisplay.textContent = `도토리: ${userDotori}개`;
    }
}

// === 아이템 리스트 렌더링 ===
function renderItemList(type, page = 1) {
    const listElem = document.getElementById(`${type}-list`);
    const paginationElem = document.getElementById(`${type}-pagination`);
    
    if (!listElem || !paginationElem) return;

    const items = itemData[type] || [];
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIdx = (page - 1) * ITEMS_PER_PAGE;
    const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, totalItems);

    // 아이템 리스트 생성
    let itemsHTML = '';
    for (let i = startIdx; i < endIdx; i++) {
        const item = items[i];
        const isAffordable = userDotori >= item.price;
        const itemClass = type === 'emoticon' ? 'shop-item' : 'music-item';
        
        itemsHTML += `
            <div class="${itemClass}" data-id="${item.id}">
                <div class="icon">${item.icon}</div>
                <div class="item-title">${item.name}</div>
                <div class="item-price">${item.price} 도토리</div>
                <button class="buy-btn" 
                        data-type="${type}" 
                        data-id="${item.id}" 
                        data-price="${item.price}"
                        ${!isAffordable ? 'disabled' : ''}>
                    ${!isAffordable ? '도토리 부족' : '구매'}
                </button>
            </div>
        `;
    }
    
    listElem.innerHTML = itemsHTML;

    // 페이지네이션 처리
    if (totalPages > 1) {
        paginationElem.style.display = 'flex';
        renderPagination(type, totalItems, page);
    } else {
        paginationElem.style.display = 'none';
    }
}

// === 페이지네이션 렌더링 ===
function renderPagination(type, totalItems, currentPage) {
    const container = document.getElementById(`${type}-pagination`);
    if (!container) return;

    const pageCount = Math.ceil(totalItems / ITEMS_PER_PAGE);
    container.innerHTML = '';

    for (let i = 1; i <= pageCount; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = (i === currentPage) ? 'active' : '';
        btn.addEventListener('click', () => renderItemList(type, i));
        container.appendChild(btn);
    }
}

// === 구매 처리 ===
function handlePurchase(type, itemId, price) {
    if (userDotori < price) {
        alert('도토리가 부족합니다');
        return;
    }

    const itemName = getItemName(type, itemId);
    if (confirm(`${itemName}을(를) 구매하시겠습니까? (${price} 도토리)`)) {
        userDotori -= price;
        updateDotoriDisplay();
        alert(`${itemName} 구매 완료!`);
        
        // 현재 탭의 아이템 리스트 다시 렌더링
        renderItemList(type);
    }
}

// === 아이템 이름 가져오기 ===
function getItemName(type, itemId) {
    const items = itemData[type] || [];
    const item = items.find(item => item.id === itemId);
    return item ? item.name : `${type} ${itemId}`;
}

// === 스킨 활성화 처리 ===
function handleSkinActivation() {
    if (skinActivated) {
        alert('이미 스킨이 활성화되어 있습니다');
        return;
    }

    const skinPrice = 30;
    if (userDotori < skinPrice) {
        alert('도토리가 부족합니다');
        return;
    }

    if (confirm('스킨을 활성화하시겠습니까? 도토리 30개가 차감됩니다.')) {
        userDotori -= skinPrice;
        skinActivated = true;
        updateDotoriDisplay();
        alert('스킨이 성공적으로 활성화되었습니다!');
        
        // 스킨 활성화 버튼 비활성화
        const skinBtn = document.getElementById('btn-skin-activate');
        if (skinBtn) {
            skinBtn.disabled = true;
            skinBtn.textContent = '활성화 완료';
        }
    }
}

// === 탭 전환 ===
function switchTab(tabName) {
    // 모든 탭 버튼과 컨텐츠 비활성화
    document.querySelectorAll('.shop-inner-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.shop-tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // 선택된 탭 활성화
    const tabBtn = document.getElementById(`btn-${tabName}`);
    const tabContent = document.querySelector(`.shop-${tabName}`);
    
    if (tabBtn) tabBtn.classList.add('active');
    if (tabContent) tabContent.classList.add('active');

    // 해당 탭의 데이터 로드
    if (tabName === 'emoticon') {
        renderItemList('emoticon');
    } else if (tabName === 'music') {
        renderItemList('music');
    }
}

// === 이벤트 리스너 등록 ===
function setupEventListeners() {
    // 구매 버튼 클릭 이벤트 (이벤트 위임)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('buy-btn') && !e.target.disabled) {
            const type = e.target.dataset.type;
            const itemId = parseInt(e.target.dataset.id);
            const price = parseInt(e.target.dataset.price);
            
            handlePurchase(type, itemId, price);
        }
    });

    // 탭 버튼 클릭 이벤트
    const emoticonBtn = document.getElementById('btn-emoticon');
    const musicBtn = document.getElementById('btn-music');
    const skinBtn = document.getElementById('btn-skin-activate');

    if (emoticonBtn) {
        emoticonBtn.addEventListener('click', () => switchTab('emoticon'));
    }
    if (musicBtn) {
        musicBtn.addEventListener('click', () => switchTab('music'));
    }
    if (skinBtn) {
        skinBtn.addEventListener('click', handleSkinActivation);
    }
}

// === 상점 페이지 초기화 ===
function initShopPage() {
    updateDotoriDisplay();
    renderItemList('emoticon'); // 기본적으로 이모티콘 탭 표시
    setupEventListeners();
    
    console.log('상점 페이지 초기화 완료');
}

// === 외부에서 호출 가능한 함수들 (SPA 네비게이션 연동용) ===
window.setupShopFeatures = initShopPage;

// === 페이지 로드 시 초기화 ===
document.addEventListener('DOMContentLoaded', initShopPage);