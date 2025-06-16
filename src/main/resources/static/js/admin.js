document.addEventListener("DOMContentLoaded", () => {
    loadNoticeList();
    initMenuNavigation();
    initPostCommentSection();
    initNoticeEvents();
    drawAcornChartIfPresent();

    // 기본으로 '게시글/댓글 관리' 섹션 보이기 & 데이터 로드
    showSection("posts");
    loadPostCommentList();

});


// 페이지가 처음 로드될 때 공지사항 목록 불러오기
window.addEventListener('DOMContentLoaded', loadNoticeList);

/** 메뉴 탭 클릭 시 섹션 전환 및 데이터 로드 */
function initMenuNavigation() {
    document.querySelectorAll(".menu-item").forEach(item => {
        item.addEventListener("click", () => {
            const section = item.dataset.section;
            showSection(section);

            if (section === "posts") {
                loadPostCommentList();
            } else if (section === "notice") {
                loadNoticeList();
            }
        });
    });
}

/** 섹션 표시 처리 */
function showSection(section) {
    document.querySelectorAll(".admin-content").forEach(sec => (sec.style.display = "none"));
    const targetSection = document.getElementById(`section-${section}`);
    if (targetSection) targetSection.style.display = "";

    document.querySelectorAll(".menu-item").forEach(li => li.classList.remove("active"));
    const activeMenu = document.querySelector(`.menu-item[data-section="${section}"]`);
    if (activeMenu) activeMenu.classList.add("active");
}

/** 게시글/댓글 목록 tbody에 데이터 로드 */
function loadPostCommentList() {
    const tbody = document.querySelector("#noticeTable tbody");
    if (!tbody) return;

    // 예시 fetch - 실제 경로 및 데이터 구조에 맞게 수정 필요
    fetch("/admin/api/posts-comments")
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = ""; // 기존 내용 삭제

            data.forEach(item => {
                const tr = document.createElement("tr");
                tr.dataset.id = item.id;
                tr.dataset.type = item.type; // '게시글' or '댓글'

                tr.innerHTML = `
          <td>${item.id}</td>
          <td>${item.type}</td>
          <td>${item.writerId}</td>
          <td><span class="toggle-title" style="cursor:pointer; color:blue;">${item.titleOrContent || '(내용 없음)'}</span></td>
          <td>${item.createdAt}</td>
          <td><button class="delete-btn">삭제</button></td>
        `;

                const contentRow = document.createElement("tr");
                contentRow.style.display = "none";
                contentRow.innerHTML = `<td colspan="6"><div class="content-placeholder">로딩 중...</div></td>`;

                tbody.appendChild(tr);
                tbody.appendChild(contentRow);
            });
        })
        .catch(err => {
            tbody.innerHTML = `<tr><td colspan="6" style="color:red;">목록 로드 실패: ${err.message}</td></tr>`;
        });
}

/** 게시글/댓글 tbody 클릭 이벤트 (삭제, 내용 토글) */
function initPostCommentSection() {
    const tbody = document.querySelector("#noticeTable tbody");
    if (!tbody) return;

    tbody.addEventListener("click", e => {
        const target = e.target;

        // 삭제 버튼 클릭
        if (target.classList.contains("delete-btn")) {
            handleDeleteButtonClick(target);
            return;
        }

        // 제목 클릭 - 내용 토글
        if (target.classList.contains("toggle-title")) {
            handleToggleContentClick(target);
            return;
        }
    });
}

/** 게시글 삭제 처리 */
function handleDeleteButtonClick(target) {
    const tr = target.closest("tr");
    if (!tr) return;

    const id = tr.dataset.id;
    const type = tr.dataset.type;

    if (confirm("정말 삭제하시겠습니까?")) {
        fetch(`/admin/delete/${type}/${id}`, { method: "DELETE" })
            .then(res => {
                if (!res.ok) return res.text().then(t => { throw new Error(t); });
                // 삭제 성공 시 해당 게시글 + 내용 행 제거
                const nextTr = tr.nextElementSibling;
                if (nextTr) nextTr.remove();
                tr.remove();
            })
            .catch(err => alert("삭제 실패: " + err.message));
    }
}

