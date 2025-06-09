(function () {
  'use strict';

  let userDotori = 0;

  const dotoriProducts = [
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

    if (tabName === 'dotori') {
      fetchUserDotori();
      renderDotoriList();
    } else if (tabName === 'emoticon') {
      fetchUserDotori();
      renderEmoticonList();
    } else if (tabName === 'music') {
      fetchUserDotori();
      renderMusicList();
    }
  }

  async function fetchUserDotori() {
    try {
      const res = await fetch('/api/charge/acorn');
      if (!res.ok) throw new Error('잔액 조회 실패');
      const acorn = await res.json();
      userDotori = acorn;
      updateDotoriDisplay();
    } catch (e) {
      console.error('도토리 잔액 조회 오류:', e);
    }
  }

  function updateDotoriDisplay() {
    const el = document.getElementById('current-dotori');
    if (el) el.textContent = userDotori;
  }

  function renderDotoriList() {
    const listElem = document.getElementById('dotori-list');
    if (!listElem) return;

    listElem.innerHTML = dotoriProducts.map(p => `
      <div class="dotori-item" data-id="${p.id}">
        <div class="dotori-image">🌰</div>
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
            requestDotoriPayment(amount, price, id);
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

  async function requestDotoriPayment(amount, price, id) {
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
      userDotori = newBalance;
      updateDotoriDisplay();
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
    div.className = 'package-card';

    const img = document.createElement('img');
    img.src = pkg.packageImg;
    img.className = 'package-img';
    img.alt = pkg.packageName;
    img.onclick = () => loadStickers(pkg.packageId);
    div.appendChild(img);

    const name = document.createElement('div');
    name.textContent = pkg.packageName;
    div.appendChild(name);

    const price = document.createElement('div');
    price.textContent = `💰 ${pkg.price} 도토리`;
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
      div.className = 'music-card';

      const img = document.createElement('img');
      img.src = track.album;
      img.alt = `${track.title} 앨범`;
      img.className = 'album-img';
      div.appendChild(img);

      const info = document.createElement('div');
      info.className = 'music-info';
      info.innerHTML = `
        <strong>${track.title}</strong><br />
        <span>${track.artist}</span>
      `;
      div.appendChild(info);

      const price = document.createElement('div');
      price.className = 'music-price';
      price.textContent = `💰 ${track.price} 도토리`;
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
  // === 상점 페이지 초기화 ===
async function initShopPage() {
    updateAcornDisplay();
    
    // 탭 초기화
    const urlParams = new URLSearchParams(window.location.search);
    const initialTab = urlParams.get('tab') || 'emoticon';
    switchTab(initialTab);

    // 공통 이벤트 바인딩
    setupEventListeners();

    // 현재 스킨 활성화 상태 확인
    await checkCurrentSkinStatus();

    // 공통 스킨 유지 (비활성 사용자용)
    if (typeof window.maintainDefaultSkinForInactiveUsers === 'function') {
        window.maintainDefaultSkinForInactiveUsers();
    }

    console.log('상점 페이지 초기화 완료');
}

// === 탭 버튼 이벤트 바인딩 ===
function setupEventListeners() {
    const dotoriTabBtn = document.getElementById('btn-dotori');
    if (dotoriTabBtn) {
        dotoriTabBtn.addEventListener('click', () => {
            location.href = location.pathname + '?tab=dotori'; // 새로고침 방식
        });
    }

    const emoticonTabBtn = document.getElementById('btn-emoticon');
    if (emoticonTabBtn) {
        emoticonTabBtn.addEventListener('click', () => switchTab('emoticon'));
    }

    const musicTabBtn = document.getElementById('btn-music');
    if (musicTabBtn) {
        musicTabBtn.addEventListener('click', () => switchTab('music'));
    }
}

// === 외부에서 호출 가능한 초기화 함수 등록 (SPA 대응용) ===
window.setupShopFeatures = initShopPage;

// === DOMContentLoaded 시 초기화 실행 ===
document.addEventListener('DOMContentLoaded', function () {
    initShopPage();

    // 스킨 유지 함수 중복 호출 (예외 방지)
    if (typeof window.maintainDefaultSkinForInactiveUsers === 'function') {
        window.maintainDefaultSkinForInactiveUsers();
    }
});

// === 스킨 적용 함수 ===
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
    }
     const musicTabBtn = document.getElementById('btn-music');
    if (musicTabBtn) {
    musicTabBtn.addEventListener('click', () => switchTab('music'));
    }
  }

  function initShopPage() {
    setupEventListeners();

    const urlParams = new URLSearchParams(window.location.search);
    const initialTab = urlParams.get('tab') || 'emoticon';
    switchTab(initialTab);

    console.log('도토리 충전 기능 초기화 완료');
  }

  window.setupShopFeatures = initShopPage;
  document.addEventListener('DOMContentLoaded', initShopPage);
})();
