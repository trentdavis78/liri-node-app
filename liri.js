var dotenv = require("dotenv").config();
var axios = require("axios");
var Spotify = require("node-spotify-api");
var moment = require("moment");
var keys = require("./keys.js");
var fs = require("fs");
var logText = "",
  text = "",
  logCmd = "";
var myCmd = process.argv[2];
var arg2 = process.argv[3];

var nodeArgs = process.argv;
for (var i = 4; i < nodeArgs.length; i++) {
  arg2 += "+" + nodeArgs[i];
}

runMain();
console.log(logText);
fs.appendFile("log.txt", logText, function(err) {
  if (err) {
    console.log(err);
  }
});

function runMain() {
  switch (myCmd) {
    case "concert-this":
      concertThis();
      break;

    case "spotify-this-song":
      spotifyThisSong();
      break;

    case "movie-this":
      movieThis();
      break;

    case "do-what-it-says":
      doWhatItSays();
      break;

    default:
      console.log("Invalid command was entered.");
  }
}

function concertThis() {
  //Get concert data for band using Bands In Town API
  //Get venue name, location, and date formatted "MM/DD/YYYY"
  var queryString =
    "https://rest.bandsintown.com/artists/" +
    arg2 +
    "/events?app_id=codingbootcamp";
  axios
    .get(queryString)
    .then(function(response) {
      var x = response.data;
      logCmd = "<" + myCmd + " " + arg2 + ">";

      if (x.length === 0) {
        console.log("No upcoming concert dates.");
        logText = logCmd + "\nNo upcoming concert dates.";
        console.log(logText);
        return;
      }

      for (var i = 0; i < x.length; i++) {
        text +=
          "\n*************************\n" +
          x[i].venue.name +
          "\n" +
          x[i].venue.city +
          ", " +
          x[i].venue.region +
          "\n" +
          moment(x[i].datetime).format("MM/DD/YYYY") +
          "\n*************************\n";
      }
      logText = logCmd + text;

      console.log(text); //text for console
      fs.appendFile("log.txt", logText, function(err) {
        if (err) {
          console.log(err);
        }
      });
    })
    .catch(function(error) {
      processError(error);
    });
}
function spotifyThisSong() {
  //Get track data using spotify API:  Artist(s), song name, Spotify preview link, album.
  var mySpotify = keys.spotify;
  var spot = new Spotify({
    id: mySpotify.id,
    secret: mySpotify.secret
  });

  if (arg2 == null || typeof arg2 === "undefined") {
    arg2 = "The+Sign";
  }
  logCmd = "<" + myCmd + " " + arg2 + ">\n";

  spot.search({ type: "track", query: arg2 }, function(err, data) {
    if (err) {
      logText += JSON.stringify(err, null, 2);
      return console.log(err);
    }
    var x = data;
    var artists = "";

    console.log(x.tracks.items.length);
    for (var i = 0; i < x.tracks.items.length; i++) {
      for (var a = 0; a < x.tracks.items[i].artists.length; a++) {
        artists += x.tracks.items[i].artists[a].name;
        if (a < x.tracks.items[i].artists.length) {
          artists += ", ";
        }
      }

      text +=
        "\n************************" +
        "\nArtist: " +
        artists +
        "\nAlbum: " +
        x.tracks.items[i].album.name +
        "\nTrack Name: " +
        x.tracks.items[i].name +
        "\nPreview: " +
        x.tracks.items[i].preview_url +
        "\n************************\n";
    }

    logText = logCmd + text;
    console.log(text); //text for console;
    fs.appendFile("log.txt", logText, function(err) {
      if (err) {
        console.log(err);
      }
    });
  });

  return;
}
function movieThis() {
  //Get movie data
  // Get movie title, year, imdb rating, rotten tomatoes rating, country, language, plot, & actors
  if (arg2 == null || arg2 === "undefined") {
    arg2 = "Mr. Nobody";
  }
  logCmd = "<" + myCmd + " " + arg2 + ">\n";

  var queryString =
    "http://www.omdbapi.com/?t=" + arg2 + "&y=&plot=short&apikey=trilogy";
  axios
    .get(queryString)
    .then(function(response) {
      var x = response.data;

      text +=
        "\n*" +
        x.Title +
        "\n*" +
        x.Year +
        "\n*" +
        x.imdbRating +
        "\n*" +
        x.Ratings[1].Value +
        "\n*" +
        x.Country +
        "\n*" +
        x.Language +
        "\n*" +
        x.Language +
        "\n*" +
        x.Plot +
        "\n*" +
        x.Actors +
        "\n\n";
      console.log(text);
      logText = logCmd + text;
      fs.appendFile("log.txt", logText, function(err) {
        if (err) {
          console.log(err);
        }
      });
      return;
    })
    .catch(function(error) {
      processError(error);
    });
}
function doWhatItSays() {
  //Take the contents of the file "random.txt" and use the contents
  //to perform the command listed in the document.
  logText = "<" + myCmd + ">\n";
  //log file here to capture command.
  fs.appendFile("log.txt", logText, function(err) {
    if (err) {
      console.log(err);
    }
  });
  fs.readFile("random.txt", "utf8", function(error, data) {
    if (error) {
      return console.log(error);
    }

    // Then split it by commas (to make it more readable)
    var dataArr = data.split(",");
    //Set variables to contents of file

    myCmd = dataArr[0];
    arg2 = dataArr[1];
    runMain();
  });
}

function processError(error) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an object that comes back with details pertaining to the error that occurred.
    console.log(error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log("Error", error.message);
  }
  console.log(error.config);
}