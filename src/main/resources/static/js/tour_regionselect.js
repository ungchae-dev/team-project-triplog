const serviceKey = 'jNMekcDaMEsxF%2FUl23ffFPSb79Ejv4Ix1DFl%2BZt%2FCkU2cmglLJYvgJT40%2Fm9zbx8gXdNOvoSv7%2F6dH8%2BIK0fkA%3D%3D'; // 퍼센트 인코딩된 인증키

// URL에서 파라미터 추출
const params = new URLSearchParams(window.location.search);
const DEFAULT_AREA_CODE = params.get("areaCode") || "1";
const DEFAULT_CATEGORY = params.get("category") || "event";
const DEFAULT_PAGE = parseInt(params.get("page") || "1", 10);

const itemsPerPage = 16;
let currentPage = DEFAULT_PAGE || 1;
let totalPages = 1;
let currentCategory = DEFAULT_CATEGORY;
let currentAreaCode = DEFAULT_AREA_CODE;

document.addEventListener("DOMContentLoaded", () => {
    loadCategory(currentAreaCode, currentCategory, currentPage);
});

// 카테고리 탭 버튼 클릭 시 동작
document.querySelectorAll(".tab-button").forEach(btn => {
    btn.addEventListener("click", () => {
        const selected = btn.dataset.category;
        currentCategory = selected;
        currentPage = 1;
        loadCategory(currentAreaCode, currentCategory, currentPage);
    });
});

// 지역 선택 다이얼로그 처리
document.getElementById("confirmRegionBtn").addEventListener("click", () => {
    const selectedBtn = document.querySelector(".region-btn.active");
    currentAreaCode = selectedBtn.dataset.code;
    document.getElementById("selectedRegionName").textContent = selectedBtn.textContent;
    currentPage = 1;
    loadCategory(currentAreaCode, currentCategory, currentPage);
    document.getElementById("regionDialog").close();
});

// API 요청
function loadCategory(areaCode, category, page) {
    let url = "";

    switch (category) {
        case 'event':
            url = `https://apis.data.go.kr/B551011/KorService1/searchFestival1?serviceKey=${serviceKey}&numOfRows=${itemsPerPage}&pageNo=${page}&MobileOS=ETC&MobileApp=Triplog&areaCode=${areaCode}&eventStartDate=20250101&_type=json`;
            break;
        case 'tour':
            url = `https://apis.data.go.kr/B551011/KorService1/areaBasedList1?serviceKey=${serviceKey}&numOfRows=${itemsPerPage}&pageNo=${page}&MobileOS=ETC&MobileApp=Triplog&areaCode=${areaCode}&contentTypeId=12&_type=json`;
            break;
        case 'food':
            url = `https://apis.data.go.kr/B551011/KorService1/areaBasedList1?serviceKey=${serviceKey}&numOfRows=${itemsPerPage}&pageNo=${page}&MobileOS=ETC&MobileApp=Triplog&areaCode=${areaCode}&contentTypeId=39&_type=json`;
            break;
        default:
            alert("알 수 없는 카테고리입니다.");
            return;
    }
    console.log(url)
    fetch(url)
        .then(res => res.json())
        .then(data => {
            const body = data.response.body;
            const items = body.items?.item || [];
            totalPages = Math.ceil(body.totalCount / itemsPerPage);
            renderCards(items);
            renderPagination();
        })
        .catch(err => console.error("API 오류:", err));
}

// 카드 생성
function renderCards(items) {
    const container = document.getElementById("tourCardContainer");
    container.innerHTML = "";

    if (!items.length) {
        container.innerHTML = "<p>표시할 콘텐츠가 없습니다.</p>";
        return;
    }

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "tour-card";

        const image = item.firstimage || "/images/page/noimage.png";
        const title = item.title || "제목 없음";
        const address = item.addr1 || "주소 정보 없음";

        card.innerHTML = `
            <img src="${image}" alt="${title}" onerror="this.src='/images/page/noimage.png'">
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


// 페이징 처리
function renderPagination() {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    const info = document.createElement("span");
    info.textContent = `페이지 ${currentPage} / ${totalPages}`;
    pagination.appendChild(info);

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "이전";
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
        currentPage--;
        loadCategory(currentAreaCode, currentCategory, currentPage);
    });
    pagination.appendChild(prevBtn);

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.textContent = i;
        if (i === currentPage) pageBtn.disabled = true;
        pageBtn.addEventListener("click", () => {
            currentPage = i;
            loadCategory(currentAreaCode, currentCategory, currentPage);
        });
        pagination.appendChild(pageBtn);
    }

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "다음";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
        currentPage++;
        loadCategory(currentAreaCode, currentCategory, currentPage);
    });
    pagination.appendChild(nextBtn);
}
