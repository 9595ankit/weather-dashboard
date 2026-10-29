const searchForm = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-search");
const statusMessage = document.querySelector("#status");
const currentWeather = document.querySelector("#current-weather");
const forecastContainer = document.querySelector("#forecast");
const recentSearchesContainer = document.querySelector("#recent-searches");
const themeToggle = document.querySelector("#theme-toggle");

const THEME_KEY = "weatherDashboardTheme";
const RECENT_KEY = "weatherDashboardRecentSearches";

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  searchWeather(cityInput.value.trim());
});

themeToggle.addEventListener("click", toggleTheme);

function setTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark", isDark);
  themeToggle.textContent = isDark ? "Switch to light mode" : "Switch to dark mode";
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
}

function toggleTheme() {
  const isDark = document.body.classList.contains("dark");
  setTheme(isDark ? "light" : "dark");
}

function setWeatherTheme(weatherCode) {
  document.body.classList.remove(
    "theme-sunny",
    "theme-cloudy",
    "theme-rainy",
    "theme-storm"
  );

  if ([95, 96, 99].includes(weatherCode)) {
    document.body.classList.add("theme-storm");
  } else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
    document.body.classList.add("theme-rainy");
  } else if ([0, 1].includes(weatherCode)) {
    document.body.classList.add("theme-sunny");
  } else {
    document.body.classList.add("theme-cloudy");
  }
}

async function searchWeather(cityName) {
  clearWeather();
  statusMessage.classList.remove("error");

  if (!cityName) {
    showError("Please enter a city name.");
    return;
  }

  statusMessage.textContent = "Finding the city and loading its weather…";

  try {
    const location = await fetchLocation(cityName);
    const weather = await fetchForecast(location);
    displayWeather(location, weather);
    saveRecentSearch(location.name);
    renderRecentSearches();
    statusMessage.textContent = "";
  } catch (error) {
    showError(error.message);
  }
}

async function fetchLocation(cityName) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.search = new URLSearchParams({
    name: cityName,
    count: "1",
    language: "en",
    format: "json"
  });

  let response;

  try {
    response = await fetch(url);
  } catch {
    throw new Error("Could not connect. Check your internet connection and try again.");
  }

  if (!response.ok) {
    throw new Error("Could not search for that city. Please try again.");
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("City not found. Check the spelling and try again.");
  }

  return data.results[0];
}

async function fetchForecast(location) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: location.latitude,
    longitude: location.longitude,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    forecast_days: "7",
    timezone: "auto"
  });

  let response;

  try {
    response = await fetch(url);
  } catch {
    throw new Error("Could not connect. Check your internet connection and try again.");
  }

  if (!response.ok) {
    throw new Error("Could not load the forecast. Please try again.");
  }

  return response.json();
}

function displayWeather(location, weather) {
  const current = weather.current;
  const currentInfo = getWeatherInfo(current.weather_code, current.is_day);

  setWeatherTheme(current.weather_code);

  const card = document.createElement("article");
  card.className = "current-card";

  const top = document.createElement("div");
  top.className = "current-top";

  const place = document.createElement("div");
  const heading = document.createElement("h2");
  heading.textContent = location.name;

  const locationDetail = document.createElement("p");
  locationDetail.className = "location-detail";
  locationDetail.textContent = [location.admin1, location.country]
    .filter(Boolean)
    .join(", ");

  place.append(heading, locationDetail);

  const updated = document.createElement("p");
  updated.className = "location-detail";
  updated.textContent = `Updated: ${formatTime(current.time)}`;
  top.append(place, updated);

  const summary = document.createElement("div");
  summary.className = "current-summary";

  const icon = document.createElement("span");
  icon.className = "weather-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = currentInfo.icon;

  const temperatureBlock = document.createElement("div");

  const temperature = document.createElement("p");
  temperature.className = "temperature";
  temperature.textContent = `${Math.round(current.temperature_2m)}°C`;

  const condition = document.createElement("p");
  condition.className = "condition";
  condition.textContent = currentInfo.label;

  temperatureBlock.append(temperature, condition);
  summary.append(icon, temperatureBlock);

  const stats = document.createElement("div");
  stats.className = "weather-stats";
  stats.append(
    makeStat("Feels like", `${Math.round(current.apparent_temperature)}°C`),
    makeStat("Wind speed", `${current.wind_speed_10m} km/h`),
    makeStat("Humidity", `${current.relative_humidity_2m}%`),
    makeStat("Precipitation", `${current.precipitation} mm`)
  );

  card.append(top, summary, stats);
  currentWeather.append(card);

  displayForecast(weather.daily);
}

