document.addEventListener("DOMContentLoaded", function () {
    const selectedPeopleTags = new Set();
    let currentPage = 1;
    const postList = document.getElementById("postList");
    const sortSelect = document.getElementById("sortSelect");
    const keywordInput = document.getElementById("keywordInput");
    const pageInfo = document.getElementById("pageInfo");

    const prevBtn = document.getElementById("prevPage");
    const nextBtn = document.getElementById("nextPage");

    // 인원수 필터 버튼 이벤트
    document.querySelectorAll(".tab-button").forEach(button => {
        button.addEventListener("click", () => {
            const tag = button.dataset.category;
            if (selectedPeopleTags.has(tag)) {
                selectedPeopleTags.delete(tag);
                button.classList.remove("active");
            } else {
                selectedPeopleTags.add(tag);
                button.classList.add("active");
            }
            currentPage = 1;
            fetchAndRenderPosts();
        });
    });

    // 정렬 변경 이벤트
    sortSelect.addEventListener("change", () => {
        currentPage = 1;
        fetchAndRenderPosts();
    });

    //검색창 이벤트 (검색버튼 클릭시)
    document.getElementById("searchButton").addEventListener("click", triggerSearch);

    // 검색창 이벤트 (엔터 입력 시)
    keywordInput.addEventListener("keypress", (e) => {
        if (e.key === 'Enter') triggerSearch();
    });

    // 페이징 이벤트
    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            fetchAndRenderPosts();
        }
    });

    nextBtn.addEventListener("click", () => {
        currentPage++;
        fetchAndRenderPosts();
    });

    // 게시글 렌더링
    function renderPosts(posts) {
        postList.querySelector("section").innerHTML = "";

        posts.forEach(post => {
            const hashtags = (post.hashtags || []).map(tag => `#${tag}`).join(' ');
            const peopleTags = (post.peopleTags || []).map(tag => `👥${tag}`).join(' ');

            const postCard = document.createElement("div");
            postCard.className = "posts-cards";

            postCard.innerHTML = `
            <!-- 썸네일 -->
            <a href="/blog/@${post.nickname}/post" class="post-thumbnail">
                    <img src="${post.thumbnailUrl || '/images/page/noimage.png'}" alt="대표 이미지"/>
            </a>
                
            

            <!-- 게시글 정보 -->
            <div class="post-info">
                <!-- 해시태그 -->
                <div class="post-tags">
                    ${hashtags} ${peopleTags}
                </div>

                <!-- 제목 -->
                <a href="/blog/@${post.nickname}/post" class="post-title">${post.title}</a>

                <!-- 닉네임 + 날짜 -->
                <div class="post-meta">
                    <span>${post.nickname}</span>
                    <span>${post.date}</span>
                </div>

                <!-- 본문 요약 (2줄) -->
                <p class="post-snippet">${post.content || '내용 없음'}</p>

                <!-- 좋아요 / 댓글 -->
                <div class="post-meta">
                    <span>❤️ ${post.likes}</span>
                    <span>💬 ${post.comments}</span>
                </div>
            </div>
        `;
            postList.querySelector("section").appendChild(postCard);
        });
    }


    // 게시글 요청 및 렌더링
    function fetchAndRenderPosts() {
        const keyword = keywordInput.value.trim();
        const people = Array.from(selectedPeopleTags).join(",");
        const sort = sortSelect.value;

        const params = new URLSearchParams({
            keyword,
            people,
            sort,
            page: currentPage
        });


        fetch(`/search/posts?${params}`)
            .then(response => response.json())
            .then(data => {
                renderPosts(data.posts);
                updatePagination(data.page, data.totalPages);
                renderPagination(data.page, data.totalPages);
            })
            .catch(error => {
                console.error("게시글 불러오기 실패:", error);
            });
    }

    // 페이지 정보 업데이트
    function updatePagination(page, totalPages) {
        pageInfo.textContent = `페이지 ${page} / ${totalPages}`;
        prevBtn.disabled = page <= 1;
        nextBtn.disabled = page >= totalPages;
    }

    // 초기 로딩
    fetchAndRenderPosts();

    // 페이징 처리
    function renderPagination(currentPage, totalPages) {
        const pagination = document.getElementById("pagination");
        pagination.innerHTML = "";

        //페이징 음수 방지
        currentPage = Math.max(currentPage, 1);
        totalPages = Math.max(totalPages, 1);

        const groupSize = 10;
        const lastGroupStart = Math.floor((totalPages - 1) / groupSize) * groupSize + 1;

        const currentGroup = Math.floor((currentPage - 1) / groupSize);
        const startPage = currentGroup * groupSize + 1;
        const endPage = Math.min(startPage + groupSize - 1, totalPages);

        // "처음" 버튼
        if (currentGroup > 0) {
            const firstBtn = createPageButton("처음", 1);
            pagination.appendChild(firstBtn);
        }

        // "이전" 버튼
        if (startPage > 1) {
            const prevBtn = createPageButton("이전", startPage - 1);
            pagination.appendChild(prevBtn);
        }

        // 현재 페이지 그룹 버튼
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = createPageButton(i, i);
            if (i === currentPage) pageBtn.classList.add("active");
            pagination.appendChild(pageBtn);
        }

        // "다음" 버튼
        if (endPage < totalPages) {
            const nextBtn = createPageButton("다음", endPage + 1);
            pagination.appendChild(nextBtn);
        }

        // --- 줄바꿈 후 마지막 페이지 그룹 ---
        if (totalPages > 50 && endPage < lastGroupStart) {
            const breakDiv = document.createElement("div");
            breakDiv.className = "pagination-row"; // 줄바꿈용 컨테이너
            // ... 넣기
            const dots = document.createElement("span");
            dots.textContent = "...";
            dots.style.margin = "0 10px";
            breakDiv.appendChild(dots);

            // 마지막 페이지 그룹
            for (let i = lastGroupStart; i <= totalPages; i++) {
                const lastPageBtn = createPageButton(i, i);
                if (i === currentPage) lastPageBtn.classList.add("active");
                breakDiv.appendChild(lastPageBtn);
            }

            pagination.appendChild(breakDiv);
        }
    }

    function createPageButton(text, pageNumber) {
        const btn = document.createElement("button");
        btn.textContent = text;
        btn.addEventListener("click", () => changePage(pageNumber));
        return btn;
    }

    function changePage(newPage) {
        const keyword = keywordInput.value.trim();
        const people = Array.from(selectedPeopleTags).join(",");
        const sort = sortSelect.value;

        const params = new URLSearchParams({
            keyword,
            people,
            sort,
            page: newPage
        });

        window.location.href = `/tour?${params.toString()}`;
    }

    function triggerSearch() {
        currentPage = 1;
        fetchAndRenderPosts();
    }
});
