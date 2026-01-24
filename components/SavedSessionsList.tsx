import React, { useState, memo } from 'react';
import { FaPlus, FaCopy, FaTrash, FaCheck, FaXmark } from 'react-icons/fa6';
import type { SavedChatSession } from '../types.ts';

interface SavedSessionsListProps {
  savedChatSessions: SavedChatSession[];
  activeSavedChatSessionId: string | null;
  onLoadSavedChatSession: (sessionId: string) => void;
  onDeleteSavedChatSession: (sessionId: string) => void;
  onRenameSavedChatSession: (sessionId: string, newName: string) => void;
  onDuplicateSavedChatSession: (sessionId: string) => void;
}

export const SavedSessionsList: React.FC<SavedSessionsListProps> = memo(
  ({
    savedChatSessions,
    activeSavedChatSessionId,
    onLoadSavedChatSession,
    onDeleteSavedChatSession,
    onRenameSavedChatSession,
    onDuplicateSavedChatSession,
  }) => {
    const [renameMap, setRenameMap] = useState<Record<string, string>>({});

    const handleRenameSubmit = (id: string) => {
      const newName = renameMap[id];
      if (newName && newName.trim()) {
        onRenameSavedChatSession(id, newName.trim());
      }
      setRenameMap((m) => {
        const newMap = { ...m };
        delete newMap[id];
        return newMap;
      });
    };

    return (
      <div className="flex flex-col gap-3">
        {savedChatSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-app-secondary/30 rounded-2xl border border-dashed border-app-border">
            <p className="text-app-muted text-sm italic">No saved sessions yet.</p>
          </div>
        ) : (
          savedChatSessions
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((s) => {
              const isActive = s.id === activeSavedChatSessionId;
              const isRenaming = renameMap[s.id] !== undefined;

              return (
                <div
                  key={s.id}
                  className={`group flex flex-col p-4 rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-app-accent/5 border-app-accent shadow-sm shadow-app-accent/5'
                      : 'bg-app-main border-app-border hover:border-app-accent/30 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                    <div className="flex-grow min-w-0">
                      {isRenaming ? (
                        <input
                          autoFocus
                          type="text"
                          value={renameMap[s.id]}
                          onChange={(e) => setRenameMap((m) => ({ ...m, [s.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameSubmit(s.id);
                            if (e.key === 'Escape')
                              setRenameMap((m) => {
                                const nm = { ...m };
                                delete nm[s.id];
                                return nm;
                              });
                          }}
                          className="w-full bg-app-secondary border border-app-accent rounded-lg px-3 py-1.5 text-sm font-bold text-app-text outline-none shadow-inner"
                        />
                      ) : (
                        <div className="flex flex-col">
                          <span
                            className={`text-sm font-bold truncate ${isActive ? 'text-app-accent' : 'text-app-text'}`}
                          >
                            {s.name}
                          </span>
                          <span className="text-[10px] text-app-muted font-medium uppercase tracking-wider">
                            {new Date(s.timestamp).toLocaleDateString()} at{' '}
                            {new Date(s.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {isRenaming ? (
                        <>
                          <button
                            onClick={() => handleRenameSubmit(s.id)}
                            className="p-2 text-green-500 hover:bg-green-500/10 rounded-xl transition-all"
                          >
                            <FaCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setRenameMap((m) => {
                                const nm = { ...m };
                                delete nm[s.id];
                                return nm;
                              })
                            }
                            className="p-2 text-app-muted hover:bg-app-secondary rounded-xl transition-all"
                          >
                            <FaXmark className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => onLoadSavedChatSession(s.id)}
                            className={`flex-grow sm:flex-none px-4 py-2 text-xs font-black rounded-xl transition-all shadow-md active:scale-95 ${
                              isActive
                                ? 'bg-app-accent text-white shadow-app-accent/20'
                                : 'bg-app-secondary text-app-text hover:bg-app-accent hover:text-white'
                            }`}
                          >
                            {isActive ? 'ACTIVE' : 'LOAD'}
                          </button>
                          <button
                            onClick={() => onDuplicateSavedChatSession(s.id)}
                            className="p-2 text-app-muted hover:text-blue-600 hover:bg-blue-500/10 rounded-xl transition-all"
                            title="Duplicate"
                          >
                            <FaPlus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setRenameMap((m) => ({ ...m, [s.id]: s.name }))}
                            className="p-2 text-app-muted hover:text-purple-600 hover:bg-purple-500/10 rounded-xl transition-all"
                            title="Rename"
                          >
                            <FaCopy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this context?'))
                                onDeleteSavedChatSession(s.id);
                            }}
                            className="p-2 text-app-muted hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-all"
                            title="Delete"
                          >
                            <FaTrash className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>
    );
  },
);

SavedSessionsList.displayName = 'SavedSessionsList';
