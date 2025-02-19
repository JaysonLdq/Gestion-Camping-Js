

var map = L.map('map', {
    layers: [
        L.tileLayer('https://tile.openstreetmap.org/%7Bz%7D/%7Bx%7D/%7By%7D.png', {
            'attribution': 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        })
    ],
    center: [0, 0],
    zoom: 0
});