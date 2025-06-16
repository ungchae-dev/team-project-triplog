// home.js : 블로그 - 홈 기능

// 전역 변수
window.currentBlogNickname = null;

// === 닉네임 추출 함수 정의 (즉시 실행 함수보다 먼저) ===
function extractNicknameFromUrl() {
    const currentPath = window.location.pathname;
    console.log('현재 경로:', currentPath);

    const match = currentPath.match(/^\/blog\/@([^\/]+)/);
    if (match) {
        const encodedNickname = match[1];
        console.log('인코딩된 닉네임:', encodedNickname);

        try {
            const decodedNickname = decodeURIComponent(encodedNickname);
            console.log('디코딩된 닉네임:', decodedNickname);
            return decodedNickname;
        } catch (e) {
            console.error('닉네임 디코딩 실패:', e);
            return encodedNickname; // 디코딩 실패 시 원본 반환
        }
    }

    console.error('URL에서 닉네임을 추출할 수 없음!');
    return null;
}

// 블로그 소유자 닉네임 추출
function getBlogOwnerNickname() {
    // 1. 캐시된 닉네임이 있으면 사용
    if (window.currentBlogNickname) {
        console.log('캐시된 닉네임 사용:', window.currentBlogNickname);
        return window.currentBlogNickname;
    }

    // 2. layout.js의 함수 사용 (있으면)
    if (typeof window.getCurrentNickname === 'function') {
        const nickname = window.getCurrentNickname();
        if (nickname) {
            window.currentBlogNickname = nickname;
            console.log('layout.js에서 닉네임 가져옴:', nickname);
            return nickname;
        }
    }

    // 3. URL에서 새로 추출
    const extractedNickname = extractNicknameFromUrl();
    if (extractedNickname) {
        window.currentBlogNickname = extractedNickname;
        console.log('URL에서 닉네임 추출 및 캐시:', extractedNickname);
        return extractedNickname;
    }

    console.error('닉네임을 가져올 수 없음!');
    return null;
}

// === 즉시 스킨 로드 (페이지 로드보다 빠르게) ===
// HTML 파싱과 동시에 실행
(function() {
    'use strict';
    console.log('=== 즉시 실행 함수 시작 ===');

    // 닉네임 즉시 추출 (함수가 이미 정의된 상태)
    const nickname = extractNicknameFromUrl();

    console.log('추출된 닉네임:', nickname);

    if (nickname) {
        window.currentBlogNickname = nickname;
        console.log('window.currentBlogNickname 설정:', window.currentBlogNickname);

        // 즉시 스킨 로드 시작
        loadBlogSkinImmediately();
    }
})();

// 즉시 스킨 로드 함수 (DOMContentLoaded보다 먼저 실행)
async function loadBlogSkinImmediately() {
    if (!window.currentBlogNickname) {
        console.log('닉네임이 없어서 즉시 스킨 로드를 건너뜁니다.');
        return;
    }

    try {
        console.log('즉시 스킨 로드 시작:', window.currentBlogNickname);

        const encodedNickname = encodeURIComponent(window.currentBlogNickname);
        const response = await fetch(`/blog/api/@${encodedNickname}/skin`);

        if (response.ok) {
            const skinData = await response.json();
            console.log('즉시 로드된 스킨 데이터:', skinData);

            // 즉시 스킨 적용
            if (skinData.skinActive === 'Y' && skinData.skinImage) {
                applySkinImmediately(skinData.skinImage);
            } else {
                // 스킨 비활성화 상태 - 기본 스킨 유지
                console.log('스킨 비활성화 상태 - 기본 스킨 유지');
                ensureDefaultSkin();
            }

        } else {
            console.log('즉시 스킨 정보를 가져올 수 없음:', response.status);
            ensureDefaultSkin();
        }

    } catch (error) {
        console.error('즉시 스킨 로드 중 오류:', error);
        ensureDefaultSkin();
    }
}

