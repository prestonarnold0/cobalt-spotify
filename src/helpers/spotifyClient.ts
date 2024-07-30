import SpotifyWebApi from "spotify-web-api-node";

export const spotifyClient = new SpotifyWebApi({
  clientId: "b2735dde628d486da407b9a457d30efa",
  clientSecret: "d9362807a92341d08516b3e91b01a306",
});

let accessToken =
  "BQBd3ivg6kIMipxksYFBH1lE5wOinzqWZhRRseCnC2P17vlmuLYP-XjgJX0yiexrtG3NVfXqHwwS0O5LTZdYt3oAafyGReg0XM3l8g6uHW9pYM4VhyHRZ1fcQ0CrcHW4X37TiqaP-BWZK3czkgK2hVsCoZewO1KvRxUj4-27vMmwRB9OsnmQg7JhImrZPj6FNkaKwywSTRvXiiMCiTtSEWXPU_dSCDkKpLZwWHuDyXwEzUYP8YDF6Ubh5T9mXVpDGYZJqiEbh_fiENuvE6q8r76yrNK9Bk8zsR9Mw3G9Y8wcbeA3378akQbHe4aDVWdGyh2rxaSpcr8E-xdA0zKx1WT3HA";
const refreshToken =
  "AQDhV5DphD0A_xr5rxkbsEitS3gBmzBKCSZt9-8m04MQOJz_L4DuPBe0Rc3nPKBMRW8O4Kjea199MoNrgXQ8cFFoYt54BUgMQZUNiPoSZaShuZc-R5Vz6sIKDfnLP1YVchs";

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
