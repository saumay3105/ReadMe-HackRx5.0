# ReadMe

### Preferred OS
Linux or Windows with WSL

# Installing dependencies
wget http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2_amd64.deb
sudo dpkg -i libssl1.1_1.1.1f-1ubuntu2_amd64.deb

install backend and frontend dependencies from the `requirements.txt` and `package.json`


### How to use this software
To start the frontend:
- Navigate to `/frontend`
- run `npm run dev`

To start the backend
- Navigate to `/backend`
- Start redis by running `docker run -d -p 6379:6379 redis`
- Start celery by running `watchmedo auto-restart -d .. -p '*.py' --recursive -- celery -A readme.celery worker`
- Start django server by running `python manange.py runserver`


### For any information required, do not hesitate to contact miranfirdausi027@gmail.com or saumay123sj@gmail.com
