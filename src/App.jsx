import { useEffect, useState, useMemo } from "react"
import Data from "./Data"
import Header from "./Header"
import Sidebar from "./Sidebar"
import PreviewModal from "./components/PreviewModal"
import ShareModal from "./components/ShareModal"
import MoveModal from "./components/MoveModal"
import SettingsModal from "./components/SettingsModal"
import Toast from "./components/Toast"
import { auth, provider, db, isFirebaseConfigured } from "./firebase"
import firebase from "firebase"

export function DriveLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <polygon points="20,3 3,33 20,23" fill="#1a73e8" />
      <polygon points="3,33 37,33 20,23" fill="#188038" />
      <polygon points="37,33 20,3 20,23" fill="#f9ab00" />
    </svg>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [signInError, setSignInError] = useState(null)

  // Data states
  const [files, setFiles] = useState([])
  const [sharedFiles, setSharedFiles] = useState([])
  const [filesLoading, setFilesLoading] = useState(true)

  // Navigation states
  const [currentSection, setCurrentSection] = useState('my-drive') // 'my-drive' | 'shared' | 'recent' | 'starred' | 'computers' | 'trash'
  const [currentFolder, setCurrentFolder] = useState(null)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("desc")
  const [viewMode, setViewMode] = useState("list")

  // Modal states
  const [previewFile, setPreviewFile] = useState(null)
  const [shareFile, setShareFile] = useState(null)
  const [moveFile, setMoveFile] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  // Auth observer
  useEffect(() => {
    if (!auth) {
      setAuthReady(true)
      return
    }
    return auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser)
      setAuthReady(true)
    })
  }, [])

  // User Files Listener
  useEffect(() => {
    if (!user || !db) {
      setFiles([])
      setFilesLoading(false)
      return
    }

    setFilesLoading(true)
    const unsubscribe = db.collection("myfiles")
      .where("uid", "==", user.uid)
      .onSnapshot(
        (snapshot) => {
          setFiles(snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() })))
          setFilesLoading(false)
        },
        (error) => {
          console.error("Firestore user files error: ", error)
          setFilesLoading(false)
        }
      )

    return () => unsubscribe()
  }, [user])

  // Shared Files Listener
  useEffect(() => {
    if (!user || !user.email || !db) {
      setSharedFiles([])
      return
    }

    const unsubscribe = db.collection("myfiles")
      .where("sharedEmails", "array-contains", user.email.toLowerCase())
      .onSnapshot(
        (snapshot) => {
          setSharedFiles(snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() })))
        },
        (error) => {
          console.error("Firestore shared files error: ", error)
        }
      )

    return () => unsubscribe()
  }, [user])

  const signIn = () => {
    if (!auth || !provider) {
      setSignInError("Firebase Authentication is not configured.")
      return
    }
    setSignInError(null)
    auth.signInWithPopup(provider).catch((error) => {
      setSignInError(error.message)
    })
  }

  const signOutOfDrive = () => {
    if (auth) {
      auth.signOut()
    }
    setUser(null)
    setCurrentFolder(null)
    setCurrentSection('my-drive')
  }

  // File Operations
  const handleToggleStar = async (fileId, currentStarred) => {
    if (!db) return;
    try {
      await db.collection("myfiles").doc(fileId).update({
        isStarred: !currentStarred
      });
      showToast(currentStarred ? "Removed from Starred" : "Added to Starred", "info");
    } catch (err) {
      showToast("Error updating star: " + err.message, "error");
    }
  };

  const handleMoveToTrash = async (fileId) => {
    if (!db) return;
    try {
      await db.collection("myfiles").doc(fileId).update({
        inTrash: true,
        trashedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      showToast("Item moved to trash", "info");
    } catch (err) {
      showToast("Error moving to trash: " + err.message, "error");
    }
  };

  const handleRestoreFromTrash = async (fileId) => {
    if (!db) return;
    try {
      await db.collection("myfiles").doc(fileId).update({
        inTrash: false,
        trashedAt: null
      });
      showToast("Item restored from trash", "success");
    } catch (err) {
      showToast("Error restoring item: " + err.message, "error");
    }
  };

  const handleDeletePermanently = async (fileId) => {
    if (!db) return;
    try {
      await db.collection("myfiles").doc(fileId).delete();
      showToast("Item permanently deleted", "info");
    } catch (err) {
      showToast("Error deleting item: " + err.message, "error");
    }
  };

  const handleEmptyTrash = async () => {
    if (!db) return;
    const trashed = files.filter(f => f.data.inTrash);
    try {
      for (const f of trashed) {
        await db.collection("myfiles").doc(f.id).delete();
      }
      showToast(`Emptied ${trashed.length} item(s) from trash`, "success");
    } catch (err) {
      showToast("Error emptying trash: " + err.message, "error");
    }
  };

  const handleRenameFile = async (fileId, newName) => {
    if (!db || !newName.trim()) return;
    try {
      await db.collection("myfiles").doc(fileId).update({
        filename: newName.trim(),
        lastAccessed: firebase.firestore.FieldValue.serverTimestamp()
      });
      showToast("Item renamed", "success");
    } catch (err) {
      showToast("Error renaming item: " + err.message, "error");
    }
  };

  const handleCreateFolder = async (folderName) => {
    if (!db || !user || !folderName.trim()) return;
    await db.collection("myfiles").add({
      uid: user.uid,
      ownerEmail: user.email || '',
      ownerName: user.displayName || 'Google User',
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      lastAccessed: firebase.firestore.FieldValue.serverTimestamp(),
      filename: folderName.trim(),
      fileUrl: '',
      size: 0,
      fileType: 'folder',
      isFolder: true,
      isStarred: false,
      inTrash: false,
      parentFolderId: currentFolder ? currentFolder.id : null,
      sharedWith: [],
      sharedEmails: []
    });
  };

  const handleCopyFile = async (file) => {
    if (!db || !user) return;
    try {
      const data = file.data;
      await db.collection("myfiles").add({
        ...data,
        uid: user.uid,
        ownerEmail: user.email || '',
        ownerName: user.displayName || 'Google User',
        filename: `Copy of ${data.filename}`,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        lastAccessed: firebase.firestore.FieldValue.serverTimestamp(),
        isStarred: false,
        inTrash: false
      });
      showToast(`Created copy of "${data.filename}"`, "success");
    } catch (err) {
      showToast("Error copying file: " + err.message, "error");
    }
  };

  const handleMoveFile = async (fileId, targetFolderId) => {
    if (!db) return;
    try {
      await db.collection("myfiles").doc(fileId).update({
        parentFolderId: targetFolderId,
        lastAccessed: firebase.firestore.FieldValue.serverTimestamp()
      });
      showToast("Item moved successfully", "success");
    } catch (err) {
      showToast("Error moving item: " + err.message, "error");
    }
  };

  const handleShareFile = async (fileId, targetEmail, role = 'viewer') => {
    if (!db) return;
    const targetFile = files.find(f => f.id === fileId);
    if (!targetFile) return;

    const existingShared = targetFile.data.sharedWith || [];
    const filteredShared = existingShared.filter(s => s.email.toLowerCase() !== targetEmail.toLowerCase());
    const updatedShared = [...filteredShared, { email: targetEmail.toLowerCase(), role, addedAt: new Date().toISOString() }];
    const updatedEmails = updatedShared.map(s => s.email.toLowerCase());

    await db.collection("myfiles").doc(fileId).update({
      sharedWith: updatedShared,
      sharedEmails: updatedEmails
    });
  };

  const handleRevokeShare = async (fileId, targetEmail) => {
    if (!db) return;
    const targetFile = files.find(f => f.id === fileId);
    if (!targetFile) return;

    const existingShared = targetFile.data.sharedWith || [];
    const updatedShared = existingShared.filter(s => s.email.toLowerCase() !== targetEmail.toLowerCase());
    const updatedEmails = updatedShared.map(s => s.email.toLowerCase());

    await db.collection("myfiles").doc(fileId).update({
      sharedWith: updatedShared,
      sharedEmails: updatedEmails
    });
  };

  const handleUploadDroppedFiles = async (droppedFiles) => {
    if (!droppedFiles.length || !user) return;
    const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      showToast("Cloudinary is not configured. Please check your credentials.", "error");
      return;
    }

    showToast(`Uploading ${droppedFiles.length} file(s)...`, "info");

    try {
      for (const file of droppedFiles) {
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

        if (result.error) throw new Error(result.error.message);

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
      showToast(`Uploaded ${droppedFiles.length} file(s) successfully!`, "success");
    } catch (err) {
      showToast("Upload failed: " + err.message, "error");
    }
  };

  // Filter & Sort Logic
  const filteredAndSortedFiles = useMemo(() => {
    let dataset = [];

    if (currentSection === 'shared') {
      dataset = sharedFiles.filter(f => !f.data.inTrash);
    } else if (currentSection === 'trash') {
      dataset = files.filter(f => f.data.inTrash);
    } else if (currentSection === 'starred') {
      dataset = files.filter(f => !f.data.inTrash && f.data.isStarred);
    } else if (currentSection === 'recent') {
      dataset = [...files.filter(f => !f.data.inTrash)];
      dataset.sort((a, b) => {
        const timeA = a.data.lastAccessed?.seconds || a.data.timestamp?.seconds || 0;
        const timeB = b.data.lastAccessed?.seconds || b.data.timestamp?.seconds || 0;
        return timeB - timeA;
      });
      return dataset;
    } else if (currentSection === 'computers') {
      return [];
    } else {
      // 'my-drive'
      dataset = files.filter((f) => {
        if (f.data.inTrash) return false;
        if (currentFolder) {
          return f.data.parentFolderId === currentFolder.id;
        }
        return !f.data.parentFolderId;
      });
    }

    // Apply Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      dataset = dataset.filter(f => f.data.filename?.toLowerCase().includes(q));
    }

    // Apply Sort (Folders always stay on top in Drive)
    dataset.sort((a, b) => {
      const isFolderA = a.data.isFolder ? 1 : 0;
      const isFolderB = b.data.isFolder ? 1 : 0;
      if (isFolderA !== isFolderB) return isFolderB - isFolderA;

      let valA = a.data[sortBy === 'date' ? 'timestamp' : sortBy];
      let valB = b.data[sortBy === 'date' ? 'timestamp' : sortBy];

      if (sortBy === 'name') {
        valA = (a.data.filename || '').toLowerCase();
        valB = (b.data.filename || '').toLowerCase();
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (sortBy === 'size') {
        valA = a.data.size || 0;
        valB = b.data.size || 0;
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      } else {
        // date
        valA = a.data.timestamp?.seconds || 0;
        valB = b.data.timestamp?.seconds || 0;
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
    });

    return dataset;
  }, [files, sharedFiles, currentSection, currentFolder, search, sortBy, sortOrder]);

  const allActiveFolders = useMemo(() => {
    return files.filter(f => !f.data.inTrash && f.data.isFolder);
  }, [files]);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div
          className="w-8 h-8 border-2 border-drive-blue border-t-transparent rounded-full animate-spin motion-reduce:animate-none"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-surface-alt flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full bg-white rounded-lg shadow-drive p-8 text-center">
          <div className="flex justify-center mb-4">
            <DriveLogo size={60} />
          </div>
          <h1 className="font-sans font-medium text-2xl text-ink-900 mb-2">Google Drive Clone</h1>
          <p className="font-sans text-sm text-ink-500 mb-6">
            Configuration required. Add your Firebase and Cloudinary credentials to your <code className="bg-surface-hover px-1.5 py-0.5 rounded text-ink-700">.env</code> file.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <DriveLogo size={64} />
        <h1 className="font-sans font-normal text-4xl text-ink-900 mt-6 mb-3">Drive</h1>
        <p className="font-sans text-ink-500 max-w-sm leading-relaxed">
          A private drive. Sign in and everything you upload is yours alone —
          no one else can see it.
        </p>
        <button
          onClick={signIn}
          className="mt-8 font-sans font-medium bg-drive-blue hover:bg-drive-blueHover active:scale-[0.98] text-white px-6 py-3 rounded transition-all shadow-drive focus:outline-none focus-visible:ring-2 focus-visible:ring-drive-blue focus-visible:ring-offset-2 cursor-pointer"
        >
          Sign in with Google
        </button>
        {signInError && (
          <p role="alert" className="mt-4 text-drive-red text-sm font-sans max-w-sm">
            Couldn&apos;t sign in: {signInError}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        user={user}
        onSignOut={signOutOfDrive}
        search={search}
        onSearchChange={setSearch}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <div className="App">
        <Sidebar
          user={user}
          files={files}
          sharedFiles={sharedFiles}
          currentSection={currentSection}
          onSelectSection={(section) => {
            setCurrentSection(section);
            setCurrentFolder(null);
          }}
          currentFolder={currentFolder}
          onNavigateRoot={() => setCurrentFolder(null)}
          onCreateFolder={handleCreateFolder}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onShowToast={showToast}
        />

        <Data
          files={filteredAndSortedFiles}
          allFolders={allActiveFolders}
          loading={filesLoading}
          searchActive={!!search.trim()}
          currentSection={currentSection}
          currentFolder={currentFolder}
          onOpenFolder={(folder) => setCurrentFolder(folder)}
          onBackToRoot={() => setCurrentFolder(null)}
          onDeleteFile={handleMoveToTrash}
          onRestoreFile={handleRestoreFromTrash}
          onDeletePermanently={handleDeletePermanently}
          onEmptyTrash={handleEmptyTrash}
          onRenameFile={handleRenameFile}
          onToggleStar={handleToggleStar}
          onCopyFile={handleCopyFile}
          onRequestMove={(file) => setMoveFile(file)}
          onRequestShare={(file) => setShareFile(file)}
          onPreviewFile={(file) => setPreviewFile(file)}
          onUploadDroppedFiles={handleUploadDroppedFiles}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </div>

      {/* Modals */}
      {previewFile && (
        <PreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {shareFile && (
        <ShareModal
          file={shareFile}
          currentUser={user}
          onShare={handleShareFile}
          onRevokeShare={handleRevokeShare}
          onClose={() => setShareFile(null)}
          onShowToast={showToast}
        />
      )}

      {moveFile && (
        <MoveModal
          file={moveFile}
          folders={allActiveFolders}
          currentFolderId={moveFile.data.parentFolderId}
          onMove={handleMoveFile}
          onClose={() => setMoveFile(null)}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          user={user}
          files={files}
          onClose={() => setIsSettingsOpen(false)}
          onEmptyTrash={handleEmptyTrash}
        />
      )}

      {isHelpOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setIsHelpOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 font-sans space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-surface-border pb-3">
              <h3 className="text-lg font-medium text-ink-900">Google Drive Shortcuts & Info</h3>
              <button onClick={() => setIsHelpOpen(false)} className="text-ink-400 hover:text-ink-700">✕</button>
            </div>
            <div className="space-y-2 text-sm text-ink-700">
              <p>• <strong>Upload:</strong> Click &quot;+ New&quot; or drag and drop files anywhere on the screen.</p>
              <p>• <strong>Folders:</strong> Create folders from the New button tab, and click to enter.</p>
              <p>• <strong>Preview:</strong> Click any file row or thumbnail to open the built-in media viewer.</p>
              <p>• <strong>Sharing:</strong> Share files with other users via email with Viewer/Editor rights.</p>
              <p>• <strong>Trash:</strong> Deleted files go to Trash where they can be restored or emptied.</p>
            </div>
            <button
              onClick={() => setIsHelpOpen(false)}
              className="w-full mt-4 bg-drive-blue text-white py-2 rounded-lg text-sm font-medium"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Floating Notifications */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;
