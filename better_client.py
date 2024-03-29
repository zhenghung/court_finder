import requests

BASE_URL = "https://better-admin.org.uk/api/activities"
HEADERS = {
    'origin': 'https://bookings.better.org.uk',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
}

def get_venues():
    base_url_venues = f'{BASE_URL}/venues'
    response_venues = requests.get(base_url_venues, headers=HEADERS)
    data = response_venues.json().get('data', [])
    return data

def get_activities_for_date(venue_id, category_slug, date):
    base_url_times = f'{BASE_URL}/venue/{venue_id}/activity/{category_slug}/times'
    params = {
        'date': date
    }
    response_times = requests.get(base_url_times, headers=HEADERS, params=params)
    try:
        data = response_times.json().get('data', [])
    except requests.JSONDecodeError:
        return []
    if type(data) is not list:
        return [data]
    return data
