# User Management Service

This is a NestJS-based user management service that allows you to create, read, update, delete, block, unblock, and search for users.

## Table of Contents

- [User Management Service](#user-management-service)
  - [Table of Contents](#table-of-contents)
  - [Project Setup](#project-setup)
  - [Database Setup](#database-setup)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
  - [Testing](#testing)
  - [Endpoints](#endpoints)
  - [Including JWT in Requests](#including-jwt-in-requests)

## Project Setup

1. **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

## Database Setup

This project uses PostgreSQL as the database. Ensure you have PostgreSQL installed and running on your machine.

1. **Create a database:**

    ```bash
    createdb user_management
    ```

2. **Create tables**:
    
    You can create tables manually using SQL commands or rely on TypeORM to synchronize the entities and create tables automatically. If you're using TypeORM's automatic synchronization, it will create tables based on your entity definitions. Ensure `synchronize: true` is set in your TypeORM configuration.

    Example SQL commands to create tables manually:
    ```sql
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        surname VARCHAR(255) NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        birthdate DATE NOT NULL
    );

    CREATE TABLE blocks (
        id SERIAL PRIMARY KEY,
        blocker_id INT REFERENCES users(id),
        blocked_id INT REFERENCES users(id)
    );
    ```

3. **Run database migrations (if any)**:

    If you're using TypeORM, you can run migrations using:

    ```bash
    npm run typeorm migration:run
    ```


## Environment Variables

Create a `.env` file in the root directory and configure the following variables:

```plaintext
# Application
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=user_management

# Cache
CACHE_TTL=300
CACHE_MAX=100  # Maximum number of items in cache

```

## Running the Application

1. **Start the application:**

    ```bash
    npm run start
    ```

    The application will be running at `http://localhost:3000`.

2. **Start the application with hot reload (for development):**

    ```bash
    npm run start:dev
    ```

## Testing

This project uses Jest for testing.

1. **Run unit tests:**

    ```bash
    npm run test
    ```

2. **Run tests with coverage:**

    ```bash
    npm run test:cov
    ```

3. **Run end-to-end tests:**

    ```bash
    npm run test:e2e
    ```

## Endpoints

Here are some of the main endpoints provided by this service:

### User Endpoints

- **Create a user:**

    ```http
    POST /users
    ```

    Request Body:

    ```json
    {
      "name": "John",
      "surname": "Doe",
      "username": "johndoe",
      "birthdate": "1990-01-01"
    }
    ```

- **Get all users:**

    ```http
    GET /users
    ```

- **Get a user by ID:**

    ```http
    GET /users/:id
    ```

- **Update a user by ID:**

    ```http
    PUT /users/:id
    ```

    Request Body:

    ```json
    {
      "name": "John"
    }
    ```

- **Delete a user by ID:**

    ```http
    DELETE /users/:id
    ```

- **Search users:**

    ```http
    POST /users/search
    ```

    Request Body:

    ```json
    {
      "username": "john",
      "minAge": 20,
      "maxAge": 30
    }
    ```

### Block Endpoints

- **Block a user:**

    ```http
    POST /block/:blockedId
    ```

- **Unblock a user:**

    ```http
    DELETE /block/:blockedId
    ```

## Including JWT in Requests

### Generating JWT Token

You can generate a JWT token using online tools like `jwt.io` for testing purposes. Ensure the token includes the necessary user id in the `sub` property of the payload.

To include a JWT token in your requests to Block or search endpoints, you need to add an `Authorization` header with the `Bearer` token. Please note that it is mandatory to add JWT token for Block endpoints.

### Example with cURL

```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer <your_jwt_token>"
```

### Example with Postman

1. Open Postman.
2. Select the request type (e.g., GET).
3. Enter the request URL (e.g., `http://localhost:3000/users`).
4. Go to the `Headers` tab.
5. Add a new header:
    - Key: `Authorization`
    - Value: `Bearer <your_jwt_token>`
6. Send the request.

