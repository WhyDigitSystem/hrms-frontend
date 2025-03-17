import PropTypes from 'prop-types';

// material-ui
import { Avatar, Box, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import TotalIncomeCard from 'ui-component/cards/Skeleton/TotalIncomeCard';

// assets
import StorefrontTwoToneIcon from '@mui/icons-material/StorefrontTwoTone';

// Updated image path
const InboxImage = '/assets/inbox-image.png'; // Change this path based on your project structure

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

// ==============================|| DASHBOARD - INBOX CARD ||============================== //

const Inbox = ({ isLoading }) => {
  const theme = useTheme();

  return (
    <>
      {isLoading ? (
        <TotalIncomeCard />
      ) : (
        <CardWrapper border={false} content={false}>
          <Box sx={{ p: 2 }}>
            {/* Heading for Inbox */}
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', fontSize: '1rem' }}>
              Inbox
            </Typography>

            <List sx={{ py: 0 }}>
              {/* Additional List Items for more content */}
              <ListItem alignItems="center" disableGutters sx={{ py: 0 }}>
                <ListItemText
                  sx={{
                    py: 0,
                    mt: 0.45,
                    mb: 0.45
                  }}
                  primary={
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                      New Orders
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: theme.palette.grey[500],
                        mt: 0.5,
                        fontSize: '1rem'
                      }}
                    >
                      15 new orders received
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem alignItems="center" disableGutters sx={{ py: 0 }}>
                <ListItemText
                  sx={{
                    py: 0,
                    mt: 0.45,
                    mb: 0.45
                  }}
                  primary={
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                      Pending Orders
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: theme.palette.grey[500],
                        mt: 0.5,
                        fontSize: '1rem'
                      }}
                    >
                      5 orders pending
                    </Typography>
                  }
                />
              </ListItem>
            </List>
            {/* Image Section */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <img src={InboxImage} alt="Inbox" style={{ width: '100%', borderRadius: '8px' }} />
            </Box>
          </Box>
        </CardWrapper>
      )}
    </>
  );
};

Inbox.propTypes = {
  isLoading: PropTypes.bool
};

export default Inbox;