// 즉시 스킨 적용 함수 (DOM 로드 전에도 작동)
function applySkinImmediately(skinImageUrl) {

    if (!skinImageUrl || skinImageUrl === 'null') {
        console.log('유효하지 않은 스킨 URL:', skinImageUrl);
        ensureDefaultSkin();
        return;
    }

    let attemptCount = 0;
    const maxAttempts = 50; // 최대 5초 대기

    // DOM이 아직 로드되지 않았을 수 있으므로 체크
    function applyWhenReady() {
        const frames = document.querySelectorAll('.frame');
        const frame = frames.length > 0 ? frames[0] : null;

        if (frame && frame.classList) { // classList 존재 확인
            console.log('프레임 요소 찾음:', frame);
            console.log('원본 스킨 URL:', skinImageUrl);

            // 이미지 로드 테스트
            const img = new Image();

            img.onload = () => {
                try {
                    // 스킨 적용 성공
                    frame.style.backgroundImage = `url("${skinImageUrl}")`;
                    frame.style.backgroundSize = 'cover';
                    frame.style.backgroundPosition = 'center';
                    frame.style.backgroundRepeat = 'no-repeat';
                    
                    frame.classList.add('has-skin', 'skin-loaded');
                    frame.classList.remove('loading');

                    console.log('즉시 커스텀 스킨 적용 완료:', skinImageUrl);

                    // sessionStorage에 저장
                    sessionStorage.setItem('customSkinImage', skinImageUrl);
                    sessionStorage.setItem('skinApplied', 'true');
                } catch (error) {
                    console.error('스킨 적용 중 오류:', error);
                    ensureDefaultSkin();
                }
            };

            img.onerror = () => {
                console.error('스킨 이미지 로드 실패:', skinImageUrl);
                console.log('URL 인코딩 처리 시도...');
                
                // URL에 한글이 있는 경우 수동으로 인코딩
                const encodedUrl = skinImageUrl.split('/').map(part => {
                    // 파일명 부분만 인코딩 (경로는 그대로)
                    if (part.includes('.')) {
                        return encodeURIComponent(part);
                    }
                    return part;
                }).join('/');
                
                console.log('인코딩된 URL:', encodedUrl);
                
                const img2 = new Image();
                img2.onload = () => {
                    frame.style.backgroundImage = `url("${encodedUrl}")`;
                    frame.style.backgroundSize = 'cover';
                    frame.style.backgroundPosition = 'center';
                    frame.style.backgroundRepeat = 'no-repeat';
                    frame.classList.add('has-skin', 'skin-loaded');
                    frame.classList.remove('loading');
                    console.log('인코딩된 URL로 스킨 적용 성공');
                    
                    // sessionStorage에도 인코딩된 URL 저장
                    sessionStorage.setItem('customSkinImage', encodedUrl);
                    sessionStorage.setItem('skinApplied', 'true');
                };
                img2.onerror = () => {
                    console.error('모든 시도 실패, 기본 스킨 적용');
                    ensureDefaultSkin();
                };
                img2.src = encodedUrl;
            };

            // 첫 번째 시도 - 원본 URL
            img.src = skinImageUrl;
            
        } else if (attemptCount < maxAttempts) {
            // DOM이 아직 준비되지 않았으면 다시 시도
            attemptCount++;
            console.log(`프레임 요소를 찾는 중... 시도 ${attemptCount}/${maxAttempts}`);
            setTimeout(applyWhenReady, 100);
        } else {
            console.error('프레임 요소를 찾을 수 없음 - DOM 로드 시간 초과');
            ensureDefaultSkin();
        }
    }

    applyWhenReady();
}

// 기본 스킨 보장 함수
function ensureDefaultSkin() {

    let attemptCount = 0;
    const maxAttempts = 50; // 최대 5초 대기

    function applyDefaultWhenReady() {
        const frames = document.querySelectorAll('.frame');
        const frame = frames.length > 0 ? frames[0] : null;

        if (frame && frame.classList) { // classList 존재 확인
            try {
                // 기본 스킨 확실히 적용
                frame.style.backgroundImage = 'url("/images/skins/triplog_skin_default.png")';
                frame.classList.remove('has-skin', 'loading');
                frame.classList.add('skin-loaded');

                // sessionStorage 정리
                sessionStorage.removeItem('customSkinImage');
                sessionStorage.removeItem('skinApplied');

                console.log('기본 스킨 적용 완료');
            } catch (error) {
                console.error('기본 스킨 적용 중 오류:', error);
            }
        } else if (attemptCount < maxAttempts) {
            attemptCount++;
            setTimeout(applyDefaultWhenReady, 100);
        }
    }

    applyDefaultWhenReady();
}

