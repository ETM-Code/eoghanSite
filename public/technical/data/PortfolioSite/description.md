# Portfolio Site Description

## Overview
This portfolio site showcases my technical and creative projects, providing a comprehensive view of my skills and accomplishments. The site is built using modern web technologies and features a responsive design, interactive elements, and dynamic content fetching.

## Technologies Used
- **React**: For building the user interface.
- **Next.js**: For server-side rendering and static site generation.
- **TypeScript**: For type-safe JavaScript development.
- **Framer Motion**: For animations and transitions.
- **Tailwind CSS**: For styling and responsive design.
- **React Icons**: For incorporating icons.
- **React Markdown**: For rendering markdown content.
- **Masonry Layout**: For responsive grid layouts.

## Features
- **Responsive Design**: The site is fully responsive, ensuring a seamless experience on both desktop and mobile devices.
- **Dynamic Content**: Projects and blog posts are fetched dynamically from an API.
- **Interactive Elements**: Includes animations and transitions for a smooth user experience.
- **Markdown Support**: Blog posts and project descriptions are written in markdown and rendered on the site.
- **Media Handling**: Supports images and videos for project showcases.

## Components
- **TechPage**: Displays technical projects with filtering options based on technologies used.
- **TechBlog**: Lists technical blog posts with detailed views.
- **Creative Sections**: Includes sections for art, fiction, and blog posts, each with its own layout and content fetching logic.
- **Contact Page**: Provides a form for users to get in touch for freelance, tutoring, or other inquiries.

## Code References
### TechPage Component
The `TechPage` component is the main entry point for displaying technical projects. It includes state management for projects, selected project details, and filtering options.

### Project Fetching Utility
The `getProjects` function fetches project data from the file system, reading various files to construct project objects.

### Blog Post Fetching API
The API route for fetching technical blog posts reads markdown files and metadata to construct blog post objects.

### Client-Side Home Page
The `ClientSideHomePage` component handles the main landing page, including dynamic content fetching and interactive elements.

## Conclusion
This portfolio site is a testament to my skills in web development, showcasing a variety of projects and creative works. It leverages modern web technologies to provide a dynamic and engaging user experience.