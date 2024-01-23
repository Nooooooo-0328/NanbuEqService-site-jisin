let settingsPopupVisible = false;
let displayCurrentTime = false;

// 追加: ローカルストレージから設定を読み込む
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

  // 追加: ×ボタン
  const closeButton = document.createElement('div');
  closeButton.className = 'close-button';
  closeButton.innerHTML = '×';
  closeButton.onclick = toggleSettingsPopup;
  settingsPopup.appendChild(closeButton);
}

function hideSettingsPopup() {
  const settingsPopup = document.getElementById('settings-popup');
  settingsPopup.style.display = 'none';

  // 追加: ×ボタンを削除
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
  // 追加: ローカルストレージに設定を保存
  localStorage.setItem('displayCurrentTime', JSON.stringify(displayCurrentTime));
  updateDisplaySetting();
}

function updateDisplaySetting() {
  const currentTimeElement = document.getElementById('current-time');
  const displaySettingText = document.getElementById('display-setting-text');
  const display_SettingText = document.getElementById('display_setting_text');

  if (currentTimeElement && displaySettingText) {
    if (displayCurrentTime) {
      currentTimeElement.style.display = 'block';
      displaySettingText.textContent = '';
      display_SettingText.textContent = 'ON';
    } else {
      currentTimeElement.style.display = 'none';
      displaySettingText.textContent = '設定により現在時刻非表示';
      display_SettingText.textContent = 'OFF';
    }
  }
}

// 追加: 初期表示時に表示設定を反映
updateDisplaySetting();