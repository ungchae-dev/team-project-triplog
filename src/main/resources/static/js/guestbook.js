// guestbook.js : 블로그 - 방명록 기능

// ============= 전역 변수 (고유한 이름으로 충돌 방지) =============
let guestbookCurrentPage = 1;
const guestbookItemsPerPage = 5;
let guestbookTotalEntries = [];
let guestbookTotalPages = 0;
let emoticonPopupWindow = null; // 이모티콘 팝업 창 참조

// === 방명록 페이지 초기화 함수 (템플릿 생성 추가) ===
function initGuestbookPage() {
    console.log('방명록 페이지 초기화 시작');
    
    // 템플릿 생성 먼저
    createEditTemplate();

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
        // API 호출로 현재 로그인한 사용자 정보 가져오기
        const response = await fetch(`/blog/api/current-user`);

        if (!response.ok) {
            throw new Error(`API 호출 실패: ${response.status}`);
        }

        const userData = await response.json();
        console.log('서버에서 받은 사용자 데이터:', userData);
        
        // 프로필 이미지 및 닉네임 설정
        const profileImg = document.getElementById('currentUserProfile');
        const nicknameSpan = document.getElementById('currentUserNickname');
        
        if (profileImg) {
            // 프로필 이미지 분기 처리
            let imageUrl;

            if (userData.profileImage) {
                imageUrl = userData.profileImage; // 업로드된 이미지 사용
                console.log('업로드된 프로필 이미지 사용:', imageUrl);
            } else {
                imageUrl = '/images/default_profile.png'; // 기본 이미지 사용
                console.log('기본 프로필 이미지 사용:', imageUrl);
            }

            profileImg.src = imageUrl;
            profileImg.alt = userData.nickname + '의 프로필';
            console.log('프로필 이미지 최종 설정:', imageUrl);
        }
        
        if (nicknameSpan) {
            // 닉네임 분기 처리
            let displayNickname;

            if (userData.nickname) {
                displayNickname = userData.nickname; // 실제 닉네임 사용
                console.log('실제 닉네임 사용:', displayNickname);
            } else {
                displayNickname = '닉네임'; // 기본값 사용
                console.log('기본 닉네임 사용:', displayNickname);
            }

            nicknameSpan.textContent = displayNickname;
            console.log('닉네임 최종 설정:', displayNickname);
        }
        
        console.log('현재 사용자 정보 로드 완료:', userData);
        
    } catch (error) {
        console.error('사용자 정보 로드 실패:', error);

        // 로그인되지 않았거나 API 오류 시 기본값으로 설정    
        const profileImg = document.getElementById('currentUserProfile');
        const nicknameSpan = document.getElementById('currentUserNickname');
        
        if (profileImg) {
            profileImg.src = '/images/default_profile.png';
            profileImg.alt = '기본 프로필';
            console.log('에러로 인한 기본 프로필 이미지 설정');
        }
        if (nicknameSpan) {
            nicknameSpan.textContent = '게스트';
            console.log('에러로 인한 게스트 닉네임 설정');
        }

        console.log('기본값으로 설정됨 (로그인 필요 또는 API 오류)');
    }
}

// ============= 이모티콘 팝업 관련 함수들 =============

// 이모티콘 팝업 창 열기
function openEmoticonPopup() {
    const popupWidth = 450;
    const popupHeight = 600;
    const left = (window.screen.width - popupWidth) / 2;
    const top = (window.screen.height - popupHeight) / 2;

    const options = `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,resizable=no`;
    emoticonPopupWindow = window.open('/emoticon-popup.html?mode=create', 'emoticonPopup', options);

    if (!emoticonPopupWindow) {
        alert('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.');
    }
}         
 
// ===== 추가: 에디터와 textarea 동기화 함수 =====
function syncEditorToTextarea() {
  const editor = document.getElementById('guestMessageEditor');
  const textarea = document.getElementById('guestMessage');
  if (editor && textarea) {
    // innerHTML 그대로 보내면 <img> 태그가 포함된 상태로 전송됩니다
    textarea.value = editor.innerHTML;
  }
}

function addEmoticonToMessage(emoticonHtml) {
    // 1. contenteditable 박스에 삽입
  const editor = document.getElementById('guestMessageEditor');
  if (editor) {
    // 커서 위치에 HTML 삽입
    editor.focus();
    document.execCommand('insertHTML', false, emoticonHtml);
  }
  // 2. 숨은 textarea 동기화
  const textarea = document.getElementById('guestMessage');
  if (textarea && editor) {
    textarea.value = editor.innerHTML;
  }
}

