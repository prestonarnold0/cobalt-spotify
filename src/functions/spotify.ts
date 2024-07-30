import { YouTube } from "youtube-sr";
import { spotifyApi } from "../index";
import cobalt from "./cobalt";

interface YouTubeResult {
  title: string;
  artists: string[];
  cover: string;
  url: string;
}

interface PlaylistResponse {
  name: string;
  tracks: {
    items: any[];
  };
  images: any[];
  owner: {
    displayName: string;
  };
}

interface MakeRequestResponse<T> {
  status: number;
  data?: T;
  error?: string;
}

function extractIdFromUrl(
  url: string,
  type: "track" | "playlist"
): string | null {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname.split("/");

    if (urlObj.hostname === "open.spotify.com") {
      if (type === "track" && path[1] === "track") {
        return path[2];
      } else if (type === "playlist" && path[1] === "playlist") {
        return path[2];
      }
    }

    console.log("Invalid URL");
    return null;
  } catch (error) {
    console.log("Error parsing URL:", error);
    return null;
  }
}

const spotify = {
  async makeRequest(url: string): Promise<MakeRequestResponse<YouTubeResult>> {
    try {
      const trackId = extractIdFromUrl(url, "track");
      if (!trackId) {
        return { status: 400, error: "Invalid Spotify track URL" };
      }

      const trackData = await spotifyApi.getTrack(trackId);
      if (!trackData.body) {
        return { status: 404, error: "Track data not found" };
      }

      const artistNames = trackData.body.artists
        .map((artist: any) => artist.name)
        .join(", ");
      const query = `${trackData.body.name} - ${artistNames}`;
      console.log(query);

      const result = await YouTube.searchOne(query);
      if (!result) {
        return { status: 404, error: "No YouTube results found" };
      }

      const cobaltReq = await cobalt.makeRequest(result.url);
      if (!cobaltReq || !cobaltReq.data) {
        return { status: 500, error: "Error with Cobalt request" };
      }

      return {
        status: 200,
        data: {
          title: trackData.body.name,
          artists: trackData.body.artists.map((artist: any) => artist.name),
          cover: trackData.body.album.images[0]?.url || "",
          url: cobaltReq.data.url,
        },
      };
    } catch (error) {
      console.error("Error processing request:", error);
      return { status: 500, error: "Internal server error" };
    }
  },

  async getPlaylist(
    url: string
  ): Promise<MakeRequestResponse<PlaylistResponse>> {
    try {
      const playlistId = extractIdFromUrl(url, "playlist");
      if (!playlistId) {
        return { status: 400, error: "Invalid Spotify playlist URL" };
      }

      const playlist = await spotifyApi.getPlaylist(playlistId);
      const playlistBody = playlist.body as unknown as PlaylistResponse;

      if (!playlistBody) {
        return { status: 404, error: "Playlist data not found" };
      }

      return { status: 200, data: playlistBody };
    } catch (error) {
      console.error("Error fetching playlist:", error);
      return { status: 500, error: "Internal server error" };
    }
  },
};

export default spotify;
