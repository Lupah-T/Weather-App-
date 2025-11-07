# 🌤 Weather Finder Web App

A simple, modern weather web application built using **HTML, CSS, and JavaScript**.  
Users can enter a city name to get real-time weather data including:
- Temperature  
- Weather conditions  
- Humidity  
- Wind speed  
- Weather icons  

The app also supports:
✅ Auto-detecting user location  
✅ Search history stored in localStorage  
✅ Clean glassmorphism UI

---

## 🚀 Live Demo
(If you host it on GitHub Pages, add the link here)

---

## 🛠 Features
- Search weather by **city & country**
- **Animated weather icons**
- **User location detection (GPS)**
- **Search history** – clickable and saved locally
- Responsive and stylish UI

---

## 📦 Technologies Used
| Tool / Tech | Purpose |
|-------------|---------|
| HTML | Structure |
| CSS | Styling, layout, animations |
| JavaScript | Logic, API calls, browser storage |
| OpenWeather API | Weather data provider |

---

## ✅ Setup & Installation

1. Clone the repository:
git clone https://github.com/your-username/WeatherApp.git


2. Open the project folder:
cd WeatherApp


3. Open `index.html` in your browser:
- Double-click `index.html`  
or  
- Run using Live Server (VS Code extension)

---

## 🔑 Getting Your API Key (Required)

1. Go to: https://home.openweathermap.org/users/sign_up  
2. Create an account (free)
3. Get your API key from: https://home.openweathermap.org/api_keys
4. Open `script.js` and replace this line:
```js
const apiKey = "YOUR_API_KEY_HERE";


WeatherApp/
│── index.html
│── style.css
│── script.js
└── README.md

       🎯 How It Works

User types a city → data is requested from OpenWeather API

Weather results + icons are displayed

Each successful search is saved in history

User can click past searches to load again

"Use My Location" button fetches weather based on GPS

🌍 Future Improvements

Dark/Light mode toggle

3-day or 7-day forecast

Offline support

PWA (Installable as mobile app)

🤝 Contributions

Contributions, issues, and feature requests are welcome!
Feel free to fork this repository.
