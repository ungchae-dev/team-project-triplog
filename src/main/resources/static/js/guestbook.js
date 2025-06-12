// guestbook.js : 블로그 - 방명록 기능

// ============= 전역 변수 (고유한 이름으로 충돌 방지) =============
let guestbookCurrentPage = 1;
const guestbookItemsPerPage = 5;
let guestbookTotalEntries = [];
let guestbookTotalPages = 0;
let emoticonPopupWindow = null; // 이모티콘 팝업 창 참조

// ============= 방명록 페이지 초기화 =============
function initGuestbookPage() {
    console.log('방명록 페이지 초기화 시작');
    
    setupEventListeners();
    loadCurrentUserInfo();
    
    // 항상 데이터 로드 (페이지 전환 시마다 새로고침)
    setTimeout(() => {
        loadGuestbookData();
    }, 100);
    
    // 공통 스킨 로드
    if (typeof window.maintainDefaultSkinForInactiveUsers === 'function') {
        window.maintainDefaultSkinForInactiveUsers();
    }
    
    window.guestbookInitialized = true;
    console.log('방명록 페이지 초기화 완료');
}

// ============= 이벤트 리스너 설정 =============
function setupEventListeners() {
    // 전송 버튼 이벤트
    const submitButton = document.getElementById('submitGuestbook');
    if (submitButton) {
        submitButton.addEventListener('click', handleSubmitGuestbook);
    }
    
    // 메시지 입력창 엔터키 이벤트
    const messageInput = document.getElementById('guestMessage');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSubmitGuestbook();
            }
        });
    }
    
    // 내 이모티콘 버튼 이벤트
    const emoticonButton = document.getElementById('emoticonButton');
    if (emoticonButton) {
        emoticonButton.addEventListener('click', openEmoticonPopup);
    }
}

// ============= 현재 로그인한 사용자 정보 로드 =============
async function loadCurrentUserInfo() {
    try {
        // TODO: 실제 API 연동시 현재 로그인한 사용자 정보 가져오기
        // const response = await fetch('/api/current-user');
        // const userData = await response.json();
        
        // 임시 더미 데이터
        const userData = {
            nickname: '닉네임7',
            profileImage: '/images/default_profile.png'
        };
        
        // 프로필 이미지 및 닉네임 설정
        const profileImg = document.getElementById('currentUserProfile');
        const nicknameSpan = document.getElementById('currentUserNickname');
        
        if (profileImg) {
            profileImg.src = userData.profileImage || '/images/default_profile.png';
            profileImg.alt = userData.nickname + '의 프로필';
        }
        
        if (nicknameSpan) {
            nicknameSpan.textContent = userData.nickname || '닉네임';
        }
        
        console.log('현재 사용자 정보 로드 완료:', userData);
        
    } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
        
        // 기본값 설정
        const profileImg = document.getElementById('currentUserProfile');
        const nicknameSpan = document.getElementById('currentUserNickname');
        
        if (profileImg) profileImg.src = '/images/default_profile.png';
        if (nicknameSpan) nicknameSpan.textContent = '게스트';
    }
}

// ============= 이모티콘 팝업 관련 함수들 =============

