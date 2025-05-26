document.addEventListener("DOMContentLoaded", function () {
    let selectedAreaCode = "1"; // 기본값: 서울 (code=1)
    let selectedAreaName = "서울";
    let currentPage = 1;
    let eventsData = [];
    const eventsPerPage = 4;

    //지역 이름 UI 초기 설정
    document.getElementById("selectedRegionName").innerText = selectedAreaName;

    // 서울 버튼에 .active 적용
    const seoulBtn = document.querySelector('.region-btn[data-code="1"]');
    if (seoulBtn) seoulBtn.classList.add('active');

    //선택된 지역 이름 UI 반영
    const selectedNameElem = document.getElementById("selectedRegionName");
    if (selectedNameElem) selectedNameElem.innerText = selectedAreaName;

    //페이지 초기 진입 시 서울 데이터를 바로 로딩
    fetchEventsByAreaCode(selectedAreaCode);

    //지역 버튼 클릭 시
    document.querySelectorAll(".region-btn").forEach(button => {
        button.addEventListener("click", () => {
            const code = button.dataset.code;
            const name = button.innerText;

            document.querySelectorAll(".region-btn").forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            selectedAreaCode = code;
            selectedAreaName = name;
            document.getElementById("selectedRegionName").innerText = selectedAreaName;
        });
    });

    // '지역' 버튼 클릭 시 <dialog> 열기
    document.getElementById("openRegionDialogBtn").addEventListener("click", () => {
        document.getElementById("regionDialog").showModal();
    });

    // '확인' 버튼 클릭 시 이벤트 호출 및 dialog 닫기
    document.getElementById("confirmRegionBtn").addEventListener("click", () => {
        if (!selectedAreaCode) {
            alert("지역을 선택하세요.");
            return;
        }

        fetchEventsByAreaCode(selectedAreaCode);
        document.getElementById("regionDialog").close();
    });

    // '취소' 버튼 클릭 시 닫기
    document.getElementById("cancelRegionBtn").addEventListener("click", () => {
        document.getElementById("regionDialog").close();
    });

    // API 호출 함수
    function fetchEventsByAreaCode(areaCode) {
        fetch(`https://apis.data.go.kr/B551011/KorService1/searchFestival1?numOfRows=12&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json&eventStartDate=20250101&areaCode=${areaCode}&serviceKey=WE8zMSHqcnIgkNM8%2BArCN71r3exZEj%2FG4cPNj9NW8bb4quc1fmi2oxTpPF1C1aWmDl%2FXeAWBqQO6XMjJlShceg%3D%3D`)
            .then(res => res.json())
            .then(data => {
                eventsData = data.response.body.items.item || [];
                currentPage = 1;
                renderEventList();
            })
            .catch(err => console.error("API 요청 실패:", err));
    }

    // 행사 정보 렌더링
    function renderEventList() {
        const start = (currentPage - 1) * eventsPerPage;
        const end = start + eventsPerPage;
        const currentEvents = eventsData.slice(start, end);

        const container = document.getElementById("eventList");
        container.innerHTML = "";

        currentEvents.forEach(event => {
            const imageUrl = event.firstimage || "../images/page/noimage.png";
            const title = event.title;
            const html = `
                <div class="col">
                    <div class="card h-100">
                        <img src="${imageUrl}" class="card-img-top" style="height: 180px; object-fit: cover;" alt="${title}">
                        <div class="card-body p-2">
                            <h6 class="card-title mb-0 text-truncate">${title}</h6>
                        </div>
                    </div>
                </div>`;
            container.insertAdjacentHTML('beforeend', html);
        });

        document.getElementById("prevPageBtn").disabled = currentPage === 1;
        document.getElementById("nextPageBtn").disabled = end >= eventsData.length;
    }

    // 페이지네이션
    document.getElementById("prevPageBtn").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderEventList();
        }
    });

    document.getElementById("nextPageBtn").addEventListener("click", () => {
        if ((currentPage * eventsPerPage) < eventsData.length) {
            currentPage++;
            renderEventList();
        }
    });
});
