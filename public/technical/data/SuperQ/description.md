# Website Design With Working Databases and Authentication

This project was my first major foray into website design. Although it may not be aesthetically pleasing and lacks some essential features, it effectively demonstrates several technical aspects. Initially intended to serve as a live Q&A service for lectures and conferences, it is now a relic after market research and customer surveys.

## Rudimentary Frontend Development

While not groundbreaking, this project taught me a lot about CSS (including Tailwind, which I found particularly enjoyable) as well as Next.js and React. The project features gradients, organization, colors, menu structuring, and several other frontend elements.

## Databases

Although not entirely visible from the code, this project incorporates a PostgreSQL database. The database structures include, among other things:

- **Class Cohorts** (users, identifications, etc.)
- **Live Classes** (users, questions, identifications, passcodes, etc.)
- **Questions** (user, question, likes/dislikes, comments, identification, etc.)
- **Users** (username, encrypted password, cohorts, etc.)

## Authentication

The project includes a separately hosted backend server that handles requests from the frontend and communicates with the database to manage user creation. User passwords are encrypted with a hash before being stored securely.

Further backend plans included a management system for live classes and cohorts. Some progress was made on these features before the project was put on hold.