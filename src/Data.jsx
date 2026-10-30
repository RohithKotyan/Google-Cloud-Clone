import { useState } from 'react';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import MovieIcon from '@mui/icons-material/Movie';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FolderIcon from '@mui/icons-material/Folder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import './css/data.css';

function formatBytes(bytes, decimal = 1) {
  if (!bytes) return "0 B";
  const k = 1024;
  const dm = decimal < 0 ? 0 : decimal;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatDate(timestamp) {
  if (!timestamp?.seconds) return '—';
  return new Date(timestamp.seconds * 1000).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

function FileIcon({ fileType, isFolder, filename = '' }) {
  if (isFolder || fileType === 'folder') return <FolderIcon style={{ color: '#5f6368' }} />;
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  if (fileType === 'image' || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
    return <ImageIcon style={{ color: '#188038' }} />;
  }
  if (fileType === 'pdf' || ext === 'pdf') {
    return <PictureAsPdfIcon style={{ color: '#d93025' }} />;
  }
  if (fileType === 'video' || ['mp4', 'webm', 'mov'].includes(ext)) {
    return <MovieIcon style={{ color: '#d93025' }} />;
  }
  if (fileType === 'audio' || ['mp3', 'wav', 'ogg'].includes(ext)) {
    return <AudioFileIcon style={{ color: '#f9ab00' }} />;
  }
  return <InsertDriveFileIcon style={{ color: '#1a73e8' }} />;
}

const sectionTitles = {
  'my-drive': 'My Drive',
  'shared': 'Shared with me',
  'recent': 'Recent',
  'starred': 'Starred',
  'computers': 'Computers',
  'trash': 'Trash'
};

const Data = ({
  files = [],
  loading = false,
  searchActive = false,
  currentSection = 'my-drive',
  currentFolder = null,
  onOpenFolder,
  onBackToRoot,
  onDeleteFile,
  onRestoreFile,
  onDeletePermanently,
  onEmptyTrash,
  onRenameFile,
  onToggleStar,
  onCopyFile,
  onRequestMove,
  onRequestShare,
  onPreviewFile,
  onUploadDroppedFiles,
  sortBy = 'date',
  setSortBy,
  sortOrder = 'desc',
  setSortOrder,
  viewMode = 'list',
  setViewMode
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const startEditing = (file, e) => {
    e.stopPropagation();
    setEditingId(file.id);
    setEditName(file.data.filename || '');
  };

  const cancelEditing = (e) => {
    if (e) e.stopPropagation();
    setEditingId(null);
    setEditName('');
  };

  const saveRename = (fileId, e) => {
    if (e) e.stopPropagation();
    if (editName.trim()) {
      onRenameFile(fileId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleRowClick = (file) => {
    if (file.data.isFolder || file.data.fileType === 'folder') {
      onOpenFolder(file);
    } else {
      onPreviewFile(file);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingOver) setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadDroppedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const isInTrashSection = currentSection === 'trash';

  return (
    <main
      className="data"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="data__dropzone-overlay">
          <CloudUploadIcon style={{ fontSize: 56, color: '#1a73e8' }} />
          <p className="font-sans font-medium text-lg text-ink-900">
            Drop files here to upload to {currentFolder ? currentFolder.data.filename : 'My Drive'}
          </p>
        </div>
      )}

      {/* Header Bar */}
      <div className="data__header">
        <div className="data__breadcrumbs">
          {currentSection === 'my-drive' && currentFolder ? (
            <>
              <button
                className="data__breadcrumb-btn"
                onClick={onBackToRoot}
                title="Back to My Drive"
              >
                <ArrowBackIcon fontSize="small" />
                <span>My Drive</span>
              </button>
              <span className="data__breadcrumb-separator">/</span>
              <span className="font-sans text-lg text-ink-900 font-medium">
                {currentFolder.data.filename}
              </span>
            </>
          ) : (
            <p className="font-sans text-lg text-ink-900 font-medium">
              {searchActive ? 'Search results' : (sectionTitles[currentSection] || 'My Drive')}
            </p>
          )}
        </div>

        <div className="data__header-right">
          <span className="font-sans text-xs text-ink-500">
            {files.length} {files.length === 1 ? 'item' : 'items'}
          </span>

          {/* View toggle button */}
          <button
            className={`data__toolbar-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            title={viewMode === 'list' ? 'Switch to grid view' : 'Switch to list view'}
          >
            {viewMode === 'list' ? <GridViewIcon fontSize="small" /> : <ViewListIcon fontSize="small" />}
          </button>
        </div>
      </div>

      {/* Trash Warning Banner */}
      {isInTrashSection && files.length > 0 && (
        <div className="data__trash-banner">
          <span>Items in trash are visible only here until restored or deleted permanently.</span>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to permanently delete all items in trash?")) {
                onEmptyTrash();
              }
            }}
            className="px-3 py-1 bg-drive-red hover:bg-drive-red/90 text-white rounded text-xs font-medium font-sans transition-colors cursor-pointer"
          >
            Empty trash
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="data__empty">
          <div className="w-8 h-8 border-2 border-drive-blue border-t-transparent rounded-full animate-spin motion-reduce:animate-none" role="status" aria-label="Loading files" />
        </div>
      ) : files.length === 0 ? (
        <div className="data__empty">
          <p className="font-sans text-lg text-ink-700 mb-2">
            {searchActive
              ? 'No files match your search'
              : isInTrashSection
              ? 'Trash is empty'
              : currentSection === 'starred'
              ? 'No starred files'
              : currentSection === 'shared'
              ? 'No files shared with you yet'
              : currentSection === 'computers'
              ? 'No computers syncing'
              : 'No items in this location'}
          </p>
          <p className="font-sans text-sm text-ink-500">
            {searchActive
              ? 'Try a different keyword or file name.'
              : isInTrashSection
              ? 'Items moved to trash will appear here.'
              : currentSection === 'starred'
              ? 'Star files or folders to find them easily later.'
              : 'Drop files anywhere on this window or click "+ New" to add items.'}
          </p>
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <>
          <div className="data__list-head">
            <span></span>
            <span className="sortable" onClick={() => toggleSort('name')}>
              Name {sortBy === 'name' && (sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="inherit" /> : <ArrowDownwardIcon fontSize="inherit" />)}
            </span>
            <span className="sortable" onClick={() => toggleSort('date')}>
              Last modified {sortBy === 'date' && (sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="inherit" /> : <ArrowDownwardIcon fontSize="inherit" />)}
            </span>
            <span className="sortable" onClick={() => toggleSort('size')}>
              File size {sortBy === 'size' && (sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="inherit" /> : <ArrowDownwardIcon fontSize="inherit" />)}
            </span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>

          <ul className="data__list">
            {files.map((file) => {
              const isFolder = file.data.isFolder || file.data.fileType === 'folder';
              const isEditing = editingId === file.id;
              const isStarred = file.data.isStarred;

              return (
                <li
                  className={`file-row ${isFolder ? 'is-folder' : ''}`}
                  key={file.id}
                  onClick={() => handleRowClick(file)}
                >
                  <span className="file-row__icon">
                    <FileIcon fileType={file.data.fileType} isFolder={isFolder} filename={file.data.filename} />
                  </span>

                  <div className="file-row__name-container">
                    {isEditing ? (
                      <div className="file-row__rename-form" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          className="file-row__rename-input"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRename(file.id, e);
                            if (e.key === 'Escape') cancelEditing(e);
                          }}
                          autoFocus
                        />
                        <button className="file-row__btn" onClick={(e) => saveRename(file.id, e)} title="Save">
                          <CheckIcon fontSize="small" />
                        </button>
                        <button className="file-row__btn" onClick={cancelEditing} title="Cancel">
                          <CloseIcon fontSize="small" />
                        </button>
                      </div>
                    ) : (
                      <span className="file-row__name" title={file.data.filename}>
                        {file.data.filename}
                      </span>
                    )}
                  </div>

                  <span className="file-row__meta">{formatDate(file.data.timestamp)}</span>
                  <span className="file-row__meta">
                    {isFolder ? '—' : formatBytes(file.data.size)}
                  </span>

                  <div className="file-row__actions" onClick={(e) => e.stopPropagation()}>
                    {!isInTrashSection ? (
                      <>
                        {/* Star / Unstar */}
                        <button
                          className={`file-row__btn ${isStarred ? 'starred' : ''}`}
                          onClick={() => onToggleStar(file.id, isStarred)}
                          title={isStarred ? 'Starred' : 'Add to Starred'}
                        >
                          {isStarred ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                        </button>

                        {/* Preview */}
                        {!isFolder && file.data.fileUrl && (
                          <button
                            className="file-row__btn"
                            onClick={() => onPreviewFile(file)}
                            title="Preview"
                          >
                            <OpenInNewIcon fontSize="small" />
                          </button>
                        )}

                        {/* Download */}
                        {!isFolder && file.data.fileUrl && (
                          <a
                            href={file.data.fileUrl}
                            download={file.data.filename}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="file-row__btn"
                            title="Download"
                          >
                            <DownloadIcon fontSize="small" />
                          </a>
                        )}

                        {/* Share */}
                        <button
                          className="file-row__btn"
                          onClick={() => onRequestShare(file)}
                          title="Share"
                        >
                          <ShareOutlinedIcon fontSize="small" />
                        </button>

                        {/* Rename */}
                        <button
                          className="file-row__btn"
                          onClick={(e) => startEditing(file, e)}
                          title="Rename"
                        >
                          <DriveFileRenameOutlineIcon fontSize="small" />
                        </button>

                        {/* Move */}
                        <button
                          className="file-row__btn"
                          onClick={() => onRequestMove(file)}
                          title="Move to folder"
                        >
                          <DriveFileMoveOutlinedIcon fontSize="small" />
                        </button>

                        {/* Copy */}
                        {!isFolder && (
                          <button
                            className="file-row__btn"
                            onClick={() => onCopyFile(file)}
                            title="Make a copy"
                          >
                            <ContentCopyIcon fontSize="small" />
                          </button>
                        )}

                        {/* Move to Trash */}
                        <button
                          className="file-row__btn delete"
                          onClick={() => onDeleteFile(file.id)}
                          title="Move to trash"
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </button>
                      </>
                    ) : (
                      /* Trash Actions */
                      <>
                        <button
                          className="file-row__btn"
                          onClick={() => onRestoreFile(file.id)}
                          title="Restore from trash"
                        >
                          <RestoreFromTrashIcon fontSize="small" />
                        </button>
                        <button
                          className="file-row__btn delete"
                          onClick={() => {
                            if (window.confirm(`Permanently delete "${file.data.filename}"? This action cannot be undone.`)) {
                              onDeletePermanently(file.id);
                            }
                          }}
                          title="Delete permanently"
                        >
                          <DeleteForeverIcon fontSize="small" />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        /* Grid View */
        <div className="data__grid">
          {files.map((file) => {
            const isFolder = file.data.isFolder || file.data.fileType === 'folder';
            const isStarred = file.data.isStarred;
            const isImage = (file.data.fileType === 'image' || file.data.filename?.match(/\.(png|jpg|jpeg|gif|webp)$/i)) && file.data.fileUrl;

            return (
              <div
                key={file.id}
                className="grid-card"
                onClick={() => handleRowClick(file)}
              >
                <div className="grid-card__preview">
                  {isFolder ? (
                    <FolderIcon style={{ fontSize: 54, color: '#5f6368' }} />
                  ) : isImage ? (
                    <img src={file.data.fileUrl} alt={file.data.filename} loading="lazy" />
                  ) : (
                    <FileIcon fileType={file.data.fileType} isFolder={isFolder} filename={file.data.filename} />
                  )}
                </div>

                <div className="grid-card__body">
                  <div className="grid-card__title" title={file.data.filename}>
                    <FileIcon fileType={file.data.fileType} isFolder={isFolder} filename={file.data.filename} />
                    <span className="truncate">{file.data.filename}</span>
                  </div>

                  <div className="grid-card__meta">
                    <span>{isFolder ? 'Folder' : formatBytes(file.data.size)}</span>
                    <span>{formatDate(file.data.timestamp)}</span>
                  </div>

                  <div className="grid-card__actions" onClick={(e) => e.stopPropagation()}>
                    {!isInTrashSection ? (
                      <>
                        <button
                          className={`file-row__btn ${isStarred ? 'starred' : ''}`}
                          onClick={() => onToggleStar(file.id, isStarred)}
                          title={isStarred ? 'Starred' : 'Add to Starred'}
                        >
                          {isStarred ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                        </button>
                        <button
                          className="file-row__btn"
                          onClick={() => onRequestShare(file)}
                          title="Share"
                        >
                          <ShareOutlinedIcon fontSize="small" />
                        </button>
                        <button
                          className="file-row__btn delete"
                          onClick={() => onDeleteFile(file.id)}
                          title="Move to trash"
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="file-row__btn"
                          onClick={() => onRestoreFile(file.id)}
                          title="Restore"
                        >
                          <RestoreFromTrashIcon fontSize="small" />
                        </button>
                        <button
                          className="file-row__btn delete"
                          onClick={() => {
                            if (window.confirm(`Permanently delete "${file.data.filename}"?`)) {
                              onDeletePermanently(file.id);
                            }
                          }}
                          title="Delete permanently"
                        >
                          <DeleteForeverIcon fontSize="small" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default Data;
