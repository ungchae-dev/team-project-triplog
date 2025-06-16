(async function() {
  // 1) URL 파라미터 읽기
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');        // "create" | "edit"
  const entryId = params.get('entryId');  // 수정 모드일 땐 ID

  const container = document.querySelector('.emoticon-placeholder');
  if (!container) return console.error('팝업: .emoticon-placeholder를 찾을 수 없습니다.');

  // 2) 스티커 불러오기
  async function loadStickers() {
    try {
      const resp = await fetch('/api/emoticon/owned-stickers');
      const stickers = await resp.json();
      container.innerHTML = '';
      if (!stickers.length) {
        container.innerHTML = '<p>보유한 이모티콘이 없습니다.</p>';
        return;
      }
      stickers.forEach(s => {
        const imgUrl = s.stickerImg_300?.trim();
        if (!imgUrl) return;
        const img = document.createElement('img');
        img.src = imgUrl;
        img.alt = 'emoticon';
        img.className = 'popup-emoji';
        img.onclick = () => {
          const html = `<img src="${imgUrl}" style="height:34px;" />`;
          selectEmoticon(html);
        };
        container.appendChild(img);
      });
    } catch (e) {
      console.error('이모티콘 불러오기 실패', e);
      container.innerHTML = '<p>이모티콘을 불러오지 못했습니다.</p>';
    }
  }

  // 3) 부모 창에 이모티콘 전달
  function selectEmoticon(emoticonHtml) {
    if (!window.opener || window.opener.closed) return;

    if (mode === 'edit' && entryId) {
      // 수정 모드일 때
      window.opener.addEmoticonToEditForm(entryId, emoticonHtml);
    } else {
      // 새 댓글 작성 모드일 때
      window.opener.addEmoticonToMessage(emoticonHtml);
    }
    window.close();
  }

  // 4) 팝업이 닫힐 때 부모 참조 해제
  window.addEventListener('beforeunload', () => {
    if (window.opener && !window.opener.closed) {
      window.opener.emoticonPopupWindow = null;
    }
  });

  // 5) 초기 실행
  await loadStickers();
})();