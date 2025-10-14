document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('.page-info .search-filter input[type="search"]');
  const visitorTableBody = document.querySelector('.visitor-log tbody');
  const filterSelect = document.querySelector('.page-info .search-filter select');

  // 🔍 Filter visitor rows based on search and dropdown
  function filterVisitorLog() {
    const searchTerm = searchInput.value.toLowerCase();
    const filterValue = filterSelect.value.toLowerCase();
    const rows = visitorTableBody.querySelectorAll('tr');

    rows.forEach(row => {
      const visitorId = row.cells[0]?.textContent.toLowerCase() || '';
      const name = row.cells[1]?.textContent.toLowerCase() || '';
      const vehicleId = row.cells[2]?.textContent.toLowerCase() || '';
      const purpose = row.cells[3]?.textContent.toLowerCase() || '';
      const host = row.cells[4]?.textContent.toLowerCase() || '';
      const qrStatus = row.cells[7]?.textContent.toLowerCase() || '';

      const combinedText = `${visitorId} ${name} ${vehicleId} ${purpose} ${host} ${qrStatus}`;

      const matchesSearch = combinedText.includes(searchTerm);
      const matchesFilter = (filterValue === 'all qr codes' || qrStatus === filterValue);

      if (matchesSearch && matchesFilter) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  // 🔁 Event listeners
  if (searchInput) {
    searchInput.addEventListener('input', filterVisitorLog);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', filterVisitorLog);
  }

  // 🧭 Event delegation for icon actions
  if (visitorTableBody) {
    visitorTableBody.addEventListener('click', (e) => {
      if (e.target.classList.contains('icon')) {
        const icon = e.target.textContent;
        const row = e.target.closest('tr');
        const visitorName = row.cells[1]?.textContent.trim();

        switch (icon) {
          case '👁️':
            alert(`View details for: ${visitorName}`);
            break;
          case '✏️':
            alert(`Edit info for: ${visitorName}`);
            break;
          case '🗑️':
            if (confirm(`Are you sure you want to delete ${visitorName}?`)) {
              row.remove();
            }
            break;
        }
      }
    });
  }

  // ✅ Initial filter on page load (optional)
  filterVisitorLog();
});
