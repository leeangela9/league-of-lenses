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

const handleFile = async (e) => {
  e.preventDefault();

  const file = inputFile.files[0];

  if (file) {
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
      file.name.replaceAll("-", "").split(".")[0]
    }-${startingSec}-${endingSec}-${audioBool}`;
    console.log("name: ", newFileName);

    source.src = "";
    timeDiv.style.display = "none";
    soundDiv.style.display = "none";
    submitBtn.style.display = "none";
    source.style.display = "none";
    loader.style.display = "block";

    const apiUrl =
      "https://4f1wirqn9k.execute-api.us-east-1.amazonaws.com/Prod/upload";

    await axios
      .post(apiUrl, {
        filename: newFileName + ".mp4",
        withCredentials: false,
      })
      .then(async function (response) {
        console.log("api response: ", response);

        const uploadUrl = response.data.uploadUrl;
        const fileKey = response.data.fileKey;
        const queueURL = response.data.queueURL;

        console.log(uploadUrl);
        console.log(fileKey);

        // const postUrl =
        //   "https://941jhpc24m.execute-api.us-east-1.amazonaws.com/Prod/clip";

        const postUrl =
          "https://n4g5fjhkqdah2chkv7xzpadfby0gexzo.lambda-url.us-east-1.on.aws/";
        await axios
          .put(uploadUrl, file, {
            headers: {
              "Content-Type": "video/mp4",
            },
          })
          .then(async function (response) {
            console.log("Success: ", response);
            let stop = false;

            while (!stop) {
              await axios
                .post(postUrl, {
                  queueURL: queueURL,
                })
                .then(function (response) {
                  stop = true;
                  console.log("Response: ", response);
                  clippedLink = response.data;
                  console.log("Clipped Link: ", clippedLink);
                  loader.style.display = "none";
                  source.style.display = "block";
                  source.src = "done.mp4";
                  dDiv.style.display = "block";
                  dBtn.href = clippedLink;
                })
                .catch(async (error) => {
                  console.log("error 1: ", error);
                  //   if (error.response.status === 200) {
                  //      stop = true;
                  //       console.log("Response IN ERROR: ", response);
                  //       clippedLink = error.data
                  //       console.log("Clipped Link: ", clippedLink);
                  //       loader.style.display = "hidden";
                  //       source.style.display = "block";
                  //       source.src = "done.mp4";
                  //       dDiv.style.display = "block";
                  //       dBtn.href = clippedLink;
                  // }
                  await new Promise((r) => setTimeout(r, 10000));
                });
            }
          })
          .catch(function (error) {
            console.log("error 2: ", error);
          });
      })
      .catch(function (error) {
        console.log("error 3: ", error);
      });
  }
};

const uploadVid = () => {
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
};

form.addEventListener("submit", handleFile);

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
