// home.js - 홈 페이지 전용 기능

document.addEventListener('DOMContentLoaded', () => {
    // 홈 페이지 초기화
    initHomePage();
});

function initHomePage() {
    // 현재 페이지 네비 버튼 활성화
    setTimeout(() => {
        if (typeof setActiveNavButton === 'function') {
            setActiveNavButton('홈');
        }
    }, 100);
    
    // 홈 페이지 특정 기능들
    setupHomeFeatures();
}

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
    
    // 기타 홈 페이지 전용 기능들...
}