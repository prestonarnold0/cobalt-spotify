import SpotifyWebApi from "spotify-web-api-node";

export const spotifyClient = new SpotifyWebApi({
  clientId: "----",
  clientSecret: "----",
});

spotifyClient.setAccessToken("----");
