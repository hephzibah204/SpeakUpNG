# SpeakUpNG - Next.js Refactoring

## Overview

This is the Next.js refactoring of SpeakUpNG, a Nigerian civic accountability platform that helps citizens rate government officials, compare rankings, vote in civic polls, and track public accountability with anonymous reviews.

## Tech Stack

- **Framework**: Next.js 16.2.9 (React-based)
- **Database**: Cloudflare D1 (SQLite)
- **Styling**: Tailwind CSS with CSS modules
- **Deployment**: Cloudflare Pages/Workers
- **TypeScript**: Full type safety
- **Authentication**: Cloudflare Auth (to be implemented)

## Features

### Core Features
- **Official Ratings**: Rate and review government officials by tier (federal, state, local)
- **Live Rankings**: Real-time rankings based on citizen reviews
- **Politician Profiles**: Detailed profiles of political aspirants
- **News & Updates**: Daily Nigerian governance news and policy updates
- **Blog**: Governance explainers and accountability guides
- **Search**: Search across officials, politicians, and news

### Administrative Features
- **Admin Dashboard**: Manage officials, politicians, and news content
- **News Ingestion**: Automated RSS feed processing for news aggregation
- **Moderation**: Review and approve user-submitted content
- **Analytics**: Track platform usage and engagement

## Project Structure

```
speakupng-next/
├── app/
│   ├── page.tsx                    # Home page
│   ├── api/                         # API routes
│   │   ├── officials/route.ts       # Officials API
│   │   ├── politicians/route.ts     # Politicians API
│   │   ├── news/route.ts            # News API
│   │   ├── search/route.ts          # Search API
│   │   └── admin/secrets/route.ts   # Admin secrets API
│   ├── official/                    # Official profiles
│   │   └── [slug]/page.tsx
│   ├── politician/                  # Politician profiles
│   │   └── [slug]/page.tsx
│   ├── news/                        # News pages
│   │   └── page.tsx
│   ├── blog/                         # Blog pages
│   │   └── page.tsx
│   └── leaderboard/page.tsx         # Rankings page
├── components/                     # Reusable UI components
├── lib/                            # Utility functions
├── styles/                         # Global styles
├── worker.ts                       # Cloudflare Worker
├── env.ts                          # Environment configuration
├── next.config.ts                  # Next.js configuration
├── package.json                    # Dependencies
└── README.md                       # This file
```

## Setup Instructions

### Prerequisites

- Node.js 18.x or 20.x
- npm 9.x or 10.x
- Cloudflare account with D1 database

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

### Development

1. Start the development server:

```bash
npm run dev
```

2. The application will be available at `http://localhost:3000`

### Building for Production

1. Build the application:

```bash
npm run build
```

2. Start the production server:

```bash
npm run start
```

### Database Migration

1. Apply D1 migrations:

```bash
npm run db:migrate
```

2. Seed the database with initial data:

```bash
npm run db:seed
```

### Linting and Type Checking

1. Run linting:

```bash
npm run lint
```

2. Run type checking:

```bash
npm run typecheck
```

## API Routes

### `/api/officials`
- **GET**: Retrieve list of officials with filtering, sorting, and pagination
- **Parameters**: `search`, `state`, `tier`, `sort`, `page`, `limit`

### `/api/politicians`
- **GET**: Retrieve list of politicians with filtering and pagination
- **Parameters**: `search`, `page`, `limit`

### `/api/news`
- **GET**: Retrieve list of news items with filtering and pagination
- **Parameters**: `search`, `page`, `limit`

### `/api/search`
- **GET**: Search across officials, politicians, and news
- **Parameters**: `q`

### `/api/admin/secrets`
- **POST**: Save admin secrets (service role key, etc.)

## Database Schema

### Tables

#### `officials`
- `id` (UUID): Primary key
- `full_name` (string): Full name of the official
- `common_name` (string): Common name or nickname
- `role` (string): Official's role/title
- `tier` (string): Official's tier (federal_executive, state_executive, etc.)
- `state` (string): State or region
- `website` (string): Official's website
- `photo_url` (string): URL to official's photo
- `rating_avg` (decimal): Average rating
- `rating_count` (integer): Number of ratings
- `status` (string): Status (active, inactive)
- `created_at` (timestamp): Creation timestamp
- `updated_at` (timestamp): Last update timestamp

