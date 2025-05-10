let formContainer = document.querySelector("form");
let secretKey = "bbc866c78ccd689ab15a1de21e627ba0";

formContainer.addEventListener("submit", function (event) {
  event.preventDefault();
  let inputValue = document.querySelector("input").value.trim();
  let city = inputValue;
  if (city) {
    getCurrentWeather(city);
  }
});

// Fetching API starts here
function getCurrentWeather(city) {
  let fetchedApi = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${secretKey}&units=metric`;

  fetch(fetchedApi)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      updateUI(data);
    })
    .catch(function (err) {
      console.error("Error:", err);
    });
}

