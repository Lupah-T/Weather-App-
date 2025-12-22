const apiKey = "dafd9b17b13d072e9061ea8fab71e8bd";
const cityInput = document.getElementById("city");
const weatherResult = document.getElementById("weatherResult");
const forecastContainer = document.getElementById("forecastContainer");
const forecastList = document.getElementById("forecastList");
const loader = document.getElementById("loader");
const historyList = document.getElementById("history");
const unitToggle = document.getElementById("unitToggle");

let currentUnits = localStorage.getItem("weatherUnits") || "metric"; // metric or imperial
unitToggle.innerText = currentUnits === "metric" ? "°C" : "°F";

// Initialize
loadHistory();

// Handle Enter key
cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") getWeather();
});

async function getWeather() {
    const city = cityInput.value.trim();
    if (!city) return;

    showLoader(true);
    try {
        await Promise.all([
            fetchWeather(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${currentUnits}`),
            fetchForecast(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${currentUnits}`)
        ]);
        saveToHistory(city);
    } catch (err) {
        console.error(err);
    } finally {
        showLoader(false);
    }
}

async function getMyLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
    }

    showLoader(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            await Promise.all([
                fetchWeather(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${currentUnits}`),
                fetchForecast(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${currentUnits}`)
            ]);
        } catch (err) {
            console.error(err);
        } finally {
            showLoader(false);
        }
    }, () => {
        alert("Could not get location");
        showLoader(false);
    });
}

async function fetchWeather(endpoint) {
    const res = await fetch(endpoint);
    const data = await res.json();

    if (data.cod !== 200) {
        alert(data.message);
        return;
    }

    displayWeather(data);
    updateBackground(data.weather[0].main);
}

async function fetchForecast(endpoint) {
    const res = await fetch(endpoint);
    const data = await res.json();

    if (data.cod !== "200") return;

    // Filter to get one forecast per day (around noon)
    const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));
    displayForecast(dailyData);
}

let currentTimeInterval = null;

function displayWeather(data) {
    weatherResult.style.display = "block";

    // City Time Logic
    if (currentTimeInterval) clearInterval(currentTimeInterval);
    updateCityTime(data.timezone);
    currentTimeInterval = setInterval(() => updateCityTime(data.timezone), 10000); // Update every 10s

    document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    document.getElementById("temperature").innerText = Math.round(data.main.temp);
    document.getElementById("cityName").innerText = `${data.name}, ${data.sys.country}`;
    document.getElementById("coordinates").innerText = `Lat: ${data.coord.lat.toFixed(2)} | Lon: ${data.coord.lon.toFixed(2)}`;
    document.getElementById("description").innerText = data.weather[0].description;

    document.getElementById("feelsLike").innerText = `${Math.round(data.main.feels_like)}°`;
    document.getElementById("humidity").innerText = `${data.main.humidity}%`;
    document.getElementById("windSpeed").innerText = `${data.wind.speed} ${currentUnits === 'metric' ? 'm/s' : 'mph'}`;
    document.getElementById("pressure").innerText = `${data.main.pressure} hPa`;

    suggestClothing(data.main.temp, data.weather[0].main);
}

function updateCityTime(timezoneOffset) {
    const d = new Date();
    const localTime = d.getTime();
    const localOffset = d.getTimezoneOffset() * 60000;
    const utc = localTime + localOffset;
    const cityTime = new Date(utc + (1000 * timezoneOffset));

    const hours = cityTime.getHours();
    const minutes = cityTime.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    document.getElementById("cityTime").innerText = `${displayHours}:${minutes} ${ampm}`;

    const timeOfDay = getTimeOfDayInfo(hours);
    document.getElementById("timeIcon").innerText = timeOfDay.icon;
}

function getTimeOfDayInfo(hours) {
    if (hours >= 5 && hours < 12) {
        return { period: "Morning", icon: "🌅" };
    } else if (hours >= 12 && hours < 17) {
        return { period: "Afternoon", icon: "☀️" };
    } else if (hours >= 17 && hours < 20) {
        return { period: "Evening", icon: "🌇" };
    } else {
        return { period: "Night", icon: "🌙" };
    }
}

