document.addEventListener("DOMContentLoaded", () => {
    fetch('/weekly-best')
        .then(response => response.json())
        .then(posts => {
            const container = document.querySelector('.weekly-best .d-flex');
            if (!container) return;

            container.innerHTML = ''; // 기존 내용 제거

            const medalIcons = [
                '/images/page/gold.png',
                '/images/page/silver.png',
                '/images/page/bronze.png',
                null // 4위는 메달 없음
            ];

            posts.forEach((post, index) => {
                const card = document.createElement('div');
                card.className = 'card shadow-sm border rounded position-relative';
                card.style.width = '23%';

                let medalHTML = '';
                if (medalIcons[index]) {
                    medalHTML = `
                        <img src="${medalIcons[index]}" class="position-absolute"
                             style="top: 0px; left: 0px; width: 60px; height: 60px; z-index: 10;" />
                    `;
                }

                card.innerHTML = `
                    ${medalHTML}
                    <a href="/blog/@${post.nickname}/post">
                        <img src="${post.thumbnailUrl}" class="card-img-top" onerror="this.onerror=null;this.src='/images/page/default_IsThumbnail.png';" alt="대표 이미지"
                             style="height: 200px; object-fit: cover;">
                    </a>
                    <div class="card-body">
                        <h6 class="card-title text-truncate mb-0">${post.title}</h6>
                    </div>
                `;

                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error('주간 인기글 로딩 실패:', error);
        });
});
