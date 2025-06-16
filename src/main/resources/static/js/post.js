// post.js - 블로그 게시판 js

async function fetchPosts(nickname, page = 0, size = 5, sort = 'latest') {
    try {
        const sortParam = 
            sort === 'latest' ? 'updatedAt' : 
            sort === 'likes' ? 'likeCount' :
            sort === 'comments' ? 'commentCount' : 'updatedAt';

        const response = await fetch(`/api/posts?nickname=${encodeURIComponent(nickname)}&page=${page + 1}&size=${size}&sort=${sortParam}&dir=desc`);

        if (!response.ok) throw new Error("서버 오류");

        const data = await response.json(); // Page 객체(JSON 형태)
        console.log('받은 게시글 데이터:' ,data);
        return data;
    } catch (error) {
        console.error("게시글 불러오기 실패:", error);
        return {
            content: [], 
            totalPages: 0
        };
    }
}

// 게시글 상세 정보 가져오기 (추가)
async function fetchPostDetail(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) throw new Error("게시글 상세 조회 실패");
        return await response.json();
    } catch (error) {
        console.error("게시글 상세 조회 실패:", error);
        return null;
    }
}

// 댓글 목록 가져오기 (추가)
async function fetchComments(postId) {
    try {
        const response = await fetch(`/api/${postId}/comments`);
        if (!response.ok) throw new Error("댓글 조회 실패");
        return await response.json();
    } catch (error) {
        console.error("댓글 조회 실패:", error);
        return [];
    }
}

// 🔥 페이징 관련 변수들
let currentPage = 1;
let postsPerPage = 5; // default: 5개씩
let currentSort = 'latest'; // default: 최신순
let totalPages = 0;

// 지역별 T-TAG 데이터 (이전과 동일)
const ttagMap = {
    seoul: ["경복궁", "N서울타워", "한강공원"],
    busan: ["해운대", "광안리", "태종대"],
    jeju: ["한라산", "협재해변", "오설록"]
};

let regionSelect, ttagSelect, ttagTagsContainer, locationInput, writeForm;

// 지역별로 복수의 T-TAG를 저장하는 Map<string, Set<string>>
const selectedTags = new Map();

// 🔥 총 페이지 수 계산
function getTotalPages() {
    return Math.ceil(Object.keys(dummyPosts).length / postsPerPage);
}

// 🔥 게시글 목록 렌더링 (수정)
async function renderPostList() {
    console.log("게시글 렌더링 시작");
    const nickname = getCurrentNickname(); // 현재 사용자
    const data = await fetchPosts(nickname, currentPage - 1, postsPerPage, currentSort);
    
    if (!data || !Array.isArray(data.content)) return;

    const postData = data.content;
    totalPages = data.totalPages;

    const postList = document.querySelector('.post-list');
    postList.innerHTML = '';

    postData.forEach(post => {
        
        const li = document.createElement('li');
        li.className = 'post-item';
        li.setAttribute('data-post-id', post.postId);

        li.innerHTML = `
            <a href="javascript:void(0)" onclick="showPostDetail(${post.postId})">
                ${post.thumbnail ? `<img src="${post.thumbnail}" alt="썸네일" class="thumbnail" />` : ''}
                <h3>${post.title}</h3>
                <div class="meta">
                    <span>by ${post.nickname}</span>
                    <span>${post.createdAt}</span>
                    <span>❤️ ${post.likeCount}</span>
                    <span>💬 ${post.commentCount}</span>
                </div>
                ${post.hashtags ? `
                    <div class="hashtags">
                        ${post.hashtags.map(tag => `<span>#${tag}</span>`).join(' ')}
                    </div>
                ` : ''}
            </a>
        `;

        postList.appendChild(li);
    });

    renderPagination(totalPages);
}

// 페이지네이션 렌더링 (수정)
function renderPagination(totalPages) {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;

    pagination.innerHTML = '';

    // 이전 버튼
    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '이전';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => {
            currentPage--;
            renderPostList();
        };
        pagination.appendChild(prevBtn);
    }
    
    // 페이지 번호 버튼들
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = i === currentPage ? 'active' : '';
        pageBtn.onclick = () => {
            currentPage = i;
            renderPostList();
        };
        pagination.appendChild(pageBtn);
    }

    // 다음 버튼
    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.textContent = '다음';
        nextBtn.onclick = () => {
            currentPage++;
            renderPostList();
        };
        pagination.appendChild(nextBtn);
    }
}

