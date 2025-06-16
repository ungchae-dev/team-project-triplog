// layout.js - 공통 레이아웃 및 네비게이션 관리

// === 전역 변수 ===
let cachedSkinInfo = null; // 스킨 정보 캐시
let skinInfoloaded = false; // 스킨 정보 로드 완료 여부
let cachedProfileImage = null; // 프로필 이미지 캐시
let profileImageLoaded = false; // 프로필 이미지 로드 완료 여부
let ownedMusic = []; // 소유한 음악 목록
let currentIndex = 0; // 현재 재생 중인 음악 인덱스

// === 사용자 인증 관련 전역 변수 (추가) ===
let currentUserInfo = null; // 현재 로그인한 사용자 정보 캐시
let userInfoLoaded = false; // 사용자 정보 로드 완료 여부

// === 강제 사용자 정보 로드 함수 (재정의) ===
async function forceLoadCurrentUserInfo() {
    console.log('=== forceLoadCurrentUserInfo 함수 시작 ===');
    console.log('기존 userInfoLoaded:', userInfoLoaded);
    console.log('기존 currentUserInfo:', currentUserInfo);

    try {
        console.log('=== 강제 API 호출 시작 ===');
        
        const response = await fetch('/blog/api/current-user', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });

        console.log('=== API 응답 받음 ===');
        console.log('응답 상태:', response.status);
        console.log('응답 ok:', response.ok);

        if (response.ok) {
            const userData = await response.json();
            console.log('받은 사용자 데이터:', userData);
            
            if (userData && userData.memberId) {
                // 전역 변수에 직접 할당
                window.currentUserInfo = {
                    memberId: userData.memberId,
                    nickname: userData.nickname,
                    profileImage: userData.profileImage
                };
                
                window.userInfoLoaded = true;
                
                // 지역 변수도 업데이트
                currentUserInfo = window.currentUserInfo;
                userInfoLoaded = window.userInfoLoaded;
                
                console.log('=== 강제 사용자 정보 설정 완료 ===');
                console.log('window.currentUserInfo:', window.currentUserInfo);
                console.log('window.userInfoLoaded:', window.userInfoLoaded);
                console.log('지역 currentUserInfo:', currentUserInfo);
                console.log('지역 userInfoLoaded:', userInfoLoaded);
                
                return currentUserInfo;
            } else {
                console.error(' 사용자 데이터가 유효하지 않음:', userData);
                return null;
            }
            
        } else if (response.status === 401) {
            console.log('401: 로그인되지 않은 상태');
            return null;
            
        } else {
            console.error('API 호출 실패:', response.status);
            const errorText = await response.text();
            console.error('에러 내용:', errorText);
            return null;
        }
        
    } catch (error) {
        console.error('=== 강제 API 호출 중 예외 발생 ===');
        console.error('에러:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== Layout 초기화 시작 ===');
    
    await loadLayoutComponents(); // 1. 컴포넌트 로드
    console.log('레이아웃 컴포넌트 로드 완료');

    setupNavigation(); // 2. 네비게이션 즉시 설정
    console.log('네비게이션 설정 완료');

    setPageTitleByUrl(); // 3. 페이지별 제목 자동 설정
    setupMusicWidget(); // 4. 음악 위젯 이벤트
    setupEditButtonEvent(); // 5. 블로그 좌측 EDIT 버튼 이벤트

    // === 강제 사용자 정보 로드 ===
    console.log('=== 강제 사용자 정보 로드 시작 ===');
    try {
        const userInfo = await forceLoadCurrentUserInfo();
        console.log('강제 로드 결과:', userInfo);
    } catch (error) {
        console.error('강제 사용자 정보 로드 중 오류:', error);
    }
    console.log('=== 강제 사용자 정보 로드 완료 ===');

    // 이웃 기능 초기화 (사용자 정보 로드 후)
    setTimeout(() => {
        if (typeof window.initNeighborFeatures === 'function') {
            window.initNeighborFeatures();
            console.log('이웃 기능 초기화 완료');
        } else {
            console.log('neighbor.js가 아직 로드되지 않음');
            // neighbor.js 로드 대기
            const neighborInterval = setInterval(() => {
                if (typeof window.initNeighborFeatures === 'function') {
                    window.initNeighborFeatures();
                    console.log('이웃 기능 지연 초기화 완료');
                    clearInterval(neighborInterval);
                }
            }, 100);

            // 5초 후 타임아웃
            setTimeout(() => clearInterval(neighborInterval), 5000);
        }
    }, 300);

    // 스킨 정보 미리 캐싱 (최초 로드시)
    await maintainDefaultSkinForInactiveUsers(); // 7. 즉시 스킨 유지 + 캐싱
    await loadUserProfileImage(); // 8. 프로필 이미지 캐시 초기화
    
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

// 네비게이션 버튼 이벤트 설정 (권한 체크 적용)
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

                navigateToPageWithAuth(page); // 권한 체크가 포함된 네비게이션 함수 사용
            });
        });
        console.log('모든 네비게이션 이벤트 설정 완료');
        return; // 성공 시 즉시 종료
    }

    // 버튼이 없는 경우 - MutationObserver 사용 (즉시 반응)
    console.log('네비게이션 버튼을 찾을 수 없음 - 옵저버 설정');
    setupNavigationObserver();
}

