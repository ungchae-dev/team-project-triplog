// layout.js - 공통 레이아웃 및 네비게이션 관리

document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== Layout 초기화 시작 ===');
    
    // 1. 컴포넌트 로드
    await loadLayoutComponents();
    
    // 2. 네비게이션 즉시 설정 (컴포넌트 로드 완료 후)
    setupNavigation();
    
    // 3. 페이지별 제목 자동 설정
    setPageTitleByUrl();
    
    // 4. 음악 위젯 이벤트
    setupMusicWidget();
    
    console.log('=== Layout 초기화 완료 ===');
});

// 개별 컴포넌트 로드 함수
async function loadComponent(containerId, componentPath) {
    console.log(`컴포넌트 로딩 시도: ${componentPath}`);

    try {
        const response = await fetch(componentPath);
        console.log(`응답 상태: ${response.status}`);
        
        if (!response.ok) {
            throw new Error(`HTTP 에러! 상태: ${response.status}`)
        }
        
        const html = await response.text();
        console.log(`HTML 로드 성공: ${componentPath}`);

        // body 태그 내용만 추출
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const bodyContent = tempDiv.querySelector('body')?.innerHTML || html;

        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = bodyContent;
            console.log(`컴포넌트 삽입 완료: ${containerId}`);
        }
    } catch (error) {
        console.error(`컴포넌트 로딩 실패 ${componentPath}:`, error)
    }
}

// 공통 레이아웃 컴포넌트들 로드
async function loadLayoutComponents() {
    try {
        // 병렬 로드로 더 빠르게
        await Promise.all([
            loadComponent('left-container', '/components/home_left.html'),
            loadComponent('top-container', '/components/home_top.html'),
            loadComponent('right-container', '/components/home_right.html')
        ]);

        console.log('레이아웃 컴포넌트 로드 완료');
    } catch (error) {
        console.error('레이아웃 로딩 실패:', error);
    }
}

// 네비게이션 버튼 이벤트 설정 (즉시 실행)
function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    console.log('네비게이션 버튼 찾음:', navBtns.length);

    if (navBtns.length > 0) {
        navBtns.forEach(btn => {
            const page = btn.getAttribute('data-page');
            console.log(`버튼 이벤트 설정:`, page);

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('버튼 클릭됨:', page);
                navigateToPage(page);
            });
        });
        console.log('모든 네비게이션 이벤트 설정 완료');
    } else {
        console.log('네비게이션 버튼을 찾을 수 없습니다! 재시도 중...');
        // 컴포넌트가 아직 로드되지 않은 경우 최소한의 재시도
        setTimeout(setupNavigation, 100); // 100ms 후 1회만 재시도
    }
}

// URL에서 현재 블로그 소유자 닉네임 추출
function getCurrentNickname() {
    const currentPath = window.location.pathname;
    const match = currentPath.match(/^\/blog\/@([^\/]+)/);
    if (match) {
        try {
            return decodeURIComponent(match[1]);
        } catch (e) {
            return match[1];
        }
    }
    return null;
}

// 페이지 네비게이션 함수 (즉시 반응)
function navigateToPage(page) {
    const currentNickname = getCurrentNickname();
    if(!currentNickname) {
        alert('로그인이 필요합니다.');
        window.location.href = '/member/login';
        return;
    }

    console.log(`즉시 페이지 이동 시작: ${page}`);

    // 즉시 UI 업데이트 (지연 없음)
    setActiveNavButton(page);
    setPageTitleImmediately(page);

    // 페이지 내용 로드
    loadPageContent(page, currentNickname);

    // URL 변경
    const encodedNickname = encodeURIComponent(currentNickname);
    const newUrl = `/blog/@${encodedNickname}${page === 'home' ? '' : '/' + page}`;
    history.pushState({page}, '', newUrl);

    console.log(`페이지 이동 완료: ${page}`);
}

// 음악 위젯 이벤트 설정
function setupMusicWidget() {
    // 즉시 확인, 없으면 옵저버로 감시
    const listBtn = document.getElementById('list-btn');
    if (listBtn) {
        setupListButtonEvent(listBtn);
        return;
    }

    // 컴포넌트가 아직 로드되지 않은 경우 옵저버 사용
    const observer = new MutationObserver(() => {
        const listBtn = document.getElementById('list-btn');
        if (listBtn) {
            setupListButtonEvent(listBtn);
            observer.disconnect();
        }
    });

    const topContainer = document.getElementById('top-container');
    if (topContainer) {
        observer.observe(topContainer, {
            childList: true,
            subtree: true
        });
    }
}

// LIST 버튼 이벤트 설정
function setupListButtonEvent(listBtn) {
    listBtn.addEventListener('click', () => {
        const currentNickname = getCurrentNickname();
        if (currentNickname) {
            navigateToPage('jukebox');
        } else {
            window.location.href = '/blog/jukebox';
        }
    });
    console.log('LIST 버튼 이벤트 설정 완료');
}

