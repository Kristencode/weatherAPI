let secretKey = "bbc866c78ccd689ab15a1de21e627ba0";
let formContainer = document.querySelector("form");
let isCelsius = true; // Track temperature unit
let currentData = null; // Store current weather data for unit conversion

// Initialize Intl.DisplayNames to use later in returning full country names rather than country code e.g JOS, NIGERIA and not JOS,NG.
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

// Function to update date and time dynamically
function updateDateTime(timezoneOffset) {
  const date = document.querySelector("#date");
  if (!date) {
    console.error("Date element (#date) not found");
    return;
  }
  const update = function () {
    const now = new Date();
    // Adjust for city's timezone (offset in seconds)
    const localTime = new Date(now.getTime() + timezoneOffset * 1000 + now.getTimezoneOffset() * 60000);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    const formattedDate = localTime.toLocaleString("en-US", options);
    date.textContent = formattedDate;
    // console.log("Updated date/time:", formattedDate, "Timezone offset:", timezoneOffset); // Debug
  };
  update();
  // Clear any existing intervals to prevent duplicates
  clearInterval(window.dateUpdateInterval);
  window.dateUpdateInterval = setInterval(update, 60000); // Update every minute
}


formContainer.addEventListener("submit", function (event) {
  event.preventDefault();
  let inputValue = document.querySelector("input").value.trim();
  let city = inputValue;
  if (city) {
    getCurrentWeather(city);
  } else {
    alert("Please enter a city name.");
  }
});

// Fetch API starts here
function getCurrentWeather(city) {
  // the url + the key/city..assigned the url to a new variable
  let fetchedApi = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${secretKey}&units=metric`;

  fetch(fetchedApi)
    .then(function (res) {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })

    // if the city isn't found or data doesn't read 200 which is 'OK' or 'success' it returns
    .then(function (data) {
      if (data.cod !== 200) {
        alert(`Error: ${data.message || "City not found"}`);
        return;
      }
      console.log("API Response:", data); // Log API data just to see output if ok (Debug)
      currentData = data; // Store data for unit conversion
      updateUI(data);
    })
    .catch(function (err) {
      console.error("Error fetching weather data:", err);
      alert("Failed to fetch weather data. Please check your API key or internet connection.");
    });
}

// Update User Interface with weather data Fetched from API
function updateUI(data) {
  console.log("Updating UI with data:", data); // Log data just to see output if ok for extracting needed parameters to display (Just for Debug)

  // Update city and country with full name using Intl.DisplayNames initially initialized and stored with the regionNames variable
  const country = regionNames.of(data.sys.country) || data.sys.country;
  document.querySelector("h1").textContent = `${data.name.toUpperCase()}, ${country.toUpperCase()}`;

  // Update weather info (clear, clouds etc., rainFeel, humidity, wind and pressure, calculated timeZone from timeStamp returned from API and so on.)
  document.querySelector("#weatherMain").textContent = data.weather[0].main;
  document.querySelector("img").src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

  // Update date and time with timezone
  updateDateTime(data.timezone);

  // Update temperatures based on unit
  updateTemperatures();

  // Update weather info cards
  const realFeel = document.querySelector("#realFeel");
  const humidity = document.querySelector("#humidity");
  const wind = document.querySelector("#wind");
  const pressure = document.querySelector("#pressure");

  if (realFeel && humidity && wind && pressure) {
    realFeel.innerHTML = isCelsius
      ? `${Math.round(data.main.feels_like)}°C`
      : `${Math.round((data.main.feels_like * 9) / 5 + 32)}°F`;
    humidity.textContent = `${data.main.humidity}%`;
    wind.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`; // Data returns in m/s from API, Convert m/s to km/h
    pressure.textContent = `${data.main.pressure} hPa`;

    // Trigger fade-in animation
    [realFeel, humidity, wind, pressure].forEach(function (el) {
      el.parentElement.classList.remove("animate-fade");
      void el.parentElement.offsetWidth; // Force reflow
      el.parentElement.classList.add("animate-fade");
    });
  } else {
    console.error("Card elements not found:", { realFeel, humidity, wind, pressure });
    alert("Error: Could not update weather cards. Check HTML IDs for appropriate CSS Selector.");
  }

  // Update background video based on temperature and weather
  updateBackground(data.main.temp, data.weather[0].main);
}

