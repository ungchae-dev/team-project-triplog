// 회원가입/로그인 폼 전환 애니메이션
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.querySelector('.container');

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
        ssn: formData.get('ssn'),
        nickname: formData.get('nickname'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone')
    };

    // 주민등록번호(ssn)로부터 성별(gender) 파생
    const ssn = formData.get('ssn');
    const genderDigit = ssn.charAt(7);
    let gender;
    if (genderDigit === '1' || genderDigit === '3') gender = 'M';
    else if (genderDigit === '2' || genderDigit === '4') gender = 'F';
    else {
        alert('주민등록번호 뒷자리 첫 글자는 1~4 사이 값입니다!');
        return;
    }
    memberData.gender = gender;

    // 유효성 검사
    if (!validateSignupForm(memberData, formData.get('passwordCheck'))) {
        return;
    }

    // 서버로 회원가입 요청
    fetch('/api/auth/signup', {
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
                // 로그인 폼으로 전환
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

    // 서버로 로그인 요청 (Spring Security가 처리)
    fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
    })
        .then(response => {
            if (response.ok) {
                // 로그인 성공 시 홈페이지로 이동
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
    // 아이디 검사 (영문, 숫자 4-20자)
    const idRegex = /^[a-zA-Z0-9]{4,20}$/;
    if (!idRegex.test(memberData.member_id)) {
        alert('아이디는 영문, 숫자 4-20자로 입력해주세요.');
        return false;
    }

    // 이름 검사 (한글 2-20자)
    const nameRegex = /^[가-힣]{2,20}$/;
    if (!nameRegex.test(memberData.name)) {
        alert('이름은 한글 2-20자로 입력해주세요.');
        return false;
    }

    // 주민등록번호 검사 (6자리-7자리)
    const ssnRegex = /^\d{6}-\d{7}$/;
    if (!ssnRegex.test(memberData.ssn)) {
        alert('주민등록번호를 올바른 형식(123456-1234567)으로 입력해주세요.');
        return false;
    }

    // 닉네임 검사 (2-20자)
    if (memberData.nickname.length < 2 || memberData.nickname.length > 20) {
        alert('닉네임은 2-20자로 입력해주세요.');
        return false;
    }

    // 이메일 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(memberData.email)) {
        alert('올바른 이메일 주소를 입력해주세요.');
        return false;
    }

    // 비밀번호 검사 (특수문자, 영문, 숫자 포함 8-30자)
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/;
    if (!passwordRegex.test(memberData.password)) {
        alert('비밀번호는 특수문자, 영문, 숫자를 포함하여 8-30자로 입력해주세요.');
        return false;
    }

    // 비밀번호 확인 검사
    if (memberData.password !== passwordCheck) {
        alert('비밀번호가 일치하지 않습니다!');
        return false;
    }

    // 전화번호 검사 (010-1234-5678 형식)
    const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/;
    if (!phoneRegex.test(memberData.phone)) {
        alert('전화번호를 올바른 형식(010-1234-5678)으로 입력해주세요.');
        return false;
    }

    return true;
}

// 실시간 입력 유효성 검사 (선택사항)
document.addEventListener('DOMContentLoaded', function() {
    // 주민등록번호 자동 하이픈 추가
    const ssnInput = document.querySelector('input[name="ssn"]');
    ssnInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length >= 6) {
            value = value.substring(0, 6) + '-' + value.substring(6, 13);
        }
        e.target.value = value;
    });

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

    // 아이디 중복 검사 (실시간)
    const memberIdInput = document.querySelector('input[name="member_id"]');
    let idCheckTimeout;
    memberIdInput.addEventListener('input', function(e) {
        clearTimeout(idCheckTimeout);
        idCheckTimeout = setTimeout(() => {
            const memberId = e.target.value;
            if (memberId.length >= 4) {
                checkDuplicateId(memberId);
            }
        }, 500); // 0.5초 후 중복 검사
    });
});

// 아이디 중복 검사 함수
function checkDuplicateId(memberId) {
    fetch(`/api/auth/check-duplicate?member_id=${memberId}`)
        .then(response => response.json())
        .then(data => {
            const memberIdInput = document.querySelector('input[name="member_id"]');
            if (data.isDuplicate) {
                memberIdInput.style.borderColor = 'red';
                // 중복 메시지 표시 (필요시)
            } else {
                memberIdInput.style.borderColor = 'green';
            }
        })
        .catch(error => {
            console.error('아이디 중복 검사 오류:', error);
        });
}