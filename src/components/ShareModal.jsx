import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import CheckIcon from '@mui/icons-material/Check';

export default function ShareModal({ file, currentUser, onShare, onRevokeShare, onClose, onShowToast }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!file) return null;
  const data = file.data || {};
  const filename = data.filename || 'Untitled';
  const sharedWith = data.sharedWith || [];
  const isOwner = data.uid === currentUser?.uid;

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    if (cleanEmail === currentUser?.email?.toLowerCase()) {
      onShowToast?.("You are already the owner of this file.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await onShare(file.id, cleanEmail, role);
      setEmail('');
      onShowToast?.(`Shared with ${cleanEmail} as ${role}.`, "success");
    } catch (err) {
      onShowToast?.("Failed to share file: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    const link = data.fileUrl || window.location.href;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      onShowToast?.("Link copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRemove = async (targetEmail) => {
    try {
      await onRevokeShare(file.id, targetEmail);
      onShowToast?.(`Removed access for ${targetEmail}.`, "info");
    } catch (err) {
      onShowToast?.("Failed to remove access: " + err.message, "error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-drive-blueTint flex items-center justify-center text-drive-blue">
              <PersonAddAlt1Icon fontSize="small" />
            </div>
            <div>
              <h3 className="font-sans font-medium text-lg text-ink-900 leading-tight">Share &quot;{filename}&quot;</h3>
              <p className="font-sans text-xs text-ink-500">Manage who can view or edit this file</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-ink-500 hover:bg-surface-hover rounded-full transition-colors"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Add People Form */}
          {isOwner && (
            <form onSubmit={handleShareSubmit} className="space-y-3">
              <label className="block font-sans text-xs font-medium text-ink-700">Add people and groups</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-surface-border rounded-lg outline-none focus:border-drive-blue font-sans"
                  required
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="px-3 py-2 text-sm border border-surface-border rounded-lg bg-surface-alt font-sans text-ink-700 outline-none"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                </select>
                <button
                  type="submit"
                  disabled={isSubmitting || !email.trim()}
                  className="px-4 py-2 bg-drive-blue hover:bg-drive-blueHover disabled:opacity-50 text-white rounded-lg text-sm font-medium font-sans transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Sharing…' : 'Share'}
                </button>
              </div>
            </form>
          )}

          {/* People with access */}
          <div className="space-y-3">
            <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-ink-500">People with access</h4>
            <div className="divide-y divide-surface-border border border-surface-border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
              {/* Owner */}
              <div className="flex items-center justify-between p-3 bg-surface-alt/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-drive-blue text-white font-medium flex items-center justify-center text-xs">
                    {(data.ownerName || data.ownerEmail || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-sans text-xs font-medium text-ink-900">
                      {data.ownerName || 'File Owner'} {isOwner && '(You)'}
                    </p>
                    <p className="font-sans text-xs text-ink-500">{data.ownerEmail || 'Owner'}</p>
                  </div>
                </div>
                <span className="text-xs font-sans font-medium text-ink-500 bg-surface-hover px-2.5 py-1 rounded-full">
                  Owner
                </span>
              </div>

              {/* Shared List */}
              {sharedWith.map((share, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-drive-green text-white font-medium flex items-center justify-center text-xs">
                      {share.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-sans text-xs font-medium text-ink-900">{share.email}</p>
                      <p className="font-sans text-[11px] text-ink-400 capitalize">{share.role}</p>
                    </div>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => handleRemove(share.email)}
                      className="text-drive-red hover:bg-drive-red/10 p-1.5 rounded-full transition-colors"
                      title="Remove access"
                    >
                      <PersonRemoveIcon fontSize="small" />
                    </button>
                  )}
                </div>
              ))}

              {sharedWith.length === 0 && (
                <div className="p-3 text-center text-xs text-ink-400 font-sans">
                  Not shared with anyone yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-surface-alt border-t border-surface-border">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium font-sans text-drive-blue border border-drive-blue/30 rounded-full hover:bg-drive-blueTint transition-colors cursor-pointer"
          >
            {copied ? <CheckIcon fontSize="inherit" /> : <LinkIcon fontSize="inherit" />}
            {copied ? 'Link copied!' : 'Copy share link'}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-drive-blue hover:bg-drive-blueHover text-white rounded-lg text-sm font-medium font-sans transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
