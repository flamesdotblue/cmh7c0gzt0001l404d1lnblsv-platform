import { Mic, Square, Volume2, Keyboard } from 'lucide-react';

function VoiceControls({
  isListening,
  isSpeaking,
  onStart,
  onStop,
  language,
  onLanguageChange,
  voices,
  voiceName,
  onVoiceNameChange,
  inputText,
  onInputTextChange,
  onSubmitText,
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={isListening ? onStop : onStart}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-3 font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 focus:ring-offset-transparent ${
            isListening ? 'bg-red-500/90 hover:bg-red-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
          aria-pressed={isListening}
        >
          {isListening ? <Square size={18} /> : <Mic size={18} />}
          {isListening ? 'Stop' : 'Start'} Listening
        </button>

        <div className="flex items-center gap-2 text-white/70">
          <Volume2 size={18} />
          <span className="text-sm">{isSpeaking ? 'Speaking…' : 'Idle'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="col-span-1">
          <label className="block text-xs uppercase tracking-wider text-white/50 mb-1">Language</label>
          <select
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
          >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="es-ES">Español (ES)</option>
            <option value="fr-FR">Français (FR)</option>
            <option value="de-DE">Deutsch (DE)</option>
            <option value="it-IT">Italiano (IT)</option>
            <option value="pt-BR">Português (BR)</option>
            <option value="ja-JP">日本語 (JP)</option>
          </select>
        </div>

        <div className="col-span-1">
          <label className="block text-xs uppercase tracking-wider text-white/50 mb-1">Voice</label>
          <select
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={voiceName}
            onChange={(e) => onVoiceNameChange(e.target.value)}
          >
            {voices.length ? (
              voices.map((v) => (
                <option key={v.name} value={v.name}>{v.name} {v.lang ? `(${v.lang})` : ''}</option>
              ))
            ) : (
              <option value="">Default</option>
            )}
          </select>
        </div>

        <div className="col-span-1">
          <label className="block text-xs uppercase tracking-wider text-white/50 mb-1">Type instead</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Keyboard className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <input
                value={inputText}
                onChange={(e) => onInputTextChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') onSubmitText(); }}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Type a prompt and press Enter"
              />
            </div>
            <button
              type="button"
              onClick={onSubmitText}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoiceControls;
