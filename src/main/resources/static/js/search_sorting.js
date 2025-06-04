document.addEventListener("DOMContentLoaded", function(){

    const selectedCategories = new Set();
    const postList = document.getElementById("postList");
    const sortSelect = document.getElementById("sortSelect");

// 1. 탭 클릭 이벤트
    document.querySelectorAll(".tab-button").forEach(button => {
        button.addEventListener("click", () => {
            const category = button.dataset.category;
            if (selectedCategories.has(category)) {
                selectedCategories.delete(category);
                button.classList.remove("active");
            } else {
                selectedCategories.add(category);
                button.classList.add("active");
            }
            fetchAndRenderPosts();
        });
    });

// 2. 정렬 선택 이벤트
    sortSelect.addEventListener("change", () => {
        fetchAndRenderPosts();
    });

// 3. 게시글 렌더링 함수
    function renderPosts(posts) {
        postList.innerHTML = "";

        posts.forEach(post => {
            const postCard = document.createElement("div");
            postCard.className = "post-card";
            //추후에 블로그 글 링크 설정
            postCard.innerHTML = `
            <a href="#" class="post-thumbnail">
                <img src="${post.thumbnail}" alt="대표사진">
            </a>
            <div class="post-info">
                <div class="post-tags">${post.tags.map(tag => `#${tag}`).join(' ')}</div>
                <a href="#" class="post-title">${post.title}</a>
                <div class="post-meta">
                    <span class="nickname">${post.nickname}</span> · 
                    <span class="date">${post.date}</span> · 
                    ❤️ ${post.likes} · 💬 ${post.comments}
                </div>
            </div>
        `;
            postList.appendChild(postCard);
        });
    }


// 4. 서버 요청 및 데이터 가져오기
    function fetchAndRenderPosts(page = 1) {
        const categories = Array.from(selectedCategories);
        const sort = sortSelect.value;

        const params = new URLSearchParams({
            sort,
            page,
            categories: categories.join(",") // 서버에서 ,로 구분해 파싱
        });

        fetch(`/api/posts?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                renderPosts(data.posts);
                // 페이지네이션 연동 필요 시 여기서 data.totalPages 등 처리
            });
    }

// 초기 로딩
    fetchAndRenderPosts();


    // 페이징 처리
    function renderPagination(currentPage, totalPages) {
        const pagination = document.getElementById("pagination");
        pagination.innerHTML = "";

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
        const params = new URLSearchParams(window.location.search);
        params.set("page", newPage);
        window.location.href = `/tour?${params.toString()}`;
    }

});
