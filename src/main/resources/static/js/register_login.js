// 회원가입/로그인 폼 전환 애니메이션
const signUpButton = document.getElementById('signUp');
const loginButton = document.getElementById('signIn');
const container = document.querySelector('.container');

// URL 파라미터로 초기 상태 설정
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    
    if(type === 'signin') {
        container.classList.remove('right-panel-active'); // 로그인 폼 보여주기
    } else if (type === 'signup') {
        container.classList.add('right-panel-active') // 회원가입 폼 보여주기
    }
});

// 회원가입 폼으로 전환
signUpButton.addEventListener('click', () => {
    container.classList.add('right-panel-active');
    window.history.pushState(null, '', '/member/login?type=signup');
});

// 로그인 폼으로 전환
loginButton.addEventListener('click', () => {
    container.classList.remove('right-panel-active');
    window.history.pushState(null, '', '/member/login?type=signin');
});

// 회원가입 폼 유효성 검사 및 제출
document.getElementById('form1').addEventListener('submit', function(e) {
    e.preventDefault(); // 기본 폼 제출 방지

    const formData = new FormData(this);

    // 유효성 검사를 위해 JSON 객체화
    const memberData = {
        member_id: formData.get('memberId'), // HTML과 동일하게
        name: formData.get('name'),
        nickname: formData.get('nickname'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        gender: formData.get('gender') // slect에서 성별 가져오기e
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
            }, 500); // 0.5초 delay 후 기본값("/") 페이지(메인 페이지) 이동
        } else {
            alert("회원가입 실패: 서버 응답 확인 필요")
        }
    })
    .catch(error => {
        console.error('회원가입 중 오류 발생:', error);
        alert('회원가입 중 오류가 발생했습니다!');
    });
});


// 로그인 폼 제출
document.getElementById('form2').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const loginData = {
        member_id: formData.get('memberId') || this.querySelector('input[type="text"]').value,
        password: formData.get('password') || this.querySelector('input[type="password"]').value
    };

    // 로그인 요청
    fetch('/member/login_api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
    })
    .then(response => {
        if (response.ok) {
            window.location.href = '/';
        } else {
            return response.json();
        }
    })
    .then(data => {
        if (data) {
            alert('로그인 실패: ' + (data.message || '아이디 또는 비밀번호가 잘못되었습니다.'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('로그인 중 오류가 발생했습니다!');
    });
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
    const memberIdInput = document.querySelector('input[name="member_id"]');
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
            const memberIdInput = document.querySelector('input[name="member_id"]');
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
