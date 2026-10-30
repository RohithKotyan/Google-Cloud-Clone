import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import FolderIcon from '@mui/icons-material/Folder';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';

export default function MoveModal({ file, folders, currentFolderId, onMove, onClose }) {
  const [targetId, setTargetId] = useState(currentFolderId || null);
  const [isMoving, setIsMoving] = useState(false);

  if (!file) return null;

  // Filter out the file itself (if it's a folder, you can't move it into itself)
  const availableFolders = folders.filter((f) => f.id !== file.id && !f.data.inTrash);

  const handleMoveSubmit = async () => {
    setIsMoving(true);
    try {
      await onMove(file.id, targetId);
      onClose();
    } catch (err) {
      alert("Failed to move item: " + err.message);
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
          <div className="flex items-center gap-2.5">
            <DriveFileMoveIcon className="text-drive-blue" />
            <h3 className="font-sans font-medium text-lg text-ink-900">
              Move &quot;{file.data.filename}&quot;
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-ink-500 hover:bg-surface-hover rounded-full transition-colors"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <div className="p-6">
          <p className="font-sans text-xs font-semibold text-ink-500 uppercase tracking-wider mb-3">
            Select Destination Folder
          </p>

          <div className="space-y-1 max-h-60 overflow-y-auto border border-surface-border rounded-lg p-2">
            {/* Root Option */}
            <div
              onClick={() => setTargetId(null)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors font-sans text-sm ${
                targetId === null
                  ? 'bg-drive-blueTint text-drive-blue font-medium'
                  : 'text-ink-700 hover:bg-surface-hover'
              }`}
            >
              <DriveFileMoveIcon fontSize="small" />
              <span>My Drive (Root)</span>
            </div>

            {/* Folder list */}
            {availableFolders.map((f) => (
              <div
                key={f.id}
                onClick={() => setTargetId(f.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors font-sans text-sm ${
                  targetId === f.id
                    ? 'bg-drive-blueTint text-drive-blue font-medium'
                    : 'text-ink-700 hover:bg-surface-hover'
                }`}
              >
                <FolderIcon fontSize="small" className="text-ink-500" />
                <span className="truncate">{f.data.filename}</span>
              </div>
            ))}

            {availableFolders.length === 0 && (
              <p className="text-xs text-ink-400 font-sans text-center py-4">
                No custom folders found. You can move to My Drive (Root).
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-surface-alt border-t border-surface-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-ink-700 hover:bg-surface-hover rounded-lg text-sm font-medium font-sans transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleMoveSubmit}
            disabled={isMoving}
            className="px-5 py-2 bg-drive-blue hover:bg-drive-blueHover text-white rounded-lg text-sm font-medium font-sans transition-colors cursor-pointer disabled:opacity-50"
          >
            {isMoving ? 'Moving…' : 'Move here'}
          </button>
        </div>
      </div>
    </div>
  );
}