// 이모티콘 팝업 창 열기
function openEmoticonPopup() {
    console.log('이모티콘 팝업 창 열기 시도');
    
    // 이미 열려있는 팝업이 있으면 닫기
    if (emoticonPopupWindow && !emoticonPopupWindow.closed) {
        emoticonPopupWindow.close();
    }
    
    // 팝업 창 설정
    const popupWidth = 450;
    const popupHeight = 600;
    
    // 현재 브라우저 창 기준으로 중앙 위치 계산
    const parentWidth = window.outerWidth;
    const parentHeight = window.outerHeight;
    const parentLeft = window.screenX;
    const parentTop = window.screenY;
    
    const left = parentLeft + (parentWidth - popupWidth) / 2;
    const top = parentTop + (parentHeight - popupHeight) / 2;
    
    // 팝업 창 옵션
    const popupOptions = [
        `width=${popupWidth}`,
        `height=${popupHeight}`,
        `left=${left}`,
        `top=${top}`,
        'scrollbars=yes',
        'resizable=no',
        'menubar=no',
        'toolbar=no',
        'location=no',
        'status=no'
    ].join(',');
    
    // 팝업 창 열기 (현재는 빈 페이지)
    emoticonPopupWindow = window.open('about:blank', 'emoticonPopup', popupOptions);
    
    if (emoticonPopupWindow) {
        // 팝업 창 내용 설정 (임시 - 나중에 팀원이 수정할 부분)
        emoticonPopupWindow.document.write(`
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <title>내 이모티콘</title>
                <style>
                    body {
                        font-family: 'Malgun Gothic', sans-serif;
                        margin: 0;
                        padding: 20px;
                        background: linear-gradient(135deg, #fff9f7 0%, #ffeee9 100%);
                    }
                    .popup-header {
                        text-align: center;
                        color: #ff8a65;
                        font-size: 18px;
                        font-weight: bold;
                        margin-bottom: 20px;
                        padding-bottom: 10px;
                        border-bottom: 2px solid #f2dcdc;
                    }
                    .emoticon-placeholder {
                        text-align: center;
                        color: #666;
                        margin-top: 100px;
                        font-size: 16px;
                    }
                </style>
            </head>
            <body>
                <div class="popup-header">내 이모티콘</div>
                <div class="emoticon-placeholder">
                    <p>🎭</p>
                    <p>이모티콘 목록이 여기에 표시됩니다.</p>
                    <p>팀원이 이 부분을 구현할 예정입니다.</p>
                </div>
                
                <script>
                    // 부모 창으로 이모티콘 전달하는 함수 (팀원이 사용할 함수)
                    function selectEmoticon(emoticonText) {
                        if (window.opener && !window.opener.closed) {
                            window.opener.addEmoticonToMessage(emoticonText);
                            window.close();
                        }
                    }
                    
                    // 팝업이 닫힐 때 부모 창의 참조 초기화
                    window.addEventListener('beforeunload', function() {
                        if (window.opener && !window.opener.closed) {
                            window.opener.emoticonPopupWindow = null;
                        }
                    });
                </script>
            </body>
            </html>
        `);
        
        emoticonPopupWindow.document.close();
        emoticonPopupWindow.focus();
        
        console.log('이모티콘 팝업 창 열기 완료');
    } else {
        console.error('팝업 차단됨 - 브라우저 설정을 확인하세요');
        alert('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.');
    }
}

// 팝업에서 선택한 이모티콘을 메시지에 추가하는 함수
function addEmoticonToMessage(emoticonText) {
    const messageInput = document.getElementById('guestMessage');
    if (messageInput) {
        const currentText = messageInput.value;
        const cursorPos = messageInput.selectionStart || currentText.length;
        
        const newText = currentText.slice(0, cursorPos) + emoticonText + currentText.slice(cursorPos);
        messageInput.value = newText;
        
        // 커서 위치를 이모티콘 뒤로 이동
        const newCursorPos = cursorPos + emoticonText.length;
        messageInput.focus();
        messageInput.setSelectionRange(newCursorPos, newCursorPos);
        
        console.log('이모티콘 추가됨:', emoticonText);
    }
}

// 전역 함수로 노출 (팝업에서 호출할 수 있도록)
window.addEmoticonToMessage = addEmoticonToMessage;

// === 방명록 목록 로드 함수 ===
async function loadGuestbookData() {
    console.log('방명록 데이터 로드 시작');
    
    // === '방명록 DOM 요소 준비되지 않음' 무한 반복 디버깅 ===
    // 현재 페이지가 방명록 페이지인지 확인
    const currentPath = window.location.pathname;
    const isGuestbookPage = currentPath.includes('/guestbook');

    if (!isGuestbookPage) {
        console.log('방명록 페이지가 아니므로 로드 중단');
        return;
    }

    // DOM 요소 확인
    const guestbookList = document.getElementById('guestbookList');
    const pagination = document.getElementById('pagination');
    
    if (!guestbookList || !pagination) {
        console.warn('방명록 DOM 요소가 아직 준비되지 않음. 재시도...');
        setTimeout(() => loadGuestbookData(), 200);
        return;
    }
    
    try {
        showLoadingMessage();
        
        const currentNickname = getCurrentNickname();
        const response = await fetch(`/blog/api/@${encodeURIComponent(currentNickname)}/guestbook?page=${guestbookCurrentPage}&size=${guestbookItemsPerPage}`);
        const data = await response.json();

        guestbookTotalEntries = data.entries;
        guestbookTotalPages = data.totalPages;

        renderGuestbookList();
        renderPagination();
        
    } catch (error) {
        console.error('방명록 데이터 로드 실패:', error);
        showErrorMessage();
    }
}

