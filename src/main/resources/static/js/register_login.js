// register_login.js - 회원가입 & 로그인 기능

// 회원가입/로그인 폼 전환 애니메이션
const signUpButton = document.getElementById('signUp');
const loginButton = document.getElementById('signIn');
const container = document.querySelector('.container');

// 새 창에서 온 요청인지 확인
let isFromNewWindow = false;

// URL 파라미터로 초기 상태 설정
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const fromNewWindow = urlParams.get('fromNewWindow');

    // 새 창 요청 확인
    if (fromNewWindow === 'true') {
        isFromNewWindow = true;
        console.log('새 창에서 블로그 접근을 위한 로그인 페이지');
        
        // 즉시 hidden input 추가
        addHiddenInputs();
    }

    // 로그인 실패 체크
    if (window.location.pathname.includes('/login/error')) {
        alert('아이디 또는 비밀번호를 잘못 입력하셨습니다!');
        const newUrl = '/member/login?type=signin' + (isFromNewWindow ? '&fromNewWindow=true' : '');
        window.history.replaceState(null, '', newUrl);
    }
    
    if(type === 'signin') {
        container.classList.remove('right-panel-active'); // 로그인 폼 보여주기
    } else if (type === 'signup') {
        container.classList.add('right-panel-active') // 회원가입 폼 보여주기
    }
});

// 두 폼 모두에 hidden input 추가하는 함수
function addHiddenInputs() {
    if (!isFromNewWindow) return;

    // 로그인 폼에 추가
    const loginForm = document.getElementById('form2');
    if (loginForm) {
        // 기존 hidden input 제거
        removeExistingHiddenInput(loginForm, 'fromNewWindow');

        const loginHiddenInput = document.createElement('input');
        loginHiddenInput.type = 'hidden';
        loginHiddenInput.name = 'fromNewWindow';
        loginHiddenInput.value = 'true';
        loginForm.appendChild(loginHiddenInput);

        console.log('로그인 폼에 fromNewWindow 파라미터 추가');
    }

    // 회원가입 폼에 추가
    const signupForm = document.getElementById('form1');
    if (signupForm) {
        // 기존 hidden input 제거
        removeExistingHiddenInput(signupForm, 'fromNewWindow');

        const signupHiddenInput = document.createElement('input');
        signupHiddenInput.type = 'hidden';
        signupHiddenInput.name = 'fromNewWindow';
        signupHiddenInput.value = 'true';
        signupForm.appendChild(signupHiddenInput);

        console.log('회원가입 폼에 fromNewWindow 파라미터 추가');
    }
}

// 기존 hidden input 제거 함수
function removeExistingHiddenInput(form, name) {
    const existingInput = form.querySelector(`input[name="${name}"]`);
    if (existingInput) {
        existingInput.remove();
    }
}

// 회원가입 폼으로 전환
signUpButton.addEventListener('click', () => {
    container.classList.add('right-panel-active');
    const newUrl = '/member/login?type=signup' + (isFromNewWindow ? '&fromNewWindow=true' : '');
    window.history.pushState(null, '', newUrl);
});

// 로그인 폼으로 전환
loginButton.addEventListener('click', () => {
    container.classList.remove('right-panel-active');
    const newUrl = '/member/login?type=signin' + (isFromNewWindow ? '&fromNewWindow=true' : '');
    window.history.pushState(null, '', newUrl);
});

