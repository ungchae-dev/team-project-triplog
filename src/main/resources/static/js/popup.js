document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const contentId = params.get("contentId");
    const contentTypeId = params.get("contentTypeId");

    if (!contentId || !contentTypeId) {
        document.body.innerHTML = "<p>잘못된 접근입니다.</p>";
        return;
    }

    const serviceKey = "WE8zMSHqcnIgkNM8%2BArCN71r3exZEj%2FG4cPNj9NW8bb4quc1fmi2oxTpPF1C1aWmDl%2FXeAWBqQO6XMjJlShceg%3D%3D"; // 본인의 TourAPI 인증키로 교체하세요

    // ▶ 기본 정보 요청
    const baseUrl = `https://apis.data.go.kr/B551011/KorService1/detailCommon1`;
    const baseQuery = `ServiceKey=${serviceKey}&contentTypeId=${contentTypeId}&contentId=${contentId}&MobileOS=ETC&MobileApp=Triplog&defaultYN=Y&overviewYN=Y&firstImageYN=Y&_type=json`;

    fetch(`${baseUrl}?${baseQuery}`)
        .then(res => res.json())
        .then(json => {
            const item = json.response.body.items.item[0];

            renderBaseInfo(item);
            fetchIntroDetails(contentId, contentTypeId, serviceKey);
        })
        .catch(err => {
            console.error("기본 정보 불러오기 실패:", err);
            document.body.innerHTML = "<p>상세 정보를 불러오는 데 실패했습니다.</p>";
        });
});

function renderBaseInfo(item) {
    const title = document.getElementById("title");
    const image = document.getElementById("image");
    const overview = document.getElementById("overview");

    title.innerText = item.title || "제목 없음";
    overview.innerText = item.overview || "설명 정보가 없습니다.";

    if (item.firstimage) {
        image.src = item.firstimage;
        image.classList.remove("d-none");
    }
}

function fetchIntroDetails(contentId, contentTypeId, serviceKey) {
    const introUrl = `https://apis.data.go.kr/B551011/KorService1/detailIntro1?ServiceKey=${serviceKey}&contentTypeId=${contentTypeId}&contentId=${contentId}&MobileOS=ETC&MobileApp=Triplog&_type=json`;

    fetch(introUrl)
        .then(res => res.json())
        .then(json => {
            const item = json.response.body.items.item[0];
            renderIntroDetails(item);
        })
        .catch(err => {
            console.error("추가 정보 로드 실패:", err);
        });
}

function renderIntroDetails(item) {
    const container = document.getElementById("extra-info");
    const title = document.createElement("h5");
    title.innerText = "상세 정보";
    container.appendChild(title);

    const list = document.createElement("ul");
    list.className = "list-group";

    for (const key in item) {
        if (item[key]) {
            const label = convertLabel(key);
            const value = item[key];
            const li = document.createElement("li");
            li.className = "list-group-item";
            li.innerHTML = `<strong>${label}</strong>: ${value}`;
            list.appendChild(li);
        }
    }

    container.appendChild(list);
}

// 사용자 친화적인 라벨로 변환
function convertLabel(key) {
    const map = {
        eventstartdate: "행사 시작일",
        eventenddate: "행사 종료일",
        playtime: "공연 시간",
        usetimefestival: "이용 시간",
        subevent: "부대 행사",
        bookingplace: "예약 정보",
        agelimit: "관람 가능 연령",
        distance: "거리",
        schedule: "소요 시간",
        accomcountlodging: "수용 인원",
        checkintime: "체크인",
        checkouttime: "체크아웃",
        infocenterfood: "문의처",
        opentimefood: "영업 시간",
        restdatefestival: "쉬는 날",
        treatmenu: "대표 메뉴",
        packing: "포장 가능 여부",
        parkingfood: "주차 가능 여부",
        tel: "전화번호",
        homepage: "홈페이지"
    };
    return map[key] || key;
}
