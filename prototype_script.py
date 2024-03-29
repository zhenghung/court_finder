from better_client import get_activities_for_date, get_venues
import time
import concurrent.futures


# Print iterations progress
def printProgressBar (iteration, total, prefix = '', suffix = '', decimals = 1, length = 100, fill = '█', printEnd = "\r"):
    percent = ("{0:." + str(decimals) + "f}").format(100 * (iteration / float(total)))
    filledLength = int(length * iteration // total)
    bar = fill * filledLength + '-' * (length - filledLength)
    print(f'\r{prefix} |{bar}| {percent}% {suffix}', end = printEnd)
    # Print New Line on Complete
    if iteration == total: 
        print()


def print_times_info(times):
    for time in times:
        starts_at_12h = time.get('starts_at', {}).get('format_12_hour', '')
        ends_at_12h = time.get('ends_at', {}).get('format_12_hour', '')
        duration = time.get('duration', '')
        price = time.get('price', {}).get('formatted_amount', '')
        location = time.get('location', '')
        spaces = time.get('spaces', 0)
        name = time.get('name', '')

        print(f"\nTime: {starts_at_12h} - {ends_at_12h}")
        print(f"Duration: {duration}")
        print(f"Price: {price}")
        print(f"Location: {location}")
        print(f"Spaces available: {spaces}")
        print(f"Activity: {name}")


def process_venue(venue, date):
    venue_id = venue.get('id', '')
    venue_name = venue.get('name', '')
    venue_town = venue.get('town', '')
    venue_area = venue.get('area', '')
    venue_postcode = venue.get('postcode', '')

    # Fetch activities for the specified date and venue
    times = get_activities_for_date(venue_id, 'badminton-40min', date) + get_activities_for_date(venue_id, 'badminton-60min', date)

    available_times = [time for time in times if time.get('spaces', 0) > 0]
    if available_times:
        return {'venue': venue, 'available_times': available_times}
    else:
        return {'venue': venue, 'no_times': True}


def main():
    start = time.time()

    # Fetch list of venues
    venues_data = get_venues()

    # Set the date variable
    date = '2024-03-17'

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

        # Printing the times
        print(f'\n{len(available_times_found)} venues with times found')
        for result in available_times_found:
            venue = result['venue']
            venue_id = venue.get('id', '')
            venue_name = venue.get('name', '')
            venue_town = venue.get('town', '')
            venue_area = venue.get('area', '')
            venue_postcode = venue.get('postcode', '')
            print(f"\n\nVenue: {venue_name}")
            print(f"ID: {venue_id}")
            print(f"Location: {venue_town}, {venue_area} - {venue_postcode}")
            print_times_info(result['available_times'])

        print(f'\n {len(venues_with_no_times)} venues with no times')
        print(venues_with_no_times)
        print("\n=======")

    else:
        print("No venues found in the response.")


if __name__ == "__main__":
    main()