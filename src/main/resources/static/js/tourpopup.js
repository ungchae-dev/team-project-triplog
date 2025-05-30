const serviceKey = 'jNMekcDaMEsxF%2FUl23ffFPSb79Ejv4Ix1DFl%2BZt%2FCkU2cmglLJYvgJT40%2Fm9zbx8gXdNOvoSv7%2F6dH8%2BIK0fkA%3D%3D';

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const contentId = params.get("contentId");

    if (!contentId) {
        alert("유효하지 않은 콘텐츠 ID입니다.");
        return;
    }

    const url = `https://apis.data.go.kr/B551011/KorService1/detailCommon1?serviceKey=${serviceKey}&MobileOS=ETC&MobileApp=Triplog&contentId=${contentId}&defaultYN=Y&overviewYN=Y&_type=json`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const item = data.response.body.items.item;
            document.getElementById("popup-title").textContent = item.title || "제목 없음";
            document.getElementById("popup-image").src = item.firstimage || "default-image.jpg";
            document.getElementById("popup-addr").textContent = item.addr1 || "주소 정보 없음";
            document.getElementById("popup-tel").textContent = item.tel || "전화번호 없음";
            document.getElementById("popup-desc").textContent = item.overview || "설명 없음";
        })
        .catch(err => {
            console.error("상세 정보 로드 실패:", err);
            alert("상세 정보를 불러오는 데 실패했습니다.");
        });
});