// 회원가입 폼 유효성 검사 및 제출 (fromNewWindow 파라미터 포함)
document.getElementById('form1').addEventListener('submit', function(e) {
    e.preventDefault(); // 기본 폼 제출 방지

    const formData = new FormData(this);

    // 새 창 요청인 경우
    if (isFromNewWindow) {
        formData.append('fromNewWindow', 'true');
    }

    // 유효성 검사를 위해 JSON 객체화 (HTML과 동일)
    const memberData = {
        member_id: formData.get('memberId'), 
        name: formData.get('name'),
        nickname: formData.get('nickname'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        gender: formData.get('gender')
    };

    // 유효성 검사 (비밀번호 체크)
    const password = formData.get('password');
    const passwordCheck = formData.get('passwordCheck');

    if (!validateSignupForm(memberData, password, passwordCheck)) {
        return;
    }

    // 서버로 회원가입 요청
    fetch('/member/new', {
        method: 'POST',
        body: formData
    })
    .then(res => {
        if (res.redirected) {
            alert('회원가입을 축하합니다♥');
            setTimeout(() => {
                window.location.href = res.url;
            }, 500); // 0.5초 delay 후 메인 페이지(/) 이동
        } else {
            alert("회원가입 실패: 서버 응답 확인 필요")
        }
    })
    .catch(error => {
        console.error('회원가입 중 오류 발생:', error);
        alert('회원가입 중 오류가 발생했습니다!');
    });
});

// 로그인 폼 제출 전 hidden input 확인
document.getElementById('form2').addEventListener('submit', function(e) {
    // Spring Security가 처리하므로 기본 동작 유지
    // 하지만 hidden input이 있는지 확인
    const hiddenInput = this.querySelector('input[name="fromNewWindow"]');
    console.log('로그인 폼 제출 - fromNewWindow hidden input:', hiddenInput ? hiddenInput.value : 'none');
    console.log('로그인 폼 제출 - isFromNewWindow:', isFromNewWindow);
});

// 회원가입 유효성 검사 함수
function validateSignupForm(memberData, password, passwordCheck) {

    const idRegex = /^[a-zA-Z0-9]{4,20}$/;
    if (!idRegex.test(memberData.member_id)) {
        alert('아이디는 영문, 숫자 4-20자로 입력해주세요.');
        return false;
    }

    if (!memberData.gender || (memberData.gender !== 'MALE' && memberData.gender !== 'FEMALE')) {
        alert('성별을 선택해주세요.');
        return false;
    }

    const nameRegex = /^[가-힣]{2,20}$/;
    if (!nameRegex.test(memberData.name)) {
        alert('이름은 한글 2-20자로 입력해주세요.');
        return false;
    }

    if (memberData.nickname.length < 2 || memberData.nickname.length > 20) {
        alert('닉네임은 2-20자로 입력해주세요.');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(memberData.email)) {
        alert('올바른 이메일 주소를 입력해주세요.');
        return false;
    }

    // 비밀번호 검사
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/;
    if (!passwordRegex.test(password)) {
        alert('비밀번호는 특수문자, 영문, 숫자를 포함하여 8-30자로 입력해주세요.');
        return false;
    }

    if (password !== passwordCheck) {
        alert('비밀번호가 일치하지 않습니다!');
        return false;
    }

    const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/;
    if (!phoneRegex.test(memberData.phone)) {
        alert('전화번호를 올바른 형식(010-1234-5678)으로 입력해주세요.');
        return false;
    }

    return true;
}

// 실시간 입력 유효성 검사
document.addEventListener('DOMContentLoaded', function() {
    // 전화번호 자동 하이픈 추가
    const phoneInput = document.querySelector('input[name="phone"]');
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length >= 3 && value.length <= 7) {
            value = value.substring(0, 3) + '-' + value.substring(3);
        } else if (value.length >= 8) {
            value = value.substring(0, 3) + '-' + value.substring(3, 7) + '-' + value.substring(7, 11);
        }
        e.target.value = value;
    });

    // 아이디 중복 검사
    const memberIdInput = document.querySelector('input[name="memberId"]');
    let idCheckTimeout;
    memberIdInput.addEventListener('input', function(e) {
        clearTimeout(idCheckTimeout);
        idCheckTimeout = setTimeout(() => {
            const memberId = e.target.value;
            if (memberId.length >= 4) {
                checkDuplicateId(memberId);
            }
        }, 500);
    });
});

function checkDuplicateId(memberId) {
    fetch(`/api/check-duplicate?member_id=${memberId}`)
        .then(response => response.json())
        .then(data => {
            const memberIdInput = document.querySelector('input[name="memberId"]');
            if (data.isDuplicate) {
                memberIdInput.style.borderColor = 'red';
            } else {
                memberIdInput.style.borderColor = 'green';
            }
        })
        .catch(error => {
            console.error('아이디 중복 검사 오류:', error);
        });
}
