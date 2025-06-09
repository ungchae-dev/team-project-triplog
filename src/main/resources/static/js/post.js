// post.js : 여행 블로그 - 게시판 페이지 전용 기능

// 더미 게시글 데이터 (기존 5개 + 새로운 7개 = 총 12개)
const dummyPosts = {
    1: {
        title: "일본 도쿄 스카이트리 여행기",
        author: "닉네임",
        date: "2025.05.04",
        content: `도쿄의 스카이트리에서 본 야경이 정말 멋졌어요! 🌃
        
높이 634m의 세계에서 두 번째로 높은 전파탑에서 바라본 도쿄의 모습은 정말 장관이었습니다.

특히 해질녘부터 밤까지의 시간대가 가장 아름다웠는데, 도쿠의 불빛들이 하나둘씩 켜지면서 마치 보석상자 같은 모습을 연출했어요.

전망대에서 보는 도쿄타워와 레인보우 브릿지의 모습도 인상적이었습니다.`,
        tags: "#친구 #관광 #스카이트리 #도쿄야경",
        likes: 20,
        comments: [
            { author: "나나", content: "너무 멋져요!", replies: [
                { author: "닉네임", content: "감사합니다 😊" }
            ]},
            { author: "여행러버", content: "저도 가보고 싶어요!" },
            { author: "도쿄여행자", content: "야경이 정말 예쁘죠~" }
        ]
    },
    2: {
        title: "제주도 한라산 등반 후기",
        author: "등산러버",
        date: "2025.05.03",
        content: `한라산 정상에서 보는 일출은 정말 장관이었습니다! 🌅

새벽 4시에 출발해서 6시간 정도 등반했는데, 힘들었지만 정상에서 본 풍경은 모든 피로를 날려주었어요.

특히 백록담에서 보는 일출은 평생 잊지 못할 추억이 될 것 같습니다.

등반 코스는 성판악 코스를 이용했는데, 초보자도 충분히 오를 수 있는 코스였어요.`,
        tags: "#나홀로 #등산 #한라산 #일출",
        likes: 15,
        comments: [
            { author: "산악회장", content: "대단하세요! 저도 도전해봐야겠어요" },
            { author: "제주도민", content: "한라산 일출은 정말 아름답죠!" }
        ]
    },
    3: {
        title: "부산 해운대 맛집 투어",
        author: "맛집헌터",
        date: "2025.05.02",
        content: `해운대에서 먹은 회와 밀면이 너무 맛있었어요! 🍜

특히 해운대 해변가에 있는 횟집에서 먹은 광어회는 정말 신선하고 달콤했습니다.

그리고 부산의 대표 음식인 밀면도 빼놓을 수 없죠! 시원하고 깔끔한 육수가 일품이었어요.

디저트로는 호떡과 씨앗호떡을 먹었는데, 겉은 바삭하고 속은 달콤해서 완벽했습니다.`,
        tags: "#친구 #맛집 #해운대 #부산여행",
        likes: 25,
        comments: [
            { author: "부산토박이", content: "맛집을 잘 찾으셨네요!" },
            { author: "먹방러버", content: "저도 그 횟집 가봤는데 정말 맛있어요" },
            { author: "여행중독자", content: "다음에 부산 가면 꼭 들러봐야겠어요" }
        ]
    },
    4: {
        title: "경주 역사 유적지 탐방",
        author: "역사여행자",
        date: "2025.05.01",
        content: `불국사와 석굴암에서 느낀 천년의 역사... 🏛️

신라 천년의 수도 경주에서 우리나라의 찬란한 문화유산을 직접 볼 수 있어서 정말 의미있는 여행이었습니다.

불국사의 다보탑과 석가탑은 정말 아름다웠고, 석굴암의 본존불상은 숨이 멎을 정도로 장엄했어요.

첨성대에서 바라본 경주의 전경도 인상적이었습니다.`,
        tags: "#부모님과 #역사 #경주 #문화유산",
        likes: 12,
        comments: [
            { author: "역사선생님", content: "교육적 가치가 높은 여행이네요!" },
            { author: "경주시민", content: "경주에 와주셔서 감사해요~" }
        ]
    },
    5: {
        title: "강릉 카페 거리 힐링 여행",
        author: "카페투어",
        date: "2025.04.30",
        content: `강릉의 예쁜 카페들과 바다 풍경이 힐링되었어요... ☕

안목해변 카페거리에서 바다를 바라보며 마신 커피는 정말 특별했습니다.

특히 손님이 직접 로스팅한 원두로 내린 커피는 향과 맛이 일품이었어요.

카페에서 바라본 일출 풍경도 잊을 수 없는 추억이 되었습니다.`,
        tags: "#커플 #카페 #강릉 #힐링",
        likes: 18,
        comments: [
            { author: "커피애호가", content: "강릉 커피 정말 유명하죠!" },
            { author: "바다러버", content: "바다 보며 마시는 커피는 정말 특별해요" },
            { author: "힐링여행자", content: "저도 힐링하러 가고 싶어요" }
        ]
    },
    // 🔥 새로 추가된 7개 게시글
    6: {
        title: "여수 밤바다 야경 크루즈",
        author: "바다여행자",
        date: "2025.04.29",
        content: `여수 밤바다에서 즐긴 야경 크루즈가 환상적이었어요! 🚢

특히 돌산대교와 여수 엑스포 해상공원의 야경이 정말 아름다웠습니다.

크루즈에서 바라본 여수 시내의 불빛들은 마치 보석처럼 반짝였어요.

바다 위에서 느끼는 시원한 바람과 함께 로맨틱한 시간을 보낼 수 있었습니다.`,
        tags: "#커플 #야경 #여수 #크루즈",
        likes: 22,
        comments: [
            { author: "로맨티스트", content: "정말 로맨틱하네요!" },
            { author: "여수토박이", content: "우리 동네 자랑이에요~" }
        ]
    },
    7: {
        title: "속초 동명항 활어회 맛집",
        author: "회덕후",
        date: "2025.04.28",
        content: `속초 동명항에서 먹은 물회와 활어회가 정말 신선했어요! 🐟

특히 방금 잡은 싱싱한 오징어와 광어회는 입에서 녹을 정도였습니다.

물회의 시원한 육수와 쫄깃한 회의 조합이 완벽했어요.

바닷가에서 먹는 회라 그런지 더욱 맛있게 느껴졌습니다.`,
        tags: "#친구 #맛집 #속초 #회",
        likes: 28,
        comments: [
            { author: "횟집사장", content: "맛있게 드셨나 보네요!" },
            { author: "속초사랑", content: "동명항 회는 정말 최고죠!" }
        ]
    },
    8: {
        title: "전주 한옥마을 전통 체험",
        author: "전통문화",
        date: "2025.04.27",
        content: `전주 한옥마을에서 한복을 입고 전통문화를 체험했어요! 👘

한복 대여점에서 예쁜 한복을 입고 한옥마을을 걸어다니니 조선시대로 돌아간 기분이었습니다.

전통차를 마시며 한지 만들기 체험도 했는데 정말 재미있었어요.

비빔밥과 콩나물국밥도 맛있었고, 전주의 맛과 멋을 모두 느낄 수 있었습니다.`,
        tags: "#가족 #전통문화 #전주 #한복체험",
        likes: 16,
        comments: [
            { author: "한복러버", content: "한복이 정말 잘 어울리세요!" },
            { author: "전주시민", content: "전주에 와주셔서 감사해요" }
        ]
    },
    9: {
        title: "설악산 단풍 명소 탐방",
        author: "단풍헌터",
        date: "2025.04.26",
        content: `설악산의 가을 단풍이 정말 장관이었어요! 🍂

케이블카를 타고 권금성까지 올라가는 길에 보이는 단풍들이 너무 아름다웠습니다.

특히 울산바위 주변의 단풍은 마치 자연이 그린 그림 같았어요.

신흥사에서 바라본 단풍 풍경도 정말 인상적이었습니다.`,
        tags: "#나홀로 #등산 #설악산 #단풍",
        likes: 19,
        comments: [
            { author: "등산매니아", content: "설악산 단풍은 정말 최고죠!" },
            { author: "사진작가", content: "사진 찍기 좋은 명소네요" }
        ]
    },
    10: {
        title: "통영 케이블카 & 한려수도",
        author: "섬여행러",
        date: "2025.04.25",
        content: `통영 케이블카에서 내려다본 한려수도가 정말 멋졌어요! 🏝️

미륵산 정상에서 바라본 통영의 섬들과 푸른 바다는 숨이 멎을 정도로 아름다웠습니다.

특히 해질녘의 풍경은 마치 한 폭의 그림 같았어요.

동피랑 벽화마을도 귀엽고 예뻤고, 충무김밥도 맛있었습니다.`,
        tags: "#커플 #케이블카 #통영 #한려수도",
        likes: 24,
        comments: [
            { author: "바다러버", content: "한려수도 정말 아름답죠!" },
            { author: "통영토박이", content: "우리 동네를 좋게 봐주셔서 감사해요" }
        ]
    },
    11: {
        title: "남해 독일마을 이국적 풍경",
        author: "유럽풍여행",
        date: "2025.04.24",
        content: `남해 독일마을의 이국적인 풍경이 정말 신기했어요! 🏰

마치 독일에 온 것 같은 분위기의 건물들과 예쁜 정원들이 인상적이었습니다.

특히 마을 전망대에서 바라본 남해의 푸른 바다와 독일풍 건물들의 조화가 환상적이었어요.

독일 전통 음식도 맛볼 수 있어서 색다른 경험이었습니다.`,
        tags: "#가족 #이국풍 #남해 #독일마을",
        likes: 21,
        comments: [
            { author: "건축러버", content: "독일 건축 양식이 정말 예뻐요!" },
            { author: "남해여행자", content: "남해에 이런 곳이 있다니 신기하네요" }
        ]
    },
    12: {
        title: "양평 두물머리 일출 명소",
        author: "일출사냥꾼",
        date: "2025.04.23",
        content: `양평 두물머리에서 본 일출이 정말 감동적이었어요! 🌅

새벽 5시에 도착해서 기다린 보람이 있었습니다.

한강과 남한강이 만나는 지점에서 떠오르는 태양은 정말 장관이었어요.

400년 된 느티나무와 함께 보는 일출 풍경은 평생 잊지 못할 추억이 될 것 같습니다.`,
        tags: "#나홀로 #일출 #양평 #두물머리",
        likes: 17,
        comments: [
            { author: "사진작가", content: "일출 사진 정말 예쁘게 나왔겠어요!" },
            { author: "양평러버", content: "두물머리는 정말 명소죠!" }
        ]
    }
};

