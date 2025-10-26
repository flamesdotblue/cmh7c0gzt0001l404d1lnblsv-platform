function LevelBar({ level }) {
  const pct = Math.min(100, Math.max(0, Math.round(level * 140)));
  return (
    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-amber-300 transition-[width] duration-75" style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatusBar({ isListening, isSpeaking, partialTranscript, level }) {
  return (
    <div className="w-full rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-sm">
          <span className="text-white/50">Status: </span>
          <span className="font-medium">
            {isListening ? 'Listening' : isSpeaking ? 'Speaking' : 'Idle'}
          </span>
        </div>
        <div className="text-sm truncate">
          <span className="text-white/50">Heard: </span>
          <span className="font-mono text-white/80">{partialTranscript || '—'}</span>
        </div>
      </div>
      <div className="mt-3">
        <LevelBar level={isListening ? level : 0} />
      </div>
    </div>
  );
}

export default StatusBar;
