const userWeather = document.querySelector("[userWeather]");
const searchWeather = document.querySelector("[searchWeather]");

const grantLocation = document.querySelector(".grant-location");
const grantAccess = document.querySelector("[grant-access]");
const formContainer = document.querySelector("[location-search-form]");
const locationSearchInput = document.querySelector("[location-search-input]");
const weatherParentContainer = document.querySelector(
  ".weather-parent-container"
);

const loadingScreen = document.querySelector(".loading-screen");
const userWeatherInfo = document.querySelector(".user-weather-info");

const errorClass = document.querySelector(".error-class");

let currentTab = userWeather;
const API_KEY = "688c5fb47c4dab7e6ad3ae470839fea0";
currentTab.classList.add("current-tab");
getLocationFromStorage();

function switchingTabs(clickedTab) {
  if (clickedTab != currentTab) {
    currentTab.classList.remove("current-tab");
    currentTab = clickedTab;
    currentTab.classList.add("current-tab");
    if (!formContainer.contains(document.querySelector(".activate"))) {
      userWeatherInfo.classList.remove("activate");
      grantLocation.classList.remove("activate");
      formContainer.classList.add("activate");
    } else {
      formContainer.classList.remove("activate");
      userWeatherInfo.classList.remove("activate");
      getLocationFromStorage();
    }
  }
}

userWeather.addEventListener("click", () => {
  switchingTabs(userWeather);
});

searchWeather.addEventListener("click", () => {
  switchingTabs(searchWeather);
});

function getLocationFromStorage() {
  const localCoordinates = sessionStorage.getItem("user-coordinates");
  if (!localCoordinates) {
    grantLocation.classList.add("activate");
  } else {
    const coordinates = JSON.parse(localCoordinates);
    fetchUserWeather(coordinates);
  }
}

async function fetchUserWeather(coordinates) {
  const { lat, lon } = coordinates;
  grantLocation.classList.remove("activate");
  loadingScreen.classList.add("activate");
  errorClass.classList.remove("activate");

  try {
    const fetchedInfo = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const weatherData = await fetchedInfo.json();
    if (!weatherData.sys) {
      throw weatherData;
    }
    loadingScreen.classList.remove("activate");
    userWeatherInfo.classList.add("activate");
    renderWeatherInfo(weatherData);
  } catch (error) {
    loadingScreen.classList.remove("activate");
    errorClass.classList.add("activate");
  }
}

function renderWeatherInfo(weatherData) {
  const cityName = document.querySelector("[city-name]");
  const countryFlag = document.querySelector("[country-flag]");
  const weatherDescription = document.querySelector("[weather-description]");
  const weatherIcon = document.querySelector("[weather-icon]");
  const cityTemperature = document.querySelector("[city-temperature]");
  const windspeed = document.querySelector("[windspeed]");
  const humidity = document.querySelector("[humidity]");
  const cloudiness = document.querySelector("[cloudiness]");

  cityName.innerText = weatherData?.name;
  countryFlag.src = `https://flagcdn.com/144x108/${weatherData?.sys?.country.toLowerCase()}.png`;
  weatherDescription.innerText = weatherData?.weather?.[0]?.description;
  weatherIcon.src = `https://openweathermap.org/img/w/${weatherData?.weather?.[0]?.icon}.png`;
  cityTemperature.innerText = `${weatherData?.main?.temp}°C`;
  windspeed.innerText = `${weatherData?.wind?.speed}m/s`;
  humidity.innerText = weatherData?.main?.humidity + "%";
  cloudiness.innerText = weatherData?.clouds?.all + "%";
}

function showPosition(position) {
  const userCoordinates = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  };
  sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
  fetchUserWeather(userCoordinates);
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    errorClass.classList.add("activate");
  }
}

grantAccess.addEventListener("click", getLocation);

formContainer.addEventListener("submit", (e) => {
  e.preventDefault();
  let cityName = locationSearchInput.value;
  if (cityName === "") return;
  else fetchSearchWeather(cityName);
  formContainer.reset();
});

async function fetchSearchWeather(city) {
  loadingScreen.classList.add("activate");
  userWeatherInfo.classList.remove("activate");
  grantLocation.classList.remove("activate");

  try {
    const fetchedInfo = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    const weatherData = await fetchedInfo.json();
    if (!weatherData.sys) {
      throw weatherData;
    }
    loadingScreen.classList.remove("activate");
    userWeatherInfo.classList.add("activate");
    renderWeatherInfo(weatherData);
  } catch (error) {
    loadingScreen.classList.remove("activate");
    errorClass.classList.add("activate");
  }
}
