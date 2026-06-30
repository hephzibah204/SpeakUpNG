import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export async function GET() {
  try {
    // Fetch all modules
    const modules = await queryAll<any>(
      `SELECT * FROM civic_learning_modules ORDER BY created_at ASC`
    );

    // Fetch all quizzes
    const quizzes = await queryAll<any>(
      `SELECT * FROM civic_quizzes ORDER BY created_at ASC`
    );

    // Group quizzes by module_id
    const modulesWithQuizzes = modules.map(mod => ({
      ...mod,
      quizzes: quizzes.filter(q => q.module_id === mod.id).map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || [])
      }))
    }));

    return NextResponse.json({ modules: modulesWithQuizzes });
  } catch (error: any) {
    console.error('Civic API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
