// Configuration
const CONFIG = {
    // OpenWeatherMap API key
    WEATHER_API_KEY: '54a8fba1e50f30924b4b5106f48266ba',
    // Default map center (Singapore)
    DEFAULT_LAT: 1.3521,
    DEFAULT_LNG: 103.8198,
    // Sample cleanup locations (replace with actual data from backend)
    SAMPLE_LOCATIONS: [
        { name: "East Coast Park", lat: 1.3001, lng: 103.9147 },
        { name: "Pasir Ris Beach", lat: 1.3721, lng: 103.9493 },
        { name: "Changi Beach", lat: 1.3891, lng: 103.9911 }
    ]
};

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    initializeWeather();
    initializeCommunityStats();
    setupResponsiveNav();
});

// Map initialization function using Leaflet.js
function initializeMap() {
    const mapContainer = document.querySelector('.map-container');
    if (!mapContainer) return;

    // Create a div with specific ID for Leaflet
    mapContainer.innerHTML = '<div id="map" style="height: 100%;"></div>';
    
    const map = L.map('map').setView([CONFIG.DEFAULT_LAT, CONFIG.DEFAULT_LNG], 12);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add markers for cleanup locations
    CONFIG.SAMPLE_LOCATIONS.forEach(location => {
        L.marker([location.lat, location.lng])
            .bindPopup(`
                <h3>${location.name}</h3>
                <p>Next Cleanup: Coming Soon</p>
                <button onclick="joinCleanup('${location.name}')" class="popup-button">Join Cleanup</button>
            `)
            .addTo(map);
    });
}

// Weather data function using OpenWeatherMap API
async function initializeWeather() {
    const weatherContainer = document.querySelector('.weather-container');
    if (!weatherContainer) return;
    
    try {
        // Get weather for each cleanup location
        const weatherPromises = CONFIG.SAMPLE_LOCATIONS.map(async location => {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&appid=${CONFIG.WEATHER_API_KEY}&units=metric`
            );
            if (!response.ok) throw new Error('Weather data fetch failed');
            return response.json();
        });

        const weatherData = await Promise.all(weatherPromises);
        
        // Display weather for each location
        weatherContainer.innerHTML = weatherData.map(data => `
            <div class="weather-card">
                <h3>${data.name}</h3>
                <div class="weather-icon">
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
                </div>
                <div class="weather-info">
                    <p class="temperature">${Math.round(data.main.temp)}°C</p>
                    <p class="description">${data.weather[0].description}</p>
                    <p class="humidity">Humidity: ${data.main.humidity}%</p>
                    <p class="wind">Wind: ${data.wind.speed} m/s</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Weather fetch error:', error);
        weatherContainer.innerHTML = '<p class="error">Weather data temporarily unavailable</p>';
    }
}

// Community statistics
function initializeCommunityStats() {
    const statsContainer = document.querySelector('.stats-container');
    if (!statsContainer) return;
    
    // Sample statistics (replace with actual data from backend)
    const stats = {
        totalCleanups: 150,
        volunteersEngaged: 1200,
        trashCollected: 5000, // in kg
        beachesCleaned: 15
    };

    statsContainer.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <i class="fas fa-broom"></i>
                <h3>${stats.totalCleanups}</h3>
                <p>Cleanups Completed</p>
            </div>
            <div class="stat-card">
                <i class="fas fa-users"></i>
                <h3>${stats.volunteersEngaged}</h3>
                <p>Volunteers Engaged</p>
            </div>
            <div class="stat-card">
                <i class="fas fa-trash"></i>
                <h3>${stats.trashCollected}kg</h3>
                <p>Trash Collected</p>
            </div>
            <div class="stat-card">
                <i class="fas fa-umbrella-beach"></i>
                <h3>${stats.beachesCleaned}</h3>
                <p>Beaches Cleaned</p>
            </div>
        </div>
    `;
}

// Responsive navigation menu
function setupResponsiveNav() {
    const nav = document.querySelector('.nav-container');
    const navList = document.querySelector('.nav-links');
    
    // Create hamburger menu button
    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger';
    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
    
    // Insert hamburger button into nav
    nav.insertBefore(hamburger, navList);
    
    // Toggle navigation on hamburger click
    hamburger.addEventListener('click', () => {
        navList.classList.toggle('nav-active');
        hamburger.classList.toggle('active');
    });
}

// Helper function for cleanup registration
function joinCleanup(location) {
    // TODO: Implement signup/registration logic
    alert(`Thanks for your interest in joining the cleanup at ${location}! Registration coming soon.`);
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const element = document.querySelector(this.getAttribute('href'));
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
