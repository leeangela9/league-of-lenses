// const axios = require("axios").default;
// import axios from "axios"; 

let inputFile = document.getElementById("input-file");
let imgView = document.getElementById("img-view");
let source = document.getElementById("vid");
let dropTxt = document.getElementById("drop-txt");

inputFile.addEventListener("change", uploadVid);

function uploadVid() {
    console.log('123')
    let vidLink = URL.createObjectURL(inputFile.files[0]);
    source.src = vidLink;
    source.style.width = '90%';
    dropTxt.textContent = "";
    // source.parentElement.load();
    
}
let startMin = document.getElementById("start-min");
let startSec = document.getElementById("start-sec");
let endMin = document.getElementById("end-min");
let endSec = document.getElementById("end-sec");
let audio = document.getElementById("audio");

function handleFile() {
    // e.preventDefault();

    const file = inputFile.files[0];

    if (file) {

        let audioBool = "M";
        if (audio.checked) {
            audioBool = "A";
        }

        let startingSec = 0;
        startingSec += Number(startMin.value) * 60 + Number(startSec.value);

        let endingSec = startingSec + 60;
        if (endMin.value !== "" || endSec.value !== "")
            endingSec = Number(endMin.value) * 60 + Number(endSec.value);

        const newFileName = `${file.name.split(".")[0]}-${startingSec}-${endingSec}-${audioBool}`;
        console.log(newFileName);

        const apiUrl = "https://4f1wirqn9k.execute-api.us-east-1.amazonaws.com/Prod/upload";

       
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
                    // "Access-Control-Allow-Origin":"*",
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
                    console.log("Clipped Link: ", response.data.url);
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