// 네비게이션 옵저버 설정 (권한 체크 적용)
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
                        navigateToPageWithAuth(page); // 권한 체크가 포함된 네비게이션 함수 사용
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

// === 현재 로그인한 사용자 ID 가져오기 (추가) ===
function getCurrentUserId() {
    if (currentUserInfo) {
        return currentUserInfo.memberId;
    }
    
    // 캐시가 없으면 null 반환 (비동기 로드가 필요함)
    console.warn('사용자 정보가 아직 로드되지 않았습니다.');
    return null;
}

// 블로그 주인 (URL에서 추출)
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

// 현재 로그인한 사용자 닉네임 가져오기
function getCurrentUserNickname() {
    if (currentUserInfo) {
        return currentUserInfo.nickname;
    }
    return null;
}

// === 현재 로그인한 사용자 전체 정보 가져오기 ===
function getCurrentUserInfo() {
    return currentUserInfo;
}

// === 사용자 정보 로드 함수 (비동기) ===
async function loadCurrentUserInfo() {
    console.log('🔍 === loadCurrentUserInfo 함수 시작 ===');
    console.log('🔍 userInfoLoaded:', userInfoLoaded);
    console.log('🔍 currentUserInfo:', currentUserInfo);

    // 이미 로드되었으면 스킵
    if (userInfoLoaded && currentUserInfo) {
        console.log('✅ 이미 로드된 사용자 정보 사용:', currentUserInfo);
        return currentUserInfo;
    }

    try {
        console.log('🔍 === API 호출 시작 ===');
        console.log('🔍 요청 URL: /blog/api/current-user');
        
        // 현재 로그인한 사용자 정보 API
        const response = await fetch('/blog/api/current-user', {
            method: 'GET',
            credentials: 'same-origin', // 세션 쿠키 포함 (중요!)
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });

        console.log('🔍 === API 응답 받음 ===');
        console.log('🔍 응답 상태:', response.status);
        console.log('🔍 응답 상태 텍스트:', response.statusText);
        console.log('🔍 응답 ok:', response.ok);

        if (response.ok) {
            console.log('🔍 === JSON 파싱 시작 ===');
            const userData = await response.json();
            console.log('✅ 파싱된 사용자 데이터:', userData);
            
            if (userData && userData.memberId) {
                // 사용자 정보 캐싱
                currentUserInfo = {
                    memberId: userData.memberId,
                    nickname: userData.nickname,
                    profileImage: userData.profileImage
                };
                
                userInfoLoaded = true;
                console.log('✅ === 사용자 정보 캐싱 완료 ===');
                console.log('✅ currentUserInfo:', currentUserInfo);
                console.log('✅ userInfoLoaded:', userInfoLoaded);
                
                return currentUserInfo;
            } else {
                console.error('❌ 사용자 데이터가 유효하지 않음:', userData);
                userInfoLoaded = true;
                currentUserInfo = null;
                return null;
            }
            
        } else if (response.status === 401) {
            console.log('❌ 401: 로그인되지 않은 상태');
            userInfoLoaded = true;
            currentUserInfo = null;
            return null;
            
        } else if (response.status === 403) {
            console.log('❌ 403: 접근 권한 없음');
            userInfoLoaded = true;
            currentUserInfo = null;
            return null;
            
        } else {
            console.error('❌ API 호출 실패:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('❌ 에러 내용:', errorText);
            userInfoLoaded = true;
            currentUserInfo = null;
            return null;
        }
        
    } catch (error) {
        console.error('❌ === API 호출 중 예외 발생 ===');
        console.error('❌ 에러 객체:', error);
        console.error('❌ 에러 메시지:', error.message);
        console.error('❌ 에러 스택:', error.stack);
        userInfoLoaded = true;
        currentUserInfo = null;
        return null;
    }
}

// === 사용자 인증 확인 함수 ===
function isLoggedIn() {
    // 전역 변수도 확인
    const globalInfo = window.currentUserInfo;
    const globalLoaded = window.userInfoLoaded;
    
    const result = (currentUserInfo !== null && userInfoLoaded) || 
                   (globalInfo !== null && globalLoaded);
    
    console.log('🔍 isLoggedIn 체크:', {
        '지역_currentUserInfo': currentUserInfo,
        '지역_userInfoLoaded': userInfoLoaded,
        '전역_currentUserInfo': globalInfo,
        '전역_userInfoLoaded': globalLoaded,
        'result': result
    });
    
    // 지역 변수가 비어있지만 전역 변수에 값이 있으면 복사
    if (!currentUserInfo && globalInfo) {
        currentUserInfo = globalInfo;
        userInfoLoaded = globalLoaded;
        console.log('🔍 전역 변수를 지역 변수로 복사함');
    }
    
    return result;
}

// === 본인 블로그인지 확인 함수 ===
function isOwnBlog() {
    const urlNickname = getCurrentNickname(); // URL의 닉네임
    const loginNickname = getCurrentUserNickname(); // 로그인한 사용자 닉네임
    
    return urlNickname && loginNickname && urlNickname === loginNickname;
}

// === 사용자 정보 캐시 무효화 함수 ===
function invalidateUserInfoCache() {
    console.log('사용자 정보 캐시 무효화');
    currentUserInfo = null;
    userInfoLoaded = false;
}

// === 사용자 정보 강제 새로고침 함수 ===
async function refreshUserInfo() {
    console.log('사용자 정보 강제 새로고침');
    invalidateUserInfoCache();
    return await loadCurrentUserInfo();
}


// === 블로그 좌측 사용자 정보 시작 ===
// EDIT 버튼 이벤트
async function setupEditButtonEvent() {
    console.log('EDIT 버튼 이벤트 설정 시작');

    // EDIT 버튼이 로드될 때까지 기다리기
    const editBtn = document.querySelector('.edit');

    if (editBtn) {
        await setupEditButtonBehavior(editBtn);
        return;
    }

    // 버튼이 없으면 옵저버로 감시
    const observer = new MutationObserver(async () => {
        const editBtn = document.querySelector('.edit');
        if (editBtn) {
            await setupEditButtonBehavior(editBtn);
            observer.disconnect(); // 작업 완료 후 옵저버 해제
        }
    });

    // EDIT 버튼이 들어가는 left-container
    const leftContainer = document.getElementById('left-container');
    if (leftContainer) {
        observer.observe(leftContainer, {
            childList: true, 
            subtree: true
        });
    }
}

// EDIT 버튼 동작 설정 
async function setupEditButtonBehavior(editBtn) {
    console.log('EDIT 버튼 동작 설정 시작');

    // 사용자 정보 확인
    let userInfo = currentUserInfo;
    if (!userInfo) {
        console.log('사용자 정보가 없어서 강제 로드');
        userInfo = await forceLoadCurrentUserInfo();
    }

    const currentNickname = getCurrentNickname();
    const loginNickname = getCurrentNickname();

    console.log('블로그 주인:', currentNickname);
    console.log('로그인 사용자:', loginNickname);

    // 본인 블로그인지 확인
    const isOwn = currentNickname && loginNickname && currentNickname === loginNickname;

    if (isOwn) {
        // 본인 블로그 - 기존 EDIT 기능 유지
        console.log('본인 블로그 - EDIT 버튼 유지');
        editBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!currentNickname) {
                alert('로그인이 필요합니다!');
                window.location.href = '/member/login';
                return;
            }
            console.log('EDIT 버튼 클릭 - 프로필 편집으로 이동');
            navigateToProfileEdit();
        });
    } else {
        // 다른 사람 블로그 - 이웃 기능으로 전환
        console.log('다른 사람 블로그 - 이웃 기능으로 전환');

        // neighbor.js의 이웃 버튼 초기화 함수 호출
        if (typeof window.initNeighborButtonState === 'function') {
            await window.initNeighborButtonState();
        } else {
            // neighbor.js 로드 대기
            let attempts = 0;
            const maxAttempts = 10;

            const waitForNeighbor = setInterval(async () => {
                attempts++;
                if (typeof window.initNeighborButtonState === 'function') {
                    await window.initNeighborButtonState();
                    console.log('이웃 버튼 지연 초기화 완료');
                    clearInterval(waitForNeighbor);
                } else if (attempts >= maxAttempts) {
                    console.log('neighbor.js 로드 실패 - 수동으로 이웃 버튼 설정');
                    setupNeighborButtonManually(editBtn, currentNickname);
                    clearInterval(waitForNeighbor);
                }
            }, 200);
        }
    }

    console.log('EDIT 버튼 동작 설정 완료');
}