function suggestClothing(temp, condition) {
    const iconEl = document.getElementById("clothingIcon");
    const textEl = document.getElementById("clothingText");

    let suggestion = { icon: "👕", text: "Wear something comfortable." };

    // Temperature in Celsius for logic
    const tempC = currentUnits === "metric" ? temp : (temp - 32) * 5 / 9;

    if (tempC <= 0) {
        suggestion = { icon: "🧥", text: "It's freezing! Wear a heavy coat, scarf, and gloves." };
    } else if (tempC > 0 && tempC <= 15) {
        suggestion = { icon: "🧥", text: "Chilly weather. A warm jacket or sweater is recommended." };
    } else if (tempC > 15 && tempC <= 25) {
        suggestion = { icon: "👕", text: "Pleasant weather. A light shirt or t-shirt will do." };
    } else {
        suggestion = { icon: "☀️", text: "It's hot! Wear light, breathable clothes and stay hydrated." };
    }

    if (["Rain", "Drizzle", "Thunderstorm"].includes(condition)) {
        suggestion.text += " Don't forget an umbrella! ☔";
    } else if (condition === "Snow") {
        suggestion.text += " Wear waterproof boots! 🥾";
    }

    iconEl.innerText = suggestion.icon;
    textEl.innerText = suggestion.text;
}

function goHome() {
    if (currentTimeInterval) clearInterval(currentTimeInterval);
    cityInput.value = "";
    weatherResult.style.display = "none";
    forecastContainer.style.display = "none";
    document.body.style.background = "linear-gradient(135deg, #0f3443, #34e89e)";
}

function displayForecast(forecastData) {
    forecastContainer.style.display = "block";
    forecastList.innerHTML = "";

    forecastData.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        const item = document.createElement("div");
        item.className = "forecast-item";
        item.innerHTML = `
            <div>${dayName}</div>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="icon">
            <div><b>${Math.round(day.main.temp)}°</b></div>
        `;
        forecastList.appendChild(item);
    });
}

function toggleUnits() {
    currentUnits = currentUnits === "metric" ? "imperial" : "metric";
    localStorage.setItem("weatherUnits", currentUnits);
    unitToggle.innerText = currentUnits === "metric" ? "°C" : "°F";

    // Refresh weather if a city is already displayed
    const cityName = document.getElementById("cityName").innerText;
    if (cityName !== "--") {
        getWeather();
    }
}

function updateBackground(condition) {
    const bgMap = {
        Clear: "linear-gradient(135deg, #FF8C00, #FFD700)",
        Clouds: "linear-gradient(135deg, #606c88, #3f4c6b)",
        Rain: "linear-gradient(135deg, #203a43, #2c5364)",
        Snow: "linear-gradient(135deg, #83a4d4, #b6fbff)",
        Thunderstorm: "linear-gradient(135deg, #141e30, #243b55)",
        Drizzle: "linear-gradient(135deg, #3a7bd5, #3a6073)",
        Mist: "linear-gradient(135deg, #757f9a, #d7dde8)"
    };

    document.body.style.background = bgMap[condition] || "linear-gradient(135deg, #0f3443, #34e89e)";
}

function showLoader(show) {
    loader.style.display = show ? "block" : "none";
    if (show) {
        weatherResult.style.opacity = "0.5";
        forecastContainer.style.opacity = "0.5";
    } else {
        weatherResult.style.opacity = "1";
        forecastContainer.style.opacity = "1";
    }
}

// History Management
function saveToHistory(city) {
    let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
    if (!history.includes(city)) {
        history.unshift(city);
        if (history.length > 5) history.pop();
        localStorage.setItem("weatherHistory", JSON.stringify(history));
        displayHistory();
    }
}

function loadHistory() {
    displayHistory();
}

function displayHistory() {
    let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
    historyList.innerHTML = "";

    history.forEach((city, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${city}</span>
            <span class="delete-icon" onclick="event.stopPropagation(); deleteHistoryItem(${index})">✕</span>
        `;
        li.onclick = () => {
            cityInput.value = city;
            getWeather();
        };
        historyList.appendChild(li);
    });
}

function deleteHistoryItem(index) {
    let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
    history.splice(index, 1);
    localStorage.setItem("weatherHistory", JSON.stringify(history));
    displayHistory();
}

function clearHistory() {
    localStorage.removeItem("weatherHistory");
    displayHistory();
}
