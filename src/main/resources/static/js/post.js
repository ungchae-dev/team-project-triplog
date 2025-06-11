async function fetchPosts(nickname, page = 0, size = 5, sort = 'latest') {
    try {
        const response = await fetch(`/api/posts?nickname=${nickname}&page=${page + 1}&size=${size}&sort=${sort}`);

        if (!response.ok) throw new Error("서버 오류");

        const data = await response.json(); // Page 객체(JSON 형태)
        console.log(data);
        return data;
    } catch (error) {
        console.error("게시글 불러오기 실패:", error);
    }
}

// 지역별 T-TAG 데이터 (이전과 동일)
const ttagMap = {
    seoul: ["경복궁", "N서울타워", "한강공원"],
    busan: ["해운대", "광안리", "태종대"],
    jeju: ["한라산", "협재해변", "오설록"]
};

let regionSelect, ttagSelect, ttagTagsContainer, locationInput, writeForm;

// 지역별로 복수의 T-TAG를 저장하는 Map<string, Set<string>>
const selectedTags = new Map();

// 🔥 페이징 관련 변수들
let currentPage = 1;
let postsPerPage = 5; // 기본값 5개씩
let currentSort = 'latest'; // 기본값 최신순
/*
function initTTag() {
    regionSelect = document.getElementById('region-select');
    ttagSelect = document.getElementById('ttag-select');
    ttagTagsContainer = document.getElementById('ttag-tags');
    locationInput = document.getElementById('location-input');
    writeForm = document.getElementById('write-form');
    if (!(regionSelect && ttagSelect && ttagTagsContainer && locationInput && writeForm)) return;

    regionSelect.addEventListener('change', function() {
        const region = this.value;
        ttagSelect.innerHTML = '<option value="">T-TAG 선택</option>';
        renderSelectedTags();  // 선택 태그 리렌더
        if (!region) {
            ttagSelect.disabled = true;
            return;
        }
        ttagMap[region].forEach(ttag => {
            const opt = document.createElement('option');
            opt.value = ttag;
            opt.textContent = ttag;
            ttagSelect.appendChild(opt);
        });
        ttagSelect.disabled = false;
    });

    ttagSelect.addEventListener('change', function() {
        const regionKey = regionSelect.value;
        const ttagText = ttagSelect.options[ttagSelect.selectedIndex].text;

        if (regionKey && ttagText && ttagSelect.value) {
            addTTagHashTag(regionKey, ttagText);
        }
    });

    writeForm.addEventListener('submit', function(e) {
        if (!locationInput.value.trim()) {
            e.preventDefault();
            if (confirm('장소 입력이 없습니다.\n마이로그에 포함하지 않고 등록할까요?')) {
                writeForm.submit();
            } else {
                locationInput.focus();
                return false;
            }
        }
    });
}

function addTTagHashTag(region, tag) {
    if (!selectedTags.has(region)) {
        selectedTags.set(region, new Set());
    }
    const tagsSet = selectedTags.get(region);
    tagsSet.add(tag);
    renderSelectedTags();
}

function renderSelectedTags() {
    ttagTagsContainer.innerHTML = '';
    selectedTags.forEach((tagsSet, region) => {
        tagsSet.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.textContent = `#${tag.replace(/\s/g, '')}`;
            tagSpan.style.background = '#f0d3c0';
            tagSpan.style.padding = '3px 8px';
            tagSpan.style.borderRadius = '10px';
            tagSpan.style.fontSize = '13px';
            tagSpan.style.color = '#a86c44';
            tagSpan.style.userSelect = 'none';
            tagSpan.style.marginRight = '6px';
            ttagTagsContainer.appendChild(tagSpan);
        });
    });
}*/
/*
// 🔥 게시글 정렬 함수
function sortPosts(sortType) {
    const posts = Object.values(dummyPosts);
    
    switch(sortType) {
        case 'latest':
            return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        case 'likes':
            return posts.sort((a, b) => b.likes - a.likes);
        case 'comments':
            return posts.sort((a, b) => b.comments.length - a.comments.length);
        default:
            return posts;
    }
}

// 🔥 페이지별 게시글 가져오기
function getPostsForPage(page, perPage, sortType) {
    const sortedPosts = sortPosts(sortType);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    return sortedPosts.slice(startIndex, endIndex);
}*/

