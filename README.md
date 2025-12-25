# Study Scheduler - Weekly Study Schedule Generator

A full-stack web application to generate personalized weekly study schedules based on subjects, difficulty levels, and priorities.

## 🚀 Tech Stack

- **Backend**: Java Spring Boot 3.2.1
- **Frontend**: React 18
- **Deployment**: Docker & Docker Compose
- **Registry**: GitHub Container Registry (ghcr.io)

## 📋 Features

- Add multiple subjects with custom hours per week
- Set difficulty levels (Easy, Medium, Hard)
- Set priority levels (Low, Medium, High)
- Adjust daily study hours
- Generate optimized weekly schedules
- Beautiful, responsive UI

## 🏗️ Project Structure

```
vibe-coding/
├── backend/                    # Spring Boot API
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/vibecoding/studyscheduler/
│   │       │       ├── controller/
│   │       │       ├── model/
│   │       │       ├── service/
│   │       │       └── StudySchedulerApplication.java
│   │       └── resources/
│   │           └── application.properties
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                   # React Application
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml          # For local builds
├── docker-compose.nobuild.yml  # For registry images
├── build-and-push.sh          # Linux/Mac build script
└── build-and-push.ps1         # Windows build script
```

## 🐳 Docker Setup

### Option 1: Build and Run Locally

```bash
# Build and start all services
docker compose up -d --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
```

### Option 2: Push to GitHub Container Registry

#### Prerequisites
- Docker with buildx support
- GitHub Personal Access Token with `write:packages` permission

#### Linux/Mac

```bash
# Make script executable
chmod +x build-and-push.sh

# Run the script
./build-and-push.sh <your-github-username>
```

#### Windows PowerShell

```powershell
# Run the script
.\build-and-push.ps1 <your-github-username>
```

#### Manual Steps

1. Login to GitHub Container Registry:
```bash
docker login ghcr.io
```

2. Create buildx builder:
```bash
docker buildx create --name multiplatform --use
```

3. Build and push backend:
```bash
cd backend
docker buildx build --platform linux/amd64,linux/arm64 \
  -t ghcr.io/<username>/study-scheduler-backend:latest \
  --push .
cd ..
```

4. Build and push frontend:
```bash
cd frontend
docker buildx build --platform linux/amd64,linux/arm64 \
  -t ghcr.io/<username>/study-scheduler-frontend:latest \
  --push .
cd ..
```

### Option 3: Deploy from Registry

1. Update `docker-compose.nobuild.yml`:
   - Replace `<username>` with your GitHub username

2. Pull and run:
```bash
docker compose -f docker-compose.nobuild.yml up -d
```

## 🔧 Local Development

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

API will be available at `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm start
```

Application will be available at `http://localhost:3000`

## 📡 API Endpoints

### Generate Schedule
```http
POST /api/schedule/generate
Content-Type: application/json

{
  "subjects": [
    {
      "name": "Mathematics",
      "hoursPerWeek": 10,
      "difficulty": "hard",
      "priority": "high"
    },
    {
      "name": "History",
      "hoursPerWeek": 5,
      "difficulty": "easy",
      "priority": "medium"
    }
  ],
  "studyHoursPerDay": 4,
  "preferredStudyTimes": ["morning", "afternoon", "evening"]
}
```

### Health Check
```http
GET /api/schedule/health
```

## 🎨 Screenshots

The application features:
- Modern gradient design
- Responsive layout
- Interactive form with dynamic subject management
- Visual weekly schedule with color-coded sessions
- Study tips based on difficulty levels

## 📝 Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8080
```

For production deployment, update to your backend URL.

## 🛠️ Troubleshooting

### Docker Build Issues
- Ensure Docker buildx is installed: `docker buildx version`
- Create builder if missing: `docker buildx create --name multiplatform --use`

### Port Conflicts
- Backend runs on port 8080
- Frontend runs on port 3000
- Change ports in docker-compose.yml if needed

### CORS Issues
- Backend has CORS enabled for all origins in development
- Update `@CrossOrigin` in controllers for production

## 📄 License

This project is open source and available for educational purposes.

## 👤 Author

Vibe Coding - Study Scheduler Project

## 🤝 Contributing

Feel free to fork, improve, and submit pull requests!