// Update temperatures based on unit
function updateTemperatures() {
  if (!currentData) return;
  const mainTempC = Math.round(currentData.main.temp);
  const mainTempF = Math.round((currentData.main.temp * 9) / 5 + 32);
  const minTemp = isCelsius
    ? Math.round(currentData.main.temp_min)
    : Math.round((currentData.main.temp_min * 9) / 5 + 32);
  const maxTemp = isCelsius
    ? Math.round(currentData.main.temp_max)
    : Math.round((currentData.main.temp_max * 9) / 5 + 32);

  // Update main temperature display
  document.querySelector("#Maintemp").innerHTML = isCelsius ? `${mainTempC}°` : `${mainTempF}°`;

  // Update min/max temperatures
  const minMaxElements = document.querySelectorAll("#MinMax");
  if (minMaxElements.length === 2) {
    minMaxElements[0].innerHTML = `Min ${minTemp}°`;
    minMaxElements[1].innerHTML = `Max ${maxTemp}°`;
  } else {
    console.error("MinMax elements not found or incorrect count:", minMaxElements);
  }

  // Update temperature values next to °C/°F icons
  const tempCElement = document.querySelector("#tempC");
  const tempFElement = document.querySelector("#tempF");
  if (tempCElement && tempFElement) {
    tempCElement.textContent = mainTempC;
    tempFElement.textContent = mainTempF;
  } else {
    console.error("Temperature toggle elements not found:", { tempCElement, tempFElement });
  }
}

// Toggle temperature unit between Celsius or Fahrenheit highlighted in blue for specific clicks
document.querySelectorAll(".unit-toggle").forEach(function (span) {
  span.addEventListener("click", function (e) {
    isCelsius = e.target.dataset.unit === "C";
    document.querySelectorAll(".unit-toggle").forEach(function (s) {
      s.classList.toggle("text-blue-600", s.dataset.unit === (isCelsius ? "C" : "F"));
      s.classList.toggle("text-white", s.dataset.unit !== (isCelsius ? "C" : "F"));
    });
    if (currentData) {
      updateUI(currentData); // Refresh User Interface with new unit
    }
  });
});

// Update background video based on temperature and weather
function updateBackground(temp, weatherMain) {
  const videoElement = document.querySelector("#background-video");
  if (!videoElement) {
    console.error("Video element (#background-video) not found");
    return;
  }

  //Route and match appropriate URL to designated weather condition
  let videoUrl = "";
  // Check for rainy conditions first
  if (["rain", "drizzle"].includes(weatherMain.toLowerCase())) {
    videoUrl = "https://videos.pexels.com/video-files/29392056/12660201_1440_2560_32fps.mp4"; // Rain video url
  } else {
    // Temperature-based videos
    if (temp < 0) {
      // Extreme cold => Snow
      videoUrl = "https://videos.pexels.com/video-files/855614/855614-uhd_2560_1440_25fps.mp4"; // Snow video url
    } else if (temp >= 0 && temp < 10) {
      // Cold => Frosty/windy
      videoUrl = "https://videos.pexels.com/video-files/30884246/13205726_2560_1440_30fps.mp4"; // Frosty video url
    } else if (temp >= 10 && temp < 20) {
      // Cool => Cloudy
      videoUrl = "https://videos.pexels.com/video-files/4211579/4211579-hd_1920_1080_30fps.mp4"; // Cloudy video url
    } else if (temp >= 20 && temp < 30) {
      // Warm => Sunny
      videoUrl = "https://videos.pexels.com/video-files/2935032/2935032-uhd_2560_1440_30fps.mp4"; // Sunny video url
    } else {
      // Hot => Desert/heat
      videoUrl = "https://videos.pexels.com/video-files/7895576/7895576-hd_1920_1080_30fps.mp4"; // Desert video url
    }
  }

  //Video with smooth transition
  videoElement.classList.add("opacity-0"); // Fade out
  setTimeout(function () {
    videoElement.src = videoUrl;
    videoElement.load();
    videoElement.play();
    videoElement.classList.remove("opacity-0"); // Fade in
  }, 500); // Match transition duration
}