// === 방명록 목록 로드 함수 ===
async function loadGuestbookData() {
    console.log('방명록 데이터 로드 시작 - 페이지:', guestbookCurrentPage);
    
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
        // 서버에서 현재 페이지의 데이터만 요청
        const response = await fetch(`/blog/api/@${encodeURIComponent(currentNickname)}/guestbook?page=${guestbookCurrentPage}&size=${guestbookItemsPerPage}`);
        const data = await response.json();

        // 서버에서 받은 데이터 그대로 사용 (클라이언트 페이징 제거)
        guestbookTotalEntries = data.entries;
        guestbookTotalPages = data.totalPages;

        console.log('=== API 응답 디버깅 ===');
        console.log('현재 요청 페이지:', guestbookCurrentPage);
        console.log('서버 응답:', {
            entries: data.entries?.length, 
            totalElements: data.totalElements, 
            totalPages: data.totalPages, 
            currentPage: data.currentPage
        });
        console.log('방명록 ID 목록:', data.entries?.map(e => e.guestbookId));
        console.log('==================');

        renderGuestbookList();
        renderPagination();
        
    } catch (error) {
        console.error('방명록 데이터 로드 실패:', error);
        showErrorMessage();
    }
}

// === 방명록 목록 렌더링 ===
function renderGuestbookList() {
    const guestbookList = document.getElementById('guestbookList');
    if (!guestbookList) {
        console.error('방명록 목록 컨테이너를 찾을 수 없습니다.');
        return;
    }
    
    console.log(`방명록 목록 렌더링 시작 - 페이지 ${guestbookCurrentPage}, 항목 수: ${guestbookTotalEntries.length}`);
    
    if (guestbookTotalEntries.length === 0) {
        showEmptyMessage();
        return;
    }
    
    guestbookList.innerHTML = '';

    // 서버에서 받은 데이터를 그대로 표시 (클라이언트에서 슬라이싱 안함)
    guestbookTotalEntries.forEach(entry => {
        const listItem = createGuestbookEntryElement(entry);
        guestbookList.appendChild(listItem);
    });

    console.log('방명록 목록 렌더링 완료');
}

