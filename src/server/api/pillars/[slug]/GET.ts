import type { Request, Response } from "express";
import { getPillarBySlug } from "../../../data/pillars-repo";

// GET /api/pillars/:slug — returns a single pillar, or 404 if the slug is unknown.
export default async function handler(req: Request, res: Response): Promise<void> {
	const slug = req.params.slug;
	try {
		const pillar = await getPillarBySlug(slug);
		if (!pillar) {
			res.status(404).json({ error: `Pillar "${slug}" not found` });
			return;
		}
		res.set("Cache-Control", "public, max-age=60").json(pillar);
	} catch (err) {
		console.error("[api/pillars/:slug] failed:", err);
		res.status(502).json({ error: "Failed to load pillar" });
	}
}
