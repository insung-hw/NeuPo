// API client for communicating with vite-plugin-api endpoints

const API_BASE = '/api';

export async function checkHealth() {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  return response.json();
}

/**
 * Adds an email to the waitlist / newsletter.
 * `source` records where it came from (e.g. 'hero', 'footer', 'register').
 * Throws with a user-friendly message on failure.
 */
export async function submitSignup(email: string, source: string): Promise<void> {
  const response = await fetch(`${API_BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, source }),
  });
  const data = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    error?: string;
  };
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Something went wrong. Please try again.');
  }
}