let audioCtx;
let bassFilter;
let source;

chrome.runtime.onMessage.addListener(async (message) => {
    // 1. First-time setup (Capture the audio)
    if (message.type === 'START_AUDIO_CAPTURE') {
        if (!audioCtx) audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') await audioCtx.resume();

        // If we already have a source, don't try to capture again
        if (source) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    mandatory: {
                        chromeMediaSource: 'tab',
                        chromeMediaSourceId: message.streamId
                    }
                }
            });

            source = audioCtx.createMediaStreamSource(stream);
            bassFilter = audioCtx.createBiquadFilter();
            bassFilter.type = "lowshelf";
            bassFilter.frequency.value = 150;
            
            source.connect(bassFilter);
            bassFilter.connect(audioCtx.destination);
            
            // Set the initial boost
            bassFilter.gain.value = parseFloat(message.boost);
        } catch (err) {
            console.error("Capture failed:", err);
        }
    }

    // 2. Continuous Updates (This is what fixes the "stuck" problem)
    if (message.type === 'UPDATE_BASS_VALUE') {
        if (bassFilter) {
            const val = parseFloat(message.boost);
            // Smoothly ramp to the new value over 0.1 seconds
            bassFilter.gain.setTargetAtTime(val, audioCtx.currentTime, 0.1);
            console.log("Bass updated to:", val);
        }
    }
});