// ============= 더미 데이터 생성 (개발용) =============
function generateDummyData() {
    const dummyEntries = [];
    
    // 더미 프로필 이미지들
    const profileImages = [
        '/images/default_profile.png',
        '/images/default_profile.png', // 기본 이미지들
        null, // null인 경우 기본 이미지 사용
        '/images/default_profile.png'
    ];
    
    // 많은 더미 데이터 생성 (페이징 테스트용)
    for (let i = 1; i <= 77; i++) {
        dummyEntries.push({
            id: i,
            nickname: `방문자${i}`,
            message: `${i}번째 방명록입니다! 안녕하세요~ 좋은 블로그네요! 😊`,
            isSecret: i % 7 === 0, // 7의 배수마다 비밀글
            profileImage: profileImages[i % profileImages.length], // 랜덤 프로필 이미지
            createdAt: `2025.${String(5 + Math.floor(i/30)).padStart(2, '0')}.${String(Math.floor(i%30) + 1).padStart(2, '0')} ${String(Math.floor(Math.random()*24)).padStart(2, '0')}:${String(Math.floor(Math.random()*60)).padStart(2, '0')}`
        });
    }
    
    // 최신순으로 정렬 (최근 데이터가 앞에)
    dummyEntries.reverse();
    
    guestbookTotalEntries = dummyEntries;
    guestbookTotalPages = Math.ceil(guestbookTotalEntries.length / guestbookItemsPerPage);
    
    console.log('더미 데이터 생성 완료:', {
        totalEntries: guestbookTotalEntries.length,
        totalPages: guestbookTotalPages,
        itemsPerPage: guestbookItemsPerPage
    });
}

// ============= 방명록 목록 렌더링 =============
function renderGuestbookList() {
    const guestbookList = document.getElementById('guestbookList');
    if (!guestbookList) {
        console.error('방명록 목록 컨테이너를 찾을 수 없습니다.');
        return;
    }
    
    console.log('방명록 목록 렌더링 시작. 총 항목:', guestbookTotalEntries.length);
    
    if (guestbookTotalEntries.length === 0) {
        showEmptyMessage();
        return;
    }
    
    const startIndex = (guestbookCurrentPage - 1) * guestbookItemsPerPage;
    const endIndex = startIndex + guestbookItemsPerPage;
    const currentEntries = guestbookTotalEntries.slice(startIndex, endIndex);
    
    console.log(`페이지 ${guestbookCurrentPage}: ${startIndex}~${endIndex-1} 인덱스 표시`);
    
    guestbookList.innerHTML = '';
    
    currentEntries.forEach(entry => {
        const listItem = createGuestbookEntryElement(entry);
        guestbookList.appendChild(listItem);
    });
    
    console.log('방명록 목록 렌더링 완료');
}

