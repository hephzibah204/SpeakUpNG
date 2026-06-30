import { NextResponse } from 'next/server';
import { queryFirst, queryAll } from '@/lib/db';
import { generateContent } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { prompt, politician_id, official_id } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    let contextData = '';
    let subjectName = 'the candidate';

    // Fetch context if politician_id is provided
    if (politician_id) {
      const politician = await queryFirst<any>(
        `SELECT p.*, 
           r.accountability_avg, r.service_avg, r.transparency_avg, r.responsiveness_avg, 
           r.power_avg, r.security_avg, r.economic_stability_avg, r.education_avg, r.healthcare_avg
         FROM politicians p
         LEFT JOIN politician_rating_agg r ON p.id = r.politician_id
         WHERE p.id = ?`,
        [politician_id]
      );

      if (politician) {
        subjectName = politician.full_name;
        const promises = await queryAll<any>(
          `SELECT promise_title, promise_detail, status, progress_percent FROM official_promises WHERE politician_id = ?`,
          [politician_id]
        );

        contextData = `
Politician Profile:
Name: ${politician.full_name}
Common Name: ${politician.common_name || 'N/A'}
Party: ${politician.party}
Aspiration: ${politician.aspiration_title || 'N/A'}
Previous Offices: ${politician.previous_offices || 'N/A'}
Bio: ${politician.bio || 'N/A'}
Profile Rating Average: ${politician.rating_avg || '0'} (Count: ${politician.rating_count || 0})

Citizen Scorecard Averages (1-5 scale):
- Accountability: ${politician.accountability_avg || 'N/A'}
- Service Delivery: ${politician.service_avg || 'N/A'}
- Transparency: ${politician.transparency_avg || 'N/A'}
- Responsiveness: ${politician.responsiveness_avg || 'N/A'}
- Security: ${politician.security_avg || 'N/A'}
- Economy: ${politician.economic_stability_avg || 'N/A'}
- Education: ${politician.education_avg || 'N/A'}
- Healthcare: ${politician.healthcare_avg || 'N/A'}

Promises:
${promises.map(p => `- [${p.status}] ${p.promise_title}: ${p.promise_detail || ''} (${p.progress_percent}% done)`).join('\n')}
`;
      }
    }

    // Fetch context if official_id is provided
    if (official_id) {
      const official = await queryFirst<any>(
        `SELECT o.*, 
           r.accountability_avg, r.service_avg, r.transparency_avg, r.responsiveness_avg, 
           r.power_avg, r.security_avg, r.economic_stability_avg, r.education_avg, r.healthcare_avg
         FROM officials o
         LEFT JOIN official_rating_agg r ON o.id = r.official_id
         WHERE o.id = ?`,
        [official_id]
      );

      if (official) {
        subjectName = official.full_name;
        const promises = await queryAll<any>(
          `SELECT promise_title, promise_detail, status, progress_percent FROM official_promises WHERE official_id = ?`,
          [official_id]
        );

        contextData = `
Official Profile:
Name: ${official.full_name}
Role: ${official.role}
Tier: ${official.tier}
State: ${official.state || 'N/A'}
Website: ${official.website || 'N/A'}
Bio: ${official.bio || 'N/A'}
Profile Rating Average: ${official.rating_avg || '0'} (Count: ${official.rating_count || 0})

Citizen Scorecard Averages (1-5 scale):
- Accountability: ${official.accountability_avg || 'N/A'}
- Service Delivery: ${official.service_avg || 'N/A'}
- Transparency: ${official.transparency_avg || 'N/A'}
- Responsiveness: ${official.responsiveness_avg || 'N/A'}
- Security: ${official.security_avg || 'N/A'}
- Economy: ${official.economic_stability_avg || 'N/A'}
- Education: ${official.education_avg || 'N/A'}
- Healthcare: ${official.healthcare_avg || 'N/A'}

Promises:
${promises.map(p => `- [${p.status}] ${p.promise_title}: ${p.promise_detail || ''} (${p.progress_percent}% done)`).join('\n')}
`;
      }
    }

    const systemInstruction = `
You are the EVOTE.NG 2027 AI Civic Assistant.
Your goal is to answer questions about Nigerian politicians and officials using verified platform data.
Always maintain a neutral, objective, and factual tone.
Distinguish clearly between facts (biography, official promises, recorded statistics) and community opinions (citizen rating averages, feedback notes).
Do not take sides or show political bias.

Here is the verified context data for ${subjectName}:
${contextData}

Answer the user's question accurately using only the provided context. If the answer is not in the context, state that you don't have that information.
`;

    const responseText = await generateContent({
      prompt,
      systemInstruction,
      temperature: 0.2, // Keep it highly factual
    });

    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
