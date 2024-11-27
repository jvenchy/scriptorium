# API Documentation

## Setup and Running the Server

To set up the environment and start the server, follow these steps:

1. **Setup**: Run `startup.sh` to set up the necessary environment and dependencies.
2. **Start the Server**: Run `run.sh` to start the server.

## Endpoints

### Create a New User Account
- **Endpoint:** `POST /api/accounts/signup`
- **Description:** Creates a new user account. Validates the required fields and data types before creation.
- **Request Body:**
  - `firstName` _(string)_: The user's first name.
  - `lastName` _(string)_: The user's last name.
  - `email` _(string)_: The user's email address (must be a valid format).
  - `phoneNumber` _(string)_: The user's phone number (must contain only digits).
  - `password` _(string)_: The user's password (must be at least 7 characters).
  - `avatar` _(string, optional)_: URL or path to the user's avatar image.
- **Response:**
  - `message` _(string)_: A success message upon account creation.
  - `user` _(object)_: Object containing user details:
    - `firstName` _(string)_: The user's first name.
    - `lastName` _(string)_: The user's last name.
    - `email` _(string)_: The user's email address.
    - `phoneNumber` _(string)_: The user's phone number.
    - `avatar` _(string, optional)_: URL or path to the user's avatar, if provided.
- **Validation Rules:**
  - **Method Restriction:** Only `POST` requests are allowed.
  - **Required Fields:** `firstName`, `lastName`, `email`, `phoneNumber`, `password`.
  - **Data Types:** All fields must be strings. `avatar` is optional.
  - **Password Length:** Password must be at least 7 characters.
  - **Email Format:** Must be a valid email format.
  - **Phone Number Format:** Must contain only digits.
  - **Unique Email:** Ensures the email is not already registered.
- **Authentication:** None required for signup.
- **Error Responses:**
  - `405 Method Not Allowed`: Invalid HTTP method.
  - `400 Bad Request`: Missing required fields, invalid data types, short password, invalid email format, or non-numeric phone number.
  - `400 Bad Request`: If an account with the given email already exists.
  - `500 Internal Server Error`: On server error during account creation.
- **Example Request:**
  ```json
  POST /api/accounts/signup
  {
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane.doe@example.com",
      "phoneNumber": "1234567890",
      "password": "strongpassword",
      "avatar": "https://example.com/avatar.jpg"
  }
  ```
- **Example Response:**
  ```json
  {
    "message": "Account created successfully",
    "user": {
        "firstName": "Jane",
        "lastName": "Doe",
        "email": "jane.doe@example.com",
        "phoneNumber": "1234567890",
        "avatar": "https://example.com/avatar.jpg"
        }
  }
  ```



### User Login
- **Endpoint:** `POST /api/accounts/login`
- **Description:** Authenticates a user by verifying email and password, and returns an access token and refresh token upon successful login.
- **Request Body:**
  - `email` _(string)_: The user's email address.
  - `password` _(string)_: The user's password.
- **Response:**
  - `message` _(string)_: Success message upon successful login.
  - `accessToken` _(string)_: JWT access token for the authenticated session.
  - `refreshToken` _(string)_: JWT refresh token for renewing the session.
- **Validation Rules:**
  - **Method Restriction:** Only `POST` requests are allowed.
  - **Required Fields:** `email`, `password`.
  - **Data Types:** Both `email` and `password` must be strings.
  - **Credential Verification:** Verifies email and password against stored data. 
- **Authentication:** Required to obtain JWT tokens for session management.
- **Error Responses:**
  - `405 Method Not Allowed`: Invalid HTTP method.
  - `400 Bad Request`: Missing required fields or invalid data types.
  - `401 Unauthorized`: Invalid email or password.
  - `500 Internal Server Error`: On server error during login.
- **Example Request:**
  ```json
  POST /api/accounts/login
  {
      "email": "jane.doe@example.com",
      "password": "strongpassword"
  }
  ```
- **Example Response:**
  ```json
  {
    "message": "Login Successful",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```



### Get User Profile
- **Endpoint:** `GET /api/accounts/profile`
- **Description:** Retrieves the profile details of the authenticated user based on the JWT token.
- **Headers:**
  - `Authorization` _(string)_: Bearer token with the user's access token (e.g., `Bearer <token>`).
- **Response:**
  - `firstName` _(string)_: User's first name.
  - `lastName` _(string)_: User's last name.
  - `email` _(string)_: User's email address.
  - `avatar` _(string, optional)_: URL or path to the user's avatar image.
  - `phoneNumber` _(string)_: User's phone number.
  - `isAdministrator` _(boolean)_: Flag indicating if the user has administrative rights.
- **Validation Rules:**
  - **Method Restriction:** Only `GET` requests are allowed.
  - **Authorization:** Requires a valid Bearer token in the `Authorization` header.
  - **Token Verification:** Checks if the token is valid and not expired. Decodes the token to retrieve the user's email.
- **Error Responses:**
  - `405 Method Not Allowed`: If the request method is not `GET`.
  - `401 Unauthorized`: Missing or invalid token, or if the token is expired.
  - `404 Not Found`: If the account associated with the token's email is not found.
  - `500 Internal Server Error`: On server error during profile retrieval.
