import PropTypes from 'prop-types';

// material-ui
import { Avatar, Box, ButtonBase, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
import LogoSection from '../LogoSection';
import NotificationSection from './NotificationSection';
import ProfileSection from './ProfileSection';
import SearchSection from './SearchSection';

// assets
import { IconMenu2, IconSun, IconMoon } from '@tabler/icons-react';
// import GlobalSection from './GlobalSection';

// ==============================|| MAIN NAVBAR / HEADER ||============================== //

const Header = ({ handleLeftDrawerToggle }) => {
  const theme = useTheme();

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
        <ButtonBase sx={{ borderRadius: '12px', overflow: 'hidden' }}>
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
      {/* Right Side Actions */}
      <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }}>
        {/* Theme Toggle Button */}
        <ButtonBase sx={{ borderRadius: '12px', overflow: 'hidden' }}>
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
        </ButtonBase>

        

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