import { Request, Response, Router } from "express";

import { validateUrl, handleRequest } from "./audio";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.render("index");
});

router.post("/api/json", validateUrl, handleRequest);

export default router;
