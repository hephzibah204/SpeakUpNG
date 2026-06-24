import { D1Database } from '@cloudflare/workers-types';

export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // API routes
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env);
    }
    
    // Serve static files
    return env.DB.prepare(
      'SELECT * FROM static_files WHERE path = ?'
    )
      .bind(url.pathname)
      .first()
      .then((file) => {
        if (!file) {
          return new Response('Not found', { status: 404 });
        }
        return new Response(file.content, {
          headers: {
            'Content-Type': file.content_type || 'text/html',
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      });
  },
  
  async scheduled(event: any, env: Env, ctx: ExecutionContext): Promise<void> {
    // Scheduled tasks (e.g., news ingestion)
    if (event.scheduled.type === 'news_ingestion') {
      await runNewsIngestion(env);
    }
  },
};

async function handleApiRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/', '');
  const method = request.method;
  
  try {
    switch (path) {
      case 'officials':
        return await handleOfficialsApi(request, env);
      case 'politicians':
        return await handlePoliticiansApi(request, env);
      case 'ratings':
        return await handleRatingsApi(request, env);
      case 'news':
        return await handleNewsApi(request, env);
      case 'search':
        return await handleSearchApi(request, env);
      case 'admin/secrets':
        return await handleAdminSecretsApi(request, env);
      default:
        return new Response('Not found', { status: 404 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function handleOfficialsApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';
  const state = url.searchParams.get('state') || '';
  const tier = url.searchParams.get('tier') || '';
  const sort = url.searchParams.get('sort') || 'rating_count';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '12');
  const offset = (page - 1) * limit;
  
  let query = 'SELECT * FROM officials WHERE status = ?';
  const params: any[] = ['active'];
  
  if (search) {
    query += ' AND (full_name LIKE ? OR common_name LIKE ? OR role LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  if (state) {
    query += ' AND state = ?';
    params.push(state);
  }
  
  if (tier) {
    query += ' AND tier = ?';
    params.push(tier);
  }
  
  // Add sorting
  switch (sort) {
    case 'rating_count':
      query += ' ORDER BY rating_count DESC';
      break;
    case 'rating_avg_desc':
      query += ' ORDER BY rating_avg DESC';
      break;
    case 'rating_avg_asc':
      query += ' ORDER BY rating_avg ASC';
      break;
    case 'name':
      query += ' ORDER BY full_name ASC';
      break;
    default:
      query += ' ORDER BY rating_count DESC';
  }
  
  query += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const results = await env.DB.prepare(query).bind(...params).all();
  
  // Get total count
  let countQuery = 'SELECT COUNT(*) as count FROM officials WHERE status = ?';
  const countParams: any[] = ['active'];
  
  if (search) {
    countQuery += ' AND (full_name LIKE ? OR common_name LIKE ? OR role LIKE ?)';
    const searchTerm = `%${search}%`;
    countParams.push(searchTerm, searchTerm, searchTerm);
  }
  
  if (state) {
    countQuery += ' AND state = ?';
    countParams.push(state);
  }
  
  if (tier) {
    countQuery += ' AND tier = ?';
    countParams.push(tier);
  }
  
  const countResult = await env.DB.prepare(countQuery).bind(...countParams).first();
  
  return new Response(
    JSON.stringify({
      officials: results.results,
      total: countResult?.count || 0,
      page,
      limit,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

async function handlePoliticiansApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;
  
  let query = 'SELECT * FROM politicians WHERE is_active = ?';
  const params: any[] = [true];
  
  if (search) {
    query += ' AND (full_name LIKE ? OR common_name LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }
  
  query += ' ORDER BY priority DESC, created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const results = await env.DB.prepare(query).bind(...params).all();
  
  // Get total count
  let countQuery = 'SELECT COUNT(*) as count FROM politicians WHERE is_active = ?';
  const countParams: any[] = [true];
  
  if (search) {
    countQuery += ' AND (full_name LIKE ? OR common_name LIKE ?)';
    const searchTerm = `%${search}%`;
    countParams.push(searchTerm, searchTerm);
  }
  
  const countResult = await env.DB.prepare(countQuery).bind(...countParams).first();
  
  return new Response(
    JSON.stringify({
      politicians: results.results,
      total: countResult?.count || 0,
      page,
      limit,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

async function handleRatingsApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const officialId = url.searchParams.get('official_id') || '';
  
  let query = 'SELECT * FROM public_ratings WHERE 1 = 1';
  const params: any[] = [];
  
  if (officialId) {
    query += ' AND official_id = ?';
    params.push(officialId);
  }
  
  query += ' ORDER BY created_at DESC LIMIT 100';
  
  const results = await env.DB.prepare(query).bind(...params).all();
  
  return new Response(
    JSON.stringify(results.results),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

async function handleNewsApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;
  
  let query = 'SELECT * FROM news_items WHERE moderation_status = ?';
  const params: any[] = ['approved'];
  
  if (search) {
    query += ' AND (title LIKE ? OR summary LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }
  
  query += ' ORDER BY published_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const results = await env.DB.prepare(query).bind(...params).all();
  
  // Get total count
  let countQuery = 'SELECT COUNT(*) as count FROM news_items WHERE moderation_status = ?';
  const countParams: any[] = ['approved'];
  
  if (search) {
    countQuery += ' AND (title LIKE ? OR summary LIKE ?)';
    const searchTerm = `%${search}%`;
    countParams.push(searchTerm, searchTerm);
  }
  
  const countResult = await env.DB.prepare(countQuery).bind(...countParams).first();
  
  return new Response(
    JSON.stringify({
      news: results.results,
      total: countResult?.count || 0,
      page,
      limit,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

async function handleSearchApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  
  if (!q) {
    return new Response(
      JSON.stringify({ results: [] }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // Search across multiple tables
  const officialsQuery = env.DB.prepare(
    'SELECT id, full_name as name, common_name, role, tier, type: "official" FROM officials WHERE status = ? AND (full_name LIKE ? OR common_name LIKE ? OR role LIKE ?) LIMIT 10'
  ).bind('active', `%${q}%`, `%${q}%`, `%${q}%`);
  
  const politiciansQuery = env.DB.prepare(
    'SELECT id, full_name as name, common_name, aspiration_title as role, party, type: "politician" FROM politicians WHERE is_active = ? AND (full_name LIKE ? OR common_name LIKE ?) LIMIT 10'
  ).bind(true, `%${q}%`, `%${q}%`);
  
  const newsQuery = env.DB.prepare(
    'SELECT id, title as name, summary as role, published_at as created_at, type: "news" FROM news_items WHERE moderation_status = ? AND (title LIKE ? OR summary LIKE ?) LIMIT 10'
  ).bind('approved', `%${q}%`, `%${q}%`);
  
  const [officials, politicians, news] = await Promise.all([
    officialsQuery.all(),
    politiciansQuery.all(),
    newsQuery.all(),
  ]);
  
  const results = [
    ...(officials.results || []),
    ...(politicians.results || []),
    ...(news.results || []),
  ];
  
  return new Response(
    JSON.stringify({ results }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

async function handleAdminSecretsApi(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  const body = await request.json();
  
  if (body.action === 'save_service_key') {
    const serviceKey = body.service_role_key;
    if (serviceKey) {
      await env.DB.prepare(
        'INSERT INTO admin_secrets (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?'
      ).bind(
        'SUPABASE_SERVICE_ROLE_KEY',
        serviceKey,
        new Date().toISOString(),
        serviceKey,
        new Date().toISOString()
      ).run();
    }
  }
  
  return new Response(
    JSON.stringify({ ok: true }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

async function runNewsIngestion(env: Env): Promise<void> {
  // Implement news ingestion logic here
  console.log('Running news ingestion...');
  // This would include fetching RSS feeds, parsing content, and storing in D1
}
