let isCapturing = false;

document.addEventListener('DOMContentLoaded', () => {
    const bassSlider = document.getElementById('bassSlider');
    const display = document.getElementById('val-display');

    if (bassSlider) {
        bassSlider.addEventListener('input', async () => {
            const boostValue = bassSlider.value;
            display.innerText = `${boostValue}dB`;

            // Visual Glow
            const intensity = boostValue * 1.5;
            document.body.style.boxShadow = `0 0 ${intensity}px rgba(0, 255, 65, 0.6)`;
            document.body.style.borderColor = boostValue > 40 ? "#ffffff" : "#00ff41";

            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                
                // Ensure offscreen is open
                const contexts = await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'] });
                if (contexts.length === 0) {
                    await chrome.offscreen.createDocument({
                        url: 'offscreen.html',
                        reasons: ['USER_MEDIA'],
                        justification: 'Gamer Bass'
                    });
                }

                if (!isCapturing) {
                    // FIRST TIME: Capture the tab
                    const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });
                    chrome.runtime.sendMessage({
                        type: 'START_AUDIO_CAPTURE',
                        streamId: streamId,
                        boost: boostValue
                    });
                    isCapturing = true;
                } else {
                    // SUBSEQUENT TIMES: Just update the value
                    chrome.runtime.sendMessage({
                        type: 'UPDATE_BASS_VALUE',
                        boost: boostValue
                    });
                }
            } catch (err) {
                console.error(err);
            }
        });
    }
});