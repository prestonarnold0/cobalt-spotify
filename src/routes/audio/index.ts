import { Request, Response } from "express";
import cobalt from "../../functions/cobalt";
import { body, validationResult } from "express-validator";
import spotify from "../../functions/spotify";

export const validateUrl = [body("url").isURL().withMessage("Invalid URL")];

export const handleRequest = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { url } = req.body;

  console.log(url);

  try {
    let result;

    if (
      url.startsWith("https://open.spotify.com/track/") ||
      url.startsWith("https://spotify.link/")
    ) {
      result = await spotify.makeRequest(url);
    } else {
      result = await cobalt.makeRequest(url);
    }

    if (result.status === 200) {
      return res.status(200).json({
        success: true,
        data: result.data,
      });
    } else {
      return res.status(result.status).json({
        success: false,
        error: result.data,
      });
    }
  } catch (error) {
    console.error("Error making request:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
