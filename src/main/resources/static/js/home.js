// home.js : 여행 블로그 - 홈 페이지 전용 기능

// 전역 변수
window.currentBlogNickname = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 블로그 홈 초기화
    initHomePage();

    // 블로그 소유자 정보 설정
    await initBlogOwnerInfo();

    // 스킨 자동 로드
    await loadBlogSkin();

    // 동적 데이터 로드 => 나중에 추가
    // loadRecentPosts(); // 게시글들
    // loadRecentGuestbooks(); // 방명록들

});

// 블로그 소유자 정보 초기화
async function initBlogOwnerInfo() {
    window.currentBlogNickname = getBlogOwnerNickname();
    console.log('현재 블로그 소유자:', window.currentBlogNickname);
}

// URL에서 블로그 소유자 닉네임 추출
function getBlogOwnerNickname() {
    const currentPath = window.location.pathname;
    const match = currentPath.match(/^\/blog\/@([^\/]+)/);
    if (match) {
        return match[1]; // 닉네임 반환
    }
    return null;
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
            console.log('스킨 데이터:', skinData);

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
    console.log('setupHomeFeatures 호출됨'); // 디버깅 추가

    // 방명록 카드 클릭 이벤트
    const guestbookCard = document.getElementById('guestbook-card');
    console.log('guestbookCard:', guestbookCard); // 디버깅 추가

    if (guestbookCard) {
        console.log('이벤트 리스너 추가 중...') // 디버깅 추가
        guestbookCard.addEventListener('click', navigateToGuestbook);
        guestbookCard.style.cursor = 'pointer'; // 커서 변경
        console.log('이벤트 리스너 추가 완료'); // 디버깅 추가
    } else {
        console.log('guestbook-card를 찾을 수 없습니다!'); // 디버깅 추가
    }
    
    // 사진 카드 클릭 이벤트 => 나중에 동적 로드 시 추가
}

// 방명록으로 이동
function navigateToGuestbook() {
    if (window.currentBlogNickname) {
        // 닉네임 URL 인코딩
        const encodedNickname = encodeURIComponent(window.currentBlogNickname);
        window.location.href = `/blog/@${encodedNickname}/guestbook`;
    } else {
        console.error('블로그 소유자 정보가 없습니다!');
    }
}

// 스킨 이미지 적용 (CSS와 연동)
function applySkin(skinImageUrl) {
    const frame = document.querySelector('.frame');
    if (frame && skinImageUrl) {
        // 로딩 상태 표시
        frame.classList.add('loading-skin');

        // 이미지 로드 확인
        const img = new Image();
        img.onload = () => {
            // CSS에서 이미 background 관련 속성들이 정의되어 있으므로 이미지만 설정
            frame.style.backgroundImage = `url(${skinImageUrl})`;
            frame.classList.add('has-skin');
            frame.classList.remove('loading-skin');
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
    const frame = document.querySelector('.frame');
    if (frame) {
        frame.style.backgroundImage = '';
        frame.classList.remove('has-skin', 'loading-skin');
        console.log('스킨 제거 완료');
    }
}

// 스킨 새로고침 함수 (프로필에서 스킨 변경 후 호출용)
window.refreshSkin = async function() {
    await loadBlogSkin();
}


// 게시글 상세보기 (추가 예정)
/*
function viewPost(postId) {
    if (window.currentBlogNickname && postId) {
        window.location.href = `/blog/@${window.currentBlogNickname}/post/${postId}`;
    }
}
*/

// 기타 기능 관련 추가 코드 작성...