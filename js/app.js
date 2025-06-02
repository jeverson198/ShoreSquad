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
    ],
    // Weather configuration
    WEATHER_REFRESH_INTERVAL: 600000, // Refresh weather every 10 minutes
    WEATHER_UNITS: 'metric', // Use Celsius
    UV_INDEX_LEVELS: {
        low: 2,
        moderate: 5,
        high: 7,
        veryHigh: 10
    }
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

    // Show loading state
    weatherContainer.innerHTML = `
        <div class="weather-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading weather information...</p>
        </div>
    `;
    
    try {
        // Get weather for each cleanup location
        const weatherPromises = CONFIG.SAMPLE_LOCATIONS.map(async location => {
            // Get current weather
            const weatherResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&appid=${CONFIG.WEATHER_API_KEY}&units=${CONFIG.WEATHER_UNITS}`
            );
            
            // Get forecast data
            const forecastResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lng}&appid=${CONFIG.WEATHER_API_KEY}&units=${CONFIG.WEATHER_UNITS}`
            );

            if (!weatherResponse.ok || !forecastResponse.ok) {
                throw new Error('Weather data fetch failed');
            }

            const weatherData = await weatherResponse.json();
            const forecastData = await forecastResponse.json();

            return {
                current: weatherData,
                forecast: forecastData,
                location: location
            };
        });

        const weatherData = await Promise.all(weatherPromises);
        
        // Display weather for each location
        weatherContainer.innerHTML = weatherData.map(data => {
            const current = data.current;
            const forecast = data.forecast.list.slice(0, 3); // Next 9 hours (3 time slots)
            const weatherCondition = current.weather[0];
            const windSpeed = Math.round(current.wind.speed * 3.6); // Convert m/s to km/h
            
            // Determine if conditions are suitable for beach cleanup
            const isGoodForCleanup = current.main.temp >= 22 && 
                                   current.main.temp <= 32 && 
                                   windSpeed < 30 && 
                                   !weatherCondition.main.includes('Rain');

            return `
                <div class="weather-card ${isGoodForCleanup ? 'good-conditions' : 'poor-conditions'}">
                    <div class="weather-card-header">
                        <h3>${data.location.name}</h3>
                        <div class="weather-recommendation">
                            ${isGoodForCleanup ? 
                                '<span class="good"><i class="fas fa-check-circle"></i> Good for Cleanup</span>' : 
                                '<span class="poor"><i class="fas fa-exclamation-circle"></i> Poor Conditions</span>'
                            }
                        </div>
                    </div>
                    
                    <div class="current-weather">
                        <div class="weather-icon">
                            <img src="https://openweathermap.org/img/wn/${weatherCondition.icon}@2x.png" 
                                 alt="${weatherCondition.description}"
                                 title="${weatherCondition.description}">
                        </div>
                        <div class="weather-info">
                            <p class="temperature">${Math.round(current.main.temp)}°C</p>
                            <p class="description">${weatherCondition.description}</p>
                        </div>
                    </div>

                    <div class="weather-details">
                        <div class="detail">
                            <i class="fas fa-tint"></i>
                            <span>${current.main.humidity}%</span>
                            <small>Humidity</small>
                        </div>
                        <div class="detail">
                            <i class="fas fa-wind"></i>
                            <span>${windSpeed} km/h</span>
                            <small>Wind</small>
                        </div>
                        <div class="detail">
                            <i class="fas fa-temperature-low"></i>
                            <span>${Math.round(current.main.feels_like)}°C</span>
                            <small>Feels Like</small>
                        </div>
                    </div>

                    <div class="forecast">
                        <h4>Next Hours</h4>
                        <div class="forecast-items">
                            ${forecast.map(item => `
                                <div class="forecast-item">
                                    <span class="time">${new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" 
                                         alt="${item.weather[0].description}"
                                         title="${item.weather[0].description}">
                                    <span class="temp">${Math.round(item.main.temp)}°C</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="last-updated">
                        Last updated: ${new Date(current.dt * 1000).toLocaleTimeString()}
                    </div>
                </div>
            `;
        }).join('');

        // Set up auto-refresh
        setTimeout(initializeWeather, CONFIG.WEATHER_REFRESH_INTERVAL);

    } catch (error) {
        console.error('Weather fetch error:', error);
        weatherContainer.innerHTML = `
            <div class="weather-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Weather data temporarily unavailable</p>
                <button onclick="initializeWeather()" class="retry-button">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
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
