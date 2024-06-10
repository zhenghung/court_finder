# court_finder

Uses Better Leisure Centres APIs to search for Badminton Sports Halls games across all London venues.

Hosted here:

https://courtfinder.adaptable.app/


## Run Locally
Requirements
- Python 3.x

Enable virtual environment (optional)
```
$ python -m venv .venv
$ .venv/Scripts/activate
```

Install dependencies
```
$ pip install -r requirements.txt
```

Copy env file and add api key
```
$ cp -- .env.copythis .env
```
Then add your google api key

Run the code in debug mode
```
$ python flask_app.py
```

Run the code in production WSGI server
```
$ waitress-serve --host localhost flask_app:app
```
You can add specify the `host` and `port` arguments if you wish

