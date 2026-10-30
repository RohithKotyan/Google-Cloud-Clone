import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StorageIcon from '@mui/icons-material/Storage';

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function SettingsModal({ user, files, onClose, onEmptyTrash }) {
  const totalBytes = files.filter(f => !f.data.inTrash).reduce((sum, f) => sum + (f.data.size || 0), 0);
  const trashBytes = files.filter(f => f.data.inTrash).reduce((sum, f) => sum + (f.data.size || 0), 0);
  const totalCount = files.filter(f => !f.data.inTrash).length;
  const trashCount = files.filter(f => f.data.inTrash).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
          <div className="flex items-center gap-2.5">
            <StorageIcon className="text-drive-blue" />
            <h3 className="font-sans font-medium text-lg text-ink-900">Drive Settings & Storage</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-ink-500 hover:bg-surface-hover rounded-full transition-colors"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Account Details */}
          <div>
            <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2">Account Profile</h4>
            <div className="p-3 bg-surface-alt rounded-lg border border-surface-border flex items-center justify-between font-sans">
              <div>
                <p className="text-sm font-medium text-ink-900">{user.displayName || 'Google User'}</p>
                <p className="text-xs text-ink-500">{user.email}</p>
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-drive-green bg-drive-green/10 px-2.5 py-1 rounded-full">
                <CheckCircleIcon fontSize="inherit" />
                Authenticated
              </span>
            </div>
          </div>

          {/* Cloud Services */}
          <div>
            <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2">Connected Cloud Services</h4>
            <div className="grid grid-cols-2 gap-3 font-sans">
              <div className="p-3 bg-surface-alt rounded-lg border border-surface-border">
                <p className="text-xs font-medium text-ink-900">Google Cloud Firestore</p>
                <p className="text-[11px] text-ink-500 mt-0.5">Real-time metadata & auth</p>
                <span className="inline-flex items-center gap-1 text-[11px] text-drive-green mt-2 font-medium">
                  <CheckCircleIcon fontSize="inherit" /> Connected
                </span>
              </div>
              <div className="p-3 bg-surface-alt rounded-lg border border-surface-border">
                <p className="text-xs font-medium text-ink-900">Cloudinary CDN</p>
                <p className="text-[11px] text-ink-500 mt-0.5">High-speed file storage</p>
                <span className="inline-flex items-center gap-1 text-[11px] text-drive-green mt-2 font-medium">
                  <CheckCircleIcon fontSize="inherit" /> Connected
                </span>
              </div>
            </div>
          </div>

          {/* Storage Details */}
          <div>
            <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2">Storage Breakdown</h4>
            <div className="p-4 bg-surface-alt rounded-lg border border-surface-border font-sans space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-ink-700">Active Files ({totalCount} items):</span>
                <span className="font-medium text-ink-900">{formatBytes(totalBytes)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-700">Trash Bin ({trashCount} items):</span>
                <span className="font-medium text-ink-900">{formatBytes(trashBytes)}</span>
              </div>
              <div className="border-t border-surface-border pt-2 flex justify-between text-sm font-medium">
                <span className="text-ink-900">Quota Limit:</span>
                <span className="text-drive-blue">100 MB</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 bg-surface-alt border-t border-surface-border">
          {trashCount > 0 ? (
            <button
              onClick={() => {
                if (window.confirm("Permanently empty all items in trash?")) {
                  onEmptyTrash();
                }
              }}
              className="text-xs text-drive-red hover:underline font-sans font-medium cursor-pointer"
            >
              Empty Trash ({trashCount} items)
            </button>
          ) : <div />}
          <button
            onClick={onClose}
            className="px-5 py-2 bg-drive-blue hover:bg-drive-blueHover text-white rounded-lg text-sm font-medium font-sans transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
