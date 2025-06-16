(async function() {
  // 1) URL 파라미터 읽기
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');          // "create" | "edit"
  const entryId = params.get('entryId');    // 수정 모드일 땐 ID

  const container = document.querySelector('.emoticon-placeholder');

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
        img.onclick = () => selectEmoticon(`<img src="${imgUrl}" style="height:24px;" />`);
        container.appendChild(img);
      });
    } catch (e) {
      container.innerHTML = '<p>이모티콘을 불러오지 못했습니다.</p>';
      console.error(e);
    }
  }

  // 3) 부모 창에 이모티콘 전달
  function selectEmoticon(emoticonHtml) {
    if (!window.opener || window.opener.closed) return;
    if (mode === 'edit' && entryId) {
      window.opener.addEmoticonToEditForm(entryId, emoticonHtml);
    } else {
      window.opener.addEmoticonToMessage(emoticonHtml);
    }
    window.close();
  }

  // 4) 초기화
  window.addEventListener('beforeunload', () => {
    if (window.opener && !window.opener.closed) {
      window.opener.emoticonPopupWindow = null;
    }
  });
  await loadStickers();
})();
