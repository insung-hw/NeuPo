import type { Request, Response } from "express";
import { getAllPillars } from "../../data/pillars-repo";

// GET /api/pillars — returns every pillar with its nested objectives/policies/projects.
export default async function handler(_req: Request, res: Response): Promise<void> {
	try {
		const pillars = await getAllPillars();
		res.set("Cache-Control", "public, max-age=60").json(pillars);
	} catch (err) {
		console.error("[api/pillars] failed:", err);
		res.status(502).json({ error: "Failed to load pillars" });
	}
}
