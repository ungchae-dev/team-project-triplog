// home.js : 블로그 - 홈 기능 (스킨 로딩 최적화 반영)

// 전역 변수
window.currentBlogNickname = null;

// === 즉시 스킨 로드 (페이지 로드보다 빠르게) ===
// HTML 파싱과 동시에 실행
(function() {
    'use strict';

    // 닉네임 즉시 추출
    const nickname = extractNicknameFromUrl();

    if (nickname) {
        window.currentBlogNickname = nickname;
        // 즉시 스킨 로드 시작
        loadBlogSkinImmediately();
    }
})();

// URL에서 블로그 소유자 닉네임 추출 (즉시 실행용)
function extractNicknameFromUrl() {
    const currentPath = window.location.pathname;
    const match = currentPath.match(/^\/blog\/@([^\/]+)/);
    if (match) {
        return decodeURIComponent(match[1]);
    }
    return null;
}

// 즉시 스킨 로드 함수 (DOMContentLoaded보다 먼저 실행)
async function loadBlogSkinImmediately() {
    if (!window.currentBlogNickname) {
        console.log('닉네임이 없어서 즉시 스킨 로드를 건너뜁니다.');
        return;
    }

    try {
        console.log('즉시 스킨 로드 시작:', window.currentBlogNickname);

        const encodedNickname = encodeURIComponent(window.currentBlogNickname);
        const response = await fetch(`/blog/api/@${encodedNickname}/skin`);

        if (response.ok) {
            const skinData = await response.json();
            console.log('즉시 로드된 스킨 데이터:', skinData);

            // 즉시 스킨 적용
            if (skinData.skinActive === 'Y' && skinData.skinImage) {
                applySkinImmediately(skinData.skinImage);
            } else {
                // 스킨 비활성화 상태 - 기본 스킨 유지
                console.log('스킨 비활성화 상태 - 기본 스킨 유지');
                ensureDefaultSkin();
            }

        } else {
            console.log('즉시 스킨 정보를 가져올 수 없음:', response.status);
            ensureDefaultSkin();
        }

    } catch (error) {
        console.error('즉시 스킨 로드 중 오류:', error);
        ensureDefaultSkin();
    }
}

// 즉시 스킨 적용 함수 (DOM 로드 전에도 작동)
function applySkinImmediately(skinImageUrl) {

    if (!skinImageUrl || skinImageUrl === 'null') {
        console.log('유효하지 않은 스킨 URL:', skinImageUrl);
        ensureDefaultSkin();
        return;
    }

    let attemptCount = 0;
    const maxAttempts = 50; // 최대 5초 대기

    // DOM이 아직 로드되지 않았을 수 있으므로 체크
    function applyWhenReady() {
        const frames = document.querySelectorAll('.frame');
        const frame = frames.length > 0 ? frames[0] : null;

        if (frame && frame.classList) { // classList 존재 확인
            console.log('프레임 요소 찾음:', frame);
            console.log('원본 스킨 URL:', skinImageUrl);

            // 이미지 로드 테스트
            const img = new Image();

            img.onload = () => {
                try {
                    // 스킨 적용 성공
                    frame.style.backgroundImage = `url("${skinImageUrl}")`;
                    frame.style.backgroundSize = 'cover';
                    frame.style.backgroundPosition = 'center';
                    frame.style.backgroundRepeat = 'no-repeat';
                    
                    frame.classList.add('has-skin', 'skin-loaded');
                    frame.classList.remove('loading');

                    console.log('즉시 커스텀 스킨 적용 완료:', skinImageUrl);

                    // sessionStorage에 저장
                    sessionStorage.setItem('customSkinImage', skinImageUrl);
                    sessionStorage.setItem('skinApplied', 'true');
                } catch (error) {
                    console.error('스킨 적용 중 오류:', error);
                    ensureDefaultSkin();
                }
            };

            img.onerror = () => {
                console.error('스킨 이미지 로드 실패:', skinImageUrl);
                console.log('URL 인코딩 처리 시도...');
                
                // URL에 한글이 있는 경우 수동으로 인코딩
                const encodedUrl = skinImageUrl.split('/').map(part => {
                    // 파일명 부분만 인코딩 (경로는 그대로)
                    if (part.includes('.')) {
                        return encodeURIComponent(part);
                    }
                    return part;
                }).join('/');
                
                console.log('인코딩된 URL:', encodedUrl);
                
                const img2 = new Image();
                img2.onload = () => {
                    frame.style.backgroundImage = `url("${encodedUrl}")`;
                    frame.style.backgroundSize = 'cover';
                    frame.style.backgroundPosition = 'center';
                    frame.style.backgroundRepeat = 'no-repeat';
                    frame.classList.add('has-skin', 'skin-loaded');
                    frame.classList.remove('loading');
                    console.log('인코딩된 URL로 스킨 적용 성공');
                    
                    // sessionStorage에도 인코딩된 URL 저장
                    sessionStorage.setItem('customSkinImage', encodedUrl);
                    sessionStorage.setItem('skinApplied', 'true');
                };
                img2.onerror = () => {
                    console.error('모든 시도 실패, 기본 스킨 적용');
                    ensureDefaultSkin();
                };
                img2.src = encodedUrl;
            };

            // 첫 번째 시도 - 원본 URL
            img.src = skinImageUrl;
            
        } else if (attemptCount < maxAttempts) {
            // DOM이 아직 준비되지 않았으면 다시 시도
            attemptCount++;
            console.log(`프레임 요소를 찾는 중... 시도 ${attemptCount}/${maxAttempts}`);
            setTimeout(applyWhenReady, 100);
        } else {
            console.error('프레임 요소를 찾을 수 없음 - DOM 로드 시간 초과');
            ensureDefaultSkin();
        }
    }

    applyWhenReady();
}

