/*!
* Start Bootstrap - New Age v6.0.7 (https://startbootstrap.com/theme/new-age)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-new-age/blob/master/LICENSE)
*/
//
// Scripts
//

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
    window.open('/blog/home', 'myBlog', options);

}

function openMyBlogwrite(){
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
    window.open('/blog/post/write', 'myBlogWrite', options);
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
