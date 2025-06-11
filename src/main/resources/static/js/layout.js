// layout.js - 공통 레이아웃 및 네비게이션 관리

// === 전역 변수 ===
let cachedSkinInfo = null; // 스킨 정보 캐시
let skinInfoloaded = false; // 스킨 정보 로드 완료 여부
let cachedProfileImage = null; // 프로필 이미지 캐시
let profileImageLoaded = false; // 프로필 이미지 로드 완료 여부

document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== Layout 초기화 시작 ===');
    
    await loadLayoutComponents(); // 1. 컴포넌트 로드
    setupNavigation(); // 2. 네비게이션 즉시 설정 (컴포넌트 로드 완료 후)
    setPageTitleByUrl(); // 3. 페이지별 제목 자동 설정
    setupMusicWidget(); // 4. 음악 위젯 이벤트
    setupEditButtonEvent(); // 5. 블로그 좌측 EDIT 버튼 이벤트

    // 스킨 정보 미리 캐싱 (최초 로드시)
    await maintainDefaultSkinForInactiveUsers(); // 6. 즉시 스킨 유지 + 캐싱
    await loadUserProfileImage(); // 7. 프로필 이미지 캐시 초기화
    
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

// 공통 레이아웃 컴포넌트들(home_left, home_top, home_right) 로드
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
        return; // 성공 시 즉시 종료
    }

    // 버튼이 없는 경우 - MutationObserver 사용 (즉시 반응)
    console.log('네비게이션 버튼을 찾을 수 없음 - 옵저버 설정');
    setupNavigationObserver();
}

// 네비게이션 옵저버 설정 (즉시 반응)
function setupNavigationObserver() {
    const observer = new MutationObserver((mutations) => {
        // DOM 변경이 있을 때마다 즉시 확인
        const navBtns = document.querySelectorAll('.nav-btn');

        if (navBtns.length > 0) {
            console.log('옵저버가 네비게이션 버튼 발견:', navBtns.length);

            navBtns.forEach(btn => {
                const page = btn.getAttribute('data-page');

                // 이미 이벤트가 설정된 버튼인지 확인
                if (!btn.hasAttribute('data-event-set')) {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        console.log('버튼 클릭됨:', page);
                        navigateToPage(page);
                    });

                    // 이벤트 설정 완료 표시
                    btn.setAttribute('data-event-set', 'true');
                    console.log(`옵저버로 버튼 이벤트 설정: ${page}`);
                }
            });

            console.log('옵저버로 모든 네비게이션 이벤트 설정 완료');
            observer.disconnect(); // 작업 완료 후 옵저버 해제
        }
    });

    // right-container 감시 (네비게이션 버튼이 들어가는 곳)
    const rightContainer = document.getElementById('right-container');

    if (rightContainer) {
        observer.observe(rightContainer, {
            childList: true, 
            subtree: true
        });
        console.log('네비게이션 옵저버 시작 - right-container 감시');
    } else {
        // right-container도 없으면 전체 body 감시
        observer.observe(document.body, {
            childList: true, 
            subtree: true
        });
        console.log('네비게이션 옵저버 시작 - body 감시');
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

// === 블로그 좌측 EDIT 기능 관련 함수 시작 ===
//
async function setupEditButtonEvent() {
    // EDIT 버튼이 로드될 때까지 기다리기
    const editBtn = document.querySelector('.edit');

    if (editBtn) {
        setupEditButtonClick(editBtn);
        return;
    }

    // 버튼이 없으면 옵저버로 감시
    const observer = new MutationObserver(() => {
        const editBtn = document.querySelector('.edit');
        if (editBtn) {
            setupEditButtonClick(editBtn);
            observer.disconnect(); // 작업 완료 후 옵저버 해제
        }
    });

    // left-container 감시 (EDIT 버튼이 들어가는 곳)
    const leftContainer = document.getElementById('left-container');
    if (leftContainer) {
        observer.observe(leftContainer, {
            childList: true, 
            subtree: true
        });
    }
}

// EDIT 버튼 클릭 이벤트 설정
function setupEditButtonClick(editBtn) {
    editBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const currentNickname = getCurrentNickname();
        if (!currentNickname) {
            alert('로그인이 필요합니다.');
            window.location.href = '/member/login';
            return;
        }

        console.log('EDIT 버튼 클릭 - 개인정보 조회/수정으로 이동');

        // 프로필 페이지로 이동 후 개인정보 탭 활성화
        navigateToProfileEdit();
    });

    console.log('EDIT 버튼 이벤트 설정 완료');
}