// 지역별 T-TAG 데이터 (이전과 동일)
const ttagMap = {
    seoul: ["경복궁", "N서울타워", "한강공원"],
    busan: ["해운대", "광안리", "태종대"],
    jeju: ["한라산", "협재해변", "오설록"]
};

let regionSelect, ttagSelect, ttagTagsContainer, locationInput, writeForm;

// 지역별로 복수의 T-TAG를 저장하는 Map<string, Set<string>>
const selectedTags = new Map();

// 🔥 페이징 관련 변수들
let currentPage = 1;
let postsPerPage = 5; // 기본값 5개씩
let currentSort = 'latest'; // 기본값 최신순

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

// 🔥 게시글 정렬 함수
function sortPosts(sortType) {
    const posts = Object.values(dummyPosts);
    
    switch(sortType) {
        case 'latest':
            return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        case 'likes':
            return posts.sort((a, b) => b.likes - a.likes);
        case 'comments':
            return posts.sort((a, b) => b.comments.length - a.comments.length);
        default:
            return posts;
    }
}

// 🔥 페이지별 게시글 가져오기
function getPostsForPage(page, perPage, sortType) {
    const sortedPosts = sortPosts(sortType);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    return sortedPosts.slice(startIndex, endIndex);
}

// 🔥 총 페이지 수 계산
function getTotalPages() {
    return Math.ceil(Object.keys(dummyPosts).length / postsPerPage);
}