// === 방명록 항목 HTML 생성 ===
// 1. 수정/삭제 기능
// 2. 비밀글을 볼 수 없는 사람: 제3자 (블로그 주인도 아니고 작성자도 아닌 사람)
function createGuestbookEntryElement(entry) {

    // 비밀글 필드 확인 및 백엔드 코드와 통합
    const isSecret = entry.isSecret || entry.secret || false;

    // === 디버깅 로그 ===
    console.log('방명록 렌더링:', {
        id: entry.guestbookId,
        isSecret: entry.isSecret, 
        secret: entry.secret, 
        finalIsSecret: isSecret, // 최종 결정된 값 (비밀글 여부)
        content: entry.content?.substring(0, 20) + '...', 
        contentLength: entry.content?.length
    });

    const li = document.createElement('li');
    li.className = 'guestbook-entry-item';
    
    // ID 필드 확인 및 설정 (디버깅 로그)
    const entryId = entry.guestbookId || entry.id; // guestbookId 또는 id 둘 다
    console.log('방명록 항목 ID:', entryId);

    if (entryId) {
        li.setAttribute('data-entry-id', entryId);
    } else {
        console.warn('방명록 항목에 ID가 없습니다:', entry);
    }
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'entry-header';
    
    // 닉네임과 버튼들을 함께 묶는 컨테이너
    const nicknameContainer = document.createElement('div');
    nicknameContainer.className = 'nickname-container';
    
    // 프로필 이미지 추가
    const profileImg = document.createElement('img');
    profileImg.className = 'entry-profile-image';
    profileImg.src = entry.profileImage || '/images/default_profile.png'; // 사용자 프로필 이미지 또는 기본 프로필 이미지
    profileImg.alt = entry.nickname + '의 프로필';
    nicknameContainer.appendChild(profileImg);
    
    const nicknameSpan = document.createElement('span');
    nicknameSpan.className = 'entry-nickname';
    nicknameSpan.textContent = entry.nickname;
    nicknameContainer.appendChild(nicknameSpan);
    
    // 수정/삭제 버튼들 (권한 체크)
    if (entry.canEdit || entry.canDelete) {
        const actionButtonsDiv = document.createElement('div');
        actionButtonsDiv.className = 'inline-actions';

        if (entry.canEdit) {
            const editButton = document.createElement('button');
            editButton.textContent = '수정';
            editButton.className = 'action-button edit-button';
            editButton.onclick = () => editGuestbookEntry(entryId);
            actionButtonsDiv.appendChild(editButton);
        }

        if (entry.canDelete) {
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '삭제';
            deleteButton.className = 'action-button delete-button';
            deleteButton.onclick = () => deleteGuestbookEntry(entryId);
            actionButtonsDiv.appendChild(deleteButton);
        }
        
        nicknameContainer.appendChild(actionButtonsDiv);
    }
    
    // 비밀글 배지는 비밀글이면 항상 표시 (권한과 무관)
    if (isSecret) {
        console.log('비밀글 배지 추가:', entry.guestbookId, '- isSecret:', isSecret); // 디버깅
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

    // ※ 핵심 수정: 백엔드에서 이미 권한 처리된 content를 그대로 사용
    messageDiv.innerHTML  = entry.content;
    
    // 디버깅: 비밀글 처리 결과 확인
    if (isSecret) {
        console.log(`비밀글 표시 결과:`, {
            guestbookId: entry.guestbookId, 
            isSecret: isSecret, 
            displayedContent: entry.content.substring(0, 30) + '...', 
            isHidden: entry.content === '(비밀글입니다)'
        });
    }

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

// === 페이지 이동 (서버 요청) ===
function goToPage(pageNumber) {
    if (pageNumber < 1 || pageNumber > guestbookTotalPages || pageNumber === guestbookCurrentPage) {
        console.log('페이지 이동 불가:', {
            요청페이지: pageNumber, 
            현재페이지: guestbookCurrentPage, 
            총페이지:guestbookTotalPages
        });        
        return;
    }
    
    console.log(`페이지 이동: ${guestbookCurrentPage} → ${pageNumber}`);
    
    // 페이지 번호 변경 후 서버에서 새 데이터 요청
    guestbookCurrentPage = pageNumber;
    loadGuestbookData(); // 서버에서 새 페이지 데이터 로드
    
    // 목록 상단으로 스크롤
    const listSection = document.querySelector('.guestbook-list-section');
    if (listSection) {
        listSection.scrollTop = 0;
    }
}

// === 방명록 작성 처리 ===
async function handleSubmitGuestbook() {
    
    // ① 에디터 → textarea 동기화
  // editor → textarea 동기화
    const editor = document.getElementById('guestMessageEditor');
    if (editor) {
    document.getElementById('guestMessage').value = editor.innerHTML;
 }

  const nicknameSpan = document.getElementById('currentUserNickname');
  const messageTextarea = document.getElementById('guestMessage');
  const secretCheck = document.getElementById('secretCheck');

  const nickname = nicknameSpan?.textContent || '게스트';
  const message = messageTextarea.value.trim(); // HTML 포함
  const isSecret = secretCheck.checked;

  if (!message) {
    alert('메시지를 입력해주세요.');
    document.getElementById('guestMessageEditor').focus();
    return;
  }
  if (message.length > 1000) {
    alert('메시지는 1000자 이내로 입력해주세요.');
    return;
  }
  if (!confirm('방명록을 작성하시겠습니까?')) {
    document.getElementById('guestMessageEditor').focus();
    return;
  }

  try {
    const currentNickname = getCurrentNickname();
    const response = await fetch(
      `/blog/api/@${encodeURIComponent(currentNickname)}/guestbook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, isSecret })
      }
    );
    if (!response.ok) throw new Error(response.statusText);
    await response.json();

    // 작성 성공하면
    loadGuestbookData();
    document.getElementById('guestMessageEditor').innerHTML = '';
    document.getElementById('guestMessage').value = '';
    document.getElementById('secretCheck').checked = false;
    alert('방명록이 작성되었습니다!');
  } catch (err) {
    console.error(err);
    alert('작성에 실패했습니다. 다시 시도해주세요.');
  }

}

// === 방명록 수정 ===
function editGuestbookEntry(entryId) {
    console.log('수정할 방명록 ID:', entryId);

    // 현재 방명록 데이터 찾기
    const entry = guestbookTotalEntries.find(e => e.guestbookId === entryId);
    if (!entry) {
        alert('방명록을 찾을 수 없습니다!');
        return;
    }

    // 수정 form 표시
    showEditForm(entry);
}

// === 수정 form 표시 함수 (템플릿 동적 생성 & 이모티콘 버튼 이벤트) ===
function showEditForm(entry) {
    console.log('수정 form 표시 시작:', entry.guestbookId);

    // 비밀글 상태 확인
    const isSecret = entry.isSecret || entry.secret || false;

    console.log('수정 form 비밀글 상태 확인:', {
        guestbookId: entry.guestbookId,
        entryIsSecret: entry.isSecret,
        entrySecret: entry.secret,
        finalIsSecret: isSecret
    });

    // 기존 방명록 항목 숨기기
    const entryElement = document.querySelector(`[data-entry-id="${entry.guestbookId}"]`);
    if (entryElement) {
        entryElement.style.display = 'none';
    }

    // 템플릿이 없으면 동적으로 생성
    let template = document.getElementById('guestbook-edit-template');
    if (!template) {
        console.log('템플릿이 없어서 동적으로 생성합니다.');
        createEditTemplate();
        template = document.getElementById('guestbook-edit-template');
    }

    if (!template) {
        console.error('템플릿 생성에 실패했습니다!');
        alert('수정 기능을 사용할 수 없습니다.');
        // 항목 다시 표시
        if (entryElement) {
            entryElement.style.display = 'block';
        }
        return;
    }

    // 템플릿 복제
    const editFormClone = template.content.cloneNode(true);

    // 데이터 설정
    const editContainer = editFormClone.querySelector('.edit-form-container');
    editContainer.setAttribute('data-edit-id', entry.guestbookId);
    
    // 1) contenteditable 에디터에 기존 내용 채우기
    const editorDiv = editFormClone.querySelector('.edit-editor');
    editorDiv.innerHTML = entry.content;

    // 2) 숨은 textarea에도 기존 내용 채우기
    const textarea = editFormClone.querySelector('.edit-textarea');
    textarea.value = entry.content;
    textarea.id = `editTextarea-${entry.guestbookId}`; // ID 설정 (이모티콘용)

    // 비밀로 하기 체크박스 설정 (isSecret 백엔드와 일치)
    const secretInput = editFormClone.querySelector('.edit-secret-input');
    secretInput.checked = isSecret;
    secretInput.id = `editSecret-${entry.guestbookId}`;

    console.log('수정 폼 체크박스 설정:', {
        guestbookId: entry.guestbookId,
        checkboxChecked: secretInput.checked,
        isSecret: isSecret
    });

    // 이모티콘 버튼 이벤트 설정
    const emoticonBtn = editFormClone.querySelector('.edit-emoticon-button');
    if (emoticonBtn) {
        emoticonBtn.onclick = () => openEditEmoticonPopup(entry.guestbookId);
        console.log('이모티콘 버튼 이벤트 설정 완료');
    } else {
        console.error('이모티콘 버튼을 찾을 수 없습니다!');
    }

    // 이모티콘 버튼 외 나머지 버튼 이벤트 설정
    const saveBtn = editFormClone.querySelector('.edit-save-btn');
    saveBtn.onclick = () => saveEditGuestbook(entry.guestbookId);

    const cancelBtn = editFormClone.querySelector('.edit-cancel-btn');
    cancelBtn.onclick = () => cancelEditGuestbook(entry.guestbookId);

    // DOM에 삽입
    if (entryElement) {
        entryElement.parentNode.insertBefore(editFormClone, entryElement.nextSibling);
        console.log('수정 폼 표시 완료 (이모티콘 버튼 포함)');
    }

}

// === 수정 form용 이모티콘 팝업 함수 ===
function openEditEmoticonPopup(entryId) {
   console.log('수정 폼 이모티콘 팝업 창 열기 시도 - 방명록 ID:', entryId);

    if (emoticonPopupWindow && !emoticonPopupWindow.closed) {
        emoticonPopupWindow.close();
    }

    const popupWidth = 450;
    const popupHeight = 600;
    const left = (window.screen.width - popupWidth) / 2;
    const top = (window.screen.height - popupHeight) / 2;

    const options = `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,resizable=no`;
    emoticonPopupWindow = window.open(`/emoticon-popup.html?mode=edit&entryId=${entryId}`, 'emoticonPopup', options);

    if (!emoticonPopupWindow) {
        alert('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.');
    }
}

// 댓글 수정 에디터 → 숨은 textarea 동기화
function syncEditEditorToTextarea(entryId) {
  const container = document.querySelector(`[data-edit-id="${entryId}"]`);
  if (!container) return;
  const editor = container.querySelector('.edit-editor');
  const textarea = container.querySelector('.edit-textarea');
  textarea.value = editor.innerHTML;
}

// === 수정 폼의 textarea에 이모티콘 추가하는 함수 ===
function addEmoticonToEditForm(entryId, emoticonHtml) {

  // 1. 수정용 contenteditable
  const editor = document.querySelector(`.edit-form-container[data-edit-id="${entryId}"] .edit-editor`);
  if (editor) {
    editor.focus();
    document.execCommand('insertHTML', false, emoticonHtml);
  }
  // 2. 숨은 textarea 동기화
  const textarea = document.querySelector(`.edit-form-container[data-edit-id="${entryId}"] .edit-textarea`);
  if (textarea && editor) {
    textarea.value = editor.innerHTML;
  }
}


// 템플릿 동적 생성 함수
function createEditTemplate() {
    // 이미 템플릿이 있는지 확인
    if (document.getElementById('guestbook-edit-template')) return;
  const template = document.createElement('template');
  template.id = 'guestbook-edit-template';
  template.innerHTML = `
    <div class="edit-form-container">
      <div class="edit-form">
        <div class="edit-header">
          <h4>방명록 수정</h4>
          <button class="edit-emoticon-button">내 이모티콘</button>
        </div>
        <!-- 수정용 contenteditable 에디터 -->
        <div
          class="edit-editor"
          contenteditable="true"
          data-placeholder="방명록 내용을 입력하세요~"
        ></div>
        <!-- 전송용 숨은 textarea -->
        <textarea class="edit-textarea" name="message" hidden></textarea>
        <div class="edit-controls">
          <label class="edit-secret-checkbox">
            <input type="checkbox" class="edit-secret-input"> 비밀로 하기
          </label>
          <div class="edit-buttons">
            <button class="edit-save-btn">저장</button>
            <button class="edit-cancel-btn">취소</button>
          </div>
        </div>
      </div>
    </div>
  `;
    
    // body에 추가 (head보다 안전)
    document.body.appendChild(template);
    console.log('수정 폼 템플릿 동적 생성 완료 (이모티콘 버튼 포함)');
}

// 수정 저장 함수 (디버깅 로그 추가)
async function saveEditGuestbook(entryId) {
    
     // ① 에디터 → textarea
    const container = document.querySelector(`[data-edit-id="${entryId}"]`);
    const editor = container.querySelector('.edit-editor');
    const textarea = container.querySelector('.edit-textarea');
    if (editor && textarea) {
    textarea.value = editor.innerHTML;
    }
  
  const isSecret = container.querySelector('.edit-secret-input').checked;
  const newMessage = textarea.value.trim();

  if (!newMessage) {
    alert('메시지를 입력해주세요~');
    container.querySelector('.edit-editor').focus();
    return;
  }
  if (!confirm('방명록을 수정하시겠습니까?')) {
    container.querySelector('.edit-editor').focus();
    return;
  }

  try {
    const currentNickname = getCurrentNickname();
    const response = await fetch(
      `/blog/api/@${encodeURIComponent(currentNickname)}/guestbook/${entryId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage, isSecret })
      }
    );
    if (!response.ok) throw new Error(response.statusText);
    await response.json();

    cancelEditGuestbook(entryId);
    loadGuestbookData();
    alert('방명록이 수정되었습니다.');
  } catch (err) {
    console.error(err);
    alert('수정에 실패했습니다. 다시 시도해주세요.');
  }
}

