# RSS Feed Aggregator

A command-line RSS feed aggregator built with TypeScript, PostgreSQL, and Drizzle ORM. This tool allows you to manage RSS feeds, follow feeds from other users, and browse aggregated posts in a terminal interface.

## Features

- **User Management**: Register, login, and manage multiple users
- **Feed Management**: Add RSS feeds, follow feeds from other users
- **Real-time Aggregation**: Continuously fetch and store posts from followed feeds
- **Post Browsing**: View latest posts from your followed feeds
- **Database Persistence**: PostgreSQL database with automatic migrations

## Prerequisites

- Node.js (version specified in `.nvmrc`)
- PostgreSQL database
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd aggregator_ts
```

2. Install dependencies:
```bash
npm install
```

3. Set up your PostgreSQL database and configure connection in `drizzle.config.ts`

4. Generate and run database migrations:
```bash
npm run generate
npm run migrate
```

## Usage

### Basic Commands

Start the application:
```bash
npm start <command> [arguments]
```

### User Management

**Register a new user:**
```bash
npm start register <username>
```

**Login:**
```bash
npm start login <username>
```

**List all users:**
```bash
npm start users
```

### Feed Management

**Add a new RSS feed:**
```bash
npm start addfeed <feed-name> <feed-url>
```

**List all feeds:**
```bash
npm start feeds
```

**Follow an existing feed:**
```bash
npm start follow <feed-url>
```

**Unfollow a feed:**
```bash
npm start unfollow <feed-url>
```

**List feeds you're following:**
```bash
npm start following
```

### Content Aggregation

**Start the feed aggregator (runs continuously):**
```bash
npm start agg <interval>
```

Interval formats:
- `30s` - 30 seconds
- `5m` - 5 minutes  
- `1h` - 1 hour
- `500ms` - 500 milliseconds

**Browse latest posts:**
```bash
npm start browse [limit]
```
Default limit is 2 posts if not specified.

### Utility Commands

**Reset all users (development only):**
```bash
npm start reset
```

## Architecture

### Database Schema

- **users**: User accounts with unique names
- **feeds**: RSS feed definitions with URLs and metadata
- **feed_follows**: Many-to-many relationship between users and feeds
- **posts**: Individual RSS posts with content and metadata

### Key Components

- **Commands System**: Modular command registry with middleware support
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe queries
- **RSS Parser**: XML parsing for RSS feed content
- **User Authentication**: Simple file-based user session management

## Development

### Database Operations

Generate new migrations after schema changes:
```bash
npm run generate
```

Apply migrations:
```bash
npm run migrate
```

### Project Structure

```
src/
├── lib/
│   └── db/
│       ├── queries/     # Database query functions
│       └── schema.ts    # Database schema definitions
├── commands.ts          # Command registry and middleware
├── config.ts           # Configuration management
├── fetcher.ts          # RSS feed fetching logic
├── handlers.ts         # Command handler implementations
└── index.ts            # Application entry point
```

## Example Workflow

1. Register and login:
```bash
npm start register alice
npm start login alice
```

2. Add and follow some feeds:
```bash
npm start addfeed "Tech Blog" "https://example.com/feed.xml"
npm start follow "https://example.com/feed.xml"
```

3. Start the aggregator in one terminal:
```bash
npm start agg 30s
```

4. Browse posts in another terminal:
```bash
npm start browse 5
```

## Technologies Used

- **TypeScript**: Type-safe JavaScript development
- **Drizzle ORM**: Type-safe database operations
- **PostgreSQL**: Reliable relational database
- **fast-xml-parser**: RSS/XML parsing
- **tsx**: TypeScript execution for Node.js

## License

ISC