// 기본 스킨 보장 함수
function ensureDefaultSkin() {

    let attemptCount = 0;
    const maxAttempts = 50; // 최대 5초 대기

    function applyDefaultWhenReady() {
        const frames = document.querySelectorAll('.frame');
        const frame = frames.length > 0 ? frames[0] : null;

        if (frame && frame.classList) { // classList 존재 확인
            try {
                // 기본 스킨 확실히 적용
                frame.style.backgroundImage = 'url("/images/skins/triplog_skin_default.png")';
                frame.classList.remove('has-skin', 'loading');
                frame.classList.add('skin-loaded');

                // sessionStorage 정리
                sessionStorage.removeItem('customSkinImage');
                sessionStorage.removeItem('skinApplied');

                console.log('기본 스킨 적용 완료');
            } catch (error) {
                console.error('기본 스킨 적용 중 오류:', error);
            }
        } else if (attemptCount < maxAttempts) {
            attemptCount++;
            setTimeout(applyDefaultWhenReady, 100);
        }
    }

    applyDefaultWhenReady();
}

// 페이지 로드 즉시 닉네임으로 타이틀 변경
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded 시작');

    // 닉네임 기반 타이틀 설정
    const nickname = getBlogOwnerNickname();
    if (nickname) {
        document.title = `${nickname}님의 블로그`;
    }

    // 블로그 홈 초기화
    initHomePage();

    // 블로그 소유자 정보 설정
    await initBlogOwnerInfo();

    // 사용자 데이터 로드 (스킨은 이미 즉시 로드됨)
    await loadUserData();

    // 스킨이 아직 로드되지 않았다면 강제 새로고침
    const frame = document.querySelector('.frame');
    if (frame && !frame.classList.contains('skin-loaded')) {
        console.log('스킨이 로드되지 않아 강제 새로고침');
        await loadBlogSkinImmediately();
    }

});

// 블로그 소유자 정보 초기화
async function initBlogOwnerInfo() {
    if (!window.currentBlogNickname) {
        window.currentBlogNickname = getBlogOwnerNickname();
    }
    console.log('현재 블로그 소유자:', window.currentBlogNickname);
}

// 블로그 소유자 닉네임 추출
function getBlogOwnerNickname() {
    return window.currentBlogNickname || extractNicknameFromUrl();
}

