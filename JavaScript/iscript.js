//  Nooooooo  //
//  改変や複製を一切禁止します。  //
//  https://github.com/Nooooooo-0328/NanbuEqService-site-jisin  //

var map = L.map('map').setView([35.6895, 139.6917], 5);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let previousEarthquakeId = null;

var scalesText = {
  '-1': '調査中', 10: '1', 20: '2', 30: '3', 40: '4', 45: '5-', 50: '5+', 55: '6-', 60: '6+', 70: '7'
};

const tsunamiLevels = {
  'None': 'この地震による津波の心配はありません。',
  'Unknown': '津波の影響は不明です。',
  'Checking': '津波の影響を現在調査中です。',
  'NonEffective': '若干の海面変動が予想されますが、被害の心配はありません。',
  'Watch': 'この地震で津波注意報が発表されています。',
  'Warning': 'この地震で津波警報等（大津波警報・津波警報あるいは津波注意報）が発表されています。'
};

function getIconPathByIntensity(intensity) {
  switch (intensity) {
    case '-1':
      return 'image/h.png';
    case '10':
      return 'image/1.png';
    case '20':
      return 'image/2.png';
    case '30':
      return 'image/3.png';
    case '40':
      return 'image/4.png';
    case '45':
      return 'image/5-.png';
    case '50':
      return 'image/5+.png';
    case '55':
      return 'image/6-.png';
    case '60':
      return 'image/6+.png';
    case '70':
      return 'image/7.png';
    default:
      return 'image/error.png';
  }
}

const addressCache = {};
const epicenterTimeElement = document.getElementById('epicenter-time');

async function updateMapWithEarthquakeData() {
  try {
    const earthquakeResponse = await fetch('https://api.p2pquake.net/v2/history?codes=551&limit=1');
    if (!earthquakeResponse.ok) {
      console.error('地震データの取得中にエラーが発生しました。');
      updateCurrentTime();
      return;
    }

    const earthquakeData = await earthquakeResponse.json();
    if (earthquakeData && earthquakeData.length > 0) {
      const earthquake = earthquakeData[0];
      const newEarthquakeId = earthquake.id;

      if (newEarthquakeId !== previousEarthquakeId) {
        previousEarthquakeId = newEarthquakeId;

        const issueType = earthquake.issue?.type;

        let info;
        let displayEpicenterIcon = true; 

        switch (issueType) {
          case 'ScalePrompt':
            info = '震度速報';
            displayEpicenterIcon = false;
            break;
          case 'Destination':
            info = '震源に関する情報';
            break;
          case 'ScaleAndDestination':
            info = '震源・震度に関する情報';
            break;
          case 'DetailScale':
            info = '各地の震度に関する情報';
            break;
          case 'Foreign':
            info = '遠地地震に関する情報';
            break;
          default:
            info = 'その他';
        }

        map.eachLayer(layer => {
          if (layer instanceof L.Marker) {
            map.removeLayer(layer);
          }
        });

        let bounds = L.latLngBounds();

        await Promise.all(earthquake.points.map(async point => {
          const scale = point.scale.toString();
          if (scale in scalesText || scale === '-1') {
            const intensity = scalesText[scale];

            let addrData;
            if (point.addr in addressCache) {
              addrData = addressCache[point.addr];
            } else {
              const addrResponse = await fetch(`https://msearch.gsi.go.jp/address-search/AddressSearch?q=${point.pref}${point.addr}`);
              if (addrResponse.ok) {
                addrData = await addrResponse.json();
                addressCache[point.addr] = addrData;
              } else {
                console.error('住所データの取得中にエラーが発生しました。');
                return;
              }
            }

            if (addrData && addrData[0] && addrData[0].geometry) {
              const coordinates = addrData[0].geometry.coordinates;
              const reversedCoordinates = coordinates.reverse();

              const regionName = point.addr;

              const iconPath = getIconPathByIntensity(scale);

              bounds.extend(reversedCoordinates);

              if (displayEpicenterIcon && earthquake.earthquake && earthquake.earthquake.hypocenter) {
                const epicenterCoordinates = [earthquake.earthquake.hypocenter.latitude, earthquake.earthquake.hypocenter.longitude];

                const epicenterTime = earthquake.earthquake.time;

                epicenterTimeElement.textContent = epicenterTime || 'Unknown';

                const epicenterIconPath = 'image/epicenter.png';
                const epicenterCustomIcon = L.icon({
                  iconUrl: epicenterIconPath,
                  iconSize: [60, 60],
                  iconAnchor: [24, 24],
                  popupAnchor: [0, -24],
                });

                L.marker(epicenterCoordinates, {
                  icon: epicenterCustomIcon,
                }).addTo(map);

                bounds.extend(epicenterCoordinates);
              }

              const customIcon = L.icon({
                iconUrl: iconPath,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
                popupAnchor: [0, -16],
              });

              L.marker(reversedCoordinates, {
                icon: customIcon,
              }).addTo(map);
            }
          }
        }));

        displayTsunamiInfo(earthquake.tsunami?.domesticTsunami || 'None');

        const infoElement = document.getElementById('info');
        infoElement.textContent = info;

        map.fitBounds(bounds, { padding: [10, 10], animate: false, maxZoom: 10 });
      }
    } else {
      console.error('利用可能な地震データがありません。');
      updateCurrentTime();
    }
  } catch (error) {
    console.error('地図の更新中にエラーが発生しました:', error);
    updateCurrentTime();
  }
}

function displayTsunamiInfo(tsunamiInfo) {
  const tsunamiInfoElement = document.getElementById('tsunami-data');
  tsunamiInfoElement.textContent = tsunamiLevels[tsunamiInfo] || '津波情報を取得できません';
}

updateMapWithEarthquakeData();
setInterval(updateMapWithEarthquakeData, 2000);