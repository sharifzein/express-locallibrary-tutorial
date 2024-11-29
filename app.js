const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const compression = require("compression");
const helmet = require("helmet");
const expressRateLimit = require("express-rate-limit");

// const dotenv = require("dotenv").config({ debug: true, encoding: "utf-8" });
// require("dotenv").config({ debug: true, encoding: "utf-8" });
// console.log(process.env); // remove this after you've confirmed it is working

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const catalogRouter = require("./routes/catalog"); //Import routes for "catalog" area of site

// Start express() app
const app = express();

// Set up mongoose connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
// const dev_db_url  = "insert_your_database_url_here";
const dev_db_url = "mongodb://127.0.0.1:27017/local_library";


/*
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}
*/

const mongoDB = process.env.MONGODB_URI || dev_db_url;

const limiter = expressRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 50, // Limit each IP to 50 requests per `window` (here, per 5 minutes).
  max: 20,
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

// Apply the rate limiting middleware to all requests.
app.use(limiter);

// Add helmet to the middleware chain.
// Set CSP headers to allow our Bootstrap and jQuery to be served
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
    },
    xPoweredBy: false,
  })
);

// Not required, but recommended for Express users:
app.disable("x-powered-by");

main().catch((err) => console.log(err));
async function main() {
  //   await mongoose.connect(mongoDB);
  await mongoose
    .connect(mongoDB)
    .then(() => {
      console.log("Connected to the Database Successfully!");
    })
    .catch((err) => {
      console.log("Database connection error!");
    });
}

// compress all responses
app.use(compression());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.use("/catalog", catalogRouter); // Add catalog routes to middleware chain.

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