// 프로필 개인정보 수정으로 이동하는 함수
function navigateToProfileEdit() {
    const currentNickname = getCurrentNickname();
    if (!currentNickname) return;

    console.log('프로필 개인정보 조회/수정으로 이동 시작');

    // 1. 프로필 페이지로 이동
    navigateToPage('profile');

    // 2. 페이지 로드 완료 후 개인정보 탭으로 전환
    setTimeout(() => {
        // 개인정보 수정 탭 버튼 찾기
        const editTabBtn = document.getElementById('btn-edit');
        if (editTabBtn) {
            editTabBtn.click(); // 개인정보 탭으로 전환
            console.log('개인정보 조회/수정 탭 활성화');
        } else {
            console.log('개인정보 탭 버튼을 찾을 수 없음!');
        }
    }, 100); // 페이지 로드 대기시간
}
//
// === 블로그 좌측 EDIT 기능 관련 함수 끝 ===

// === 스킨 비활성화 회원만을 위한 기본 스킨 유지 함수 ===
async function maintainDefaultSkinForInactiveUsers() {
    const nickname = getCurrentNickname();
    if (!nickname) return;

    // 캐시된 스킨 정보가 있으면 즉시 적용
    if (cachedSkinInfo) {
        console.log('캐시된 스킨 정보 사용:', cachedSkinInfo);
        applyCachedSkin();
        return;
    }
    
    // 1. 즉시 기본 스킨 적용 (캐시가 없을 때만)
    if (!skinInfoloaded) {
        applyDefaultSkinOnly();
    }

    // 2. API로 실제 상태 확인 후 조정 및 캐싱
    try {
        const encodedNickname = encodeURIComponent(nickname);
        const response = await fetch(`/blog/api/@${encodedNickname}/skin`);

        if (response.ok) {
            const skinData = await response.json();
            console.log('스킨 상태 확인:', skinData);

            // 스킨 정보 캐싱
            cachedSkinInfo = skinData;
            skinInfoloaded = true;

            applyCachedSkin();
        } 
    } catch (error) {
        console.error('스킨 상태 확인 중 오류:', error);
        // 오류 시에도 기본 스킨은 이미 적용되어 있음
    }
}

// 캐시된 스킨 정보로 스킨 적용
function applyCachedSkin() {
    const frame = document.querySelector('.frame');
    
    // frame 요소가 없으면 함수 종료 (에러 방지)
    if (!frame) {
        console.warn('frame 요소를 찾을 수 없습니다. 스킨 적용을 건너뜁니다.');
        return;
    };
    console.log('applyCachedSkin 실행 - 캐시 정보:', cachedSkinInfo);

    if (cachedSkinInfo.skinActive === 'Y' && cachedSkinInfo.skinImage) {
        // 스킨 활성화 회원 - 커스텀 스킨 적용
        console.log('커스텀 스킨 적용 시도:', cachedSkinInfo.skinImage);

        frame.style.backgroundImage = `url("${cachedSkinInfo.skinImage}")`;
        frame.style.backgroundSize = 'cover';
        frame.style.backgroundPosition = 'center';
        frame.style.backgroundRepeat = 'no-repeat';
        frame.classList.add('has-skin', 'skin-loaded');

        console.log('캐시된 커스텀 스킨 적용:', cachedSkinInfo.skinImage);
    } else {
        // 스킨 비활성화 회원 - 기본 스킨 적용
        console.log('기본 스킨 적용');
        applyDefaultSkinOnly();
    }
};