// === 이웃 최신글 데이터 로드 (neighbor.js 활용) ===
async function loadNeighborPosts() {
    console.log('이웃 최신글 로드 시작');
    
    const currentNickname = getBlogOwnerNickname();
    if (!currentNickname) {
        console.log('닉네임이 없어서 이웃 최신글 로드 건너뜀');
        return;
    }

    try {
        // neighbor.js의 API를 그대로 활용
        const myNeighbors = await fetchMyNeighborListUsingExistingAPI();
        
        if (!myNeighbors || myNeighbors.length === 0) {
            console.log('이웃이 없음');
            showEmptyNeighborPosts();
            return;
        }

        // 2. 각 이웃의 최신 게시글 가져오기
        const neighborPosts = await fetchNeighborLatestPosts(myNeighbors);
        
        // 3. 이웃 최신글 카드 업데이트
        updateNeighborPostsCard(neighborPosts);
        
    } catch (error) {
        console.error('이웃 최신글 로드 중 오류:', error);
        showEmptyNeighborPosts();
    }
}

// === neighbor.js의 기존 API를 활용하여 내 이웃 목록 가져오기 ===
async function fetchMyNeighborListUsingExistingAPI() {
    try {
        const blogOwnerNickname = getBlogOwnerNickname();
        if (!blogOwnerNickname) {
            console.error('블로그 주인의 닉네임을 가져올 수 없습니다!');
            return [];
        }

        // neighbor.js에서 사용하는 동일한 API 엔드포인트 사용
        const encodedNickname = encodeURIComponent(blogOwnerNickname);
        const response = await fetch(`/blog/api/@${encodedNickname}/neighbors`, {
            method: 'GET', 
            credentials: 'same-origin', 
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const neighborList = await response.json(); // NeighborResponseDto[] 형태
            console.log(`${blogOwnerNickname}의 이웃 목록 로드 성공:`, neighborList);
            
            // nickname만 추출해서 반환 (기존 코드와 호환)
            return neighborList.map(neighbor => ({
                nickname: neighbor.nickname
            }));
        } else {
            console.error('이웃 목록 로드 실패:', response.status);
            return [];
        }
    } catch (error) {
        console.error('이웃 목록 로드 중 오류:', error);
        return [];
    }
}

// === 이웃들의 최신 게시글 가져오기 (기존 코드 유지) ===
async function fetchNeighborLatestPosts(neighbors) {
    const allPosts = [];
    
    // 각 이웃의 최신 게시글 1개씩 가져오기 (병렬 처리)
    const promises = neighbors.map(async (neighbor) => {
        try {
            const encodedNickname = encodeURIComponent(neighbor.nickname);
            const response = await fetch(`/api/posts?nickname=${encodedNickname}&page=1&size=1&sort=updatedAt&dir=desc`);
            
            if (response.ok) {
                const data = await response.json();
                if (data.content && data.content.length > 0) {
                    const post = data.content[0];
                    return {
                        nickname: neighbor.nickname,
                        postId: post.postId,
                        title: post.title,
                        createdAt: post.createdAt,
                        updatedAt: post.updatedAt
                    };
                }
            }
            return null;
        } catch (error) {
            console.error(`${neighbor.nickname}의 게시글 조회 실패:`, error);
            return null;
        }
    });

    const results = await Promise.all(promises);
    
    // null 제거 후 최신순 정렬
    const validPosts = results.filter(post => post !== null);
    validPosts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    // 최신 3개만 반환
    return validPosts.slice(0, 3);
}

// === 이웃 최신글 카드 업데이트 ===
function updateNeighborPostsCard(neighborPosts) {
    const neighborList = document.querySelector('.section-card:nth-child(2) .neighbor-list');
    
    if (!neighborList) {
        console.error('이웃 최신글 카드를 찾을 수 없음');
        return;
    }

    // 기존 내용 제거
    neighborList.innerHTML = '';

    if (neighborPosts.length === 0) {
        // 이웃 게시글이 없는 경우
        const emptyItem = document.createElement('li');
        emptyItem.innerHTML = '<span style="color: #999; font-style: italic;">이웃의 최신글이 없습니다.</span>';
        neighborList.appendChild(emptyItem);
        console.log('빈 이웃 최신글 카드 표시');
        return;
    }

    // 이웃 최신글 표시
    neighborPosts.forEach(post => {
        const listItem = document.createElement('li');
        
        // 제목이 너무 길면 자르기 (홈 카드용)
        let displayTitle = post.title;
        if (displayTitle.length > 25) {
            displayTitle = displayTitle.substring(0, 25) + '...';
        }
        
        // 클릭 가능한 링크로 생성
        listItem.innerHTML = `
            <b>${post.nickname}</b> 
            <a href="javascript:void(0)" 
               onclick="navigateToNeighborPost('${post.nickname}', ${post.postId})" 
               style="color: #b865a4; text-decoration: none; cursor: pointer;">
                ${displayTitle}
            </a>
        `;
        
        neighborList.appendChild(listItem);
    });

    console.log(`이웃 최신글 카드 업데이트 완료: ${neighborPosts.length}개 항목`);
}

// === 이웃 게시글로 이동 ===
function navigateToNeighborPost(neighborNickname, postId) {
    console.log('이웃 게시글로 이동:', neighborNickname, postId);
    
    try {
        // 이웃의 블로그 게시글 상세 페이지로 이동
        const encodedNickname = encodeURIComponent(neighborNickname);
        const targetUrl = `/blog/@${encodedNickname}/post/${postId}`;
        
        console.log('이동할 URL:', targetUrl);
        
        // 현재 브라우저에서 이동
        window.location.href = targetUrl;
        
    } catch (error) {
        console.error('이웃 게시글 이동 중 오류:', error);
        alert('게시글로 이동할 수 없습니다.');
    }
}

// === 빈 이웃 최신글 카드 표시 ===
function showEmptyNeighborPosts() {
    const neighborList = document.querySelector('.section-card:nth-child(2) .neighbor-list');
    
    if (neighborList) {
        neighborList.innerHTML = `
            <li><span style="color: #999; font-style: italic;">이웃을 추가하면 최신글이 표시됩니다.</span></li>
        `;
    }
}

// === DOM 로드 완료 시 초기화 개선 ===
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded 시작');

    // 닉네임 재확인 및 설정
    const nickname = getBlogOwnerNickname();
    console.log('DOMContentLoaded에서 닉네임:', nickname);

    if (nickname) {
        document.title = `${nickname}님의 블로그`;
        console.log('페이지 타이틀 설정:', document.title);
    }

    // DOM 요소 존재 확인
    setTimeout(() => {
        checkDOMElements();
    }, 100);

    // 블로그 홈 초기화
    initHomePage();

    // 블로그 주인 정보 설정
    await initBlogOwnerInfo();

    // 사용자 데이터 로드 (스킨은 이미 즉시 로드됨)
    await loadUserData();

    // 스킨이 아직 로드되지 않았다면 강제 새로고침
    const frame = document.querySelector('.frame');
    if (frame && !frame.classList.contains('skin-loaded')) {
        console.log('스킨이 로드되지 않아 강제 새로고침');
        await loadBlogSkinImmediately();
    }

});