- **Example Request:**
  ```json
  GET /api/accounts/profile
  Headers: {
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Example Response:**
  ```json
  {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "phoneNumber": "1234567890",
    "isAdministrator": false
  }
  ```

### Update User Profile
- **Endpoint:** `PUT /api/accounts/profile/update`
- **Description:** Updates specific fields of the authenticated user's profile based on provided data in the request body.
- **Headers:**
  - `Authorization` _(string)_: Bearer token with the user's access token (e.g., `Bearer <token>`).
- **Request Body:**
  - `firstName` _(string, optional)_: User's new first name.
  - `lastName` _(string, optional)_: User's new last name.
  - `newEmail` _(string, optional)_: New email address for the user.
  - `avatar` _(string, optional)_: URL or path to the new avatar image.
  - `phoneNumber` _(string, optional)_: New phone number for the user.
  - `password` _(string, optional)_: New password, which will be securely hashed before updating.
- **Response:**
  - `message` _(string)_: Confirmation message indicating the profile update.
  - `firstName` _(string)_: Updated first name.
  - `lastName` _(string)_: Updated last name.
  - `email` _(string)_: Updated email.
  - `avatar` _(string)_: Updated avatar image URL/path.
  - `phoneNumber` _(string)_: Updated phone number.
- **Validation Rules:**
  - **Method Restriction:** Only `PUT` requests are allowed.
  - **Authorization:** Requires a valid Bearer token in the `Authorization` header.
  - **Token Verification:** Checks if the token is valid and not expired. Decodes the token to retrieve the user's email.
  - **Field Validation:** Verifies each provided field is of the expected data type. Ignores invalid data types and missing fields.
- **Error Responses:**
  - `405 Method Not Allowed`: If the request method is not `PUT`.
  - `401 Unauthorized`: Missing or invalid token, or if the token is expired.
  - `404 Not Found`: If the account associated with the token's email is not found.
  - `400 Bad Request`: Invalid data types for fields.
  - `500 Internal Server Error`: On server error during profile update.
- **Example Request:**
  ```json
  PUT /api/accounts/profile/update
  Headers: {
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  Body: {
      "firstName": "John",
      "lastName": "Doe",
      "newEmail": "john.doe@example.com",
      "avatar": "https://example.com/new-avatar.jpg",
      "phoneNumber": "0987654321",
      "password": "newSecurePassword123"
  }
  ```
- **Example Response:**
  ```json
  {
    "message": "Profile updated successfully",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "avatar": "https://example.com/new-avatar.jpg",
    "phoneNumber": "0987654321"
  }
  ```

### Refresh Access Token
- **Endpoint:** `POST /api/accounts/refresh`
- **Description:** Generates a new access token for the user based on a valid refresh token.
- **Headers:**
  - `Authorization` _(string)_: Bearer token with the user's refresh token (e.g., `Bearer <refresh_token>`).
- **Request Body:** None.
- **Response:**
  - `accessToken` _(string)_: Newly generated access token if the refresh token is valid and not expired.
- **Validation Rules:**
  - **Method Restriction:** Only `POST` requests are allowed.
  - **Authorization:** Requires a valid Bearer token in the `Authorization` header containing the refresh token.
  - **Token Verification:** Decodes and verifies the refresh token using `REFRESH_TOKEN_SECRET`. Checks the expiration of the refresh token.
  - **Access Token Generation:** Generates a new access token if the refresh token is valid and has not expired.
- **Error Responses:**
  - `405 Method Not Allowed`: If the request method is not `POST`.
  - `401 Unauthorized`: Missing or invalid refresh token, or if token verification fails.
  - `403 Forbidden`: If the refresh token is expired.
  - `500 Internal Server Error`: On server error during token refresh.
- **Example Request:**
  ```json
  POST /api/accounts/refresh
  Headers: {
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Example Response:**
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```


### Create a New Code Template
- **Endpoint:** `POST /api/code-templates/create`
- **Description:** Creates a new code template. `authorId` is inferred from authentication.
- **Request Body:**
  - `codeSnippet` _(string)_: The code snippet for the template.
  - `title` _(string)_: Title of the template.
  - `explanation` _(string)_: Explanation or description of the template.
  - `tags` _(array of strings)_: Tags for categorizing the template.
  - `forkedFromId` _(CodeTemplate)_: ID of the code template this was forked from, if applicable.
  - `language` _(ProgrammingLanguage)_: Programming language of the code.
- **Response:**
  - `codeTemplateId` _(CodeTemplate)_: ID of the created code template.
- **Authentication:** Logged in
- **Example Request:**
```json
POST /api/code-templates/create
{
    "codeSnippet": "console.log(\"Hello World\");",
    "title": "Simple JavaScript Console Log",
    "explanation": "This code prints Hello World to the console.",
    "tags": ["JavaScript", "Beginner", "Example"],
    "language": "JavaScript"
  }
```
- **Example Response:**
```json
{
    "codeTemplateId": 10
}
```




### Get a Code Template by ID
- **Endpoint:** `GET /api/code-templates/[id]`
- **Description:** Retrieves a specific code template by its ID.
- **Response:** JSON object representing the code template.
- **Authentication:** None
- **Example Request:**
```json
GET /api/code-templates/3
```
- **Example Response:**
```json
{
    "id": 3,
    "codeSnippet": "console.log(\"Hello, World!\");",
    "title": "Hello World Example",
    "explanation": "A simple example that prints Hello World to the console.",
    "forkedFromId": null,
    "authorId": 1,
    "language": "JavaScript",
    "tags": [
        {
            "id": 1,
            "name": "example"
        },
        {
            "id": 2,
            "name": "beginner"
        },
        {
            "id": 3,
            "name": "javascript"
        }
    ],
    "author": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "avatar": null
    },
    "forks": []
}
```

### Get All Code Templates for an Account
- **Endpoint:** `GET /api/code-templates/`
- **Description:** Retrieves all code templates from a particular account.
- **Query Parameters:**
  - `authorId` _(Author)_: ID of the author whose templates to retrieve.
  - `page` _(int)_: Page number for pagination.
  - `pageSize` _(int)_: Number of templates per page.
- **Response:** JSON list of code templates.
- **Authentication:** None
- **Example Request:**
```json
GET /api/code-templates?authorId=1&page=2&pageSize=2
```
- **Example Response:**
```json
[
    {
        "id": 4,
        "codeSnippet": "console.log(\"Hello, World!\");",
        "title": "Hello World Example",
        "explanation": "A simple example that prints Hello World to the console.",
        "language": "JavaScript",
        "forkedFromId": null,
        "tags": [
            {
                "name": "example"
            },
            {
                "name": "beginner"
            },
            {
                "name": "javascript"
            }
        ]
    },
    {
        "id": 5,
        "codeSnippet": "console.log(\"Hello, World!\");",
        "title": "Hello World Example",
        "explanation": "A simple example that prints Hello World to the console.",
        "language": "JavaScript",
        "forkedFromId": null,
        "tags": [
            {
                "name": "example"
            },
            {
                "name": "beginner"
            },
            {
                "name": "javascript"
            }
        ]
    }
]
```

### Update a Code Template
- **Endpoint:** `PUT /api/code-templates/update`
- **Description:** Edits an existing code template.
- **Request Body:**
  - `codeTemplateId` _(CodeTemplate)_: ID of the code template to update.
  - `codeSnippet` _(string)_: Updated code snippet.
  - `title` _(string)_: Updated title.
  - `explanation` _(string)_: Updated explanation.
  - `tags` _(array of strings)_: Updated tags.
  - `language` _(ProgrammingLanguage)_: Updated programming language.
- **Authentication:** Account must be the author of the `codeTemplateId`.
- **Example Request:**
```json
PUT /api/code-templates/update
{
    "codeTemplateId": 11,
    "codeSnippet": "console.log(\"Updated Code\");",
    "title": "Updated JavaScript Console Log",
    "explanation": "This code logs an updated message to the console.",
    "tags": ["JavaScript", "Updated", "Example"],
    "language": "JavaScript"
  }
```
- **Example Response:**
```json
{
    "codeTemplateId": 11
}
```

### Delete a Code Template
- **Endpoint:** `DELETE /api/code-templates/delete`
- **Description:** Deletes a code template.
- **Request Body:**
  - `codeTemplateId` _(CodeTemplate)_: ID of the code template to delete.
- **Authentication:** Account must be the author of the `codeTemplateId`.
- **Example Request:**
```json
DELETE /api/code-templates/delete
{
    "codeTemplateId": 11
}
```
- **Example Response:**
```json
{
    "message": "Code template deleted successfully"
}
```

### Run Arbitrary Code
- **Endpoint:** `POST /api/code-templates/run`
- **Description:** Executes arbitrary code.
- **Request Body:**
  - `codeSnippet` _(string)_: Code to be executed.
  - `language` _(ProgrammingLanguage)_: Programming language of the code.
  - `stdin` _(string)_: Standard input for the code.
- **Response:**
  - `errorString`: Error message, if any.
  - `outputString`: Output of the code execution.
- **Authentication:** None
- **Notes:** Code execution times out after 5 seconds.
- **Example Request:**
```json
POST /api/code-templates/run
{
  "codeSnippet": "name = input()\nprint(f\"Hello, {name}!\")",
  "language": "python",
  "stdin": "john"
}
```
- **Example Response:**
```json
{
    "errorString": "",
    "outputString": "Hello, john!\n"
}
```

### Create Blog Post
- **Endpoint:** `POST /api/blogPosts/create`
- **Description:** Creates a new blog post associated with the authenticated user, including optional tags and code templates.
- **Headers:**
  - `Authorization` _(string)_: Bearer token containing the user's access token (e.g., `Bearer <access_token>`).
- **Request Body:**
  - `title` _(string, required)_: Title of the blog post.
  - `description` _(string, required)_: Description or content of the blog post.
  - `tags` _(array of integers, optional)_: Array of tag IDs to associate with the blog post.
  - `codeTemplates` _(array of integers, optional)_: Array of code template IDs to link to the blog post.
- **Response:**
  - `id` _(integer)_: ID of the created blog post.
  - `title` _(string)_: Title of the blog post.
  - `description` _(string)_: Description of the blog post.
  - `authorId` _(integer)_: ID of the author.
  - `tags` _(array of objects)_: Tags associated with the blog post.
  - `codeTemplates` _(array of objects)_: Code templates associated with the blog post.
- **Validation Rules:**
  - **Method Restriction:** Only `POST` requests are allowed.
  - **Authorization:** Requires a valid Bearer token in the `Authorization` header.
  - **Token Verification:** Decodes and verifies the access token using `ACCESS_TOKEN_SECRET`.
  - **Field Validation:** Ensures `title` and `description` are strings. Verifies `tags` and `codeTemplates` as arrays of integers.
  - **Tag & Template Existence:** Checks that each tag ID and code template ID exists in the database.
- **Error Responses:**
  - `405 Method Not Allowed`: If the request method is not `POST`.
  - `401 Unauthorized`: Missing or invalid access token, or if token verification fails.
  - `400 Bad Request`: Missing required fields, incorrect data types, or if a specified tag or template ID does not exist.
  - `500 Internal Server Error`: On server error during post creation.
- **Example Request:**
  ```json
  POST /api/blogPosts/create
  Headers: {
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  Body: {
      "title": "My First Blog Post",
      "description": "This is an introductory post.",
      "tags": [1, 2],
      "codeTemplates": [3, 4]
  }
  ```
- **Example Response:**
  ```json
  {
    "id": 1,
    "title": "My First Blog Post",
    "description": "This is an introductory post.",
    "authorId": 10,
    "tags": [{"id": 1, "name": "JavaScript"}, {"id": 2, "name": "Web Development"}],
    "codeTemplates": [{"id": 3, "name": "Basic Setup"}, {"id": 4, "name": "Advanced Config"}]
  }
  ```

### Get All Blog Posts with Filters

- **Endpoint:** `GET /api/blogPosts`
- **Description:** Retrieves a list of blog posts with optional filters for title, description, tags, and code templates. Supports sorting and pagination.
- **Query Parameters:**
  - `title` _(string, optional)_: Filters posts by a title containing this string.
  - `description` _(string, optional)_: Filters posts by a description containing this string.
  - `tags` _(array of integers or single integer, optional)_: Filters posts by one or more tag IDs.
  - `codeTemplateId` _(integer, optional)_: Filters posts by the specified code template ID.
  - `sort` _(string, optional)_: Sorts posts by:
    - `createdAt_desc` (default): Newest posts first.
    - `createdAt_asc`: Oldest posts first.
    - `upvotes`: Sort by upvotes in descending order.
    - `downvotes`: Sort by downvotes in descending order.
  - `page` _(integer, optional)_: Specifies the page number for pagination (default: 1).
  - `limit` _(integer, optional)_: Number of posts per page (default: 10).
- **Response:**
  - `posts` _(array)_: Array of filtered and sorted blog posts. Each post contains:
    - `id` _(integer)_: Blog post ID.
    - `title` _(string)_: Blog post title.
    - `description` _(string)_: Blog post description.
    - `author` _(object)_: Information about the author, including:
      - `id` _(integer)_: Author ID.
      - `email` _(string)_: Author's email.
      - `firstName` _(string)_: Author's first name.
      - `lastName` _(string)_: Author's last name.
    - `tags` _(array)_: Tags associated with the post, each containing:
      - `id` _(integer)_: Tag ID.
      - `name` _(string)_: Tag name.
    - `codeTemplates` _(array)_: Code templates associated with the post, each containing:
      - `id` _(integer)_: Code template ID.
      - `title` _(string)_: Code template title.
    - `createdAt` _(string)_: Timestamp when the post was created.
    - `stats` _(object)_: Statistics of the post, including:
      - `upvotes` _(integer)_: Number of upvotes.
      - `downvotes` _(integer)_: Number of downvotes.
      - `comments` _(integer)_: Number of comments.
      - `reports` _(integer)_: Number of reports.
      - `visibility` _(boolean)_: Post visibility status.
  - `pagination` _(object)_: Metadata about the current pagination state:
    - `currentPage` _(integer)_: Current page number.
    - `totalPages` _(integer)_: Total number of pages.
    - `totalItems` _(integer)_: Total number of blog posts matching the filters.
    - `itemsPerPage` _(integer)_: Number of posts per page.
    - `hasNextPage` _(boolean)_: Indicates if there is a next page.
    - `hasPreviousPage` _(boolean)_: Indicates if there is a previous page.
- **Validation Rules:**
  - **Method Restriction:** Only `GET` requests are allowed.
  - **Filter Validation:** Ensures `tags` and `codeTemplateId` filters match existing database entries.
  - **Sort Options:** Allows sorting by `upvotes`, `downvotes`, `createdAt_asc`, or `createdAt_desc`.
  - **Pagination:** Defaults to page 1 and 10 items per page if unspecified.
- **Error Responses:**
  - `405 Method Not Allowed`: If the request method is not `GET`.
  - `500 Internal Server Error`: On server error during data retrieval.
- **Example Request:**
  ```plaintext
  GET /api/blogPosts?title=Intro&tags=1&tags=2&sort=upvotes&page=2&limit=5
  ```
- **Example Response:**
  ```json
  {
    "posts": [
        {
        "id": 1,
        "title": "Intro to Coding",
        "description": "A guide for beginners.",
        "author": {
            "id": 10,
            "email": "author@example.com",
            "firstName": "John",
            "lastName": "Doe"
        },
        "tags": [
            { "id": 1, "name": "JavaScript" },
            { "id": 2, "name": "Web Development" }
        ],
        "codeTemplates": [
            { "id": 3, "title": "Basic Setup" }
        ],
        "createdAt": "2024-01-01T10:00:00Z",
        "stats": {
            "upvotes": 150,
            "downvotes": 5,
            "comments": 10,
            "reports": 2,
            "visibility": true
        }
        }
    ],
    "pagination": {
        "currentPage": 2,
        "totalPages": 5,
        "totalItems": 50,
        "itemsPerPage": 5,
        "hasNextPage": true,
        "hasPreviousPage": true
    }
  }
  ```

### Edit Blog Post
- **Endpoint:** `PUT /api/blogPosts/[id]/edit`
- **Description:** Edits an existing blog post associated with the authenticated user, allowing modifications to the title, description, tags, and code templates.
- **Headers:**
  - `Authorization` _(string)_: Bearer token containing the user's access token (e.g., `Bearer <access_token>`).
- **URL Parameters:**
  - `blogPostId` _(integer, required)_: ID of the blog post to edit.
- **Request Body:**
  - `title` _(string, optional)_: New title of the blog post.
  - `description` _(string, optional)_: New description or content of the blog post.
  - `tags` _(array of integers, optional)_: Array of tag IDs to associate with the blog post.
  - `codeTemplates` _(array of integers, optional)_: Array of code template IDs to link to the blog post.
- **Response:**
  - `id` _(integer)_: ID of the updated blog post.
  - `title` _(string)_: Updated title of the blog post.
  - `description` _(string)_: Updated description of the blog post.
  - `authorId` _(integer)_: ID of the author.
  - `tags` _(array of objects)_: Tags associated with the blog post.
  - `codeTemplates` _(array of objects)_: Code templates associated with the blog post.
- **Validation Rules:**
  - **Method Restriction:** Only `PUT` requests are allowed.
  - **Authorization:** Requires a valid Bearer token in the `Authorization` header.
  - **Token Verification:** Decodes and verifies the access token using `ACCESS_TOKEN_SECRET`.
  - **Field Validation:** Ensures `title` and `description` are strings, `tags` and `codeTemplates` are arrays of integers if provided.
  - **Ownership Check:** Confirms that the authenticated user is the author of the post.
  - **Tag & Template Existence:** Checks that each specified tag ID and code template ID exists in the database.
- **Error Responses:**
  - `405 Method Not Allowed`: If the request method is not `PUT`.
  - `401 Unauthorized`: Missing or invalid access token, or if token verification fails.
  - `400 Bad Request`: Invalid data types, missing blog post ID, or if a specified tag or template ID does not exist.
  - `403 Forbidden`: If the user is not authorized to edit the post.
  - `404 Not Found`: If the specified blog post does not exist.
  - `500 Internal Server Error`: On server error during post update.
- **Example Request:**
  ```json
  PUT /api/blogPosts/1/edit
  Headers: {
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  Body: {
      "title": "Updated Blog Title",
      "description": "Updated blog content.",
      "tags": [1, 3],
      "codeTemplates": [5, 7]
  }
  ```
- **Example Response:**
  ```json
  {
    "id": 1,
    "title": "Updated Blog Title",
    "description": "Updated blog content.",
    "authorId": 10,
    "tags": [{"id": 1, "name": "JavaScript"}, {"id": 3, "name": "Web Design"}],
    "codeTemplates": [{"id": 5, "name": "Starter Template"}, {"id": 7, "name": "Responsive Layout"}]
  }
  ```

### Delete Blog Post
- **Endpoint:** `DELETE /api/blogPosts/[id]/delete`
- **Description:** Deletes a blog post if the request is made by the post’s author or an administrator.
- **Headers:**
  - `Authorization` _(string)_: Bearer token containing the user's access token (e.g., `Bearer <access_token>`).
- **URL Parameters:**
  - `blogPostId` _(integer, required)_: ID of the blog post to delete.
- **Response:**
  - `message` _(string)_: Confirmation message for successful deletion.
  - `deletedPostId` _(integer)_: ID of the deleted blog post.
- **Validation Rules:**
  - **Method Restriction:** Only `DELETE` requests are allowed.
  - **Authorization:** Requires a valid Bearer token in the `Authorization` header.
  - **Token Verification:** Decodes and verifies the access token using `ACCESS_TOKEN_SECRET`.
  - **Field Validation:** Ensures the blog post ID is provided and is a number.
  - **Ownership/Admin Check:** Confirms that the authenticated user is either the author of the post or an administrator.
- **Error Responses:**
  - `405 Method Not Allowed`: If the request method is not `DELETE`.
  - `401 Unauthorized`: Missing or invalid access token, or if token verification fails.
  - `400 Bad Request`: Invalid or missing blog post ID.
  - `403 Forbidden`: If the user is not authorized to delete the post.
  - `404 Not Found`: If the specified blog post does not exist.
  - `500 Internal Server Error`: On server error during post deletion.
- **Example Request:**
  ```json
  DELETE /api/blogPosts/1/delete
  Headers: {
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Example Response:**
  ```json
  {
    "message": "Blog post deleted successfully",
    "deletedPostId": 1
  }
  ```


### Get Blog Post with Details
- **Endpoint:** `GET /api/blogPosts/[id]`
- **Description:** Fetches a blog post along with related data, including the author details, tags, code templates, and comments.
- **URL Parameters:**
  - `blogPostId` _(integer, required)_: ID of the blog post to fetch.
- **Response Structure:**
  - **Success (200):** Returns the blog post and associated data.
    - `id` _(integer)_: ID of the blog post.
    - `title` _(string)_: Title of the blog post.
    - `description` _(string)_: Brief description of the blog post.
    - `content` _(string)_: Content of the blog post.
    - `createdAt` _(datetime)_: Creation date of the blog post.
    - `updatedAt` _(datetime)_: Last update date of the blog post.
    - `author` _(object)_: Details of the blog post author.
      - `id` _(integer)_: Author's ID.
      - `email` _(string)_: Author's email.
      - `firstName` _(string)_: Author's first name.
      - `lastName` _(string)_: Author's last name.
      - `avatar` _(string)_: URL of the author's avatar.
    - `tags` _(array)_: Tags associated with the blog post.
      - Each tag has `id` _(integer)_ and `name` _(string)_.
    - `codeTemplates` _(array)_: Code templates associated with the blog post.
      - Each template has `id` _(integer)_, `title` _(string)_, `explanation` _(string)_, and `language` _(string)_.
    - `comments` _(array)_: Comments on the blog post, sorted by creation date in descending order.
      - Each comment has `author` (with `id`, `firstName`, `lastName`, and `avatar`).
- **Validation Rules:**
  - **Method Restriction:** Only `GET` requests are allowed.
  - **Field Validation:** Ensures the blog post ID is provided and is a number.
- **Error Responses:**
  - `405 Method Not Allowed`: If the request method is not `GET`.
  - `400 Bad Request`: If the blog post ID is missing or invalid.
  - `404 Not Found`: If the specified blog post does not exist.
  - `500 Internal Server Error`: On server error during blog post retrieval.
- **Example Request:**
  ```json
  GET /api/admin/blog-post/1
  ```
- **Example Response:**
  ```json
  {
    "id": 1,
    "title": "Introduction to Prisma",
    "description": "A detailed guide on using Prisma ORM.",
    "content": "Prisma is a next-generation ORM...",
    "createdAt": "2024-11-02T12:00:00Z",
    "updatedAt": "2024-11-02T15:30:00Z",
    "author": {
        "id": 1,
        "email": "author@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "https://example.com/avatar.jpg"
    },
    "tags": [
        { "id": 1, "name": "ORM" },
        { "id": 2, "name": "Database" }
    ],
    "codeTemplates": [
        {
        "id": 1,
        "title": "Prisma Setup",
        "explanation": "How to set up Prisma in a Node.js project",
        "language": "JavaScript"
        }
    ],
    "comments": [
        {
        "author": {
            "id": 2,
            "firstName": "Jane",
            "lastName": "Smith",
            "avatar": "https://example.com/avatar2.jpg"
        },
        "content": "Great article!",
        "createdAt": "2024-11-02T14:00:00Z"
        }
    ]
  }
  ```

### Report Blog Post
- **Endpoint:** `POST /api/blogPosts/[id]/report`
- **Description:** Allows an authenticated user to report a blog post with an explanation. It creates a report entry linked to the blog post and increments the report count.
- **URL Parameters:**
  - `id` _(integer, required)_: ID of the blog post being reported.
- **Request Headers:**
  - `Authorization` _(string, required)_: Bearer token for user authentication.
- **Request Body:**
  - `explanation` _(string, required)_: Reason provided by the user for reporting the blog post.
- **Response Structure:**
  - **Success (201):** Returns the newly created report entry.
    - `id` _(integer)_: Report ID.
    - `blogPostId` _(integer)_: ID of the blog post being reported.
    - `reporterId` _(integer)_: ID of the reporting user.
    - `explanation` _(string)_: Explanation given for the report.
- **Validation Rules:**
  - **Method Restriction:** Only `POST` requests are allowed.
  - **Authorization Header:** Token must be provided in the format `Bearer <token>`.
  - **Field Validation:** Ensures blog post ID is provided, explanation is included and is a string.
- **Error Responses:**
  - `405 Method Not Allowed`: If the request method is not `POST`.
  - `401 Unauthorized`: If the authorization header is missing, invalid, or token is expired.
  - `400 Bad Request`: If the blog post ID or explanation is missing, or invalid data type is provided.
  - `404 Not Found`: If the specified blog post does not exist.
  - `500 Internal Server Error`: On server error during report creation.
- **Example Request:**
  ```json
  POST /api/blogPosts/1/report
  Authorization: Bearer <token>
  
  {
    "explanation": "This post contains offensive content."
  }
  ```
- **Example Response:**
  ```json
  {
    "id": 1,
    "blogPostId": 1,
    "reporterId": 42,
    "explanation": "This post contains offensive content."
  }
  ```

### Vote on a Blog Post
- **Endpoint:** `POST /api/blogPosts/[id]/vote`
- **Description:** Allows a user to upvote or downvote a blog post. The `userId` is inferred from the provided authentication token.
- **Request Body:**
  - `voteType` _(string)_: The type of vote to be recorded. Must be either `"upvote"` or `"downvote"`.
- **Response:**
  - `message` _(string)_: Confirmation message indicating the vote was processed successfully.
  - `blogPostId` _(number)_: ID of the blog post that was voted on.
  - `stats` _(object)_: Contains updated vote statistics.
    - `upvotes` _(number)_: The total number of upvotes.
    - `downvotes` _(number)_: The total number of downvotes.
    - `score` _(number)_: The net score calculated as `upvotes - downvotes`.
- **Authentication:** Required (Bearer token in the Authorization header)
- **Example Request:**
  ```json
  POST /api/blogPosts/3/vote
  {
    "voteType": "upvote"
  }
  ```
- **Example Response:**
  ```json
  {
    "message": "Vote processed successfully",
    "blogPostId": 3,
    "stats": {
        "upvotes": 15,
        "downvotes": 3,
        "score": 12
    }
  }
  ```

### Create a Tag for a Blog Post
- **Endpoint:** `POST /api/blogPosts/[id]/tags/create`
- **Description:** Creates a new tag for a specific blog post. The `authorId` is inferred from the provided authentication token.
- **Request Body:**
  - `name` _(string)_: The name of the tag to be created. Must be unique for each blog post.
- **Response:**
  - Returns the created tag object, which includes the `id` and `name` of the tag.
- **Authentication:** Required (Bearer token in the Authorization header)
- **Example Request:**
  ```json
  POST /api/blogPosts/3/tags/create
  {
    "name": "Technology"
  }
  ```
- **Example Response:**
  ```json
  {
    "id": 1,
    "name": "Technology"
  }
  ```

### Get All Tags
- **Endpoint:** `GET /api/blogPosts/[id]/tags`
- **Description:** Retrieves a paginated list of tags. No authentication is required.
- **Query Parameters:**
  - `page` _(number)_: The page number to retrieve (default is 1).
  - `limit` _(number)_: The number of tags to return per page (default is 10).
- **Response:**
  - Returns an object containing the list of tags and pagination metadata.
- **Example Request:**
  ```json
  GET /api/blogPosts/1/tags?page=2&limit=5
  ```
- **Example Response:**
  ```json
  {
    "tags": [
        { "id": 1, "name": "Technology" },
        { "id": 2, "name": "Health" },
        { "id": 3, "name": "Lifestyle" },
        { "id": 4, "name": "Education" },
        { "id": 5, "name": "Science" }
    ],
    "pagination": {
        "currentPage": 2,
        "totalPages": 3,
        "totalItems": 25,
        "itemsPerPage": 5,
        "hasNextPage": true,
        "hasPreviousPage": true
    }
  }
  ```

### Update Tag
- **Endpoint:** `PUT /api/blogPosts/[id]/tags/[tagId]/edit`
- **Description:** Updates the name of an existing tag. Authorization is required.
- **URL Parameters:**
  - `id` _(number)_: The ID of the tag to update.
- **Request Body:**
  - `name` _(string)_: The new name for the tag. It must be a unique name that does not already exist.
- **Response:**
  - Returns the updated tag object upon successful update.
- **Authorization:**
  - A valid JWT must be provided in the `Authorization` header as a Bearer token.
- **Error Responses:**
  - `400 Bad Request`: If the tag ID is missing, invalid, or if the new tag name is missing or not a string.
  - `401 Unauthorized`: If the authorization header is missing or invalid, or if the token is expired or invalid.
  - `404 Not Found`: If the tag with the specified ID does not exist.
  - `400 Bad Request`: If the new tag name already exists.
- **Example Request:**
  ```json
  PUT /api/blogPosts/1/tags/1/edit
  Authorization: Bearer your_jwt_token
  {
    "name": "Updated Tag Name"
  }
  ```
- **Example Response:**
  ```json
  {
    "id": 1,
    "name": "Updated Tag Name"
  }
  ```

### Delete Tag
- **Endpoint:** `DELETE /api/blogPosts/[id]/tags/[tagId]/delete`
- **Description:** Deletes an existing tag. Authorization is required to ensure that only the tag author can delete it.
- **URL Parameters:**
  - `id` _(number)_: The ID of the tag to delete.
- **Response:**
  - Returns a success message upon successful deletion.
- **Authorization:**
  - A valid JWT must be provided in the `Authorization` header as a Bearer token.
- **Example Request:**
  ```json
  DELETE /api/blogPosts/1/tags/1/delete
  Authorization: Bearer your_jwt_token
  ```
- **Example Response:**
  ```json
  {
    "message": "Tag deleted successfully"
  }
  ```

### Get Comments for a Blog Post
- **Endpoint:** `GET /api/blogPosts/[id]/comments`
- **Description:** Retrieves comments associated with a specific blog post, including pagination and sorting options.
- **URL Parameters:**
  - `id` _(number)_: The ID of the blog post for which to retrieve comments.
- **Query Parameters:**
  - `sort` _(string)_: The criteria for sorting comments. Options include:
    - `upvotes` - Sort by the number of upvotes in descending order.
    - `downvotes` - Sort by the number of downvotes in descending order.
    - `createdAt` - Sort by creation date in descending order (default).
  - `page` _(number)_: The page number for pagination (default: `1`).
  - `limit` _(number)_: The number of comments per page (default: `10`).
- **Response:**
  - Returns a list of comments along with pagination metadata.
- **Example Request:**
  ```json
  GET /api/blogPosts/1/comments?sort=upvotes&page=1&limit=10
  ```
- **Example Response:**
  ```json
  {
    "comments": [
        {
        "id": 1,
        "blogPostId": 1,
        "authorId": 2,
        "content": "Great post!",
        "upvotes": 5,
        "downvotes": 0,
        "createdAt": "2023-11-01T10:00:00Z"
        },
        // more comments...
    ],
    "pagination": {
        "currentPage": 1,
        "totalPages": 3,
        "totalItems": 25,
        "itemsPerPage": 10,
        "hasNextPage": true,
        "hasPreviousPage": false
    }
  }
  ```

### Create a Comment for a Blog Post
- **Endpoint:** `POST /api/blogPosts/[id]/comments/create`
- **Description:** Creates a new comment (or reply) for a specific blog post.
- **URL Parameters:**
  - `id` _(number)_: The ID of the blog post for which to create a comment.
- **Request Headers:**
  - `Authorization` _(string)_: Bearer token for user authentication. The token should be in the format: `Bearer <token>`.
- **Request Body:**
  - `content` _(string)_: The content of the comment (required).
  - `parentCommentId` _(number, optional)_: The ID of the parent comment if the new comment is a reply. Must be a number if provided.
- **Response:**
  - Returns the newly created comment object, including its ID, content, author ID, blog post ID, parent comment ID (if applicable), and timestamps.
- **Example Request:**
  ```json
  POST /api/blogPosts/1/comments/create
  Authorization: Bearer your_jwt_token
  Content-Type: application/json
  {
    "content": "This is a new comment!",
    "parentCommentId": null
  }
  ```
- **Example Response:**
  ```json
  {
    "id": 1,
    "content": "This is a new comment!",
    "authorId": 2,
    "blogPostId": 1,
    "parentCommentId": null,
    "createdAt": "2023-11-01T10:00:00Z",
    "updatedAt": "2023-11-01T10:00:00Z"
  }
  ```

### Get Replies for a Comment
- **Endpoint:** `GET /api/blogPosts/[id]/comments/[commentId]/replies`
- **Description:** Retrieves replies (child comments) for a specific comment under a blog post, with pagination support.
- **URL Parameters:**
  - `id` _(number)_: The ID of the blog post.
  - `commentId` _(number)_: The ID of the comment for which to retrieve replies.
- **Query Parameters:**
  - `page` _(number, optional)_: The page number for pagination. Defaults to `1`.
  - `limit` _(number, optional)_: The number of replies to return per page. Defaults to `10`.
- **Response:**
  - Returns an array of replies (comments) along with pagination metadata.
- **Example Request:**
  ```plaintext
  GET /api/blogPosts/1/comments/10/replies?page=1&limit=5
  ```
- **Example Response:**
  ```json
  {
    "replies": [
        {
        "id": 1,
        "content": "This is a reply!",
        "authorId": 2,
        "blogPostId": 1,
        "parentCommentId": 10,
        "createdAt": "2023-11-01T11:00:00Z",
        "updatedAt": "2023-11-01T11:00:00Z"
        }
    ],
    "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalItems": 1,
        "itemsPerPage": 5,
        "hasNextPage": false,
        "hasPreviousPage": false
    }
  }
  ```

### Edit a Comment
- **Endpoint:** `PUT /api/blogPosts/[id]/comments/[commentId]/edit`
- **Description:** Edits an existing comment by updating its content. Only the author of the comment can edit it, and certain comments may be marked as uneditable.
- **URL Parameters:**
  - `commentId` _(number)_: The ID of the comment to be edited.
- **Request Body:**
  - `content` _(string)_: The new content for the comment. This field is required.
- **Authorization:**
  - Requires a Bearer token in the `Authorization` header.
- **Response:**
  - Returns the updated comment object.
- **Example Request:**
  ```json
  PUT /api/blogPosts/1/comments/1/edit
  Authorization: Bearer your_jwt_token

  {
    "content": "Updated comment content."
  }
  ```
- **Example Response**
  ```json
  {
    "id": 1,
    "content": "Updated comment content.",
    "authorId": 2,
    "blogPostId": 1,
    "parentCommentId": null,
    "createdAt": "2023-11-01T11:00:00Z",
    "updatedAt": "2023-11-02T11:00:00Z"
  }
  ```

### Delete a Comment
- **Endpoint:** `DELETE /api/blogPosts/[id]/comments/[commentId]/delete`
- **Description:** Deletes a specific comment. Only the author of the comment is authorized to delete it.
- **URL Parameters:**
  - `commentId` _(number)_: The ID of the comment to be deleted.
- **Authorization:**
  - Requires a Bearer token in the `Authorization` header.
- **Response:**
  - Returns a success message upon successful deletion of the comment.
- **Example Request:**
  ```plaintext
  DELETE /api/blogPosts/1/comments/1/delete
  Authorization: Bearer your_jwt_token
  ```
- **Example Request:**
  ```json
  {
    "message": "Comment deleted successfully",
    "deletedCommentId": 1
  }
  ```

### Report a Blog Post Comment
- **Endpoint:** `POST /api/blog-posts/[id]/comments/[commentId]/report`
- **Description:** Allows a user to report a specific comment on a blog post. Creates a report record and increments the comment's report counter.
- **Request Body:**
 - `explanation` _(string)_: Explanation/reason for reporting the comment.
- **Request Headers:**
 - `Authorization` _(string)_: Bearer token for authentication.
- **URL Parameters:**
 - `id` _(number)_: ID of the blog post containing the comment.
 - `commentId` _(number)_: ID of the comment being reported.
- **Response:** JSON object containing the created report details.
- **Authentication:** Logged in (Bearer token required)
- **Example Request:**
  ```json
  POST /api/blogPosts/42/comments/123/report
  Authorization: Bearer <access_token>
  {
    "explanation": "This comment contains inappropriate content"
  }
  ```
- **Example Response:**
  ```json
  {
    "commentId": 123,
    "reporterId": 789,
    "explanation": "This comment contains inappropriate content",
  }
  ```

### Vote on a Comment
- **Endpoint:** `POST /api/blogPosts/[id]/comments/[commentId]/vote`
- **Description:** Allows a user to upvote or downvote a specific comment. Each user can only have one active vote (upvote or downvote) per comment.
- **Request Body:**
  - `voteType` _(string)_: Type of vote to cast. Must be either "upvote" or "downvote".
- **Request Headers:**
  - `Authorization` _(string)_: Bearer token for authentication.
- **URL Parameters:**
  - `commentId` _(number)_: ID of the comment to vote on.
- **Response:** JSON object containing updated vote statistics.
- **Authentication:** Logged in (Bearer token required)
- **Example Request:**
  ```json
  POST /api/blogPosts/1/comments/123/vote
  Authorization: Bearer <access_token>
  {
    "voteType": "upvote"
  }
  ```
- **Example Response:**
  ```json
  {
    "message": "Vote processed successfully",
    "commentId": "123",
    "stats": {
        "upvotes": 10,
        "downvotes": 2,
        "score": 8
    }
  }
  ```

### Get Reported Blog Posts (Admin)
- **Endpoint:** `GET /api/admin/reports/blogPosts`
- **Description:** Retrieves a paginated list of reported blog posts for admin review. Posts can be sorted by number of reports or creation date.
- **Query Parameters:**
 - `sortBy` _(string, optional)_: Field to sort by. Valid values: "date" or "reports" (default: "reports")
 - `page` _(number, optional)_: Page number for pagination (default: 1)
 - `limit` _(number, optional)_: Number of items per page (default: 10)
- **Response:** JSON array of reported blog posts.
- **Authentication:** Admin access required
- **Example Request:**
  ```json
  GET /api/admin/reports/blogPosts?sortBy=reports&page=1&limit=10
  Authorization: Bearer <admin_access_token>
  ```
- **Example Response:**
  ```json
    {
        "id": 123,
        "title": "Example Blog Post",
        "content": "Post content here...",
        "authorId": 456,
        "numReports": 5,
        "isVisible": true,
        "canEdit": true,
        "createdAt": "2024-01-01T12:00:00.000Z",
        "updatedAt": "2024-01-01T12:00:00.000Z"
    },
    // ... more blog posts
  ```

### Hide a Blog Post (Admin)
- **Endpoint:** `PUT /api/admin/reports/blogPosts/[blogPostId]/hide`
- **Description:** Allows an admin to hide a blog post by setting its visibility and editability to false. This endpoint is protected by admin authentication middleware.
- **URL Parameters:**
 - `blogPostId` _(number)_: ID of the blog post to hide.
- **Response:** JSON object confirming the action.
- **Authentication:** Admin access required
- **Example Request:**
  ```json
  PUT /api/admin/reports/blogPosts/123/hide
  Authorization: Bearer <admin_access_token>
  ```
- **Example Response:**
  ```json
  {
    "message": "Blog post hidden successfully."
  }
  ```

### Get Reported Comments (Admin)
- **Endpoint:** `GET /api/admin/reports/comments`
- **Description:** Retrieves a paginated list of reported comments for admin review. Comments can be sorted by number of reports or creation date.
- **Query Parameters:**
 - `sortBy` _(string, optional)_: Field to sort by. Valid values: "date" or "reports" (default: "reports")
 - `page` _(number, optional)_: Page number for pagination (default: 1)
 - `limit` _(number, optional)_: Number of items per page (default: 10)
- **Response:** JSON array of reported comments.
- **Authentication:** Admin access required
- **Example Request:**
  ```json
  GET /api/admin/reports/comments?sortBy=reports&page=1&limit=10
  Authorization: Bearer <admin_access_token>
  ```
- **Example Response:**
  ```json
    {
        "id": 123,
        "content": "Comment content here...",
        "authorId": 456,
        "blogPostId": 789,
        "numReports": 5,
        "isVisible": true,
        "canEdit": true,
        "createdAt": "2024-01-01T12:00:00.000Z",
        "updatedAt": "2024-01-01T12:00:00.000Z"
    },
    // ... more comments
  ```

### Hide a Comment (Admin)
- **Endpoint:** `PUT /api/admin/reports/comments/[commentId]/hide`
- **Description:** Allows an admin to hide a comment by setting its visibility and editability to false. This endpoint is protected by admin authentication middleware.
- **URL Parameters:**
 - `commentId` _(number)_: ID of the comment to hide.
- **Response:** JSON object confirming the action.
- **Authentication:** Admin access required
- **Example Request:**
  ```json
  PUT /api/admin/reports/comments/123/hide
  Authorization: Bearer <admin_access_token>
  ```
- **Example Response:**
  ```json
  {
    "message": "Comment hidden successfully."
  }
  ```

---