// 페이지 사이즈 변경
function changePageSize(newSize) {
    postsPerPage = newSize;
    currentPage = 1; // 첫 페이지로 리셋
    renderPostList();
    
    // 드롭다운 버튼 텍스트 업데이트
    const dropdownBtn = document.querySelector('.page-size-dropdown .dropdown-btn');
    if (dropdownBtn) {
        dropdownBtn.textContent = `${newSize}개씩 ▼`;
    }
}

// 정렬 방식 변경
function changeSortType(sortType) {
    currentSort = sortType;
    currentPage = 1; // 첫 페이지로 리셋
    renderPostList();
}

// 게시글 상세보기 표시
let currentPostId = null;

// 게시글 상세보기 표시 (대폭 수정)
async function showPostDetail(postId) {
    console.log('게시글 상세보기 표시:', postId);

    try {
        // 상세 정보 Ajax로 가져오기
        const post = await fetchPostDetail(postId);
        if (!post) {
            alert('게시글을 찾을 수 없습니다!');
            return;
        }

        // 댓글 정보 가져오기
        const comments = await fetchComments(postId);
        
        // 상세보기 UI 업데이트
        document.getElementById('detail-title').textContent = post.title;
        document.getElementById('detail-author').textContent = post.blog?.member?.nickname || post.nickname || '익명';
        document.getElementById('detail-date').textContent = new Date(post.createdAt).toLocaleString();
        document.getElementById('detail-content').innerHTML = post.content;
        document.getElementById('detail-likes').textContent = post.postLike?.length || post.likeCount || 0;
        document.getElementById('detail-comments-count').textContent = comments.length;

        // 해시태그 표시
        const tagsContainer = document.getElementById('detail-tags');
        if (tagsContainer) {
            let tagsHTML = '';
            
            if (post.tagText) {
                tagsContainer.textContent = post.tagText;
            } else if (post.postHashtagPeople && post.postHashtagPeople.length > 0) {
                tagsHTML = post.postHashtagPeople
                    .map(tag => `<span>#${tag.hashtagPeople.tagName}</span>`)
                    .join(' ');
                tagsContainer.innerHTML = tagsHTML;
            } else if (post.hashtags && Array.isArray(post.hashtags)) {
                tagsHTML = post.hashtags
                    .map(tag => `<span>#${tag}</span>`)
                    .join(' ');
                tagsContainer.innerHTML = tagsHTML;
            } else {
                tagsContainer.textContent = '';
            }
        }

        // 댓글 렌더링
        renderComments(comments);

        // 현재 게시글 하이라이트
        document.querySelectorAll('.post-item').forEach(item => item.classList.remove('selected'));
        const selectedPost = document.querySelector(`[data-post-id="${postId}"]`);
        if (selectedPost) selectedPost.classList.add('selected');

        // 상세보기 표시 (새 페이지로 이동하지 않고 현재 페이지에서)
        const boardDetail = document.getElementById('board-detail');
        boardDetail.style.display = 'block';
        
        // 부드러운 스크롤로 상세보기로 이동
        boardDetail.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });

        // 전역 변수에 현재 게시글 ID 저장
        window.currentPostId = postId;
        
        // 상세보기에서 필요한 이벤트 리스너들 재설정
        setupPostDetailEvents(postId);
        
        console.log('게시글 상세보기 로드 완료:', postId);
        
    } catch (error) {
        console.error('게시글 상세 로드 실패:', error);
        alert('게시글을 불러오는데 실패했습니다.');
    }
}