// 캐시 강제 업데이트 함수
// 프로필에서 스킨 변경 후 호출할 함수
window.updateSkinCache = async function(newSkinInfo) {
    console.log('스킨 캐시 강제 업데이트:', newSkinInfo);

    if (newSkinInfo) {
        // 새로운 스킨 정보로 캐시 직접 업데이트
        cachedSkinInfo = {
            skinActive: newSkinInfo.skinActive || 'Y', 
            skinImage: newSkinInfo.skinImage
        };

        console.log('캐시 업데이트 완료:', cachedSkinInfo);

        // 즉시 스킨 적용
        applyCachedSkin();
    } else {
        // 새로운 정보가 없으면 API로 최신 정보 가져오기
        await forceRefreshSkinCache();
    }
}

// 캐시 강제 새로고침 함수
window.forceRefreshSkinCache = async function() {
    console.log('스킨 캐시 강제 새로고침 시작');

    const nickname = getCurrentNickname();
    if (!nickname) return;

    try {
        // 기존 캐시 무효화
        cachedSkinInfo = null;
        skinInfoloaded = false;

        console.log('기존 캐시 무효화 완료');

        // 최신 스킨 정보 가져오기
        const encodedNickname = encodeURIComponent(nickname);
        const response = await fetch(`/blog/api/@${encodedNickname}/skin?t=${Date.now()}`); // 캐시 방지용 타임스탬프

        if (response.ok) {
            const skinData = await response.json();
            console.log('최신 스킨 정보 로드:', skinData);

            // 새로운 정보로 캐시 업데이트
            cachedSkinInfo = skinData;
            skinInfoloaded = true;

            // 즉시 적용
            applyCachedSkin();

            console.log('스킨 캐시 새로고침 완료');
        } else {
            console.error('스킨 정보 로드 실패:', response.status);
        }
    } catch (error) {
        console.error('스킨 캐시 새로고침 중 오류:', error);
    }
}

// 캐시 무효화 함수
window.invalidateSkinCache = function() {
    console.log('스킨 캐시 무효화');
    cachedSkinInfo = null;
    skinInfoloaded = false;
}

// === 기본 스킨만 적용 (스킨 비활성화 회원용) ===
function applyDefaultSkinOnly() {
    const frame = document.querySelector('.frame');
    if (frame) {
        frame.style.backgroundImage = 'url("/images/skins/triplog_skin_default.png")';
        frame.style.backgroundSize = 'cover';
        frame.style.backgroundPosition = 'center';
        frame.style.backgroundRepeat = 'no-repeat';
        frame.classList.remove('has-skin'); // 커스텀 스킨 클래스 제거
        frame.classList.add('skin-loaded');
        console.log('기본 스킨 적용 완료 (스킨 비활성화 회원용)');
    }
}

// === 프로필 이미지 캐시 관리 함수들 시작 ===
//
// 프로필 이미지 캐시 업데이트 (전역 함수)
window.updateProfileImageCache = function(newProfileImageUrl) {
    console.log('프로필 이미지 캐시 업데이트:', newProfileImageUrl);

    // 캐시 업데이트
    cachedProfileImage = newProfileImageUrl;
    profileImageLoaded = true;

    // 모든 페이지의 프로필 이미지 즉시 업데이트
    updateAllProfileImages(newProfileImageUrl);
}

// 모든 프로필 이미지 업데이트
function updateAllProfileImages(profileImageUrl) {
    if (!profileImageUrl) return;

    const timestamp = Date.now(); // 캐시 무효화 용도
    const imageUrlWithCache = profileImageUrl + '?t=' + timestamp;

    console.log('모든 프로필 이미지 업데이트 시작:', imageUrlWithCache);

    // 1. 사이드바 프로필 이미지
    const sideProfileImg = document.querySelector('.profile-pic img');
    if (sideProfileImg) {
        sideProfileImg.src = imageUrlWithCache;
        console.log('사이드바 프로필 이미지 업데이트');
    }

    // 2. 프로필 페이지의 이미지들
    const currentProfileImg = document.getElementById('current-profile-img');
    if (currentProfileImg) {
        currentProfileImg.src = imageUrlWithCache;
        console.log('프로필 페이지 현재 이미지 업데이트');
    }

    const editPreviewImg = document.getElementById('edit-preview-img');
    if (editPreviewImg) {
        editPreviewImg.src = imageUrlWithCache;
        console.log('프로필 페이지 미리보기 이미지 업데이트');
    }

    // 3. 기타 모든 프로필 이미지 (CSS 선택자로 찾기)
    const allProfileImages = document.querySelectorAll(`
        img[src*="/uploads/profiles/"], 
        img[src*="placeholder"], 
        .profile-image, 
        .user-profile-img,
        img[alt*="프로필"],
        img[alt*="profile"]
    `);

    allProfileImages.forEach((img, index) => {
        // 이미 업데이트한 이미지는 제외
        if (img !== sideProfileImg && 
        img !== currentProfileImg && 
        img !== editPreviewImg) {
            img.src = imageUrlWithCache;
            console.log(`추가 프로필 이미지 ${index + 1} 업데이트`);
        }
    });

    console.log(`총 ${allProfileImages.length}개의 프로필 이미지 업데이트 완료.`);    
}

