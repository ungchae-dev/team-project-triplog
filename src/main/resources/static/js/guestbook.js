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
