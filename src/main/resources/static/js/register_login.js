// 회원가입 · 로그인 폼 전환 애니메이션
const signUpButton = document.getElementById("signUp"); // 회원가입 버튼
const signInButton = document.getElementById("signIn"); // 로그인 버튼
const container = document.querySelector(".container");

// 회원가입 폼으로 전환
signUpButton.addEventListener("click", () => {
    container.classList.add("right-panel-active");
});

// 로그인 폼으로 전환
signInButton.addEventListener("click", () => {
    container.classList.remove("right-panel-active");
});

// 회원가입 폼 유효성 검사 및 제출
document.getElementById("form1").addEventListener("submit", function(e) {
    e.preventDefault(); // 기본 폼 제출 방지

    const formData = new FormData(this);
    const memberData = {
        // member_id - name - ssn - nickname - email - password - phone
        member_id: formData.get('member_id'),
        name: formData.get('name'),
        ssn: formData.get('ssn'),
        nickname: formData.get('nickname'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone')
    };

    // 유효성 검사
    if (!validateSignupForm(memberData, formData.get('passwordCheck'))) {
        return;
    }

    // 서버로 회원가입 요청
    // <추가 코드 작성 예정...>

    // 회원가입 유효성 검사 함수 시작
    function validateSignupForm(memberData, passwordCheck) {
        // 아이디 검사 (영문, 숫자 4-20자)
        const idRegex = /^[a-zA-Z0-9]{4,20}$/;
        if(!idRegex.test(memberData.member_id)) {
            alert('아이디는 영문, 숫자 포함 4~20자로 입력해주세요!');
            return false;
        }

    } // 회원가입 유효성 검사 함수 종료


});