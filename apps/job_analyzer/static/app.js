document.addEventListener('DOMContentLoaded', () => {
  const urlInputsContainer = document.getElementById('url-inputs');
  const addUrlBtn = document.getElementById('add-url-btn');
  const analyzeBtn = document.getElementById('analyze-btn');
  const analyzeTextBtn = document.getElementById('analyze-text-btn');
  const saveRequirementsBtn = document.getElementById('save-requirements-btn');

  const resultsSection = document.getElementById('results-section');
  const resultsGrid = document.getElementById('results-grid');
  const historyList = document.getElementById('history-list');
  const modal = document.getElementById('detail-modal');
  const modalBody = document.getElementById('modal-body');
  const closeModal = document.querySelector('.close-modal');

  const jobTextInput = document.getElementById('job-text-input');
  const requirementsInput = document.getElementById('requirements-input');

  // --- Tab Management ---
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.add('hidden'));

      btn.classList.add('active');
      document.getElementById(target).classList.remove('hidden');

      if (target === 'settings-tab') {
        loadRequirements();
      }
    });
  });

  // --- Initial Loading ---
  loadHistory();

  async function loadHistory() {
    historyList.innerHTML = '<div class="loading-spinner-sm"></div>';
    try {
      const res = await fetch('/history');
      const data = await res.json();
      historyList.innerHTML = '';

      if (data.logs && data.logs.length > 0) {
        data.logs.forEach(log => {
          const item = document.createElement('div');
          item.className = 'history-item';
          item.innerHTML = `
                        <div class="h-meta">
                            <span class="rank-badge rank-${log.rank || 'Unknown'}" style="font-size:0.65em; padding:2px 5px;">${log.rank || '不明'}</span>
                            <span style="font-size:0.75rem;">${new Date(log.timestamp).toLocaleDateString('ja-JP')}</span>
                            <button class="delete-history-btn" data-id="${log.id}"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                        <div class="h-url" title="${log.url}">${log.url}</div>
                        ${log.score ? `<div class="h-score">適合度: ${log.score}%</div>` : ''}
                    `;

          // Separate click handlers for item vs delete button
          item.onclick = (e) => {
            if (!e.target.closest('.delete-history-btn')) {
              showLogDetails(log.id);
            }
          };

          item.querySelector('.delete-history-btn').onclick = async (e) => {
            e.stopPropagation();
            if (confirm('この履歴を削除しますか？')) {
              await deleteHistory(log.id);
            }
          };

          historyList.appendChild(item);
        });
      } else {
        historyList.innerHTML = '<p style="color:#64748b; font-size:0.8rem; text-align:center;">履歴はありません</p>';
      }
    } catch (e) {
      console.error(e);
      historyList.innerHTML = '<p style="color:#ef4444; font-size:0.8rem;">履歴の読み込みに失敗しました</p>';
    }
  }

  async function deleteHistory(id) {
    try {
      const res = await fetch(`/log/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'success') {
        loadHistory();
      }
    } catch (e) {
      alert('削除に失敗しました');
    }
  }

  // --- Dynamic URL Inputs ---
  addUrlBtn.addEventListener('click', () => {
    const currentInputs = urlInputsContainer.querySelectorAll('.input-group');
    if (currentInputs.length >= 5) {
      alert('一度に追加できるのは5件までです。');
      return;
    }

    const div = document.createElement('div');
    div.className = 'input-group';
    div.innerHTML = `
            <input type="url" name="url" placeholder="https://example.com/job/..." required>
            <button type="button" class="icon-btn remove-btn"><i class="fa-solid fa-xmark"></i></button>
        `;
    urlInputsContainer.appendChild(div);
    updateRemoveButtons();
  });

  urlInputsContainer.addEventListener('click', (e) => {
    if (e.target.closest('.remove-btn')) {
      e.target.closest('.input-group').remove();
      updateRemoveButtons();
    }
  });

  function updateRemoveButtons() {
    const inputs = urlInputsContainer.querySelectorAll('.input-group');
    inputs.forEach(group => {
      const btn = group.querySelector('.remove-btn');
      btn.disabled = inputs.length === 1;
    });
  }

  // --- URL Analysis Flow ---
  analyzeBtn.addEventListener('click', async () => {
    toggleLoading(analyzeBtn, true);
    resultsSection.classList.add('hidden');
    resultsGrid.innerHTML = '';

    const inputs = Array.from(document.querySelectorAll('input[name="url"]'));
    const urls = inputs.map(input => input.value.trim()).filter(val => val);

    if (urls.length === 0) {
      alert("URLを1つ以上入力してください");
      toggleLoading(analyzeBtn, false);
      return;
    }

    try {
      const res = await fetch('/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls })
      });
      const data = await res.json();
      renderResults(data.results);
      loadHistory();
    } catch (error) {
      alert('診断に失敗しました: ' + error);
    } finally {
      toggleLoading(analyzeBtn, false);
    }
  });

  // --- Text Analysis Flow ---
  analyzeTextBtn.addEventListener('click', async () => {
    const text = jobTextInput.value.trim();
    if (!text) {
      alert("求人テキストを入力してください");
      return;
    }

    toggleLoading(analyzeTextBtn, true);
    resultsSection.classList.add('hidden');
    resultsGrid.innerHTML = '';

    try {
      const res = await fetch('/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const result = await res.json();
      renderResults([result]);
      loadHistory();
    } catch (error) {
      alert('診断に失敗しました: ' + error);
    } finally {
      toggleLoading(analyzeTextBtn, false);
    }
  });

  // --- Requirements Logic ---
  async function loadRequirements() {
    requirementsInput.value = '読み込み中...';
    try {
      const res = await fetch('/requirements');
      const data = await res.json();
      requirementsInput.value = data.content;
    } catch (e) {
      requirementsInput.value = 'エラー: 読み込みに失敗しました';
    }
  }

  saveRequirementsBtn.addEventListener('click', async () => {
    const content = requirementsInput.value;
    saveRequirementsBtn.disabled = true;
    saveRequirementsBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 保存中...';

    try {
      const res = await fetch('/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert('希望条件を保存しました。');
      } else {
        alert('保存に失敗しました: ' + data.message);
      }
    } catch (e) {
      alert('エラー: 保存に失敗しました。');
    } finally {
      saveRequirementsBtn.disabled = false;
      saveRequirementsBtn.innerHTML = '<i class="fa-solid fa-save"></i> 設定を保存';
    }
  });

  // --- UI Helpers ---
  function toggleLoading(btn, isLoading) {
    btn.disabled = isLoading;
    const text = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.btn-loader');
    if (text && loader) {
      if (isLoading) {
        text.classList.add('hidden');
        loader.classList.remove('hidden');
      } else {
        text.classList.remove('hidden');
        loader.classList.add('hidden');
      }
    }
  }

  function renderResults(results) {
    resultsSection.classList.remove('hidden');
    results.forEach(result => {
      const card = document.createElement('div');
      card.className = 'result-card animated';

      if (result.status === 'error') {
        card.innerHTML = `
                  <span class="rank-badge rank-Error">エラー</span>
                  <div class="card-content">
                      <h4>${result.message}</h4>
                      <div class="h-url" style="color:#94a3b8">${result.url}</div>
                  </div>
              `;
      } else {
        card.innerHTML = `
                  <div class="card-header">
                    <span class="rank-badge rank-${result.rank}">${result.rank} 判定</span>
                    ${result.score ? `<span class="score-pill">${result.score}% 適合</span>` : ''}
                  </div>
                  <div class="card-content">
                      <h4 title="${result.url}">${result.url}</h4>
                      <p class="card-date">先ほど診断</p>
                  </div>
              `;
        card.onclick = () => showLogDetails(result.id);
      }
      resultsGrid.appendChild(card);
    });

    resultsSection.scrollIntoView({ behavior: 'smooth' });
  }

  // --- Modal Logic ---
  async function showLogDetails(id) {
    modal.classList.remove('hidden');
    modalBody.innerHTML = '<div class="loading-spinner-sm" style="margin:50px auto;"></div>';

    try {
      const res = await fetch(`/log/${id}`);
      const data = await res.json();

      modalBody.innerHTML = `
                <div class="modal-header-actions">
                    <div class="modal-title-info">
                        <span class="rank-badge rank-${data.rank}" style="font-size: 1.1rem; padding: 6px 16px;">${data.rank} 判定</span>
                        ${data.score ? `<span class="score-pill" style="font-size:1.1rem;">${data.score}% 適合</span>` : ''}
                    </div>
                    <div class="modal-tools">
                        <button id="copy-report-btn" class="icon-text-btn"><i class="fa-solid fa-copy"></i> 結果をコピー</button>
                        <a href="${data.url.startsWith('http') ? data.url : '#'}" target="_blank" class="icon-text-btn ${data.url.startsWith('http') ? '' : 'hidden'}">
                            <i class="fa-solid fa-external-link-alt"></i> 求人ページ
                        </a>
                    </div>
                </div>
                <div class="modal-main-content">
                    ${data.html}
                </div>
            `;

      document.getElementById('copy-report-btn').onclick = () => {
        navigator.clipboard.writeText(data.markdown).then(() => {
          alert('Markdown形式でレポートをコピーしました。');
        });
      };

    } catch (e) {
      modalBody.innerHTML = '<p>詳細の読み込みに失敗しました。</p>';
    }
  }

  closeModal.onclick = () => modal.classList.add('hidden');
  window.onclick = (e) => {
    if (e.target == modal) modal.classList.add('hidden');
  }
});
