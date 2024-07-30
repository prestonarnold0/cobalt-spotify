import express from "express";
import router from "./routes";

const app = express();

app.use(router);

app.listen(3000, () => {
  console.log("cobalt-spotify started on port 3000");
});
