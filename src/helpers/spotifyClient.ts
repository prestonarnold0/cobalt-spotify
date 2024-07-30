// GENERATE USING:
// https://alecchen.dev/spotify-refresh-token/
// (too lazy to make a full auth system for this)

import SpotifyWebApi from "spotify-web-api-node";

export const spotifyClient = new SpotifyWebApi({
  clientId: "----",
  clientSecret: "----",
});

let accessToken = "----";
const setAccessToken = (token: string) => {
  spotifyClient.setAccessToken(token);
};

const refreshAccessToken = async () => {
  try {
    const data = await spotifyClient.refreshAccessToken();
    accessToken = data.body["access_token"];
    setAccessToken(accessToken);
    console.log("Access token refreshed successfully.");
  } catch (error) {
    console.error("Error refreshing access token:", error);
  }
};

export const ensureValidToken = async () => {
  try {
    await spotifyClient.getMe();
  } catch (error: any) {
    if (error.statusCode === 401) {
      console.log("Token expired, refreshing...");
      await refreshAccessToken();
    } else {
      console.error("Error making API call:", error);
    }
  }
};

setAccessToken(accessToken);