// === 수동 이웃 버튼 설정 (fallback) ===
function setupNeighborButtonManually(editBtn, blogOwnerNickname) {
    console.log('수동 이웃 버튼 설정 시작');

    editBtn.textContent = '이웃 추가';
    editBtn.className = 'neighbor-add-btn';

    editBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        if (!blogOwnerNickname) {
            alert('블로그 정보를 가져올 수 없습니다!');
            return;
        }

        if (confirm(`${blogOwnerNickname}님을 이웃으로 추가하시겠습니까?`)) {
            try {
                const encodedNickname = encodeURIComponent(blogOwnerNickname);
                const response = await fetch(`/blog/api/@${encodedNickname}/neighbors`, {
                    method: 'POST', 
                    credentials: 'same-origin', 
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    alert(result.message || `${blogOwnerNickname}님을 이웃으로 추가했습니다!`);
                    editBtn.textContent = '이웃 등록됨 ✓';
                    editBtn.style.backgroundColor = '#28a745';
                    editBtn.style.color = 'white';
                    editBtn.disabled = true;
                } else {
                    alert(`이웃 추가 실패: ${result.message}`)
                }
            } catch (error) {
                console.error('이웃 추가 중 오류:', error);
                alert('이웃 추가 중 오류가 발생했습니다!');
            }
        }
    });
    console.log('수동 이웃 버튼 설정 완료');
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
// === 블로그 좌측 사용자 정보 끝 ===

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
    if (!currentNickname) {
        alert('로그인이 필요합니다.');
        window.location.href = '/member/login';
        return;
    }

    console.log(`페이지 이동 시작: ${page}`);

    const basePage = page.split('/')[0]; // post/123 → post
    setActiveNavButton(basePage); // base만 버튼 활성화
    setPageTitleImmediately(basePage);

    // 스킨 적용
    requestAnimationFrame(() => {
        if (cachedSkinInfo) {
            applyCachedSkin();
        } else {
            maintainDefaultSkinForInactiveUsers();
        }
    });

    // 페이지 내용 로드
    loadPageContent(page, currentNickname);

    const encodedNickname = encodeURIComponent(currentNickname);
    const newUrl = `/blog/@${encodedNickname}${page === 'home' ? '' : '/' + page}`;
    history.pushState({ page }, '', newUrl);
}

