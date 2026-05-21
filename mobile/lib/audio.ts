import * as Speech from 'expo-speech';

export const AudioService = {
  speak(text: string, rate = 0.9) {
    Speech.stop();
    Speech.speak(text, { rate, language: 'en-US' });
  },
  stop() {
    Speech.stop();
  },
};
