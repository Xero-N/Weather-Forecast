// Select HTML elements
const input = document.querySelector("#city-input");  // Input field for the city name
const button = document.querySelector("#search-btn"); // Button to initiate the search
const current = document.querySelector(".current-weather"); // Container for current weather
const forecast = document.querySelector(".days-forecast");  // Container for 5-day forecast
const key = "bd4804ca81b8b99bb00f4f17d9ecb269"; // Your OpenWeatherMap API key
const cache = {}; // Cache for storing fetched weather data

// Create a weather card for the UI
const createCard = (city, item, index) => {
    const first = index === 0; // Check if it's the first card (current weather)
    const date = first ? city : `(${item.dt_txt.split(" ")[0]})`; // Date information
    const temp = (item.main.temp - 273.15).toFixed(2); // Temperature in Celsius
    const { speed: wind } = item.wind; // Wind speed
    const { humidity } = item.main; // Humidity
    const { icon, description } = item.weather[0]; // Weather icon and description
    const classes = first ? 'bg-primary text-white' : 'bg-secondary text-white'; // Card styling

    // Create HTML content for the card
    const html = `
        <div class="${first ? 'mt-3' : 'col mb-3'}">
            <div class="card border-0 ${classes}">
                <div class="card-body p-3 text-white">
                    <h5 class="card-title fw-semibold">${date}</h5>
                    <img src="https://openweathermap.org/img/wn/${icon}.png" alt="weather icon">
                    <h6 class="card-text my-3 mt-3">${first ? 'Temperature' : 'Temp'}: ${temp}°C</h6>
                    <h6 class="card-text my-3">Wind: ${wind} M/S</h6>
                    <h6 class="card-text my-3">Humidity: ${humidity}%</h6>
                    <h6 class="card-text my-3">${description}</h6>
                </div>
            </div>
        </div>`;
    return html;
};

// Fetch and display weather details for a city
const getDetails = (city, lat, lon) => {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}`;
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to fetch data for ${city}`);
            return response.json();
        })
        .then(data => {
            // Cache the weather data
            cache[city] = data;

            // Extract the current weather and the 5-day forecast
            const [currentWeather, ...forecastArray] = data.list.slice(0, 6);

            // Display the current weather separately
            current.innerHTML = createCard(city, currentWeather, 0);

            // Create cards for the 5-day forecast
            forecast.innerHTML = forecastArray.map((item, index) => createCard(city, item, index + 1)).join('');
        })
        .catch(error => alert(`An error occurred: ${error.message}`));
};

// Fetch city coordinates and get weather details when the search button is clicked
const getCoordinates = () => {
    const cityName = input.value.trim();

    // Check if the city name is empty
    if (!cityName) {
        alert("Please enter a city name.");
        return;
    }

    // Fetch city coordinates using the city name
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${key}`;
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to fetch coordinates for ${cityName}`);
            return response.json();
        })
        .then(data => {
            // Check if coordinates are found
            if (!data.length) {
                alert(`No coordinates found for ${cityName}`);
                return;
            }

            // Extract latitude, longitude, and city name from the response
            const { lat, lon, name } = data[0];

            // Get weather details based on coordinates and city name
            getDetails(name, lat, lon);
        })
        .catch(() => {
            alert("An error occurred while fetching the coordinates!");
        });
};

// Add an event listener to the search button
button.addEventListener("click", getCoordinates);