/** 내용 토글 및 AJAX 상세내용 로드 */
function handleToggleContentClick(target) {
    const tr = target.closest("tr");
    if (!tr) return;

    const nextRow = tr.nextElementSibling;
    if (!nextRow) return;

    const contentDiv = nextRow.querySelector(".content-placeholder");
    if (!contentDiv) return;

    const isVisible = nextRow.style.display !== "none";
    nextRow.style.display = isVisible ? "none" : "";

    if (!isVisible) {
        const id = tr.dataset.id;
        const type = tr.dataset.type.toLowerCase(); // post or comment 형태로 맞춤 필요

        fetch(`/admin/api/${type}/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("상세 내용 불러오기 실패");
                return res.text();
            })
            .then(content => {
                contentDiv.innerHTML = content;
            })
            .catch(err => {
                contentDiv.innerHTML = `<span style="color:red;">내용 로드 실패: ${err.message}</span>`;
            });
    }
}

/** 공지사항 관련 초기화 */
function initNoticeEvents() {
    const noticeBtn = document.querySelector(".notice-btn");
    const modal = document.getElementById("noticeWriteModal");
    const modalForm = modal.querySelector(".modal-form");
    const closeBtn = modal.querySelector(".close-btn");

    if (!noticeBtn || !modal || !modalForm || !closeBtn) return;

    noticeBtn.addEventListener("click", () => openNoticeWriteModal());

    closeBtn.addEventListener("click", () => closeNoticeWriteModal());

    modalForm.addEventListener("submit", e => {
        e.preventDefault();
        submitNotice(modalForm);
    });
}

/** 공지사항 작성 모달 열기 */
function openNoticeWriteModal() {
    const modal = document.getElementById("noticeWriteModal");
    if (!modal) return;

    modal.style.display = "block";
    // 초기화
    modal.querySelector("#noticeId").value = "";
    modal.querySelector("#noticeTitle").value = "";
    modal.querySelector("#noticeContent").value = "";
    modal.querySelector("#noticeModalHeader").textContent = "공지사항 작성";
}

/** 공지사항 작성 모달 닫기 */
function closeNoticeWriteModal() {
    const modal = document.getElementById("noticeWriteModal");
    if (!modal) return;
    modal.style.display = "none";
}


/** 공지사항 목록 불러오기 */
function loadNoticeList() {
    const tbody = document.querySelector("#noticeTable2 tbody");
    console.log("tbody:", tbody);
    if (!tbody) return;

    // 캐시 방지를 위한 timestamp 쿼리 추가
    fetch("/admin/api/notices?ts=" + Date.now(), {
        headers: {
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
            "Expires": "0"
        }
    })
        .then(res => res.json())
        .then(data => {
            console.log("공지사항 목록 데이터:", data); // 데이터 확인용 로그
            tbody.innerHTML = ""; // 테이블 초기화
            data.forEach(item => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${item.noticeid}</td>
                    <td>${item.title}</td>
                    <td>${item.content}</td>
                    <td>${item.authorNickname}</td>
                    <td>${item.createdAt}</td>
                    <td><button class="notice-delete-btn" data-id="${item.noticeid}">삭제</button></td>
                `;
                tbody.appendChild(tr);
            });
            // 새로 생성된 삭제 버튼에 이벤트 다시 연결
            attachDeleteEvents();
        })
        .catch(err => {
            tbody.innerHTML = `<tr><td colspan="6" style="color:red;">공지사항 목록 불러오기 실패: ${err.message}</td></tr>`;
        });
}

function attachDeleteEvents() {
    document.querySelectorAll(".notice-delete-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            if (confirm("정말 삭제하시겠습니까?")) {
                fetch(`/admin/api/notices/${id}`, {
                    method: "DELETE"
                })
                    .then(res => {
                        if (res.ok) {
                            alert("삭제되었습니다");
                            setTimeout(loadNoticeList, 300); // 삭제 후 다시 로드
                        } else {
                            alert("삭제에 실패했습니다");
                        }
                    })
                    .catch(err => {
                        alert("에러 발생: " + err.message);
                    });
            }
        });
    });
}



/** 공지사항 제출 처리 */
function submitNotice(form) {
    const id = form.querySelector("#noticeId").value;
    const title = form.querySelector("#noticeTitle").value.trim();
    const content = form.querySelector("#noticeContent").value.trim();


    if (!title || !content) {
        alert("제목과 내용을 모두 입력해주세요.");
        return;
    }

    // POST 또는 PUT 구분 예시 - 실제 API에 맞게 변경 필요
    const method = id ? "PUT" : "POST";
    const url = id ? `/admin/api/notices/${id}` : "/admin/api/notices";

    fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: title,
            content: content,
            authorNickname: currentUserNickname}),
    })
        .then(res => {
            if (!res.ok) return res.text().then(t => { throw new Error(t); });
            alert("공지사항이 성공적으로 저장되었습니다.");
            closeNoticeWriteModal();
            loadNoticeList();
        })
        .catch(err => alert("공지사항 저장 실패: " + err.message));
}

/** 도토리 구매 통계 차트 그리기 */
function drawAcornChartIfPresent() {
    const canvas = document.getElementById("acornChart");
    if (!canvas) return;

    // 예시 데이터 및 차트 그리기 - 실제 데이터 API 호출 등 구현 필요
    const ctx = canvas.getContext("2d");
    const chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["1월", "2월", "3월", "4월", "5월", "6월"],
            datasets: [{
                label: "도토리 구매량",
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: "rgba(75, 192, 192, 0.6)"
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}