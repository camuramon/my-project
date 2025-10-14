// resident.js

// Sample resident data
const residents = [
  {
    id: "R001",
    name: "John Michael Santos",
    email: "john.santos@email.com",
    address: "Block 1, Lot 15, Cypress Hills",
    contact: "+63 917 123 4567",
    vehicleType: "SUV",
    vehiclePlate: "ABC 1234",
    accountStatus: "Active",
    qrStatus: "Valid",
  },
  {
    id: "R002",
    name: "Maria Clara Dela Cruz",
    email: "maria.delacruz@email.com",
    address: "Block 2, Lot 8, Cypress Hills",
    contact: "+63 918 987 6543",
    vehicleType: "Sedan",
    vehiclePlate: "XYZ 9876",
    accountStatus: "Active",
    qrStatus: "Valid",
  },
  {
    id: "R003",
    name: "Roberto Cruz Martinez",
    email: "robert.martinez@email.com",
    address: "Block 3, Lot 22, Cypress Hills",
    contact: "+63 919 456 7890",
    vehicleType: "Pickup",
    vehiclePlate: "DEF 5555",
    accountStatus: "Suspended",
    qrStatus: "Expired",
  },
  {
    id: "R004",
    name: "Ana Beatriz Reyes",
    email: "ana.reyes@email.com",
    address: "Block 1, Lot 7, Cypress Hills",
    contact: "+63 920 789 0123",
    vehicleType: "Hatchback",
    vehiclePlate: "GHI 7777",
    accountStatus: "Active",
    qrStatus: "Valid",
  },
  {
    id: "R005",
    name: "Carlos Eduardo Silva",
    email: "carlos.silva@email.com",
    address: "Block 4, Lot 11, Cypress Hills",
    contact: "+63 921 345 6789",
    vehicleType: "SUV",
    vehiclePlate: "JKL 2468",
    accountStatus: "Inactive",
    qrStatus: "Expired",
  },
];

// Get the tbody element where rows will be added
const residentDirectory = document.getElementById("resident-directory");

// Helper function to create status badges
function createBadge(text, type) {
  const badge = document.createElement("span");
  badge.classList.add("badge");

  switch (type.toLowerCase()) {
    case "active":
      badge.classList.add("active");
      break;
    case "inactive":
      badge.classList.add("inactive");
      break;
    case "suspended":
      badge.classList.add("suspended");
      break;
    case "valid":
      badge.classList.add("valid");
      break;
    case "expired":
      badge.classList.add("expired");
      break;
  }
  badge.textContent = text;
  return badge;
}

// Function to render residents into the table
function renderResidents(residentsList) {
  // Clear existing rows
  residentDirectory.innerHTML = "";

  residentsList.forEach((res) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="bold">${res.id}</td>
      <td>
        <span class="bold">${res.name}</span><br/>
        <a href="mailto:${res.email}">${res.email}</a>
      </td>
      <td>${res.address}</td>
      <td>${res.contact}</td>
      <td>
        <span class="vehicle-type">${res.vehicleType}</span><br/>
        ${res.vehiclePlate}
      </td>
      <td></td> <!-- Account Status Badge will be added here -->
      <td></td> <!-- QR Status Badge will be added here -->
      <td class="actions-cell"></td> <!-- Actions -->
    `;

    // Append badges for account status and QR status
    tr.children[5].appendChild(createBadge(res.accountStatus, res.accountStatus));
    tr.children[6].appendChild(createBadge(res.qrStatus, res.qrStatus));

    // Leave actions empty or add buttons/icons if needed
    tr.children[7].textContent = "";

    residentDirectory.appendChild(tr);
  });
}

// Run the render function after the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  renderResidents(residents);
});
