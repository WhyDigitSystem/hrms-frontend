import PropTypes from 'prop-types';

// material-ui
import { Avatar, Box, ButtonBase, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
import LogoSection from '../LogoSection';
import NotificationSection from './NotificationSection';
import ProfileSection from './ProfileSection';
import SearchSection from './SearchSection';

// assets
import { IconMenu2 } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';


// ==============================|| MAIN NAVBAR / HEADER ||============================== //

const Header = ({ handleLeftDrawerToggle }) => {
  const [logo, setLogo] = useState(null);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const theme = useTheme();

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
      console.log('API Response:', response);

      if (response.status === true) {
        const particularCompany = response.paramObjectsMap.companyVO[0];
        setLogo(response.paramObjectsMap.companyVO);
        console.log('THE LISTVIEW COMPANY IS:', particularCompany);
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
        <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
          <LogoSection />
        </Box>
        <ButtonBase
          sx={{
            borderRadius: '12px',
            overflow: 'hidden',
            display: { xs: 'inline-flex', sm: 'none' }
          }}>
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


      {/* <company Logo */}
      <div className="mt-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'end', width: 400 }}>
        <Avatar
          sx={{
            fontSize: "16px",
            width: "100px", // Adjust size as needed
            height: "75px",
            fontWeight: "bold",
            // border: "2px solid white",
            // boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.15)",
            marginRight: "5px",
            marginTop: "-10px",
            backgroundColor: "transparent" 
          }}
        >
          {logo && logo[0]?.companyLogo ? (
            <img
              src={`data:image/png;base64,${logo[0].companyLogo}`}
              alt="Company Logo"
              style={{ width: "100%", height: "100%", objectFit: "contain", }}
            />
          ) : (
            "Upload Logo"
          )}
          <input type="file" hidden accept="image/png, image/jpeg" onChange={handleLogoChange} />
        </Avatar>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h6 style={{ marginTop: '-12px', marginBottom: 1, color:'white' }}>
            {localStorage.getItem('companyName')}
          </h6>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Chip
              label={`${localStorage.getItem('branch')}`}
              size="small"
              color="primary"
              sx={{ fontSize: '11px', height: '20px' }}
            />
          </div>

        </div>
      </div>

      <NotificationSection />
      <ProfileSection />
    </>
  );
};

Header.propTypes = {
  handleLeftDrawerToggle: PropTypes.func
};

export default Header;
