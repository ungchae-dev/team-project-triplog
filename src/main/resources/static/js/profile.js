// profile.js - 프로필 페이지 기능 (수정된 버전)

(function() {
    'use strict';

    // === 전역 변수 ===
    let userAcorn = 30;
    let currentSkinFile = null;
    let skinActivated = false; // 스킨 활성화 상태

    // === 스킨 활성화 상태 확인 ===
    async function checkSkinActivationStatus() {
        if (!window.currentBlogNickname) {
            console.log('닉네임이 없어서 스킨 활성화 상태 확인을 건너뜁니다.');
            return false;
        }

        try {
            const encodedNickname = encodeURIComponent(window.currentBlogNickname);
            const apiUrl = `/blog/api/@${encodedNickname}/skin`;
            
            console.log('스킨 상태 확인 API 호출:', apiUrl);
            
            const response = await fetch(apiUrl);

            if (response.ok) {
                const skinData = await response.json();
                console.log('프로필에서 스킨 데이터 확인:', skinData);
                console.log('skinActive 값:', skinData.skinActive);
                console.log('skinImage 값:', skinData.skinImage);
                
                skinActivated = (skinData.skinActive === 'Y');
                console.log('프로필 스킨 활성화 상태 설정:', skinActivated);
                
                // UI 업데이트
                updateSkinControlsVisibility();
                
                return skinActivated;
            } else {
                console.error('스킨 활성화 상태 확인 응답 오류:', response.status); // 수정: error → response.status
                skinActivated = false;
                updateSkinControlsVisibility();
                return false;
            }
        } catch (error) {
            console.error('스킨 활성화 상태 확인 중 오류:', error);
            skinActivated = false;
            updateSkinControlsVisibility();
            return false;
        }
    }

    // === 스킨 컨트롤 버튼 활성화/비활성화 ===
    function updateSkinControlsVisibility() {
        console.log('UI 업데이트 시작... skinActivated:', skinActivated);
    
        // HTML에 정확히 있는 요소들 찾기
        const skinUploadLabel = document.querySelector('.skin-upload-label');
        const skinUpload = document.getElementById('skin-upload');
        const applySkinBtn = document.getElementById('apply-skin-btn');
        const removeSkinBtn = document.getElementById('remove-skin-btn');
        const skinSection = document.querySelector('.skin-section');

        console.log('DOM 요소들 찾기:');
        console.log('  - skinUploadLabel:', skinUploadLabel);
        console.log('  - skinUpload:', skinUpload);
        console.log('  - applySkinBtn:', applySkinBtn);
        console.log('  - removeSkinBtn:', removeSkinBtn);
        console.log('  - skinSection:', skinSection);

        if (!skinActivated) {
            console.log('스킨 비활성화 상태 - 버튼들 비활성화');
            
            if (skinUploadLabel) {
                skinUploadLabel.style.opacity = '0.5';
                skinUploadLabel.style.pointerEvents = 'none';
                skinUploadLabel.textContent = '※ 스킨 활성화 필요 (상점에서 활성화)';
            }
            if (skinUpload) {
                skinUpload.disabled = true;
            }
            if (applySkinBtn) {
                applySkinBtn.disabled = true;
                applySkinBtn.style.opacity = '0.5';
                applySkinBtn.textContent = '※ 스킨 활성화 필요';
            }
            if (removeSkinBtn) {
                removeSkinBtn.disabled = true;
                removeSkinBtn.style.opacity = '0.5';
            }
            
            // 안내 메시지 추가 (중복 방지)
            if (skinSection && !skinSection.querySelector('.skin-notice')) {
                const notice = document.createElement('div');
                notice.className = 'skin-notice';
                notice.style.cssText = `
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                    padding: 12px;
                    border-radius: 8px;
                    margin-top: 15px;
                    text-align: center;
                    font-size: 14px;
                `;
                notice.innerHTML = '※ 스킨 기능을 사용하려면 상점에서 스킨을 먼저 활성화해주세요! (도토리 30개)';
                skinSection.appendChild(notice);
            }
        } else {
            console.log('스킨 활성화 상태 - 버튼들 활성화');
            
            if (skinUploadLabel) {
                skinUploadLabel.style.opacity = '1';
                skinUploadLabel.style.pointerEvents = 'auto';
                skinUploadLabel.textContent = '📁 스킨 이미지 업로드';
            }
            if (skinUpload) {
                skinUpload.disabled = false;
            }
            if (applySkinBtn) {
                applySkinBtn.disabled = false;
                applySkinBtn.style.opacity = '1';
                applySkinBtn.textContent = '스킨 적용';
            }
            if (removeSkinBtn) {
                removeSkinBtn.disabled = false;
                removeSkinBtn.style.opacity = '1';
            }
            
            // 안내 메시지 제거
            const notice = skinSection?.querySelector('.skin-notice');
            if (notice) {
                notice.remove();
            }
        }
        
        console.log('=== UI 업데이트 완료 ===');
    }

    // === 탭 전환 기능 ===
    function switchTab(tabName) {
        console.log(`프로필 탭 전환: ${tabName}`);
        
        // 모든 탭 버튼과 컨텐츠 비활성화
        document.querySelectorAll('.shop-inner-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.shop-tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // 선택된 탭 활성화
        const tabBtn = document.getElementById(`btn-${tabName}`);
        const tabContent = document.querySelector(`.profile-${tabName}-tab`);
        
        if (tabBtn) {
            tabBtn.classList.add('active');
        }
        if (tabContent) {
            tabContent.classList.add('active');
            console.log(`=== ${tabName} 탭 컨텐츠 활성화됨 ===`);
        }

        // 탭별 특별 처리
        if (tabName === 'edit') {
            loadCurrentUserInfo();
        } else if (tabName === 'inventory') {
            loadInventoryInfo();
        }
    }

    // === 현재 사용자 정보 로드 ===
    function loadCurrentUserInfo() {
        if (typeof window.getBlogOwnerNickname === 'function') {
            const nickname = window.getBlogOwnerNickname();
            if (nickname) {
                updateElement('current-nickname', nickname);
                
                const editNickname = document.getElementById('edit-nickname');
                const editBio = document.getElementById('edit-bio');
                
                if (editNickname) editNickname.value = nickname;
                
                if (typeof window.loadUserData === 'function') {
                    window.loadUserData().then(() => {
                        const conditionMessage = document.getElementById('condition-message')?.textContent;
                        const userInfo = document.getElementById('user-info')?.textContent;
                        const joinDate = document.getElementById('join-date')?.textContent;
                        
                        if (conditionMessage && editBio) {
                            editBio.value = conditionMessage;
                            updateElement('current-bio', conditionMessage);
                        }
                        if (userInfo) {
                            updateElement('current-nickname', userInfo);
                        }
                        if (joinDate) {
                            updateElement('current-joindate', joinDate);
                        }
                    });
                }
            }
        }
    }

    // === 구매내역 정보 로드 ===
    async function loadInventoryInfo() {
        console.log('=== 구매/보유내역 탭 로드 시작 ===');
        // 스킨 활성화 상태 확인
        await checkSkinActivationStatus();
        
        // 현재 스킨 미리보기 업데이트
        await loadCurrentSkinPreview();

        fetchUserAcorn();
        console.log('=== 구매/보유내역 탭 로드 완료 ===')
    }
    // 도토리 잔액 조회 및 업데이트
    async function fetchUserAcorn() {
    try {
      const res = await fetch('/api/charge/acorn');
      if (!res.ok) throw new Error('잔액 조회 실패');
      const acorn = await res.json();
      userAcorn = acorn;
      updateAcornDisplay();
    } catch (e) {
      console.error('도토리 잔액 조회 오류:', e);
    }
  }

  function updateAcornDisplay() {
    const el = document.getElementById('current-acorn');
    if (el) el.textContent = userAcorn;
  }
  // 보유 이모티콘
  function loadOwnedEmoticons() {
  fetch("/api/profile/items/emoticons")
    .then(res => res.json())
    .then(data => {
      const emoticonListEl = document.getElementById("owned-emoticon-list");
      emoticonListEl.innerHTML = ""; // 기존 내용 비우기

      data.forEach(emoticon => {
        const item = document.createElement("div");
        item.className = "owned-item";
        item.innerHTML = `
          <img src="${emoticon.emoticonImage}" alt="${emoticon.emoticonName}" style="height: 32px; vertical-align: middle;" />
          <span style="margin-left: 8px;">${emoticon.emoticonName}</span>
        `;
        emoticonListEl.appendChild(item);
      });
    })
    .catch(err => console.error("이모티콘 불러오기 실패", err));
}
    // 보유 음악
    function loadOwnedMusic() {
  fetch("/api/profile/items/music")
    .then(res => res.json())
    .then(data => {
      const musicListEl = document.getElementById("owned-music-list");
      musicListEl.innerHTML = ""; // 기존 내용 비우기

      data.forEach(music => {
        const item = document.createElement("div");
        item.className = "owned-item";
        item.innerText = `${music.title} - ${music.artist}`;
        musicListEl.appendChild(item);
      });
    })
    .catch(err => console.error("음악 불러오기 실패", err));
}

    // === 스킨 업로드 및 적용 ===
    function setupSkinUpload() {
        // HTML에 정확히 있는 요소들 찾기
        const skinUpload = document.getElementById('skin-upload');
        const applySkinBtn = document.getElementById('apply-skin-btn');
        const removeSkinBtn = document.getElementById('remove-skin-btn');
        const currentSkinPreview = document.getElementById('current-skin-preview');

        console.log('setupSkinUpload DOM 요소 확인:');
        console.log('  - skinUpload:', skinUpload);
        console.log('  - applySkinBtn:', applySkinBtn);
        console.log('  - removeSkinBtn:', removeSkinBtn);
        console.log('  - currentSkinPreview:', currentSkinPreview);

        if (skinUpload) {
            skinUpload.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file && skinActivated) {
                    currentSkinFile = file;
                    
                    // 파일 크기 확인 (5MB 제한)
                    if (file.size > 5 * 1024 * 1024) {
                        alert('파일 크기는 5MB 이하여야 합니다.');
                        skinUpload.value = '';
                        return;
                    }

                    // 파일 형식 확인
                    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                    if (!allowedTypes.includes(file.type)) {
                        alert('지원하지 않는 파일 형식입니다. (jpg, jpeg, png, gif, webp만 가능)');
                        skinUpload.value = '';
                        return;
                    }
                    
                    // 미리보기 업데이트
                    const reader = new FileReader();
                    reader.onload = function(evt) {
                        if (currentSkinPreview) {
                            currentSkinPreview.src = evt.target.result;
                        }
                    };
                    reader.readAsDataURL(file);
                    
                    console.log('스킨 파일 선택됨:', file.name);
                } else if (!skinActivated) {
                    alert('스킨 기능을 사용하려면 상점에서 먼저 스킨을 활성화해주세요.');
                    skinUpload.value = '';
                }
            });
        }

        if (applySkinBtn) {
            applySkinBtn.addEventListener('click', async function() {
                if (!skinActivated) {
                    alert('스킨 기능을 사용하려면 상점에서 먼저 스킨을 활성화해주세요.');
                    return;
                }

                if (currentSkinFile) {
                    if (confirm('해당 스킨으로 변경하시겠습니까?')) {
                        try {
                            // 로딩 상태 표시
                            applySkinBtn.disabled = true;
                            applySkinBtn.textContent = '업로드 중...';

                            // 서버에 스킨 이미지 업로드 (기존 백엔드 API 사용)
                            const formData = new FormData();
                            formData.append('skinImage', currentSkinFile); // 백엔드 API 파라미터명에 맞춤

                            const encodedNickname = encodeURIComponent(window.currentBlogNickname);
                            const response = await fetch(`/blog/api/@${encodedNickname}/skin/upload`, {
                                method: 'POST',
                                body: formData
                            });

                            const result = await response.json();
                            console.log('스킨 업로드 응답:', result);

                            if (response.ok && result.success) {
                                const serverSkinUrl = result.skinImageUrl;
                                
                                // 블로그 배경에 즉시 적용
                                const frame = document.querySelector('.frame');
                                if (frame) {
                                    frame.style.backgroundImage = `url("${serverSkinUrl}")`;
                                    frame.style.backgroundSize = 'cover';
                                    frame.style.backgroundPosition = 'center';
                                    frame.style.backgroundRepeat = 'no-repeat';
                                    frame.classList.add('has-skin', 'skin-loaded');

                                    console.log('스킨 즉시 적용:', serverSkinUrl);
                                }

                                // 미리보기 이미지 업데이트
                                updateSkinPreviewAfterUpload(serverSkinUrl);

                                // sessionStorage 업데이트
                                sessionStorage.setItem('customSkinImage', serverSkinUrl);
                                sessionStorage.setItem('skinApplied', 'true');

                                // layout.js 캐시 업데이트
                                if (typeof window.updateSkinCache === 'function') {
                                    window.updateSkinCache({
                                        skinActive: 'Y', 
                                        skinImage: serverSkinUrl
                                    });
                                    console.log('layout.js 캐시 업데이트 완료:', serverSkinUrl);
                                } else {
                                    console.log('window.updateSkinCache 함수를 찾을 수 없음');

                                    // 대안: 강제 캐시 새로고침
                                    if (typeof window.forceRefreshSkinCache === 'function') {
                                        await window.forceRefreshSkinCache();
                                        console.log('layout.js 캐시 강제 새로고침 완료');
                                    }
                                }

                                // home.js 스킨 새로고침
                                if (typeof window.refreshSkin === 'function') {
                                    await window.refreshSkin();
                                }
                                
                                console.log('스킨 업로드 성공:', serverSkinUrl);
                                alert('스킨이 변경되었습니다.');
                            } else {
                                console.error('스킨 업로드 실패:', result);
                                alert(`스킨 변경 실패: ${result.message || '알 수 없는 오류'}`);
                                await loadCurrentSkinPreview();
                            }
                        } catch (error) {
                            console.error('스킨 업로드 중 오류:', error);
                            alert('스킨 업로드 중 오류가 발생했습니다.');
                            await loadCurrentSkinPreview();
                        } finally {
                            // 로딩 상태 해제
                            applySkinBtn.disabled = false;
                            applySkinBtn.textContent = '스킨 적용';
                        }
                    }
                } else {
                    alert('먼저 이미지를 선택해주세요.');
                }
            });
        }

        if (removeSkinBtn) {
            removeSkinBtn.addEventListener('click', async function() {
                if (!skinActivated) {
                    alert('스킨 기능을 사용하려면 상점에서 먼저 스킨을 활성화해주세요.');
                    return;
                }

                if (confirm('기본 스킨으로 변경하시겠습니까?')) {
                    try {
                        const encodedNickname = encodeURIComponent(window.currentBlogNickname);
                        const response = await fetch(`/blog/api/@${encodedNickname}/skin`, {
                            method: 'DELETE'
                        });

                        const result = await response.json();

                        if (response.ok && result.success) {
                            // 기본 스킨으로 되돌리기
                            const frame = document.querySelector('.frame');
                            if (frame) {
                                frame.style.backgroundImage = 'url("/images/skins/triplog_skin_default.png")';
                                frame.style.backgroundSize = 'cover';
                                frame.style.backgroundPosition = 'center';
                                frame.style.backgroundRepeat = 'no-repeat';
                                frame.classList.remove('has-skin');
                                frame.classList.add('skin-loaded');
                                
                                // sessionStorage 정리
                                sessionStorage.removeItem('customSkinImage');
                                sessionStorage.removeItem('skinApplied');
                            }
                            
                            resetSkinPreviewToDefault();
                            
                            currentSkinFile = null;
                            if (skinUpload) {
                                skinUpload.value = '';
                            }

                            // layout.js 캐시 업데이트 (기본 스킨)
                            if (typeof window.updateSkinCache == 'function') {
                                window.updateSkinCache({
                                    skinActive: 'Y', // 활성화는 유지, 이미지만 기본으로
                                    skinImage: '/images/skins/triplog_skin_default.png'
                                });
                                console.log('layout.js 캐시 업데이트 완료: 기본 스킨');
                            } else {
                                console.log('window.updateSkinCache 함수를 찾을 수 없음');

                                // 대안: 강제 캐시 새로고침
                                if (typeof window.forceRefreshSkinCache == 'function') {
                                    await window.forceRefreshSkinCache();
                                    console.log('layout.js 캐시 강제 새로고침 완료');
                                }
                            }

                            // home.js 스킨 새로고침
                            if (typeof window.refreshSkin === 'function') {
                                await window.refreshSkin();
                            }
                            
                            alert('기본 스킨으로 변경되었습니다.');
                            console.log('스킨 제거 성공');
                        } else {
                            alert(`스킨 제거 실패: ${result.message || '알 수 없는 오류'}`);
                        }
                    } catch (error) {
                        console.error('스킨 제거 중 오류:', error);
                        alert('스킨 제거 중 오류가 발생했습니다.');
                    }
                }
            });
        }
    }

    // === 프로필 사진 미리보기 및 업로드 ===
    function setupPhotoPreview() {
        const editPhoto = document.getElementById('edit-photo');
        const editPreviewImg = document.getElementById('edit-preview-img');

        if (editPhoto && editPreviewImg) {
            editPhoto.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    // 파일 크기 확인 (5MB 제한)
                    if (file.size > 5 * 1024 * 1024) {
                        alert('파일 크기는 5MB 이하여야 합니다!');
                        editPhoto.value = '';
                        return;
                    }

                    // 파일 형식 확인 (수정됨)
                    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                    if (!allowedTypes.includes(file.type)) {
                        alert('지원하지 않는 파일 형식입니다. (jpg, jpeg, png, gif, webp만 가능)');
                        editPhoto.value = '';
                        return;
                    }

                    // 미리보기 표시
                    const reader = new FileReader();
                    reader.onload = function(evt) {
                        editPreviewImg.src = evt.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    // === 프로필 정보 저장 ===
    async function setupProfileSave() {
        const form = document.getElementById('profile-edit-form');
        
        if (form) {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();

                // 프로필 - 개인정보 조회/수정
                const editBio = document.getElementById('edit-bio');
                const editPhoto = document.getElementById('edit-photo');
                const editPasswordOld = document.getElementById('edit-password-old');
                const editPasswordNew = document.getElementById('edit-password-new');

                let hasChanges = false;
                let updateMessages = [];
                let successCount = 0;
                let totalAttempts = 0;

                try {
                    // 1. 상태메시지 변경 확인 및 처리
                    if (editBio && editBio.value.trim()) {
                        const newConditionMessage = editBio.value.trim();
                        const currentConditionMessage = document.getElementById('current-bio')?.textContent || '';

                        if (newConditionMessage !== currentConditionMessage) {
                            hasChanges = true;
                            totalAttempts++;

                            const conditionUpdateSuccess = await updateConditionMessage(newConditionMessage);
                            if (conditionUpdateSuccess) {
                                updateMessages.push('상태메시지가 변경되었습니다.');
                                successCount++;
                            } else {
                                updateMessages.push('상태메시지 변경에 실패했습니다!');
                            }
                        }
                    }

                    // 2. 프로필 사진 변경 확인 및 처리
                    if (editPhoto && editPhoto.files.length > 0) {
                        hasChanges = true;
                        totalAttempts++;

                        const profileUpdateSuccess = await uploadProfileImage(editPhoto.files[0]);
                        
                        if (profileUpdateSuccess) {
                            updateMessages.push('프로필 사진이 변경되었습니다.');
                            successCount++;
                        } else {
                            updateMessages.push('프로필 사진 업로드에 실패했습니다.');
                        }
                    }

                    // 3. 비밀번호 변경 확인 및 처리
                    if (editPasswordOld && editPasswordNew && 
                    editPasswordOld.value.trim() && editPasswordNew.value.trim()) {
                        hasChanges = true;
                        totalAttempts++;

                        const passwordUpdateSuccess = await updatePassword(editPasswordOld.value, editPasswordNew.value);
                        if (passwordUpdateSuccess) {
                            updateMessages.push('비밀번호가 변경되었습니다.');
                            successCount++;
                        } else {
                            updateMessages.push('비밀번호 변경에 실패했습니다!');
                        }
                    }

                    // 4. 결과 메시지 표시
                    if (!hasChanges) {
                        alert('변경된 사항이 없습니다!');
                    } else if (successCount === totalAttempts) {
                        alert('개인정보가 수정되었습니다.');

                        // 성공시 UI 업데이트
                        setTimeout(() => {
                            loadCurrentUserInfo(); // 현재 정보 다시 로드
                            updateAllProfileImagesManually(); // 프로필 이미지 강제 업데이트

                            // 입력 필드 초기화
                            if (editBio) editBio.value = '';
                            if (editPhoto) editPhoto.value = '';
                            if (editPasswordOld) editPasswordOld.value = '';
                            if (editPasswordNew) editPasswordNew.value = '';

                            console.log('개인정보 수정 완료 - 개인정보 탭 유지');
                        }, 500);
                    } else {
                        alert('일부 정보 업데이트에 실패했습니다:\n' + updateMessages.join('\n')); 
                    }

                } catch (error) {
                    console.error('프로필 업데이트 중 오류:', error);
                    alert('프로필 업데이트 중 오류가 발생했습니다.');
                }
            });
        }
    }

    // === 프로필 이미지 업로드 ===
    async function uploadProfileImage(file) {
        try {
            const formData = new FormData();
            formData.append('profileImage', file);

            const currentNickname = window.currentBlogNickname || getCurrentNickname();
            if (!currentNickname) {
                throw new Error('블로그 닉네임을 찾을 수 없습니다!');
            }

            const encodedNickname = encodeURIComponent(currentNickname);
            const response = await fetch(`/blog/@${encodedNickname}/profile/info/upload-image`, {
                method: 'POST', 
                body: formData
            });

            const result = await response.json();
            console.log('프로필 사진 업로드 응답:', result);

            if (response.ok && result.success) {
                console.log('=== 프로필 이미지 업로드 성공 ===');
                console.log('서버 응답 이미지 URL:', result.profileImageUrl);

                // 우선 현재 화면의 프로필 이미지들 즉시 업데이트
                const currentProfileImg = document.getElementById('current-profile-img');
                const editPreviewImg = document.getElementById('edit-preview-img');

                if (currentProfileImg) {
                    currentProfileImg.src = result.profileImageUrl;
                    console.log('current-profile-img 즉시 업데이트');
                }
                if (editPreviewImg) {
                    editPreviewImg.src = result.profileImageUrl;
                    console.log('edit-preview-img 즉시 업데이트');
                }
                
                // 전역 캐시 시스템 업데이트 (layout.js)
                if (typeof window.updateProfileImageCache === 'function') {
                    console.log('전역 캐시 업데이트 함수 호출');
                    window.updateProfileImageCache(result.profileImageUrl);
                    console.log('전역 프로필 이미지 캐시 업데이트 완료');
                } else {
                    console.error('window.updateProfileImageCache 함수를 찾을 수 없음!');
                    
                    // 수동으로 모든 프로필 이미지 업데이트
                    console.log('수동 프로필 이미지 업데이트 시작');
                    updateAllProfileImagesManually();
                }
                
                return true;
            } else {
                console.error('프로필 사진 업로드 실패:', result.message);
                alert(`프로필 사진 업로드 실패: ${result.message}`);
                return false;
            }

        } catch (error) {
            console.error('프로필 사진 업로드 중 오류:', error);
            alert('프로필 사진 업로드 중 오류가 발생했습니다!');
            return false;
        }
    }

    // 수동 프로필 이미지 업데이트 함수
    function updateAllProfileImagesManually() {
        console.log('=== 수동 프로필 이미지 업데이트 시작 ===');
        
        // 최신 업로드된 프로필 이미지 URL 가져오기 (여러 방법 시도)
        let newImageUrl = null;

        // 방법 1. current-profile-img에서 가져오기
        const currentProfileImg = document.getElementById('current-profile-img');
        if (currentProfileImg && currentProfileImg.src && !currentProfileImg.src.includes('placeholder')) {
            newImageUrl = currentProfileImg.src;
        }

        // 방법 2: edit-preview-img에서 가져오기 (방법1이 실패한 경우)
        if (!newImageUrl) {
            const editPreviewImg = document.getElementById('edit-preview-img');
            if (editPreviewImg && editPreviewImg.src && !editPreviewImg.src.includes('placeholder')) {
                newImageUrl = editPreviewImg.src;
            }
            editPreviewImg.src = imageUrlWithCache;
            console.log('프로필 페이지 미리보기 이미지 업데이트');
        }

        // 방법 3: 전역 캐시에서 가져오기
        if (!newImageUrl && window.cachedProfileImage) {
            newImageUrl = window.cachedProfileImage;
        }

        if (!newImageUrl) {
            console.log('업데이트할 프로필 이미지 URL을 찾을 수 없음');
            return;
        }
        console.log('업데이트할 이미지 URL:', newImageUrl);

        // 캐시 무효화를 위한 타임스탬프 추가
        const timestamp = Date.now();
        const baseUrl = newImageUrl.split('?')[0]; // 기존 쿼리 파라미터 제거
        const imageUrlWithCache = baseUrl + '?t=' + timestamp;

        console.log('캐시 무효화된 URL:', imageUrlWithCache);

        // 모든 프로필 이미지 업데이트
        updateMultipleImages(imageUrlWithCache);

        // 전역 캐시도 업데이트
        if (typeof window.updateProfileImageCache === 'function') {
            window.updateProfileImageCache(baseUrl);
            console.log('전역 캐시 시스템 업데이트');
        }

        console.log('=== 수동 프로필 이미지 업데이트 완료 ===');
    }

    // 여러 이미지 업데이트 함수 (강력한 버전)
    function updateMultipleImages(imageUrlWithCache) {
        const imagesToUpdate = [
            // 1. 사이드바 프로필 이미지
            { selector: 'profile-pic img', name: '사이드바 프로필' }, 
            // 2. 프로필 페이지 현재 이미지
            { selector: '#current-profile-img', name: '프로필 페이지 현재 이미지' }, 
            // 3. 프로필 페이지 미리보기 이미지
            { selector: '#edit-preview-img', name: '프로필 페이지 미리보기' }, 
            // 4. 기타 모든 프로필 이미지
            { selector: 'img[src*="/uploads/profiles/"]', name: '업로드된 프로필 이미지들' }
        ];

        imagesToUpdate.forEach(({ selector, name }) => {
            const elements = document.querySelectorAll(selector);

            if (elements.length > 0) {
                elements.forEach((img, index) => {
                    // 이미지 로드 확인 후 적용
                    const testImg = new Image();
                    testImg.onload = () => {
                        img.src = imageUrlWithCache;
                        console.log(`${name} ${index + 1} 업데이트 성공`);
                    };
                    testImg.onerror = () => {
                        console.log(`${name} ${index + 1} 이미지 로드 실패:`, imageUrlWithCache);
                    };
                    testImg.src = imageUrlWithCache;
                });
            } else {
                console.log(`${name} 요소를 찾을 수 없음: ${selector}`);
            }
        });
    }

    // === 상태메시지 업데이트 함수 ===
    async function updateConditionMessage(conditionMessage) {
        try {
            const currentNickname = window.currentBlogNickname || getCurrentNickname();
            if (!currentNickname) {
                throw new Error('블로그 닉네임을 찾을 수 없습니다!');
            }

            const encodedNickname = encodeURIComponent(currentNickname);
            const response = await fetch(`/blog/@${encodedNickname}/profile/info/update-condition-message`, {
                method: 'POST', 
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify({
                    conditionMessage: conditionMessage
                })
            });

            const result = await response.json();
            console.log('상태메시지 업데이트 응답:', result);

            if (response.ok && result.success) {
                // 현재 정보 화면 즉시 업데이트
                const currentBioElement = document.getElementById('current-bio');
                if (currentBioElement) {
                    currentBioElement.textContent = conditionMessage;
                }

                // home_left의 상태메시지도 업데이트
                const conditionMessageElement = document.getElementById('condition-message');
                if (conditionMessageElement) {
                    conditionMessageElement.textContent = conditionMessage;
                }

                console.log('상태메시지 업데이트 성공:', conditionMessage);
                return true;
            } else {
                console.error('상태메시지 업데이트 실패:', result.message);
                return false;
            }

        } catch (error) {
            console.error('상태메시지 업데이트 중 오류:', error);
            return false;
        }
    }

    // === 페이지 이동시 스킨 유지 기능 ===
    function maintainSkinOnNavigation() {
        // 페이지 로드시 세션에 저장된 스킨 복원
        const savedSkinImage = sessionStorage.getItem('customSkinImage');
        const skinApplied = sessionStorage.getItem('skinApplied');
        
        if (savedSkinImage && skinApplied === 'true') {
            const frame = document.querySelector('.frame');
            if (frame) {
                frame.style.backgroundImage = `url(${savedSkinImage})`;
                frame.classList.add('has-skin');
                console.log('세션에서 커스텀 스킨 복원됨');
            }
        }
    }

    // === 이벤트 리스너 등록 ===
    function setupEventListeners() {
        // 탭 버튼 클릭 이벤트
        const inventoryBtn = document.getElementById('btn-inventory');
        const editBtn = document.getElementById('btn-edit');

        if (inventoryBtn) {
            inventoryBtn.addEventListener('click', () => switchTab('inventory'));
        }
        if (editBtn) {
            editBtn.addEventListener('click', () => switchTab('edit'));
        }

        setupSkinUpload();
        setupPhotoPreview();
        setupProfileSave();
    }

    // === DOM 요소 업데이트 헬퍼 함수 ===
    function updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            if (element.tagName.toLowerCase() === 'img') {
                element.src = content;
            } else {
                element.textContent = content;
            }
            console.log(`${id} 업데이트:`, content);
        } else {
            console.log(`요소를 찾을 수 없음: ${id}`);
        }
    }

    // === 프로필 페이지 초기화 ===
    function initProfilePage() {
        maintainSkinOnNavigation(); // 스킨 유지 기능
        setupEventListeners();
        loadInventoryInfo(); // 기본적으로 구매내역 탭 표시
        loadOwnedEmoticons();
        loadOwnedMusic();
        // 공통 스킨 로드
        if (typeof window.maintainDefaultSkinForInactiveUsers === 'function') {
            window.maintainDefaultSkinForInactiveUsers();
        }
        
        console.log('프로필 페이지 초기화 완료');
    }

    // === 페이지 로드 시 초기화 ===
    document.addEventListener('DOMContentLoaded', () => {
        initProfilePage();
    });


    // === 스킨 로드 함수 시작 ===
    //
    async function loadBlogSkin() {
        const currentNickname = getCurrentNickname();
        if (!currentNickname) return;

        try {
            const encodedNickname = encodeURIComponent(currentNickname);
            const response = await fetch(`/blog/api/@${encodedNickname}/skin`);

            if (response.ok) {
                const skinData = await response.json();
                if (skinData.skinActive === 'Y' && skinData.skinImage) {
                    applySkinForProfile(skinData.skinImage);
                } else {
                    removeSkinForProfile();
                }
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

    function applySkinForProfile(skinImageUrl) {
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

    function removeSkinForProfile() {
        const frame = document.querySelector('.frame');
        if (frame) {
            frame.style.backgroundImage = '';
            frame.classList.remove('has-skin');
        }
    }

    // === 현재 적용된 스킨 미리보기 로드 ===
    async function loadCurrentSkinPreview() {
        const currentSkinPreview = document.getElementById('current-skin-preview');
        if (!currentSkinPreview) {
            console.log('current-skin-preview 요소를 찾을 수 없습니다.');
            return;
        }

        if (!window.currentBlogNickname) {
            console.log('닉네임이 없어서 스킨 미리보기를 로드할 수 없습니다.');
            // 기본 스킨으로 설정
            currentSkinPreview.src = '/images/skins/triplog_skin_default.png';
            return;
        }

        try {
            const encodedNickname = encodeURIComponent(window.currentBlogNickname);
            const response = await fetch(`/blog/api/@${encodedNickname}/skin`);

            if (response.ok) {
                const skinData = await response.json();
                console.log('스킨 미리보기 데이터:', skinData);
                
                if (skinData.skinActive === 'Y' && skinData.skinImage) {
                    // 사용자가 업로드한 커스텀 스킨 이미지 표시
                    currentSkinPreview.src = skinData.skinImage;
                    console.log('커스텀 스킨 미리보기 로드됨:', skinData.skinImage);
                } else {
                    // 기본 스킨 이미지 표시
                    currentSkinPreview.src = '/images/skins/triplog_skin_default.png';
                    console.log('기본 스킨 미리보기 로드됨');
                }
            } else {
                console.error('스킨 정보 조회 실패:', response.status);
                // 기본 스킨으로 폴백
                currentSkinPreview.src = '/images/skins/triplog_skin_default.png';
            }
        } catch (error) {
            console.error('스킨 미리보기 로드 중 오류:', error);
            // 기본 스킨으로 폴백
            currentSkinPreview.src = '/images/skins/triplog_skin_default.png';
        }
    }

    function updateSkinPreviewAfterUpload(serverSkinUrl) {
        const currentSkinPreview = document.getElementById('current-skin-preview');
        if (currentSkinPreview) {
            // 이미지 로드 확인 후 적용
            const img = new Image();
            img.onload = () => {
                currentSkinPreview.src = serverSkinUrl;
                console.log('스킨 미리보기 업데이트 완료:', serverSkinUrl);
            };
            img.onerror = () => {
                console.error('스킨 미리보기 이미지 로드 실패:', serverSkinUrl);
                // 실패 시 기본 이미지로 복원
                currentSkinPreview.src = '/images/skins/triplog_skin_default.png';
            };
            img.src = serverSkinUrl;
        }
    }

    function resetSkinPreviewToDefault() {
        const currentSkinPreview = document.getElementById('current-skin-preview');
        if (currentSkinPreview) {
            currentSkinPreview.src = '/images/skins/triplog_skin_default.png';
            console.log('스킨 미리보기를 기본으로 리셋');
        }
    }

    // === 페이지 새로고침 없이 스킨 동기화 함수 ===
    async function syncSkinWithServer() {
        if (!window.currentBlogNickname) return;

        try {
            const encodedNickname = encodeURIComponent(window.currentBlogNickname);
            const response = await fetch(`/blog/api/@${encodedNickname}/skin`);

            if (response.ok) {
                const skinData = await response.json();
                console.log('서버 스킨 동기화:', skinData);

                const frame = document.querySelector('.frame');
                if (frame && skinData.skinActive === 'Y' && skinData.skinImage) {
                    frame.style.backgroundImage = `url("${skinData.skinImage}")`;
                    frame.classList.add('has-skin', 'skin-loaded');

                    // sessionStorage도 동기화
                    sessionStorage.setItem('customSkinImage', skinData.skinImage);
                    sessionStorage.setItem('skinApplied', 'true');

                    console.log('서버와 스킨 동기화 완료');
                }

            }
        } catch (error) {
            console.error('스킨 동기화 중 오류:', error);
        }
    }
    //
    // === 스킨 로드 함수 끝 ===

    // === 클라이언트 사이드 비밀번호 검증 ===
    function validatePasswordClient(password) {
        // 1. 길이 체크
        if (password.length < 8) {
            return {
                isValid: false, 
                message: '비밀번호는 8자 이상이어야 합니다!'
            };
        }

        if (password.length > 20) {
            return {
                isValid: false, 
                message: '비밀번호는 20자 이하여야 합니다!'
            };
        }

        // 2. 영문 포함 체크
        if (!/[a-zA-Z]/.test(password)) {
            return {
                isValid: false, 
                message: '비밀번호는 영문을 포함해야 합니다!'
            };
        }

        // 3. 숫자 포함 체크
        if (!/[0-9]/.test(password)) {
            return {
                isValid: false, 
                message: '비밀번호는 숫자를 포함해야 합니다!'
            };
        }

        // 4. 특수문자 포함 체크
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return {
                isValid: false, 
                message: '비밀번호는 특수문자를 포함해야 합니다!'
            };
        }

        // 5. 공백 체크
        if (password.includes(' ')) {
            return {
                isValid: false, 
                message: '비밀번호에는 공백이 포함될 수 없습니다!'
            };
        }

        return {
            isValid: true, 
            message: '검증 통과'
        }
    }

    // === 비밀번호 변경 함수 ===
    async function updatePassword(currentPassword, newPassword) {
        try {
            // 1. 클라이언트 사이드 검증
            if (!currentPassword || currentPassword.trim() === '') {
                alert('현재 비밀번호를 입력해주세요.');
                return false;
            }

            if (!newPassword || newPassword.trim() === '') {
                alert('새 비밀번호를 입력해주세요.')
                return false;
            }

            // 2. 비밀번호 강도 검증 (클라이언트 사이드)
            const passwordValidation = validatePasswordClient(newPassword);
            if (!passwordValidation.isValid) {
                alert(passwordValidation.message);
                return false;
            }

            // 3. 현재 비밀번호와 새 비밀번호가 같은지 확인
            if (currentPassword === newPassword) {
                alert('새 비밀번호는 현재 비밀번호와 달라야 합니다!');
                return false;
            }

            // 4. API 호출
            const currentNickname = window.currentBlogNickname || getCurrentNickname();
            if (!currentNickname) {
                throw new Error('블로그 닉네임을 찾을 수 없습니다!');
            }

            const encodedNickname = encodeURIComponent(currentNickname);
            const response = await fetch(`/blog/@${encodedNickname}/profile/info/update-password`, {
                method: 'POST', 
                headers: {
                    'Content-type': 'application/json', 
                },
                body: JSON.stringify({
                    currentPassword: currentPassword, 
                    newPassword: newPassword
                })
            });

            const result = await response.json();
            console.log('비밀번호 변경 응답:', result);
            
            if (response.ok && result.success) {
                console.log('비밀번호 변경 성공:', result.message);
                // alert는 여기서 하지 말고, setupProfileSave에서 통합 처리
                return true;
            } else {
                console.error('비밀번호 변경 실패:', result.message);
                alert(`비밀번호 변경 실패! ${result.message}`);
                return false;
            }

        } catch (error) {
            console.error('비밀번호 변경 중 오류:', error);
            alert('비밀번호 변경 중 오류가 발생했습니다!');
            return false;
        }
    }

    // === 전역 함수들 ===
    window.loadBlogSkin = loadBlogSkin;
    window.syncSkinWithServer = syncSkinWithServer;
    window.setupProfileFeatures = initProfilePage;
    window.maintainSkinOnNavigation = maintainSkinOnNavigation;

})();