// Generate QR code for manual input
function registerVisitor() {
  const info = document.getElementById("visitorInfo").value;
  if (!info) {
    alert("Please enter visitor info!");
    return;
  }

  document.getElementById("qr-code").innerHTML = "";

  const qrCanvas = document.createElement("canvas");
  QRCode.toCanvas(qrCanvas, info, { width: 200 }, function (error) {
    if (error) console.error(error);
  });

  document.getElementById("qr-code").appendChild(qrCanvas);

  document.getElementById("qr-result").classList.remove("hidden");
  document.getElementById("qr-details").innerText = info;

  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 1);
  document.getElementById("expiry-date").innerText = expiry.toDateString();
}

// Print only QR
function printQRCode() {
  const qrSection = document.getElementById("qr-result").innerHTML;
  const printWindow = window.open("", "_blank");
  printWindow.document.write("<html><head><title>Print QR</title></head><body>");
  printWindow.document.write(qrSection);
  printWindow.document.write("</body></html>");
  printWindow.document.close();
  printWindow.print();
}

// Theme toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
  const html = document.documentElement;
  html.classList.toggle('dark');
  if (html.classList.contains('dark')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
});

// Walk-in modal open/close
function openWalkInForm() {
  document.getElementById("walkin-form").classList.remove("hidden");
}

function closeWalkInForm() {
  document.getElementById("walkin-form").classList.add("hidden");
}

// Save Walk-in Visitor
async function saveWalkInVisitor() {
  const name = document.getElementById("walkin-name").value;
  const contact = document.getElementById("walkin-contact").value;
  const age = document.getElementById("walkin-age").value;
  const plate = document.getElementById("walkin-plate").value;
  const purpose = document.getElementById("walkin-purpose").value;

  if (!name || !contact || !age || !plate || !purpose) {
    alert("⚠️ Please fill all fields!");
    return;
  }

  // Generate QR data
  const qrData = `${name} | ${plate} | ${purpose}`;
  const qrCanvas = document.createElement("canvas");
  await QRCode.toCanvas(qrCanvas, qrData, { width: 200 });
  const qrUrl = qrCanvas.toDataURL("image/png");

  const visitor = {
    fullName: name,
    contactNumber: contact,
    age: age,
    plateNumber: plate,
    purpose: purpose,
    visitDate: new Date().toISOString().split("T")[0],
    visitTime: new Date().toLocaleTimeString(),
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
    qrUrl: qrUrl
  };

  try {
    await addDoc(collection(window.db, "visitors"), visitor);
    console.log("✅ Walk-in visitor added:", visitor);

    const dbTable = document.getElementById("visitor-database");
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td class="py-2 pr-4 border-b border-slate-200 dark:border-slate-700">${visitor.fullName}</td>
      <td class="py-2 pr-4 border-b border-slate-200 dark:border-slate-700">${visitor.plateNumber}</td>
      <td class="py-2 border-b border-slate-200 dark:border-slate-700">${new Date(visitor.expiryDate).toLocaleDateString()}</td>
    `;
    dbTable.prepend(newRow);

    closeWalkInForm();
    alert("✅ Walk-in visitor added successfully!");
  } catch (error) {
    console.error("❌ Error adding walk-in:", error);
    alert("Failed to add walk-in visitor.");
  }
}
