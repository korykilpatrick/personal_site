# Product Requirements Document (PRD): Personal Website

## 1. Overview

This personal website will serve as a portfolio to showcase your software engineering work, a blog to share your thoughts on various topics, and a creative outlet that reflects your personality and interests. It will feature a unique bookshelf synced with your Goodreads account and an interactive timeline of your professional journey. The site aims to connect you with tech professionals, friends, and social media followers, positioning you as a creative problem solver with a rich history and bold ideas.

### Goals
- Make connections with tech professionals, friends, and people who find you on social media.
- Build a personal brand as a creative problem solver with interesting experiences and ideas.
- Maintain a fun, trivial-to-update platform that you can enjoy as an engineer.

## 2. Target Audience
- Tech professionals interested in your software engineering projects.
- Friends who want to stay connected or explore your thoughts.
- Social media followers who find your content intriguing.

The design and features should cater to this diverse audience, balancing professional polish with personal warmth.

## 3. Pages and Features

### Homepage
**Purpose:** Introduce yourself and guide visitors to key areas.  
**Content:**
- Brief introduction (e.g., "I'm [Your Name], a software engineer and creative problem solver passionate about building and exploring.").
- Links or buttons to Work (dropdown: Projects, Gigs, Timeline), Blog, Bookshelf, and About sections.
- Optional: Featured project or recent blog post.

### About Page
**Purpose:** Share who you are in a concise, engaging way.  
**Content:**
- Brief bio covering background, skills, and interests (e.g., software engineering, spirituality, mythology).
- Links to social media (e.g., Twitter, LinkedIn, GitHub) and email contact.
- Optional: Photo.

### Work
**Purpose:** Showcase your professional journey and software engineering accomplishments.

#### Projects
**Purpose:** Display your software engineering projects as featured work.  
**Content:**
- Clean layout (e.g., cards or grid) of your projects.
- Each project includes:
  - Title: Project name.
  - Description: Quick summary.
  - Media: Videos, screenshots, or live demos.
  - Links: GitHub repos or external sites.
  - Write-ups: Detailed breakdowns (some may double as blog-style posts).

#### Gigs
**Purpose:** Highlight professional work experiences and notable clients.  
**Content:**
- List of significant professional engagements.
- Brief descriptions of roles, responsibilities, and achievements.
- Links to relevant projects or external sites when appropriate.

#### Timeline
**Purpose:** Offer a chronological view of your career progression.  
**Content:**
- Interactive timeline spanning the past 20 years.
- Clickable milestones or projects with brief descriptions and links to portfolio items or external sites.
- Simple yet engaging design with smooth scrolling or subtle animations.

### Blog
**Purpose:** Share thoughts on diverse topics including technical subjects, spirituality, mythology, productivity, health, and social commentary.  
**Content:**
- List of posts with titles, excerpts, and tags.
- Tagging: Categories for easy browsing (e.g., "Technology," "Mythology," "Professional").
- Filtering: Simple filters by tag.
- Search: Fast, seamless search bar.
- Creative Touches:
  - Hover-over icons or words revealing parentheticals or extra details (inspired by "Wait But Why").
  - Optional: "Random post" button or reading time estimates.

### Bookshelf
**Purpose:** Recreate the magical feeling of a beautiful library, reflecting your love for books.  
**Content:**
- Visually stunning display of book covers synced with Goodreads.
- Shelf-like design or grid with hover effects for details (title, author, rating) and Goodreads links.
- Aim for a cozy, elegant vibe reminiscent of a magical library.

### Contact
**Purpose:** Make it easy for visitors to reach out.  
**Content:**
- Basic contact details (email address).
- Links to social media profiles.

## 4. Design

**Vibe:** Elegant, modern, and cozy—a warmer take on Apple's clean minimalism.  
**Style:**
- Clean layout with ample whitespace.
- Readable typography (modern sans-serif font).
- Neutral colors (soft grays, whites, subtle accents).
- Subtle animations in interactive areas; fast, simple base navigation.
- Fully responsive for mobile devices.

## 5. Technical Plan

- **Tools:** Build with TypeScript and React for a fast, component-based site.
- **Performance:** Prioritize speed, especially for navigation and search.
- **Maintenance:** Design for easy updates—adding new content or features should be straightforward.

## 6. Development Process

### Plan Content:
- Write bio, list initial projects, draft blog posts.
- Gather Goodreads book data and timeline milestones.

### Set Up:
- Create TypeScript/React project.
- Set up Git for version control.

### Build Core Pages:
- Homepage, About, Portfolio, Blog with tagging/filtering/search.
- Ensure fast, simple navigation.

### Add Unique Features:
- Build Bookshelf with Goodreads integration.
- Develop Timeline with clickable milestones.
- Hide an Easter egg (e.g., secret page, quirky animation).

### Polish:
- Add contact details and social links.
- Implement hover effects and subtle animations.
- Test responsiveness on mobile.

### Deploy:
- Launch on EC2 instance.
- Set up a simple update process (e.g., script or manual push).