// mylog.js : 블로그 - 마이로그 기능

// === 마이로그 페이지 초기화 ===
function initMylogPage() {
    console.log('마이로그 페이지 초기화 시작');
    
    // 마이로그 관련 초기화 코드들...
    // (예: 지도 로드, 여행 기록 표시 등)
    
    // 공통 스킨 로드
    if (typeof window.maintainDefaultSkinForInactiveUsers === 'function') {
        window.maintainDefaultSkinForInactiveUsers();
    }
    
    console.log('마이로그 페이지 초기화 완료');
}

// === 스킨 로드 함수 ===
async function loadBlogSkin() {
    const currentNickname = getCurrentNickname();
    if (!currentNickname) {
        console.log('닉네임이 없어서 스킨 로드를 건너뜁니다.');
        return;
    }

    try {
        const encodedNickname = encodeURIComponent(currentNickname);
        const response = await fetch(`/blog/api/@${encodedNickname}/skin`);

        if (response.ok) {
            const skinData = await response.json();
            console.log('마이로그 페이지 스킨 데이터:', skinData);

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

// 스킨 이미지 적용
function applySkin(skinImageUrl) {
    const frame = document.querySelector('.frame');
    if (frame && skinImageUrl) {
        frame.classList.add('loading-skin');

        const img = new Image();
        img.onload = () => {
            frame.style.backgroundImage = `url(${skinImageUrl})`;
            frame.classList.add('has-skin');
            frame.classList.remove('loading-skin');
            console.log('마이로그 페이지 스킨 적용 완료:', skinImageUrl);
        };
        img.onerror = () => {
            frame.classList.remove('loading-skin');
            console.log('스킨 로드 실패:', skinImageUrl);
        };
        img.src = skinImageUrl;
    }
}

// 스킨 제거 함수
function removeSkin() {
    const frame = document.querySelector('.frame');
    if (frame) {
        frame.style.backgroundImage = '';
        frame.classList.remove('has-skin', 'loading-skin');
        console.log('마이로그 페이지 스킨 제거 완료');
    }
}

// === 전역 함수로 노출 ===
window.setupMylogFeatures = initMylogPage;
window.loadBlogSkin = loadBlogSkin;

// === 페이지 로드 시 초기화 ===
document.addEventListener('DOMContentLoaded', initMylogPage);