main()
function main() {

    const width = 1280; // We will scale the photo width to this
    const height = 720; // This will be computed based on the input stream

    let streaming = false;
  
    let video = null;
    let canvas = null;
    let photo = null;          

    function startup() {
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        photo = document.getElementById('photo');        

        navigator.mediaDevices.getUserMedia({
                video: {width:width, height:height},
                audio: false
            }).then(function(stream) {
                video.srcObject = stream;
                video.play();
            }).catch(function(err) {
                console.log("sth is wrong!!!" + err);
            });

        video.addEventListener('canplay', function(ev) {
            if (!streaming) {
                height = video.videoHeight / (video.videoWidth / width);

                if (isNaN(height)) {
                    height = width / (4 / 3);
                }
              
                canvas.setAttribute('width', width);
                canvas.setAttribute('height', height);
                streaming = true;
            }
        }, false);
    
        //keep calling takepicture function after 1 second
        setInterval(takepicture,10000)
        setInterval(sendPicture, 10000);
        clearphoto();
    }


    function clearphoto() {
        let context = canvas.getContext('2d');
        context.fillStyle = "#AAA";
        context.fillRect(0, 0, canvas.width, canvas.height);

        let data = canvas.toDataURL('image/png');
        photo.setAttribute('src', data);
    }

    function takepicture() {        
        let context = canvas.getContext('2d');
        if (width && height) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);

            //convert the image in base64 format
            let data = canvas.toDataURL('image/png');
            photo.setAttribute('src', data);
            //check the image in base64format in console
            //console.log(data);
        } else {
            clearphoto();
        }
    }

    function sendPicture(){
        const testing = document.getElementById("testing");
        let data = canvas.toDataURL('image/png');
        const URL = 'http://localhost:8099/captureSave'
        fetch(URL,{ method:'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id   : '5349b4ddd2781d08c09890f4',
                        image: data
                    })
                })
        .then(res => res.json())
        .then(json => {
            console.log(json);
            testing.innerText = json.message;
        })
        .catch(err => console.log('Request Failed', err)); 

      
    }


    window.addEventListener('load', startup, false);
}