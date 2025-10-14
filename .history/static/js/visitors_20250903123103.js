<script>
  document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.page-info .search-filter input[type="search"]');
    const visitorTableBody = document.querySelector('.visitor-log tbody');
    const filterSelect = document.querySelector('.page-info .search-filter select');

    // Filter visitor rows based on search input and dropdown filter 
    function filterVisitorLog() {
      const searchTerm = searchInput.value.toLowerCase();
      const filterValue = filterSelect.value;

      // For demo, filterValue is not implemented; can be extended
      const rows = visitorTableBody.querySelectorAll('tr');

      rows.forEach(row => {
        const visitorId = row.cells[0].textContent.toLowerCase();
        const name = row.cells[1].textContent.toLowerCase();
        const vehicleId = row.cells[2].textContent.toLowerCase();
        const purpose = row.cells[3].textContent.toLowerCase();
        const host = row.cells[4].textContent.toLowerCase();

        const combinedText = visitorId + ' ' + name + ' ' + vehicleId + ' ' + purpose + ' ' + host;

        if (combinedText.includes(searchTerm)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    }

    searchInput.addEventListener('input', filterVisitorLog);

    // Optional: Add event listener on filter dropdown when more options added
    filterSelect.addEventListener('change', filterVisitorLog);

    // Event delegation for visitor log actions (view, edit, delete)
    visitorTableBody.addEventListener('click', (e) => {
      if (e.target.classList.contains('icon')) {
        const actionIcon = e.target.textContent;
        const row = e.target.closest('tr');
        const visitorName = row.cells[1].textContent.trim();

        switch (actionIcon) {
          case '👁️':
            alert(`View details for: ${visitorName}`);
            // Implement view functionality here
            break;
          case '✏️':
            alert(`Edit info for: ${visitorName}`);
            // Implement edit functionality here
            break;
          case '🗑️':
            if (confirm(`Are you sure you want to delete visitor: ${visitorName}?`)) {
              row.remove();
            }
            break;
          default:
            break;
        }
      }
    });

    // Optional: You can add export or register visitor button handlers here as needed
  });
</script>