// 🔥 게시글 목록 렌더링
function renderPostList() {
    const postList = document.querySelector('.post-list');
    const postsToShow = getPostsForPage(currentPage, postsPerPage, currentSort);
    
    postList.innerHTML = '';
    
    postsToShow.forEach((post, index) => {
        const postId = Object.keys(dummyPosts).find(key => dummyPosts[key] === post);
        const li = document.createElement('li');
        li.className = 'post-item';
        li.setAttribute('data-post-id', postId);
        
        li.innerHTML = `
            <a href="javascript:void(0)" onclick="showPostDetail(${postId})">
                <h3>${post.title}</h3>
                <p class="preview">${post.content.substring(0, 50)}...</p>
                <div class="meta">
                    <span>by ${post.author}</span>
                    <span>${post.date}</span>
                    <span>❤️ ${post.likes}</span>
                    <span>💬 ${post.comments.length}</span>
                </div>
            </a>
        `;
        
        postList.appendChild(li);
    });
    
    renderPagination();
}

// 🔥 페이지네이션 렌더링
function renderPagination() {
    const pagination = document.querySelector('.pagination');
    const totalPages = getTotalPages();
    
    pagination.innerHTML = '';
    
    // 이전 버튼
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '이전';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderPostList();
        }
    };
    pagination.appendChild(prevBtn);
    
    // 페이지 번호 버튼들
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = i === currentPage ? 'active' : '';
        pageBtn.onclick = () => {
            currentPage = i;
            renderPostList();
        };
        pagination.appendChild(pageBtn);
    }
    
    // 다음 버튼
    const nextBtn = document.createElement('button');
    nextBtn.textContent = '다음';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPostList();
        }
    };
    pagination.appendChild(nextBtn);
}

