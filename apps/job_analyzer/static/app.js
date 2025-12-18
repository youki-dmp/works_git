document.addEventListener('DOMContentLoaded', () => {
  const urlInputsContainer = document.getElementById('url-inputs');
  const addUrlBtn = document.getElementById('add-url-btn');
  const analyzeForm = document.getElementById('analyze-form');
  const analyzeBtn = document.getElementById('analyze-btn');
  const resultsSection = document.getElementById('results-section');
  const resultsGrid = document.getElementById('results-grid');
  const historyList = document.getElementById('history-list');
  const modal = document.getElementById('detail-modal');
  const modalBody = document.getElementById('modal-body');
  const closeModal = document.querySelector('.close-modal');

  // --- History Loading ---
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
                            <span class="rank-badge rank-${log.rank || 'Unknown'}" style="font-size:0.7em; padding:2px 6px;">${log.rank || '不明'}</span>
                            <span>${new Date(log.timestamp).toLocaleDateString('ja-JP')}</span>
                        </div>
                        <div class="h-url" title="${log.url}">${log.url}</div>
                    `;
          item.onclick = () => showLogDetails(log.id);
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

  // --- Dynamic Inputs ---
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

  // --- Form Submission (Click Handler) ---
  analyzeBtn.addEventListener('click', async (e) => {
    e.preventDefault(); // Just in case

    // UI Loading State
    analyzeBtn.disabled = true;
    analyzeBtn.querySelector('.btn-text').classList.add('hidden');
    analyzeBtn.querySelector('.btn-loader').classList.remove('hidden');
    resultsSection.classList.add('hidden');
    resultsGrid.innerHTML = '';

    // Collect URLs
    const inputs = Array.from(document.querySelectorAll('input[name="url"]'));
    const urls = inputs.map(input => input.value.trim()).filter(val => val);

    if (urls.length === 0) {
      alert("URLを1つ以上入力してください");
      analyzeBtn.disabled = false;
      analyzeBtn.querySelector('.btn-text').classList.remove('hidden');
      analyzeBtn.querySelector('.btn-loader').classList.add('hidden');
      return;
    }

    try {
      const res = await fetch('/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls })
      });
      const data = await res.json();

      // Render Results
      resultsSection.classList.remove('hidden');
      data.results.forEach(result => {
        const card = document.createElement('div');
        card.className = 'result-card';

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
                        <span class="rank-badge rank-${result.rank}">${result.rank} 判定</span>
                        <div class="card-content">
                            <h4>${result.url}</h4>
                            <p class="card-date">先ほど診断</p>
                        </div>
                    `;
          card.onclick = () => showLogDetails(result.id);
        }
        resultsGrid.appendChild(card);
      });

      // Refresh History
      loadHistory();

    } catch (error) {
      console.error(error);
      alert('診断に失敗しました: ' + error);
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.querySelector('.btn-text').classList.remove('hidden');
      analyzeBtn.querySelector('.btn-loader').classList.add('hidden');
    }
  });

  // --- Modal Logic ---
  async function showLogDetails(id) {
    modal.classList.remove('hidden');
    // Change spinner color to match light theme text
    modalBody.innerHTML = '<div class="loading-spinner-sm" style="border-top-color:#0ea5e9; border: 3px solid #e2e8f0; border-top-color: #0ea5e9; margin:50px auto;"></div>';

    try {
      const res = await fetch(`/log/${id}`);
      const data = await res.json();

      // Inject HTML content directly
      modalBody.innerHTML = `
                <div style="margin-bottom:20px;">
                    <a href="${data.url}" target="_blank" style="color:#0ea5e9; text-decoration:none; font-weight:600;">
                        <i class="fa-solid fa-external-link-alt"></i> 元の求人ページを開く
                    </a>
                </div>
                ${data.html}
            `;
    } catch (e) {
      modalBody.innerHTML = '<p>詳細の読み込みに失敗しました。</p>';
    }
  }

  closeModal.onclick = () => modal.classList.add('hidden');
  window.onclick = (e) => {
    if (e.target == modal) modal.classList.add('hidden');
  }
});
