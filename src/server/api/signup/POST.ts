import type { Request, Response } from "express";

// POST /api/signup — stores a waitlist / newsletter email in Supabase.
// Body: { email: string, source?: string }

// Read per request, not at module scope. This module is a static import of
// entry.ts, so its top-level code runs BEFORE entry.ts loads the local .env —
// captured constants would be undefined and every signup would 503.
// See the same note in src/server/data/pillars-repo.ts.
function supabaseConfig(): { url: string; key: string } | null {
	const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
	const key = process.env.SUPABASE_ANON_KEY;
	return url && key ? { url, key } : null;
}

// Pragmatic email shape check (real validation is delivery, not regex).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: Request, res: Response): Promise<void> {
	const email = String(req.body?.email ?? "").trim().toLowerCase();
	const source = String(req.body?.source ?? "web").slice(0, 50);

	if (!EMAIL_RE.test(email) || email.length > 254) {
		res.status(400).json({ success: false, error: "Please enter a valid email address." });
		return;
	}

	const config = supabaseConfig();
	if (!config) {
		console.error("[signup] Supabase not configured (SUPABASE_URL / SUPABASE_ANON_KEY)");
		res.status(503).json({ success: false, error: "Signups are temporarily unavailable." });
		return;
	}

	try {
		const response = await fetch(`${config.url}/rest/v1/signups`, {
			method: "POST",
			headers: {
				apikey: config.key,
				Authorization: `Bearer ${config.key}`,
				"Content-Type": "application/json",
				// ignore-duplicates → re-submitting the same email is a no-op success.
				Prefer: "return=minimal,resolution=ignore-duplicates",
			},
			body: JSON.stringify({ email, source }),
		});

		// 2xx = inserted or ignored; 409 = already exists → also success for the user.
		if (response.ok || response.status === 409) {
			res.status(200).json({ success: true });
			return;
		}

		const text = await response.text().catch(() => "");
		console.error("[signup] supabase error", response.status, text.slice(0, 300));
		res.status(502).json({ success: false, error: "Could not save your email. Please try again." });
	} catch (err) {
		console.error("[signup] fetch failed:", err instanceof Error ? err.message : String(err));
		res.status(502).json({ success: false, error: "Could not save your email. Please try again." });
	}
}
