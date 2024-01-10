var map = L.map('map').setView([35.6895, 139.6917], 5);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

var scales = {
  '-1': 9, 10: 8, 20: 7, 30: 6, 40: 5,
  45: 4, 50: 3, 55: 2, 60: 1, 70: 0
};

var scalesText = {
  '-1': '調査中', 10: '1', 20: '2', 30: '3', 40: '4', 45: '5-', 50: '5+', 55: '6-', 60: '6+', 70: '7'
};

function fetchEarthquakeData() {
  fetch('https://api.p2pquake.net/v2/history?codes=551&limit=1')
    .then(response => response.json())
    .then(async data => {
      console.log('Earthquake Data:', data);
      if (data && data.length > 0) {
        var earthquake = data[0];
        var points = earthquake.points;

        map.eachLayer(layer => {
          if (layer instanceof L.Marker) {
            map.removeLayer(layer);
          }
        });

        await Promise.all(points.map(async (point) => {
          var scale = point.scale;
          console.log('Scale:', scale);

          if (scale in scales || scale === '-1') {
            var intensity = scalesText[scale];
            console.log('Intensity:', intensity); 

            const response = await fetch(`https://msearch.gsi.go.jp/address-search/AddressSearch?q=${point.pref}${point.addr}`);
            if (!response.ok) return;

            const addrData = await response.json();
            console.log('Address Data:', addrData);

            const coordinates = addrData[0].geometry.coordinates;
            const reversedCoordinates = coordinates.reverse();
            console.log('Coordinates:', reversedCoordinates);

            var regionName = point.addr;

            L.marker(reversedCoordinates, {
              icon: L.divIcon({
                className: 'dark-marker',
                html: `<span>震度: ${intensity}<br>${regionName}</span>`
              })
            }).addTo(map);

            L.marker(reversedCoordinates).addTo(map).bindPopup(`<b>${regionName}</b>`).openPopup();
          }
        }));
      } else {
        console.error('No earthquake data available.');
      }
    })
    .catch(error => {
      console.error('Error fetching earthquake data:', error);
    });
}

fetchEarthquakeData();

setInterval(fetchEarthquakeData, 5000);
