$(document).ready(function () {



// Expose the DisplayMessage function to Python
eel.expose(DisplayMessage);

// Function to display the message
function DisplayMessage(message) {
    console.log("Message from Python: " + message);
    
    // If the message contains a code block, handle it properly
    if (message.includes("```")) {
        // Extract the code block from the message
        const code = message.match(/```(python)?([\s\S]*?)```/)[2]; // Extract only the code part
        $(".siri-message").html(`<pre><code>${code}</code></pre>`);
    } else {
        $(".siri-message").text(message);
    }
    const siriMessage = $(".siri-message");
    siriMessage.css("max-width", "100%");
    
    // Start text animation
    $('.siri-message').textillate('start');
}

    // Display hood
    eel.expose(ShowHood)
    function ShowHood() {
        $("#Oval").attr("hidden", false);
        $("#SiriWave").attr("hidden", true);
    }

// Expose the function to Python
eel.expose(senderText)
function senderText(message) {
    var chatBox = document.getElementById("chat-canvas-body");
    if (message.trim() !== "") {
        chatBox.innerHTML += `<div class="row justify-content-end mb-4">
        <div class = "width-size">
        <div class="sender_message">${message}</div>
    </div>`; 

        // Scroll to the bottom of the chat box
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}


    eel.expose(receiverText)
    function receiverText(message) {

        var chatBox = document.getElementById("chat-canvas-body");
        if (message.trim() !== "") {
            chatBox.innerHTML += `<div class="row justify-content-start mb-4">
            <div class = "width-size">
            <div class="receiver_message">${message}</div>
            </div>
        </div>`; 
    
        chatBox.scrollTop = chatBox.scrollHeight;
        }
        
    }

    
    // Hide Loader and display Face Auth animation
    eel.expose(hideLoader)
    function hideLoader() {

        $("#Loader").attr("hidden", true);
        $("#FaceAuth").attr("hidden", false);

    }
    // Hide Face auth and display Face Auth success animation
    eel.expose(hideFaceAuth)
    function hideFaceAuth() {

        $("#FaceAuth").attr("hidden", true);
        $("#FaceAuthSuccess").attr("hidden", false);

    }
    // Hide success and display 
    eel.expose(hideFaceAuthSuccess)
    function hideFaceAuthSuccess() {

        $("#FaceAuthSuccess").attr("hidden", true);
        $("#HelloGreet").attr("hidden", false);

    }


    // Hide Start Page and display blob
    eel.expose(hideStart)
    function hideStart() {

        $("#Start").attr("hidden", true);

        setTimeout(function () {
            $("#Oval").addClass("animate__animated animate__zoomIn");

        }, 1000)
        setTimeout(function () {
            $("#Oval").attr("hidden", false);
        }, 1000)
    }


});