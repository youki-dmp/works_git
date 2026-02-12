(function () {
  'use strict';

  // RAWテキストを取得
  const rawText = document.body.innerText;

  // ボディをクリア
  document.body.innerHTML = '';

  // コンテナ作成
  const container = document.createElement('div');
  container.id = 'markdown-container';
  container.className = 'markdown-body';
  document.body.appendChild(container);

  // markedの設定
  marked.setOptions({
    gfm: true,
    breaks: true,
    headerIds: true,
    headerPrefix: 'user-content-',
    highlight: function (code, lang) {
      // シンタックスハイライトは今回は簡易版
      return code;
    }
  });

  // YouTubeリンクなどの自動埋め込み
  const renderer = new marked.Renderer();
  const originalLink = renderer.link.bind(renderer);
  renderer.link = ({ href, title, text }) => {
    // YouTubeの簡易埋め込み対応
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = href ? href.match(youtubeRegex) : null;

    // テキストがURLそのもの、または特定のYouTube形式の場合のみ埋め込む
    if (match && (text === href || text.includes('youtube.com') || text.includes('youtu.be'))) {
      const videoId = match[1];
      return `<div class="video-container"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
    }
    return originalLink({ href, title, text });
  };

  // MarkdownをHTMLに変換
  container.innerHTML = marked.parse(rawText, { renderer: renderer });

  // 目次の生成
  generateToC();

  function generateToC() {
    const headings = container.querySelectorAll('h2, h3, h4');
    if (headings.length === 0) return;

    document.body.classList.add('has-toc');

    // トグルボタンの作成 (モバイル・タブレット用)
    const tocToggle = document.createElement('button');
    tocToggle.id = 'toc-toggle';
    tocToggle.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1 2.75A.75.75 0 011.75 2h12.5a.75.75 0 110 1.5H1.75A.75.75 0 011 2.75zm0 5A.75.75 0 011.75 7h12.5a.75.75 0 110 1.5H1.75A.75.75 0 011 7.75zM1.75 12h12.5a.75.75 0 110 1.5H1.75a.75.75 0 110-1.5z"></path>
            </svg>
            <span>目次</span>
        `;
    document.body.appendChild(tocToggle);

    const tocSidebar = document.createElement('div');
    tocSidebar.id = 'toc-sidebar';

    const tocTitle = document.createElement('h3');
    tocTitle.innerText = '目次';
    tocSidebar.appendChild(tocTitle);

    const tocList = document.createElement('ul');

    headings.forEach((heading, index) => {
      const id = heading.id || `heading-${index}`;
      heading.id = id;

      const listItem = document.createElement('li');
      listItem.className = `toc-${heading.tagName.toLowerCase()}`;

      const link = document.createElement('a');
      link.href = `#${id}`;
      link.innerText = heading.innerText;

      // スムーズスクロール
      link.addEventListener('click', (e) => {
        e.preventDefault();
        heading.scrollIntoView({ behavior: 'smooth' });
        history.pushState(null, null, `#${id}`);

        // モバイル時はクリック後に閉じる
        document.body.classList.remove('toc-open');
      });

      listItem.appendChild(link);
      tocList.appendChild(listItem);
    });

    tocSidebar.appendChild(tocList);
    document.body.appendChild(tocSidebar);

    // トグルイベント
    tocToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      document.body.classList.toggle('toc-open');
    });

    // 画面外クリックで閉じる
    document.addEventListener('click', (e) => {
      if (!tocSidebar.contains(e.target) && !tocToggle.contains(e.target)) {
        document.body.classList.remove('toc-open');
      }
    });
  }

})();
