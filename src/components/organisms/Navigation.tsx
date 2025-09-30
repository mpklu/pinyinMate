/**
 * Navigation - Organism component
 * Application navigation bar with menu items for all pages
 */

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Home,
  LibraryBooks,
  Translate,
  Quiz,
  School,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

export interface NavigationProps {
  /** Application title */
  title?: string;
  /** Whether to show the mobile menu button */
  showMobileMenu?: boolean;
  /** Callback when menu item is selected */
  onMenuSelect?: (path: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  title = 'Learn Chinese',
  showMobileMenu = true,
  onMenuSelect,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const menuItems = [
    { path: '/', label: 'Home', icon: <Home /> },
    { path: '/library', label: 'Library', icon: <LibraryBooks /> },
    { path: '/annotate', label: 'Annotate', icon: <Translate /> },
    { path: '/quiz', label: 'Quiz', icon: <Quiz /> },
    { path: '/flashcards', label: 'Flashcards', icon: <School /> },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    onMenuSelect?.(path);
    setAnchorEl(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar>
        {/* Logo/Title */}
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: isMobile ? 1 : 0,
            mr: isMobile ? 0 : 4,
            cursor: 'pointer',
          }}
          onClick={() => handleNavigate('/')}
        >
          {title}
        </Typography>

        {/* Desktop Navigation */}
        {!isMobile && (
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            {menuItems.slice(1).map((item) => (
              <Button
                key={item.path}
                color="inherit"
                startIcon={item.icon}
                onClick={() => handleNavigate(item.path)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isCurrentPath(item.path) 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}

        {/* Mobile Navigation */}
        {isMobile && showMobileMenu && (
          <>
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              aria-label="menu"
              aria-controls={open ? 'mobile-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <MenuIcon />
            </IconButton>
            
            <Menu
              id="mobile-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              slotProps={{
                paper: {
                  'aria-labelledby': 'mobile-menu-button',
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {menuItems.map((item) => (
                <MenuItem
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  selected={isCurrentPath(item.path)}
                  sx={{
                    minWidth: 200,
                    gap: 2,
                  }}
                >
                  {item.icon}
                  {item.label}
                </MenuItem>
              ))}
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};