// 블로그 소유자 데이터 로드 함수
async function loadUserData() {
    if (!window.currentBlogNickname) {
        console.log('닉네임이 없어서 사용자 데이터 로드를 건너뜁니다...');
        return;
    }

    try {
        const encodedNickname = encodeURIComponent(window.currentBlogNickname);
        const response = await fetch(`/blog/api/@${encodedNickname}/user-info`);

        if (response.ok) {
            const userInfo = await response.json();
            console.log('사용자 정보 로드 성공: ', userInfo);
            updateUserInterface(userInfo); // DOM에 데이터 적용
        } else {
            console.log('사용자 정보를 가져올 수 없습니다:', response.status);
            setDefaultValues();
        }
    } catch (error) {
        console.error('사용자 데이터 로드 중 오류:', error);
        setDefaultValues();
    }
}

// UI 업데이트 함수
function updateUserInterface(userInfo) {
    // 방문자 수 업데이트
    updateElement('daily-visitors', userInfo.dailyVisitors || 0);
    updateElement('total-visitors', userInfo.totalVisitors || 0);

    // 상태 메시지 업데이트
    updateElement('condition-message', 
        userInfo.conditionMessage || '안녕하세요~ 블로그에 오신 걸 환영합니다♥')

    // 닉네임과 성별 표시
    const genderSymbol = userInfo.gender === 'MALE' ? '♂' : '♀';
    updateElement('user-info', `${userInfo.nickname}(${genderSymbol})`);

    // 가입일 포맷팅 및 표시
    const formattedDate = formatJoinDate(userInfo.joinDate);
    updateElement('join-date', formattedDate);

    // 브라우저 타이틀 변경
    updatePageTitle(userInfo.nickname);
    
    console.log('UI 업데이트 완료');
}

// 페이지 타이틀 업데이트 함수
function updatePageTitle(nickname) {
    if (nickname) {
        document.title = `${nickname}님의 블로그`;
        console.log('페이지 타이틀 변경:', document.title);
    }
}

// 기본값 설정 함수 (로드 실패 시)
function setDefaultValues() {
    updateElement('daily-visitors', '0');
    updateElement('total-visitors', '0');
    updateElement('condition-message', '블로그 정보를 불러올 수 없습니다.');
    updateElement('user-info', '사용자');
    updateElement('join-date', '정보 없음');
}

// DOM 요소 업데이트 헬퍼 함수
function updateElement(id, content) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = content;
        console.log(`${id} 업데이트:`, content);
    } else {
        console.log(`요소를 찾을 수 없음: ${id}`);
    }
}

// 가입일 포맷팅 함수 ex) 20250604 -> 2025년 6월 4일
function formatJoinDate(joinDate) {
    if (!joinDate || joinDate.length !== 8) {
        return '정보 없음';
    }

    const year = joinDate.substring(0, 4);
    const month = parseInt(joinDate.substring(4, 6));
    const day = parseInt(joinDate.substring(6, 8));

    return `${year}년 ${month}월 ${day}일`;
}

// 블로그 스킨 자동 로드
async function loadBlogSkin() {
    if (!window.currentBlogNickname) {
        console.log('닉네임이 없어서 스킨 로드를 건너뜁니다.');
        return;
    }

    try {
        // 닉네임 URL 인코딩
        const encodedNickname = encodeURIComponent(window.currentBlogNickname);
        const response = await fetch(`/blog/api/@${encodedNickname}/skin`);

        if (response.ok) {
            const skinData = await response.json();
            console.log('fallback 스킨 데이터:', skinData);

            // 스킨이 활성화되어 있고 이미지가 있으면 적용
            if (skinData.skinActive === 'Y' && skinData.skinImage) {
                applySkin(skinData.skinImage);
            } else {
                console.log('스킨이 비활성화되어 있거나 이미지가 없습니다.');
                removeSkin();
            }
        } else {
            console.log('스킨 정보를 가져올 수 없습니다:', response.status);
            removeSkin();
        }
    } catch (error) {
        console.error('스킨 로드 중 오류:', error);
        removeSkin();
    }
}