// === DOM 요소 존재 확인 함수 ===
function checkDOMElements() {
    console.log('=== DOM 요소 존재 확인 ===');

    const requiredElements = [
        'daily-visitors',
        'total-visitors', 
        'condition-message',
        'user-info',
        'join-date'
    ];

    requiredElements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`${id}:`, element ? '존재' : '없음!');
        
        if (element) {
            console.log(`현재 내용: "${element.textContent}"`);
        }
    });

    // left-container 확인
    const leftContainer = document.getElementById('left-container');
    console.log('left-container:', leftContainer ? '존재' : '없음!');
    
    if (leftContainer) {
        console.log('left-container 내용이 로드되었는지 확인...');
        const hasContent = leftContainer.innerHTML.length > 100;
        console.log('left-container 내용 로드됨:', hasContent ? '존재' : '없음!');
        
        if (!hasContent) {
            console.log('⚠️ left-container가 아직 로드되지 않았습니다. 잠시 후 다시 시도...');
            setTimeout(() => {
                loadUserData(); // 다시 시도
            }, 1000);
        }
    }

}

// === 디버깅용 전역 함수 추가 ===
window.debugHomeLoading = function() {
    console.log('=== 수동 디버깅 시작 ===');
    
    console.log('현재 URL:', window.location.href);
    console.log('window.currentBlogNickname:', window.currentBlogNickname);
    console.log('getBlogOwnerNickname():', getBlogOwnerNickname());
    console.log('extractNicknameFromUrl():', extractNicknameFromUrl());
    
    checkDOMElements();
    
    console.log('사용자 데이터 강제 로드...');
    loadUserData();
};

