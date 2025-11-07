const apiKey = "YOUR_API_KEY";
const weatherIcon = document.getElementById("weatherIcon");
const resultDiv = document.getElementById("result");
const historyList = document.getElementById("history");

// Load search history on startup
loadHistory();

// Search by city name
async function getWeather() {
    const city = document.getElementById("city").value.trim();
    if (!city) {
        resultDiv.innerHTML = "⚠️ Enter a city name.";
        return;
    }

    await fetchWeather(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    saveToHistory(city);
}

// Auto detect location
function getMyLocation() {
    if (!navigator.geolocation) {
        resultDiv.innerHTML = "❌ Geolocation not supported by your browser.";
        return;
    }

    navigator.geolocation.getCurrentPosition(success, error);

    function success(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        fetchWeather(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        saveToHistory("My Location");
    }

    function error() {
        resultDiv.innerHTML = "Could not get your location.";
    }
}

// Fetch weather data + icon
async function fetchWeather(endpoint) {
    try {
        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.cod != 200) {
            resultDiv.innerHTML = `❌ ${data.message}`;
            return;
        }

        const cityName = data.name;
        const temp = data.main.temp;
        const humidity = data.main.humidity;
        const weatherMain = data.weather[0].main;
        const icon = data.weather[0].icon;

        // Insert icon
        weatherIcon.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
        weatherIcon.style.display = "block";

        // Show weather
        resultDiv.innerHTML = `
            🌍 <b>${cityName}</b><br>
            🌡 Temperature: <b>${temp}°C</b><br>
            💧 Humidity: <b>${humidity}%</b><br>
            🌤 Condition: <b>${weatherMain}</b>
        `;

    } catch (error) {
        resultDiv.innerHTML = "❌ Error fetching data";
    }
}

// ✅ Save search history
function saveToHistory(city) {
    let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];

    if (!history.includes(city)) {
        history.push(city);
        localStorage.setItem("weatherHistory", JSON.stringify(history));
        displayHistory();
    }
}

// ✅ Load history on startup
function loadHistory() {
    displayHistory();
}

// ✅ Display history on page
function displayHistory() {
    let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
    historyList.innerHTML = "";

    history.forEach(item => {
        let li = document.createElement("li");
        li.innerText = item;
        li.style.cursor = "pointer";
        li.onclick = () => {
            document.getElementById("city").value = item;
            getWeather();
        };
        historyList.appendChild(li);
    });
}
