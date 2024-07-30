import axios, { AxiosResponse } from "axios";

interface RequestBody {
  url: string;
  filenamePattern: string;
  isAudioOnly: string;
}

interface CobaltResponse {
  status: string;
  url: string;
}

const cobalt = {
  async makeRequest(url: string): Promise<AxiosResponse<CobaltResponse>> {
    const apiUrl = "https://api.cobalt.tools/api/json";

    const body: RequestBody = {
      url: url,
      filenamePattern: "pretty",
      isAudioOnly: "true",
    };

    try {
      const response = await axios.post<CobaltResponse>(apiUrl, body, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      return response;
    } catch (error) {
      console.error("Error whilst making request:", error);
      throw error;
    }
  },
};

export default cobalt;
