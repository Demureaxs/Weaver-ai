# Article Management Refactor

This file tracks the progress of the article management feature implementation.

- [x] **1. Build Full Article API**
  - [x] Implement `GET` handler (with filtering).
  - [x] Implement `POST` handler (create new article).
  - [x] Implement `PUT` handler (update existing article).
  - [x] Implement `DELETE` handler (remove article).

- [x] **2. Update Frontend Components**
  - [x] Update dashboard page to use the `DELETE` endpoint.
  - [x] Refactor `ai-article-editor` page to use `GET` and `PUT` endpoints.

- [x] **3. Implement "Save & Download" Feature**
  - [x] Create API endpoint to save article content to a temporary `.md` file.
  - [x] Create API endpoint to delete the temporary `.md` file.

- [ ] **4. Update Download Button Logic**
  - [ ] Update frontend to call the "prepare download" API.
  - [ ] Trigger download in the browser.
  - [ ] Call the "cleanup" API after download is triggered.
