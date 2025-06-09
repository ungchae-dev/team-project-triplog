// shop.js - 상점 페이지 기능

(function() {
    'use strict';
    
    // === 전역 변수 ===
    let userAcorn = 100;       // 현재 유저 도토리 잔액
    let skinActivated = false;  // 스킨 활성화 여부
    const ITEMS_PER_PAGE = 10;  // 페이지당 아이템 수

    // === 더미 데이터 ===
    const emoticonData = [];
    const musicData = [];
    const acornData = [
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
    function updateAcornDisplay() {
        const acornDisplay = document.getElementById('current-acorn');
        if (acornDisplay) {
            acornDisplay.textContent = userAcorn;
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
            const isAffordable = userAcorn >= item.price;
            
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
            const isAffordable = userAcorn >= item.price;
            
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
    function renderAcornList() {
        const listElem = document.getElementById('acorn-list');
        if (!listElem) {
            console.error('도토리 리스트 요소를 찾을 수 없습니다!');
            return;
        }

        let itemsHTML = '';
        acornData.forEach(item => {
            itemsHTML += `
                <div class="acorn-item ${item.size}" data-id="${item.id}">
                    <div class="acorn-image">🌰</div>
                    <div class="item-title">${item.amount.toLocaleString()}개</div>
                    <div class="item-price">${item.price.toLocaleString()}원</div>
                    <button class="buy-btn" 
                            data-type="acorn" 
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
        if (type === 'acorn') {
            // 도토리 충전 처리
            const acornItem = acornData.find(item => item.id === itemId);
            if (acornItem && confirm(`${acornItem.amount.toLocaleString()}개 도토리를 ${acornItem.price.toLocaleString()}원에 충전하시겠습니까?`)) {
                userAcorn += acornItem.amount;
                updateAcornDisplay();
                alert(`${acornItem.amount.toLocaleString()}개 도토리 충전 완료!`);
                
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
        if (userAcorn < price) {
            alert('도토리가 부족합니다');
            return;
        }

        const itemName = getItemName(type, itemId);
        if (confirm(`${itemName}을(를) 구매하시겠습니까? (${price} 도토리)`)) {
            userAcorn -= price;
            updateAcornDisplay();
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
    async function handleSkinActivation() {
        if (skinActivated) {
            alert('이미 스킨이 활성화되어 있습니다');
            return;
        }

        const skinPrice = 30;
        if (userAcorn < skinPrice) {
            alert('도토리가 부족합니다');
            return;
        }

        if (confirm('스킨을 활성화하시겠습니까? 도토리 30개가 차감됩니다.')) {
            try {
                // 서버에 스킨 활성화 요청 보내기
                if (!window.currentBlogNickname) {
                    alert('사용자 정보를 확인할 수 없습니다.');
                    return;
                }

                console.log('스킨 활성화 API 호출 시작...'); // 디버깅 로그

                const encodedNickname = encodeURIComponent(window.currentBlogNickname);
                const apiUrl = `/blog/api/@${encodedNickname}/activate-skin`;
                
                console.log('API URL:', apiUrl); // 디버깅 로그
                
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        acornCost: skinPrice
                    })
                });

                console.log('API 응답 상태:', response.status); // 디버깅 로그

                if (response.ok) {
                    const result = await response.json();
                    console.log('스킨 활성화 API 성공:', result);
                    
                    if (result.success) {
                        // 클라이언트 상태 업데이트
                        userAcorn = result.remainingAcorn || (userAcorn - skinPrice);
                        skinActivated = true;
                        updateAcornDisplay();
                        
                        // 스킨 활성화 버튼 상태 변경
                        const skinBtn = document.getElementById('btn-skin-activate');
                        if (skinBtn) {
                            skinBtn.classList.add('activated');
                            skinBtn.textContent = '스킨 활성화됨';
                            skinBtn.style.pointerEvents = 'none';
                            skinBtn.style.opacity = '0.7';
                        }
                        
                        alert('스킨이 성공적으로 활성화되었습니다!\n프로필 페이지에서 배경 이미지를 설정할 수 있습니다.');
                    } else {
                        alert(`스킨 활성화 실패: ${result.message || '알 수 없는 오류'}`);
                    }
                } else {
                    const errorData = await response.json();
                    console.error('스킨 활성화 API 오류:', errorData);
                    alert(`스킨 활성화 실패: ${errorData.message || '서버 오류'}`);
                }
            } catch (error) {
                console.error('스킨 활성화 중 네트워크 오류:', error);
                alert('스킨 활성화 중 오류가 발생했습니다. 네트워크를 확인해주세요.');
            }
        }
    }

    // === 탭 전환 ===
    function switchTab(tabName) {
        console.log(`탭 전환: ${tabName}`); // 디버깅용
        
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
        if (tabContent) {
            tabContent.classList.add('active');
            console.log(`${tabName} 탭 컨텐츠 활성화됨`); // 디버깅용
        }

        // 해당 탭의 데이터 로드
        if (tabName === 'emoticon') {
            renderEmoticonList();
        } else if (tabName === 'music') {
            renderMusicList();
        } else if (tabName === 'acorn') {
            renderAcornList();
            console.log('도토리 리스트 렌더링 완료'); // 디버깅용
        }
    }

    // === 이벤트 리스너 등록 ===
    function setupEventListeners() {
        console.log('상점 이벤트 리스너 등록 시작...'); // 디버깅 로그
        
        // 구매 버튼 클릭 이벤트 (이벤트 위임 - 상점 페이지에서만)
        document.addEventListener('click', function(e) {
            // 상점 페이지에서만 작동하도록 제한
            const isShopPage = window.location.pathname.includes('/shop') || 
                document.querySelector('.shop-tab-content');

            if (isShopPage && 
                e.target.classList.contains('buy-btn') && 
                e.target.classList.contains('skin-btn') && // 스킨 버튼 제외
                !e.target.disabled) {

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
        const acornBtn = document.getElementById('btn-acorn');
        const skinBtn = document.getElementById('btn-skin-activate');

        if (emoticonBtn) {
            emoticonBtn.addEventListener('click', () => switchTab('emoticon'));
            console.log('이모티콘 버튼 이벤트 등록');
        }
        if (musicBtn) {
            musicBtn.addEventListener('click', () => switchTab('music'));
            console.log('음악 버튼 이벤트 등록');
        }
        if (acornBtn) {
            acornBtn.addEventListener('click', () => switchTab('acorn'));
            console.log('도토리 버튼 이벤트 등록');
        }
        if (skinBtn) {
            // 기존 이벤트 리스너 제거 후 새로 등록
            const newSkinBtn = skinBtn.cloneNode(true);
            skinBtn.parentNode.replaceChild(newSkinBtn, skinBtn);
            
            newSkinBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log('스킨 활성화 버튼 클릭!'); // 디버깅 로그
                await handleSkinActivation();
            });
            console.log('스킨 활성화 버튼 이벤트 등록');
        } else {
            console.log('스킨 활성화 버튼을 찾을 수 없음');
        }
        
        console.log('상점 이벤트 리스너 등록 완료');
    }

    // === 현재 스킨 활성화 상태 확인 ===
    async function checkCurrentSkinStatus() {
        if (!window.currentBlogNickname) {
            console.log('닉네임이 없어서 스킨 상태 확인을 건너뜁니다.');
            return;
        }

        try {
            const encodedNickname = encodeURIComponent(window.currentBlogNickname);
            const response = await fetch(`/blog/api/@${encodedNickname}/skin`);

            if (response.ok) {
                const skinData = await response.json();
                console.log('상점에서 스킨 데이터 확인:', skinData);
                
                skinActivated = (skinData.skinActive === 'Y');
                
                // 스킨 활성화 버튼 상태 업데이트
                const skinBtn = document.getElementById('btn-skin-activate');
                if (skinBtn) {
                    if (skinActivated) {
                        skinBtn.classList.add('activated');
                        skinBtn.textContent = '스킨 활성화됨';
                        skinBtn.style.pointerEvents = 'none';
                        skinBtn.style.opacity = '0.7';
                    } else {
                        skinBtn.classList.remove('activated');
                        skinBtn.textContent = '스킨 활성화';
                        skinBtn.style.pointerEvents = 'auto';
                        skinBtn.style.opacity = '1';
                    }
                }
                
                console.log('상점 스킨 활성화 상태:', skinActivated);
            } else {
                console.log('스킨 정보를 가져올 수 없습니다:', response.status);
            }
        } catch (error) {
            console.error('스킨 상태 확인 중 오류:', error);
        }
    }

    // === 상점 페이지 초기화 ===
    async function initShopPage() {
        
        updateAcornDisplay();
        renderEmoticonList(); // 기본적으로 이모티콘 탭 표시
        setupEventListeners();
        
        // 현재 스킨 활성화 상태 확인
        await checkCurrentSkinStatus();

        // 공통 스킨 로드 (즉시 적용)
        if (typeof window.maintainDefaultSkinForInactiveUsers === 'function') {
            window.maintainDefaultSkinForInactiveUsers();
        }
        
        console.log('상점 페이지 초기화 완료');
    }

    // === 외부에서 호출 가능한 함수들 (SPA 네비게이션 연동용) ===
    window.setupShopFeatures = initShopPage;

    // === 페이지 로드 시 초기화 ===
    document.addEventListener('DOMContentLoaded', function() {
        // 초기화
        initShopPage();

        // 공통 스킨 로드
        if (typeof window.maintainDefaultSkinForInactiveUsers === 'function') {
            window.maintainDefaultSkinForInactiveUsers();
        }
    });


    // === 스킨 로드 함수 시작 ===
    async function loadBlogSkin() {
        const currentNickname = getCurrentNickname();
        if (!currentNickname) return;

        try {
            const encodedNickname = encodeURIComponent(currentNickname);
            const response = await fetch(`/blog/api/@${encodedNickname}/skin`);

            if (response.ok) {
                const skinData = await response.json();
                if (skinData.skinActive === 'Y' && skinData.skinImage) {
                    applySkin(skinData.skinImage);
                } else {
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
            };
            img.src = skinImageUrl;
        }
    }

    function removeSkin() {
        const frame = document.querySelector('.frame');
        if (frame) {
            frame.style.backgroundImage = '';
            frame.classList.remove('has-skin');
        }
    }

    // 전역으로 노출
    window.loadBlogSkin = loadBlogSkin;
    // === 스킨 로드 함수 끝 ===

})(); // 즉시 실행 함수 종료