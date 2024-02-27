//  Nooooooo  //
//  改変や複製を一切禁止します。  //
//  https://github.com/Nooooooo-0328/NanbuEqService-site-jisin  //

let settingsPopupVisible = false;
let displayCurrentTime = false;

const storedDisplaySetting = localStorage.getItem('displayCurrentTime');
if (storedDisplaySetting !== null) {
  displayCurrentTime = JSON.parse(storedDisplaySetting);
}

function toggleSettingsPopup() {
  const settingsPopup = document.getElementById('settings-popup');
  const overlay = document.getElementById('overlay');
  settingsPopupVisible = !settingsPopupVisible;

  if (settingsPopupVisible) {
    showSettingsPopup();
    overlay.style.display = 'block';
    setTimeout(() => {
      settingsPopup.style.opacity = '1';
      overlay.style.opacity = '1';
    }, 10);
  } else {
    hideSettingsPopup();
    settingsPopup.style.opacity = '0';
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 300);
  }
}

function showSettingsPopup() {
  const settingsPopup = document.getElementById('settings-popup');
  settingsPopup.style.display = 'block';
  centerElement(settingsPopup);

  const closeButton = document.createElement('div');
  closeButton.className = 'close-button';
  closeButton.innerHTML = '×';
  closeButton.onclick = toggleSettingsPopup;
  settingsPopup.appendChild(closeButton);
}

function hideSettingsPopup() {
  const settingsPopup = document.getElementById('settings-popup');
  settingsPopup.style.display = 'none';

  const closeButton = document.querySelector('.close-button');
  if (closeButton) {
    settingsPopup.removeChild(closeButton);
  }
}

function centerElement(element) {
  const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  const screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

  const elementWidth = element.offsetWidth;
  const elementHeight = element.offsetHeight;

  const left = (screenWidth - elementWidth) / 2;
  const top = (screenHeight - elementHeight) / 2;

  element.style.left = left + 'px';
  element.style.top = top + 'px';
}

function toggleDisplaySetting() {
  displayCurrentTime = !displayCurrentTime;
  localStorage.setItem('displayCurrentTime', JSON.stringify(displayCurrentTime));
  updateDisplaySetting();
}

function updateDisplaySetting() {
  const currentTimeElement = document.getElementById('current-time');
  const displaySettingText = document.getElementById('display-setting-text');
  const displaySettingTextValue = document.getElementById('display_setting_text');

  if (currentTimeElement && displaySettingText && displaySettingTextValue) {
    if (displayCurrentTime) {
      currentTimeElement.style.display = 'block';
      displaySettingText.textContent = '';
      displaySettingTextValue.textContent = 'ON';
    } else {
      currentTimeElement.style.display = 'none';
      displaySettingText.textContent = '設定により現在時刻非表示';
      displaySettingTextValue.textContent = 'OFF';
    }
  }
}

var whiteTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var darkTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
});

var map = L.map('map', {
    layers: [darkTileLayer] 
}).setView([35.6895, 139.6917], 5);

function toggleDarkMode() {
  const toggleDarkModeText = document.getElementById('toggle_Dark_Mode_text');
  if (map.hasLayer(whiteTileLayer)) {
      map.removeLayer(whiteTileLayer);
      map.addLayer(darkTileLayer);
      toggleDarkModeText.textContent = 'ダークモード';
  } else {
      map.removeLayer(darkTileLayer);
      map.addLayer(whiteTileLayer);
      toggleDarkModeText.textContent = 'ホワイトモード';
  }
  updateDisplaySetting(); 
}

updateDisplaySetting();