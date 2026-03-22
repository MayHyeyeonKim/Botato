import "./Sidebar.css";

interface SidebarProps {
  modes: string[];
  models: string[];
  selectedMode: string;
  selectedModel: string;
  onModeChange: (mode: string) => void;
  onModelChange: (model: string) => void;
  onClearChat: () => void;
}

export default function Sidebar({
  modes,
  models,
  selectedMode,
  selectedModel,
  onModeChange,
  onModelChange,
  onClearChat,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Botato 🥔</h2>
      </div>

      <div className="sidebar-section">
        <label htmlFor="mode-select">Mode</label>
        <select id="mode-select" value={selectedMode} onChange={(e) => onModeChange(e.target.value)}>
          {modes.map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>
        <p className="mode-description">
          {selectedMode && selectedMode}
        </p>
      </div>

      <div className="sidebar-section">
        <label htmlFor="model-select">Model</label>
        <select id="model-select" value={selectedModel} onChange={(e) => onModelChange(e.target.value)}>
          {models.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>

      <button className="clear-btn" onClick={onClearChat}>
        Clear Chat
      </button>

      <div className="sidebar-footer">
        <p>Offline • No API Keys</p>
      </div>
    </aside>
  );
}