// 🔥 총 페이지 수 계산
function getTotalPages() {
    return Math.ceil(Object.keys(dummyPosts).length / postsPerPage);
}

// 🔥 게시글 목록 렌더링
async function renderPostList() {
    console.log("게시글 렌더링 시작");
    const nickname = getCurrentNickname(); // 현재 사용자
    const postData = await fetchPosts(nickname, currentPage - 1, postsPerPage, currentSort);
    console.log("받은 데이터:", postData);
    if (!postData || !Array.isArray(postData)) return;

    const postList = document.querySelector('.post-list');
    postList.innerHTML = '';

    postData.forEach(post => {
        console.log("렌더링할 게시글:", post);
        const li = document.createElement('li');
        li.className = 'post-item';
        li.setAttribute('data-post-id', post.postId);

        li.innerHTML = `
            <a href="javascript:void(0)" onclick="showPostDetail(${post.postId})">
                <h3>${post.title}</h3>
                
                <div class="meta">
                    <span>by ${post.nickname}</span>
                    <span>${post.createdAt}</span>
                    <span>❤️ ${post.likeCount}</span>
                    <span>💬 ${post.commentCount}</span>
                </div>
            </a>
        `;

        postList.appendChild(li);
    });

    renderPagination(postData.totalPages);
}

// 🔥 페이지네이션 렌더링
function renderPagination(totalPages) {
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = '';

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '이전';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderPostList();
        }
    };
    pagination.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = i === currentPage ? 'active' : '';
        pageBtn.onclick = () => {
            currentPage = i;
            renderPostList();
        };
        pagination.appendChild(pageBtn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.textContent = '다음';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPostList();
        }
    };
    pagination.appendChild(nextBtn);
}

// 🔥 페이지 사이즈 변경
function changePageSize(newSize) {
    postsPerPage = newSize;
    currentPage = 1; // 첫 페이지로 리셋
    renderPostList();
    
    // 드롭다운 버튼 텍스트 업데이트
    const dropdownBtn = document.querySelector('.page-size-dropdown .dropdown-btn');
    if (dropdownBtn) {
        dropdownBtn.textContent = `${newSize}개씩`;
    }
}

// 🔥 정렬 방식 변경
function changeSortType(sortType) {
    currentSort = sortType;
    currentPage = 1; // 첫 페이지로 리셋
    renderPostList();
}

// 게시글 상세보기 표시
let currentPostId = null;

async function showPostDetail(postId) {
    currentPostId = postId;
    const nickname = getCurrentNickname();
    const postData = await fetchPosts(nickname, currentPage - 1, postsPerPage);
    const post = postData.find(p => p.postId === postId);

    if (!post) {
        console.error('게시글을 찾을 수 없습니다:', postId);
        return;
    }

    document.getElementById('detail-title').textContent = post.title;
    document.getElementById('detail-author').textContent = post.nickname;
    document.getElementById('detail-date').textContent = post.createdAt;
    document.getElementById('detail-content').innerHTML = post.content.replace(/\n/g, '<br>');
    document.getElementById('detail-tags').textContent = post.tagText || '';
    document.getElementById('detail-likes').textContent = post.likeCount;
    document.getElementById('detail-comments-count').textContent = post.commentCount;

    // 댓글 처리 생략 또는 따로 fetchComments(postId) 필요

    document.querySelectorAll('.post-item').forEach(item => item.classList.remove('selected'));
    const selectedPost = document.querySelector(`[data-post-id="${postId}"]`);
    if (selectedPost) selectedPost.classList.add('selected');

    document.getElementById('board-detail').style.display = 'block';
    document.getElementById('board-detail').scrollIntoView({ behavior: 'smooth', block: 'start' });

    console.log('게시글 상세보기 표시:', post.title);
}