// 🔥 페이지 사이즈 변경
function changePageSize(newSize) {
    postsPerPage = newSize;
    currentPage = 1; // 첫 페이지로 리셋
    renderPostList();
    
    // 드롭다운 버튼 텍스트 업데이트
    const dropdownBtn = document.querySelector('.page-size-dropdown .dropdown-btn');
    if (dropdownBtn) {
        dropdownBtn.textContent = `${newSize}개씩`;
    }
}

// 🔥 정렬 방식 변경
function changeSortType(sortType) {
    currentSort = sortType;
    currentPage = 1; // 첫 페이지로 리셋
    renderPostList();
}

// 게시글 상세보기 표시
function showPostDetail(postId) {
    const post = dummyPosts[postId];
    if (!post) {
        console.error('게시글을 찾을 수 없습니다:', postId);
        return;
    }

    // 상세보기 데이터 설정
    document.getElementById('detail-title').textContent = post.title;
    document.getElementById('detail-author').textContent = post.author;
    document.getElementById('detail-date').textContent = post.date;
    document.getElementById('detail-content').innerHTML = post.content.replace(/\n/g, '<br>');
    document.getElementById('detail-tags').textContent = post.tags;
    document.getElementById('detail-likes').textContent = post.likes;
    document.getElementById('detail-comments-count').textContent = post.comments.length;

    // 댓글 렌더링
    renderComments(post.comments);

    // 선택된 게시글 하이라이트
    document.querySelectorAll('.post-item').forEach(item => {
        item.classList.remove('selected');
    });
    const selectedPost = document.querySelector(`[data-post-id="${postId}"]`);
    if (selectedPost) {
        selectedPost.classList.add('selected');
    }

    // 상세보기 표시
    document.getElementById('board-detail').style.display = 'block';
    
    // 스크롤
    document.getElementById('board-detail').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });

    console.log('게시글 상세보기 표시:', post.title);
}

