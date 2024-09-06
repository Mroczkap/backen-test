const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const verifyJWT = require("./middleware/verifyJWT");
const cookieParser = require("cookie-parser");
const credentials = require("./middleware/credentials");
const PORT = 4000;
const bodyParser = require("body-parser");

// custom middleware logger
app.use(logger);
app.use(bodyParser.json());
// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));
// require('./services/db');
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   next();
// });

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

//serve static files
app.use("/", express.static(path.join(__dirname, "/public")));

// routes
app.use("/", require("./routes/root"));
app.use("/cycles", require("./routes/cycleRoutes"));
app.use("/groups", require("./routes/groupRoutes"));
app.use("/results", require("./routes/resultsRoutes"));
app.use("/auth", require("./routes/authRoutes"));
app.use("/players", require("./routes/playerRoutes"));
app.use("/tournament", require("./routes/tournamentRoutes"));
app.use("/match", require("./routes/matchRoutes"));
app.use("/rankings", require("./routes/rankingRoutes"));

app.use(verifyJWT);

  

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app