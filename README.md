# Greenify

Full-stack application for tracking and rewarding sustainable daily habits. Built with **Java Spring Boot** (backend) and **React + Chakra UI** (frontend).

## Features
- User registration, login, and authentication with **JWT + Spring Security**  
- Daily entry system: track trash, recycling, miles driven, reusable items  
- Automatic calculation of environmental points  
- Streak tracking for consistent engagement  
- RESTful API with secure endpoints  
- Responsive UI built with **React Router** and **Chakra UI**  

## Tech Stack
**Backend**  
- Java 21, Spring Boot 3.5.x  
- Spring Security, JWT authentication  
- JPA/Hibernate with PostgreSQL  
- Maven build system  

**Frontend**  
- React 18 with Vite  
- Chakra UI + custom theme  
- React Router DOM for navigation  
- JWT stored in localStorage for authenticated fetch requests  

## Setup

### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Backend
```bash
cd frontend
npm install
npm run dev
```

**Future Work**
-Deploy to cloud (AWS)
-Add leaderboard and community features