function displayForecast(daily) {
  const heading = document.createElement("h2");
  heading.className = "forecast-heading";
  heading.textContent = "7-day forecast";
  forecastContainer.append(heading);

  daily.time.forEach((date, index) => {
    const info = getWeatherInfo(daily.weather_code[index], 1);
    const card = document.createElement("article");
    card.className = "forecast-card";

    const day = document.createElement("p");
    day.className = "forecast-day";
    day.textContent = formatDay(date);

    const icon = document.createElement("p");
    icon.className = "forecast-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = info.icon;

    const condition = document.createElement("p");
    condition.className = "forecast-condition";
    condition.textContent = info.label;

    const temperatures = document.createElement("p");
    temperatures.className = "forecast-temperatures";
    temperatures.textContent =
      `${Math.round(daily.temperature_2m_max[index])}° / ` +
      `${Math.round(daily.temperature_2m_min[index])}°`;

    card.append(day, icon, condition, temperatures);
    forecastContainer.append(card);
  });
}

function makeStat(label, value) {
  const stat = document.createElement("div");
  stat.className = "stat";

  const statLabel = document.createElement("span");
  statLabel.className = "stat-label";
  statLabel.textContent = label;

  const statValue = document.createElement("span");
  statValue.className = "stat-value";
  statValue.textContent = value;

  stat.append(statLabel, statValue);
  return stat;
}

function getWeatherInfo(code, isDay = 1) {
  if (code === 0) {
    return {
      label: isDay ? "Clear sky" : "Clear night",
      icon: isDay ? "☀️" : "🌙"
    };
  }

  if (code === 1) return { label: "Mainly clear", icon: "🌤️" };
  if (code === 2) return { label: "Partly cloudy", icon: "⛅" };
  if (code === 3) return { label: "Overcast", icon: "☁️" };
  if ([45, 48].includes(code)) return { label: "Fog", icon: "🌫️" };
  if ([51, 53, 55, 56, 57].includes(code)) return { label: "Drizzle", icon: "🌦️" };

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { label: "Rain", icon: "🌧️" };
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { label: "Snow", icon: "🌨️" };
  }

  if ([95, 96, 99].includes(code)) {
    return { label: "Thunderstorm", icon: "⛈️" };
  }

  return { label: "Unknown conditions", icon: "🌡️" };
}

function formatTime(dateTime) {
  const date = new Date(dateTime);

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function formatDay(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);
}

function clearWeather() {
  currentWeather.replaceChildren();
  forecastContainer.replaceChildren();
}

function showError(message) {
  statusMessage.textContent = message;
  statusMessage.classList.add("error");
}

function getRecentSearches() {
  try {
    const saved = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(cityName) {
  const searches = getRecentSearches().filter(
    (name) => name.toLowerCase() !== cityName.toLowerCase()
  );

  searches.unshift(cityName);
  localStorage.setItem(RECENT_KEY, JSON.stringify(searches.slice(0, 5)));
}

function renderRecentSearches() {
  recentSearchesContainer.replaceChildren();

  for (const cityName of getRecentSearches()) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = cityName;

    button.addEventListener("click", () => {
      cityInput.value = cityName;
      searchWeather(cityName);
    });

    recentSearchesContainer.append(button);
  }
}

function loadSavedTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  setTheme(savedTheme === "dark" ? "dark" : "light");
}

loadSavedTheme();
renderRecentSearches();