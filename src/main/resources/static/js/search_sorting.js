document.addEventListener("DOMContentLoaded", function(){



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
