// profile.js

// 탭 전환 기능
const tabBtns = document.querySelectorAll('.shop-inner-tab');
const tabContents = [
    document.querySelector('.profile-info-tab'),
    document.querySelector('.profile-inventory-tab'),
    document.querySelector('.profile-edit-tab')
];
tabBtns.forEach((btn, i) => {
    btn.onclick = () => {
        tabBtns.forEach((b, j) => {
            b.classList.toggle('active', i === j);
            tabContents[j].style.display = i === j ? 'block' : 'none';
        });
    };
});

// (아래는 이전 답변의 프로필 저장/이미지 미리보기 코드와 동일하게 사용)


// 프로필 변경 폼 기능
const form = document.getElementById('profile-edit-form');
const editNickname = document.getElementById('edit-nickname');
const editBio = document.getElementById('edit-bio');
const editPhoto = document.getElementById('edit-photo');
const editPreviewImg = document.getElementById('edit-preview-img');

// 동기화 대상(왼쪽, 중앙)
const sideNickname = document.getElementById('side-nickname');
const sideBio = document.getElementById('side-bio');
const mainNickname = document.getElementById('main-nickname');
const mainBio = document.getElementById('main-bio');
const sideProfileImg = document.getElementById('side-profile-img');
const mainProfileImg = document.getElementById('main-profile-img');

// 미리보기: 사진 업로드시 바로 반영
editPhoto.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            editPreviewImg.src = evt.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// 프로필 저장 (닉네임/자기소개/사진 모두 갱신)
form.addEventListener('submit', function(e) {
    e.preventDefault();

    // 1. 닉네임/자기소개
    const newNickname = editNickname.value || '닉네임(♂/♀)';
    const newBio = editBio.value || '간단한 자기소개가 들어갑니다...';

    // 왼쪽(사이드)
    sideNickname.textContent = newNickname;
    sideBio.textContent = newBio;

    // 중앙(프로필 정보)
    mainNickname.textContent = newNickname;
    mainBio.textContent = newBio;

    // 2. 프로필 사진 변경(미리보기 소스 활용)
    if (editPreviewImg.src && !editPreviewImg.src.includes('placeholder')) {
        sideProfileImg.src = editPreviewImg.src;
        mainProfileImg.src = editPreviewImg.src;
    }

    // 3. 저장 후 탭 자동 전환(프로필 정보)
    tabBtns[0].click();

    // (실제 서버 저장, 비밀번호 변경 등은 여기에 AJAX 등으로 추가!)
    alert('프로필이 변경되었습니다.');
});

// 초기화: 폼을 열 때 현재 값으로 미리 채우기 (선택적)
tabBtns[2].addEventListener('click', () => {
    // 중앙/사이드와 동기화
    editNickname.value = mainNickname.textContent;
    editBio.value = mainBio.textContent;
    editPreviewImg.src = mainProfileImg.src;
});
