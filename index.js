const input = document.getElementById('input');
const searchButton = document.getElementById('button');
const locationButton = document.getElementById('location');
const currentWeather = document.querySelector('.right');
const weatherCard = document.querySelector('.low-data');

const API_KEY = "c5216983382eea66dd0d2881527a98b7";

const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0) {  
        return `<div class="details">
                    <h3>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <p class="matter">Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</p>
                    <p class="matter">Wind: ${weatherItem.wind.speed} m/s</p>
                    <p class="matter">Humidity: ${weatherItem.main.humidity}%</p>
                </div>
                <div class="image">
                    <img id="icon" src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png">
                    <p id="caption">${weatherItem.weather[0].description}</p>
                </div>`;
    } else {
        return `<div class="forecast">
                    <h3>${weatherItem.dt_txt.split(" ")[0]}</h3>
                    <img id="png" src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}.png" alt="weather icon">
                    <p class="matter">Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</p>
                    <p class="matter">Wind: ${weatherItem.wind.speed} m/s</p> 
                    <p class="matter">Humidity: ${weatherItem.main.humidity}%</p>
                </div>`;
    }
}

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast/?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            const uniqueForecastDays = new Set();
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();

                if (!uniqueForecastDays.has(forecastDate) && uniqueForecastDays.size < 5) {
                    uniqueForecastDays.add(forecastDate);
                    return true;
                }
                return false;
            });

            weatherCard.innerHTML = ""; 
            currentWeather.innerHTML = ""; 

            fiveDaysForecast.forEach((weatherItem, index ) => {
                if (index === 0) {
                    currentWeather.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                } else {
                    weatherCard.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                }
            });
        })
        .catch(() => {
            alert("An error occurred while fetching the weather forecast.");
        });
}

const getCityCoordinates = () => {
    const cityName = input.value.trim();

    if (!cityName) {
        alert("Enter a city name");
        return;  
    }

    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            if (!data.length) {
                alert(`No coordinates found for ${cityName}`);
                return;  
            }

            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert("An error occurred while fetching the data.");
        });
};

const getUserCoordinates = () =>{
    navigator.geolocation.getCurrentPosition(
        position => {
            const {latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(REVERSE_GEOCODING_URL)
                .then(res => res.json())
                .then(data => {
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(() => {
                    alert("An error occurred while fetching the city!.");
                });
            },
            error => {
                if(error.code === error.PERMISSION_DENIED){
                    console.log("Permission has denied.");
            }
        }
    );
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