// 현재 페이지에 맞는 네비 버튼 활성화 (즉시 실행)
function setActiveNavButton(currentPage) {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-page') === currentPage) {
            btn.classList.add('active');
        }
    });
    console.log(`네비 버튼 즉시 변경: ${currentPage}`);
}

// 페이지 제목 변경 함수 (즉시 실행)
function setPageTitle(title) {
    const titleEl = document.getElementById('page-title');
    if (titleEl) {
        titleEl.textContent = title;
        console.log(`제목 즉시 변경: ${title}`);
    }
}

// 즉시 제목 변경 함수
function setPageTitleImmediately(page) {
    const pageTitle = PAGE_TITLES[page] || '홈';
    setPageTitle(pageTitle);
}

// 외부에서 호출 가능한 함수들로 노출
window.setActiveNavButton = setActiveNavButton;
window.setPageTitle = setPageTitle;
window.navigateToPage = navigateToPage;

// 페이지 제목 매핑 테이블
const PAGE_TITLES = {
    'home': '홈', 
    'shop': '상점', 
    'profile': '프로필', 
    'post': '게시판', 
    'jukebox': '주크박스', 
    'mylog': '마이로그', 
    'guestbook': '방명록'
}

// URL 기반 페이지 제목 자동 설정 (즉시 실행)
function setPageTitleByUrl() {
    const currentPath = window.location.pathname;
    let pageKey = 'home';

    const match = currentPath.match(/\/blog\/@[^\/]+\/(.+)/);
    if (match) {
        pageKey = match[1];
    } else if (currentPath.match(/\/blog\@[^\/]+$/)) {
        pageKey = 'home';
    }

    let pageTitle = PAGE_TITLES[pageKey];
    if (!pageTitle && pageKey.includes('/')) {
        const parentKey = pageKey.split('/')[0];
        pageTitle = PAGE_TITLES[parentKey];
    }
    pageTitle = pageTitle || '홈';

    // 즉시 설정 (setTimeout 제거)
    setPageTitle(pageTitle);
}

// 페이지 컨텐츠 동적 로드
async function loadPageContent(page, nickname) {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    try {
        // 즉시 로딩 표시
        mainContent.innerHTML = '<div style="text-align: center; padding: 50px; color: #666;">로딩 중...</div>';

        const encodedNickname = encodeURIComponent(nickname);
        const pageUrls = {
            'home': `/blog/@${encodedNickname}`, 
            'shop': `/blog/@${encodedNickname}/shop`, 
            'profile': `/blog/@${encodedNickname}/profile`, 
            'post': `/blog/@${encodedNickname}/post`, 
            'jukebox': `/blog/@${encodedNickname}/jukebox`, 
            'mylog': `/blog/@${encodedNickname}/mylog`, 
            'guestbook': `/blog/@${encodedNickname}/guestbook`
        };

        console.log(`페이지 로드 시도: ${pageUrls[page]}`);

        const response = await fetch(pageUrls[page]);

        if (response.ok) {
            const html = await response.text();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const pageContent = tempDiv.querySelector('.main-content')?.innerHTML;

            if (pageContent) {
                mainContent.innerHTML = pageContent;
                console.log(`${page} 페이지 콘텐츠 삽입 완료`);
                
                // 즉시 페이지 초기화
                initializePage(page);
                console.log(`${page} 페이지 로드 성공`);
            } else {
                throw new Error('main-content를 찾을 수 없습니다.');
            }
        } else {
            throw new Error(`페이지 로드 실패: ${response.status}`);
        }

    } catch (error) {
        console.error('페이지 로드 오류:', error);
        mainContent.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <h3>※ 페이지 준비 중</h3>
                <p>${page} 페이지가 아직 개발 중입니다.</p>
                <button onclick="navigateToPage('home')" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">홈으로 돌아가기</button>
            </div>
        `;
    }
}

// 페이지별 초기화 함수 (즉시 실행)
function initializePage(page) {
    // 각 페이지별 초기화 함수가 있으면 즉시 호출
    const initFunctionName = `setup${page.charAt(0).toUpperCase() + page.slice(1)}Features`;

    if (typeof window[initFunctionName] === 'function') {
        window[initFunctionName]();
        console.log(`${page} 페이지 초기화 완료`);
    } else {
        console.log(`${page} 페이지는 별도 초기화 함수가 없습니다.`);
    }

    // 공통 데이터 로드도 즉시 실행
    if (typeof window.loadUserData === 'function') {
        window.loadUserData();
    }

    if (typeof window.loadBlogSkin === 'function') {
        window.loadBlogSkin();
    }
}

// 브라우저 뒤로가기 지원
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.page) {
        const currentNickname = getCurrentNickname();
        if (currentNickname) {
            loadPageContent(event.state.page, currentNickname);
            setActiveNavButton(event.state.page);
            setPageTitleByUrl();
        }
    }
});

console.log('layout.js 로드 완료 - 즉시 반응 모드');