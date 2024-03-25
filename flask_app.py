from flask import Flask, request, jsonify, send_file
import os
import time
import concurrent.futures

# Import functions from your script
from prototype_script import get_venues, process_venue

app = Flask(__name__)

# Define the directory path where the index.html file is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, 'static')

@app.route('/process_venues', methods=['GET'])
def process_venues():
    date = request.args.get('date')
    if not date:
        return jsonify({'error': 'Date parameter is required'}), 400

    start = time.time()

    # Fetch list of venues
    venues_data = get_venues()

    # Filter venues by area == 'London'
    london_venues = [venue for venue in venues_data if venue.get('area', '') == 'London']
    london_venues_with_no_badminton_ids = [90121, 90127, 90135, 90141, 90014, 90143, 90019, 90147, 90277, 90278, 90023, 90024, 90281, 90280, 90155, 90282, 90157, 90030, 90031, 90159, 90160, 90161, 90291, 90162, 90037, 90294, 90289, 90165, 90297, 90168, 90171, 90173, 90175, 90049, 90178, 90179, 90054, 90056, 90185, 90189, 90061, 90081, 90217, 90218, 90219, 90221, 90222, 90223, 90224, 90102, 90107]
    london_badminton_venues = [venue for venue in london_venues if venue.get('id', '') not in london_venues_with_no_badminton_ids]

    # Check if there are London venues
    if london_badminton_venues:
        # Process venues using ThreadPoolExecutor with a fixed number of threads (8 threads)
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            results = list(executor.map(process_venue, london_badminton_venues, [date]*len(london_badminton_venues)))

        available_times_found = [result for result in results if 'available_times' in result]
        venues_with_no_times = {result['venue'].get('slug', '') for result in results if 'no_times' in result}

        print("\n=== Completed search ===\n")
        end = time.time()
        print("\nTime elapsed")
        print(end - start)

        # Construct the response with venues and their available times
        response_data = []
        for result in available_times_found:
            venue = result['venue']
            venue_id = venue.get('id', '')
            venue_name = venue.get('name', '')
            venue_town = venue.get('town', '')
            venue_area = venue.get('area', '')
            venue_postcode = venue.get('postcode', '')

            # Extract available times for the venue
            available_times = result['available_times']
            available_times_info = []
            for time_info in available_times:
                starts_at_12h = time_info.get('starts_at', {}).get('format_12_hour', '')
                ends_at_12h = time_info.get('ends_at', {}).get('format_12_hour', '')
                duration = time_info.get('duration', '')
                price = time_info.get('price', {}).get('formatted_amount', '')
                location = time_info.get('location', '')
                spaces = time_info.get('spaces', 0)
                name = time_info.get('name', '')
                available_times_info.append({
                    'starts_at_12h': starts_at_12h,
                    'ends_at_12h': ends_at_12h,
                    'duration': duration,
                    'price': price,
                    'location': location,
                    'spaces': spaces,
                    'name': name
                })

            # Append venue info with available times to the response data
            response_data.append({
                'venue_name': venue_name,
                'venue_id': venue_id,
                'venue_location': f"{venue_town}, {venue_area} - {venue_postcode}",
                'available_times': available_times_info
            })

        return jsonify({'venues_with_times': response_data}), 200

    else:
        return jsonify({'message': 'No venues found in the response.'}), 404

@app.route('/')
def index():
    return send_file(os.path.join(STATIC_DIR, 'index.html')) 


if __name__ == "__main__":
    app.run()