// 상세보기에서 필요한 이벤트들 설정
function setupPostDetailEvents(postId) {
    // 좋아요 버튼 이벤트
    const addLikeBtn = document.getElementById('addPostLike');
    const delLikeBtn = document.getElementById('delPostLike');
    
    if (addLikeBtn) {
        addLikeBtn.onclick = () => addPostLike(postId);
    }
    
    if (delLikeBtn) {
        delLikeBtn.onclick = () => removePostLike(postId);
    }
    
    // 댓글 등록 버튼 이벤트
    const commentBtn = document.querySelector('.comment-btn');
    if (commentBtn) {
        commentBtn.onclick = () => submitComment(postId);
    }
    
    // 삭제 버튼 이벤트 (본인 게시글인 경우)
    const deleteBtn = document.getElementById('delete-btn');
    if (deleteBtn) {
        deleteBtn.onclick = () => deletePost(postId);
    }
}

// 게시글 삭제
async function deletePost(postId) {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;
    
    try {
        const response = await fetch(`/api/delete/${postId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('게시글이 삭제되었습니다.');
            hidePostDetail();
            renderPostList(); // 목록 새로고침
        } else {
            throw new Error('삭제 실패');
        }
    } catch (error) {
        console.error('게시글 삭제 실패:', error);
        alert('게시글 삭제 중 오류가 발생했습니다.');
    }
}

// 게시글 좋아요 제거
async function removePostLike(postId) {
    const userId = getCurrentUserId();
    if (!userId) return;
    
    try {
        const response = await fetch(`/api/${postId}/like`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId })
        });
        
        if (response.ok) {
            const data = await response.json();
            document.getElementById('detail-likes').textContent = data.likeCount;
            // UI 업데이트 (좋아요 버튼 토글)
            toggleLikeButtons(false);
        }
    } catch (error) {
        console.error('좋아요 제거 실패:', error);
    }
}

// 좋아요 버튼 토글
function toggleLikeButtons(isLiked) {
    const addBtn = document.getElementById('addPostLike');
    const delBtn = document.getElementById('delPostLike');
    
    if (addBtn && delBtn) {
        if (isLiked) {
            addBtn.style.display = 'none';
            delBtn.style.display = 'inline-block';
        } else {
            addBtn.style.display = 'inline-block';
            delBtn.style.display = 'none';
        }
    }
}

// 게시글 좋아요 추가
async function addPostLike(postId) {
    const userId = getCurrentUserId();
    if (!userId) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    try {
        const response = await fetch(`/api/${postId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId })
        });
        
        if (response.ok) {
            const data = await response.json();
            document.getElementById('detail-likes').textContent = data.likeCount;
            // UI 업데이트 (좋아요 버튼 토글)
            toggleLikeButtons(true);
        }
    } catch (error) {
        console.error('좋아요 추가 실패:', error);
    }
}

// 댓글 렌더링 함수 (추가)
function renderComments(comments) {
    const commentsList = document.getElementById('detail-comments');
    commentsList.innerHTML = '';

    if (!comments || comments.length === 0) {
        commentsList.innerHTML = '<li style="text-align: center; color: #999;">댓글이 없습니다.</li>';
        return;
    }

    comments.forEach(comment => {
        const li = document.createElement('li');
        li.className = 'comment-item';
        li.innerHTML = `
            <div class="comment-header">
                <strong>${comment.nickname}</strong>
                <span class="comment-date">${new Date(comment.createdAt).toLocaleString()}</span>
            </div>
            <div class="comment-content">${comment.content}</div>
            <div class="comment-actions">
                <button onclick="likeComment(${comment.commentId})" style="background:none;border:none;cursor:pointer;">
                    ${comment.liked ? '❤️' : '🤍'} ${comment.commentLikeCount || 0}
                </button>
                <button onclick="showReplyForm(${comment.commentId})" style="background:none;border:none;cursor:pointer;color:#b865a4;">
                    답글
                </button>
            </div>
        `;
        commentsList.appendChild(li);

        // 대댓글 렌더링 (재귀적으로)
        if (comment.commentList && comment.commentList.length > 0) {
            renderReplies(comment.commentList, li);
        }
    });
}

