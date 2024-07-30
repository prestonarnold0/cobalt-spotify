import express, { Request, Response } from "express";
import session from "express-session";
import crypto from "crypto";
import router from "./routes";
import SpotifyWebApi from "spotify-web-api-node";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT;

export const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

app.set("view engine", "ejs");

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(router);

let refreshToken = "";

const generateRandomString = (length: number): string => {
  return crypto.randomBytes(length).toString("hex");
};

// Spotify auth routes
app.get("/login", (req: Request, res: Response) => {
  const scopes = ["user-read-private"];
  const state = generateRandomString(16);
  (req.session as any).state = state;
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
  res.redirect(authorizeURL);
});

app.get("/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;
  const state = req.query.state as string | undefined;
  const storedState = (req.session as any).state;

  if (!code || !state || state !== storedState) {
    return res.send("State mismatch or authorization code missing.");
  }

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const accessToken = data.body["access_token"];
    refreshToken = data.body["refresh_token"];

    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setRefreshToken(refreshToken);

    (req.session as any).accessToken = accessToken;
    (req.session as any).refreshToken = refreshToken;

    res.send("Authentication successful! You can now make API requests.");
  } catch (error) {
    console.error("Error getting Tokens:", error);
    res.send("Error getting Tokens");
  }
});

app.get("/refresh-token", async (req: Request, res: Response) => {
  try {
    const data = await spotifyApi.refreshAccessToken();
    const accessToken = data.body["access_token"];

    spotifyApi.setAccessToken(accessToken);
    res.send("Access token refreshed successfully.");
  } catch (error) {
    console.error("Error refreshing access token:", error);
    res.send("Error refreshing access token");
  }
});

app.listen(port, () => {
  console.log(`cobalt-spotify started on http://localhost:${port}`);
});
