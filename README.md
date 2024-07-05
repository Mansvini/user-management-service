```markdown
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

# JWT
JWT_SECRET=your_jwt_secret

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
    PATCH /users/:id
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

### Generating JWT Token

You can generate a JWT token using your authentication endpoint (if implemented) or using online tools for testing purposes. Ensure the token includes the necessary payload and is signed with the secret specified in your `.env` file.

The JWT token should contain user id in the `sub` property of the object.
