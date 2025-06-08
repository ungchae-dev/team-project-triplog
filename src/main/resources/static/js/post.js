// 지역별 T-TAG 데이터 (이전과 동일)
const ttagMap = {
    seoul: ["경복궁", "N서울타워", "한강공원"],
    busan: ["해운대", "광안리", "태종대"],
    jeju: ["한라산", "협재해변", "오설록"]
};

let regionSelect, ttagSelect, ttagTagsContainer, locationInput, writeForm;

// 지역별로 복수의 T-TAG를 저장하는 Map<string, Set<string>>
const selectedTags = new Map();

function initTTag() {
    regionSelect = document.getElementById('region-select');
    ttagSelect = document.getElementById('ttag-select');
    ttagTagsContainer = document.getElementById('ttag-tags');
    locationInput = document.getElementById('location-input');
    writeForm = document.getElementById('write-form');
    if (!(regionSelect && ttagSelect && ttagTagsContainer && locationInput && writeForm)) return;

    regionSelect.addEventListener('change', function() {
        const region = this.value;
        ttagSelect.innerHTML = '<option value="">T-TAG 선택</option>';
        renderSelectedTags();  // 선택 태그 리렌더
        if (!region) {
            ttagSelect.disabled = true;
            return;
        }
        ttagMap[region].forEach(ttag => {
            const opt = document.createElement('option');
            opt.value = ttag;
            opt.textContent = ttag;
            ttagSelect.appendChild(opt);
        });
        ttagSelect.disabled = false;
    });

    ttagSelect.addEventListener('change', function() {
        const regionKey = regionSelect.value;
        const ttagText = ttagSelect.options[ttagSelect.selectedIndex].text;

        if (regionKey && ttagText && ttagSelect.value) {
            addTTagHashTag(regionKey, ttagText);
        }
    });

    writeForm.addEventListener('submit', function(e) {
        if (!locationInput.value.trim()) {
            e.preventDefault();
            if (confirm('장소 입력이 없습니다.\n마이로그에 포함하지 않고 등록할까요?')) {
                writeForm.submit();
            } else {
                locationInput.focus();
                return false;
            }
        }
    });
}

function addTTagHashTag(region, tag) {
    if (!selectedTags.has(region)) {
        selectedTags.set(region, new Set());
    }
    const tagsSet = selectedTags.get(region);
    tagsSet.add(tag);
    renderSelectedTags();
}

function renderSelectedTags() {
    ttagTagsContainer.innerHTML = '';
    selectedTags.forEach((tagsSet, region) => {
        tagsSet.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.textContent = `#${tag.replace(/\s/g, '')}`;
            tagSpan.style.background = '#f0d3c0';
            tagSpan.style.padding = '3px 8px';
            tagSpan.style.borderRadius = '10px';
            tagSpan.style.fontSize = '13px';
            tagSpan.style.color = '#a86c44';
            tagSpan.style.userSelect = 'none';
            tagSpan.style.marginRight = '6px';
            ttagTagsContainer.appendChild(tagSpan);
        });
    });
}

function showBoardList() {
    document.getElementById("board-list").style.display = "block";
    document.getElementById("board-write").style.display = "none";
    document.getElementById("board-detail").style.display = "none";
}

function showWriteForm() {
    document.getElementById("board-list").style.display = "none";
    document.getElementById("board-write").style.display = "block";
    document.getElementById("board-detail").style.display = "none";
    initTTag();
}

function showDetailView() {
    document.getElementById("board-list").style.display = "none";
    document.getElementById("board-write").style.display = "none";
    document.getElementById("board-detail").style.display = "block";
}
/*
function activatePostUI() {
    let writeBtns = document.querySelectorAll('.write-btn');
    writeBtns.forEach(btn => {
        btn.onclick = showWriteForm;
    });

    let postItems = document.querySelectorAll('.post-item a');
    postItems.forEach(item => {
        item.onclick = showDetailView;
    });

    let backBtns = document.querySelectorAll('.back-btn');
    backBtns.forEach(btn => {
        btn.onclick = showBoardList;
    });

    showBoardList();
}

window.addEventListener('DOMContentLoaded', activatePostUI);
*/