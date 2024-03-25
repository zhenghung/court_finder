const fetchDataBtn = document.getElementById('fetchDataBtn');
const datePicker = document.getElementById('datePicker');
const venueDataDiv = document.getElementById('venueData');
const loader = document.getElementById('loader'); // Get loading animation element

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