// 좋아요 추가, 취소
let isLiked = false;

document.getElementById('detail-likes').addEventListener('click', function () {
    const postId = currentPostId; // 전역 변수 또는 HTML에서 가져와야 함
    const userId = getCurrentUserId(); // 사용자 ID 얻는 함수가 필요함

    if (!postId || !userId) {
        console.warn("postId 또는 userId가 없습니다.");
        return;
    }

    fetch(`/api/${postId}/like`, {
        method: isLiked ? 'POST' : 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
        })
    .then(res => {
        if (!res.ok) throw new Error("서버 오류");
        return res.json();
    })
    .then(data => {
        console.log(data.message); // 성공 메시지
        document.querySelector('#detail-likes').textContent = data.likeCount;
        isLiked = !isLiked;
    })
    .catch(err => {
        console.error("오류 발생:", err);
    });
});

// 스크롤 없이 상세보기만 표시하는 함수
async function showPostDetailWithoutScroll(postId) {
    const nickname = getCurrentNickname();
    const postData = await fetchPosts(nickname, currentPage - 1, postsPerPage, currentSort);
    const post = postData.find(p => p.postId === postId);

    if (!post) {
        console.error('게시글을 찾을 수 없습니다:', postId);
        return;
    }

    document.getElementById('detail-title').textContent = post.title;
    document.getElementById('detail-author').textContent = post.nickname;
    document.getElementById('detail-date').textContent = post.createdAt;
    document.getElementById('detail-content').innerHTML = post.content.replace(/\n/g, '<br>');
    document.getElementById('detail-tags').textContent = (post.hashtags || []).map(tag => `#${tag}`).join(' ');
    document.getElementById('detail-likes').textContent = post.likeCount;
    document.getElementById('detail-comments-count').textContent = post.commentCount;

    document.querySelectorAll('.post-item').forEach(item => {
        item.classList.remove('selected');
    });
    const selectedPost = document.querySelector(`[data-post-id="${postId}"]`);
    if (selectedPost) selectedPost.classList.add('selected');

    document.getElementById('board-detail').style.display = 'block';

    console.log('게시글 상세보기 표시 (스크롤 없음):', post.title);
}