// 내부 링크 클릭 시 새로고침 없이 동작 (선택)
document.addEventListener('click', function (e) {
    const anchor = e.target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return;

    const currentNickname = getCurrentNickname();
    if (!currentNickname) return;

    // 내부 블로그 링크 정규식: /blog/@nickname/...
    const blogLinkPrefix = `/blog/@${currentNickname}`;
    if (href.startsWith(blogLinkPrefix)) {
        e.preventDefault();

        // 내부 경로 추출: /blog/@nickname/post/123 → post/123
        let relativePath = href.slice(blogLinkPrefix.length);
        relativePath = relativePath.replace(/^\/+/, ''); // 앞쪽 슬래시 제거
        const pagePath = relativePath || 'home';

        // 페이지 이동 (SPA 방식)
        navigateToPageWithAuth(pagePath);
    }
});

// === 페이지 네비게이션 시 사용자 정보 확인 (추가) ===
function navigateToPageWithAuth(page) {

    console.log('🔍 =========================');
    console.log('🔍 navigateToPageWithAuth 시작:', page);
    console.log('🔍 현재 사용자 정보:', currentUserInfo);
    console.log('🔍 사용자 정보 로드 완료:', userInfoLoaded);
    console.log('🔍 로그인 상태 체크 결과:', isLoggedIn());
    console.log('🔍 URL 닉네임:', getCurrentNickname());
    console.log('🔍 로그인 닉네임:', getCurrentUserNickname());
    console.log('🔍 본인 블로그 여부:', isOwnBlog());
    console.log('🔍 =========================');

    // 로그인이 필요한 기능인지 확인 (모든 페이지 접근 시 로그인 필요)
    if (!isLoggedIn()) {
        console.log('로그인 체크 실패 - 로그인 페이지로 이동');
        alert('로그인이 필요한 기능입니다!');
        window.location.href = '/member/login';
        return;
    }

    console.log('로그인 체크 통과');

    // ※ 블로그 주인만 접근 가능한 페이지들 (상점, 프로필)
    const ownerOnlyPages = ['shop', 'profile'];

    if (ownerOnlyPages.includes(page)) {
        if (!isOwnBlog()) {
            alert('블로그 주인만 접근할 수 있는 페이지입니다.');
            console.log(`접근 차단: ${page} 페이지는 블로그 주인(${getCurrentNickname()})만 접근 가능`);
            return;
        }
        console.log(`접근 허용: ${page} 페이지 - 블로그 주인 확인됨`);
    }

    // 모든 로그인 사용자가 접근 가능한 페이지들 (홈, 게시판, 주크박스, 방명록)
    const publicPages = ['home', 'post', 'jukebox', 'guestbook'];

    if (publicPages.includes(page)) {
        console.log(`접근 허용: ${page} 페이지 - 모든 로그인 사용자 접근 가능`);
    }

    // 기존 navigateToPage 로직 실행
    console.log('navigateToPage 호출:', page);
    navigateToPage(page);
}

