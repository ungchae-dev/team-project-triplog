// home.js : 여행 블로그 - 홈 전용 기능

document.addEventListener('DOMContentLoaded', () => {
    // 블로그 - 홈 초기화
    initHomePage();
});

function initHomePage() {
    // 현재 페이지 네비 버튼 활성화
    setActiveNavButton('home');

    // 페이지 제목 설정
    setPageTitle('홈')
    
    // 홈 특정 기능들 함수
    setupHomeFeatures();
}

// 블로그 - 홈 특정 기능들 함수
function setupHomeFeatures() {
    // 방명록 카드 클릭 이벤트
    const guestbookCard = document.querySelector('.section-card');
    if (guestbookCard) {
        guestbookCard.addEventListener('click', () => {
            window.location.href = '/blog/guestbook';
        });
    }
    
    // 사진 카드 클릭 이벤트
    const photoCards = document.querySelectorAll('.photo-card');
    photoCards.forEach(card => {
        card.addEventListener('click', () => {
            // 사진 상세 보기 또는 관련 기능
            console.log('사진 카드 클릭:', card.querySelector('.caption').textContent);
        });
    });

}

// 기타 기능 관련 추가 코드 작성...