#### `politicians`
- `id` (UUID): Primary key
- `full_name` (string): Full name
- `common_name` (string): Common name
- `party` (string): Political party
- `aspiration_title` (string): Title of office they're running for
- `photo_url` (string): URL to photo
- `priority` (integer): Priority for display
- `is_active` (boolean): Whether the politician is active
- `aliases` (array): Alternative names
- `social_links` (JSON): Social media links
- `source_urls` (array): Source URLs
- `source_notes` (string): Source notes
- `bio` (text): Biography
- `profile_bio` (text): Short profile bio
- `aspiring_for` (string): What they're aspiring for
- `previous_offices` (string): Previous offices held
- `wiki_title` (string): Wikipedia title
- `wiki_url` (string): Wikipedia URL
- `created_at` (timestamp): Creation timestamp
- `updated_at` (timestamp): Last update timestamp

#### `public_ratings`
- `id` (UUID): Primary key
- `official_id` (UUID): Reference to officials table
- `overall` (integer): Overall rating (1-5)
- `accountability` (integer): Accountability rating (1-5)
- `service` (integer): Service delivery rating (1-5)
- `transparency` (integer): Transparency rating (1-5)
- `responsiveness` (integer): Responsiveness rating (1-5)
- `power` (integer): Power rating (1-5)
- `security` (integer): Security rating (1-5)
- `economic_stability` (integer): Economic stability rating (1-5)
- `education` (integer): Education rating (1-5)
- `healthcare` (integer): Healthcare rating (1-5)
- `reviewer_state` (string): Reviewer's state
- `review_text` (text): Review text
- `device_hash` (string): Device hash for anonymity
- `created_at` (timestamp): Creation timestamp

#### `news_items`
- `id` (UUID): Primary key
- `source_id` (UUID): Reference to news_sources table
- `title` (string): News title
- `url` (string): URL to the news article
- `published_at` (timestamp): Publication date
- `content_hash` (string): Content hash
- `raw_json` (JSON): Raw JSON from RSS feed
- `summary` (text): AI-generated summary
- `sentiment_score` (decimal): Sentiment score (-1 to 1)
- `topic` (string): Topic (policy, scandal, achievement, etc.)
- `categories` (array): Categories
- `is_politics` (boolean): Whether it's politics-related
- `matched_profiles` (array): Matched official/politician profiles
- `image_url` (string): URL to image
- `site_name` (string): Name of the news site
- `author` (string): Author
- `content_text` (text): Extracted text content
- `content_html` (text): Extracted HTML content
- `content_extracted_at` (timestamp): Content extraction timestamp
- `moderation_status` (string): Moderation status (pending, approved, rejected)
- `created_at` (timestamp): Creation timestamp
- `updated_at` (timestamp): Last update timestamp

#### `news_sources`
- `id` (UUID): Primary key
- `name` (string): Source name
- `home_url` (string): Home URL
- `feed_url` (string): RSS feed URL
- `ingest_type` (string): Ingestion type (rss)
- `credibility_tier` (string): Credibility tier (tier1, tier2, blocked)
- `is_active` (boolean): Whether the source is active
- `allow_full_text` (boolean): Whether to fetch full text
- `allow_images` (boolean): Whether to fetch images
- `max_fetch_kb` (integer): Maximum fetch size in KB
- `created_at` (timestamp): Creation timestamp
- `updated_at` (timestamp): Last update timestamp

#### `news_profile_matches`
- `id` (UUID): Primary key
- `news_item_id` (UUID): Reference to news_items table
- `profile_type` (string): Profile type (official, politician)
- `profile_id` (UUID): Reference to profile table
- `confidence` (decimal): Match confidence score
- `method` (string): Matching method
- `matched_terms` (array): Matched terms
- `created_at` (timestamp): Creation timestamp

