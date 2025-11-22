// Announcement page script
window.addEventListener('DOMContentLoaded', () => {
  // Load sidebar (relative to Announcement folder)
  fetch('../SideBar/studentSideBar.html')
    .then(r => r.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const sidebar = doc.querySelector('aside.sidebar');
      const container = document.getElementById('sidebar-container');
      if (sidebar && container) container.appendChild(sidebar);
    }).catch(err => console.warn('Failed to load sidebar', err));

  const annList = document.getElementById('annList');
  const refreshBtn = document.getElementById('refreshBtn');
  const searchInput = document.getElementById('searchInput');
  const typeFilter = document.getElementById('typeFilter');
  const severityFilter = document.getElementById('severityFilter');
  const emptyState = document.getElementById('emptyState');

  // Sample announcements; replace with fetch from backend when available
  const sample = [
    { id: 1, title: 'Orientation Schedule', date: '2025-11-01', type: 'Event', severity: 'Info', body: 'Orientation for new students will be held on Nov 10.' },
    { id: 2, title: 'Holiday Notice', date: '2025-12-20', type: 'Notice', severity: 'Info', body: 'Campus will be closed for the holidays from Dec 24 to Jan 2.' }
  ];

  function render(list){
    if(!annList) return;
    annList.innerHTML = '';
    if (!list || list.length === 0) {
      if (emptyState) emptyState.hidden = false;
      return;
    }

    if (emptyState) emptyState.hidden = true;

    list.forEach(a => {
      const el = document.createElement('div');
      el.className = 'ann-card';
      el.innerHTML = `
        <h4>${a.title}</h4>
        <div class="meta">${a.date} · ${a.type || ''} · ${a.severity || ''}</div>
        <p>${a.body}</p>
      `;
      annList.appendChild(el);
    });
  }

  render(sample);

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      // TODO: fetch announcements from backend
      console.debug('Refresh clicked — would fetch announcements');
      render(sample);
    });
  }

  function applyFilters(){
    let filtered = sample.slice();
    const q = (searchInput?.value || '').trim().toLowerCase();
    const type = typeFilter?.value || '';
    const severity = severityFilter?.value || '';

    if (q) {
      filtered = filtered.filter(a => (a.title + ' ' + a.body).toLowerCase().includes(q));
    }
    if (type) filtered = filtered.filter(a => a.type === type);
    if (severity) filtered = filtered.filter(a => a.severity === severity);

    render(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (typeFilter) typeFilter.addEventListener('change', applyFilters);
  if (severityFilter) severityFilter.addEventListener('change', applyFilters);
});
