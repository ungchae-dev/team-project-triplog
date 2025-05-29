// 회원가입/로그인 폼 전환 애니메이션
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
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
});

// 로그인 폼으로 전환
signInButton.addEventListener('click', () => {
    container.classList.remove('right-panel-active');
});

// 회원가입 폼 유효성 검사 및 제출
document.getElementById('form1').addEventListener('submit', function(e) {
    e.preventDefault(); // 기본 폼 제출 방지

    const formData = new FormData(this);
    const memberData = {
        member_id: formData.get('member_id'),
        name: formData.get('name'),
        nickname: formData.get('nickname'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
        gender: formData.get('gender') // select에서 성별 가져오기
    };

    // 유효성 검사
    if (!validateSignupForm(memberData, formData.get('passwordCheck'))) {
        return;
    }

    // 서버로 회원가입 요청
    fetch('/api/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('회원가입이 완료되었습니다.');
                container.classList.remove('right-panel-active');
                document.getElementById('form1').reset();
            } else {
                alert('회원가입 실패: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('회원가입 중 오류가 발생했습니다!!');
        });
});

// 로그인 폼 제출
document.getElementById('form2').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const loginData = {
        member_id: formData.get('member_id') || this.querySelector('input[type="text"]').value,
        password: formData.get('password') || this.querySelector('input[type="password"]').value
    };

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
    })
        .then(response => {
            if (response.ok) {
                window.location.href = '/home';
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
function validateSignupForm(memberData, passwordCheck) {
    const idRegex = /^[a-zA-Z0-9]{4,20}$/;
    if (!idRegex.test(memberData.member_id)) {
        alert('아이디는 영문, 숫자 4-20자로 입력해주세요.');
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

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/;
    if (!passwordRegex.test(memberData.password)) {
        alert('비밀번호는 특수문자, 영문, 숫자를 포함하여 8-30자로 입력해주세요.');
        return false;
    }

    if (memberData.password !== passwordCheck) {
        alert('비밀번호가 일치하지 않습니다!');
        return false;
    }

    const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/;
    if (!phoneRegex.test(memberData.phone)) {
        alert('전화번호를 올바른 형식(010-1234-5678)으로 입력해주세요.');
        return false;
    }

    if (!memberData.gender || (memberData.gender !== 'M' && memberData.gender !== 'F')) {
        alert('성별을 선택해주세요.');
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
