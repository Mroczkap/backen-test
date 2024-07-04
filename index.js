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
app.use("/register", require("./routes/register"));
app.use("/auth", require("./routes/auth"));
app.use("/refresh", require("./routes/refresh"));
app.use("/logout", require("./routes/logout"));
app.use("/turnieje", require("./routes/turnieje"));
app.use("/groups", require("./routes/groups"));
app.use("/roundMatch", require("./routes/roundMatch"));
app.use("/wyniki", require("./routes/wyniki"));
app.use("/zawodnicy", require("./routes/zawodnicy"));
app.use("/saveGroupmatch", require("./routes/saveGroupmatch"));
app.use("/finishgroup", require("./routes/finishgroup"));
app.use("/saveRoundmatch", require("./routes/saveRoundmatch"));
app.use("/createGame", require("./routes/createGame"));
app.use("/finishgroupstage", require("./routes/finishgroupstage"));
app.use("/rankings", require("./routes/rankings"));
app.use("/singleMatch", require("./routes/singleMatch"));
app.use("/cykle", require("./routes/cykle"));

app.use(verifyJWT);
app.use("/employees", require("./routes/api/employees"));

  

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