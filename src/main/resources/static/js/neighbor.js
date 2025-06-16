// neighbor.js - 블로그 이웃 기능 전담 모듈

(function() {

    'use strict';

    // === 전역 변수 ===
    let neighborDropdownVisible = false;
    let currentNeighborList = [];

    // === 이웃 파도타기 드롭다운 초기화 ===
    function initNeighborDropdown() {
        console.log('이웃 파도타기 드롭다운 초기화 시작');

        const neighborDropdown = document.querySelector('.neighbor-dropdown');
        const neighborButton = neighborDropdown?.querySelector('button');

        if (!neighborButton) {
            console.log('이웃 파도타기 버튼을 찾을 수 없습니다.');
            return;
        }

        // 기존 이벤트 제거 후 새로 등록
        neighborButton.removeEventListener('click', toggleNeighborDropdown);
        neighborButton.addEventListener('click', toggleNeighborDropdown);

        console.log('이웃 파도타기 버튼 이벤트 등록 완료');
    }

    // === 이웃 드롭다운 토글 ===
    async function toggleNeighborDropdown(e) {
        e.preventDefault();
        console.log('이웃 파도타기 버튼 클릭됨');

        const neighborDropdown = document.querySelector('.neighbor-dropdown');

        if (neighborDropdownVisible) {
            hideNeighborDropdown(); // 드롭다운 숨기기
        } else {
            await showNeighborDropdown(); // 드롭다운 표시
        }
    }

    // === 이웃 드롭다운 숨기기 ===
    function hideNeighborDropdown() {
        const existingDropdown = document.querySelector('.neighbor-list-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
        }
        
        neighborDropdownVisible = false;
        document.removeEventListener('click', handleOutsideClick);
        console.log('이웃 드롭다운 숨김 완료');
    }

     // === 이웃 드롭다운 표시 ===
    async function showNeighborDropdown() {
        console.log('이웃 드롭다운 표시 시작');

        // 현재 로그인한 사용자 확인
        if (typeof window.getCurrentUserId !== 'function' || !window.getCurrentUserId) {
            alert('로그인이 필요합니다!');
            return;
        }

        try {
            await loadMyNeighborList(); // 내 이웃 목록 가져오기
            createNeighborDropdownUI(); // 드롭다운 UI 생성

            neighborDropdownVisible = true;
            console.log('이웃 드롭다운 표시 완료');
        } catch (error) {
            console.error('이웃 드롭다운 표시 중 오류:', error);
            alert('이웃 목록을 불러오는데 실패했습니다.');
        }
    }

    // === 내 이웃 목록 로드 ===
    async function loadMyNeighborList() {
        console.log('내 이웃 목록 로드 시작');

        // 현재 방문 중인 블로그 주인의 닉네임이 필요
        const blogOwnerNickname = getBlogOwnerNickname();
        if (!blogOwnerNickname) {
            console.error('블로그 주인의 닉네임을 가져올 수 없습니다!');
            currentNeighborList = [];
            return;
        }
        console.log('블로그 주인:', blogOwnerNickname);

        try {
            const encodedNickname = encodeURIComponent(blogOwnerNickname);
            const response = await fetch(`/blog/api/@${encodedNickname}/neighbors`, {
                method: 'GET', 
                credentials: 'same-origin', 
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                currentNeighborList = await response.json(); // 이미 DTO 형태로 받음
                console.log(`${blogOwnerNickname}의 이웃 목록 로드 성공:`, currentNeighborList);
            } else {
                console.error('이웃 목록 로드 실패:', response.status);
                currentNeighborList = [];
            }
        } catch (error) {
            console.error('이웃 목록 로드 중 오류:', error);
            currentNeighborList = [];
        }

    }

    // === 이웃 드롭다운 UI 생성 ===
    function createNeighborDropdownUI() {
        const neighborDropdown = document.querySelector('.neighbor-dropdown');

        // 기존 드롭다운 제거
        const existingDropdown = neighborDropdown.querySelector('.neighbor-list-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
        }

        // 새 드롭다운 생성
        const dropdownDiv = document.createElement('div');
        dropdownDiv.className = 'neighbor-list-dropdown';
        dropdownDiv.innerHTML = createNeighborListHTML();

        neighborDropdown.appendChild(dropdownDiv);
        setupNeighborListEvents(dropdownDiv);

        // 스크롤 힌트 설정
        setupScrollHint(dropdownDiv);

        console.log('이웃 드롭다운 UI 생성 완료');
    }

    // 스크롤 힌트 설정
    function setupScrollHint(dropdownDiv) {
        // 스크롤이 필요한지 확인
        setTimeout(() => {
            const hasScroll = dropdownDiv.scrollHeight > dropdownDiv.clientHeight;

            if (hasScroll) {
                dropdownDiv.classList.add('has-scroll');
                console.log('스크롤 힌트 활성화 - 더 많은 이웃이 있습니다');

                // 스크롤 이벤트로 힌트 제거
                dropdownDiv.addEventListener('scroll', () => {
                    const isAtBottom = dropdownDiv.scrollTop + dropdownDiv.clientHeight >= dropdownDiv.scrollHeight - 5;
                    
                    if (isAtBottom) {
                        dropdownDiv.classList.remove('has-scroll');
                    }
                });
            }
        }, 100);
    }


    // === 이웃 목록 HTML 생성 ===
    function createNeighborListHTML() {
        // 현재 블로그 주인 이름 가져오기
        const blogOwnerNickname = getBlogOwnerNickname();
        const headerText = blogOwnerNickname ? `${blogOwnerNickname}의 이웃들` : '이웃들';
        
        let html = `<div class="neighbor-list-header">${headerText}</div>`;

        if (currentNeighborList.length === 0) {
            html += '<div class="neighbor-empty">등록된 이웃이 없습니다.</div>';
        } else {
            html += '<ul class="neighbor-list">';
            currentNeighborList.forEach(neighbor => {
                html += `
                    <li class="neighbor-item" data-nickname="${neighbor.nickname}">
                        <span class="neighbor-name">${neighbor.nickname}님의 블로그</span>
                        <button class="neighbor-remove-btn" data-nickname="${neighbor.nickname}" title="이웃 제거">✕</button>
                    </li>
                `;
            });
            html += '</ul>';
        }

        return html;
    }

    // === getCurrentUserNickname 함수 (layout.js에서 가져옴) ===
    function getCurrentUserNickname() {
        if (typeof window.getCurrentUserNickname === 'function') {
            return window.getCurrentUserNickname();
        }

        // 대안: 전역 변수에서 가져오기
        if (window.currentUserInfo && window.currentUserInfo.nickname) {
            return window.currentUserInfo.nickname;
        }
        return null;
    }

    // === 이웃 목록 이벤트 설정 ===
    function setupNeighborListEvents(dropdownDiv) {

        // 이웃 블로그 이동 이벤트
        const neighborItems = dropdownDiv.querySelectorAll('.neighbor-item');
        neighborItems.forEach(item => {
            const neighborName = item.querySelector('.neighbor-name');
            if (neighborName) {
                neighborName.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const nickname = item.getAttribute('data-nickname');
                    navigateToNeighborBlog(nickname);
                });
                neighborName.style.cursor = 'pointer';
            }
        });

        // 이웃 제거 버튼 이벤트
        const removeButtons = dropdownDiv.querySelectorAll('.neighbor-remove-btn');
        console.log('이웃 제거 버튼 개수:', removeButtons.length);

        removeButtons.forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const nickname = btn.getAttribute('data-nickname');
                console.log('이웃 제거 버튼 클릭:', nickname);
                removeNeighbor(nickname);
            });

            // 디버깅: 버튼 스타일 확인
            console.log(`제거 버튼 ${index + 1} 설정 완료:`, btn);
        });

        // 외부 클릭 시 드롭다운 닫기
        setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
        }, 100);
    }

    // === 외부 클릭 처리 ===
    function handleOutsideClick(e) {
        if (neighborDropdownVisible) {
            const neighborDropdown = document.querySelector('.neighbor-dropdown');
            if (!neighborDropdown.contains(e.target)) {
                hideNeighborDropdown();
            }
        }
    }

    // === 이웃 블로그로 이동 ===
    function navigateToNeighborBlog(nickname) {
        console.log('이웃 블로그로 이동:', nickname);

        try {
            const encodedNickname = encodeURIComponent(nickname);
            const blogUrl = `/blog/@${encodedNickname}`;

            // 현재 창에서 이동
            window.location.href = blogUrl;

        } catch (error) {
            console.error('이웃 블로그 이동 중 오류:', error);
            alert('블로그 이동에 실패했습니다!');
        }
    }

    // === 이웃 제거 ===
    async function removeNeighbor(nickname) {
        if (!confirm(`${nickname}님을 이웃에서 제거하시겠습니까?`)) { return; }
        console.log('이웃 제거 시작:', nickname);

        try {
            const encodedNickname = encodeURIComponent(nickname);
            const response = await fetch(`/blog/api/@${encodedNickname}/neighbors`, {
                method: 'DELETE', 
                credentials: 'same-origin', 
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                console.log('이웃 제거 성공:', nickname);
                alert(result.message || `${nickname}님을 이웃에서 제거했습니다.`);

                // 이웃 목록 다시 로드하고 드롭다운 갱신
                await loadMyNeighborList();
                createNeighborDropdownUI();

            } else {
                console.error('이웃 제거 실패:', result.message);
                alert(`이웃 제거 실패: ${result.message}`);
            }

        } catch (error) {
            console.error('이웃 제거 중 오류:', error);
            alert('이웃 제거 중 오류가 발생했습니다!');
        }
    }

    // === EDIT 버튼을 이웃 추가 버튼으로 변경 ===
    function replaceEditWithNeighborButton() {
        console.log('EDIT 버튼을 이웃 추가 버튼으로 변경 시작');

        const editBtn = document.querySelector('.edit');
        if (!editBtn) {
            console.log('EDIT 버튼을 찾을 수 없습니다!');
            return;
        }

        // 본인 블로그인지 확인
        if (typeof window.isOwnBlog === 'function' && window.isOwnBlog()) {
            console.log('본인 블로그이므로 EDIT 버튼 유지');
            return;
        }

        const newBtn = document.createElement('a');
        newBtn.textContent = '이웃 추가';
        newBtn.className = 'neighbor-add-btn';
        newBtn.href = '#';
        newBtn.addEventListener('click', handleNeighborAddClick, true);
        editBtn.parentNode.replaceChild(newBtn, editBtn);

        console.log('이웃 추가 버튼으로 변경 완료');
    }

    // === EDIT 버튼 원래 기능 (백업용) ===
    function handleEditClick(e) {
        e.preventDefault();
        if (typeof window.navigateToProfileEdit === 'function') {
            window.navigateToProfileEdit(); // layout.js에서 가져옴
        }
    }

    // === 이웃 추가 버튼 클릭 ===
    async function handleNeighborAddClick(e) {

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        console.log('이웃 추가 버튼 클릭됨');

        // 현재 로그인 확인
        if (typeof window.getCurrentUserId !== 'function' || !window.getCurrentUserId) {
            alert('로그인이 필요합니다!');
            return false;
        }

        // 블로그 주인 닉네임 가져오기
        const blogOwnerNickname = getBlogOwnerNickname();
        if (!blogOwnerNickname) {
            alert('블로그 정보를 가져올 수 없습니다!');
            return false;
        }

        // 이미 이웃인지 확인
        const isAlreadyNeighbor = await checkIfAlreadyNeighbor(blogOwnerNickname);
        if (isAlreadyNeighbor) {
            alert(`${blogOwnerNickname}님은 이미 이웃으로 등록되어 있습니다.`);
            return false;
        }

        // 확인 창
        if (!confirm(`${blogOwnerNickname}님을 이웃으로 추가하시겠습니까?`)) {
            return false;
        }

        // 이웃 추가 실행
        await addNeighbor(blogOwnerNickname);
    }

    // === 블로그 주인 닉네임 가져오기 ===
    function getBlogOwnerNickname() {
        // URL에서 닉네임 추출
        if (typeof window.getCurrentNickname === 'function') {
            return window.getCurrentNickname();
        }

        // 대안: URL 직접 파싱
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

    // === 이미 이웃인지 확인 ===
    async function checkIfAlreadyNeighbor(nickname) {
        const currentUserNickname = getCurrentUserNickname();
        if (!currentUserNickname) {
            console.error('현재 사용자 닉네임을 가져올 수 없습니다!');
            return false;
        }

        try {
            // 관계 상태 확인 API 사용
            const encodedCurrentNickname = encodeURIComponent(currentUserNickname);
            const response = await fetch(`/blog/api/@${encodedCurrentNickname}/neighbors/status?target=${encodeURIComponent(nickname)}`, {
                method: 'GET', 
                credentials: 'same-origin', 
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                return result.iAmFollowing; // 내가 상대방을 팔로우하고 있는지 (NeighborService.java)
            } else {
                console.error('이웃 확인 실패:', response.status);
                return false;
            }

        } catch (error) {
            console.error('이웃 확인 중 오류:', error);
            return false;
        }
    }

    // === 이웃 추가 ===
    async function addNeighbor(nickname) {
        console.log('이웃 추가 시작:', nickname);

        try {
            const encodedNickname = encodeURIComponent(nickname);
            const response = await fetch(`/blog/api/@${encodedNickname}/neighbors`, {
                method: 'POST', 
                credentials: 'same-origin', 
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                console.log('이웃 추가 성공:', nickname);
                alert(result.message || `${nickname}님을 이웃으로 추가했습니다! 🎉`);
                
                // 버튼 텍스트 변경
                updateNeighborButtonAfterAdd();

            } else {
                console.error('이웃 추가 실패:', result.message);
                alert(`이웃 추가 실패: ${result.message}`);
            }

        } catch (error) {
            console.error('이웃 추가 중 오류:', error);
            alert('이웃 추가 중 오류가 발생했습니다!');
        }
    }

    // === 이웃 추가 후 버튼 업데이트 ===
    function updateNeighborButtonAfterAdd() {
        const neighborBtn = document.querySelector('.neighbor-add-btn');
        if (neighborBtn) {
            neighborBtn.textContent = '이웃 등록됨 ✓';
            neighborBtn.style.backgroundColor = '#28a745';
            neighborBtn.style.color = 'white';
            neighborBtn.style.cursor = 'not-allowed'; // 커서 변경
            neighborBtn.disabled = true;

            // 기존 이벤트 리스너 완전 제거
            const newBtn = neighborBtn.cloneNode(true); // 버튼 복제
            neighborBtn.parentNode.replaceChild(newBtn, neighborBtn); // 기존 버튼 교체
            
            console.log('이웃 추가 버튼 상태 업데이트 완료 - 비활성화됨');
        }
    }

    // === 이웃 버튼 상태 초기화 ===
    async function initNeighborButtonState() {
        console.log('이웃 버튼 상태 초기화 시작');

        // 본인 블로그면 EDIT 버튼 유지
        if (typeof window.isOwnBlog === 'function' && window.isOwnBlog()) {
            console.log('본인 블로그이므로 EDIT 버튼 유지');
            return;
        }

        // 다른 사람 블로그면 이웃 버튼으로 변경
        replaceEditWithNeighborButton();

        // 이미 이웃인지 확인하여 버튼 상태 설정
        const blogOwnerNickname = getBlogOwnerNickname();
        if (blogOwnerNickname) {
            const isAlreadyNeighbor = await checkIfAlreadyNeighbor(blogOwnerNickname);
            if (isAlreadyNeighbor) {
                updateNeighborButtonAfterAdd();
            }
        }

        console.log('이웃 버튼 상태 초기화 완료');
    }

    // === 이웃 기능 초기화 (전체) ===
    function initNeighborFeatures() {
        console.log('=== 이웃 기능 초기화 시작 ===');

        // 드롭다운 초기화
        initNeighborDropdown();

        // 버튼 상태 초기화 (비동기)
        initNeighborButtonState();

        console.log('=== 이웃 기능 초기화 완료 ===');
    }

    // === DOM 로드 완료 시 초기화 ===
    document.addEventListener('DOMContentLoaded', () => {
        // layout.js가 로드된 후 실행되도록 약간의 지연
        setTimeout(() => {
            initNeighborFeatures();
        }, 100);
    });

    // === 전역 함수 노출 ===
    window.initNeighborFeatures = initNeighborFeatures;
    window.replaceEditWithNeighborButton = replaceEditWithNeighborButton;
    window.initNeighborButtonState = initNeighborButtonState;
    window.loadMyNeighborList = loadMyNeighborList;

    console.log('neighbor.js 로드 완료');


})();