// 대댓글 렌더링 함수 (추가)
function renderReplies(replies, parentElement) {
    const repliesContainer = document.createElement('ul');
    repliesContainer.className = 'replies-list';
    repliesContainer.style.marginLeft = '20px';
    repliesContainer.style.borderLeft = '2px solid #eee';
    repliesContainer.style.paddingLeft = '15px';

    replies.forEach(reply => {
        const li = document.createElement('li');
        li.className = 'reply-item';
        li.innerHTML = `
            <div class="comment-header">
                <strong>${reply.nickname}</strong>
                <span class="comment-date">${new Date(reply.createdAt).toLocaleString()}</span>
            </div>
            <div class="comment-content">${reply.content}</div>
            <div class="comment-actions">
                <button onclick="likeComment(${reply.commentId})" style="background:none;border:none;cursor:pointer;">
                    ${reply.liked ? '❤️' : '🤍'} ${reply.commentLikeCount || 0}
                </button>
            </div>
        `;
        repliesContainer.appendChild(li);
    });

    parentElement.appendChild(repliesContainer);
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

// 스크롤 없이 상세보기만 표시하는 함수 (수정)
async function showPostDetailWithoutScroll(postId) {
    const post = await fetchPostDetail(postId);
    if (!post) return;

    const comments = await fetchComments(postId);

    document.getElementById('detail-title').textContent = post.title;
    document.getElementById('detail-author').textContent = post.blog?.member?.nickname || '익명';
    document.getElementById('detail-date').textContent = new Date(post.createdAt).toLocaleString();
    document.getElementById('detail-content').innerHTML = post.content;
    document.getElementById('detail-likes').textContent = post.postLike?.length || 0;
    document.getElementById('detail-comments-count').textContent = comments.length;

    // 해시태그 표시 (여러 방식 지원)
    const tagsContainer = document.getElementById('detail-tags');
    if (tagsContainer) {
        let tagsHTML = '';
        
        // 1. post.tagText가 있는 경우 (기존 방식)
        if (post.tagText) {
            tagsContainer.textContent = post.tagText;
        }
        // 2. post.postHashtagPeople 배열이 있는 경우
        else if (post.postHashtagPeople && post.postHashtagPeople.length > 0) {
            tagsHTML = post.postHashtagPeople
                .map(tag => `<span>#${tag.hashtagPeople.tagName}</span>`)
                .join(' ');
            tagsContainer.innerHTML = tagsHTML;
        }
        // 3. post.hashtags 배열이 있는 경우
        else if (post.hashtags && Array.isArray(post.hashtags)) {
            tagsHTML = post.hashtags
                .map(tag => `<span>#${tag}</span>`)
                .join(' ');
            tagsContainer.innerHTML = tagsHTML;
        }
        // 4. 태그가 없는 경우
        else {
            tagsContainer.textContent = '';
        }
    }

    renderComments(comments);

    document.querySelectorAll('.post-item').forEach(item => item.classList.remove('selected'));
    const selectedPost = document.querySelector(`[data-post-id="${postId}"]`);
    if (selectedPost) selectedPost.classList.add('selected');

    document.getElementById('board-detail').style.display = 'block';
    window.currentPostId = postId;
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

// 게시글 상세보기 숨기기 (수정)
function hidePostDetail() {
    document.getElementById('board-detail').style.display = 'none';
    
    // 하이라이트 제거
    document.querySelectorAll('.post-item').forEach(item => {
        item.classList.remove('selected');
    });

    // 게시글 목록으로 부드러운 스크롤
    document.getElementById('board-list').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });

    console.log('게시글 상세보기 숨김');
}