// ============= 방명록 항목 HTML 생성 =============
function createGuestbookEntryElement(entry) {
    const li = document.createElement('li');
    li.className = 'guestbook-entry-item';
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'entry-header';
    
    // 닉네임과 버튼들을 함께 묶는 컨테이너
    const nicknameContainer = document.createElement('div');
    nicknameContainer.className = 'nickname-container';
    
    // 프로필 이미지 추가
    const profileImg = document.createElement('img');
    profileImg.className = 'entry-profile-image';
    profileImg.src = entry.profileImage || '/images/default_profile.png'; // 기본 이미지 또는 사용자 이미지
    profileImg.alt = entry.nickname + '의 프로필';
    nicknameContainer.appendChild(profileImg);
    
    const nicknameSpan = document.createElement('span');
    nicknameSpan.className = 'entry-nickname';
    nicknameSpan.textContent = entry.nickname;
    nicknameContainer.appendChild(nicknameSpan);
    
    // 수정/삭제 버튼들을 닉네임 바로 옆에 추가
    const actionButtonsDiv = document.createElement('div');
    actionButtonsDiv.className = 'inline-actions';
    
    const editButton = document.createElement('button');
    editButton.textContent = '수정';
    editButton.className = 'action-button edit-button';
    editButton.onclick = () => editGuestbookEntry(entry.id);
    actionButtonsDiv.appendChild(editButton);
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '삭제';
    deleteButton.className = 'action-button delete-button';
    deleteButton.onclick = () => deleteGuestbookEntry(entry.id);
    actionButtonsDiv.appendChild(deleteButton);
    
    nicknameContainer.appendChild(actionButtonsDiv);
    
    // 비밀글인 경우 삭제 버튼 바로 옆에 아이콘 추가
    if (entry.isSecret) {
        const secretBadge = document.createElement('span');
        secretBadge.className = 'secret-badge';
        secretBadge.textContent = '🔒비밀글';
        nicknameContainer.appendChild(secretBadge);
    }
    
    const dateSpan = document.createElement('span');
    dateSpan.className = 'entry-date';
    dateSpan.textContent = `(${entry.createdAt})`;
    
    // 헤더에 닉네임 컨테이너와 날짜 추가
    headerDiv.appendChild(nicknameContainer);
    headerDiv.appendChild(dateSpan);
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'entry-message';
    messageDiv.textContent = entry.isSecret ? '(비밀글입니다)' : entry.message;
    
    li.appendChild(headerDiv);
    li.appendChild(messageDiv);
    
    return li;
}

// ============= 페이징 렌더링 (페이지 그룹 방식) =============
function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) {
        console.error('페이징 컨테이너를 찾을 수 없습니다.');
        return;
    }
    
    console.log('페이징 렌더링 시작. 총 페이지:', guestbookTotalPages);
    
    pagination.innerHTML = '';
    
    if (guestbookTotalPages <= 1) {
        console.log('페이지가 1개 이하라서 페이징 숨김');
        return;
    }
    
    const pagesPerGroup = 10; // 한 그룹당 페이지 수
    const currentGroup = Math.ceil(guestbookCurrentPage / pagesPerGroup); // 현재 그룹 번호
    const totalGroups = Math.ceil(guestbookTotalPages / pagesPerGroup); // 총 그룹 수
    
    const groupStartPage = (currentGroup - 1) * pagesPerGroup + 1; // 현재 그룹 시작 페이지
    const groupEndPage = Math.min(currentGroup * pagesPerGroup, guestbookTotalPages); // 현재 그룹 끝 페이지
    
    console.log(`페이징 정보: 현재페이지=${guestbookCurrentPage}, 현재그룹=${currentGroup}/${totalGroups}, 그룹범위=${groupStartPage}-${groupEndPage}`);
     
    // 처음 버튼 (마지막 그룹에서만 표시)
    if (currentGroup === totalGroups && totalGroups > 1) {
        const firstButton = createPaginationButton('처음', () => goToPage(1));
        firstButton.className += ' nav-button';
        pagination.appendChild(firstButton);
    }

    // 이전 그룹 버튼 (2그룹부터 표시)
    if (currentGroup > 1) {
        const prevGroupPage = (currentGroup - 2) * pagesPerGroup + 1; // 이전 그룹의 첫 페이지
        const prevButton = createPaginationButton('이전', () => goToPage(prevGroupPage));
        prevButton.className += ' nav-button';
        pagination.appendChild(prevButton);
    }
    
    // 현재 그룹의 페이지 번호들
    for (let i = groupStartPage; i <= groupEndPage; i++) {
        const pageButton = createPaginationButton(i.toString(), () => goToPage(i));
        if (i === guestbookCurrentPage) {
            pageButton.classList.add('active');
        }
        pagination.appendChild(pageButton);
    }
    
    // 다음 그룹 버튼 (마지막 그룹이 아닐 때 표시)
    if (currentGroup < totalGroups) {
        const nextGroupPage = currentGroup * pagesPerGroup + 1; // 다음 그룹의 첫 페이지
        const nextButton = createPaginationButton('다음', () => goToPage(nextGroupPage));
        nextButton.className += ' nav-button';
        pagination.appendChild(nextButton);
    }
    
    // 끝 버튼 (첫 번째 그룹에서만 표시)
    if (currentGroup === 1 && totalGroups > 1) {
        const lastButton = createPaginationButton('끝', () => goToPage(guestbookTotalPages));
        lastButton.className += ' nav-button';
        pagination.appendChild(lastButton);
    }
    
    console.log('페이징 렌더링 완료');
}

