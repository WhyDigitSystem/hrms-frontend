import PropTypes from 'prop-types';

// material-ui
import { Avatar, Box, List, ListItem, ListItemAvatar, ListItemText, Typography, Divider, Grid } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import TotalIncomeCard from 'ui-component/cards/Skeleton/TotalIncomeCard';

// assets
import EventNoteTwoToneIcon from '@mui/icons-material/EventNoteTwoTone';
import BeachAccessTwoToneIcon from '@mui/icons-material/BeachAccessTwoTone';
import LocalActivityTwoToneIcon from '@mui/icons-material/LocalActivityTwoTone';

// styles
const CardWrapper = styled(MainCard)(({ theme }) => ({
  overflow: 'hidden',
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: `linear-gradient(210.04deg, ${theme.palette.warning.dark} -50.94%, rgba(144, 202, 249, 0) 83.49%)`,
    borderRadius: '50%',
    top: -30,
    right: -180
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: `linear-gradient(140.9deg, ${theme.palette.warning.dark} -14.02%, rgba(144, 202, 249, 0) 70.50%)`,
    borderRadius: '50%',
    top: -160,
    right: -130
  }
}));

// ==============================|| DASHBOARD - UPCOMING LEAVE CARD ||============================== //

const UpcomingLeaveCard = ({ isLoading }) => {
  const theme = useTheme();

  return (
    <>
      {isLoading ? (
        <TotalIncomeCard />
      ) : (
        <CardWrapper border={false} content={false}>
          <Box sx={{ p: 2 }}>
            <List sx={{ py: 0 }}>
              <ListItem alignItems="center" disableGutters sx={{ py: 0 }}>
                <ListItemAvatar>
                  <Avatar
                    variant="rounded"
                    sx={{
                      ...theme.typography.commonAvatar,
                      ...theme.typography.largeAvatar,
                      backgroundColor: theme.palette.warning.light,
                      color: theme.palette.warning.dark
                    }}
                  >
                    <EventNoteTwoToneIcon fontSize="inherit" />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  sx={{
                    py: 0,
                    mt: 0.45,
                    mb: 0.45
                  }}
                  primary={<Typography variant="h4">Upcoming Leave</Typography>}
                />
              </ListItem>
            </List>
            <Divider sx={{ my: 1.5 }} />
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Typography
                variant="subtitle2"
                align="center"
                sx={{
                  color: theme.palette.grey[500],
                  mt: 0.5,
                  width: '100%',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  py: 1,
                  borderRadius: 1
                }}
              >
                Next Leave: Ramzan on Mon, 31 March, 2025
              </Typography>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ color: theme.palette.grey[700], mb: 1 }}>
                Upcoming Holidays
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalActivityTwoToneIcon sx={{ color: theme.palette.error.main, mr: 1 }} />
                <Typography variant="body1" sx={{ color: theme.palette.grey[600] }}>
                  Eid al-Fitr: Fri, 21 April, 2025
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalActivityTwoToneIcon sx={{ color: theme.palette.error.main, mr: 1 }} />
                <Typography variant="body1" sx={{ color: theme.palette.grey[600] }}>
                  Christmas: Wed, 25 December, 2025
                </Typography>
              </Box>
              {/* Add two more holidays here */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalActivityTwoToneIcon sx={{ color: theme.palette.error.main, mr: 1 }} />
                <Typography variant="body1" sx={{ color: theme.palette.grey[600] }}>
                  New Year's Day: Wed, 1 January, 2026
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalActivityTwoToneIcon sx={{ color: theme.palette.error.main, mr: 1 }} />
                <Typography variant="body1" sx={{ color: theme.palette.grey[600] }}>
                  Labour Day: Thu, 1 May, 2025
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardWrapper>
      )}
    </>
  );
};

UpcomingLeaveCard.propTypes = {
  isLoading: PropTypes.bool
};

export default UpcomingLeaveCard;