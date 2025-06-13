document.addEventListener("DOMContentLoaded", function () {
    // 게시글 + 댓글 리스트 렌더링
    fetch("/admin/posts-comments")
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("adminPostCommentBody");
            tbody.innerHTML = "";
            data.forEach((item) => {
                const tr = document.createElement("tr");
                tr.setAttribute("data-id", item.id);
                tr.setAttribute("data-type", item.type);

                tr.innerHTML = `
                    <td>${item.id}</td>
                    <td>${item.type}</td>
                    <td>${item.writerId}</td>
                    <td><span class="toggle-title">${item.titleOrContent}</span></td>
                    <td>${item.createdAt.replace("T", " ").slice(0, 16)}</td>
                    <td><button class="delete-btn">삭제</button></td>
                `;

                const contentRow = document.createElement("tr");
                contentRow.classList.add("content-row");
                contentRow.style.display = "none";
                contentRow.innerHTML = `<td colspan="6"><div class="content-placeholder">불러오는 중...</div></td>`;

                tbody.appendChild(tr);
                tbody.appendChild(contentRow);
            });
        });

    // 게시글/댓글 테이블 이벤트 위임
    document.getElementById("adminPostCommentBody").addEventListener("click", function (e) {
        const target = e.target;

        if (target.classList.contains("delete-btn")) {
            const tr = target.closest("tr");
            const id = tr.getAttribute("data-id");
            const type = tr.getAttribute("data-type");

            if (confirm("정말로 삭제하시겠습니까?")) {
                fetch(`/admin/delete/${type}/${id}`, { method: "DELETE" })
                    .then(response => {
                        if (!response.ok) {
                            return response.text().then(msg => { throw new Error(msg); });
                        }
                        tr.nextElementSibling.remove();
                        tr.remove();
                    })
                    .catch(err => alert(err.message));
            }
        }

        if (target.classList.contains("toggle-title")) {
            const tr = target.closest("tr");
            const nextRow = tr.nextElementSibling;
            nextRow.style.display = nextRow.style.display === "none" ? "" : "none";

            if (nextRow.style.display === "") {
                const id = tr.getAttribute("data-id");
                const type = tr.getAttribute("data-type");
                const placeholder = nextRow.querySelector(".content-placeholder");

                fetch(`/admin/api/${type === "게시글" ? "post" : "comment"}/${id}`)
                    .then(res => res.text())
                    .then(content => {
                        placeholder.innerHTML = content;
                    });
            }
        }
    });

    // 사이드 메뉴 클릭 시 섹션 전환
    document.querySelectorAll(".menu-item").forEach((item) => {
        item.addEventListener("click", () => {
            const section = item.dataset.section;
            document.querySelectorAll(".admin-content").forEach(sec => sec.style.display = "none");
            document.getElementById(`section-${section}`).style.display = "";
            document.querySelectorAll(".menu-item").forEach(li => li.classList.remove("active"));
            item.classList.add("active");

            if (section === "notice") {
                loadNoticeList();
            }
        });
    });

    // 공지 작성 버튼
    document.querySelector(".notice-btn").addEventListener("click", () => openNoticeWriteModal(false));

    // 공지사항 수정/삭제 버튼 위임
    document.getElementById("noticeTable").addEventListener("click", function (e) {
        const btn = e.target;
        const row = btn.closest("tr");

        if (btn.classList.contains("edit-btn")) {
            document.getElementById("noticeId").value = row.dataset.id;
            document.getElementById("noticeTitle").value = row.cells[1].textContent;
            document.getElementById("noticeContent").value = row.cells[2].textContent;
            openNoticeWriteModal(true);
        }

        if (btn.classList.contains("delete-btn")) {
            const id = row.dataset.id;
            if (confirm("정말로 삭제하시겠습니까?")) {
                fetch(`/admin/api/notice/${id}`, { method: "DELETE" })
                    .then(res => {
                        if (res.ok) {
                            row.remove();
                            renumberNoticeRows();
                        } else {
                            alert("삭제 실패");
                        }
                    });
            }
        }
    });

    // 공지사항 등록/수정 폼 이벤트
    document.querySelector(".modal-form").addEventListener("submit", function (e) {
        e.preventDefault();
        submitNotice();
    });

    // 모달 닫기 버튼
    document.querySelector(".close-btn").addEventListener("click", closeNoticeWriteModal);

    // 도토리 통계 차트
    drawAcornChart();
});

// 공지사항 목록 로딩
function loadNoticeList() {
    fetch("/admin/api/notice")
        .then(res => res.json())
        .then(notices => {
            const tbody = document.querySelector("#noticeTable tbody");
            tbody.innerHTML = "";
            notices.forEach((notice, idx) => {
                const tr = document.createElement("tr");
                tr.dataset.id = notice.id;
                tr.innerHTML = `
                    <td>${idx + 1}</td>
                    <td>${notice.noticetitle}</td>
                    <td>${notice.noticecontent}</td>
                    <td>${notice.authorNickname}</td>
                    <td>${notice.createdAt.replace("T", " ").slice(0, 16)}</td>
                    <td>
                        <button class="edit-btn">수정</button>
                        <button class="delete-btn">삭제</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        });
}

// 공지사항 등록/수정
function submitNotice() {
    const id = document.getElementById('noticeId').value;
    const title = document.getElementById('noticeTitle').value;
    const content = document.getElementById('noticeContent').value;

    const payload = {
        title: title,
        content: content,
        authorNickname: currentUserNickname

    };

    const url = id ? `/admin/api/notice/${id}` : `/admin/api/notice`;
    const method = id ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(res => {
            if (res.ok) {
                alert(id ? '공지사항 수정 완료' : '공지사항 등록 완료');
                closeNoticeWriteModal();
                loadNoticeList();
            } else {
                alert('처리 실패');
            }
        });
}

// 행 번호 다시 매기기
function renumberNoticeRows() {
    const rows = document.querySelector("#noticeTable tbody").rows;
    Array.from(rows).forEach((row, idx) => {
        row.cells[0].textContent = idx + 1;
    });
}

// --- 공지사항 모달 함수들 ---
function openNoticeWriteModal(isEdit) {
    document.getElementById('noticeModalHeader').textContent = isEdit ? '공지사항 수정' : '공지사항 작성';
    if (!isEdit) {
        document.getElementById('noticeId').value = '';
        document.getElementById('noticeTitle').value = '';
        document.getElementById('noticeContent').value = '';
    }
    document.getElementById('noticeWriteModal').style.display = 'flex';
}

function closeNoticeWriteModal() {
    document.getElementById('noticeWriteModal').style.display = 'none';
}

// --- 도토리 차트 함수 ---
function drawAcornChart() {
    const ctx = document.getElementById("acornChart").getContext("2d");
    const months = ['2025-02', '2025-03', '2025-04', '2025-05', '2025-06'];
    const purchaseCounts = [150000, 210000, 580000, 250000, 730000];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: '도토리 구매량',
                data: purchaseCounts,
                backgroundColor: 'rgba(68, 82, 250, 0.7)',
                borderRadius: 6,
                barPercentage: 0.6,
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    min: 0,
                    max: 800000,
                    title: { display: true, text: '구매량' },
                    ticks: {
                        callback: value => value === 0 ? '0' : value === 800000 ? '80만' : (value / 10000) + '만'
                    }
                },
                x: {
                    title: { display: true, text: '월' }
                }
            }
        }
    });
}
