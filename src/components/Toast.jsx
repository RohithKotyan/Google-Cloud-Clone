import { useEffect } from 'react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const { message, type = 'info' } = toast;

  const icons = {
    success: <CheckCircleOutlineIcon className="text-drive-green text-sm" />,
    error: <ErrorOutlineIcon className="text-drive-red text-sm" />,
    info: <InfoOutlinedIcon className="text-drive-blue text-sm" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in flex items-center gap-3 bg-ink-900 text-white px-4 py-3 rounded-lg shadow-xl font-sans text-sm max-w-md">
      <span className="flex-shrink-0">{icons[type] || icons.info}</span>
      <span className="flex-1 text-xs">{message}</span>
      <button onClick={onClose} className="text-ink-400 hover:text-white transition-colors">
        <CloseIcon fontSize="small" />
      </button>
    </div>
  );
}
