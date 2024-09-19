# ReadMe

### How to use this software
To start the frontend:
- Navigate to `/frontend`
- run `npm run dev`

To start the backend
- Navigate to `/backend`
- Start redis using by running `docker run -d -p 6379:6379 redis`
- Start celery by running `watchmedo auto-restart -d .. -p '*.py' --recursive -- celery -A readme.celery worker`
- Start django server by running `python manange.py runserver`