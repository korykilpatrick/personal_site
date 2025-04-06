# Technical Product Requirements Document (PRD): Personal Website

## 1. Overview

This personal website will serve as a portfolio, blog, and creative outlet. It will showcase software engineering projects, share thoughts on various topics, display a bookshelf, and feature an interactive career timeline. The site is designed to connect with tech professionals, friends, and social media followers, establishing a personal brand as a creative problem solver with a rich history and bold ideas.

### Goals
- Enable connections with tech professionals, friends, and social media followers.
- Build a personal brand as a creative problem solver.
- Provide a fast, maintainable, and enjoyable-to-update platform.

## 2. Technology Stack

- **Frontend:** React with TypeScript
- **Backend:** Node.js with Express
- **Database:** PostgreSQL
- **Styling:** Tailwind CSS (utility-first CSS framework)
- **HTTP Client:** Axios
- **Dependencies:**
  - `pg` for PostgreSQL connection
  - `markdown-to-jsx` (or similar) for rendering markdown content
  - Optional: `react-chrono` for timeline, `fuse.js` for client-side search

## 3. Architecture

The website follows a client-server architecture:
- The **frontend** is a single-page application (SPA) built with React and TypeScript, using Axios to make API calls to the backend.
- The **backend** is powered by Node.js and Express, handling requests and querying the PostgreSQL database.
- **Data** is stored in PostgreSQL tables, with relationships managed through foreign keys and junction tables.
- **Communication** between frontend and backend is handled via RESTful API endpoints.

## 4. Database Schema

The PostgreSQL database will store dynamic content for the personal website. The following tables already exist and will be utilized for bookshelf-related functionality: `books`, `bookshelves`, and `books_shelves`. Additional tables will be created to support features such as projects, gigs, and blog posts.

### 4.1 Existing Tables

The following tables are already present in the database and will be used as-is for bookshelf functionality:

- **books**  
  This table stores metadata about books, including details sourced from Goodreads and user-specific information.  
  - **Columns:**  
    - `id` (integer, PRIMARY KEY, auto-incrementing via `books_id_seq`) – Unique identifier for each book.  
    - `goodreads_id` (integer, NOT NULL) – Unique Goodreads identifier for the book.  
    - `img_url` (varchar(255), NULL) – URL to the book’s cover image.  
    - `img_url_small` (varchar(255), NULL) – URL to a smaller version of the cover image.  
    - `title` (varchar(255), NOT NULL) – Book title.  
    - `book_link` (varchar(255), NULL) – URL to the book’s Goodreads page.  
    - `author` (varchar(255), NOT NULL) – Name of the book’s author.  
    - `author_link` (varchar(255), NULL) – URL to the author’s Goodreads page.  
    - `num_pages` (integer, NULL) – Total number of pages in the book.  
    - `avg_rating` (double precision, NULL) – Average rating from Goodreads.  
    - `num_ratings` (integer, NULL) – Total number of ratings on Goodreads.  
    - `date_pub` (varchar(30), NULL) – Publication date, stored as a string.  
    - `rating` (integer, NULL) – User-assigned rating for the book.  
    - `blurb` (text, NULL) – Description or summary of the book.  
    - `date_added` (varchar(30), NULL) – Date the book was added to the system, stored as a string.  
    - `date_started` (varchar(30), NULL) – Date the user began reading, stored as a string.  
    - `date_read` (varchar(30), NULL) – Date the user finished reading, stored as a string.  
    - `created_at` (timestamp, NOT NULL, default: now()) – Timestamp of record creation.  
    - `updated_at` (timestamp, NOT NULL, default: now()) – Timestamp of the last update.  

- **bookshelves**  
  This table stores bookshelf names used to categorize books.  
  - **Columns:**  
    - `id` (integer, PRIMARY KEY, auto-incrementing via `bookshelves_id_seq`) – Unique identifier for each bookshelf.  
    - `name` (varchar(50), NOT NULL) – Name of the bookshelf (e.g., "To Read", "Favorites").  
    - `created_at` (timestamp, NULL, default: CURRENT_TIMESTAMP) – Timestamp when the bookshelf was created.  

- **books_shelves**  
  This junction table facilitates the many-to-many relationship between `books` and `bookshelves`, allowing a book to belong to multiple shelves and a shelf to contain multiple books.  
  - **Columns:**  
    - `id` (integer, PRIMARY KEY, auto-incrementing via `books_shelves_id_seq`) – Unique identifier for each book-shelf relationship.  
    - `book_id` (integer, NULL) – Foreign key referencing `books.id`.  
    - `shelf_id` (integer, NULL) – Foreign key referencing `bookshelves.id`.  
    - `created_at` (timestamp, NULL, default: CURRENT_TIMESTAMP) – Timestamp when the book was assigned to the shelf.  

### 4.2 Tables to Be Created

The following tables will be created to support additional features of the website:

