document.addEventListener("DOMContentLoaded", function () {
    let selectedAreaCode = "1"; // 기본값: 서울
    let selectedAreaName = "서울";
    let tourPage = 1, foodPage = 1;
    const itemsPerPage = 4;
    let tourData = [], foodData = [];


    //지역 이름 UI 초기 설정
    const selectedNameElem = document.getElementById("selectedRegionName");
    if (selectedNameElem) selectedNameElem.innerText = selectedAreaName;


    //초기 진입 시 관광지/맛집 데이터도 로딩
    loadTourData(selectedAreaCode);
    loadFoodData(selectedAreaCode);



    //지역 변경 시 이벤트 리스너 등록 (예: 지역 버튼 클릭)
    document.querySelectorAll(".region-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            selectedAreaCode = this.dataset.code;
            selectedAreaName = this.innerText;

            // UI 반영
            if (selectedNameElem) selectedNameElem.innerText = selectedAreaName;

            //데이터 재로딩

            loadTourData(selectedAreaCode);
            loadFoodData(selectedAreaCode);
        });
    });

    // 관광지 데이터 호출
    function loadTourData(areaCode) {
        fetch(`http://apis.data.go.kr/B551011/KorService1/areaBasedList1?numOfRows=12&pageNo=1&MobileOS=ETC&MobileApp=AppTest&ServiceKey=WE8zMSHqcnIgkNM8%2BArCN71r3exZEj%2FG4cPNj9NW8bb4quc1fmi2oxTpPF1C1aWmDl%2FXeAWBqQO6XMjJlShceg%3D%3D&listYN=Y&arrange=A&contentTypeId=12&areaCode=${areaCode}&sigunguCode=&cat1=&cat2=&cat3=`)
            .then(res => res.json())
            .then(data => {
                tourData = data.response.body.items.item || [];
                tourPage = 1;
                renderTourList();
            });
    }

    function renderTourList() {
        const start = (tourPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const currentItems = tourData.slice(start, end);

        const container = document.getElementById("tourList");
        container.innerHTML = "";
        currentItems.forEach(item => {
            const image = item.firstimage || "../images/page/noimage.png";
            const title = item.title;
            container.innerHTML += `
        <div class="col">
          <div class="card h-100">
            <img src="${image}" class="card-img-top" style="height:160px; object-fit:cover;" alt="${title}">
            <div class="card-body p-2">
              <p class="card-title mb-0 text-truncate">${title}</p>
            </div>
          </div>
        </div>`;
        });

        document.getElementById("prevTourPageBtn").disabled = tourPage === 1;
        document.getElementById("nextTourPageBtn").disabled = end >= tourData.length;
    }

    document.getElementById("prevTourPageBtn").addEventListener("click", () => {
        if (tourPage > 1) {
            tourPage--;
            renderTourList();
        }
    });

    document.getElementById("nextTourPageBtn").addEventListener("click", () => {
        if (tourPage * itemsPerPage < tourData.length) {
            tourPage++;
            renderTourList();
        }
    });

    // 맛집 데이터 호출
    function loadFoodData(areaCode) {
        fetch(`http://apis.data.go.kr/B551011/KorService1/areaBasedList1?numOfRows=12&pageNo=1&MobileOS=ETC&MobileApp=AppTest&ServiceKey=WE8zMSHqcnIgkNM8%2BArCN71r3exZEj%2FG4cPNj9NW8bb4quc1fmi2oxTpPF1C1aWmDl%2FXeAWBqQO6XMjJlShceg%3D%3D&listYN=Y&arrange=A&contentTypeId=39&areaCode=${areaCode}&sigunguCode=&cat1=&cat2=&cat3=`)
            .then(res => res.json())
            .then(data => {
                foodData = data.response.body.items.item || [];
                foodPage = 1;
                renderFoodList();
            });
    }

    function renderFoodList() {
        const start = (foodPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const currentItems = foodData.slice(start, end);

        const container = document.getElementById("foodList");
        container.innerHTML = "";
        currentItems.forEach(item => {
            const image = item.firstimage || "../images/page/noimage.png";
            const title = item.title;
            container.innerHTML += `
        <div class="col">
          <div class="card h-100">
            <img src="${image}" class="card-img-top" style="height:160px; object-fit:cover;" alt="${title}">
            <div class="card-body p-2">
              <p class="card-title mb-0 text-truncate">${title}</p>
            </div>
          </div>
        </div>`;
        });

        document.getElementById("prevFoodPageBtn").disabled = foodPage === 1;
        document.getElementById("nextFoodPageBtn").disabled = end >= foodData.length;
    }

    document.getElementById("prevFoodPageBtn").addEventListener("click", () => {
        if (foodPage > 1) {
            foodPage--;
            renderFoodList();
        }
    });

    document.getElementById("nextFoodPageBtn").addEventListener("click", () => {
        if (foodPage * itemsPerPage < foodData.length) {
            foodPage++;
            renderFoodList();
        }
    });


});
