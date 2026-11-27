// Vitest setup file
import { beforeAll, afterEach } from 'vitest';

// Mock Web Speech API if not present in jsdom
if (typeof window !== 'undefined') {
  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
    class MockSpeechRecognition {
      constructor() {
        this.continuous = false;
        this.interimResults = false;
        this.lang = 'hi-IN';
        this.onresult = null;
        this.onerror = null;
        this.onend = null;
      }
      start() {}
      stop() {}
      abort() {}
    }
    window.SpeechRecognition = MockSpeechRecognition;
    window.webkitSpeechRecognition = MockSpeechRecognition;
  }

  // Mock navigator.storage.persist
  if (!navigator.storage) {
    navigator.storage = {
      persist: async () => true,
      persisted: async () => true,
      estimate: async () => ({ quota: 1000000, usage: 10000 })
    };
  }
}