// 음악 위젯 이벤트 설정
// === 음악 재생 함수 ===
function playTrack(index) {
  const audio = document.getElementById('audio-player');
  const trackTitle = document.getElementById('current-track-title');
  const playPauseBtn = document.getElementById('play-pause-btn');

  const track = ownedMusic[index];
  if (!track || !audio) return;

  currentIndex = index;
  audio.src = track.musicFile;
  trackTitle.textContent = `🎵 ${track.title} - ${track.artist}`;
  playPauseBtn.textContent = '⏸';

  audio.play().catch(err => {
    console.error('오디오 재생 실패:', err);
    playPauseBtn.textContent = '▶︎';
  });

  if (typeof window.renderTrackLists === 'function') {
  window.renderTrackLists(); // 주크박스와 동기화
    }

  const event = new CustomEvent('music:trackChanged', { detail: track });
  window.dispatchEvent(event);
}

// === 음악 목록 새로 불러오기 ===
async function loadOwnedMusic() {
  const audio = document.getElementById('audio-player');
  const musicList = document.getElementById('owned-musicplayer-list');
  const trackTitle = document.getElementById('current-track-title');

  if (!audio || !musicList) return;

  try {
    const res = await fetch('/api/music/owned');
    ownedMusic = await res.json();
    musicList.innerHTML = '';

    ownedMusic.forEach((track, index) => {
      const li = document.createElement('li');
      li.textContent = `${track.title} - ${track.artist}`;
      li.addEventListener('click', () => playTrack(index));
      musicList.appendChild(li);
    });

    // 현재 트랙 정보 유지
    if (ownedMusic.length > 0 && currentIndex < ownedMusic.length) {
      const track = ownedMusic[currentIndex];
      trackTitle.textContent = `🎵 ${track.title} - ${track.artist}`;
    }

  } catch (err) {
    console.error('소유 음악 다시 불러오기 실패:', err);
  }
}

