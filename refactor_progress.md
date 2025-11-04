# Article Management Refactor

This file tracks the progress of the article management feature implementation.

- [X] **1. Build Full Article API**

  - [X] Implement `GET` handler (with filtering).
  - [X] Implement `POST` handler (create new article).
  - [X] Implement `PUT` handler (update existing article).
  - [X] Implement `DELETE` handler (remove article).
- [X] **2. Update Frontend Components**

  - [X] Update dashboard page to use the `DELETE` endpoint.
  - [X] Refactor `ai-article-editor` page to use `GET` and `PUT` endpoints.
- [X] **3. Implement "Save & Download" Feature**

  - [X] Create API endpoint to save article content to a temporary `.md` file.
  - [X] Create API endpoint to delete the temporary `.md` file.
- [X] **4. Update Download Button Logic**

  - [X] Update frontend to call the "prepare download" API.
  - [X] Trigger download in the browser.
  - [X] Call the "cleanup" API after download is triggered.
