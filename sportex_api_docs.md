# SportEx API Documentation

## Base URL
```
https://api.sportex.club/user/match
```

## Endpoints

### 1. Match Information

#### 1.1 Recent Matches
- **Endpoint:** `/recent`
- **Method:** GET
- **Description:** Fetches a list of recently completed matches
- **Response:** List of match objects containing basic match information
- **Usage Example:**
```python
url = "https://api.sportex.club/user/match/recent"
response = await session.get(url)
matches = response.json().get('data', [])
```

#### 1.2 Live Matches
- **Endpoint:** `/live`
- **Method:** GET
- **Description:** Fetches all currently live matches
- **Response:** List of live match objects with real-time scores
- **Usage Example:**
```python
url = "https://api.sportex.club/user/match/live"
response = await session.get(url)
live_matches = response.json().get('data', [])
```

#### 1.3 Upcoming Matches
- **Endpoint:** `/upcoming`
- **Method:** GET
- **Description:** Fetches all scheduled upcoming matches
- **Response:** List of upcoming match objects with schedule information
- **Usage Example:**
```python
url = "https://api.sportex.club/user/match/upcoming"
response = await session.get(url)
upcoming_matches = response.json().get('data', [])
```

### 2. Competition Information

#### 2.1 Competition Details
- **Endpoint:** `/competition`
- **Method:** GET
- **Parameters:**
  - `competitionId` (required): ID of the competition
- **Description:** Fetches details about a specific competition
- **Usage Example:**
```python
url = "https://api.sportex.club/user/match/competition"
params = {"competitionId": 129388}
response = await session.get(url, params=params)
competition_details = response.json().get('data', {})
```

#### 2.2 Competition Matches
- **Endpoint:** `/competition/matches`
- **Method:** GET
- **Parameters:**
  - `competitionId` (required): ID of the competition
  - `page` (optional): Page number for pagination (default: 0)
  - `limit` (optional): Number of matches per page (default: 100)
- **Description:** Fetches all matches in a specific competition
- **Usage Example:**
```python
url = "https://api.sportex.club/user/match/competition/matches"
params = {
    "competitionId": 129388,
    "page": 0,
    "limit": 100
}
response = await session.get(url, params=params)
competition_matches = response.json().get('data', [])
```

#### 2.3 Competition Squads
- **Endpoint:** `/competition/squads`
- **Method:** GET
- **Parameters:**
  - `competitionId` (required): ID of the competition
- **Description:** Fetches all team squads participating in a competition
- **Usage Example:**
```python
url = "https://api.sportex.club/user/match/competition/squads"
params = {"competitionId": 129388}
response = await session.get(url, params=params)
squads = response.json().get('data', [])
```

#### 2.4 Competition Points Table
- **Endpoint:** `/competition/table`
- **Method:** GET
- **Parameters:**
  - `competitionId` (required): ID of the competition
- **Description:** Fetches the current points table/standings for a competition
- **Usage Example:**
```python
url = "https://api.sportex.club/user/match/competition/table"
params = {"competitionId": 129388}
response = await session.get(url, params=params)
points_table = response.json().get('data', [])
```

### 3. Player Information

#### 3.1 Player Details
- **Endpoint:** `/competition/player`
- **Method:** GET
- **Parameters:**
  - `playerId` (required): ID of the player
- **Description:** Fetches detailed statistics and information about a specific player
- **Usage Example:**
```python
url = "https://api.sportex.club/user/match/competition/player"
params = {"playerId": 108433}
response = await session.get(url, params=params)
player_details = response.json().get('data', {})
```

## Response Format
All API responses follow this general structure:
```json
{
    "data": {
        // Response data specific to the endpoint
    },
    "status": "success/error",
    "message": "Optional message"
}
```

## Error Handling
- The API returns appropriate HTTP status codes
- Common error codes:
  - 400: Bad Request (invalid parameters)
  - 404: Resource Not Found
  - 500: Internal Server Error

## Best Practices
1. Always handle API errors gracefully
2. Implement rate limiting in your application
3. Cache responses when appropriate
4. Use connection pooling for multiple requests
5. Implement retry mechanisms for failed requests

## Example Implementation
```python
async def fetch_competition_data(competition_id: int):
    try:
        async with aiohttp.ClientSession() as session:
            # Fetch basic competition info
            competition = await fetch_competition_details(session, competition_id)
            
            # Fetch matches
            matches = await fetch_competition_matches(session, competition_id)
            
            # Fetch squads
            squads = await fetch_competition_squads(session, competition_id)
            
            # Fetch points table
            table = await fetch_competition_table(session, competition_id)
            
            return {
                "details": competition,
                "matches": matches,
                "squads": squads,
                "table": table
            }
    except Exception as e:
        logger.error(f"Error fetching competition data: {e}")
        raise
```
