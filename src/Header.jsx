import { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import { Avatar, Menu, MenuItem, ListItemIcon, Divider } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import StorageIcon from '@mui/icons-material/Storage';

import { DriveLogo } from './App';
import './css/Header.css';

const Header = ({ user, onSignOut, search, onSearchChange, onOpenSettings, onOpenHelp }) => {
  const [menuAnchor, setMenuAnchor] = useState(null);

  return (
    <header className="header">
      <div className="header__brand">
        <DriveLogo size={30} />
        <span className="font-sans text-xl text-ink-700">Drive</span>
      </div>

      <div className="header__search">
        <SearchIcon className="text-ink-500" fontSize="small" />
        <input
          type="text"
          placeholder="Search files and folders"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search files and folders"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="text-ink-400 hover:text-ink-700 p-1 rounded-full"
            title="Clear search"
          >
            <CloseIcon fontSize="small" />
          </button>
        )}
      </div>

      <div className="header__account">
        <button
          className="header__icon-btn"
          title="Support & Info"
          aria-label="Help"
          onClick={onOpenHelp}
        >
          <HelpOutlineIcon fontSize="small" />
        </button>
        <button
          className="header__icon-btn"
          title="Settings & Storage"
          aria-label="Settings"
          onClick={onOpenSettings}
        >
          <SettingsIcon fontSize="small" />
        </button>
        <button
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          className="header__avatar-btn"
          aria-label="Account menu"
        >
          <Avatar
            src={user.photoURL}
            alt={user.displayName || 'Account'}
            sx={{ width: 32, height: 32 }}
          />
        </button>
        <Menu
          anchorEl={menuAnchor}
          open={!!menuAnchor}
          onClose={() => setMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <div className="header__menu-identity">
            <p className="font-sans text-sm text-ink-900 font-medium">{user.displayName || 'Google User'}</p>
            <p className="font-sans text-xs text-ink-500">{user.email}</p>
          </div>
          <Divider />
          <MenuItem onClick={() => { setMenuAnchor(null); onOpenSettings(); }}>
            <ListItemIcon>
              <StorageIcon fontSize="small" />
            </ListItemIcon>
            Storage & Settings
          </MenuItem>
          <MenuItem onClick={() => { setMenuAnchor(null); onSignOut(); }}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Sign out
          </MenuItem>
        </Menu>
      </div>
    </header>
  )
}

export default Header
