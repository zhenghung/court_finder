const fetchDataBtn = document.getElementById('fetchDataBtn');
const datePicker = document.getElementById('datePicker');
const venueDataDiv = document.getElementById('venueData');
const loader = document.getElementById('loader'); // Get loading animation element

let map;
let infoWindow;

// Set date picker to default to tomorrow
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
datePicker.value = tomorrow.toISOString().split('T')[0];

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

    // Initialize a single info window for reuse
    infoWindow = new google.maps.InfoWindow();
}

initMap();

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
            if (data.venues_with_times.length === 0) {
                venueDataDiv.textContent = 'No venues found for the selected date.';
            } else {
                data.venues_with_times.forEach(venue => {
                    const venueDiv = document.createElement('div');
                    venueDiv.className = 'venue';
                    venueDiv.innerHTML = `
                        <h2>${venue.venue_name}</h2>
                        <p><strong>Location:</strong> ${venue.venue_location}</p>
                        <h3>Available Times:</h3>
                    `;

                    const timesList = document.createElement('ul');
                    venue.available_times.forEach((time, index) => {
                        const listItem = document.createElement('li');
                        listItem.className = 'time';
                        listItem.innerHTML = `
                            <p><strong>Time:</strong> ${time.starts_at_12h} - ${time.ends_at_12h}</p>
                            <p><strong>Duration:</strong> ${time.duration}</p>
                            <p><strong>Price:</strong> ${time.price}</p>
                            <p><strong>Spaces available:</strong> ${time.spaces}</p>
                        `;
                        timesList.appendChild(listItem);

                        // Add border-bottom to each time item except the last one
                        if (index !== venue.available_times.length - 1) {
                            listItem.style.borderBottom = '1px solid #ccc';
                            listItem.style.paddingBottom = '10px'; // Optional: Add some padding between items
                        }
                    });

                    venueDiv.appendChild(timesList);
                    venueDataDiv.appendChild(venueDiv);

                    // Add marker to the map
                    const marker = new google.maps.Marker({
                        position: { lat: venue.venue_coord.lat, lng: venue.venue_coord.lng },
                        map: map,
                        title: venue.venue_name,
                    });

                    // Add click event to marker to show info window
                    marker.addListener('click', () => {
                        infoWindow.setContent(`
                            <div>
                                <h2>${venue.venue_name}</h2>
                                <p>${venue.venue_location}</p>
                                <h4>Available Times:</h4>
                                <ul>
                                    ${venue.available_times.map(time => `<li>${time.starts_at_12h} - ${time.ends_at_12h}</li>`).join('')}
                                </ul>
                            </div>
                        `);
                        infoWindow.open(map, marker);
                    });
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

// Tab functionality
function openTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Set the default tab to open
document.getElementById("defaultOpen").click();