// 캐시된 프로필 이미지 적용 (페이지 로드시)
function applyCachedProfileImage() {
    if (cachedProfileImage && profileImageLoaded) {
        console.log('캐시된 프로필 이미지 적용:', cachedProfileImage);
        updateAllProfileImages(cachedProfileImage);
    }
}

// 프로필 이미지 캐시 초기화 (사용자 정보 로드시)
async function loadUserProfileImage() {
    const nickname = getCurrentNickname();
    if (!nickname || profileImageLoaded) return;

    // 이미 로드되었으면 스킵
    if (profileImageLoaded && cachedProfileImage) {
        console.log('이미 캐시된 프로필 이미지 사용:', cachedProfileImage);
        updateAllProfileImages(cachedProfileImage);
        return;
    }

    try {
        // 사용자 정보에서 프로필 이미지 가져오기 (API 호출)
        const encodedNickname = encodeURIComponent(nickname);
        const response = await fetch(`/blog/api/@${encodedNickname}/user-info`);

        if (response.ok) {
            const userData = await response.json();
            console.log('사용자 정보 로드:', userData);

            if (userData.profileImage) {
                cachedProfileImage = userData.profileImage;
                profileImageLoaded = true;
                console.log('프로필 이미지 캐시 초기화:', cachedProfileImage);

                // 즉시 모든 이미지 업데이트
                updateAllProfileImages(cachedProfileImage);
            } else {
                console.log('프로필 이미지가 설정되지 않음 - 기본 이미지 사용');
                // 기본 placeholder 이미지 사용
                const defaultImage = '/images/default_profile.png';
                cachedProfileImage = defaultImage;
                profileImageLoaded = true;
                updateAllProfileImages(defaultImage);
            }
        } else {
            console.error('사용자 정보 로드 실패:', response.status);
        }
    } catch (error) {
        console.error('프로필 이미지 로드 실패:', error);
    }
}
// 
// === 프로필 이미지 캐시 관리 함수들 종료 ===

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

    // 캐시 상태 체크 후 스킨 적용
    requestAnimationFrame(() => {
        if (cachedSkinInfo) {
            console.log('캐시된 스킨 정보 사용:', cachedSkinInfo);
            applyCachedSkin(); // 캐시된 정보로 즉시 적용
        } else {
            console.log('캐시가 없어서 스킨 정보 로드');
            maintainDefaultSkinForInactiveUsers(); // 최초 로드시만 API 호출
        }
    });

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

// 페이지 제목 매핑 테이블
const PAGE_TITLES = {
    'home': '홈', 
    'shop': '상점', 
    'profile': '프로필', 
    'post': '게시판', 
    'jukebox': '주크박스', 
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

    // 즉시 설정
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

    // 캐시된 프로필 이미지 적용 (모든 페이지에서)
    applyCachedProfileImage();

    // 프로필 이미지가 아직 로드되지 않았으면 로드
    if (!profileImageLoaded) {
        loadUserProfileImage();
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

// 전역 함수로 노출
window.setActiveNavButton = setActiveNavButton;
window.setPageTitle = setPageTitle;
window.navigateToPage = navigateToPage;
window.maintainDefaultSkinForInactiveUsers = maintainDefaultSkinForInactiveUsers;
window.navigateToProfileEdit = navigateToProfileEdit;