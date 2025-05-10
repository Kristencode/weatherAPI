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
  // the url + the key/city..assigned the url to a new variable
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

// if the city isn't found or data doesn't read 200 which is 'OK' or 'success' it returns
function updateUI(data) {
  if (!data || data.cod !== 200) {
    alert("City not found!");
    return;
  }

  // the text data.name is the nme of the city. cities searched will be returned as capital letter
  document.querySelector("h1").textContent = data.name.toUpperCase();
  document.querySelector("#weatherMain").textContent = data.weather[0].main;
  document.querySelector("#Maintemp").innerHTML = `${Math.round(
    data.main.temp
  )}&#176;`;

  const iconCode = data.weather[0].icon;
  document.querySelector(
    "img"
  ).src = `http://openweathermap.org/img/wn/${iconCode}@4x.png`;

  // Update min/max
  document.querySelectorAll("#MinMax")[0].innerHTML = `Min ${Math.round(
    data.main.temp_min
  )}&#176;`;
  document.querySelectorAll("#MinMax")[1].innerHTML = `Max ${Math.round(
    data.main.temp_max
  )}&#176;`;
}
