import { NextResponse } from 'next/server';
import { queryAll, queryFirst } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const officialId = searchParams.get('official_id') || '';
  const politicianId = searchParams.get('politician_id') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  try {
    let query = '';
    const params: unknown[] = [];

    if (officialId || politicianId) {
      // Fetch news matched to specific profile via news_profile_matches
      query = `
        SELECT ni.* 
        FROM news_items ni
        JOIN news_profile_matches npm ON ni.id = npm.news_item_id
        WHERE npm.profile_type = ? AND npm.profile_id = ? AND ni.moderation_status = ?
      `;
      params.push(officialId ? 'official' : 'politician', officialId || politicianId, 'approved');
      
      if (search) {
        query += ' AND (LOWER(ni.title) LIKE ? OR LOWER(ni.summary) LIKE ?)';
        const searchTerm = `%${search.toLowerCase()}%`;
        params.push(searchTerm, searchTerm);
      }

      query += ' ORDER BY ni.published_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
    } else {
      // General news
      query = 'SELECT * FROM news_items WHERE moderation_status = ?';
      params.push('approved');

      if (search) {
        query += ' AND (LOWER(title) LIKE ? OR LOWER(summary) LIKE ?)';
        const searchTerm = `%${search.toLowerCase()}%`;
        params.push(searchTerm, searchTerm);
      }

      query += ' ORDER BY published_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
    }

    const results = await queryAll(query, params);

    // Calculate total count
    let countQuery = '';
    const countParams: unknown[] = [];

    if (officialId || politicianId) {
      countQuery = `
        SELECT COUNT(*) as count 
        FROM news_items ni
        JOIN news_profile_matches npm ON ni.id = npm.news_item_id
        WHERE npm.profile_type = ? AND npm.profile_id = ? AND ni.moderation_status = ?
      `;
      countParams.push(officialId ? 'official' : 'politician', officialId || politicianId, 'approved');

      if (search) {
        countQuery += ' AND (LOWER(ni.title) LIKE ? OR LOWER(ni.summary) LIKE ?)';
        const searchTerm = `%${search.toLowerCase()}%`;
        countParams.push(searchTerm, searchTerm);
      }
    } else {
      countQuery = 'SELECT COUNT(*) as count FROM news_items WHERE moderation_status = ?';
      countParams.push('approved');

      if (search) {
        countQuery += ' AND (LOWER(title) LIKE ? OR LOWER(summary) LIKE ?)';
        const searchTerm = `%${search.toLowerCase()}%`;
        countParams.push(searchTerm, searchTerm);
      }
    }

    const countResult = await queryFirst<{ count: number }>(countQuery, countParams);

    return NextResponse.json({
      news: results,
      total: countResult?.count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ news: [], total: 0, page, limit });
  }
}