- **projects**  
  - `id` (SERIAL PRIMARY KEY)  
  - `title` (VARCHAR)  
  - `description` (TEXT)  
  - `media_urls` (JSONB) – Array of media URLs (e.g., images, videos)  
  - `links` (JSONB) – Array of external links (e.g., GitHub, live demo)  
  - `writeup` (TEXT) – Optional detailed write-up in markdown or plain text  

- **gigs**  
  - `id` (SERIAL PRIMARY KEY)  
  - `company` (VARCHAR)  
  - `role` (VARCHAR)  
  - `duration` (VARCHAR) – e.g., "Jan 2020 - Dec 2021"  
  - `achievements` (TEXT) – Description of achievements or responsibilities  
  - `links` (JSONB) – Array of external links (e.g., company website)  

- **posts**  
  - `id` (SERIAL PRIMARY KEY)  
  - `title` (VARCHAR)  
  - `content` (TEXT) – Blog post content in markdown  
  - `date` (DATE)  
  - `tags` (JSONB) – Array of tags for filtering  
  - `excerpt` (TEXT) – Short summary for previews  

### Notes
- **Relationships:** The `books_shelves` table manages the many-to-many relationship between `books` and `bookshelves` using `book_id` and `shelf_id`.  
- **Data Types for Dates:** In the existing `books` table, date-related fields (`date_pub`, `date_added`, `date_started`, `date_read`) are stored as strings (`varchar(30)`). The frontend should handle parsing these strings into appropriate date formats for display.  
- **JSONB Fields:** Tables such as `projects`, `gigs`, and `posts` use JSONB columns to store structured data like media URLs, links, and tags, allowing flexible storage within PostgreSQL.  

---

## 5. API Endpoints

The backend will provide read-only RESTful API endpoints to retrieve data from both the existing and new tables. These endpoints will be used by the frontend to fetch content dynamically.

### 5.1 Bookshelf Data (Existing Tables)
The following endpoints will interact with the existing `books`, `bookshelves`, and `books_shelves` tables:

- **`GET /api/books`**  
  - **Description:** Retrieves a list of all books.  
  - **Response:** Array of book objects, including fields such as `id`, `title`, `author`, `img_url`, `rating`, and `book_link`.  
  - **Notes:** The frontend may choose to display a subset of fields (e.g., title, author, cover image) and link to detailed views.

- **`GET /api/books/:id`**  
  - **Description:** Retrieves detailed information for a specific book.  
  - **Parameters:** `id` (integer) – The book’s unique identifier.  
  - **Response:** A single book object with all available fields, including `blurb`, `num_pages`, `avg_rating`, etc.  

- **`GET /api/bookshelves`**  
  - **Description:** Retrieves a list of all bookshelves.  
  - **Response:** Array of bookshelf objects, each containing `id` and `name`.  

- **`GET /api/bookshelves/:id`**  
  - **Description:** Retrieves details for a specific bookshelf.  
  - **Parameters:** `id` (integer) – The bookshelf’s unique identifier.  
  - **Response:** A single bookshelf object with `id` and `name`.  

- **`GET /api/bookshelves/:id/books`**  
  - **Description:** Retrieves all books assigned to a specific bookshelf.  
  - **Parameters:** `id` (integer) – The bookshelf’s unique identifier.  
  - **Response:** Array of book objects associated with the specified bookshelf, retrieved by joining `books_shelves` with `books`.  
  - **Notes:** This endpoint handles the many-to-many relationship, allowing the frontend to display books per shelf.  

### 5.2 Work Data (New Tables)
The following endpoints will interact with the `projects` and `gigs` tables (to be created):

- **`GET /api/projects`**  
  - **Description:** Retrieves a list of all projects.  
  - **Response:** Array of project objects, including `id`, `title`, `description`, `media_urls`, `links`, and `writeup`.  

- **`GET /api/projects/:id`**  
  - **Description:** Retrieves details for a specific project.  
  - **Parameters:** `id` (integer) – The project’s unique identifier.  
  - **Response:** A single project object with all fields.  

- **`GET /api/gigs`**  
  - **Description:** Retrieves a list of all professional gigs.  
  - **Response:** Array of gig objects, including `id`, `company`, `role`, `duration`, `achievements`, and `links`.  

- **`GET /api/gigs/:id`**  
  - **Description:** Retrieves details for a specific gig.  
  - **Parameters:** `id` (integer) – The gig’s unique identifier.  
  - **Response:** A single gig object with all fields.  

### 5.3 Blog Data (New Table)
The following endpoints will interact with the `posts` table (to be created):

- **`GET /api/posts`**  
  - **Description:** Retrieves a list of all blog posts.  
  - **Response:** Array of blog post objects, including `id`, `title`, `excerpt`, `date`, and `tags`.  

- **`GET /api/posts/:id`**  
  - **Description:** Retrieves the full content of a specific blog post.  
  - **Parameters:** `id` (integer) – The blog post’s unique identifier.  
  - **Response:** A single blog post object with all fields, including `content`.  

