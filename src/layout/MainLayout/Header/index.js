import PropTypes from 'prop-types';
import { Avatar, Box, ButtonBase, Stack, Typography, Chip, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';

// Components
import LogoSection from '../LogoSection';
import NotificationSection from './NotificationSection';
import ProfileSection from './ProfileSection';
import SearchSection from './SearchSection';

// Icons
import { IconMenu2 } from '@tabler/icons-react';
import Modal from '@mui/material/Modal';

// Utils & API
import { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';

const Header = ({ handleLeftDrawerToggle }) => {
  const theme = useTheme();
  const [logo, setLogo] = useState(null);
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [logoPreviewOpen, setLogoPreviewOpen] = useState(false);

  useEffect(() => {
    getCompanyDetails();
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setLogo(file);
    } else {
      showToast('error', 'Please upload a valid image (PNG or JPEG).');
    }
  };

  const getCompanyDetails = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/company/${orgId}`);
      if (response.status === true) {
        setLogo(response.paramObjectsMap.companyVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <>
      {/* Left: Logo & Menu Toggle */}
      <Box
        sx={{
          minWidth: { xs: 'auto', md: 228 },
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box component="span" sx={{ display: { xs: 'none', sm: 'none', md: 'block' } }}>
          <LogoSection />
        </Box>

        <ButtonBase
          sx={{
            borderRadius: '12px',
            overflow: 'hidden',
            display: { xs: 'inline-flex', md: 'none' },
            mr: 1
          }}
        >
          <Avatar
            variant="rounded"
            sx={{
              ...theme.typography.commonAvatar,
              ...theme.typography.mediumAvatar,
              transition: 'all .2s ease-in-out',
              background: theme.palette.secondary.light,
              color: theme.palette.secondary.dark,
              '&:hover': {
                background: theme.palette.secondary.dark,
                color: theme.palette.secondary.light
              }
            }}
            onClick={handleLeftDrawerToggle}
            color="inherit"
          >
            <IconMenu2 stroke={1.5} size="1.3rem" />
          </Avatar>
        </ButtonBase>
      </Box>

      {/* Center: Search Section */}
      <SearchSection />

      {/* Spacer */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Company Logo & Name - Now with clickable company name */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1.5,
          mx: { xs: 0.5, sm: 1, md: 2 },
          minWidth: 'fit-content',
          flexShrink: 0
        }}
      >
        {/* Clickable Logo */}
        <Box
          sx={{
            position: 'relative',
            width: { xs: 40, sm: 70, md: 90 },
            height: { xs: 40, sm: 50, md: 65 },
            borderRadius: 1,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.03)'
            },
            flexShrink: 0
          }}
          onClick={() => setLogoPreviewOpen(true)}
        >
          {logo?.[0]?.companyLogo ? (
            <img
              src={`data:image/png;base64,${logo[0].companyLogo}`}
              alt="Company Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
              Logo
            </Typography>
          )}
          <input type="file" id="logo-upload" hidden accept="image/png, image/jpeg" onChange={handleLogoChange} />
        </Box>

        {/* Clickable Company name and branch */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minWidth: 0,
            maxWidth: { sm: 120, md: 160 },
            cursor: 'pointer'
          }}
          onClick={() => setLogoPreviewOpen(true)}
        >
          <Typography
            variant="subtitle2"
            noWrap
            sx={{
              fontWeight: 600,
              fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
              color: theme.palette.mode === 'dark' ? 'text.primary' : 'common.white',
              mb: 0.25,
              display: { xs: 'none', sm: 'block' } // Show on sm and above
            }}
          >
            {localStorage.getItem('companyName') || 'Company Name'}
          </Typography>
          
          {/* Mobile-only company name */}
          <Typography
            variant="subtitle2"
            noWrap
            sx={{
              fontWeight: 600,
              fontSize: '0.75rem',
              color: theme.palette.mode === 'dark' ? 'text.primary' : 'common.white',
              mb: 0.25,
              display: { xs: 'block', sm: 'none' } // Show only on xs
            }}
          >
            {localStorage.getItem('companyName') || 'Company'}
          </Typography>
          
          <Chip
            label={localStorage.getItem('branch') || 'Branch'}
            size="small"
            color="primary"
            sx={{
              fontSize: '0.7rem',
              height: 22,
              px: 0.5,
              fontWeight: 500,
              maxWidth: '100%',
              '& .MuiChip-label': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                px: 0.5
              },
              display: { xs: 'none', sm: 'flex' } // Hide on xs, show on sm and above
            }}
          />
        </Box>
      </Box>

      {/* Right: Actions */}
      <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1 }}>
        <NotificationSection />
        <ProfileSection />
      </Stack>

      {/* Logo Preview Modal */}
      <Modal
        open={logoPreviewOpen}
        onClose={() => setLogoPreviewOpen(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}
      >
        <Box
          sx={{
            width: { xs: 150, sm: 200 },
            height: { xs: 150, sm: 200 },
            borderRadius: '50%',
            overflow: 'hidden',
            bgcolor: 'background.paper',
            boxShadow: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1
          }}
        >
          {logo?.[0]?.companyLogo && (
            <img
              src={`data:image/png;base64,${logo[0]?.companyLogo}`}
              alt="Company Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          )}
        </Box>
      </Modal>
    </>
  );
};

Header.propTypes = {
  handleLeftDrawerToggle: PropTypes.func
};

export default Header;