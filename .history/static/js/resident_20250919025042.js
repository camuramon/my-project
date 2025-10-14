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

// function loadResidents() {
  const tableBody = document.getElementById("resident-table-body");
  tableBody.innerHTML = ""; // clear existing rows

  db.collection("residents")
    .orderBy("created_at", "desc")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const row = `
          <tr>
            <td>${doc.id}</td>
            <td>${data.fullName}</td>
            <td>${data.address}</td>
            <td>${data.contact || ""}</td>
            <td>${data.vehicle || ""}</td>
            <td><span class="status ${data.status.toLowerCase()}">${data.status}</span></td>
            <td><span class="qr-status ${data.qrStatus || "valid"}">${data.qrStatus || "Valid"}</span></td>
            <td class="actions">
              <button title="View"><i class="fas fa-eye"></i></button>
              <button title="Edit"><i class="fas fa-edit"></i></button>
              <button title="Delete"><i class="fas fa-trash"></i></button>
            </td>
          </tr>
        `;
        tableBody.innerHTML += row;
      });
    })
    .catch((error) => console.error("Error loading residents:", error));


window.addEventListener("DOMContentLoaded", loadResidents);
