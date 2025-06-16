// main.js - 메인페이지 기능

window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

});

// 로그아웃 확인 함수
function confirmLogout() {
    if (confirm("로그아웃 하시겠습니까?")) {
        // 숨겨진 폼을 만들어 POST 요청 (for. CSRF 보호)
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/member/logout';
        document.body.appendChild(form);
        form.submit();
    }
}

// 내 블로그 새 창에서 열기
function openMyBlog() {
    console.log('내 블로그 열기 시도');
    
    // 새 창 크기 설정(메인보다 작은 사이즈로)
    const width = 1350; // 폭
    const height = 900; // 높이
    const left = (screen.width - width) / 2; // 화면 중앙
    const top = (screen.height - height) / 2; // 화면 중앙

    // 새 창 옵션
    const options = `
        width=${width}, 
        height=${height}, 
        left=${left}, 
        top=${top}, 
        resizable=yes,
        toolbar=no, 
        menubar=no, 
        location=no, 
        status=no
    `;

    try {
        // 바로 새 창에서 블로그 열기 (새 창임을 알리는 파라미터 추가)
        const blogWindow = window.open('/blog/home?fromNewWindow=true', 'myBlog', options);
        
        if (blogWindow) {
            console.log('새 창 열기 완료');
            blogWindow.focus();
        } else {
            console.error('새 창 열기 실패 (팝업 차단?)');
            alert('팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.');
        }
    } catch (error) {
        console.error('새 창 열기 중 오류:', error);
        alert('블로그를 열 수 없습니다. 잠시 후 다시 시도해주세요.');
    }

}

let blogWindow = null;

function openMyBlogwrite(event) {
    if (event) event.preventDefault(); // 혹시 버튼이 폼 안에 있을 경우 기본 제출 방지

    console.log("openMyBlogwrite 함수 호출됨");

    const nickname = document.body.dataset.nickname;
    if (!nickname) {
        window.location.href = "/member/login";
        return;
    }

    const url = `/blog/@${encodeURIComponent(nickname)}/post/write`;

    if (blogWindow && !blogWindow.closed) {
        blogWindow.location.href = url;
        blogWindow.focus();
    } else {
        const width = 1350;
        const height = 900;
        const left = (screen.width - width) / 2;
        const top = (screen.height - height) / 2;
        const options = `
            width=${width},
            height=${height},
            left=${left},
            top=${top},
            resizable=yes,
            toolbar=no,
            menubar=no,
            location=no,
            status=no
        `;

        blogWindow = window.open(url, 'myBlogWrite', options);
    }
}


function openAdmin(){
    // 새 창 크기 설정(메인보다 작은 사이즈로)
    const width = 1350; // 폭
    const height = 900; // 높이
    const left = (screen.width - width) / 2; // 화면 중앙
    const top = (screen.height - height) / 2; // 화면 중앙

    // 새 창 옵션
    const options = `
        width=${width}, 
        height=${height}, 
        left=${left}, 
        top=${top}, 
        resizable=yes,
        toolbar=no, 
        menubar=no, 
        location=no, 
        status=no
    `;

    // 새 창에서 블로그 열기
    window.open('/admin', 'myBlogWrite', options);
}
