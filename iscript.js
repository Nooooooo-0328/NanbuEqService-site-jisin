var map = L.map('map').setView([35.6895, 139.6917], 5);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let previousEarthquakeId = null;

var scalesText = {
  '-1': '調査中', 10: '1', 20: '2', 30: '3', 40: '4', 45: '5-', 50: '5+', 55: '6-', 60: '6+', 70: '7'
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

async function updateMapWithEarthquakeData() {
  try {
    const response = await fetch('https://api.p2pquake.net/v2/history?codes=551&limit=1');
    if (!response.ok) {
      console.error('地震データの取得中にエラーが発生しました。');
      updateCurrentTime(); 
      return;
    }

    const data = await response.json();
    if (data && data.length > 0) {
      const earthquake = data[0];
      const newEarthquakeId = earthquake.id;
      if (newEarthquakeId !== previousEarthquakeId) {
        previousEarthquakeId = newEarthquakeId;

        const earthquake_data = earthquake.earthquake;
        const points = earthquake.points;

        map.eachLayer(layer => {
          if (layer instanceof L.Marker) {
            map.removeLayer(layer);
          }
        });

        await Promise.all(points.map(async point => {
          const scale = point.scale.toString();
          console.log('震度:', scale);

          if (scale in scalesText || scale === '-1') {
            const intensity = scalesText[scale];
            console.log('震度:', intensity);

            const addrResponse = await fetch(`https://msearch.gsi.go.jp/address-search/AddressSearch?q=${point.pref}${point.addr}`);
            if (!addrResponse.ok) {
              console.error('住所データの取得中にエラーが発生しました。');
              return;
            }

            const addrData = await addrResponse.json();
            console.log('住所データ:', addrData);

            const coordinates = addrData[0].geometry.coordinates;
            const reversedCoordinates = coordinates.reverse();
            console.log('座標:', reversedCoordinates);

            const regionName = point.addr;

            const iconPath = getIconPathByIntensity(scale);
            console.log('アイコンのパス:', iconPath);


            if (earthquake_data && earthquake_data.hypocenter) {
              const epicenterCoordinates = [earthquake_data.hypocenter.latitude, earthquake_data.hypocenter.longitude];
              console.log('震源地座標:', epicenterCoordinates);
  
              const epicenterIconPath = 'image/epicenter.png';
              const epicenterCustomIcon = L.icon({
                iconUrl: epicenterIconPath,
                iconSize: [48, 48], 
                iconAnchor: [24, 24],
                popupAnchor: [0, -24]
              });
  
              L.marker(epicenterCoordinates, {
                icon: epicenterCustomIcon
              }).addTo(map);
            }
  
            map.flyTo(reversedCoordinates, 9, { animate: false });

            const customIcon = L.icon({
              iconUrl: iconPath,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
              popupAnchor: [0, -16]
            });
            
            L.marker(reversedCoordinates, {
              icon: customIcon
            }).addTo(map);
            map.flyTo(reversedCoordinates, 9);
          }
        }));
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

updateMapWithEarthquakeData();
setInterval(updateMapWithEarthquakeData, 2000);