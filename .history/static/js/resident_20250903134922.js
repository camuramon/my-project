// Sample data from the screenshot
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

const residentDirectory = document.getElementById("resident-directory");

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

function renderResidents(residentsList) {
  // Clear existing table body
  residentDirectory.innerHTML = "";

  residentsList.forEach((res) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="bold">${res.id}</td>
      <td><span class="bold">${res.name}</span><span class="email">${res.email}</span></td>
      <td>${res.address}</td>
      <td>${res.contact}</td>
      <td><span class="vehicle-type">${res.vehicleType}</span><br>${res.vehiclePlate}</td>
      <td></td> <!-- Account Status -->
      <td></td> <!-- QR Status -->
      <td class="actions-cell"></td>
    `;

    // Add badges dynamically for Account Status and QR Status
    tr.children[5].appendChild(createBadge(res.accountStatus, res.accountStatus));
    tr.children[6].appendChild(createBadge(res.qrStatus, res.qrStatus));

    // Actions could have buttons / icons if needed
    tr.children[7].textContent = ""; // Empty as screenshot shows no visible action content

    residentDirectory.appendChild(tr);
  });
}

// Initial render
renderResidents(residents);

// You can add event listeners to filter, search, export, and add buttons here...