// 블로그 주인 정보 초기화
async function initBlogOwnerInfo() {
    if (!window.currentBlogNickname) {
        window.currentBlogNickname = getBlogOwnerNickname();
    }
    console.log('현재 블로그 소유자:', window.currentBlogNickname);
}

// 블로그 주인 데이터 로드 함수
async function loadUserData() {
    console.log('=== loadUserData 함수 시작 ===');
    
    // 닉네임 확실히 가져오기
    const nickname = getBlogOwnerNickname();
    
    console.log('사용할 닉네임:', nickname);
    console.log('window.currentBlogNickname:', window.currentBlogNickname);

    if (!nickname) {
        console.error('닉네임을 가져올 수 없어서 사용자 데이터 로드를 건너뜁니다.');
        setDefaultValues();
        return;
    }

    try {
        const encodedNickname = encodeURIComponent(nickname);
        const apiUrl = `/blog/api/@${encodedNickname}/user-info`;
        
        console.log('API 호출:', apiUrl);
        
        const response = await fetch(apiUrl);
        console.log('API 응답 상태:', response.status);

        if (response.ok) {
            const userInfo = await response.json();
            console.log('사용자 정보 로드 성공:', userInfo);
            updateUserInterface(userInfo);
        } else {
            console.error('API 호출 실패:', response.status);
            
            // 상세 에러 정보
            try {
                const errorText = await response.text();
                console.error('에러 응답 내용:', errorText);
            } catch (e) {
                console.error('에러 응답 읽기 실패:', e);
            }
            
            setDefaultValues();
        }
    } catch (error) {
        console.error('사용자 데이터 로드 중 오류:', error);
        setDefaultValues();
    }
}

// UI 업데이트 함수
function updateUserInterface(userInfo) {
    // 방문자 수 업데이트
    updateElement('daily-visitors', userInfo.dailyVisitors || 0);
    updateElement('total-visitors', userInfo.totalVisitors || 0);

    // 상태 메시지 업데이트
    updateElement('condition-message', 
        userInfo.conditionMessage || '안녕하세요~ 블로그에 오신 걸 환영합니다♥')

    // 닉네임과 성별 표시
    const genderSymbol = userInfo.gender === 'MALE' ? '♂' : '♀';
    updateElement('user-info', `${userInfo.nickname}(${genderSymbol})`);

    // 가입일 포맷팅 및 표시
    const formattedDate = formatJoinDate(userInfo.joinDate);
    updateElement('join-date', formattedDate);

    // 브라우저 타이틀 변경
    updatePageTitle(userInfo.nickname);
    
    console.log('UI 업데이트 완료');
}

// 페이지 타이틀 업데이트 함수
function updatePageTitle(nickname) {
    if (nickname) {
        document.title = `${nickname}님의 블로그`;
        console.log('페이지 타이틀 변경:', document.title);
    }
}

// 기본값 설정 함수 (로드 실패 시)
function setDefaultValues() {
    updateElement('daily-visitors', '0');
    updateElement('total-visitors', '0');
    updateElement('condition-message', '블로그 정보를 불러올 수 없습니다.');
    updateElement('user-info', '사용자');
    updateElement('join-date', '정보 없음');
}

