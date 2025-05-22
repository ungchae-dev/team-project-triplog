const signInBtn = document.getElementById("signIn");
const signUpBtn = document.getElementById("signUp");
const firstForm = document.getElementById("form1");
const secondForm = document.getElementById("form2");
const container = document.querySelector(".container");

signInBtn.addEventListener("click", () => {
    container.classList.remove("right-panel-active");
});

signUpBtn.addEventListener("click", () => {
    container.classList.add("right-panel-active");
});

firstForm.addEventListener("submit", (e) => e.preventDefault());
secondForm.addEventListener("submit", (e) => e.preventDefault());

document.getElementById("form1").addEventListener("submit", function(e) {
    const pw = document.querySelector('input[name="password"]').value;
    const pwCheck = document.querySelector('input[name="passwordCheck"]').value;

    if (pw !== pwCheck) {
        e.preventDefault(); // 폼 제출 막기
        alert("비밀번호가 일치하지 않습니다.");
    }
});