// 댓글 렌더링
function renderComments(comments) {
    const commentsList = document.getElementById('detail-comments');
    commentsList.innerHTML = '';

    comments.forEach(comment => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><strong>${comment.nickname}</strong>: ${comment.content}</span>
            <button onclick="likeComment(this)" style="background:none;border:none;cursor:pointer;">❤️</button>
            <button onclick="showReplyForm(this)" style="background:none;border:none;cursor:pointer;color:#b865a4;">답글</button>
        `;
        commentsList.appendChild(li);

        // 답글이 있으면 렌더링
        if (comment.replies) {
            comment.replies.forEach(reply => {
                const replyLi = document.createElement('li');
                replyLi.className = 'reply';
                replyLi.innerHTML = `<span><strong>${reply.author}</strong>: ${reply.content}</span>`;
                commentsList.appendChild(replyLi);
            });
        }
    });
}

// 댓글 좋아요
function likeComment(button) {
    // 간단한 좋아요 효과
    button.style.color = '#ff6b6b';
    setTimeout(() => {
        button.style.color = '';
    }, 1000);
}

// 답글 폼 표시 (간단한 프롬프트로 구현)
function showReplyForm(button) {
    const reply = prompt('답글을 입력하세요:');
    if (reply && reply.trim()) {
        alert('답글이 등록되었습니다: ' + reply);
        // 실제로는 여기서 서버에 답글을 저장하고 화면을 업데이트
    }
}

// 게시글 상세보기 숨기기
function hidePostDetail() {
    document.getElementById('board-detail').style.display = 'none';
    
    // 하이라이트 제거
    document.querySelectorAll('.post-item').forEach(item => {
        item.classList.remove('selected');
    });

    // 게시글 목록으로 스크롤
    document.getElementById('board-list').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });

    console.log('게시글 상세보기 숨김');
}

// 글 작성
document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const imageInput = document.getElementById('imageInput');
    const deleteBtn = document.getElementById('deleteBtn');
    const postForm = document.getElementById('write-form');
    const locationInput = document.getElementById('location-input');
    const hashtagInput = document.getElementById('hashtags-input');
    const ttagSelect = document.getElementById('ttag-select');
    const ttagTags = document.getElementById('ttag-tags');
    const regionSelect = document.getElementById('region-select');
    const blogInfo = document.getElementById('blogInfo');
    const nickname = blogInfo.dataset.nickname;
    const blogId = blogInfo.dataset.blogId;

    let currentImage = null;

    // 이미지 업로드 처리
    imageInput.addEventListener('change', async () => {
      const file = imageInput.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        alert('이미지 크기는 최대 2MB까지 가능합니다.');
        imageInput.value = '';
        return;
      }

      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          throw new Error('이미지 업로드 실패');
        }

        const result = await res.json();
        const img = document.createElement('img');
        img.src = result.imageUrl;
        img.style.maxWidth = '600px';
        img.style.height = 'auto';

        const br = document.createElement('br');
        insertAtCursor(br);
        insertAtCursor(img);
        insertAtCursor(document.createElement('br'));

        imageInput.value = '';
      } catch (error) {
        console.error(error);
        alert('이미지 업로드 중 오류가 발생했습니다.');
      }
    });

    // 커서 위치에 노드 삽입
    function insertAtCursor(node) {
      const selection = window.getSelection();
      if (!selection.rangeCount) {
        editor.appendChild(node);
        return;
      }

      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;

      if (!editor.contains(container)) {
        editor.appendChild(node);
        return;
      }

      range.deleteContents();
      range.insertNode(node);
      range.setStartAfter(node);
      range.setEndAfter(node);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    // 이미지 클릭 시 삭제 버튼 위치 조정
    editor.addEventListener('click', (e) => {
      if (e.target.tagName === 'IMG') {
        currentImage = e.target;
        const rect = e.target.getBoundingClientRect();
        deleteBtn.style.top = `${rect.top + window.scrollY}px`;
        deleteBtn.style.left = `${rect.left + rect.width - 10 + window.scrollX}px`;
        deleteBtn.style.display = 'block';
      } else {
        deleteBtn.style.display = 'none';
        currentImage = null;
      }
    });

    // 이미지 삭제 버튼 클릭 시 이미지 삭제
    deleteBtn.addEventListener('click', () => {
      if (currentImage) {
        currentImage.remove();
        deleteBtn.style.display = 'none';
        currentImage = null;
      }
    });
/*
    // 지역 선택 시 T-TAG 옵션 업데이트
    regionSelect.addEventListener('change', async () => {
      const region = regionSelect.value;
      if (!region) {
        ttagSelect.disabled = true;
        ttagTags.innerHTML = '';
        return;
      }

      try {
        const res = await fetch(`/api/ttags?region=${region}`);
        const tags = await res.json();

        ttagSelect.innerHTML = '<option value="">T-TAG 선택</option>';
        tags.forEach(tag => {
          const option = document.createElement('option');
          option.value = tag.id;
          option.textContent = tag.name;
          ttagSelect.appendChild(option);
        });

        ttagSelect.disabled = false;
      } catch (error) {
        console.error(error);
        alert('T-TAG 로딩 중 오류가 발생했습니다.');
      }
    });

    // T-TAG 선택 시 해시태그 표시
    ttagSelect.addEventListener('change', () => {
      const selectedOptions = Array.from(ttagSelect.selectedOptions);
      ttagTags.innerHTML = selectedOptions.map(option => {
        const span = document.createElement('span');
        span.className = 'ttag';
        span.textContent = `#${option.textContent}`;
        return span.outerHTML;
      }).join('');
    });
