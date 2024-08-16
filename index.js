// const axios = require("axios");
const poll = require("poll");

let inputFile = document.getElementById("input-file");
let imgView = document.getElementById("img-view");
let source = document.getElementById("vid");
let dropTxt = document.getElementById("drop-txt");
let form = document.getElementById("form");
let vidContainer = document.getElementById("v-container");
let loader = document.getElementById("loading-box");

let startMin = document.getElementById("start-min");
let startSec = document.getElementById("start-sec");
let endMin = document.getElementById("end-min");
let endSec = document.getElementById("end-sec");
let audio = document.getElementById("audio");

let dDiv = document.getElementById("ddisplay");
let dBtn = document.getElementById("dbtn");
let timeDiv = document.getElementById("time");
let soundDiv = document.getElementById("sound");
let submitBtn = document.getElementById("submit");

inputFile.addEventListener("change", uploadVid);
// from stack overflow to make random string
function makeid(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
function uploadVid() {
  let vidLink = URL.createObjectURL(inputFile.files[0]);
  source.src = vidLink;
  source.style.display = "block";

  source.addEventListener("loadedmetadata", function () {
    const width = source.videoWidth;
    const height = source.videoHeight;
    const ratio = width / height;
    const max = 450;
    let containerWidth, containerHeight;

    if (ratio > 1) {
      containerWidth = max;
      containerHeight = max / ratio;
      console.log(width, height, ratio, "->", containerWidth, containerHeight);
    } else {
      containerWidth = max * ratio;
      containerHeight = max;
      console.log(width, height, ratio, "->", containerWidth, containerHeight);
    }

    vidContainer.style.width = containerWidth + "px";
    vidContainer.style.height = containerHeight + "px";
    dropTxt.textContent = "";
  });
}

function handleFile() {
  // e.preventDefault();

  const file = inputFile.files[0];

  if (file) {
    source.src = "";
    timeDiv.style.display = "none";
    soundDiv.style.display = "none";
    submitBtn.style.display = "none";
    source.style.display = "hidden";
    loader.style.display = "block";

    let clippedLink = "";

    let audioBool = "M";
    if (audio.checked) {
      audioBool = "A";
    }

    const duration = Math.round(source.duration);

    let endingSec = 0;
    const endingInput = Number(endMin.value) * 60 + Number(endSec.value);

    if ((endMin.value !== "" || endSec.value !== "") && endingInput <= duration)
      endingSec = endingInput;
    else endingSec = duration;

    let startingSec = 0;
    const startingInput = Number(startMin.value) * 60 + Number(startSec.value);
    if (startingInput < endingSec) startingSec = startingInput;

    const newFileName = `${
      file.name.split(".")[0]
    }${startingSec}${endingSec}${audioBool}`;
    console.log(newFileName);

    const apiUrl =
      "https://4f1wirqn9k.execute-api.us-east-1.amazonaws.com/Prod/upload";

    axios
      .post(apiUrl, {
        filename: newFileName + ".mp4",
        withCredentials: false,
      })
      .then(function (response) {
        console.log("api response: ", response);

        const uploadUrl = response.data.uploadUrl;
        const fileKey = response.data.fileKey;

        console.log(uploadUrl);
        console.log(fileKey);

        const postUrl =
          "https://941jhpc24m.execute-api.us-east-1.amazonaws.com/Prod/clip";

        axios
          .put(uploadUrl, file, {
            headers: {
              "Content-Type": "video/mp4",
            },
          })
          .then(function (response) {
            console.log("Success: ", response);

            const checkCondition = async () => {
              const res = await axios.post(postUrl, {
                filename: fileKey,
              });
              if (res.status === 200) {
                console.log("successful res: ", res);
                clippedLink = response.data.url;
                console.log("Clipped Link: ", clippedLink);
                loader.style.display = "hidden";
                source.style.display = "block";
                source.src = "done.mp4";
                dDiv.style.display = "block";
                dBtn.href = clippedLink;
                return true;
              }
              return false;
            };

            const options = {
              interval: 10000,
              shouldContinue: (result) => !result,
            };

            poll(checkCondition, options)
              .then(() => console.log("poll stopped"))
              .catch((err) => console.log("error: ", err));

            // axios
            //   .post(postUrl, {
            //     filename: fileKey,
            //   })
            //   .then(function (response) {
            //     console.log("Response: ", response);
            //     clippedLink = response.data.url;
            //     console.log("Clipped Link: ", clippedLink);
            //     loader.style.display = "hidden";
            //     source.style.display = "block";
            //     source.src = "done.mp4";
            //     dDiv.style.display = "block";
            //     dBtn.href = clippedLink;
            //   })
            //   .catch(function (error) {
            //     console.log("error 1: ", error);
            //   });
          })
          .catch(function (error) {
            console.log("error 2: ", error);
          });
      })
      .catch(function (error) {
        console.log("error 3: ", error);
      });
  }
}
