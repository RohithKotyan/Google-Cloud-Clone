import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(timestamp) {
  if (!timestamp?.seconds) return '—';
  return new Date(timestamp.seconds * 1000).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

export default function PreviewModal({ file, onClose }) {
  if (!file) return null;

  const data = file.data || {};
  const filename = data.filename || 'Untitled';
  const url = data.fileUrl || '';
  const fileType = (data.fileType || '').toLowerCase();
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  const isImage = fileType === 'image' || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
  const isPdf = fileType === 'pdf' || ext === 'pdf';
  const isVideo = fileType === 'video' || ['mp4', 'webm', 'ogg', 'mov', 'mkv'].includes(ext);
  const isAudio = fileType === 'audio' || ['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col bg-white rounded-lg shadow-2xl max-w-5xl w-full h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border bg-white flex-shrink-0">
          <div className="flex flex-col min-w-0 pr-4">
            <h2 className="font-sans font-medium text-lg text-ink-900 truncate" title={filename}>
              {filename}
            </h2>
            <div className="flex items-center gap-3 text-xs text-ink-500 font-sans mt-0.5">
              <span>{formatBytes(data.size)}</span>
              <span>•</span>
              <span>Modified: {formatDate(data.timestamp)}</span>
              {data.ownerName && (
                <>
                  <span>•</span>
                  <span>Owner: {data.ownerName}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {url && (
              <>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-ink-700 hover:text-drive-blue hover:bg-surface-hover rounded-full transition-colors"
                  title="Open original in new tab"
                >
                  <OpenInNewIcon fontSize="small" />
                </a>
                <a
                  href={url}
                  download={filename}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-ink-700 hover:text-drive-blue hover:bg-surface-hover rounded-full transition-colors"
                  title="Download file"
                >
                  <DownloadIcon fontSize="small" />
                </a>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-ink-700 hover:bg-surface-hover rounded-full transition-colors"
              title="Close preview"
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 bg-surface-alt flex items-center justify-center overflow-auto p-4">
          {isImage && (
            <img
              src={url}
              alt={filename}
              className="max-h-full max-w-full object-contain rounded shadow-sm select-none"
            />
          )}

          {isPdf && (
            <iframe
              src={`${url}#toolbar=1`}
              title={filename}
              className="w-full h-full border-0 rounded bg-white shadow-sm"
            />
          )}

          {isVideo && (
            <video
              src={url}
              controls
              autoPlay
              className="max-h-full max-w-full rounded shadow-sm bg-black"
            >
              Your browser does not support the video tag.
            </video>
          )}

          {isAudio && (
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm">
              <p className="font-sans font-medium text-ink-900 mb-4">{filename}</p>
              <audio src={url} controls autoPlay className="w-80" />
            </div>
          )}

          {!isImage && !isPdf && !isVideo && !isAudio && (
            <div className="text-center p-8 bg-white rounded-lg shadow-sm max-w-md">
              <p className="font-sans font-medium text-lg text-ink-900 mb-2">No preview available</p>
              <p className="font-sans text-sm text-ink-500 mb-6">
                This file type cannot be previewed directly in the browser. You can download it to view on your device.
              </p>
              {url && (
                <a
                  href={url}
                  download={filename}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-drive-blue hover:bg-drive-blueHover text-white px-5 py-2.5 rounded font-sans text-sm font-medium transition-colors"
                >
                  <DownloadIcon fontSize="small" />
                  Download File
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