// 스크롤 없이 상세보기만 표시하는 함수
function showPostDetailWithoutScroll(postId) {
    const post = dummyPosts[postId];
    if (!post) {
        console.error('게시글을 찾을 수 없습니다:', postId);
        return;
    }

    // 상세보기 데이터 설정 (기존과 동일)
    document.getElementById('detail-title').textContent = post.title;
    document.getElementById('detail-author').textContent = post.author;
    document.getElementById('detail-date').textContent = post.date;
    document.getElementById('detail-content').innerHTML = post.content.replace(/\n/g, '<br>');
    document.getElementById('detail-tags').textContent = post.tags;
    document.getElementById('detail-likes').textContent = post.likes;
    document.getElementById('detail-comments-count').textContent = post.comments.length;

    // 댓글 렌더링
    renderComments(post.comments);

    // 선택된 게시글 하이라이트
    document.querySelectorAll('.post-item').forEach(item => {
        item.classList.remove('selected');
    });
    const selectedPost = document.querySelector(`[data-post-id="${postId}"]`);
    if (selectedPost) {
        selectedPost.classList.add('selected');
    }

    // 🔥 중요! 스크롤 없이 상세보기만 표시
    document.getElementById('board-detail').style.display = 'block';
    // scrollIntoView() 부분 제거!

    console.log('게시글 상세보기 표시 (스크롤 없음):', post.title);
}