#### `news_audit_log`
- `id` (UUID): Primary key
- `actor_user_id` (UUID): Reference to user (nullable)
- `action` (string): Action performed
- `target_type` (string): Target type
- `target_id` (UUID): Target ID (nullable)
- `reason` (string): Reason for action (nullable)
- `meta` (JSON): Metadata
- `created_at` (timestamp): Creation timestamp

#### `admin_secrets`
- `id` (UUID): Primary key
- `key` (string): Secret key
- `value` (string): Secret value
- `updated_at` (timestamp): Last update timestamp

## Migration from PHP to Next.js

### Key Changes

1. **Routing**: PHP router.php converted to Next.js file-based routing
2. **Database**: Supabase PostgreSQL converted to Cloudflare D1 SQLite
3. **API**: PHP API endpoints converted to Next.js API routes
4. **Frontend**: HTML pages converted to React components
5. **State Management**: localStorage replaced with React state management
6. **Authentication**: Supabase Auth to be replaced with Cloudflare Auth

### Data Migration

1. **Database Schema**: Convert Supabase SQL migrations to D1 SQL format
2. **Data Export**: Export data from Supabase to CSV/JSON
3. **Data Import**: Import data into D1 using INSERT statements
4. **Validation**: Validate data integrity after migration

### API Migration

1. **Endpoint Conversion**: Convert PHP API endpoints to Next.js API routes
2. **Request/Response**: Convert PHP request/response handling to Next.js
3. **Authentication**: Implement authentication middleware
4. **Error Handling**: Convert PHP error handling to Next.js error handling

### Frontend Migration

1. **Component Conversion**: Convert HTML pages to React components
2. **State Management**: Convert localStorage usage to React state
3. **API Integration**: Convert Supabase client calls to fetch API calls
4. **Styling**: Convert inline styles to Tailwind CSS
5. **JavaScript**: Convert vanilla JavaScript to React hooks

## Deployment

### Cloudflare Pages

1. Push code to Git repository
2. Connect to Cloudflare Pages
3. Configure build command: `npm run build`
4. Configure output directory: `.next`
5. Add environment variables

### Cloudflare Workers

1. Deploy worker.ts as a Cloudflare Worker
2. Configure D1 binding
3. Set up scheduled tasks for news ingestion
4. Configure environment variables

## Performance Optimization

### Image Optimization
- Use Next.js Image component
- Implement lazy loading
- Set up responsive images

### Caching
- Implement edge caching with Cloudflare
- Cache API responses
- Cache static assets

### Code Splitting
- Use React.lazy for component loading
- Implement dynamic imports
- Optimize bundle size

## SEO

### Next.js Built-in SEO
- Use Next.js metadata API
- Implement Open Graph tags
- Add structured data (JSON-LD)

### Custom SEO
- Optimize meta titles and descriptions
- Implement schema markup
- Set up robots.txt and sitemap.xml

## Monitoring and Analytics

### Performance Monitoring
- Use Cloudflare Analytics
- Set up performance budgets
- Monitor Core Web Vitals

### Error Tracking
- Implement error boundaries
- Set up error tracking (Sentry)
- Monitor API errors

## Future Enhancements

### AI Integration
- Implement AI-powered content generation
- Add AI-powered search
- Implement recommendation engine

### Real-time Features
- Implement WebSocket for real-time updates
- Add real-time notifications
- Implement live chat

### Mobile App
- Build PWA for mobile
- Implement native mobile apps
- Add offline capabilities

## Contributing

### Development
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

### Code Quality
- Follow ESLint and Prettier
- Write unit tests
- Write integration tests
- Document your code

### Security
- Review dependencies
- Implement security headers
- Use environment variables
- Validate all inputs

## License

This project is licensed under the MIT License.

## Acknowledgements

- The original PHP codebase
- Supabase for database services
- Cloudflare for D1 and Pages
- Next.js team for the framework
- All contributors and users

## Support

For support, please contact the development team at support@evote.ng.

---

*Last updated: $(date -u +%Y-%m-%d)*
