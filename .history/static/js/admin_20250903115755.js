// Dashboard.js

document.addEventListener('DOMContentLoaded', () => {
  // Selectors
  const searchInput = document.querySelector('input[type="search"]');
  const filterBtn = document.querySelector('button#filterBtn');
  const exportBtn = document.querySelector('button#exportBtn');
  const notificationBell = document.querySelector('.notification-bell');
  const notificationCount = document.querySelector('.notification-count');
  const detailsModal = document.getElementById('detailsModal');
  const modalClose = document.getElementById('modalClose');
  const modalBody = document.getElementById('modalBody');

  // Data (this should ideally come from the backend)
  let residents = [
    { id: 1, name: "John Michael Santos", address: "Block 1, Lot 15, Cypress Hills", status: "Active" },
    { id: 2, name: "Maria Clara Dela Cruz", address: "Block 2, Lot 8, Cypress Hills", status: "Active" },
    { id: 3, name: "Roberto Cruz Martinez", address: "Block 3, Lot 22, Cypress Hills", status: "Suspended" }
  ];

  let visitors = [
    { id: 1, name: "Jennifer Anne Lopez", purpose: "Family Visit", status: "Active" },
    { id: 2, name: "Mark Anthony Garcia", purpose: "Delivery", status: "Active" },
    { id: 3, name: "Sarah Jane Villareal", purpose: "Business Meeting", status: "Expired" }
  ];

  // Dynamic Cards data
  let dashboardStats = {
    totalResidents: residents.length,
    activeVisitors: visitors.filter(v => v.status.toLowerCase() === 'active').length,
    validQRCodes: 265,
    vehiclesRegistered: 312,
    entryLogsToday: 89,
    properties: 156
  };

  // Update dynamic number cards
  function updateDashboardCards() {
    document.querySelector('#totalResidentsCard .card-value').textContent = dashboardStats.totalResidents;
    document.querySelector('#activeVisitorsCard .card-value').textContent = dashboardStats.activeVisitors;
    document.querySelector('#validQRCardsCard .card-value').textContent = dashboardStats.validQRCodes;
    document.querySelector('#vehiclesRegisteredCard .card-value').textContent = dashboardStats.vehiclesRegistered;
    document.querySelector('#entryLogsCard .card-value').textContent = dashboardStats.entryLogsToday;
    document.querySelector('#propertiesCard .card-value').textContent = dashboardStats.properties;
  }

  // Render tables - Residents and Visitors
  function renderVisitors(filter = '') {
    const recentVisitorsBody = document.querySelector('#recentVisitors tbody');
    recentVisitorsBody.innerHTML = '';
    visitors
      .filter(visitor => visitor.name.toLowerCase().includes(filter.toLowerCase()) || visitor.purpose.toLowerCase().includes(filter.toLowerCase()))
      .forEach(visitor => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${visitor.name}</strong></td>
        <td>${visitor.purpose}</td>
        <td><span class="status ${visitor.status.toLowerCase()}">${visitor.status}</span></td>
        <td><button class="view-details" data-type="visitor" data-id="${visitor.id}" title="View Details">👁️</button></td>
      `;
      recentVisitorsBody.appendChild(row);
    });
  }

  function renderResidents(filter = '') {
    const residentActivityBody = document.querySelector('#residentActivity tbody');
    residentActivityBody.innerHTML = '';
    residents
      .filter(resident => resident.name.toLowerCase().includes(filter.toLowerCase()) || resident.address.toLowerCase().includes(filter.toLowerCase()))
      .forEach(resident => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${resident.name}</strong></td>
        <td>${resident.address}</td>
        <td><span class="status ${resident.status.toLowerCase()}">${resident.status}</span></td>
        <td><button class="view-details" data-type="resident" data-id="${resident.id}" title="View Details">👁️</button></td>
      `;
      residentActivityBody.appendChild(row);
    });
  }

  // Search functionality - filter both tables
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    renderResidents(query);
    renderVisitors(query);
  });

  // Filter button - example toggling expired/active only residents and visitors
  let filterActive = false;
  filterBtn.addEventListener('click', () => {
    filterActive = !filterActive;
    if(filterActive){
      residents = residents.filter(r => r.status.toLowerCase() === 'active');
      visitors = visitors.filter(v => v.status.toLowerCase() === 'active');
    } else {
      // reload original data (typically this requires refetching from backend, here simulated)
      residents = [
        { id: 1, name: "John Michael Santos", address: "Block 1, Lot 15, Cypress Hills", status: "Active" },
        { id: 2, name: "Maria Clara Dela Cruz", address: "Block 2, Lot 8, Cypress Hills", status: "Active" },
        { id: 3, name: "Roberto Cruz Martinez", address: "Block 3, Lot 22, Cypress Hills", status: "Suspended" }
      ];
      visitors = [
        { id: 1, name: "Jennifer Anne Lopez", purpose: "Family Visit", status: "Active" },
        { id: 2, name: "Mark Anthony Garcia", purpose: "Delivery", status: "Active" },
        { id: 3, name: "Sarah Jane Villareal", purpose: "Business Meeting", status: "Expired" }
      ];
    }
    renderResidents(searchInput.value);
    renderVisitors(searchInput.value);
  });

  // Export button - export residents and visitors as CSV
  exportBtn.addEventListener('click', () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Name,Address/ Purpose, Status, Type\n';
    residents.forEach(r => {
      csvContent += `"${r.name}","${r.address}","${r.status}","Resident"\n`;
    });
    visitors.forEach(v => {
      csvContent += `"${v.name}","${v.purpose}","${v.status}","Visitor"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'cypress_dashboard_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Details popup/modal when clicking "eye" icon
  document.body.addEventListener('click', (e) => {
    if(e.target.classList.contains('view-details')) {
      const type = e.target.dataset.type;
      const id = parseInt(e.target.dataset.id);
      let data;
      if(type === 'resident') {
        data = residents.find(r => r.id === id);
        modalBody.innerHTML = `
          <p><b>Name:</b> ${data.name}</p>
          <p><b>Address:</b> ${data.address}</p>
          <p><b>Status:</b> ${data.status}</p>
          <button id="toggleStatusBtn">Toggle Status</button>
        `;

        // Toggle status button inside modal
        document.getElementById('toggleStatusBtn').onclick = () => {
          data.status = (data.status.toLowerCase() === 'active') ? 'Suspended' : 'Active';
          renderResidents(searchInput.value);
          updateDashboardCards();
          detailsModal.style.display = 'none';
        };

      } else if(type === 'visitor') {
        data = visitors.find(v => v.id === id);
        modalBody.innerHTML = `
          <p><b>Name:</b> ${data.name}</p>
          <p><b>Purpose:</b> ${data.purpose}</p>
          <p><b>Status:</b> ${data.status}</p>
          <button id="toggleStatusBtn">Toggle Status</button>
        `;
        document.getElementById('toggleStatusBtn').onclick = () => {
          data.status = (data.status.toLowerCase() === 'active') ? 'Expired' : 'Active';
          renderVisitors(searchInput.value);
          updateDashboardCards();
          detailsModal.style.display = 'none';
        };
      }
      detailsModal.style.display = 'block';
    }
  });

  // Close modal
  modalClose.addEventListener('click', () => {
    detailsModal.style.display = 'none';
  });

  window.onclick = function(event) {
    if (event.target == detailsModal) {
      detailsModal.style.display = "none";
    }
  };

  // Notification Bell handling
  notificationBell.addEventListener('click', () => {
    alert('You have 3 notifications.');
    // Reset count
    notificationCount.style.display = 'none';
  });

  // Initial render
  renderResidents();
  renderVisitors();
  updateDashboardCards();
});
