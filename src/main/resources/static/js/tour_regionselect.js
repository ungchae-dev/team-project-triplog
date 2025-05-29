const serviceKey = 'WE8zMSHqcnIgkNM8%2BArCN71r3exZEj%2FG4cPNj9NW8bb4quc1fmi2oxTpPF1C1aWmDl%2FXeAWBqQO6XMjJlShceg%3D%3D'; // 🔐 실제 인증키로 교체
const itemsPerPage = 4; // 한 페이지당 카드 수
let currentPage = 1;
let totalPages = 1;
let currentCategory = '';
let currentAreaCode = '';
let currentContentTypeId = 0;

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    currentAreaCode = params.get("areaCode");
    currentCategory = params.get("category");


    if (!currentAreaCode || !currentCategory) {
        alert("잘못된 접근입니다.");
        return;
    }

    switch (currentCategory) {
        case 'event':
            fetchFestivalList(currentAreaCode, currentPage);
            break;
        case 'tour':
            currentContentTypeId = 12;
            fetchTourList(currentAreaCode, currentContentTypeId, currentPage);
            break;
        case 'food':
            currentContentTypeId = 39;
            fetchTourList(currentAreaCode, currentContentTypeId, currentPage);
            break;
        default:
            alert("알 수 없는 카테고리입니다.");
    }
});

//행사/축제 목록 가져오기
function fetchFestivalList(areaCode, page) {

    const url = `https://apis.data.go.kr/B551011/KorService1/searchFestival1?serviceKey=${serviceKey}&numOfRows=${itemsPerPage}&pageNo=${page}&MobileOS=ETC&MobileApp=Triplog&areaCode=${areaCode}&eventStartDate=20250101&_type=json`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const body = data.response.body;
            const items = body.items.item || [];
            totalPages = Math.ceil(body.totalCount / itemsPerPage);

            renderCards(items);
            renderPagination();
        })
        .catch(err => console.error("축제 API 오류:", err));
}

//관광지/맛집 목록 가져오기
function fetchTourList(areaCode, contentTypeId, page) {
    const url = `/detailapi/tourlist?areaCode=${areaCode}&category=${currentCategory}&page=${page}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const body = data.response.body;
            const items = body.items.item || [];
            totalPages = Math.ceil(body.totalCount / itemsPerPage);

            renderCards(items);
            renderPagination();
        })
        .catch(err => console.error("관광/맛집 API 오류:", err));
}

//카드 UI 생성
function renderCards(items) {
    const container = document.getElementById("tourCardContainer");
    container.innerHTML = "";

    if (!items.length) {
        container.innerHTML = "<p>해당 지역에 표시할 정보가 없습니다.</p>";
        return;
    }

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "tour-card";

        const image = item.firstimage || "default-image.jpg";
        const title = item.title || "제목 없음";
        const address = item.addr1 || "주소 정보 없음";

        card.innerHTML = `
            <img src="${image}" alt="${title}" onerror="this.src='default-image.jpg'">
            <div class="card-body">
                <h5>${title}</h5>
                <p>${address}</p>
            </div>
        `;

        card.addEventListener("click", () => {
            window.open(`tourpopup.html?contentId=${item.contentid}`, "_blank", "width=800,height=600");
        });

        container.appendChild(card);
    });
}

//페이지네이션 UI 생성
function renderPagination() {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    const info = document.createElement("span");
    info.textContent = `페이지 ${currentPage} / ${totalPages}`;
    pagination.appendChild(info);

    // 이전 버튼
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "이전";
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
        currentPage--;
        reloadCurrent();
    });
    pagination.appendChild(prevBtn);

    // 숫자 버튼 (최대 5개 표시)
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.textContent = i;
        if (i === currentPage) pageBtn.disabled = true;
        pageBtn.addEventListener("click", () => {
            currentPage = i;
            reloadCurrent();
        });
        pagination.appendChild(pageBtn);
    }

    // 다음 버튼
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "다음";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
        currentPage++;
        reloadCurrent();
    });
    pagination.appendChild(nextBtn);
}

//현재 상태 기준으로 목록 재호출
function reloadCurrent() {
    if (currentCategory === 'event') {
        fetchFestivalList(currentAreaCode, currentPage);
    } else {
        fetchTourList(currentAreaCode, currentContentTypeId, currentPage);
    }
}
