// Cleanup event data (replace with backend data in production)
const upcomingEvents = [
    {
        id: 1,
        location: "East Coast Park",
        date: "2025-06-15",
        time: "09:00",
        spotsAvailable: 15,
        equipment: {
            gloves: true,
            bags: true,
            pickers: true
        }
    },
    {
        id: 2,
        location: "Pasir Ris Beach",
        date: "2025-06-22",
        time: "08:30",
        spotsAvailable: 10,
        equipment: {
            gloves: true,
            bags: true,
            pickers: false
        }
    },
    {
        id: 3,
        location: "Changi Beach",
        date: "2025-06-29",
        time: "09:30",
        spotsAvailable: 20,
        equipment: {
            gloves: true,
            bags: true,
            pickers: true
        }
    }
];

// Initialize the join page
document.addEventListener('DOMContentLoaded', () => {
    initializeEventCards();
    initializeLocationDropdown();
    setupDateValidation();
});

// Initialize event cards
function initializeEventCards() {
    const eventCardsContainer = document.querySelector('.event-cards');
    if (!eventCardsContainer) return;

    eventCardsContainer.innerHTML = upcomingEvents.map(event => `
        <div class="event-card">
            <div class="event-header">
                <h4>${event.location}</h4>
                <span class="spots-available">${event.spotsAvailable} spots left</span>
            </div>
            <div class="event-details">
                <p><i class="far fa-calendar"></i> ${formatDate(event.date)}</p>
                <p><i class="far fa-clock"></i> ${event.time}</p>
            </div>
            <div class="event-equipment">
                <p>Equipment provided:</p>
                <div class="equipment-icons">
                    ${event.equipment.gloves ? '<span title="Gloves provided"><i class="fas fa-mitten"></i></span>' : ''}
                    ${event.equipment.bags ? '<span title="Trash bags provided"><i class="fas fa-shopping-bag"></i></span>' : ''}
                    ${event.equipment.pickers ? '<span title="Trash pickers provided"><i class="fas fa-hand-lizard"></i></span>' : ''}
                </div>
            </div>
            <button onclick="selectEvent(${event.id})" class="select-event-btn">Select Event</button>
        </div>
    `).join('');
}

// Initialize location dropdown
function initializeLocationDropdown() {
    const locationSelect = document.getElementById('cleanup-location');
    if (!locationSelect) return;

    const locations = [...new Set(upcomingEvents.map(event => event.location))];
    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationSelect.appendChild(option);
    });
}

// Setup date validation
function setupDateValidation() {
    const dateInput = document.getElementById('cleanup-date');
    if (!dateInput) return;

    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    // Set max date to 3 months from today
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    dateInput.max = maxDate.toISOString().split('T')[0];
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();

    const formData = {
        location: document.getElementById('cleanup-location').value,
        date: document.getElementById('cleanup-date').value,
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        teamSize: document.getElementById('team-size').value,
        experience: document.getElementById('experience').value,
        equipment: {
            gloves: document.getElementById('need-gloves').checked,
            bags: document.getElementById('need-bags').checked,
            picker: document.getElementById('need-picker').checked
        },
        notes: document.getElementById('notes').value
    };

    // TODO: Send formData to backend
    console.log('Form submitted:', formData);

    // Show success message
    showSuccessMessage();
    return false;
}

// Select an event
function selectEvent(eventId) {
    const event = upcomingEvents.find(e => e.id === eventId);
    if (!event) return;

    // Fill form with event details
    document.getElementById('cleanup-location').value = event.location;
    document.getElementById('cleanup-date').value = event.date;
}

// Show success message
function showSuccessMessage() {
    const formContainer = document.querySelector('.signup-form');
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <h3>Registration Successful!</h3>
        <p>Thank you for joining the cleanup event. We'll send you a confirmation email with more details.</p>
        <button onclick="location.reload()" class="cta-button">Register Another Team</button>
    `;
    formContainer.innerHTML = '';
    formContainer.appendChild(successMessage);
}

// Helper function to format date
function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}