// 댓글 작성 함수 (추가)
async function submitComment() {
    const commentInput = document.getElementById('comment-input');
    const commentText = commentInput.value.trim();
    
    if (!commentText) {
        alert('댓글을 입력해주세요.');
        commentInput.focus();
        return;
    }

    if (!window.currentPostId) {
        alert('게시글 정보를 찾을 수 없습니다.');
        return;
    }

    try {
        const response = await fetch(`/api/${window.currentPostId}/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: getCurrentUserId(), // 이 함수는 layout.js에서 구현 필요
                content: commentText,
                postId: window.currentPostId,
                isSecret: 'Y' // 기본값: 공개
            })
        });

        if (!response.ok) throw new Error('댓글 등록 실패');

        // 댓글 등록 성공 시 화면 업데이트
        commentInput.value = '';
        const comments = await fetchComments(window.currentPostId);
        renderComments(comments);
        document.getElementById('detail-comments-count').textContent = comments.length;

        console.log('댓글 등록 완료');
    } catch (error) {
        console.error('댓글 등록 실패:', error);
        alert('댓글 등록 중 오류가 발생했습니다.');
    }
}
/*
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
*/
function showBoardList() {

    document.getElementById("board-list").style.display = "block";
    document.getElementById("board-write").style.display = "none";
    hidePostDetail();
    
    // 페이지 전체 최상단으로 즉시 이동
    window.scrollTo(0, 0);
    
    renderPostList().then(async () => {
        const nickname = getCurrentNickname();
        const data = await fetchPosts(nickname, 0, postsPerPage, currentSort);
        if (data && Array.isArray(data.content) && data.content.length > 0) {
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
    hidePostDetail(); // 상세보기 숨김
}

function showDetailView() {
    document.getElementById("board-list").style.display = "none";
    document.getElementById("board-write").style.display = "none";
    document.getElementById("board-detail").style.display = "block";
}

// 게시판 UI 활성화 함수 (수정)
function activatePostUI() {

    // 글쓰기 버튼 이벤트
    const writeBtns = document.querySelectorAll('.write-btn');
    writeBtns.forEach(btn => {
        btn.onclick = showWriteForm;
    });

    // 정렬 버튼 이벤트
    const sortBtns = document.querySelectorAll('.board-right-controls .board-btn:not(.dropdown-btn)');
    
    sortBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('dropdown-btn')) return; // 드롭다운 버튼 제외

            sortBtns.forEach(b => b.classList.remove('active')); // 기존 active 제거
            this.classList.add('active'); // 클릭된 버튼에 active 추가
            
            // 정렬 방식 적용
            const sortType = this.textContent.includes('최신순') ? 'latest' : 
                            this.textContent.includes('좋아요순') ? 'likes' : 'comments';
            changeSortType(sortType);
        });
    });

    // 페이지 사이즈 드롭다운 이벤트
    setupPageSizeDropdown();

    // 뒤로가기 버튼 이벤트
    const backBtns = document.querySelectorAll('.back-btn');
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
        commentBtn.addEventListener('click', submitComment);
    }

    // 초기 게시글 목록 렌더링
    showBoardList();

    // 스킨 로드
    if (typeof window.maintainDefaultSkinForInactiveUsers === 'function') {
        window.maintainDefaultSkinForInactiveUsers();
    }
    
}

// 페이지 사이즈 드롭다운 설정 (분리)
function setupPageSizeDropdown() {

    const pageSizeDropdown = document.querySelector('.page-size-dropdown');
    if (!pageSizeDropdown) return;

    const dropdownBtn = pageSizeDropdown.querySelector('.dropdown-btn');
    const dropdownMenu = pageSizeDropdown.querySelector('.dropdown-menu');
    
    if (!dropdownBtn || !dropdownMenu) return;

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

// === 유틸리티 함수들 ===

function getCurrentNickname() {
    const currentPath = window.location.pathname;
    const match = currentPath.match(/^\/blog\/@([^\/]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

// layout.js에서 구현된 함수 (추가)
function getCurrentUserId() {
    if (typeof window.getCurrentUserId === 'function') {
        return window.getCurrentUserId();
    }
    console.error('getCurrentUserId 함수를 찾을 수 없습니다! layout.js가 로드되었는지 확인하세요.');
    return null;
}

// 댓글 좋아요 (임시 구현)
function likeComment(commentId) {
    console.log('댓글 좋아요:', commentId);
    // 실제 구현 필요
}

// 답글 폼 표시 (임시 구현)
function showReplyForm(commentId) {
    console.log('답글 폼 표시:', commentId);
    // 실제 구현 필요
}

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
// === 스킨 로드 함수 끝 ===

// === 이벤트 리스너 등록 ===
window.addEventListener('DOMContentLoaded', activatePostUI);

// === 전역 함수 노출 ===
window.loadBlogSkin = loadBlogSkin;
window.setupPostFeatures = activatePostUI;
window.activatePostUI = activatePostUI;
window.showPostDetail = showPostDetail;
window.hidePostDetail = hidePostDetail;
window.showBoardList = showBoardList;
window.showWriteForm = showWriteForm;