### Notes
- **Data Updates:** All data updates (e.g., adding new books, blog posts, or projects) will be handled externally via scripts or direct database management. The API is read-only for the frontend.  
- **Joins and Relationships:** For endpoints like `GET /api/bookshelves/:id/books`, the backend will perform necessary joins between `books_shelves` and `books` to retrieve related data.  
- **Date Handling:** The frontend should parse string-based date fields (e.g., `date_pub`, `date_added`) from the `books` table into appropriate date formats for display.  
- **Error Handling:** Standard HTTP status codes (e.g., 404 for not found, 500 for server errors) should be returned for invalid requests or server issues.  

## 6. Frontend Components

The frontend will consist of the following main pages and components, each fetching data from the corresponding API endpoints using Axios:

### 6.1 Homepage
- **Purpose:** Introduce the user and guide visitors to key sections.
- **Features:**
  - Static introduction text.
  - Navigation links to Work (with dropdown), Blog, Bookshelf, and About.
  - Optional: Featured project or recent blog post.
- **Data Source:** Static content; optional dynamic content from `/api/projects` or `/api/blog_posts`.

### 6.2 About Page
- **Purpose:** Share bio and contact information.
- **Features:**
  - Bio text.
  - Contact email and social media links.
  - Optional: Profile photo.
- **Data Source:** `/api/about` for bio, email, and social links.

### 6.3 Work Page
- **Purpose:** Showcase professional accomplishments with sub-sections.
- **Structure:** Parent component with nested routes for Projects, Gigs, and Timeline.

#### 6.3.1 Projects
- **Features:**
  - Grid or card layout of projects.
  - Title, description, media (images/videos), links, optional write-ups.
- **Data Source:** `/api/projects`

#### 6.3.2 Gigs
- **Features:**
  - List of professional engagements with descriptions and links.
- **Data Source:** `/api/gigs`

#### 6.3.3 Timeline
- **Features:**
  - Interactive, chronological view of career milestones.
  - Clickable milestones with descriptions and links.
- **Data Source:** `/api/timeline`

### 6.4 Blog Page
- **Purpose:** Share thoughts with interactive features.
- **Features:**
  - List of posts with titles, excerpts, tags.
  - Filtering by tags and search functionality.
- **Data Source:** `/api/blog_posts`
- **Implementation:** Client-side filtering and search using React state or `fuse.js`.

### 6.5 Bookshelf Page
- **Purpose:** Display a visually appealing book collection.
- **Features:**
  - Grid or shelf-like layout of book covers.
  - Hover effects for details (title, author, rating).
  - Links to Goodreads.
- **Data Source:** `/api/books` and `/api/bookshelves` (if filtering by shelf)

**Notes:**
- Each component will use Axios to fetch data and manage state with React hooks (e.g., `useState`, `useEffect`).
- Markdown content (e.g., blog posts, project write-ups) will be rendered using `markdown-to-jsx` or a similar library.

## 7. Navigation

- **Features:**
  - Top navigation bar with links to Homepage, Work, Blog, Bookshelf, and About.
  - **'Work' Behavior:** On hover, displays a dropdown with links to Projects, Gigs, and Timeline.
- **Implementation:**
  - Use `react-router-dom` for routing.
  - Dropdown implemented with Tailwind CSS hover effects or JavaScript toggle for mobile.

## 8. Styling

- **Approach:** Use Tailwind CSS utility classes for layout, colors, typography, and responsiveness.
- **Customization:** Extend Tailwind’s default theme in `tailwind.config.js` if needed.
- **Responsiveness:** Use Tailwind’s responsive prefixes (e.g., `md:`, `lg:`) to ensure mobile-friendly design.

## 9. Performance

- **Requirements:**
  - Fast navigation and data loading.
  - Optimized media handling.
- **Strategies:**
  - Code splitting with `React.lazy` and `Suspense` for routes.
  - Lazy loading for images and videos (`loading="lazy"`).
  - Minimize API calls and optimize data transfer.

## 10. Additional Considerations

- **Accessibility:** Use ARIA attributes and ensure keyboard navigation.
- **Maintenance:** Data updates are handled externally via scripts or direct database management.
- **Future Enhancements:** Consider adding authentication for admin features or integrating a CMS for content management.

---

### Summary of Key Decisions
- **Database-Driven:** All dynamic content (books, bookshelves, projects, gigs, timeline entries, blog posts, about info) is stored in PostgreSQL and accessed via API endpoints.
- **API Communication:** Axios is used for all HTTP requests from the frontend to the backend.
- **Navigation:** 'Work' in the navbar shows a dropdown on hover for Projects, Gigs, and Timeline.
- **About Page:** Includes contact information (email, social links) fetched from the database.
- **Styling:** Tailwind CSS ensures a consistent, responsive design.
- **No API Integration:** Goodreads data is pre-loaded into the database via a script, not fetched in real-time.

This PRD provides a comprehensive plan for building your personal website, ensuring it is database-powered, performant, and easy to maintain. Let me know if you need further clarification or adjustments!