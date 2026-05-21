"use client";

import { useState, useRef } from 'react';

export const useAudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            let stream: MediaStream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            } catch (micErr) {
                console.warn("Physical microphone access failed. Synthesizing Web Audio stream fallback...", micErr);
                const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
                if (!AudioContextClass) throw new Error("AudioContext is not supported in this browser.");
                const audioCtx = new AudioContextClass();
                const destination = audioCtx.createMediaStreamDestination();
                
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                
                osc.type = "sine";
                osc.frequency.setValueAtTime(440, audioCtx.currentTime);
                gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3);
                
                osc.connect(gain);
                gain.connect(destination);
                
                osc.start();
                osc.stop(audioCtx.currentTime + 10);
                
                stream = destination.stream;
            }

            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioURL(url);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error setting up audio recorder stream:", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            // Stop all tracks
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const resetRecording = () => {
        if (audioURL) {
            URL.revokeObjectURL(audioURL);
            setAudioURL(null);
        }
    };

    return {
        isRecording,
        audioURL,
        startRecording,
        stopRecording,
        resetRecording
    };
};
