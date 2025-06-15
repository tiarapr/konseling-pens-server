# E-Konseling PENS - Backend Server

This repository contains the backend service for the **E-Konseling PENS** platform. It is built using **Hapi.js** and provides API endpoints for managing users, roles, permissions, counseling sessions, and related resources. The server integrates with PostgreSQL for data storage and supports both **Basic Authentication** and **JWT Authentication**.

## Features
- **Role Management**: Define and manage roles.
- **User Management**: Handle user registration, login, and profile management.
- **Permissions Management**: Define and assign permissions for various user actions.
- **Counseling**: Create and manage counseling sessions, and counseling notes.
- **Appointments**: Handle appointment creation and scheduling.
- **Email Notifications**: ISend email notifications via Gmail SMTP.
- **WhatsApp Notifications**: Send WhatsApp messages using the WhatsApp Business API.

## Prerequisites

- **Node.js** v14 or above
- **PostgreSQL** (For database management)
- **Gmail SMTP credentials** (For email functionality)
- **WhatsApp Business API credentials** (For whatsapp notification)
- **Redis** (For cache)

## Setup Instructions

1. **Clone the Repository**
    ```bash
    git clone https://github.com/tiarapr/konseling-pens-server
    cd konseling-pens-server
    ```

2. **Install Dependencies**
    Install all the required Node.js packages:
    ```bash
    npm install
    ```

3. **Configure the `.env` File**
    Make a copy of `.env.example` and name it `.env`. Configure the following settings:
    ```plaintext
    DATABASE_URL=postgres://<username>:<password>@localhost:5432/<your-database>
    REDIS_URL=<redis-url>

    // Example REDIS_URL: redis://localhost:6379
    
    # Server Configuration
    PORT=5000
    HOST=localhost
    
    # Auth Header Key
    BASIC_AUTH_USERNAME=pensjoss
    BASIC_AUTH_PASSWORD=<hashed-password>

    # Token Configuration
    ACCESS_TOKEN_KEY=<your-access-token-key>
    ACCESS_TOKEN_AGE=3600
    REFRESH_TOKEN_KEY=<your-refresh-token-key>

    # Mail Configuration
    MAIL_HOST=smtp.gmail.com
    MAIL_PORT=587
    MAIL_SECURE=false
    MAIL_USER=<your-email>
    MAIL_PASSWORD=<your-email-password>
    MAIL_SENDER=<sender-email>
    APP_NAME=E-Konseling PENS
    BASE_URL=<your-base-url>

    WA_PHONE_NUMBER_ID=<your-whatsapp-api-business-number-id>
    WA_ACCESS_TOKEN=<your-whatsapp-api-business-access-token>
    ```

4. **Database Setup**
    - Ensure that PostgreSQL is installed and running.
    - Create a new database in PostgreSQL and update the `DATABASE_URL` in your `.env` file.
    - Run your migrations
      ```bash
      npx node-pg-migrate up
      ```

5. **Run the Server**
    Start the server by running:
    ```bash
    npm run dev
    ```

    The server will be accessible at `http://localhost:5000`.

## Authentication

### Basic Authentication
- **Username**: `pensjoss`
- **Password**: A hashed password.

### JWT Authentication
You can register a new user or authenticate via the provided endpoints to receive a JWT token.
After successfully logging in, the JWT token will be stored in the accessToken cookie.

## Endpoints

The full API documentation is available through Postman:  
[Postman API Documentation](https://documenter.getpostman.com/view/43975024/2sB2j4fBPu)

## Configuration

You can modify the server’s configuration (e.g., port, host, mail service) by editing the `.env` file. 