// Function to toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

// Event listener for dark mode toggle button
document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

// Function to filter visitor records
function filterVisitors() {
    const input = document.getElementById('visitorSearch');
    const filter = input.value.toLowerCase();
    const table = document.getElementById('visitorTable');
    const rows = table.getElementsByTagName('tr');

    for (let i = 1; i < rows.length; i++) { // Start from 1 to skip header
        const cells = rows[i].getElementsByTagName('td');
        let found = false;

        for (let j = 0; j < cells.length; j++) {
            if (cells[j]) {
                const txtValue = cells[j].textContent || cells[j].innerText;
                if (txtValue.toLowerCase().indexOf(filter) > -1) {
                    found = true;
                    break;
                }
            }
        }
        rows[i].style.display = found ? "" : "none"; // Show or hide row
    }
}

// Event listener for search input
document.getElementById('visitorSearch').addEventListener('keyup', filterVisitors);

// Function to show modal for adding/editing residents/guards
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = "block";
}

// Function to close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = "none";
}

// Event listener for closing modals
window.onclick = function(event) {
    const modals = document.getElementsByClassName('modal');
    for (let i = 0; i < modals.length; i++) {
        if (event.target === modals[i]) {
            closeModal(modals[i].id);
        }
    }
}

// Form validation for adding residents/guards
function validateForm(formId) {
    const form = document.getElementById(formId);
    const inputs = form.getElementsByTagName('input');
    let valid = true;

    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value === "") {
            valid = false;
            inputs[i].classList.add('error');
        } else {
            inputs[i].classList.remove('error');
        }
    }

    return valid;
}

// Example of form submission handling
document.getElementById('addResidentForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission
    if (validateForm('addResidentForm')) {
        // Proceed with form submission (e.g., AJAX call)
        alert('Resident added successfully!');
        closeModal('addResidentModal'); // Close modal after submission
    } else {
        alert('Please fill in all fields.');
    }
});
