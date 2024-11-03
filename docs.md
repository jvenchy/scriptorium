# Documentation

## Setup and Running the Server

To set up the environment and start the server, follow these steps:

1. **Setup**: Run `startup.sh` to set up the necessary environment and dependencies.
2. **Start the Server**: Run `run.sh` to start the server.

## Endpoints

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
- **Notes:** 
    - The supported languages are `java`, `javascript`, `python`, `c`, and `cpp`
- **Example Request:**
```json
POST /api/code-templates/create
{
    "codeSnippet": "console.log(\"Hello World\");",
    "title": "Simple JavaScript Console Log",
    "explanation": "This code prints Hello World to the console.",
    "tags": ["JavaScript", "Beginner", "Example"],
    "forkedFromId": null,
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
- **Notes:** 
    - The supported languages are `java`, `javascript`, `python`, `c`, and `cpp`
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
- **Notes:** 
    - The supported languages are `java`, `javascript`, `python`, `c`, and `cpp`
    - Code execution times out after 5 seconds.
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

---


## Models

### **Account**
Represents a user account in the system.

- **Fields**:
  - `id`: Unique identifier (Primary Key).
  - `firstName` and `lastName`: User's full name.
  - `email`: Unique email address for the user.
  - `avatar`: Optional URL to the user's profile picture.
  - `phoneNumber`: User's contact number.
  - `passwordHash`: Encrypted password for secure login.
  - `isAdministrator`: Boolean to mark admin privileges (default is `false`).
- **Relations**:
  - `codeTemplates`: One-to-many relationship with **CodeTemplate** (authored templates).
  - `blogPosts`: One-to-many relationship with **BlogPost** (authored posts).
  - `comments`: One-to-many relationship with **Comment** (user's comments).
  - `postVotes` & `commentVotes`: Tracks votes cast by the user on posts and comments.

### **CodeTemplate**
Represents a reusable code snippet shared by users.

- **Fields**:
  - `id`: Unique identifier.
  - `codeSnippet`: Optional code string.
  - `title`: Title of the code template.
  - `explanation`: Description or explanation of the code template.
  - `language`: Programming language of the code snippet.
- **Relations**:
  - `tags`: Many-to-many relationship with **Tag**.
  - `forkedFrom` & `forks`: Self-referencing to track forks and originals.
  - `author`: Relation to **Account** representing the author.
  - `blogPosts`: Templates linked to blog posts.

### **CodeExecution**
Records the output and errors of executed code snippets.

- **Fields**:
  - `id`: Unique identifier.
  - `codeString`: Code executed.
  - `errorString` & `outputString`: Error and output messages.
  - `runTime`: Duration of execution.

### **BlogPost**
Represents blog content posted by users.

- **Fields**:
  - `id`: Unique identifier.
  - `title`: Blog post title.
  - `description`: Blog post body.
  - `upvotes`, `downvotes`: Count of upvotes and downvotes.
  - `numReports`: Number of reports made against the post.
  - `canEdit` & `isVisible`: Control editability and visibility.
  - `createdAt` & `updatedAt`: Timestamps for tracking.
- **Relations**:
  - `tags`: Many-to-many relationship with **Tag**.
  - `codeTemplates`: Many-to-many relationship with **CodeTemplate**.
  - `comments`: One-to-many relationship with **Comment**.
  - `votes`: Many-to-one with **BlogPostVote** for tracking votes.
  - `reports`: One-to-many with **PostReport** for tracking reports.
  - `author`: Relation to **Account**.

### **BlogPostVote**
Tracks votes on blog posts, ensuring each user can only vote once per post.

- **Fields**:
  - `id`: Unique identifier.
  - `voteType`: Type of vote (e.g., upvote/downvote).
- **Relations**:
  - `blogPost`: Reference to the voted **BlogPost**.
  - `account`: Reference to the voting **Account**.

- **Unique Constraint**:
  - Prevents duplicate votes by the same user on the same post.

### **Comment**
Represents user comments on blog posts and allows for nested replies.

- **Fields**:
  - `id`: Unique identifier.
  - `content`: Comment text.
  - `upvotes`, `downvotes`: Count of upvotes and downvotes.
  - `numReports`: Number of reports against the comment.
  - `parentCommentId`: Reference for nested replies.
  - `canEdit` & `isVisible`: Control editability and visibility.
  - `createdAt` & `updatedAt`: Timestamps for tracking.
- **Relations**:
  - `author`: Relation to **Account** (comment author).
  - `blogPost`: Reference to **BlogPost** on which the comment is made.
  - `replies`: Self-referencing relationship for nested comments.
  - `votes`: One-to-many with **CommentVote**.
  - `reports`: One-to-many with **CommentReport**.

### **CommentVote**
Tracks votes on comments, with a unique constraint to prevent duplicate votes by the same user on the same comment.

- **Fields**:
  - `id`: Unique identifier.
  - `voteType`: Type of vote.
- **Relations**:
  - `comment`: Reference to the voted **Comment**.
  - `account`: Reference to the voting **Account**.

- **Unique Constraint**:
  - Ensures each user can only vote once per comment.

### **PostReport**
Logs reports on blog posts, including explanations for reporting.

- **Fields**:
  - `id`: Unique identifier.
  - `explanation`: Reason for reporting.
- **Relations**:
  - `blogPost`: Reference to **BlogPost**.
  - `reporterId`: ID of the reporting user.

### **CommentReport**
Tracks reports on comments, with an explanation for each report.

- **Fields**:
  - `id`: Unique identifier.
  - `explanation`: Reason for reporting.
- **Relations**:
  - `comment`: Reference to **Comment**.
  - `reporterId`: ID of the reporting user.

### **Tag**
Represents tags used for categorizing blog posts and code templates.

- **Fields**:
  - `id`: Unique identifier.
  - `name`: Tag name, must be unique.
- **Relations**:
  - `codeTemplates`: Many-to-many relationship with **CodeTemplate**.
  - `blogPosts`: Many-to-many relationship with **BlogPost**.

---
