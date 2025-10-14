document.addEventListener('DOMContentLoaded', () => {

    // 🌙 Toggle dark mode
    document.getElementById('darkModeToggle')?.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });

    // 🔍 Visitor search filter
    const visitorSearch = document.getElementById('visitorSearch');
    visitorSearch?.addEventListener('keyup', () => {
        const filter = visitorSearch.value.toLowerCase();
        const rows = document.querySelectorAll('#visitorTable tbody tr');

        rows.forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(filter) ? '' : 'none';
        });
    });

    // 📌 Modal functions
    window.showModal = id => document.getElementById(id).style.display = 'block';
    window.closeModal = id => document.getElementById(id).style.display = 'none';

    // Close modal if click outside
    window.onclick = event => {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    };

    // ✅ Form validation
    function validateForm(formId) {
        const form = document.getElementById(formId);
        const inputs = form.querySelectorAll('input[required]');
        let valid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                valid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });

        return valid;
    }

    // Add resident form
    document.getElementById('addResidentForm')?.addEventListener('submit', e => {
        e.preventDefault();
        if (validateForm('addResidentForm')) {
            alert('✅ Resident added successfully!');
            closeModal('addResidentModal');
        } else {
            alert('⚠️ Please fill in all fields.');
        }
    });

    // -----------------------------
    // 👨‍👩‍👧‍👦 Resident table functions
    // -----------------------------
    const searchInput = document.querySelector('.resident-search');
    const statusSelect = document.querySelector('.resident-filter');
    const exportBtn = document.querySelector('.export-btn');
    const residentRows = Array.from(document.querySelectorAll('#residentTable tbody tr'));

    // 🔍 Search
    searchInput?.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        residentRows.forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
        });
    });

    // ⏳ Filter by status
    statusSelect?.addEventListener('change', () => {
        const selected = statusSelect.value.toLowerCase();
        residentRows.forEach(row => {
            const status = row.querySelector('.status')?.textContent.toLowerCase() || '';
            row.style.display = (selected === 'all' || status === selected) ? '' : 'none';
        });
    });

    // 📤 Export CSV
    exportBtn?.addEventListener('click', () => {
        let csvContent = "data:text/csv;charset=utf-8,Resident ID,Name,Email,Address,Contact,Vehicle,Status\n";
        residentRows.forEach(row => {
            if (row.style.display !== 'none') {
                const data = Array.from(row.querySelectorAll('td'))
                                  .map(td => `"${td.textContent.trim()}"`).join(',');
                csvContent += data + "\n";
            }
        });

        const link = document.createElement('a');
        link.href = encodeURI(csvContent);
        link.download = `residents_${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
    });

    // 👁️ Action buttons
    document.querySelector('#residentTable tbody')?.addEventListener('click', e => {
        const btn = e.target;
        const row = btn.closest('tr');
        if (!row) return;

        const name = row.querySelector('td:nth-child(2)')?.textContent.trim();

        if (btn.classList.contains('view-btn')) {
            showModal('viewResidentModal');
            console.log(`Viewing: ${name}`);
        } else if (btn.classList.contains('edit-btn')) {
            showModal('editResidentModal');
            console.log(`Editing: ${name}`);
        } else if (btn.classList.contains('delete-btn')) {
            if (confirm(`Delete ${name}?`)) row.remove();
        }
    });

});

// -----------------------------
// 📊 Charts
// -----------------------------
const vehicleChart = new Chart(document.getElementById("vehicleChart"), {
  type: "pie",
  data: {
    labels: ["Car", "Motorcycle", "Bicycle", "Other"],
    datasets: [{
      data: [5, 3, 2, 1],
      backgroundColor: ["#3498db", "#f1c40f", "#e74c3c", "#2ecc71"]
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false
  }
});

const residentsVisitorsChart = new Chart(document.getElementById("residentsVisitorsChart"), {
  type: "bar",
  data: {
    labels: ["Residents", "Visitors"],
    datasets: [{
      label: "Count",
      data: [10, 5],
      backgroundColor: ["#3498db", "#2ecc71"]
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const rows = document.querySelectorAll("#visitorTable tbody tr");

  rows.forEach(row => {
    const statusCell = row.querySelector("td:nth-child(3) .status");
    const expireDate = row.getAttribute("data-expiration"); // ← kailangan mo ito sa HTML

    if (expireDate) {
      const expDate = new Date(expireDate);
      const now = new Date();

      if (expDate < now) {
        statusCell.textContent = "Expired";
        statusCell.classList.add("expired");
      } else {
        statusCell.textContent = "Active";
        statusCell.classList.add("active");
      }
    }
  });
});
