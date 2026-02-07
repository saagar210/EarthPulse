interface ShortcutsHelpProps {
  onClose: () => void;
}

const shortcuts = [
  { key: "1", action: "Toggle Earthquakes" },
  { key: "2", action: "Toggle ISS" },
  { key: "3", action: "Toggle Satellites" },
  { key: "4", action: "Toggle Day/Night" },
  { key: "5", action: "Toggle Aurora" },
  { key: "6", action: "Toggle Volcanoes" },
  { key: "7", action: "Toggle Hazards" },
  { key: "8", action: "Toggle Wildfires" },
  { key: "9", action: "Toggle Plates" },
  { key: "Space", action: "Play/Pause Replay" },
  { key: "R", action: "Toggle Replay Mode" },
  { key: "H", action: "Toggle Historical Mode" },
  { key: "S", action: "Save Screenshot" },
  { key: "Esc", action: "Close Panel/Modal" },
  { key: "?", action: "Show This Help" },
];

export function ShortcutsHelp({ onClose }: ShortcutsHelpProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-80 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4">Keyboard Shortcuts</h2>
        <div className="space-y-2">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex justify-between items-center">
              <kbd className="px-2 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs font-mono min-w-[40px] text-center">
                {s.key}
              </kbd>
              <span className="text-sm text-gray-300">{s.action}</span>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full px-3 py-1.5 text-sm rounded bg-gray-800 hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
