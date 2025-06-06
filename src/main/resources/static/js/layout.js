// layout.js - 공통 레이아웃 및 네비게이션 관리

document.addEventListener('DOMContentLoaded', async () => {
    // 컴포넌트 로드
    await loadLayoutComponents();
    
    // 페이지별 제목 자동 설정
    setPageTitleByUrl();

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

    setTimeout(() => {
        const navBtns = document.querySelectorAll('.nav-btn');
        console.log('네비게이션 버튼 찾음:', navBtns.length) // 디버깅

        if (navBtns.length > 0) {
            navBtns.forEach(btn => {
                const page = btn.getAttribute('data-page');
                console.log(`버튼 이벤트 설정:`, page); // 디버깅

                btn.addEventListener('click', (e) => {
                    e.preventDefault(); // 기본 동작 방지
                    console.log('버튼 클릭됨:', page) // 디버깅
                    navigateToPage(page);
                });
            });
            console.log('모든 네비게이션 이벤트 설정 완료');
        } else {
            console.log('네비게이션 버튼을 찾을 수 없습니다!');
        }
    }, 1000); // 1초 후 실행
    
}

// URL에서 현재 블로그 소유자 닉네임 추출
function getCurrentNickname() {
    const currentPath = window.location.pathname;
    const match = currentPath.match(/^\/blog\/@([^\/]+)/);
    if (match) {
        // 항상 디코딩된 상태로 반환
        try {
            return decodeURIComponent(match[1]);
        } catch (e) {
            // 이미 디코딩된 상태면 그대로 반환
            return match[1];
        }
    }
    return null;
}

// 페이지 네비게이션 함수 (SPA 방식)
function navigateToPage(page) {

    // 현재 창에서 이동
    const currentNickname = getCurrentNickname();
    if(!currentNickname) {
        alert('로그인이 필요합니다.');
        window.location.href = '/member/login';
        return;
    }

    // 즉시 제목과 네비 버튼 변경 (페이지 로드 전에!)
    setActiveNavButton(page);
    setPageTitleImmediately(page); // 즉시 제목 변경 함수 호출

    // 페이지 내용만 동적으로 변경
    loadPageContent(page, currentNickname);

    // 새로고침 없이 URL 변경
    const encodedNickname = encodeURIComponent(currentNickname);
    const newUrl = `/blog/@${encodedNickname}${page === 'home' ? '' : '/' + page}`;
    history.pushState({page}, '', newUrl);

    // 네비 버튼 활성화 & 제목 변경
    setActiveNavButton(page);
    setPageTitleByUrl();

}

// 음악 위젯 이벤트 설정
function setupMusicWidget() {
    // LIST 버튼 감시 (컴포넌트 로드 후)
    const observer = new MutationObserver(() => {
        const listBtn = document.getElementById('list-btn');
        if (listBtn) {
            listBtn.addEventListener('click', () => {
                // 현재 블로그 닉네임 가져오기
                const currentNickname = getCurrentNickname();
                if (currentNickname) {
                    // SPA 방식으로 주크박스 페이지로 이동
                    navigateToPage('jukebox');
                } else {
                    // fallback(폴백): 직접 이동
                    window.location.href = '/blog/jukebox';
                }
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
    // 즉시 변경
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-page') === currentPage) {
            btn.classList.add('active');
        }
    });
    console.log(`네비 버튼 즉시 변경: ${currentPage}`);
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

// 페이지 제목 매핑 테이블
const PAGE_TITLES = {
    // 기본 페이지들
    'home': '홈', 
    'shop': '상점', 
    'profile': '프로필', 
    'post': '게시판', 
    'jukebox': '주크박스', 
    'mylog': '마이로그', 
    'guestbook': '방명록'
}

// URL 기반 페이지 제목 자동 설정
function setPageTitleByUrl() {
    const currentPath = window.location.pathname;

    // URL에서 페이지 식별
    let pageKey = 'home'; // 기본값

    // /blog/@nickname/xxx 패턴에서 xxx 추출
    const match = currentPath.match(/\/blog\/@[^\/]+\/(.+)/);
    if (match) {
        pageKey = match[1]; // shop, profile, ... 등등
    } else if (currentPath.match(/\/blog\@[^\/]+$/)) {
        pageKey = 'home' // 블로그 홈
    }

    // 먼저 정확한 key로 찾고, 없으면 상위 페이지로 폴백(fallback, 대체)
    let pageTitle = PAGE_TITLES[pageKey];

    if (!pageTitle && pageKey.includes('/')) {
        // 만약 profile/items(구매/보유내역)이면 -> 'profile'로 폴백
        const parentKey = pageKey.split('/')[0];
        pageTitle = PAGE_TITLES[parentKey];
    }

    pageTitle = pageTitle || '홈'; // 최종 폴백

    // 컴포넌트 로드 후 제목 설정
    setTimeout(() => {
        setPageTitle(pageTitle);
    }, 200);

};

// 페이지 컨텐츠 동적 로드
async function loadPageContent(page, nickname) {
    
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    try {
        // 로딩 표시
        mainContent.innerHTML = '<div style="text-align: center; padding: 50px;">로딩 중...</div>';

        // 닉네임을 항상 인코딩해서 URL 생성
        const encodedNickname = encodeURIComponent(nickname);

        // 블로그 페이지(7) URL
        const pageUrls = {
            'home': `/blog/@${encodedNickname}`, 
            'shop': `/blog/@${encodedNickname}/shop`, 
            'profile': `/blog/@${encodedNickname}/profile`, 
            'post': `/blog/@${encodedNickname}/post`, 
            'jukebox': `/blog/@${encodedNickname}/jukebox`, 
            'mylog': `/blog/@${encodedNickname}/mylog`, 
            'guestbook': `/blog/@${encodedNickname}/guestbook`
        };

        console.log(`페이지 로드 시도: ${pageUrls[page]}`); // 디버깅 로그

        const response = await fetch(pageUrls[page]);

        if (response.ok) {
            const html = await response.text();

            // HTML에서 main-content 부분만 추출
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const pageContent = tempDiv.querySelector('.main-content')?.innerHTML;

            if (pageContent) {
                mainContent.innerHTML = pageContent;
                console.log(`${page} 페이지 콘텐츠 삽입 완료`); // 디버깅
                initializePage(page); // 페이지별 초기화 함수 호출
                console.log(`${page} 페이지 로드 성공`);
            } else {
                // 디버깅 코드 추가
                console.log('=== 디버깅 정보 ===');
                console.log('전체 HTML 길이:', html.length);
                console.log('tempDiv 내용 (처음 1000자):', tempDiv.innerHTML.substring(0, 1000));
                console.log('main-content 요소 찾기 결과:', tempDiv.querySelector('.main-content'));
                console.log('===================');

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
                <button onclick="navigateToPage('home')" style="padding: 10px 20px; margin-top: 20px;">홈으로 돌아가기</button>
            </div>
        `;
    }

}

// 페이지별 초기화 함수
function initializePage(page) {
    
    // 각 페이지별 초기화 함수가 있으면 호출
    const initFunctionName = `setup${page.charAt(0).toUpperCase() + page.slice(1)}Features`;

    if (typeof window[initFunctionName] === 'function') {
        window[initFunctionName]();
        console.log(`${page} 페이지 초기화 완료`);
    } else {
        console.log(`$${page} 페이지는 별도 초기화 함수가 없습니다.`);
    }

    // 디버깅 로그 추가
    console.log('=== 공통 데이터 로드 시작 ===');
    console.log('window.loadUserData 존재:', typeof window.loadUserData);
    console.log('window.loadBlogSkin 존재:', typeof window.loadBlogSkin);

    // 모든 페이지에서 공통 데이터 로드
    if (typeof window.loadUserData === 'function') {
        console.log('loadUserData 호출 시작'); // 디버깅
        setTimeout(() => {
            window.loadUserData();
        }, 100);
    }

    // 모든 페이지에서 스킨 로드
    if (typeof window.loadBlogSkin === 'function') {
        console.log('loadBlogSkin 호출 시작'); // 디버깅
        setTimeout(() => {
            window.loadBlogSkin();
        }, 100);
    } else {
        console.log('loadBlogSkin 함수를 찾을 수 없음'); // 디버깅
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

// 즉시 제목 변경 함수
function setPageTitleImmediately(page) {
    // 먼저 정확한 key로 찾고, 없으면 상위 페이지로 폴백
    let pageTitle = PAGE_TITLES[page];

    if (!pageTitle && page.includes('/')) {
        const parentKey = page.split('/')[0];
        pageTitle = PAGE_TITLES[parentKey];
    }

    pageTitle = pageTitle || '홈';

    // 즉시 변경 (setTimeout 없이)
    const titleEl = document.getElementById('page-title');
    if (titleEl) {
        titleEl.textContent = pageTitle;
        console.log(`제목 즉시 변경: ${pageTitle}`);
    }

}