document.addEventListener("DOMContentLoaded", function(){

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
    let selectedAreaCode = currentAreaCode; // 기본값: 서울 (code=1)
    let selectedAreaName = "";

    // URL에서 선택된 지역 이름 찾아서 설정
    const selectedRegionBtn = document.querySelector(`.region-btn[data-code="${selectedAreaCode}"]`);
    if (selectedRegionBtn) {
        selectedAreaName = selectedRegionBtn.innerText;
        selectedRegionBtn.classList.add('active');
    } else {
        selectedAreaName = "지역 선택 안됨";
    }

    //지역 이름 UI 초기 설정
    document.getElementById("selectedRegionName").innerText = selectedAreaName;

    // 서울 버튼에 .active 적용
    const seoulBtn = document.querySelector('.region-btn[data-code="1"]');
    if (seoulBtn) seoulBtn.classList.add('active');

    //선택된 지역 이름 UI 반영
    const selectedNameElem = document.getElementById("selectedRegionName");
    if (selectedNameElem) selectedNameElem.innerText = selectedAreaName;

    //현재 선택한 카테고리(행사, 관광지, 맛집) 중에 .active 적용
    if (currentCategory) {
        const activeBtn = document.querySelector(`.tab-button[data-category="${currentCategory}"]`);
        if (activeBtn) {
            activeBtn.classList.add("active");
        }
    }

    loadCategory(currentAreaCode, currentCategory, currentPage);

    //지역 버튼 클릭 시 selectedDataCode 설정 및 값 전달하기
    document.querySelectorAll(".region-btn").forEach(button => {
        button.addEventListener("click", () => {
            const code = button.dataset.code;
            const name = button.innerText;

            document.querySelectorAll(".region-btn").forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            selectedAreaCode = code;
            selectedAreaName = name;
            document.getElementById("selectedRegionName").innerText = selectedAreaName;


            const div = document.getElementById("selectedDataCode");
            if (div) div.dataset.code = selectedAreaCode;

        });
    });

    // 카테고리 탭 버튼 클릭 시 동작
    document.querySelectorAll(".tab-button").forEach(btn => {
    btn.addEventListener("click", () => {

        const selected = btn.dataset.category;

        // 현재 URL 파라미터 가져오기
        const currentParams = new URLSearchParams(window.location.search);
        const currentAreaCode = currentParams.get("areaCode") || "1"; // 기본값 서울

        // 새 카테고리로 설정하고, page는 1로 초기화
        currentParams.set("category", selected);
        currentParams.set("areaCode", currentAreaCode);
        currentParams.set("page", 1);

        //모든 탭 버튼에서 active 제거
        document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));

        // 현재 클릭된 버튼에 active 추가
        btn.classList.add("active");

        // 새 URL로 이동
        window.location.href = `/tour?${currentParams.toString()}`;
    });
});

    // '지역' 버튼 클릭 시 <dialog> 열기
    document.getElementById("openRegionDialogBtn").addEventListener("click", () => {
        const regionDialog = document.getElementById("regionDialog");
        regionDialog.showModal();

        // 모든 버튼에서 active 제거
        document.querySelectorAll(".region-btn").forEach(b => b.classList.remove("active"));

        // dialog가 열릴 때 가장 최근 선택된 지역 버튼을 active 상태로 표시
        const regionButtons = document.querySelectorAll(".region-btn");


        regionButtons.forEach(btn => btn.classList.remove("active"));

        // selectedAreaCode에 해당하는 버튼에 active 추가
        if (selectedAreaCode) {
            const lastSelectedBtn = Array.from(regionButtons).find(btn => btn.dataset.code === selectedAreaCode);
            if (lastSelectedBtn) {
                lastSelectedBtn.classList.add("active");
            }
        }
    });

    // '취소' 버튼 클릭 시 닫기
    document.getElementById("cancelRegionBtn").addEventListener("click", () => {
    document.getElementById("regionDialog").close();
    });

    // 지역 선택 다이얼로그 처리
    document.getElementById("confirmRegionBtn").addEventListener("click", () => {

    if (!selectedAreaCode) {
        alert("지역을 선택하세요.");
        return;
    }
    const selectedBtn = document.querySelector(".region-btn.active");
        if (!selectedBtn) {
            alert("지역을 선택하세요.");
            return;
        }
    currentAreaCode = selectedBtn.dataset.code;
    document.getElementById("selectedRegionName").textContent = selectedBtn.textContent;
    currentPage = 1;
    loadCategory(currentAreaCode, currentCategory, currentPage);

    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set("areaCode", selectedAreaCode);
    currentParams.set("page", 1); // 페이지 초기화
        if (!currentParams.has("category")) {
            currentParams.set("category", "event"); // 기본값
        }

        // URL 변경
        window.location.href = `/tour?${currentParams.toString()}`;
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
            renderPagination(currentPage, totalPages);
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

        const contentId = item.contentid;
        const contentTypeId = item.contenttypeid;

        card.innerHTML = `
            <img src="${image}" alt="${title}" onerror="this.src='/images/page/noimage.png'">
            <div class="card-body")">
                <h5>${title}</h5>
                
            </div>
        `;

        // 카드 클릭 시 상세 팝업 열기
        card.addEventListener("click", () => {
            openPopup(contentId, contentTypeId);
        });

        container.appendChild(card);
    });
    }


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
