// layout.js - 공통 레이아웃 및 네비게이션 관리

document.addEventListener('DOMContentLoaded', async () => {
    // 컴포넌트 로드
    await loadLayoutComponents();
    
    // 네비게이션 이벤트 설정
    setupNavigation();
    
    // 음악 위젯 이벤트
    setupMusicWidget();
});

// 개별 컴포넌트 로드 함수
async function loadComponent(containerId, componentPath) {
    console.log(`컴포넌트 로딩 시도: ${componentPath}`); // 추가

    try {
        const response = await fetch(componentPath);
        console.log(`응답 상태: ${response.status}`); // 추가
        if (!response.ok) {
            throw new Error(`HTTP 에러! 상태: ${response.status}`)
        }
        const html = await response.text();
        console.log(`HTML 로드 성공: ${componentPath}`); // 추가

        // body 태그 내용만 추출
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const bodyContent = tempDiv.querySelector('body')?.innerHTML || html;

        document.getElementById(containerId).innerHTML = bodyContent;
        console.log(`컴포넌트 삽입 완료: ${containerId}`); // 추가
    } catch (error) {
        console.error(`컴포넌트 로딩 실패 ${componentPath}:`, error)
    }
}

// 공통 레이아웃 컴포넌트들 로드
async function loadLayoutComponents() {
    try {
        // 왼쪽 사이드 로드
        await loadComponent('left-container', '/components/home_left.html');

        // 상단 헤더 로드  
        await loadComponent('top-container', '/components/home_top.html');

        // 오른쪽 네비 로드
        await loadComponent('right-container', '/components/home_right.html');

        console.log('레이아웃 컴포넌트 로드 완료');
    } catch (error) {
        console.error('레이아웃 로딩 실패:', error);
    }
}

// 네비게이션 버튼 이벤트 설정
function setupNavigation() {
    // 네비게이션 버튼들 감시 (컴포넌트 로드 후)
    const observer = new MutationObserver(() => {
        const navBtns = document.querySelectorAll('.nav-btn');
        if (navBtns.length > 0) {
            navBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const page = btn.getAttribute('data-page');
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
function navigateToPage(page) {
    const pageMap = {
        'home': '/blog/home', // 블로그_홈
        'shop': '/blog/shop', // 상점
        'profile': '/blog/profile', // 프로필
        'post': '/blog/post', // 게시판
        'jukebox': '/blog/jukebox', // 주크박스
        'mylog': '/blog/mylog', // 마이로그
        'guestbook': '/blog/guestbook' // 방명록
    };

    const url = pageMap[page];
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
    setTimeout(() => {
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-page') === currentPage) {
                btn.classList.add('active');
            }
        });
    }, 100); // 전환시간: 0.1초 (sec)
}

// 페이지 제목 변경 함수
function setPageTitle(title) {
    setTimeout(() => {
        const titleEl = document.getElementById('page-title');
        if (titleEl) {
            titleEl.textContent = title;
        }
    }, 100);
}

// 외부에서 호출 가능한 함수들로 노출
window.setActiveNavButton = setActiveNavButton;
window.setPageTitle = setPageTitle;