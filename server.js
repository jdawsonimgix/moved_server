const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios").default;
var bodyParser = require("body-parser");
const fs = require("fs");
//require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "500mb" }));
app.use(bodyParser.json({ limit: "500mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "500mb",
    extended: true,
    parameterLimit: 50000,
  })
);
// multer
const memoStorage = multer.memoryStorage();
const upload = multer({ memoStorage });

//Start a session.
app.post("/startImgixSession", upload.single("pic"), async (req, res) => {
  const file = req.file;
  console.log("Starting imgix session in server.js");

  var config = {
    method: "post",
    url:
      `https://api.imgix.com/api/v1/sources/62e31fcb03d7afea23063596/upload-sessions/` +
      file.originalname,
    headers: {
      Authorization:
        "Bearer ak_a5261930e96dd8375b900030d00e26e20da450c1d8aa0f93650c840f0e159af5",
      "Content-Type": file.mimetype,
    },
    data: req.file.buffer,
  };

  let final = await axios(config)
    .then(function (response) {
      console.log("successfully did /startImgixSession axios call");
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
      return error;
    });

  let trueFinal = {
    allData: final,
    theBufferReturned: req.file.buffer,
  };
  return res.status(200).send(trueFinal);
});

app.post("/postSession", upload.single("pic"), async (req, res) => {
  let fileBufferData = req.file.buffer;
  let theAWSurl = req.body.awsURL;

  var config = {
    method: "put",
    url: theAWSurl,
    headers: {
      "Content-Type": "video/mp4",
    },
    data: fileBufferData,
  };

  let finalPost = await axios(config)
    .then(function (response) {
      console.log("inside the axios for /postSession");
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });

  return res.status(200).send(finalPost);
});

//Checks status of an imgix session.
app.post("/checkImgixSessionStatus", async (req, res) => {
  console.log("Checking imgix status in /checkImgixSessionStatus");
  const gssid = req.body.grabbedSessionSourceID;

  var config = {
    method: "get",
    url:
      `https://api.imgix.com/api/v1/sources/62e31fcb03d7afea23063596/upload-sessions/` +
      gssid,
    headers: {
      Authorization:
        "Bearer ak_a5261930e96dd8375b900030d00e26e20da450c1d8aa0f93650c840f0e159af5",
      "Content-Type": "application/json",
    },
  };

  let final = await axios(config)
    .then(function (response) {
      console.log("INSIDE THE .then() FOR /checkImgixSessionStatus");
      //console.log(JSON.stringify(response.data));
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
      return error;
    });
  return res.status(200).send(final);
});

//Close a session
app.post("/checkImgixCloseSession", async (req, res) => {
  console.log("Checking imgix status in /checkImgixCloseSession");
  const gssid = req.body.grabbedSessionSourceID;

  var config = {
    method: "post",
    url:
      `https://api.imgix.com/api/v1/sources/62e31fcb03d7afea23063596/upload-sessions/` +
      gssid,
    headers: {
      Authorization:
        "Bearer ak_a5261930e96dd8375b900030d00e26e20da450c1d8aa0f93650c840f0e159af5",
    },
  };

  let final = await axios(config)
    .then(function (response) {
      console.log("INSIDE THE .then() FOR /checkImgixCloseSession");
      console.log(JSON.stringify(response.data));
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
      return error;
    });
  return res.status(200).send(final);
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log("Server has started on port " + PORT);
});
