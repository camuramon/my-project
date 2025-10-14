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
      colorClass = "active-visit";  // Match your CSS
      break;
    case "expired":
      colorClass = "expired"; // Match your CSS
      break;
    default:
      colorClass = "badge-default";
      break;
  }

  return `<span class="status ${colorClass}">${status}</span>`;
}

// Function to render visitors into the table
function renderVisitors() {
  const tbody = document.getElementById('visitorTableBody');
  tbody.innerHTML = ''; // Clear previous content

  visitors.forEach((visitor, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>V00${index + 1}</td>
      <td><strong>${visitor.name}</strong></td>
      <td>—</td>
      <td>${visitor.purpose}</td>
      <td>Host Resident</td>
      <td><span class="clock-icon">⏲️</span> In:<br /><strong>14:30</strong></td>
      <td>${createStatusBadge(visitor.status)}</td>
      <td><span class="qr-status valid">Valid</span></td>
      <td class="actions">
        <span class="icon" onclick="viewVisitorDetails('${visitor.name}')">👁️</span>
        <span class="icon">✏️</span>
        <span class="icon">🗑️</span>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Update count
  const countEl = document.getElementById('visitor-count');
  if (countEl) {
    countEl.textContent = visitors.length;
  }
}

// Function to view details
function viewVisitorDetails(name) {
  const visitor = visitors.find(v => v.name === name);
  if (visitor) {
    alert(`Visitor Name: ${visitor.name}\nPurpose: ${visitor.purpose}\nStatus: ${visitor.status}`);
  } else {
    alert("Visitor not found!");
  }
}

// Load on page
window.addEventListener('DOMContentLoaded', renderVisitors);
