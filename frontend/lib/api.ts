const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface Survey {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  closesAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface VoteResult {
  verified: Record<string, number>;
  partial: Record<string, number>;
  anonymous: Record<string, number>;
  total: Record<string, number>;
}

export interface CastVoteRequest {
  choice: string;
  identifier: string;
  trustLevel: number;
  region?: string;
}

export async function getSurveys(): Promise<Survey[]> {
  const res = await fetch(`${API_URL}/api/surveys`);
  return res.json();
}

export async function getSurvey(id: string): Promise<Survey> {
  const res = await fetch(`${API_URL}/api/surveys/${id}`);
  return res.json();
}

export async function castVote(
  surveyId: string,
  data: CastVoteRequest
): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${API_URL}/api/votes/${surveyId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getResults(surveyId: string): Promise<VoteResult> {
  const res = await fetch(`${API_URL}/api/votes/${surveyId}/results`);
  return res.json();
}