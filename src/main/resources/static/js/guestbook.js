// guestbook.js : 블로그 - 방명록 기능

// 방문자 닉네임을 무작위로 자동 입력 (readonly)
document.addEventListener('DOMContentLoaded', () => {
    const nicknameField = document.getElementById('nickname');
    if (nicknameField && nicknameField.value.trim() === '') {
        const visitorNames = ["방문자1", "여행객7", "친구9", "게스트12", "익명"];
        const randomIdx = Math.floor(Math.random() * visitorNames.length);
        nicknameField.value = visitorNames[randomIdx];
        nicknameField.readOnly = true; // 혹시나 안 되어있으면 추가
    }
});

// 방명록 전송 버튼 이벤트 함수
function addGuestbookEntry() {
    const nicknameInput = document.getElementById('nickname');
    const messageInput = document.getElementById('message');
    const secretCheck = document.getElementById('secret-check');
    const guestbookList = document.getElementById('guestbookList');

    const nickname = nicknameInput.value.trim();
    const message = messageInput.value.trim();
    const isSecret = secretCheck.checked;

    // 메시지 필수 입력
    if (!message) {
        alert("메시지를 입력하세요.");
        messageInput.focus();
        return;
    }

    const now = new Date().toLocaleString();
    const secretIcon = isSecret ? ' 🔒비밀글' : '';
    const messageText = isSecret ? '(비밀글입니다)' : message;

    const li = document.createElement('li');
    li.innerHTML = `
    <div class="entry-header"><b>${nickname}</b> (${now})${secretIcon}</div>
    <div class="entry-message">${messageText}</div>
    <div class="entry-actions">
      <button onclick="editEntry(this)">수정</button>
      <button onclick="deleteEntry(this)">삭제</button>
    </div>
  `;

    guestbookList.prepend(li);

    // 입력창 초기화
    messageInput.value = '';
    secretCheck.checked = false;
}

// (옵션) 수정/삭제 함수는 빈 함수로 둡니다. 필요시 추가 구현
function editEntry(btn) {
    alert("수정 기능은 구현 예정입니다.");
}

function deleteEntry(btn) {
    if (confirm("정말 삭제할까요?")) {
        btn.closest("li").remove();
    }
}

// === 스킨 로드 함수 시작 ===

// 블로그 스킨 자동 로드
async function loadBlogSkin() {
    const currentNickname = getCurrentNickname();
    if (!currentNickname) {
        console.log('닉네임이 없어서 스킨 로드를 건너뜁니다.');
        return;
    }

    try {
        const encodedNickname = encodeURIComponent(currentNickname);
        const response = await fetch(`/blog/api/@${encodedNickname}/skin`);

        if (response.ok) {
            const skinData = await response.json();
            console.log('방명록 페이지 스킨 데이터:', skinData);

            if (skinData.skinActive === 'Y' && skinData.skinImage) {
                applySkin(skinData.skinImage);
            } else {
                console.log('스킨이 비활성화되어 있거나 이미지가 없습니다.');
                removeSkin();
            }
        } else {
            console.log('스킨 정보를 가져올 수 없습니다:', response.status);
            removeSkin();
        }
    } catch (error) {
        console.error('스킨 로드 중 오류:', error);
        removeSkin();
    }
}

// URL에서 현재 블로그 소유자 닉네임 추출
function getCurrentNickname() {
    const currentPath = window.location.pathname;
    const match = currentPath.match(/^\/blog\/@([^\/]+)/);
    if (match) {
        try {
            return decodeURIComponent(match[1]);
        } catch (e) {
            return match[1];
        }
    }
    return null;
}

// 스킨 이미지 적용
function applySkin(skinImageUrl) {
    const frame = document.querySelector('.frame');
    if (frame && skinImageUrl) {
        frame.classList.add('loading-skin');

        const img = new Image();
        img.onload = () => {
            frame.style.backgroundImage = `url(${skinImageUrl})`;
            frame.classList.add('has-skin');
            frame.classList.remove('loading-skin');
            console.log('방명록 페이지 스킨 적용 완료:', skinImageUrl);
        };
        img.onerror = () => {
            frame.classList.remove('loading-skin');
            console.log('스킨 로드 실패:', skinImageUrl);
            removeSkin();
        };
        img.src = skinImageUrl;
    }
}

// 스킨 제거 함수
function removeSkin() {
    const frame = document.querySelector('.frame');
    if (frame) {
        frame.style.backgroundImage = '';
        frame.classList.remove('has-skin', 'loading-skin');
        console.log('방명록 페이지 스킨 제거 완료');
    }
}

// 전역으로 노출
window.loadBlogSkin = loadBlogSkin;

// === 스킨 로드 함수 끝 ===