// ============= 페이징 버튼 생성 =============
function createPaginationButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.onclick = onClick;
    return button;
}

// ============= 페이지 이동 =============
function goToPage(pageNumber) {
    if (pageNumber < 1 || pageNumber > guestbookTotalPages || pageNumber === guestbookCurrentPage) {
        return;
    }
    
    console.log(`페이지 이동: ${guestbookCurrentPage} → ${pageNumber}`);
    
    guestbookCurrentPage = pageNumber;
    renderGuestbookList();
    renderPagination();
    
    // 목록 상단으로 스크롤
    const listSection = document.querySelector('.guestbook-list-section');
    if (listSection) {
        listSection.scrollTop = 0;
    }
}

// === 방명록 작성 처리 ===
function handleSubmitGuestbook() {
    const nicknameSpan = document.getElementById('currentUserNickname');
    const messageInput = document.getElementById('guestMessage');
    const secretCheck = document.getElementById('secretCheck');
    
    const nickname = nicknameSpan ? nicknameSpan.textContent : '게스트';
    const message = messageInput.value.trim();
    const isSecret = secretCheck.checked;

    // 디버깅 로그 추가
    console.log('체크박스 요소:', secretCheck);
    console.log('체크박스 checked 속성:', secretCheck ? secretCheck.checked : 'null');
    console.log('비밀글 체크 상태:', isSecret);

    // 입력 검증
    if (!message) {
        alert('메시지를 입력해주세요.');
        messageInput.focus();
        return;
    }
    
    if (message.length > 1000) {
        alert('메시지는 1000자 이내로 입력해주세요.');
        return;
    }
    
    // 작성 확인 창 띄우기
    if (confirm('방명록을 작성하시겠습니까?')) {
        console.log('방명록 작성 시도:', { nickname, message, isSecret });
        
        // 방명록 제출
        submitGuestbookEntry(nickname, message, isSecret);
    } else {
        console.log('방명록 작성 취소됨');
        // 취소 시 입력창에 포커스 (이미 입력한 내용은 유지)
        messageInput.focus();
    }

}

// === 방명록 작성 함수 ===
async function submitGuestbookEntry(nickname, message, isSecret) {
    console.log('API 호출 직전 isSecret 값:', isSecret);

    try {
        // 서버 API 호출
        const currentNickname = getCurrentNickname();
        const response = await fetch(`/blog/api/@${encodeURIComponent(currentNickname)}/guestbook`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message, 
                isSecret: isSecret
            })
        });

        console.log('전송한 데이터:', { message, isSecret });

        if (!response.ok) {
            throw new Error('방명록 작성에 실패했습니다!');
        }
        const result = await response.json();

        // 성공 시 목록 새로고침
        loadGuestbookData();

        // 입력창 초기화
        document.getElementById('guestMessage').value = '';
        document.getElementById('secretCheck').checked = false;
        
        alert('방명록이 작성되었습니다!');
        
    } catch (error) {
        console.error('방명록 작성 실패:', error);
        alert('방명록 작성에 실패했습니다. 다시 시도해주세요.');
    }
}

// ============= 방명록 수정 =============
function editGuestbookEntry(entryId) {
    // TODO: 실제 수정 기능 구현
    alert('수정 기능은 구현 예정입니다.');
    console.log('수정할 방명록 ID:', entryId);
}

