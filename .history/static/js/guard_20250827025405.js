function registerVisitor() {
  const info = document.getElementById("visitorInfo").value;
  if (!info) {
    alert("Please enter visitor info!");
    return;
  }

  // Clear old QR if meron na dati
  document.getElementById("qr-code").innerHTML = "";

  // Generate QR code
  const qrCanvas = document.createElement("canvas");
  QRCode.toCanvas(qrCanvas, info, { width: 200 }, function (error) {
    if (error) console.error(error);
  });

  document.getElementById("qr-code").appendChild(qrCanvas);

  // Show QR result section
  document.getElementById("qr-result").classList.remove("hidden");
  document.getElementById("qr-details").innerText = info;

  // Add expiry date (valid for 1 day)
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 1);
  document.getElementById("expiry-date").innerText = expiry.toDateString();
}

// Print only the QR code section
function printQRCode() {
  const qrSection = document.getElementById("qr-result").innerHTML;
  const printWindow = window.open("", "_blank");
  printWindow.document.write("<html><head><title>Print QR</title></head><body>");
  printWindow.document.write(qrSection);
  printWindow.document.write("</body></html>");
  printWindow.document.close();
  printWindow.print();
}
document.getElementById('theme-toggle').addEventListener('click', () => {
    const html = document.documentElement;
    html.classList.toggle('dark');
    if (html.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});