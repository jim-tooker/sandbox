document.addEventListener('DOMContentLoaded', () => {
    const audioFileInput = document.getElementById('audioFile');
    const speedInput = document.getElementById('speed');
    const processButton = document.getElementById('processButton');
    const downloadButton = document.getElementById('downloadButton');
    const waveform = document.getElementById('waveform');

    let wavesurfer;
    let originalBuffer;

    audioFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();

                audioContext.decodeAudioData(e.target.result, (buffer) => {
                    originalBuffer = buffer;
                    downloadButton.disabled = true;

                    if (wavesurfer) {
                        wavesurfer.destroy();
                    }
                    wavesurfer = WaveSurfer.create({
                        container: waveform,
                        waveColor: 'violet',
                        progressColor: 'purple'
                    });
                    wavesurfer.loadDecodedBuffer(buffer);
                }, (error) => {
                    console.error('Error decoding audio data:', error);
                });
            };

            reader.onerror = (error) => {
                console.error('FileReader error:', error);
            };

            reader.readAsArrayBuffer(file);
        }
    });

    processButton.addEventListener('click', () => {
        const speed = parseFloat(speedInput.value);
        if (wavesurfer && originalBuffer) {
            const offlineContext = new OfflineAudioContext(
                originalBuffer.numberOfChannels,
                originalBuffer.length / speed,
                originalBuffer.sampleRate
            );

            const source = offlineContext.createBufferSource();
            source.buffer = originalBuffer;
            source.playbackRate.value = speed;

            source.connect(offlineContext.destination);
            source.start();

            offlineContext.startRendering().then(renderedBuffer => {
                wavesurfer.loadDecodedBuffer(renderedBuffer);
                downloadButton.disabled = false;
            }).catch(error => {
                console.error('Error processing audio:', error);
            });
        }
    });

    downloadButton.addEventListener('click', () => {
        if (wavesurfer) {
            const buffer = wavesurfer.backend.buffer;
            const wavData = audioBufferToWav(buffer);
            const blob = new Blob([new DataView(wavData)], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'processed_audio.wav';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 100);
            downloadButton.disabled = true;
        }
    });

    function audioBufferToWav(buffer) {
        // Your audioBufferToWav implementation remains the same here
    }
});
                  