//  Nooooooo  //
//  改変や複製を一切禁止します。  //
//  https://github.com/Nooooooo-0328/NanbuEqService-site-jisin  //

function updateCurrentTime() {
  const currentTimeElement = document.getElementById('current-time');
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  const currentTime = new Date().toLocaleString('ja-JP', options);
  currentTimeElement.textContent = currentTime;
}

setInterval(updateCurrentTime, 1000);