*/
    // 폼 제출 시 데이터 처리
    console.log('postForm:', postForm);
    postForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('submit 이벤트 발생');

      const title = postForm.querySelector('input[name="title"]').value.trim();
      const content = editor.innerHTML.trim();
      const visibility = postForm.querySelector('select[name="privacy"]').value;
      //const location = locationInput.value.trim();
      const checkedHashtags = Array.from(document.querySelectorAll('input[name="tag"]:checked')).map(el => el.value);
      const newHashtag = postForm.querySelector('input[name="hashtags"]').value.trim();
      //const ttags = Array.from(ttagSelect.selectedOptions).map(option => option.value);

      if (!title || !content) {
        alert('제목과 내용을 모두 입력해주세요.');
        return;
      }

      if (checkedHashtags.length === 0) {
        alert('해시태그를 하나 이상 입력해주세요.');
        return;
      }

      const data = {
        title,
        content,
        visibility,
        tagIdList: checkedHashtags,
        //location,
        newHashtag,
        //ttags,
        blogId: blogId
      };

      try {
        const res = await fetch('/api/write', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await res.json();
        console.log('서버 응답:', result);

        if (res.ok) {
          alert('글 작성 완료');
          showBoardList();
        } else {
          throw new Error('글 작성 실패');
        }
      } catch (error) {
        console.error(error);
        alert('글 작성 중 오류가 발생했습니다.');
      }
    });
});

function showBoardList() {
    document.getElementById("board-list").style.display = "block";
    document.getElementById("board-write").style.display = "none";
    
    // 페이지 전체 최상단으로 즉시 이동
    window.scrollTo(0, 0);
    
    /*
    // 목록 렌더링
    renderPostList();
    
    // 첫 번째 게시글 자동 선택 (스크롤 없이)
    setTimeout(() => {
        const firstPost = getPostsForPage(1, postsPerPage, currentSort)[0];
        if (firstPost) {
            const firstPostId = Object.keys(dummyPosts).find(key => dummyPosts[key] === firstPost);
            // 스크롤 없는 버전 필요
            showPostDetailWithoutScroll(firstPostId);
        }
    }, 100);
    */
    renderPostList().then(async () => {
        const nickname = getCurrentNickname();
        const postData = await fetchPosts(nickname, 0, postsPerPage, currentSort);
        if (postData && Array.isArray(postData) && postData.length > 0) {
            const firstPostId = postData[0].postId;
            showPostDetailWithoutScroll(firstPostId);
        }
    });

    if (typeof window.maintainDefaultSkinForInactiveUsers === 'function') {
        window.maintainDefaultSkinForInactiveUsers();
    }

}

function showWriteForm() {
    document.getElementById("board-list").style.display = "none";
    document.getElementById("board-write").style.display = "block";
    hidePostDetail(); // 상세보기도 숨김
    initTTag();
}

function showDetailView() {
    document.getElementById("board-list").style.display = "none";
    document.getElementById("board-write").style.display = "none";
    document.getElementById("board-detail").style.display = "block";
}

