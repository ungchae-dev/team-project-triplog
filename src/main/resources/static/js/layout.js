// layout.js - 공통 레이아웃 및 네비게이션 관리

document.addEventListener('DOMContentLoaded', async () => {
    // 컴포넌트 로드
    await loadLayoutComponents();
    
    // 네비게이션 이벤트 설정
    setupNavigation();
    
    // 음악 위젯 이벤트
    setupMusicWidget();
});

// 공통 레이아웃 컴포넌트들 로드
async function loadLayoutComponents() {
    try {
        // 왼쪽 사이드 로드
        document.getElementById('left-container').innerHTML = getLeftSideHTML();

        // 상단 헤더 로드  
        document.getElementById('top-container').innerHTML = getTopHeaderHTML();

        // 오른쪽 네비 로드
        document.getElementById('right-container').innerHTML = getRightNavHTML();

        console.log('레이아웃 컴포넌트 로드 완료');
    } catch (error) {
        console.error('레이아웃 로딩 실패:', error);
    }
}

// 왼쪽 사이드 HTML 반환
function getLeftSideHTML() {
    return `
        <div class="page left-page">
            <div class="counter-banner">TODAY 2000<br>TOTAL 100000</div>
            <div class="mood-banner">TODAY is <span class="mood">🌸 행복</span></div>
            <div class="profile-pic">
                <img src="https://via.placeholder.com/150x150?text=프로필" alt="프로필 사진" />
            </div>
            <div class="intro-text">간단한 자기소개가 들어갑니다...</div>
            <div class="history">
                닉네임(♂/♀)<br>
                가입일: 00월 00일
                <a href="#" class="edit">EDIT</a>
            </div>
            <div class="received-url">
                <input type="text" placeholder="받아온 URL" />
            </div>
            <div class="neighbor-dropdown">
                <button>이웃 파도타기 ▼</button>
            </div>
        </div>
    `;
}

// 상단 헤더 HTML 반환
function getTopHeaderHTML() {
    return `
        <div class="header-handle">
            <h2 id="page-title">홈</h2>
            <div class="music-widget">
                <div class="track">Sweetbox – Life Is Cool</div>
                <div class="controls">
                    <button>⏮</button>
                    <button>⏸</button>
                    <button>⏭</button>
                    <button>🔊</button>
                    <button id="list-btn">LIST</button>
                </div>
            </div>
        </div>
    `;
}

// 오른쪽 네비 HTML 반환
function getRightNavHTML() {
    return `
        <nav class="main-nav">
            <button class="nav-btn" data-page="home">홈</button>
            <button class="nav-btn" data-page="shop">상점</button>
            <button class="nav-btn" data-page="profile">프로필</button>
            <button class="nav-btn" data-page="post">게시판</button>
            <button class="nav-btn" data-page="jukebox">주크박스</button>
            <button class="nav-btn" data-page="mylog">마이로그</button>
            <button class="nav-btn" data-page="guestbook">방명록</button>
        </nav>
    `;
}

// 네비게이션 버튼 이벤트 설정
function setupNavigation() {
    // 네비게이션 버튼들 감시 (컴포넌트 로드 후)
    const observer = new MutationObserver(() => {
        const navBtns = document.querySelectorAll('.nav-btn');
        if (navBtns.length > 0) {
            navBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const page = btn.textContent.trim();
                    navigateToPage(page);
                });
            });
            observer.disconnect(); // 이벤트 설정 완료 후 감시 중단
        }
    });

    observer.observe(document.getElementById('right-container'), {
        childList: true,
        subtree: true
    });
}

// 페이지 네비게이션 함수
function navigateToPage(pageName) {
    const pageMap = {
        '홈': '/blog/home',
        '상점': '/blog/shop', 
        '프로필': '/blog/profile',
        '게시판': '/blog/post',
        '주크박스': '/blog/jukebox',
        '마이로그': '/blog/mylog',
        '방명록': '/blog/guestbook'
    };

    const url = pageMap[pageName];
    if (url) {
        window.location.href = url;
    }
}

// 음악 위젯 이벤트 설정
function setupMusicWidget() {
    // LIST 버튼 감시 (컴포넌트 로드 후)
    const observer = new MutationObserver(() => {
        const listBtn = document.getElementById('list-btn');
        if (listBtn) {
            listBtn.addEventListener('click', () => {
                // 주크박스 페이지로 이동
                window.location.href = '/blog/jukebox';
            });
            observer.disconnect();
        }
    });

    observer.observe(document.getElementById('top-container'), {
        childList: true,
        subtree: true
    });
}

// 현재 페이지에 맞는 네비 버튼 활성화
function setActiveNavButton(currentPage) {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.trim() === currentPage) {
            btn.classList.add('active');
        }
    });
}

// 페이지 제목 변경 함수
function setPageTitle(title) {
    const titleEl = document.getElementById('page-title');
    if (titleEl) {
        titleEl.textContent = title;
    }
}

// 외부에서 호출 가능한 함수들로 노출
window.setActiveNavButton = setActiveNavButton;
window.setPageTitle = setPageTitle;