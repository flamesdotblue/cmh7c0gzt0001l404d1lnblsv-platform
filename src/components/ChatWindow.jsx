function ChatWindow({ messages }) {
  return (
    <div className="h-[38vh] min-h-[260px] w-full overflow-y-auto rounded-xl bg-black/30 border border-white/10 p-4">
      <ul className="space-y-3">
        {messages.map((m, idx) => (
          <li key={idx} className="flex">
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm sm:text-base leading-relaxed ${
              m.role === 'assistant'
                ? 'bg-indigo-500/20 border border-indigo-400/20 text-indigo-100'
                : 'bg-white/10 border border-white/10 text-white'
            }`}>
              <span className="block opacity-70 text-xs mb-1 uppercase tracking-wide">
                {m.role === 'assistant' ? 'Assistant' : 'You'}
              </span>
              <span>{m.content}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChatWindow;