function activatePostUI() {
    let writeBtns = document.querySelectorAll('.write-btn');
    writeBtns.forEach(btn => {
        btn.onclick = showWriteForm;
    });

    // 정렬 버튼 이벤트 추가
    let sortBtns = document.querySelectorAll('.board-right-controls .board-btn');
    sortBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 기존 active 제거
            sortBtns.forEach(b => b.classList.remove('active'));
            // 클릭된 버튼에 active 추가
            this.classList.add('active');
            
            // 정렬 방식 적용
            const sortType = this.textContent.includes('최신순') ? 'latest' : 
                            this.textContent.includes('좋아요순') ? 'likes' : 'comments';
            changeSortType(sortType);
            
            console.log('정렬 방식 변경:', this.textContent);
        });
    });

    // 🔥 페이지 사이즈 드롭다운 이벤트 추가
    const pageSizeDropdown = document.querySelector('.page-size-dropdown');
    if (pageSizeDropdown) {
        const dropdownBtn = pageSizeDropdown.querySelector('.dropdown-btn');
        const dropdownMenu = pageSizeDropdown.querySelector('.dropdown-menu');
        
        // 드롭다운 토글
        dropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
        });
        
        // 드롭다운 메뉴 아이템 클릭 이벤트
        const menuItems = dropdownMenu.querySelectorAll('.dropdown-item');
        menuItems.forEach(item => {
            item.addEventListener('click', function() {
                const newSize = parseInt(this.getAttribute('data-size'));
                changePageSize(newSize);
                dropdownMenu.style.display = 'none';
                
                // active 상태 변경
                menuItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // 외부 클릭 시 드롭다운 닫기
        document.addEventListener('click', function() {
            dropdownMenu.style.display = 'none';
        });
    }

    let backBtns = document.querySelectorAll('.back-btn');
    backBtns.forEach(btn => {
        if (btn.textContent.includes('▲')) {
            btn.onclick = hidePostDetail;
        } else {
            btn.onclick = showBoardList;
        }
    });

    // 댓글 작성 버튼 이벤트
    const commentBtn = document.querySelector('.comment-btn');
    if (commentBtn) {
        commentBtn.addEventListener('click', function() {
            const commentInput = document.getElementById('comment-input');
            const commentText = commentInput.value.trim();
            
            if (commentText) {
                alert('댓글이 등록되었습니다: ' + commentText);
                commentInput.value = '';
                // 실제로는 여기서 서버에 댓글을 저장하고 화면을 업데이트
            } else {
                alert('댓글을 입력해주세요.');
                commentInput.focus();
            }
        });
    }

    // 🔥 페이지 초기화 시 게시글 목록 렌더링
    showBoardList();

    // 공통 스킨 로드
    if (typeof window.maintainDefaultSkinForInactiveUsers === 'function') {
        window.maintainDefaultSkinForInactiveUsers();
    }
}

window.addEventListener('DOMContentLoaded', activatePostUI);


// === 스킨 로드 함수 시작 ===
async function loadBlogSkin() {
    const currentNickname = getCurrentNickname();
    if (!currentNickname) return;

    try {
        const encodedNickname = encodeURIComponent(currentNickname);
        const response = await fetch(`/blog/api/@${encodedNickname}/skin`);

        if (response.ok) {
            const skinData = await response.json();
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

function getCurrentNickname() {
    const currentPath = window.location.pathname;
    const match = currentPath.match(/^\/blog\/@([^\/]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

function applySkin(skinImageUrl) {
    const frame = document.querySelector('.frame');
    if (frame && skinImageUrl) {
        const img = new Image();
        img.onload = () => {
            frame.style.backgroundImage = `url(${skinImageUrl})`;
            frame.classList.add('has-skin');
        };
        img.src = skinImageUrl;
    }
}

function removeSkin() {
    const frame = document.querySelector('.frame');
    if (frame) {
        frame.style.backgroundImage = '';
        frame.classList.remove('has-skin');
    }
}

// 전역으로 노출
window.loadBlogSkin = loadBlogSkin;
window.setupPostFeatures = activatePostUI; // SPA 네비게이션 지원 (스킨)
window.showPostDetail = showPostDetail; // 전역으로 노출
window.hidePostDetail = hidePostDetail; // 전역으로 노출
// === 스킨 로드 함수 끝 ===