// ============= 방명록 삭제 =============
function deleteGuestbookEntry(entryId) {
    if (!confirm('정말 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        console.log('방명록 삭제 시도. ID:', entryId);
        
        // TODO: 실제 API 연동
        // 임시: 더미 데이터에서 삭제
        const beforeCount = guestbookTotalEntries.length;
        guestbookTotalEntries = guestbookTotalEntries.filter(entry => entry.id !== entryId);
        const afterCount = guestbookTotalEntries.length;
        
        console.log(`방명록 삭제 완료. ${beforeCount} → ${afterCount}`);
        
        guestbookTotalPages = Math.ceil(guestbookTotalEntries.length / guestbookItemsPerPage);
        
        // 현재 페이지에 글이 없으면 이전 페이지로
        if (guestbookCurrentPage > guestbookTotalPages && guestbookTotalPages > 0) {
            guestbookCurrentPage = guestbookTotalPages;
        }
        
        renderGuestbookList();
        renderPagination();
        
        alert('방명록이 삭제되었습니다.');
        
    } catch (error) {
        console.error('방명록 삭제 실패:', error);
        alert('방명록 삭제에 실패했습니다. 다시 시도해주세요.');
    }
}

// ============= 메시지 표시 함수들 =============
function showLoadingMessage() {
    const guestbookList = document.getElementById('guestbookList');
    if (guestbookList) {
        guestbookList.innerHTML = '<div class="loading-message">방명록을 불러오는 중...</div>';
    }
}

function showEmptyMessage() {
    const guestbookList = document.getElementById('guestbookList');
    if (guestbookList) {
        guestbookList.innerHTML = `
            <div class="empty-guestbook">
                <p>아직 작성된 방명록이 없습니다.<br>첫 번째 방명록을 남겨보세요!</p>
            </div>
        `;
    }
}

function showErrorMessage() {
    const guestbookList = document.getElementById('guestbookList');
    if (guestbookList) {
        guestbookList.innerHTML = '<div class="loading-message" style="color: #e57373;">방명록을 불러올 수 없습니다. 새로고침 후 다시 시도해주세요.</div>';
    }
}

// ============= 스킨 로드 함수 =============
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
                console.log('스킨이 비활성화되어 있음 - layout.js가 기본 스킨 처리');
            }
        } else {
            console.log('스킨 정보를 가져올 수 없습니다:', response.status);
        }
    } catch (error) {
        console.error('스킨 로드 중 오류:', error);
    }
}

// ============= URL에서 현재 블로그 소유자 닉네임 추출 =============
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

// ============= 스킨 이미지 적용 =============
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
        };
        img.src = skinImageUrl;
    }
}

// ============= 스킨 제거 함수 =============
function removeSkin() {
    const frame = document.querySelector('.frame');
    if (frame) {
        frame.style.backgroundImage = '';
        frame.classList.remove('has-skin', 'loading-skin');
        console.log('방명록 페이지 스킨 제거 완료');
    }
}

// ============= 전역 함수로 노출 =============
window.setupGuestbookFeatures = function() {
    console.log('setupGuestbookFeatures 호출됨 (layout.js에서 호출)');
    
    // 페이지 전환 시마다 초기화 플래그 리셋
    window.guestbookInitialized = false;
    window.guestbookSetupInProgress = false;
    
    // DOM이 준비될 때까지 기다린 후 초기화
    const checkAndInit = () => {
        const guestbookList = document.getElementById('guestbookList');
        if (guestbookList) {
            console.log('방명록 DOM 확인됨 - 초기화 시작');
            initGuestbookPage();
        } else {
            console.log('방명록 DOM 아직 없음 - 재시도');
            setTimeout(checkAndInit, 100);
        }
    };
    
    checkAndInit();
};

window.loadBlogSkin = loadBlogSkin;
window.goToPage = goToPage;
window.handleSubmitGuestbook = handleSubmitGuestbook;
window.editGuestbookEntry = editGuestbookEntry;
window.deleteGuestbookEntry = deleteGuestbookEntry;

// ============= 페이지 로드 시 초기화 =============
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded 이벤트 발생 - 방명록 초기화 시작');
    
    // layout.js에서 호출되는 경우를 위해 짧은 지연 후 확인
    setTimeout(() => {
        if (!window.guestbookInitialized && !window.guestbookSetupInProgress) {
            console.log('layout.js에서 호출되지 않았으므로 직접 초기화');
            initGuestbookPage();
        }
    }, 200);
});