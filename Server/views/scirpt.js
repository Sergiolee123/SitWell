// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-analytics.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}

document.getElementById('auth-button').onclick = function () {
    startAuth();
}

function startAuth() {
    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
        apiKey: "AIzaSyD9ezKPHMblMHIln1n7P2py8uoKVBPNyHY",
        authDomain: "sitwell-5b25b.firebaseapp.com",
        databaseURL: "https://sitwell-5b25b-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "sitwell-5b25b",
        storageBucket: "sitwell-5b25b.appspot.com",
        messagingSenderId: "1071817787547",
        appId: "1:1071817787547:web:b7ca073a73b3e9530dde3e",
        measurementId: "G-PLRTP51QLW"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);

    const provider = new GoogleAuthProvider();

    const auth = getAuth();
    signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            console.log(user)
            render()
            main(user.uid)
            // ...
        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...

        });
}

function render() {
    document.getElementById("main").innerHTML = '<h1>SitWell</h1><div class="camera"><video id="video">Video stream not available.</video></div><div></div><canvas id="canvas"></canvas><div class="output"><img id="photo" alt="The screen capture will appear in this box."></div><p id="testing"></p>'
}

function notificationRequest(){
    Notification.requestPermission(function (status) {
        console.log('Notification permission status:', status);
    });
}

function main(userID) {

    const HOST = "wws" + location.origin.substring(location.origin.indexOf(":"))
    console.log(HOST)
    const width = 640; // We will scale the photo width to this
    const height = 480; // This will be computed based on the input stream
    let streaming = false;

    let video = null;
    let canvas = null;
    let photo = null;

    notificationRequest();
    const socket = io.connect();
    socket.emit('join', userID);
    socket.on('full', (room) => {
        console.log('Room ' + room + ' is full');
    });
    socket.on('port', (port) => {
        console.log(port);
    });
    socket.on('getNotification', (message) => {
        if (Notification.permission == 'granted') {
            navigator.serviceWorker.getRegistration().then(function (reg) {
                reg.showNotification(message);
            });
        }else{
            notificationRequest();
        }
    })

    startup();

    function startup() {
        console.log('startUp')
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        photo = document.getElementById('photo');

        navigator.mediaDevices.getUserMedia({
            video: {
                width: width,
                height: height
            },
            audio: false
        }).then(function (stream) {
            video.srcObject = stream;
            video.play();

            video.addEventListener('canplay', function (ev) {
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
            setInterval(takepicture, 10000)
            clearphoto();

        }).catch(function (err) {
            document.getElementById('testing').innerText = "sth is wrong!!!" + err
        });

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
            sendPicture()
        } else {
            clearphoto();
        }
    }

    function sendPicture() {
        //const testing = document.getElementById("testing");
        let data = canvas.toDataURL('image/png');
        socket.emit('send', userID, data);


    }
}