# Cricket API

A RESTful API for live cricket scores, match details, and statistics.

## Features

- Live match scores and commentary
- Upcoming matches with details
- Recent matches with scorecards
- MongoDB integration for data persistence
- Redis caching for improved performance
- Rate limiting and security features

## Prerequisites

- Node.js >= 18.0.0
- MongoDB
- Redis (optional)

## Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd cricket_api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```
   Update the environment variables as needed.

4. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot reload
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## API Endpoints

### Matches

- `GET /api/matches/live` - Get live matches
- `GET /api/matches/upcoming` - Get upcoming matches
- `GET /api/matches/recent` - Get recent matches
- `GET /api/matches/:id` - Get specific match details

## Testing

Run the test suite:
```bash
npm test
```

For development with test watching:
```bash
npm run test:watch
```

## Code Style

This project uses ESLint with Airbnb style guide. To check your code:
```bash
npm run lint
```

To automatically fix issues:
```bash
npm run lint:fix
```

## Production Deployment

1. Set production environment variables
2. Build the application:
   ```bash
   npm run build
   ```
3. Start the server:
   ```bash
   npm start
   ```

## License

MIT
