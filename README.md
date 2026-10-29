# Weather Dashboard

A small weather app I built to practice HTML, CSS, and JavaScript. Search for a city to see its current weather and a seven-day forecast. The page also changes color to match the weather: sunny days get a warm yellow theme, rainy days turn blue, cloudy days use grey, and thunderstorms add a lightning flash.

## What it can do

- Search for a city by name, using the Search button or Enter.
- Show the temperature, weather conditions, humidity, wind speed, and precipitation.
- Display a seven-day forecast.
- Change the page colors to match the current weather.
- Switch between light and dark mode and remember that choice.
- Keep up to five recent city searches so they’re easy to open again.
- Show a message when a city can’t be found or the data can’t be loaded.

## Built with

- HTML for the page structure
- CSS for the layout, responsive design, and weather themes
- JavaScript for searching, fetching data, and updating the page
- Open-Meteo’s free Geocoding and Weather Forecast APIs

No API key is needed.

## Project files

```text
weather-dashboard/
├── index.html
├── style.css
└── script.js
```

## Run the app

1. Save the three files in the same folder.
2. Open `index.html` in a browser. If the weather request doesn’t work when opened directly, run the folder using a local server, such as VS Code’s Live Server extension.
3. Search for a city, such as Mumbai or London.

An internet connection is needed to look up cities and load weather data.

## How the search works

The app first sends the city name to Open-Meteo’s Geocoding API to find its latitude and longitude. It then uses those coordinates to request current conditions and the forecast. JavaScript displays the returned data and chooses the page theme from the current weather code.

## What I learned

While building this project, I practised handling form submissions, making API requests with `fetch` and `async`/`await`, working with JSON, displaying loading and error messages, and saving preferences in `localStorage`.

## Data and attribution

Weather data comes from [Open-Meteo](https://open-meteo.com/). City search uses the [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api), and forecasts use the [Weather Forecast API](https://open-meteo.com/en/docs).
