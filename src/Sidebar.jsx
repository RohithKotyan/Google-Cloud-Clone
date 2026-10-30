import { useState } from 'react'
import './css/sidebar.css'
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import CloseIcon from '@mui/icons-material/Close';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Modal } from '@mui/base';
import { db } from './firebase';
import { DriveLogo } from './App';

import firebase from 'firebase';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const MAX_STORAGE_BYTES = 100 * 1024 * 1024; // 100MB per account

function formatBytes(bytes) {
  if (!bytes) return "0 B"
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const navItems = [
  { id: 'shared', icon: PeopleOutlineIcon, label: 'Shared with me' },
  { id: 'recent', icon: QueryBuilderIcon, label: 'Recent' },
  { id: 'starred', icon: StarOutlineIcon, label: 'Starred' },
  { id: 'computers', icon: LaptopMacIcon, label: 'Computers' },
  { id: 'trash', icon: DeleteOutlineIcon, label: 'Trash' },
]

const Sidebar = ({
  user,
  files = [],
  sharedFiles = [],
  currentSection = 'my-drive',
  onSelectSection,
  currentFolder,
  onNavigateRoot,
  onCreateFolder,
  onOpenSettings,
  onShowToast
}) => {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('upload') // 'upload' | 'folder'
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [uploadError, setUploadError] = useState(null)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [folderName, setFolderName] = useState('')

  const handleClose = () => {
    if (uploading) return;
    setOpen(false);
    setUploadError(null);
    setSelectedFiles([]);
    setFolderName('');
    setActiveTab('upload');
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFiles.length || !user) return;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      setUploadError("Cloudinary is not configured. Please check VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.");
      return;
    }

    const totalBatchSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);
    if (totalBytes + totalBatchSize > MAX_STORAGE_BYTES) {
      setUploadError(
        `Not enough space. ${formatBytes(remainingBytes)} left, selected files total ${formatBytes(totalBatchSize)}.`
      );
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadProgress(`Uploading ${i + 1} of ${selectedFiles.length}: ${file.name}…`);

        let detectedType = 'file';
        const mime = file.type || '';
        if (mime.startsWith('image/')) detectedType = 'image';
        else if (mime.startsWith('video/')) detectedType = 'video';
        else if (mime.startsWith('audio/')) detectedType = 'audio';
        else if (mime.includes('pdf') || file.name.endsWith('.pdf')) detectedType = 'pdf';

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
          method: 'POST',
          body: formData,
        });
        const result = await res.json();

        if (result.error) {
          throw new Error(result.error.message);
        }

        await db.collection("myfiles").add({
          uid: user.uid,
          ownerEmail: user.email || '',
          ownerName: user.displayName || 'Google User',
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          lastAccessed: firebase.firestore.FieldValue.serverTimestamp(),
          filename: file.name,
          fileUrl: result.secure_url,
          publicId: result.public_id || '',
          size: result.bytes || file.size,
          fileType: detectedType,
          isFolder: false,
          isStarred: false,
          inTrash: false,
          parentFolderId: currentFolder ? currentFolder.id : null,
          sharedWith: [],
          sharedEmails: []
        });
      }

      setUploading(false);
      setSelectedFiles([]);
      setOpen(false);
      onShowToast?.(`Uploaded ${selectedFiles.length} file(s) successfully.`, "success");
    } catch (error) {
      console.error("Error uploading file: ", error);
      setUploading(false);
      setUploadError(error.message || "Couldn't upload files. Check your connection or Cloudinary settings.");
    }
  }

  const handleFolderSubmit = async (e) => {
    e.preventDefault();
    if (!folderName.trim() || !user) return;

    setUploading(true);
    setUploadError(null);

    try {
      if (onCreateFolder) {
        await onCreateFolder(folderName.trim());
      }
      setUploading(false);
      setFolderName('');
      setOpen(false);
      onShowToast?.(`Folder "${folderName.trim()}" created.`, "success");
    } catch (error) {
      console.error("Error creating folder: ", error);
      setUploading(false);
      setUploadError(error.message || "Couldn't create folder. Try again.");
    }
  }

  const handleOpen = () => {
    setOpen(true);
  }

  // Active files (not in trash) calculate storage
  const activeFiles = files.filter(f => !f.data.inTrash && !f.data.isFolder && f.data.fileType !== 'folder');
  const totalBytes = activeFiles.reduce((sum, f) => sum + (f.data.size || 0), 0);
  const remainingBytes = Math.max(0, MAX_STORAGE_BYTES - totalBytes);
  const usagePercent = Math.min(100, (totalBytes / MAX_STORAGE_BYTES) * 100);
  const nearLimit = usagePercent >= 90;

  const starredCount = files.filter(f => !f.data.inTrash && f.data.isStarred).length;
  const trashCount = files.filter(f => f.data.inTrash).length;

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <div className="modal_pop">
          <div className="modal_pop__header">
            <h3 className="font-sans font-medium text-lg text-ink-900">
              {activeTab === 'upload' ? 'Upload Files' : 'Create Folder'}
            </h3>
            <button onClick={handleClose} className="modal_pop__close" aria-label="Close">
              <CloseIcon fontSize="small" />
            </button>
          </div>

          <div className="modal_pop__tabs">
            <button
              type="button"
              className={`modal_pop__tab ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
              disabled={uploading}
            >
              <UploadFileIcon fontSize="inherit" style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Upload Files
            </button>
            <button
              type="button"
              className={`modal_pop__tab ${activeTab === 'folder' ? 'active' : ''}`}
              onClick={() => setActiveTab('folder')}
              disabled={uploading}
            >
              <CreateNewFolderIcon fontSize="inherit" style={{ verticalAlign: 'middle', marginRight: 4 }} />
              New Folder
            </button>
          </div>

          {activeTab === 'upload' ? (
            <form onSubmit={handleUploadSubmit} className="modal_pop__body">
              {uploading ? (
                <div className="modal_pop__uploading">
                  <div className="w-6 h-6 border-2 border-drive-blue border-t-transparent rounded-full animate-spin motion-reduce:animate-none" role="status" aria-label="Uploading" />
                  <p className="font-sans text-sm text-ink-500">{uploadProgress}</p>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="modal_pop__input"
                  />
                  {selectedFiles.length > 0 && (
                    <p className="modal_pop__file-info">
                      {selectedFiles.length} file{selectedFiles.length === 1 ? '' : 's'} selected ({formatBytes(selectedFiles.reduce((s, f) => s + f.size, 0))})
                    </p>
                  )}
                  {uploadError && (
                    <p role="alert" className="font-sans text-sm text-drive-red mt-2">{uploadError}</p>
                  )}
                  <input
                    type="submit"
                    value={selectedFiles.length > 1 ? `Upload ${selectedFiles.length} Files` : "Upload"}
                    disabled={selectedFiles.length === 0}
                    className="post__submit"
                  />
                </>
              )}
            </form>
          ) : (
            <form onSubmit={handleFolderSubmit} className="modal_pop__body">
              {uploading ? (
                <div className="modal_pop__uploading">
                  <div className="w-6 h-6 border-2 border-drive-blue border-t-transparent rounded-full animate-spin motion-reduce:animate-none" role="status" aria-label="Creating folder" />
                  <p className="font-sans text-sm text-ink-500">Creating folder…</p>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Folder name"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    className="modal_pop__text-input"
                    autoFocus
                  />
                  {uploadError && (
                    <p role="alert" className="font-sans text-sm text-drive-red mt-2">{uploadError}</p>
                  )}
                  <input
                    type="submit"
                    value="Create Folder"
                    disabled={!folderName.trim()}
                    className="post__submit"
                  />
                </>
              )}
            </form>
          )}
        </div>
      </Modal>

      <aside className="sidebar">
        <div className="sidebar_btn">
          <button onClick={handleOpen} className="sidebar__new">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20 13h-7v7h-2v-7H4v-2h7V4h2v7h7v2z"></path>
            </svg>
            <span>New</span>
          </button>
        </div>

        <nav className="sidebar__options">
          {/* My Drive */}
          <div
            className={`sidebar__option ${currentSection === 'my-drive' ? 'sidebar__option-active' : ''}`}
            onClick={() => {
              onSelectSection('my-drive');
              onNavigateRoot();
            }}
            style={{ cursor: 'pointer' }}
          >
            <DriveLogo size={18} />
            <span className="flex-1">My Drive</span>
          </div>

          {/* Other Sections */}
          {navItems.map(({ id, icon: Icon, label }) => {
            const isActive = currentSection === id;
            let countBadge = null;
            if (id === 'starred' && starredCount > 0) countBadge = starredCount;
            if (id === 'trash' && trashCount > 0) countBadge = trashCount;
            if (id === 'shared' && sharedFiles.length > 0) countBadge = sharedFiles.length;

            return (
              <div
                className={`sidebar__option ${isActive ? 'sidebar__option-active' : ''}`}
                key={id}
                onClick={() => onSelectSection(id)}
                style={{ cursor: 'pointer' }}
              >
                <Icon fontSize="small" />
                <span className="flex-1">{label}</span>
                {countBadge !== null && (
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-drive-blue text-white' : 'bg-surface-hover text-ink-500'
                  }`}>
                    {countBadge}
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        <hr className="sidebar__rule" />

        <div
          className="sidebar__storage cursor-pointer hover:bg-surface-hover/50 py-2 rounded-lg transition-colors"
          onClick={onOpenSettings}
          title="Click to view storage breakdown"
        >
          <div className="sidebar__storage-label">
            <CloudQueueIcon fontSize="small" />
            <span>Storage</span>
          </div>
          <div className="sidebar__storage-bar" role="progressbar" aria-valuenow={Math.round(usagePercent)} aria-valuemin={0} aria-valuemax={100} aria-label="Storage used">
            <div
              className={`sidebar__storage-bar-fill${nearLimit ? ' sidebar__storage-bar-fill--warn' : ''}`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <p className="font-sans text-xs text-ink-500 mt-2">
            {formatBytes(totalBytes)} of {formatBytes(MAX_STORAGE_BYTES)} used
          </p>
          <p className="font-sans text-xs text-ink-400">
            {activeFiles.length} files · {formatBytes(remainingBytes)} left
          </p>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
