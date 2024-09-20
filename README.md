# ReadMe: An Instant Text-To-Video Creator
"ReadMe" is an AI-powered system designed to transform boring, static text inputs (such as brochures or PDFs) into engaging and interactive video content. In addition to video generation, it creates quizzes to test users' understanding of the content and provides detailed analytics on user engagement. By reading out text in an entertaining way, ReadMe makes information more digestible and enjoyable to interact with.

## Table of Contents
- [Preferred OS](#preferred-os)
- [Installation](#Installing-dependencies)
- [Usage](#how-to-use-this-software)
- [Screenshots](#Screenshots)
- [Contact](#contact)
- [Acknowledgements](#acknowledgements)

### Preferred OS
Linux or Windows with WSL

# Installing dependencies
wget http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2_amd64.deb   
sudo dpkg -i libssl1.1_1.1.1f-1ubuntu2_amd64.deb

install backend and frontend dependencies from the `requirements.txt` and `package.json`

### How to use this software
To start the frontend:
- Navigate to `/frontend`
- Run the development server: `npm run dev`

To start the backend
- Navigate to `/backend`
- Start redis via docker `docker run -d -p 6379:6379 redis`
- Start Celery worker for background tasks: `watchmedo auto-restart -d .. -p '*.py' --recursive -- celery -A readme.celery worker`
- Start the Django server: `python manange.py runserver`

### Screenshots
![Screenshot 2024-09-10 171456](https://github.com/user-attachments/assets/196e4739-2c9a-41f7-96ae-6de74c0a093d)
![Screenshot 2024-09-20 162523](https://github.com/user-attachments/assets/3da80abb-416c-4bb2-bfd3-be5555c3c8bd)
![Screenshot 2024-09-20 200210](https://github.com/user-attachments/assets/be5d265b-dc58-4a66-be3e-8b8ea0dfca1d)
![Screenshot 2024-09-20 205032](https://github.com/user-attachments/assets/429b6e94-60e6-4b09-816f-8a70e3fab811)

### Contact
For any information required, do not hesitate to contact miranfirdausi027@gmail.com or saumay123sj@gmail.com

### Acknowledgements
- Thanks to [Celery](https://docs.celeryproject.org/) for handling asynchronous tasks.
