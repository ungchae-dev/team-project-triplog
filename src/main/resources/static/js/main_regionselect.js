document.addEventListener("DOMContentLoaded", function () {
    let selectedAreaCode = "1"; // 기본값: 서울 (code=1)
    let selectedAreaName = "서울";
    let currentPage = 1;
    let currentTourPage = 1;
    let currentFoodPage = 1;
    let eventData = [];
    let tourData = [],foodData = [];
    const eventsPerPage = 4;
    const tourPerPage = 4;
    const foodPerPage = 4;

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
    fetchToursByAreaCode(selectedAreaCode);
    fetchFoodsByAreaCode(selectedAreaCode);

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
        fetchToursByAreaCode(selectedAreaCode);
        fetchFoodsByAreaCode(selectedAreaCode);
        document.getElementById("regionDialog").close();
    });

    // '취소' 버튼 클릭 시 닫기
    document.getElementById("cancelRegionBtn").addEventListener("click", () => {
        document.getElementById("regionDialog").close();
    });

    //선택한 지역의 areaCode 보내기
    const currentAreaCode = selectedAreaCode;





    // 행사 API 호출 함수
    function fetchEventsByAreaCode(areaCode) {
        fetch(`https://apis.data.go.kr/B551011/KorService1/searchFestival1?numOfRows=12&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json&eventStartDate=20250101&areaCode=${areaCode}&serviceKey=jNMekcDaMEsxF%2FUl23ffFPSb79Ejv4Ix1DFl%2BZt%2FCkU2cmglLJYvgJT40%2Fm9zbx8gXdNOvoSv7%2F6dH8%2BIK0fkA%3D%3D&_type=json`)
            .then(res => res.json())
            .then(data => {
                eventData = data.response.body.items.item || [];
                currentPage = 1;
                renderEventList();
            })
            .catch(err => console.error("API 요청 실패:", err));
    }

    // 관광지 API 호출 함수
    function fetchToursByAreaCode(areaCode) {
        fetch(`http://apis.data.go.kr/B551011/KorService1/areaBasedList1?numOfRows=12&pageNo=1&MobileOS=ETC&MobileApp=AppTest&ServiceKey=jNMekcDaMEsxF%2FUl23ffFPSb79Ejv4Ix1DFl%2BZt%2FCkU2cmglLJYvgJT40%2Fm9zbx8gXdNOvoSv7%2F6dH8%2BIK0fkA%3D%3D&listYN=Y&arrange=A&contentTypeId=12&areaCode=${areaCode}&sigunguCode=&cat1=&cat2=&cat3=&_type=json`)
            .then(res => res.json())
            .then(data => {
                tourData = data.response.body.items.item || [];
                currentTourPage = 1;
                renderTourList();
            })
            .catch(err => console.error("API 요청 실패:", err));
    }

    // 맛집 API 호출 함수
    function fetchFoodsByAreaCode(areaCode) {
        fetch(`http://apis.data.go.kr/B551011/KorService1/areaBasedList1?numOfRows=12&pageNo=1&MobileOS=ETC&MobileApp=AppTest&ServiceKey=jNMekcDaMEsxF%2FUl23ffFPSb79Ejv4Ix1DFl%2BZt%2FCkU2cmglLJYvgJT40%2Fm9zbx8gXdNOvoSv7%2F6dH8%2BIK0fkA%3D%3D&listYN=Y&arrange=A&contentTypeId=39&areaCode=${areaCode}&sigunguCode=&cat1=&cat2=&cat3=&_type=json`)
            .then(res => res.json())
            .then(data => {
                foodData = data.response.body.items.item || [];
                currentFoodPage = 1;
                renderFoodList();
            })
            .catch(err => console.error("API 요청 실패:", err));
    }

    // 행사 정보 렌더링
    function renderEventList() {
        if (!eventData) return; // 또는 기본 빈 배열 할당
        const start = (currentPage - 1) * eventsPerPage;
        const end = start + eventsPerPage;
        const currentEvents = eventData.slice(start, end);

        const container = document.getElementById("eventList");
        container.innerHTML = "";

        currentEvents.forEach(event => {
            const contentId = event.contentid;
            const contentTypeId = event.contenttypeid;
            const imageUrl = event.firstimage || "/images/page/noimage.png";
            const title = event.title;
            const html = `
                <div class="col">
                    <div class="card h-100" onclick="openPopup(${contentId}, ${contentTypeId})">
                        <img src="${imageUrl}" class="card-img-top" style="height: 180px; object-fit: cover;" alt="${title}">
                        <div class="card-body p-2">
                            <h6 class="card-title mb-0 text-truncate">${title}</h6>
                        </div>
                    </div>
                </div>`;
            container.insertAdjacentHTML('beforeend', html);
        });

        document.getElementById("prevPageBtn").disabled = currentPage === 1;
        document.getElementById("nextPageBtn").disabled = end >= eventData.length;
    }

    // 관광지 정보 렌더링
    function renderTourList() {
        if (!tourData) return; // 또는 기본 빈 배열 할당
        const tourstart = (currentTourPage - 1) * tourPerPage;
        const tourend = tourstart + tourPerPage;
        const currentTour = tourData.slice(tourstart, tourend);

        const tourcontainer = document.getElementById("tourList");
        tourcontainer.innerHTML = "";

        currentTour.forEach(item => {
            const tourcontentId = item.contentid;
            const tourcontentTypeId = item.contenttypeid;
            const tourimageUrl = item.firstimage || "/images/page/noimage.png";
            const tourtitle = item.title;
            const tourhtml = `
                <div class="col">
                    <div class="card h-100" onclick="openPopup(${tourcontentId},${tourcontentTypeId})">
                        <img src="${tourimageUrl}" class="card-img-top" style="height: 180px; object-fit: cover;" alt="${tourtitle}">
                        <div class="card-body p-2">
                            <h6 class="card-title mb-0 text-truncate">${tourtitle}</h6>
                        </div>
                    </div>
                </div>`;
            tourcontainer.insertAdjacentHTML('beforeend', tourhtml);
        });

        document.getElementById("prevTourPageBtn").disabled = currentTourPage === 1;
        document.getElementById("nextTourPageBtn").disabled = tourend >= tourData.length;
    }

    // 맛집 정보 렌더링
    function renderFoodList() {
        if (!foodData) return;// 또는 기본 빈 배열 할당
        const foodstart = (currentFoodPage - 1) * foodPerPage;
        const foodend = foodstart + foodPerPage;
        const currentFood = foodData.slice(foodstart, foodend);

        const foodcontainer = document.getElementById("foodList");
        foodcontainer.innerHTML = "";
        currentFood.forEach(item => {
            const foodcontentId = item.contentid;
            const foodcontentTypeId = item.contenttypeid;
            const foodimageUrl = item.firstimage || "/images/page/noimage.png";
            const foodtitle = item.title;
            const foodhtml = `
                <div class="col">
                    <div class="card h-100" onclick="openPopup(${foodcontentId},${foodcontentTypeId})">
                        <img src="${foodimageUrl}" class="card-img-top" style="height: 180px; object-fit: cover;" alt="${foodtitle}">
                        <div class="card-body p-2">
                            <h6 class="card-title mb-0 text-truncate">${foodtitle}</h6>
                        </div>
                    </div>
                </div>`;
            foodcontainer.insertAdjacentHTML('beforeend', foodhtml);
        });

        document.getElementById("prevFoodPageBtn").disabled = currentFoodPage === 1;
        document.getElementById("nextFoodPageBtn").disabled = foodend >= foodData.length;
    }



    // "더보기" 버튼 클릭 시 areaCode + category + page=1을 URL에 포함해 이동
    document.querySelectorAll(".more-btn").forEach(button => {
        button.addEventListener("click", () => {
            const category = button.dataset.category;
            const areaCode = document.getElementById("selectedDataCode")?.dataset.code || "1"; // fallback: 서울
            const page = 1;

            const url = `/tour?areaCode=${areaCode}&category=${category}&page=${page}`;
            window.location.href = url;
        });
    });

    // 행사 페이지네이션
    document.getElementById("prevPageBtn").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderEventList();
        }
    });

    document.getElementById("nextPageBtn").addEventListener("click", () => {
        if ((currentPage * eventsPerPage) < eventData.length) {
            currentPage++;
            renderEventList();
        }
    });

    // 관광지 페이지네이션
    document.getElementById("prevTourPageBtn").addEventListener("click", () => {
        if (currentTourPage > 1) {
            currentTourPage--;
            renderTourList();
        }
    });

    document.getElementById("nextTourPageBtn").addEventListener("click", () => {
        if ((currentTourPage * tourPerPage) < tourData.length) {
            currentTourPage++;
            renderTourList();
        }
    });

    // 맛집 페이지네이션
    document.getElementById("prevFoodPageBtn").addEventListener("click", () => {
        if (currentFoodPage > 1) {
            currentFoodPage--;
            renderFoodList();
        }
    });

    document.getElementById("nextFoodPageBtn").addEventListener("click", () => {
        if ((currentFoodPage * foodPerPage) < foodData.length) {
            currentFoodPage++;
            renderFoodList();
        }
    });
});