// 댓글 렌더링
function renderComments(comments) {
    const commentsList = document.getElementById('detail-comments');
    commentsList.innerHTML = '';

    comments.forEach(comment => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><strong>${comment.author}</strong>: ${comment.content}</span>
            <button onclick="likeComment(this)" style="background:none;border:none;cursor:pointer;">❤️</button>
            <button onclick="showReplyForm(this)" style="background:none;border:none;cursor:pointer;color:#b865a4;">답글</button>
        `;
        commentsList.appendChild(li);

        // 답글이 있으면 렌더링
        if (comment.replies) {
            comment.replies.forEach(reply => {
                const replyLi = document.createElement('li');
                replyLi.className = 'reply';
                replyLi.innerHTML = `<span><strong>${reply.author}</strong>: ${reply.content}</span>`;
                commentsList.appendChild(replyLi);
            });
        }
    });
}

// 댓글 좋아요
function likeComment(button) {
    // 간단한 좋아요 효과
    button.style.color = '#ff6b6b';
    setTimeout(() => {
        button.style.color = '';
    }, 1000);
}

// 답글 폼 표시 (간단한 프롬프트로 구현)
function showReplyForm(button) {
    const reply = prompt('답글을 입력하세요:');
    if (reply && reply.trim()) {
        alert('답글이 등록되었습니다: ' + reply);
        // 실제로는 여기서 서버에 답글을 저장하고 화면을 업데이트
    }
}

// 게시글 상세보기 숨기기
function hidePostDetail() {
    document.getElementById('board-detail').style.display = 'none';
    
    // 하이라이트 제거
    document.querySelectorAll('.post-item').forEach(item => {
        item.classList.remove('selected');
    });

    // 게시글 목록으로 스크롤
    document.getElementById('board-list').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });

    console.log('게시글 상세보기 숨김');
}

function showBoardList() {
    document.getElementById("board-list").style.display = "block";
    document.getElementById("board-write").style.display = "none";
    
    // 페이지 전체 최상단으로 즉시 이동
    window.scrollTo(0, 0);
    
    // 목록 렌더링
    renderPostList();
    
    // 첫 번째 게시글 자동 선택 (스크롤 없이)
    setTimeout(() => {
        const firstPost = getPostsForPage(1, postsPerPage, currentSort)[0];
        if (firstPost) {
            const firstPostId = Object.keys(dummyPosts).find(key => dummyPosts[key] === firstPost);
            // 스크롤 없는 버전 필요
            showPostDetailWithoutScroll(firstPostId);
        }
    }, 100);

}

function showWriteForm() {
    document.getElementById("board-list").style.display = "none";
    document.getElementById("board-write").style.display = "block";
    hidePostDetail(); // 상세보기도 숨김
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

    // 정렬 버튼 이벤트 추가
    let sortBtns = document.querySelectorAll('.board-right-controls .board-btn');
    sortBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 기존 active 제거
            sortBtns.forEach(b => b.classList.remove('active'));
            // 클릭된 버튼에 active 추가
            this.classList.add('active');
            
            // 정렬 방식 적용
            const sortType = this.textContent.includes('최신순') ? 'latest' : 
                            this.textContent.includes('좋아요순') ? 'likes' : 'comments';
            changeSortType(sortType);
            
            console.log('정렬 방식 변경:', this.textContent);
        });
    });

    // 🔥 페이지 사이즈 드롭다운 이벤트 추가
    const pageSizeDropdown = document.querySelector('.page-size-dropdown');
    if (pageSizeDropdown) {
        const dropdownBtn = pageSizeDropdown.querySelector('.dropdown-btn');
        const dropdownMenu = pageSizeDropdown.querySelector('.dropdown-menu');
        
        // 드롭다운 토글
        dropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
        });
        
        // 드롭다운 메뉴 아이템 클릭 이벤트
        const menuItems = dropdownMenu.querySelectorAll('.dropdown-item');
        menuItems.forEach(item => {
            item.addEventListener('click', function() {
                const newSize = parseInt(this.getAttribute('data-size'));
                changePageSize(newSize);
                dropdownMenu.style.display = 'none';
                
                // active 상태 변경
                menuItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // 외부 클릭 시 드롭다운 닫기
        document.addEventListener('click', function() {
            dropdownMenu.style.display = 'none';
        });
    }

    let backBtns = document.querySelectorAll('.back-btn');
    backBtns.forEach(btn => {
        if (btn.textContent.includes('▲')) {
            btn.onclick = hidePostDetail;
        } else {
            btn.onclick = showBoardList;
        }
    });

    // 댓글 작성 버튼 이벤트
    const commentBtn = document.querySelector('.comment-btn');
    if (commentBtn) {
        commentBtn.addEventListener('click', function() {
            const commentInput = document.getElementById('comment-input');
            const commentText = commentInput.value.trim();
            
            if (commentText) {
                alert('댓글이 등록되었습니다: ' + commentText);
                commentInput.value = '';
                // 실제로는 여기서 서버에 댓글을 저장하고 화면을 업데이트
            } else {
                alert('댓글을 입력해주세요.');
                commentInput.focus();
            }
        });
    }

    // 🔥 페이지 초기화 시 게시글 목록 렌더링
    showBoardList();

    // 공통 스킨 로드
    if (typeof window.maintainDefaultSkinForInactiveUsers === 'function') {
        window.maintainDefaultSkinForInactiveUsers();
    }
}

window.addEventListener('DOMContentLoaded', activatePostUI);
*/

// === 스킨 로드 함수 시작 ===
async function loadBlogSkin() {
    const currentNickname = getCurrentNickname();
    if (!currentNickname) return;

    try {
        const encodedNickname = encodeURIComponent(currentNickname);
        const response = await fetch(`/blog/api/@${encodedNickname}/skin`);

        if (response.ok) {
            const skinData = await response.json();
            if (skinData.skinActive === 'Y' && skinData.skinImage) {
                applySkin(skinData.skinImage);
            } else {
                console.log('스킨이 비활성화되어 있음 - layout.js가 기본 스킨 처리');
            }
        } else {
            console.log('스킨 정보를 가져올 수 없습니다:', response.status);
        }
    } catch (error) {
        console.error('스킨 로드 중 오류:', error);
    }
}

function getCurrentNickname() {
    const currentPath = window.location.pathname;
    const match = currentPath.match(/^\/blog\/@([^\/]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

function applySkin(skinImageUrl) {
    const frame = document.querySelector('.frame');
    if (frame && skinImageUrl) {
        const img = new Image();
        img.onload = () => {
            frame.style.backgroundImage = `url(${skinImageUrl})`;
            frame.classList.add('has-skin');
        };
        img.src = skinImageUrl;
    }
}

function removeSkin() {
    const frame = document.querySelector('.frame');
    if (frame) {
        frame.style.backgroundImage = '';
        frame.classList.remove('has-skin');
    }
}

// 전역으로 노출
window.loadBlogSkin = loadBlogSkin;
window.setupPostFeatures = activatePostUI; // SPA 네비게이션 지원 (스킨)
window.showPostDetail = showPostDetail; // 전역으로 노출
window.hidePostDetail = hidePostDetail; // 전역으로 노출
// === 스킨 로드 함수 끝 ===
