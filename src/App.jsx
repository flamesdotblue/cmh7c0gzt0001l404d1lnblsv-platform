import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Hero from './components/Hero';
import ChatWindow from './components/ChatWindow';
import VoiceControls from './components/VoiceControls';
import StatusBar from './components/StatusBar';

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your voice assistant. Tap the mic and speak to get started.' },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState('');
  const [inputText, setInputText] = useState('');
  const [level, setLevel] = useState(0);

  // Refs to browser APIs
  const recognitionRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);

  // Load TTS voices
  useEffect(() => {
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      const v = synth.getVoices();
      setVoices(v);
      // Set a sensible default voice that matches language
      if (!voiceName && v.length) {
        const match = v.find((vv) => vv.lang?.toLowerCase() === language.toLowerCase());
        setVoiceName(match ? match.name : v[0].name);
      }
    };
    loadVoices();
    if (typeof window !== 'undefined') {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [language, voiceName]);

  const speak = useCallback(
    (text) => {
      if (!('speechSynthesis' in window)) return;
      const utter = new SpeechSynthesisUtterance(text);
      const selectedVoice = voices.find((v) => v.name === voiceName);
      if (selectedVoice) utter.voice = selectedVoice;
      utter.lang = selectedVoice?.lang || language;
      utter.rate = 1;
      utter.pitch = 1;
      utter.onstart = () => setIsSpeaking(true);
      utter.onend = () => setIsSpeaking(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    },
    [voices, voiceName, language]
  );

  const generateAssistantReply = useCallback((userText) => {
    const t = userText.toLowerCase().trim();
    const now = new Date();
    if (/(time|clock)/.test(t)) {
      return `It is ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
    }
    if (/(date|day)/.test(t)) {
      return `Today is ${now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}.`;
    }
    if (/(joke)/.test(t)) {
      return 'Here\'s a quick one: Why did the developer go broke? Because they used up all their cache.';
    }
    if (/(hello|hi|hey)/.test(t)) {
      return 'Hello! How can I assist you today?';
    }
    if (/(weather)/.test(t)) {
      return 'I cannot fetch live weather here, but you can ask me general questions or say “tell me a joke.”';
    }
    if (/(who are you|what are you)/.test(t)) {
      return 'I\'m a lightweight voice assistant demo running entirely in your browser using web speech APIs.';
    }
    if (/summar(y|ise|ize)/.test(t)) {
      const lastUser = [...messages].reverse().find((m) => m.role === 'user');
      if (lastUser) {
        return `Summary of your last message: ${lastUser.content.slice(0, 140)}${lastUser.content.length > 140 ? '…' : ''}`;
      }
      return 'There\'s nothing recent to summarize yet.';
    }
    return `You said: ${userText}`;
  }, [messages]);

  const pushMessage = useCallback((role, content) => {
    setMessages((prev) => [...prev, { role, content }]);
  }, []);

  // Audio level meter via Web Audio API
  const startLevelMeter = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      mediaStreamRef.current = stream;
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = { analyser, audioCtx };

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const loop = () => {
        analyser.getByteTimeDomainData(dataArray);
        // Compute RMS
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = (dataArray[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        setLevel(rms);
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch (e) {
      // Ignore meter errors
    }
  }, []);

  const stopLevelMeter = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setLevel(0);
    if (analyserRef.current?.audioCtx) {
      try { analyserRef.current.audioCtx.close(); } catch {}
    }
    analyserRef.current = null;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  // Start/stop speech recognition
  const startListening = useCallback(async () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      pushMessage('assistant', 'Speech recognition is not supported in this browser. You can type your prompt below.');
      return;
    }
    if (isListening) return;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setPartialTranscript('');
    };

    recognition.onerror = (e) => {
      setIsListening(false);
      stopLevelMeter();
      pushMessage('assistant', `Recognition error: ${e.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
      stopLevelMeter();
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) final += res[0].transcript;
        else interim += res[0].transcript;
      }
      if (interim) setPartialTranscript(interim.trim());
      if (final) {
        const text = final.trim();
        setPartialTranscript('');
        pushMessage('user', text);
        // Create assistant response
        const reply = generateAssistantReply(text);
        pushMessage('assistant', reply);
        speak(reply);
      }
    };

    recognitionRef.current = recognition;
    try {
      await startLevelMeter();
    } catch {}
    recognition.start();
  }, [generateAssistantReply, isListening, language, pushMessage, speak, startLevelMeter, stopLevelMeter]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    stopLevelMeter();
  }, [stopLevelMeter]);

  // Handle manual text input when speech recognition unsupported
  const submitText = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    pushMessage('user', text);
    const reply = generateAssistantReply(text);
    pushMessage('assistant', reply);
    speak(reply);
  }, [generateAssistantReply, inputText, pushMessage, speak]);

  const availableVoicesForLang = useMemo(() => {
    if (!voices.length) return [];
    // Prioritize voices that match selected language
    const exact = voices.filter((v) => v.lang?.toLowerCase().startsWith(language.toLowerCase()));
    if (exact.length) return exact;
    return voices;
  }, [voices, language]);

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white flex flex-col">
      <Hero />

      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="backdrop-blur supports-[backdrop-filter]:bg-white/5 bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 sm:p-6 md:p-8">
            <ChatWindow messages={messages} />

            <div className="mt-6">
              <VoiceControls
                isListening={isListening}
                isSpeaking={isSpeaking}
                onStart={startListening}
                onStop={stopListening}
                language={language}
                onLanguageChange={setLanguage}
                voices={availableVoicesForLang}
                voiceName={voiceName}
                onVoiceNameChange={setVoiceName}
                inputText={inputText}
                onInputTextChange={setInputText}
                onSubmitText={submitText}
              />
            </div>

            <div className="mt-4">
              <StatusBar
                isListening={isListening}
                isSpeaking={isSpeaking}
                partialTranscript={partialTranscript}
                level={level}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 text-center text-white/60">
        Built with web speech in your browser. For best results, use Chrome.
      </footer>
    </div>
  );
}

export default App;
