/* ── Stars ── */
(function generateStars() {
  const container = document.getElementById('stars');
  for (let i = 0; i < 90; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2.5 + 0.5;
    s.style.cssText = `
      width:${size}px; height:${size}px;
      top:${Math.random() * 100}%; left:${Math.random() * 100}%;
      --dur:${(Math.random() * 4 + 2).toFixed(1)}s;
      --delay:${(Math.random() * 5).toFixed(1)}s;
    `;
    container.appendChild(s);
  }
})();

/* ── Date badge ── */
(function setDate() {
  const d = new Date();
  document.getElementById('date-badge').textContent =
    d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
})();

/* ── Main fetch ── */
const API_KEY = '7245e28aa49c219589db18a4d20972e1';

function getWeather() {
  const city = document.getElementById('city').value.trim();
  if (!city) { shakeInput(); return; }

  setLoading(true);
  hideAll();

  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}`;

  Promise.all([fetch(currentUrl).then(r => r.json()), fetch(forecastUrl).then(r => r.json())])
    .then(([current, forecast]) => {
      setLoading(false);
      if (current.cod === '404' || current.cod === 401) {
        showError(current.message || 'City not found.');
        return;
      }
      displayWeather(current);
      displayHourlyForecast(forecast.list);
      show('weather-display');
    })
    .catch(() => {
      setLoading(false);
      showError('Network error — please try again.');
    });
}

function displayWeather(data) {
  const temp = Math.round(data.main.temp - 273.15);
  const feelsLike = Math.round(data.main.feels_like - 273.15);
  const humidity = data.main.humidity;
  const wind = (data.wind.speed * 3.6).toFixed(1);
  const icon = data.weather[0].icon;

  document.getElementById('city-name').textContent = data.name + ', ' + data.sys.country;
  document.getElementById('weather-desc').textContent = data.weather[0].description;
  document.getElementById('temp-value').textContent = temp + '°C';
  document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${icon}@4x.png`;
  document.getElementById('weather-icon').alt = data.weather[0].description;
  document.getElementById('feels-like').innerHTML = `🌡️ Feels like ${feelsLike}°C`;
  document.getElementById('humidity').innerHTML = `💧 Humidity ${humidity}%`;
  document.getElementById('wind').innerHTML = `💨 Wind ${wind} km/h`;
}

function displayHourlyForecast(list) {
  const container = document.getElementById('hourly-forecast');
  container.innerHTML = '';

  list.slice(0, 8).forEach(item => {
    const dt = new Date(item.dt * 1000);
    const hour = dt.getHours().toString().padStart(2, '0') + ':00';
    const temp = Math.round(item.main.temp - 273.15);
    const icon = item.weather[0].icon;

    const el = document.createElement('div');
    el.className = 'hourly-item';
    el.innerHTML = `
      <span class="h-time">${hour}</span>
      <img src="https://openweathermap.org/img/wn/${icon}.png" alt="">
      <span class="h-temp">${temp}°</span>
    `;
    container.appendChild(el);
  });
}

/* ── UI helpers ── */
function setLoading(on) {
  document.getElementById('search-btn').classList.toggle('loading', on);
}

function shakeInput() {
  const bar = document.querySelector('.search-bar');
  bar.style.animation = 'none';
  bar.offsetHeight; // reflow
  bar.style.animation = 'shake 0.4s ease';
  bar.addEventListener('animationend', () => bar.style.animation = '', { once: true });
}

function hideAll() {
  ['weather-display', 'empty-state', 'error-state'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
}

function show(id) {
  document.getElementById(id).classList.remove('hidden');
  // re-trigger animation
  const el = document.getElementById(id);
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = '';
}

function showError(msg) {
  document.getElementById('error-msg').textContent = msg;
  show('error-state');
}

/* ── Shake keyframe (injected) ── */
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%,100%{transform:translateX(0)}
    20%{transform:translateX(-8px)}
    40%{transform:translateX(8px)}
    60%{transform:translateX(-5px)}
    80%{transform:translateX(5px)}
  }
`;
document.head.appendChild(style);
