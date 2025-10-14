// Sample visitor data
const visitors = [
  {
    name: "Jennifer Anne Lopez",
    purpose: "Family Visit",
    status: "Active",
  },
  {
    name: "Mark Anthony Garcia",
    purpose: "Delivery",
    status: "Active",
  },
  {
    name: "Sarah Jane Villareal",
    purpose: "Business Meeting",
    status: "Expired",
  }
];

// Function to create status badge
function createStatusBadge(status) {
  let colorClass = "";
  
  switch (status.toLowerCase()) {
    case "active":
      colorClass = "badge-active";  // green
      break;
    case "expired":
      colorClass = "badge-expired"; // orange/yellow
      break;
    default:
      colorClass = "badge-default";
      break;
  }
  
  return `<span class="status-badge ${colorClass}">${status}</span>`;
}

// Function to display visitors on the page
function renderVisitors() {
  const visitorsContainer = document.getElementById('recent-visitors');
  visitorsContainer.innerHTML = ""; // Clear previous content

  visitors.forEach(visitor => {
    const visitorDiv = document.createElement('div');
    visitorDiv.classList.add('visitor-entry');
    
    visitorDiv.innerHTML = `
      <strong>${visitor.name}</strong>
      <span class="visitor-purpose">${visitor.purpose}</span>
      ${createStatusBadge(visitor.status)}
      <button class="view-btn" onclick="viewVisitorDetails('${visitor.name}')">👁️</button>
    `;
    
    visitorsContainer.appendChild(visitorDiv);
  });
}

// Function to view visitor details (example)
function viewVisitorDetails(name) {
  const visitor = visitors.find(v => v.name === name);
  if (visitor) {
    alert(`Visitor Name: ${visitor.name}\nPurpose: ${visitor.purpose}\nStatus: ${visitor.status}`);
  } else {
    alert("Visitor not found!");
  }
}

// Initialize visitor list on page load
window.onload = renderVisitors;
function renderVisitors() {
  const tbody = document.getElementById('visitorTableBody');
  tbody.innerHTML = ''; // clear existing rows

  visitors.forEach((visitor, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>V00${index + 1}</td>
      <td><strong>${visitor.name}</strong></td>
      <td> <!-- Vehicle & ID placeholder --></td>
      <td>${visitor.purpose}</td>
      <td>Host Resident Name</td>
      <td><span class="clock-icon">⏲️</span> In:<br /><strong>Time</strong></td>
      <td><span class="status ${visitor.status.toLowerCase()}">${visitor.status}</span></td>
      <td><span class="qr-status valid">Valid</span></td>
      <td class="actions">
        <span class="icon" onclick="viewVisitorDetails('${visitor.name}')">👁️</span>
        <span class="icon">✏️</span>
        <span class="icon">🗑️</span>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Update visitor count
  document.getElementById('visitor-count').textContent = visitors.length;
}
