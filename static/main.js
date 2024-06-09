const fetchDataBtn = document.getElementById('fetchDataBtn');
const datePicker = document.getElementById('datePicker');
const venueDataDiv = document.getElementById('venueData');
const mapDiv = document.getElementById('googleMap');
const loader = document.getElementById('loader'); // Get loading animation element

let map;
let markers = [];
let infoWindow = null;

async function initMap() {
    // Center the map on London, UK
    const london = { lat: 51.5074, lng: -0.1278 };
    // Set an appropriate zoom level
    const zoomLevel = 10;

    // Create the map centered on London
    map = new google.maps.Map(document.getElementById("map"), {
        center: london,
        zoom: zoomLevel,
    });
}

initMap();

document.addEventListener("DOMContentLoaded", function() {
    const datePicker = document.getElementById('datePicker');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // Set to tomorrow
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const tomorrowFormatted = `${year}-${month}-${day}`;

    datePicker.value = tomorrowFormatted;
});

fetchDataBtn.addEventListener('click', async () => {
    const date = datePicker.value;
    if (!date) {
        alert('Please select a date.');
        return;
    }

    // Show loading animation
    loader.style.display = 'block';

    try {
        const response = await fetch(`/process_venues?date=${date}`);
        const data = await response.json();

        // Hide loading animation when data is received
        loader.style.display = 'none';

        // Clear previous data
        venueDataDiv.innerHTML = '';

        if (response.ok) {
            // Clear previous markers
            markers.forEach(marker => marker.setMap(null));
            markers = [];

            if (data.venues_with_times.length === 0) {
                venueDataDiv.textContent = 'No venues found for the selected date.';
            } else {
                // Loop through each venue and add a marker to the map
                data.venues_with_times.forEach(venue => {
                    const marker = new google.maps.Marker({
                        position: { lat: venue.venue_coord.lat, lng: venue.venue_coord.lng },
                        map: map,
                        title: venue.venue_name,
                    });

                    // Create info window content
                    const infoWindowContent = `
                        <h3>${venue.venue_name}</h3>
                        <p>${venue.venue_location}</p>
                        <h4>Available Times:</h4>
                        <ul>
                            ${venue.available_times.map(time => `<li>${time.starts_at_12h} - ${time.ends_at_12h}</li>`).join('')}
                        </ul>
                    `;

                    // Create info window
                    const newInfoWindow = new google.maps.InfoWindow({
                        content: infoWindowContent,
                    });

                    // Add click event listener to marker
                    marker.addListener('click', () => {
                        // Close previous info window if exists
                        if (infoWindow) {
                            infoWindow.close();
                        }
                        // Open new info window
                        newInfoWindow.open(map, marker);
                        // Set new info window as current
                        infoWindow = newInfoWindow;
                    });

                    // Add marker to markers array
                    markers.push(marker);

                    // Add venue data to venueDataDiv
                    const venueDiv = document.createElement('div');
                    venueDiv.className = 'venue';
                    venueDiv.innerHTML = `
                        <h2>${venue.venue_name}</h2>
                        <p><strong>Location:</strong> ${venue.venue_location}</p>
                        <h3>Available Times:</h3>
                    `;

                    const timesList = document.createElement('ul');
                    venue.available_times.forEach(time => {
                        const listItem = document.createElement('li');
                        listItem.className = 'time';
                        listItem.innerHTML = `
                            <p><strong>Time:</strong> ${time.starts_at_12h} - ${time.ends_at_12h}</p>
                            <p><strong>Duration:</strong> ${time.duration}</p>
                            <p><strong>Price:</strong> ${time.price}</p>
                            <p><strong>Spaces available:</strong> ${time.spaces}</p>
                        `;
                        timesList.appendChild(listItem);
                    });

                    venueDiv.appendChild(timesList);
                    venueDataDiv.appendChild(venueDiv);
                });
            }
        } else {
            venueDataDiv.textContent = 'Error fetching data. Please try again later.';
        }
    } catch (error) {
        console.error('Error:', error);
        venueDataDiv.textContent = 'An error occurred. Please try again later.';
        // Hide loading animation on error
        loader.style.display = 'none';
    }
});
