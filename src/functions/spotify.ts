import { YouTube } from "youtube-sr";
import { spotifyClient } from "../helpers/spotifyClient";

interface YouTubeResult {
  title: string;
  artists: string[];
  cover: string;
  url: string;
}

interface MakeRequestResponse {
  status: number;
  data?: YouTubeResult;
  error?: string;
}

function extractTrackId(url: string) {
  try {
    const urlObj = new URL(url);

    if (
      urlObj.hostname === "open.spotify.com" &&
      urlObj.pathname.startsWith("/track/")
    ) {
      const trackId = urlObj.pathname.split("/")[2];

      return trackId;
    } else if (urlObj.hostname === "spotify.link") {
      console.log("Spotify.link URLs are not yet handled.");
      return null;
    } else {
      console.log("Invalid URL");
      return null;
    }
  } catch (error) {
    console.log("Error parsing URL:", error);
    return null;
  }
}

const spotify = {
  async makeRequest(url: string): Promise<MakeRequestResponse> {
    try {
      const trackId = extractTrackId(url) as string;

      const trackData = await spotifyClient.getTrack(trackId);

      if (!trackData.body) {
        return {
          status: 404,
          error: "Track data not found",
        };
      }

      const artistNames = trackData.body.artists
        .map((artist: any) => artist.name)
        .join(", ");

      const query = `${trackData.body.name} - ${artistNames}`;

      console.log(query);

      const result = await YouTube.searchOne(query);

      if (!result) {
        return {
          status: 404,
          error: "No YouTube results found",
        };
      }

      return {
        status: 200,
        data: {
          title: trackData.body.name,
          artists: trackData.body.artists.map((artist: any) => artist.name),
          cover: trackData.body.album.images[0].url,
          url: result.url,
        },
      };
    } catch (error) {
      console.error("Error processing request:", error);
      return {
        status: 500,
        error: "Internal server error",
      };
    }
  },
};

export default spotify;
