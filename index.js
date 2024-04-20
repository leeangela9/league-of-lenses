let inputFile = document.getElementById("input-file");
let imgView = document.getElementById("img-view");
let source = document.getElementById("vid");
let dropTxt = document.getElementById("drop-txt");
let form = document.getElementById("form");

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
  source.style.width = "90%";
  dropTxt.textContent = "";
}

function handleFile() {
  // e.preventDefault();

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

    const newFileName = `${makeid(
      10
    )}-${startingSec}-${endingSec}-${audioBool}`;
    console.log(newFileName);

    const apiUrl =
      "https://4f1wirqn9k.execute-api.us-east-1.amazonaws.com/Prod/upload";

    source.src = "loading.mp4";
    timeDiv.style.display = "none";
    soundDiv.style.display = "none";
    submitBtn.style.display = "none";
    let fileKey = "";
    let queueURL = "";
    axios
      .post(apiUrl, {
        filename: newFileName + ".mp4",
        withCredentials: false,
      })
      .then(async function (response) {
        console.log("api response: ", response);

        const uploadUrl = response.data.uploadUrl;
        fileKey = response.data.fileKey;
        queueURL = response.data.queueURL;
        console.log(fileKey);
        console.log(queueURL);
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
            let counter = 0;
            await new Promise((resolve) => setTimeout(resolve, 10000));

            while (counter < 10) {
              console.log("getting clipped link", fileKey.split("-")[0]);
              let r = await axios
                .post(postUrl, {
                  queueURL: queueURL,
                })
                .then(function (response) {
                  console.log("Response: ", response);
                  clippedLink = response.data;
                  console.log("Clipped Link: ", clippedLink);
                  source.src = "done.mp4";
                  dDiv.style.display = "block";
                  dBtn.href = clippedLink;
                  return clippedLink;
                })
                .catch(function (error) {
                  console.log("error 1: ", error);
                  if (error.response.status === 200) {
                    console.log("Clipped Link: ", error.response.data);
                    source.src = "done.mp4";
                    dDiv.style.display = "block";
                    dBtn.href = error.response.data;
                    return error.response.data;
                  }
                  return 0;
                });
              if (r !== 0) {
                break;
              }
              counter++;
            }

            // axios
            //   .post(postUrl, {
            //     filename: fileKey,
            //   })
            //   .then(function (response) {
            //     console.log("Response: ", response);
            //     clippedLink = response.data.url;
            //     console.log("Clipped Link: ", clippedLink);
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
