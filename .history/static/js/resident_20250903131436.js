// Sample resident data (you can replace or fetch this dynamically)
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

// Grab table body element
const residentDirectory = document.getElementById("resident-directory");

// Function to create status badges dynamically
function createBadge(text, type) {
  const badge = document.createElement("span");
  badge.classList.add("badge");

  switch (type.toLowerCase()) {
    case "active":
      badge.classList.add("active");  // style green bg maybe
      break;
    case "inactive":
      badge.classList.add("inactive"); // maybe gray
      break;
    case "suspended":
      badge.classList.add("suspended"); // maybe orange or red
      break;
    case "valid":
      badge.classList.add("valid");  // green
      break;
    case "expired":
      badge.classList.add("expired"); // red or orange
      break;
  }

  badge.textContent = text;
  return badge;
}

// Render residents into the table
function renderResidents(residentsList) {
  residentDirectory.innerHTML = ""; // clear old rows

  residentsList.forEach((res) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="bold">${res.id}</td>
      <td>
        <span class="bold">${res.name}</span><br>
        <span class="email">${res.email}</span>
      </td>
      <td>${res.address}</td>
      <td>${res.contact}</td>
      <td>
        <span class="vehicle-type">${res.vehicleType}</span><br>
        ${res.vehiclePlate}
      </td>
      <td></td> <!-- Account Status badge -->
      <td></td> <!-- QR Status badge -->
      <td class="actions-cell"></td> <!-- For future actions -->
    `;

    // Add badges dynamically
    tr.children[5].appendChild(createBadge(res.accountStatus, res.accountStatus));
    tr.children[6].appendChild(createBadge(res.qrStatus, res.qrStatus));

    // Leave actions empty for now
    tr.children[7].textContent = "";

    residentDirectory.appendChild(tr);
  });
}

// Optionally, add search/filter function here
function setupSearch() {
  const searchInput = document.getElementById("resident-search");
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();

    const filtered = residents.filter(res => {
      return (
        res.id.toLowerCase().includes(term) ||
        res.name.toLowerCase().includes(term) ||
        res.email.toLowerCase().includes(term) ||
        res.address.toLowerCase().includes(term) ||
        res.contact.toLowerCase().includes(term) ||
        res.vehicleType.toLowerCase().includes(term) ||
        res.vehiclePlate.toLowerCase().includes(term) ||
        res.accountStatus.toLowerCase().includes(term) ||
        res.qrStatus.toLowerCase().includes(term)
      );
    });

    renderResidents(filtered);
  });
}

// Initialize
renderResidents(residents);
setupSearch();
