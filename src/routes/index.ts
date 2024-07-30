import { Router } from "express";

import { validateUrl, handleRequest } from "./audio";

const router = Router();

router.post("/api/json", validateUrl, handleRequest);

export default router;
