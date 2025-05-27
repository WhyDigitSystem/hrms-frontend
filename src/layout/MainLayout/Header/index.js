import PropTypes from 'prop-types';

// material-ui
import { Avatar, Box, ButtonBase, Stack, Typography, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
import LogoSection from '../LogoSection';
import NotificationSection from './NotificationSection';
import ProfileSection from './ProfileSection';
import SearchSection from './SearchSection';

// assets
import { IconMenu2, IconSun, IconMoon } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';
// import GlobalSection from './GlobalSection';

// ==============================|| MAIN NAVBAR / HEADER ||============================== //

const Header = ({ handleLeftDrawerToggle }) => {
  const theme = useTheme();
  const [logo, setLogo] = useState(null);
  const [orgId] = useState(localStorage.getItem('orgId'));


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
        const particularCompany = response.paramObjectsMap.companyVO[0];
        setLogo(response.paramObjectsMap.companyVO);
        console.log('Company Details:', particularCompany);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <>
      {/* logo & toggler button */}
      <Box
        sx={{
          width: 228,
          display: 'flex',
          [theme.breakpoints.down('md')]: {
            width: 'auto'
          }
        }}
      >
        {/* <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
          <LogoSection />
        </Box> */}
        <Box component="span" sx={{ display: { xs: 'none', sm: 'none', md: 'block' }, flexGrow: 1 }}>
          <LogoSection />
        </Box>

        <ButtonBase
          sx={{
            borderRadius: '12px',
            overflow: 'hidden',
            display: { xs: 'inline-flex', sm: 'none' } // Visible only on xs (mobile), hidden on sm and up
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

      {/* header search */}
      <SearchSection />

      <Box sx={{ flexGrow: 1 }} />

      {/* Company logo */}
      <Box
        sx={{
          display: {
            xs: logo && logo[0]?.companyLogo ? 'none' : 'flex',
            sm: 'flex'
          },
          flexDirection: 'column',
          alignItems: { xs: 'center', sm: 'flex-start' },
          alignItems: 'center',
          justifyContent: { xs: 'center', md: 'flex-end' },
          width: { xs: '100%', md: 400 },
          flexDirection: { xs: 'column', sm: 'row' },
          textAlign: { xs: 'center', sm: 'start' },
          mt: 1,
          mb: { xs: 1, md: 0 },
          gap: 1,
          ps: 2,
        }}
      >
        <Avatar
          sx={{
            fontSize: "16px",
            width: { xs: 80, sm: 100 },
            height: { xs: 60, sm: 75 },
            fontWeight: "bold",
            backgroundColor: "transparent",
            marginRight: { sm: "5px" },
            marginTop: { xs: 0, sm: "-10px" }
          }}
        >
          {logo && logo[0]?.companyLogo ? (
            <img
              src={`data:image/png;base64,${logo[0].companyLogo}`}
              alt="Company Logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            "Upload Logo"
          )}
          <input type="file" hidden accept="image/png, image/jpeg" onChange={handleLogoChange} />
        </Avatar>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', sm: 'flex-start' } }}>
          <Box
            component="h6"
            sx={{
              mt: { xs: 0, sm: '-12px' },
              mb: 0.5,
              fontSize: '14px',
              color: 'white',
              fontWeight: 'bold'
            }}
          >
            {localStorage.getItem('companyName')}
          </Box>
          <Chip
            label={localStorage.getItem('branch')}
            size="small"
            color="primary"
            sx={{ fontSize: '11px', height: '20px' }}
          />
        </Box>
      </Box>


      {/* Right Side Actions */}
      <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }}>
        {/* Theme Toggle Button */}
        {/* <ButtonBase sx={{ borderRadius: '12px', overflow: 'hidden' }}>
          <Avatar
            variant="rounded"
            sx={{
              ...theme.typography.commonAvatar,
              ...theme.typography.mediumAvatar,
              transition: 'all .2s ease-in-out',
              background: theme.palette.primary.light,
              color: theme.palette.primary.dark,
              '&:hover': {
                background: theme.palette.primary.dark,
                color: theme.palette.primary.light
              }
            }}
            color="inherit"
          >
            {theme.palette.mode === 'dark' ? (
              <IconSun stroke={1.5} size="1.3rem" />
            ) : (
              <IconMoon stroke={1.5} size="1.3rem" />
            )}
          </Avatar>
        </ButtonBase> */}

        {/* Notification */}
        <NotificationSection />

        {/* Profile */}
        <ProfileSection />
      </Stack>
    </>
  );
};

Header.propTypes = {
  handleLeftDrawerToggle: PropTypes.func
};

export default Header;