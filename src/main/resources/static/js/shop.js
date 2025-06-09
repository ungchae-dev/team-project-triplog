(function () {
  'use strict';

  let userAcorn = 30;
  let skinActivated = false;
  const ITEMS_PER_PAGE = 4; 

  const acornData = [
    { id: 'acorn_100', amount: 100, price: 10000 },
    { id: 'acorn_1000', amount: 1000, price: 90000 },
    { id: 'acorn_10000', amount: 10000, price: 800000 }
  ];

  function switchTab(tabName) {
    document.querySelectorAll('.shop-inner-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.shop-tab-content').forEach(content => content.classList.remove('active'));

    const tabBtn = document.getElementById(`btn-${tabName}`);
    const tabContent = document.querySelector(`.shop-${tabName}`);

    if (tabBtn) tabBtn.classList.add('active');
    if (tabContent) tabContent.classList.add('active');

    if (tabName === 'acorn') {
      fetchUserAcorn();
      renderAcornList();
    } else if (tabName === 'emoticon') {
      fetchUserAcorn();
      renderEmoticonList();
    } else if (tabName === 'music') {
      fetchUserAcorn();
      renderMusicList();
    }
  }

  async function fetchUserAcorn() {
    try {
      const res = await fetch('/api/charge/acorn');
      if (!res.ok) throw new Error('잔액 조회 실패');
      const acorn = await res.json();
      userAcorn = acorn;
      updateAcornDisplay();
    } catch (e) {
      console.error('도토리 잔액 조회 오류:', e);
    }
  }

  function updateAcornDisplay() {
    const el = document.getElementById('current-acorn');
    if (el) el.textContent = userAcorn;
  }

  function renderAcornList() {
    
    // 최초 1회 페이지 자동새로고침 
    if (!sessionStorage.getItem('acornTabReloaded')) {
    sessionStorage.setItem('acornTabReloaded', 'true');
    location.reload();
    return; // 이 뒤 코드는 실행 안 함
  }
    
    const listElem = document.getElementById('acorn-list');
    if (!listElem) return;

    listElem.innerHTML = acornData.map(p => `
      <div class="acorn-item" data-id="${p.id}">
        <div class="acorn-image">🌰</div>
        <div class="item-title">${p.amount.toLocaleString()}개</div>
        <div class="item-price">${p.price.toLocaleString()}원</div>
        <button class="buy-btn"
                data-id="${p.id}"
                data-amount="${p.amount}"
                data-price="${p.price}">
          충전하기
        </button>
      </div>
    `).join('');

    waitForPortOne(() => {
      document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const amount = parseInt(btn.dataset.amount);
          const price = parseInt(btn.dataset.price);
          const id = btn.dataset.id;

          if (confirm(`${amount.toLocaleString()}개 도토리를 ${price.toLocaleString()}원에 충전하시겠습니까?`)) {
            requestAcornPayment(amount, price, id);
          }
        });
      });
    });
  }

  function waitForPortOne(callback) {
    const interval = setInterval(() => {
      if (typeof PortOne !== 'undefined') {
        clearInterval(interval);
        callback();
      }
    }, 50);
  }

  async function requestAcornPayment(amount, price, id) {
    const paymentId = crypto.randomUUID();

    try {
      const payment = await PortOne.requestPayment({
        storeId: "store-4e640aa5-588e-43a9-acf5-ebaeff70b074",
        channelKey: "channel-key-8c3e9cfb-a553-471c-bea5-148c3270fea1",
        paymentId: paymentId,
        orderName: `도토리 ${amount}개`,
        totalAmount: price,
        currency: "CURRENCY_KRW",
        payMethod: "EASY_PAY",
        customData: { item: id }
      });

     if (payment?.txId || payment.status === "PAY_APPROVED") {
          await postChargeResult(amount);
    } else {
        alert("결제가 완료되지 않았습니다.");
    }
    } catch (err) {
      console.error("결제 중 오류:", err);
      alert("결제 처리에 실패했습니다.");
    }
  }

  async function postChargeResult(amount) {
    try {
      const res = await fetch('/api/charge/acorn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });

      if (!res.ok) throw new Error('충전 실패');

      const newBalance = await res.json();
      userAcorn = newBalance;
      updateAcornDisplay();
      alert(`${amount}개 도토리 충전 완료!`);
    } catch (err) {
      console.error('충전 요청 실패:', err);
      alert('충전 중 오류가 발생했습니다.');
    }
  }
// 도토리 충전 영역 끝 
// 이모티콘 영역

async function renderEmoticonList() {
  const container = document.getElementById('package-list');
  if (!container) return;

  container.innerHTML = '';

  const res = await fetch('/api/emoticon/selected');
  const data = await res.json();

  for (const pkg of data) {
    const check = await fetch(`/api/emoticon/purchased?emoticonId=${pkg.emoticonId}`);
    const isPurchased = await check.json();

    const div = document.createElement('div');
    div.className = 'shop-item';

    const img = document.createElement('img');
    img.src = pkg.packageImg;
    img.className = 'icon';
    img.alt = pkg.packageName;
    img.onclick = () => loadStickers(pkg.packageId);
    div.appendChild(img);

    const name = document.createElement('div');
    name.textContent = pkg.packageName;
    div.appendChild(name);

    const price = document.createElement('div');
    price.textContent = `🐿️ ${pkg.price} 도토리`;
    div.appendChild(price);

    const btn = document.createElement('button');
    btn.className = 'buy-btn';
    btn.textContent = isPurchased ? '구매 완료' : '구매';
    btn.disabled = isPurchased;
    btn.onclick = () => buyEmoticon(pkg);
    div.appendChild(btn);

    container.appendChild(div);
  }
}

async function loadStickers(packageId) {
  const res = await fetch(`/api/emoticon/stickers?packageId=${packageId}`);
  const data = await res.json();
  const container = document.getElementById('sticker-list');
  if (!container) return;

  container.innerHTML = '';
  data.forEach(sticker => {
    const img = document.createElement('img');
    img.src = sticker.stickerImg_300;
    img.className = 'sticker-img';
    container.appendChild(img);
  });
}

async function buyEmoticon(emoticon) {
  const payload = {
    emoticonId: emoticon.emoticonId,
    emoticonName: emoticon.packageName,
    emoticonImage: emoticon.packageImg,
    price: emoticon.price
  };

  try {
    const res = await fetch('/api/emoticon/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    const data = await res.json();
    alert(`✅ ${data.message} 남은 도토리: ${data.remainingAcorn}`);
    location.reload();
  } catch (err) {
    alert(`❗ 오류: ${err.message}`);
  }
}

// 이모티콘 영역 끝  
// 음악 영역
async function renderMusicList() {
  const container = document.getElementById('music-list');
  if (!container) return;

  container.innerHTML = '';

  try {
    const res = await fetch('/api/music/list');
    if (!res.ok) throw new Error('음악 정보를 불러오는 데 실패했습니다.');

    const musicList = await res.json();

    musicList.forEach(track => {
      const div = document.createElement('div');
      div.className = 'music-item';

      const img = document.createElement('img');
      img.src = track.album;
      img.alt = `${track.title} 앨범`;
      img.className = 'icon';
      div.appendChild(img);

      const info = document.createElement('div');
      info.className = 'item-title';
      info.innerHTML = `
        <strong>${track.title}</strong><br />
        <span>${track.artist}</span>
      `;
      div.appendChild(info);

      const price = document.createElement('div');
      price.className = 'item-price';
      price.textContent = `🐿️ ${track.price} 도토리`;
      div.appendChild(price);

      const btn = document.createElement('button');
      btn.className = 'buy-btn';
      btn.textContent = track.purchased ? '구매 완료' : '구매';
      btn.disabled = track.purchased;

      btn.addEventListener('click', async () => {
        const confirmBuy = confirm(`${track.title} 을(를) 구매하시겠습니까? 도토리 10개가 차감됩니다.`);
        if (!confirmBuy) return;

        try {
          const response = await fetch('/api/music/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: track.title,
              artist: track.artist,
              album: track.album,
              previewUrl: track.musicFile
            })
          });

          if (!response.ok) {
            const errText = await response.text();
            alert('구매 실패: ' + errText);
            return;
          }

          const result = await response.json();
          alert(result.message + '\n남은 도토리: ' + result.remainingAcorn);
          switchTab('music'); // 구매 후 갱신
        } catch (err) {
          console.error('구매 요청 실패:', err);
          alert('서버 오류로 인해 구매에 실패했습니다.');
        }
      });

      div.appendChild(btn);
      container.appendChild(div);
    });
  } catch (err) {
    console.error('음악 리스트 로딩 실패:', err);
  }
}

// 공동 이벤트 처리

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
    fetchUserAcorn();
    // === 스킨 로드 함수 끝 ===

})(); // 즉시 실행 함수 종료