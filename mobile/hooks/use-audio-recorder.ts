import { useCallback, useRef, useState } from 'react';
import { Audio } from 'expo-av';

export function useAudioRecorder() {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [uri, setUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const startRecording = useCallback(async () => {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Microphone permission is required for pronunciation practice.');
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();
    recordingRef.current = recording;
    setIsRecording(true);
    setUri(null);
  }, []);

  const stopRecording = useCallback(async () => {
    const recording = recordingRef.current;
    if (!recording) return;

    await recording.stopAndUnloadAsync();
    const recordedUri = recording.getURI();
    recordingRef.current = null;
    setIsRecording(false);
    setUri(recordedUri);
  }, []);

  const playRecording = useCallback(async () => {
    if (!uri) return;

    if (soundRef.current) {
      await soundRef.current.unloadAsync();
    }

    const { sound } = await Audio.Sound.createAsync({ uri });
    soundRef.current = sound;
    setIsPlaying(true);
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        setIsPlaying(false);
      }
    });
    await sound.playAsync();
  }, [uri]);

  const resetRecording = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setUri(null);
    setIsPlaying(false);
  }, []);

  return {
    isRecording,
    uri,
    isPlaying,
    startRecording,
    stopRecording,
    playRecording,
    resetRecording,
  };
}
