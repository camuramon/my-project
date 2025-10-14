document.addEventListener('DOMContentLoaded', () => {

    // Toggle dark mode
    document.getElementById('darkModeToggle')?.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });

    // Filter visitor records
    document.getElementById('visitorSearch')?.addEventListener('keyup', () => {
        const input = document.getElementById('visitorSearch');
        const filter = input.value.toLowerCase();
        const table = document.getElementById('visitorTable');
        const rows = table.getElementsByTagName('tr');

        for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('td');
            let found = false;
            for (let j = 0; j < cells.length; j++) {
                if (cells[j]) {
                    const txtValue = cells[j].textContent || cells[j].innerText;
                    if (txtValue.toLowerCase().indexOf(filter) > -1) {
                        found = true;
                        break;
                    }
                }
            }
            rows[i].style.display = found ? "" : "none";
        }
    });

    // Show modal
    window.showModal = function (modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = "block";
    };

    // Close modal
    window.closeModal = function (modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = "none";
    };

    // Close modal when clicking outside
    window.onclick = function (event) {
        const modals = document.getElementsByClassName('modal');
        for (let i = 0; i < modals.length; i++) {
            if (event.target === modals[i]) {
                closeModal(modals[i].id);
            }
        }
    };

    // Form validation
    function validateForm(formId) {
        const form = document.getElementById(formId);
        const inputs = form.getElementsByTagName('input');
        let valid = true;

        for (let i = 0; i < inputs.length; i++) {
            if (inputs[i].value === "") {
                valid = false;
                inputs[i].classList.add('error');
            } else {
                inputs[i].classList.remove('error');
            }
        }

        return valid;
    }

    // Add resident form submit
    document.getElementById('addResidentForm')?.addEventListener('submit', function (event) {
        event.preventDefault();
        if (validateForm('addResidentForm')) {
            alert('Resident added successfully!');
            closeModal('addResidentModal');
        } else {
            alert('Please fill in all fields.');
        }
    });

    // -----------------------------
    // 📦 STEP 4: Resident table functions
    // -----------------------------

    const searchInput = document.querySelector('input[placeholder*="Search"]');
    const statusSelect = document.querySelector('select'); // Adjust if needed
    const exportBtn = document.querySelector('.export-btn');
    const residentRows = Array.from(document.querySelectorAll('tbody tr'));

    // Search functionality
    searchInput?.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        residentRows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    });

    // Filter by status
    statusSelect?.addEventListener('change', () => {
        const selectedStatus = statusSelect.value.toLowerCase();
        residentRows.forEach(row => {
            const accountStatus = row.querySelector('td:nth-child(7)')?.textContent.toLowerCase() || '';
            const qrStatus = row.querySelector('td:nth-child(8)')?.textContent.toLowerCase() || '';
            if (selectedStatus === 'all statuses' || accountStatus === selectedStatus || qrStatus === selectedStatus) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Export CSV
    exportBtn?.addEventListener('click', () => {
        let csvContent = "Resident ID,Name,Email,Address,Contact,Vehicle,Account Status,QR Status\n";
        residentRows.forEach(row => {
            if (row.style.display !== 'none') {
                const cells = Array.from(row.querySelectorAll('td'));
                const rowData = cells.map(td => `"${td.textContent.trim()}"`).join(',');
                csvContent += rowData + "\n";
            }
        });

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', 'residents.csv');
        a.click();
    });

    // Action buttons
    document.querySelector('tbody')?.addEventListener('click', (e) => {
        const btn = e.target;
        const row = btn.closest('tr');
        if (!row) return;

        if (btn.classList.contains('view-btn')) {
            alert(`Viewing details for: ${row.querySelector('td:nth-child(2)')?.textContent.trim()}`);
        } else if (btn.classList.contains('edit-btn')) {
            alert(`Editing details for: ${row.querySelector('td:nth-child(2)')?.textContent.trim()}`);
        } else if (btn.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this resident?')) {
                row.remove();
            }
        }
    });

});
