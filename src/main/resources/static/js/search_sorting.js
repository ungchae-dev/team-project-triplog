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

    // 검색창 이벤트 (엔터 입력 시)
    keywordInput.addEventListener("keypress", (e) => {
        if (e.key === 'Enter') {
            currentPage = 1;
            fetchAndRenderPosts();
        }
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
            const peopleTags = (post.peopleTags || []).map(tag => `👥${tag}`).join(' '); // 이모지는 선택사항
            const postCard = document.createElement("div");
            postCard.className = "posts-cards";
            postCard.innerHTML = `
                <a href="/post/${post.id}" class="post-thumbnail">
                    <img src="${post.thumbnail || '/images/page/noimage.png'}" alt="대표사진">
                </a>
                <div class="post-info">
                    <div class="post-tags">${hashtags} ${peopleTags}</div>
                    <a href="/post/${post.id}" class="post-title">${post.title}</a>
                    <div class="post-meta">
                        <span class="nickname">${post.nickname}</span> · 
                        <span class="date">${post.date}</span> · 
                        ❤️ ${post.likes} · 💬 ${post.comments}
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
});
