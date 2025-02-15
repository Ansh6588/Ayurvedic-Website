

let map;

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    let lat = position.coords.latitude;
    let lng = position.coords.longitude;
    findClinics(lat, lng);
}

function showError(error) {
    alert("Error in getting location: " + error.message);
}

function geocodeAddress() {
    let address = document.getElementById('address').value;
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': address }, function(results, status) {
        if (status == 'OK') {
            let lat = results[0].geometry.location.lat();
            let lng = results[0].geometry.location.lng();
            findClinics(lat, lng);
        } else {
            alert('Geocode failed: ' + status);
        }
    });
}

function findClinics(lat, lng) {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: lat, lng: lng },
        zoom: 12
    });

    let service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
        location: { lat: lat, lng: lng },
        radius: 5000,
        keyword: 'Ayurvedic clinic'
    }, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            results.forEach(place => createMarker(place));
        }
    });
}

function createMarker(place) {
    let marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function() {
        let infoWindow = new google.maps.InfoWindow();
        infoWindow.setContent('<strong>' + place.name + '</strong><br>' + place.vicinity);
        infoWindow.open(map, this);
    });
}

