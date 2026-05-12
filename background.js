chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "START_CAPTURE") {
        // This triggers the audio capture process
        chrome.tabCapture.getMediaStreamId({ targetTabId: message.tabId }, (streamId) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                return;
            }
            
            // Start the offscreen document to process audio
            chrome.offscreen.createDocument({
                url: 'offscreen.html',
                reasons: ['USER_MEDIA'],
                justification: 'Boosting that gamer bass'
            }).then(() => {
                chrome.runtime.sendMessage({
                    type: 'PROCESS_AUDIO',
                    streamId: streamId,
                    boost: message.boost
                });
            });
        });
    }
});