// 수정 취소 함수
function cancelEditGuestbook(entryId) {
    // 수정 form 제거
    const editForm = document.querySelector(`[data-edit-id="${entryId}"]`);
    if (editForm) {
        editForm.remove();
    }

    // 원래 방명록 항목 다시 표시
    const entryElement = document.querySelector(`[data-entry-id="${entryId}"]`);
    if (entryElement) {
        entryElement.style.display = 'block';
    }
}

// === 방명록 삭제 ===
async function deleteGuestbookEntry(entryId) {
    if (!confirm('방명록을 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        console.log('방명록 삭제 시도. ID:', entryId);
        
        // 서버 API 호출
        const currentNickname = getCurrentNickname();
        const response = await fetch(`/blog/api/@${encodeURIComponent(currentNickname)}/guestbook/${entryId}`, {
            method: 'DELETE', 
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`삭제 실패: ${response.status}`);
        }

        const result = await response.json();
        console.log('삭제 서버 응답:', result);

        // 성공 시 방명록 목록 새로고침
        loadGuestbookData();
        alert('방명록이 삭제되었습니다.');
        
    } catch (error) {
        console.error('방명록 삭제 실패:', error);
        alert('방명록 삭제에 실패했습니다! 다시 시도해주세요.');
    }
}

// === 메시지 표시 함수들 ===
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

// === 스킨 로드 함수 ===
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
window.addEmoticonToMessage   = addEmoticonToMessage;
window.addEmoticonToEditForm = addEmoticonToEditForm;

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