function initHomePage() {
    // 현재 페이지 네비 버튼 활성화
    setActiveNavButton('home');

    // 페이지 제목 설정
    setPageTitle('홈')
    
    // 홈 특정 기능 함수들 호출
    setupHomeFeatures();
}

// 블로그 - 홈 특정 기능 함수들
function setupHomeFeatures() {
    console.log('setupHomeFeatures 호출됨');

    // 방명록 카드 클릭 이벤트
    const guestbookCard = document.getElementById('guestbook-card');
    console.log('guestbookCard:', guestbookCard);

    if (guestbookCard) {
        console.log('이벤트 리스너 추가 중...');
        guestbookCard.addEventListener('click', navigateToGuestbook);
        guestbookCard.style.cursor = 'pointer'; // 커서 변경
        console.log('이벤트 리스너 추가 완료');
    } else {
        console.log('guestbook-card를 찾을 수 없습니다!');
    }
    
    // 사진 카드 클릭 이벤트 => 나중에 동적 로드 시 추가
}

// 방명록으로 이동
function navigateToGuestbook() {
    console.log('방명록 카드 클릭됨!');

    // SPA 네비게이션 사용
    if (typeof navigateToPage === 'function') {
        navigateToPage('guestbook');
    } else {
        // fallback: 전체 페이지 리로드
        if (window.currentBlogNickname) {
            // 닉네임 URL 인코딩
            const encodedNickname = encodeURIComponent(window.currentBlogNickname);
            window.location.href = `/blog/@${encodedNickname}/guestbook`;
        }
    }
}

// 스킨 이미지 적용 함수 (CSS와 연동)
function applySkin(skinImageUrl) {
    const frames = document.querySelectorAll('.frame');
    const frame = frames.length > 0 ? frames[0] : null;

    if (frame && frame.classList && skinImageUrl) {
        // 로딩 상태 표시
        frame.classList.add('loading-skin');

        // 이미지 로드 확인
        const img = new Image();
        img.onload = () => {
            // 한글 파일명 지원
            frame.style.backgroundImage = `url("${skinImageUrl}")`;
            frame.classList.add('has-skin', 'skin-loaded');
            frame.classList.remove('loading-skin', 'loading');

            // sessionStorage 업데이트
            sessionStorage.setItem('customSkinImage', skinImageUrl);
            sessionStorage.setItem('skinApplied', 'true');

            console.log('스킨 적용 완료:', skinImageUrl);
        };

        img.onerror = () => {
            frame.classList.remove('loading-skin');
            console.log('스킨 로드 실패:', skinImageUrl);
            removeSkin();
        };

        img.src = skinImageUrl;
    }
}

// 스킨 제거 함수
function removeSkin() {
    const frames = document.querySelectorAll('.frame');
    const frame = frames.length > 0 ? frames[0] : null;

    if (frame && frame.classList) {
        // 기본 스킨으로 복원
        frame.style.backgroundImage = 'url("/images/skins/triplog_skin_default.png")';
        frame.classList.remove('has-skin', 'loading-skin', 'loading');
        frame.classList.add('skin-loaded');

        // sessionStorage 정리
        sessionStorage.removeItem('customSkinImage');
        sessionStorage.removeItem('skinApplied');

        console.log('스킨 제거 완료 - 기본 스킨으로 복원');
    }
}

// 스킨 새로고침 함수 (프로필에서 스킨 변경 후 호출용)
window.refreshSkin = async function() {
    console.log('스킨 새로고침 요청됨');
    await loadBlogSkinImmediately(); // 즉시 로드 함수 사용
}

// 전역으로 노출하는 함수들 (다른 페이지에서 사용 가능)
window.loadUserData = loadUserData;
window.loadBlogSkin = loadBlogSkin;
window.getBlogOwnerNickname = getBlogOwnerNickname;
window.initBlogOwnerInfo = initBlogOwnerInfo;

// 게시글 상세보기 (추가 예정)
/*
function viewPost(postId) {
    if (window.currentBlogNickname && postId) {
        window.location.href = `/blog/@${window.currentBlogNickname}/post/${postId}`;
    }
}
*/

// 기타 기능 관련 추가 코드 작성...