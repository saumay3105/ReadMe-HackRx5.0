# ReadMe

### Required OS
Linux or Windows with WSL

# Installing dependencies
wget http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2_amd64.deb
sudo dpkg -i libssl1.1_1.1.1f-1ubuntu2_amd64.deb

### How to use this software
To start the frontend:
- Navigate to `/frontend`
- run `npm run dev`

To start the backend
- Navigate to `/backend`
- Start redis using by running `docker run -d -p 6379:6379 redis`
- Start celery by running `watchmedo auto-restart -d .. -p '*.py' --recursive -- celery -A readme.celery worker`
- Start django server by running `python manange.py runserver`