// === 닉네임으로 소유 음악 불러오기 ===
async function loadOwnedMusicByNickname(nickname) {
  const audio = document.getElementById('audio-player');
  const musicList = document.getElementById('owned-musicplayer-list');
  const trackTitle = document.getElementById('current-track-title');

  if (!audio || !musicList) return;

  try {
    const res = await fetch(`/api/music/owned/${nickname}`);
    if (!res.ok) throw new Error('음악 불러오기 실패');

    ownedMusic = await res.json();
    musicList.innerHTML = '';

    ownedMusic.forEach((track, index) => {
      const li = document.createElement('li');
      li.textContent = `${track.title} - ${track.artist}`;
      li.addEventListener('click', () => playTrack(index));
      musicList.appendChild(li);
    });

    if (ownedMusic.length > 0) {
      const track = ownedMusic[0];
      trackTitle.textContent = `🎵 ${track.title} - ${track.artist}`;
    }

  } catch (err) {
    console.error('닉네임 음악 불러오기 실패:', err);
  }
}

// === 음악 위젯 초기화 ===
function setupMusicWidget() {
  const listBtn = document.getElementById('list-btn');
  const audio = document.getElementById('audio-player');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const volumeBtn = document.getElementById('volume-btn');
  const musicListPopup = document.getElementById('musicplayer-list-popup');
  const musicList = document.getElementById('owned-musicplayer-list');

  if (!listBtn || !audio) return;

  // LIST 버튼 토글
  listBtn.addEventListener('click', () => {
    musicListPopup.classList.toggle('hidden');
  });

  // 음소거 버튼
  volumeBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    volumeBtn.textContent = audio.muted ? '🔇' : '🔊';
  });

  // 재생/일시정지
  playPauseBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      playPauseBtn.textContent = '⏸';
    } else {
      audio.pause();
      playPauseBtn.textContent = '▶︎';
    }
  });

  // 이전 곡
  prevBtn.addEventListener('click', () => {
    if (ownedMusic.length === 0) return;
    currentIndex = (currentIndex - 1 + ownedMusic.length) % ownedMusic.length;
    playTrack(currentIndex);
  });

  // 다음 곡
  nextBtn.addEventListener('click', () => {
    if (ownedMusic.length === 0) return;
    currentIndex = (currentIndex + 1) % ownedMusic.length;
    playTrack(currentIndex);
  });
  
   // 닉네임 추출해서 그 사람 음악 가져오기
  const nickname = getCurrentNickname();
  if (nickname) {
    loadOwnedMusicByNickname(nickname).then(() => {
      audio.onended = () => {
        if (ownedMusic.length === 0) return;
        currentIndex = (currentIndex + 1) % ownedMusic.length;
        playTrack(currentIndex);
      };
    });
  }
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
/*
// 페이지 컨텐츠 동적 로드
async function loadPageContent(page, nickname) {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    try {
        mainContent.innerHTML = '<div style="text-align: center; padding: 50px; color: #666;">로딩 중...</div>';

        const encodedNickname = encodeURIComponent(nickname);
        const [path, queryString] = page.split('?');

        // ex) 'post/123/edit' → ['post', '123', 'edit']
        const pathParts = path.split('/');
        const basePage = pathParts[0]; // 첫 segment만 추출

        const baseUrlMap = {
            home: `/blog/@${encodedNickname}`,
            shop: `/blog/@${encodedNickname}/shop`,
            profile: `/blog/@${encodedNickname}/profile`,
            post: `/blog/@${encodedNickname}/post`,
            jukebox: `/blog/@${encodedNickname}/jukebox`,
            guestbook: `/blog/@${encodedNickname}/guestbook`,
            write: `/blog/@${encodedNickname}/post/write`
        };

        const baseUrl = baseUrlMap[basePage];
        if (!baseUrl) throw new Error(`알 수 없는 페이지 유형: ${basePage}`);

        const suffix = pathParts.slice(1).join('/'); // '123/edit' 또는 ''
        const fullUrl = `${baseUrl}${suffix ? '/' + suffix : ''}${queryString ? `?${queryString}` : ''}`;

        console.log(`페이지 로드 시도: ${fullUrl}`);

        const response = await fetch(fullUrl);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`"${page}" 페이지를 찾을 수 없습니다.`);
            }
            throw new Error(`페이지 로드 실패: ${response.status}`);
        }

        const html = await response.text();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const pageContent = tempDiv.querySelector('.main-content')?.innerHTML;

        if (!pageContent) throw new Error('main-content를 찾을 수 없습니다.');

        mainContent.innerHTML = pageContent;
        console.log(`${page} 페이지 콘텐츠 삽입 완료`);

        initializePage(basePage, path); // 경로 전체 전달
        console.log(`${basePage} 페이지 로드 성공`);
    } catch (error) {
        console.error('페이지 로드 오류:', error);
        mainContent.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <h3>※ 페이지 준비 중 또는 오류 발생</h3>
                <p>${error.message}</p>
                <button onclick="navigateToPage('home')" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">홈으로 돌아가기</button>
            </div>
        `;
    }
}
*/
// 페이지 컨텐츠 동적 로드 (수정됨)
async function loadPageContent(page, nickname) {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    try {
        mainContent.innerHTML = '<div style="text-align: center; padding: 50px; color: #666;">로딩 중...</div>';

        const encodedNickname = encodeURIComponent(nickname);
        const [path, queryString] = page.split('?');

        const pathParts = path.split('/');
        const basePage = pathParts[0];

        const baseUrlMap = {
            home: `/blog/@${encodedNickname}`,
            shop: `/blog/@${encodedNickname}/shop`,
            profile: `/blog/@${encodedNickname}/profile`,
            post: `/blog/@${encodedNickname}/post`,
            jukebox: `/blog/@${encodedNickname}/jukebox`,
            guestbook: `/blog/@${encodedNickname}/guestbook`,
            write: `/blog/@${encodedNickname}/post/write`
        };

        const baseUrl = baseUrlMap[basePage];
        if (!baseUrl) throw new Error(`알 수 없는 페이지 유형: ${basePage}`);

        const suffix = pathParts.slice(1).join('/');
        const fullUrl = `${baseUrl}${suffix ? '/' + suffix : ''}${queryString ? `?${queryString}` : ''}`;

        console.log(`페이지 로드 시도: ${fullUrl}`);

        const response = await fetch(fullUrl);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`"${page}" 페이지를 찾을 수 없습니다.`);
            }
            throw new Error(`페이지 로드 실패: ${response.status}`);
        }

        const html = await response.text();

        // 임시 div 생성 후 HTML 넣기
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // main-content 부분만 추출
        const pageContent = tempDiv.querySelector('.main-content')?.innerHTML;
        if (!pageContent) throw new Error('main-content를 찾을 수 없습니다.');

        // main-content에 콘텐츠 넣기
        mainContent.innerHTML = pageContent;

        // ===== 수동 스크립트 파싱 및 실행 =====
        // tempDiv 내 모든 <script> 태그 찾아서 실행
        const scripts = tempDiv.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');

            if (oldScript.src) {
                newScript.src = oldScript.src;
                newScript.async = false; // 순서 보장
            } else {
                newScript.textContent = oldScript.textContent;
            }

            // body에 추가하여 실행
            document.body.appendChild(newScript);
            // 추가 후 제거해도 무방:
            // document.body.removeChild(newScript);
        });
        // ===== 수동 스크립트 파싱 및 실행 끝 =====

        console.log(`${page} 페이지 콘텐츠 삽입 완료`);

        initializePage(basePage, path);
        console.log(`${basePage} 페이지 로드 성공`);
    } catch (error) {
        console.error('페이지 로드 오류:', error);
        mainContent.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <h3>※ 페이지 준비 중 또는 오류 발생</h3>
                <p>${error.message}</p>
                <button onclick="navigateToPage('home')" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">홈으로 돌아가기</button>
            </div>
        `;
    }
}


// 페이지 초기화 함수 (즉시 실행)
function initializePage(page) {
    // 각 페이지별 초기화 함수가 있을 경우 즉시 호출
    const initFunctionName = `setup${page.charAt(0).toUpperCase() + page.slice(1)}Features`;

    if (typeof window[initFunctionName] === 'function') {
        window[initFunctionName]();
        console.log(`${page} 페이지 초기화 완료`);
    } else {
        console.log(`${page} 페이지는 별도 초기화 함수가 없습니다.`);
    }

    // 공통 데이터 로드
    if (typeof window.loadUserData === 'function') {
        window.loadUserData();
    }

    if (typeof window.loadBlogSkin === 'function') {
        window.loadBlogSkin();
    }

    // 프로필 이미지 캐시 적용 (모든 페이지에서)
    applyCachedProfileImage();

    // 프로필 이미지가 아직 로드되지 않았으면 로드
    if (!profileImageLoaded) {
        loadUserProfileImage();
    }

    // 이웃 기능 페이지별 재초기화
    setTimeout(() => {
        if (typeof window.initNeighborFeatures === 'function') {
            window.initNeighborFeatures();
            console.log(`${page} 페이지 이웃 기능 재초기화 완료`);
        }
    }, 200)

}

// 브라우저 뒤로가기 지원
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.page) {
        const currentNickname = getCurrentNickname();
        if (currentNickname) {
            loadPageContent(event.state.page, currentNickname);
            const basePage = event.state.page.split('/')[0];
            setActiveNavButton(basePage);
            setPageTitleImmediately(basePage);
            setPageTitleByUrl();
        }
    }
});

// 현재 재생 중인 트랙 정보 반환 (주크박스로)
window.getCurrentlyPlayingTrack = function() {
  return ownedMusic?.[currentIndex] || null;
};

// === 전역 함수 ===
window.setActiveNavButton = setActiveNavButton;
window.setPageTitle = setPageTitle;
window.navigateToPage = navigateToPage;
window.maintainDefaultSkinForInactiveUsers = maintainDefaultSkinForInactiveUsers;
window.navigateToProfileEdit = navigateToProfileEdit;
window.getCurrentUserId = getCurrentUserId;
window.getCurrentUserNickname = getCurrentUserNickname;
window.getCurrentUserInfo = getCurrentUserInfo;
window.loadCurrentUserInfo = loadCurrentUserInfo;
window.isLoggedIn = isLoggedIn;
window.isOwnBlog = isOwnBlog;
window.invalidateUserInfoCache = invalidateUserInfoCache;
window.refreshUserInfo = refreshUserInfo;
window.navigateToPageWithAuth = navigateToPageWithAuth;
window.setupEditButtonBehavior = setupEditButtonBehavior;
window.setupNeighborButtonManually = setupNeighborButtonManually;

// === 디버깅용 함수 (개발 중에만 사용) ===
window.debugUserInfo = function() {
    console.log('=== 사용자 정보 디버깅 ===');
    console.log('currentUserInfo:', currentUserInfo);
    console.log('userInfoLoaded:', userInfoLoaded);
    console.log('URL 닉네임:', getCurrentNickname());
    console.log('로그인 닉네임:', getCurrentUserNickname());
    console.log('본인 블로그 여부:', isOwnBlog());
    console.log('로그인 여부:', isLoggedIn());
};

console.log('layout.js 사용자 인증 기능 로드 완료');
console.log('layout.js 로드 완료 - 즉시 반응 모드');
