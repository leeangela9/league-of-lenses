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

function uploadVid() {
    let vidLink = URL.createObjectURL(inputFile.files[0]);
    source.src = vidLink;
    source.style.width = '90%';
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

        if ((endMin.value !== "" || endSec.value !== "") && (endingInput <= duration))
            endingSec = endingInput;
        else 
            endingSec = duration;

        let startingSec = 0;
        const startingInput = Number(startMin.value) * 60 + Number(startSec.value);
        if (startingInput < endingSec)
            startingSec = startingInput;

        const newFileName = `${file.name.split(".")[0]}${startingSec}${endingSec}${audioBool}`;
        console.log(newFileName);

        const apiUrl = "https://4f1wirqn9k.execute-api.us-east-1.amazonaws.com/Prod/upload";

        source.src = "loading.mp4";
        timeDiv.style.display = "none";
        soundDiv.style.display = "none";
        submitBtn.style.display = "none";

        axios.post(apiUrl, {
            filename: newFileName + ".mp4",
            withCredentials: false,

        })
        .then(function(response) {
            console.log("api response: ", response);

            const uploadUrl = response.data.uploadUrl;
            const fileKey = response.data.fileKey;

            console.log(uploadUrl);
            console.log(fileKey);

            const postUrl = "https://941jhpc24m.execute-api.us-east-1.amazonaws.com/Prod/clip";
            
            axios.put(uploadUrl, file, {
                headers: {
                    "Content-Type": 'video/mp4'
                }, 
            }) 
            .then(function(response) {

                console.log("Success: ", response);

                axios.post(postUrl, {
                    filename: fileKey,
                })
                .then(function(response) {
                    console.log("Response: ", response);
                    clippedLink = response.data.url;
                    console.log("Clipped Link: ", clippedLink);
                    source.src = "done.mp4";
                    dDiv.style.display = "block";
                    dBtn.href = clippedLink;
                })
                .catch(function(error) {
                    console.log("error 1: ", error);
                })
            })
            .catch(function(error) {
                console.log("error 2: ", error);
            })
        })
        .catch(function(error) {
            console.log("error 3: ", error);
        });  
    }

}