// DOM 요소 업데이트 헬퍼 함수
function updateElement(id, content) {
    console.log(`요소 업데이트 시도: ${id} = "${content}"`);

    const element = document.getElementById(id);
    if (element) {
        element.textContent = content;
        console.log(`${id} 업데이트 성공:`, content);
        return true;
    } else {
        console.error(`요소를 찾을 수 없음: ${id}`);

        // DOM 디버깅
        const allElements = document.querySelectorAll(`[id="${id}"]`);
        console.log(`ID "${id}"를 가진 요소 개수:`, allElements.length);

        if (allElements.length > 0) {
            console.log('찾은 요소들:', allElements);
        }

        return false;
    }
}

// 가입일 포맷팅 함수 ex) 20250604 -> 2025년 6월 4일
function formatJoinDate(joinDate) {
    if (!joinDate || joinDate.length !== 8) {
        return '정보 없음';
    }

    const year = joinDate.substring(0, 4);
    const month = parseInt(joinDate.substring(4, 6));
    const day = parseInt(joinDate.substring(6, 8));

    return `${year}년 ${month}월 ${day}일`;
}

// 블로그 스킨 자동 로드
async function loadBlogSkin() {
    if (!window.currentBlogNickname) {
        console.log('닉네임이 없어서 스킨 로드를 건너뜁니다.');
        return;
    }

    try {
        // 닉네임 URL 인코딩
        const encodedNickname = encodeURIComponent(window.currentBlogNickname);
        const response = await fetch(`/blog/api/@${encodedNickname}/skin`);

        if (response.ok) {
            const skinData = await response.json();
            console.log('fallback 스킨 데이터:', skinData);

            // 스킨이 활성화되어 있고 이미지가 있으면 적용
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

// === 홈 페이지용 방명록 데이터 로드 ===
async function loadGuestbookPreview() {
    console.log('홈 페이지 방명록 미리보기 로드 시작');
    
    const currentNickname = getBlogOwnerNickname();
    if (!currentNickname) {
        console.log('닉네임이 없어서 방명록 미리보기 로드 건너뜀');
        return;
    }

    try {
        // 최신 방명록 3개만 요청 (페이지=1, 크기=3)
        const encodedNickname = encodeURIComponent(currentNickname);
        const response = await fetch(`/blog/api/@${encodedNickname}/guestbook?page=1&size=3`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('홈 페이지 방명록 데이터:', data);
            
            // 방명록 카드 업데이트
            updateGuestbookCard(data.entries || []);
        } else {
            console.log('방명록 데이터 로드 실패:', response.status);
            showEmptyGuestbookCard();
        }
    } catch (error) {
        console.error('방명록 미리보기 로드 중 오류:', error);
        showEmptyGuestbookCard();
    }
}

// === 방명록 카드 업데이트 ===
function updateGuestbookCard(guestbookEntries) {
    const guestbookList = document.querySelector('#guestbook-card .guestbook-list');
    
    if (!guestbookList) {
        console.error('방명록 카드를 찾을 수 없음');
        return;
    }

    // 기존 내용 제거
    guestbookList.innerHTML = '';

    if (guestbookEntries.length === 0) {
        // 방명록이 없는 경우
        const emptyItem = document.createElement('li');
        emptyItem.innerHTML = '<span style="color: #999; font-style: italic;">아직 작성된 방명록이 없습니다.</span>';
        guestbookList.appendChild(emptyItem);
        console.log('빈 방명록 카드 표시');
        return;
    }

    // 최신 3개 방명록 표시 (이미 최신순으로 정렬됨)
    guestbookEntries.slice(0, 3).forEach(entry => {
        const listItem = document.createElement('li');
        
        // 비밀글 처리
        const isSecret = entry.isSecret || entry.secret || false;
        let displayContent = entry.content;
        
        // 비밀글인데 내용이 숨겨진 경우
        if (isSecret && displayContent === '(비밀글입니다)') {
            displayContent = '🔒 비밀글입니다';
        }
        
        // 내용이 너무 길면 자르기 (홈 카드용)
        if (displayContent.length > 30) {
            displayContent = displayContent.substring(0, 30) + '...';
        }
        
        // HTML 생성
        listItem.innerHTML = `
            <b>${entry.nickname}</b>: ${displayContent}
        `;
        
        guestbookList.appendChild(listItem);
    });

    console.log(`방명록 카드 업데이트 완료: ${guestbookEntries.length}개 항목`);
}

// === 빈 방명록 카드 표시 ===
function showEmptyGuestbookCard() {
    const guestbookList = document.querySelector('#guestbook-card .guestbook-list');
    
    if (guestbookList) {
        guestbookList.innerHTML = `
            <li><span style="color: #999; font-style: italic;">방명록을 불러올 수 없습니다!</span></li>
        `;
    }
}

function initHomePage() {
    // 현재 페이지 네비 버튼 활성화
    setActiveNavButton('home');

    // 페이지 제목 설정
    setPageTitle('홈')
    
    // 홈 특정 기능 함수들 호출
    setupHomeFeatures();
}

// === 블로그 홈 초기화 함수 ===
function setupHomeFeatures() {
    console.log('=== 홈 페이지 기능 초기화 시작 ===');

    // 사용자 데이터 로드
    loadUserData();

    // 방명록 미리보기 로드
    loadGuestbookPreview();

    // 이웃 최신글 로드 추가 (neighbor.js 활용)
    loadNeighborPosts();

    console.log('setupHomeFeatures 호출됨');

    // 방명록 카드 클릭 이벤트
    const guestbookCard = document.getElementById('guestbook-card');

    if (guestbookCard) {
        guestbookCard.addEventListener('click', navigateToGuestbook);
        guestbookCard.style.cursor = 'pointer'; // 커서 변경
        console.log('방명록 카드 클릭 이벤트 설정 완료');
    } else {
        console.log('guestbook-card를 찾을 수 없습니다!');
    }
    
    // 이웃 기능 초기화 (neighbor.js 함수 활용)
    initializeNeighborFeaturesForHome();

    console.log('=== 홈 페이지 기능 초기화 완료 ===');
}

// === 이웃 관련 함수 시작 ===

// 홈 페이지 전용 이웃 기능 초기화
function initializeNeighborFeaturesForHome() {
    console.log('홈 페이지 이웃 기능 초기화 시작');

    // neighbor.js가 로드되었는지 확인
    if (typeof window.initNeighborFeatures === 'function') {
        window.initNeighborFeatures();
        console.log('홈 페이지 이웃 기능 즉시 초기화');
    } else {
        // neighbor.js 로드 대기
        setTimeout(() => {
            if (typeof window.initNeighborFeatures === 'function') {
                window.initNeighborFeatures();
                console.log('홈 페이지 이웃 기능 지연 초기화');
            } else {
                console.log('neighbor.js 로드 실패 - 홈 페이지에서 수동 초기화');
                initializeNeighborManually();
            }
        }, 500);
    }
}

// 수동 이웃 기능 초기화 (fallback)
function initializeNeighborManually() {
    console.log('수동 이웃 기능 초기화 시작');
    
    // 1. 이웃 파도타기 버튼 찾기
    const neighborDropdownBtn = document.querySelector('.neighbor-dropdown button');
    if (neighborDropdownBtn) {
        neighborDropdownBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('이웃 기능을 불러오는 중입니다... 잠시 후 다시 시도해주세요.');
        });
        console.log('이웃 파도타기 버튼 임시 이벤트 설정');
    }

    // 2. EDIT 버튼은 layout.js에서 처리
    console.log('EDIT 버튼은 layout.js에서 처리 예정');
}

// === 홈 데이터 새로고침 (이웃 목록 포함) ===
function refreshHomeDataWithNeighbors() {
    console.log('홈 데이터 새로고침 시작 (이웃 + 방명록 + 이웃 최신글 포함)');
    
    // 기존 데이터 새로고침
    if (typeof loadUserData === 'function') {
        loadUserData();
    }

    if (typeof loadBlogSkin === 'function') {
        loadBlogSkin();
    }

    // 방명록 미리보기 새로고침
    loadGuestbookPreview();

    // 이웃 최신글 새로고침
    loadNeighborPosts();

    // neighbor.js의 함수 활용하여 이웃 목록 새로고침
    if (typeof window.loadMyNeighborList === 'function') {
        window.loadMyNeighborList();
        console.log('이웃 목록 새로고침 완료');
    }
}

// 블로그 이동 시 이웃 기능 유지
function handleBlogNavigationWithNeighbors() {
    // 다른 블로그로 이동할 때 이웃 기능이 정상 작동하도록 보장
    setTimeout(() => {
        if (typeof window.initNeighborFeatures === 'function') {
            window.initNeighborFeatures();
            console.log('블로그 이동 후 이웃 기능 재초기화');
        }
    }, 300);
}

// === 이웃 관련 함수 끝 ===

// 방명록으로 이동
function navigateToGuestbook() {
    console.log('방명록 카드 클릭됨!');

    // SPA 네비게이션 사용
    if (typeof navigateToPage === 'function') {
        navigateToPage('guestbook');
    } else {
        // fallback: 전체 페이지 리로드
        if (window.currentBlogNickname) {
            // 닉네임 URL 인코딩
            const encodedNickname = encodeURIComponent(window.currentBlogNickname);
            window.location.href = `/blog/@${encodedNickname}/guestbook`;
        }
    }
}

// 스킨 이미지 적용 함수 (CSS와 연동)
function applySkin(skinImageUrl) {
    const frames = document.querySelectorAll('.frame');
    const frame = frames.length > 0 ? frames[0] : null;

    if (frame && frame.classList && skinImageUrl) {
        // 로딩 상태 표시
        frame.classList.add('loading-skin');

        // 이미지 로드 확인
        const img = new Image();
        img.onload = () => {
            // 한글 파일명 지원
            frame.style.backgroundImage = `url("${skinImageUrl}")`;
            frame.classList.add('has-skin', 'skin-loaded');
            frame.classList.remove('loading-skin', 'loading');

            // sessionStorage 업데이트
            sessionStorage.setItem('customSkinImage', skinImageUrl);
            sessionStorage.setItem('skinApplied', 'true');

            console.log('스킨 적용 완료:', skinImageUrl);
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
    const frames = document.querySelectorAll('.frame');
    const frame = frames.length > 0 ? frames[0] : null;

    if (frame && frame.classList) {
        // 기본 스킨으로 복원
        frame.style.backgroundImage = 'url("/images/skins/triplog_skin_default.png")';
        frame.classList.remove('has-skin', 'loading-skin', 'loading');
        frame.classList.add('skin-loaded');

        // sessionStorage 정리
        sessionStorage.removeItem('customSkinImage');
        sessionStorage.removeItem('skinApplied');

        console.log('스킨 제거 완료 - 기본 스킨으로 복원');
    }
}

// 스킨 새로고침 함수 (프로필에서 스킨 변경 후 호출용)
window.refreshSkin = async function() {
    console.log('스킨 새로고침 요청됨');
    await loadBlogSkinImmediately(); // 즉시 로드 함수 사용
}

// 전역으로 노출하는 함수들 (다른 페이지에서 사용 가능)
window.loadUserData = loadUserData;
window.loadBlogSkin = loadBlogSkin;
window.getBlogOwnerNickname = getBlogOwnerNickname;
window.initBlogOwnerInfo = initBlogOwnerInfo;
window.initializeNeighborFeaturesForHome = initializeNeighborFeaturesForHome;
window.refreshHomeDataWithNeighbors = refreshHomeDataWithNeighbors;
window.handleBlogNavigationWithNeighbors = handleBlogNavigationWithNeighbors;

// === 방명록 ===
window.loadGuestbookPreview = loadGuestbookPreview;
window.updateGuestbookCard = updateGuestbookCard;

// === 이웃 최신글 ===
window.loadNeighborPosts = loadNeighborPosts;
window.navigateToNeighborPost = navigateToNeighborPost;
window.updateNeighborPostsCard = updateNeighborPostsCard;

console.log('home.js 로드 완료');
