document.addEventListener("DOMContentLoaded", function () {

    // 기본값: 서울 (areaCode = 1)
    let selectedAreaCode = "1";
    let selectedAreaName = "서울";
    let currentPage = 1;
    let eventsData = [];
    const eventsPerPage = 4;

    // 서울 지역 데이터 초기 로드
    fetchInitialRegionData();

    function fetchInitialRegionData() {
        fetch(`https://apis.data.go.kr/B551011/KorService1/searchFestival1?numOfRows=12&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json&eventStartDate=20250615&areaCode=1&serviceKey=WE8zMSHqcnIgkNM8%2BArCN71r3exZEj%2FG4cPNj9NW8bb4quc1fmi2oxTpPF1C1aWmDl%2FXeAWBqQO6XMjJlShceg%3D%3D`)
            .then(res => res.json())
            .then(data => {
                eventsData = data.response.body.items.item;
                currentPage = 1;
                renderEventList();
            })
            .catch(err => {
                console.error("초기 API 호출 실패:", err);
            });
    }

    // 지역 버튼 클릭 시 선택/해제
    document.querySelectorAll(".region-btn").forEach(button => {
        button.addEventListener("click", () => {
            const code = button.dataset.code;
            const name = button.innerText;

            if (selectedAreaCode === code) {
                selectedAreaCode = null;
                selectedAreaName = null;
                button.classList.remove("active");
                document.getElementById("selectedRegionName").innerText = "없음";
            } else {
                document.querySelectorAll(".region-btn").forEach(btn => btn.classList.remove("active"));
                selectedAreaCode = code;
                selectedAreaName = name;
                button.classList.add("active");
                document.getElementById("selectedRegionName").innerText = selectedAreaName;
            }
        });
    });

    // 모달 확인 버튼 클릭 시
    document.getElementById("confirmRegionBtn").addEventListener("click", () => {
        if (!selectedAreaCode) {
            alert("지역을 선택하세요.");
            return;
        }

        fetch(`https://apis.data.go.kr/B551011/KorService1/searchFestival1?numOfRows=12&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json&eventStartDate=20250615&areaCode=${selectedAreaCode}&serviceKey=WE8zMSHqcnIgkNM8%2BArCN71r3exZEj%2FG4cPNj9NW8bb4quc1fmi2oxTpPF1C1aWmDl%2FXeAWBqQO6XMjJlShceg%3D%3D`)
            .then(res => res.json())
            .then(data => {
                eventsData = data.response.body.items.item;
                currentPage = 1;
                renderEventList();
            })
            .catch(err => {
                console.error("API 요청 실패:", err);
            });

        closeModal();
    });

    // 이벤트 목록 렌더링
    function renderEventList() {
        const start = (currentPage - 1) * eventsPerPage;
        const end = start + eventsPerPage;
        const currentEvents = eventsData.slice(start, end);

        const container = document.getElementById("eventList");
        container.innerHTML = "";

        currentEvents.forEach(event => {
            const item = document.createElement("div");
            item.className = "mb-3 d-flex border rounded p-2 align-items-center";

            const imageUrl = event.firstimage || "../images/page/noimage.png";

            item.innerHTML = `
                <img src="${imageUrl}" alt="${event.title}" class="me-3" style="width:100px; height:100px; object-fit:cover;">
                <div>
                    <strong>${event.title}</strong><br>
                    <span>${event.addr1 || '주소 정보 없음'}</span>
                </div>
            `;

            container.appendChild(item);
        });

        document.getElementById("prevPageBtn").disabled = currentPage === 1;
        document.getElementById("nextPageBtn").disabled = end >= eventsData.length;
    }

    // 모달 강제 종료 및 스크롤 복구
    function closeModal() {
        const modalElement = document.getElementById("regionModal");
        try {
            const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
            modalInstance.hide();
        } catch (e) {
            console.warn("모달 인스턴스 획득 실패:", e);
        }

        setTimeout(() => {
            document.body.classList.remove("modal-open");
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";

            const backdrops = document.querySelectorAll(".modal-backdrop");
            backdrops.forEach(el => el.remove());
        }, 300); // Bootstrap 애니메이션 대기 후 제거
    }

    // 페이지 버튼 이벤트
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
