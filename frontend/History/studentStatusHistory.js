// Status History page script
window.addEventListener('DOMContentLoaded', () => {
  // Load sidebar
  fetch('../SideBar/studentSideBar.html')
    .then(r => r.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const sidebar = doc.querySelector('aside.sidebar');
      const container = document.getElementById('sidebar-container');
      if (sidebar && container) container.appendChild(sidebar);
    }).catch(err => console.warn('Failed to load sidebar', err));

  const historyList = document.getElementById('historyList');
  const emptyState = document.getElementById('emptyState');

  // Sample history entries (empty by default)
  const sample = [];

  function render(list){
    if (!historyList) return;
    historyList.innerHTML = '';

    if (!list || list.length === 0) {
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    list.forEach(item => {
      const el = document.createElement('div');
      el.className = 'history-card';
      el.innerHTML = `
        <div class="icon">📍</div>
        <div>
          <div class="title">${item.type || 'Status Update'}</div>
          <div class="meta">${item.date || ''} · ${item.notes || ''}</div>
        </div>
      `;
      historyList.appendChild(el);
    });
  }

  // TODO: replace with fetch from backend `/student/status_history` when available
  render(sample);
});
