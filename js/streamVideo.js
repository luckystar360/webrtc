
 var configuration = { 
    "iceServers": [{ "url": "stun:stun.1.google.com:19302" }] 
 }; 
var localStream;
const peerConnection = new RTCPeerConnection(configuration);
var socket = io('https://server-webrtc-nhatdn1.herokuapp.com');
var remoteDes;
function openStream() {
    const config = { audio: true, video: true };
    return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream) {
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}

$(document).ready(function(){
    $('#btn-showVideo').click(function(){
        console.log("Show local video")
        openStream()
        .then(function(stream){
            localStream = stream;
            playStream('localvideo', stream)
        });
    });

    $('#btn-call').click(function(){
        makeCall();
    });

    //answer 
    socket.on('server-send-offer',async function(remoteOffer){
        console.log("remote off" + remoteOffer)
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
            console.log("track")
        });
        peerConnection.setRemoteDescription(new RTCSessionDescription(remoteOffer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        // signalingChannel.send({'answer': answer});
        socket.emit('client-send-answer',answer); //gui answer đi tới server
    })
    
    socket.on('server-send-answer',async function(remoteAnswer){
        console.log("answer")
        const remoteDesc = new RTCSessionDescription(remoteAnswer);
        await peerConnection.setRemoteDescription(remoteDesc);
    })

    socket.on('server-send-new-ice-candidate',async function(new_ice_candidate){ //remote received
        console.log("new-ice-candidate-received")
        if (new_ice_candidate) {
            try {
                await peerConnection.addIceCandidate(new_ice_candidate);
            } catch (e) {
                console.error('Error adding received ice candidate', e);
            }
        }
    })

    const remoteStream = new MediaStream();
    const remoteVideo = document.querySelector('#remotevideo');
    remotevideo.srcObject = remoteStream;
    //peer event
    peerConnection.onaddstream = function(event){
        remotevideo.srcObject = event.stream;
        
    };
 
 
    peerConnection.addEventListener('track', async (event) => {
        remoteStream.addTrack(event.track, remoteStream);
    });

    // Listen for local ICE candidates on the local RTCPeerConnection
    peerConnection.addEventListener('icecandidate', event => {
        console.log("event icecandidate")
        if (event.candidate) {
            // signalingChannel.send({'new-ice-candidate': event.candidate});
            socket.emit('client-send-new-ice-candidate',event.candidate); //send to server
        }
    });

    peerConnection.addEventListener('connectionstatechange', event => {
        if (peerConnection.connectionState === 'connected') {
            // Peers connected!
            console.log("connection establish")
        }
    });
    
});

async function makeCall() {
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
        console.log("track")
    });
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('client-send-offer',offer); //gui localDes đi tới server
}