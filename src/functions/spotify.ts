import { YouTube } from "youtube-sr";
import { spotifyApi } from "../index";
import cobalt from "./cobalt";

interface YouTubeResult {
  title: string;
  artists: string[];
  cover: string;
  url: string;
}

interface MakeRequestResponse<T = any> {
  status: number;
  data?: T;
  error?: string;
}

function extractTrackId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (
      urlObj.hostname === "open.spotify.com" &&
      urlObj.pathname.startsWith("/track/")
    ) {
      return urlObj.pathname.split("/")[2];
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

function extractPlaylistId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (
      urlObj.hostname === "open.spotify.com" &&
      urlObj.pathname.startsWith("/playlist/")
    ) {
      return urlObj.pathname.split("/")[2];
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
  async makeRequest(url: string): Promise<MakeRequestResponse<YouTubeResult>> {
    try {
      const trackId = extractTrackId(url);
      if (!trackId) {
        return {
          status: 400,
          error: "Invalid Spotify track URL",
        };
      }

      const trackData = await spotifyApi.getTrack(trackId);
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

      const cobaltReq = await cobalt.makeRequest(result.url);
      if (!cobaltReq || !cobaltReq.data) {
        return {
          status: 500,
          error: "Error with Cobalt request",
        };
      }

      return {
        status: 200,
        data: {
          title: trackData.body.name,
          artists: trackData.body.artists.map((artist: any) => artist.name),
          cover: trackData.body.album.images[0].url,
          url: cobaltReq.data.url,
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

  async getPlaylist(url: string): Promise<MakeRequestResponse<any>> {
    // Types when I know what types
    try {
      const playlistId = extractPlaylistId(url);
      if (!playlistId) {
        return {
          status: 400,
          error: "Invalid Spotify playlist URL",
        };
      }

      const playlist = await spotifyApi.getPlaylist(playlistId);
      const playlistBody = playlist.body;

      if (!playlistBody) {
        return {
          status: 404,
          error: "Playlist data not found",
        };
      }

      return {
        status: 200,
        data: playlist.body,
      };
    } catch (error) {
      console.error("Error fetching playlist:", error);
      return {
        status: 500,
        error: "Internal server error",
      };
    }
  },
};

export default spotify;
