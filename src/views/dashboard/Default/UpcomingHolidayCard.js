import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Divider,
  Grid,
  Button
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import TotalIncomeCard from 'ui-component/cards/Skeleton/TotalIncomeCard';

// assets
import EventNoteTwoToneIcon from '@mui/icons-material/EventNoteTwoTone';
import BeachAccessTwoToneIcon from '@mui/icons-material/BeachAccessTwoTone';
import TodayTwoToneIcon from '@mui/icons-material/TodayTwoTone';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

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

const UpcomingLeaveCard = ({ isLoading }) => {
  const theme = useTheme();
  const [openViewMoreModal, setOpenViewMoreModal] = useState(false);

  // Dummy data for listViewData
  const listViewData = [
    { name: 'Eid al-Fitr', date: 'Fri, 21 April, 2025' },
    { name: 'Christmas', date: 'Wed, 25 December, 2025' },
  ];

  return (
    <>
      <style>
        {`
        .css-lvott1{
          height: 355px !important;
        }
      `}
      </style>
      {isLoading ? (
        <TotalIncomeCard />
      ) : (
        <CardWrapper border={false} content={false}>
          <Box sx={{ p: 2, height: '400px', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flex: '0 0 auto' }}>
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
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
                  <TodayTwoToneIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                  <Typography
                    variant="subtitle2"
                    align="center"
                    sx={{
                      color: theme.palette.grey[500],
                      mt: 0.5,
                      fontWeight: 'bold',
                      fontSize: '15px',
                      py: 1,
                      borderRadius: 1
                    }}
                  >
                    Next Leave: Ramzan on Mon, 31 March, 2025
                  </Typography>
                </Box>
              </Grid>
              <Divider sx={{ my: 2 }} />
            </Box>
            <Box sx={{ overflowY: 'auto', flex: '1 1 auto', pr: 1 }}>
              <Typography variant="h6" sx={{ color: theme.palette.grey[700], mb: 1 }}>
                Upcoming Holidays
              </Typography>
              {listViewData.map((holiday, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BeachAccessTwoToneIcon sx={{ color: theme.palette.error.main, mr: 1 }} />
                  <Typography variant="body1" sx={{ color: theme.palette.grey[600] }}>
                    {holiday.name}: {holiday.date}
                  </Typography>
                </Box>
              ))}
            </Box>
            {listViewData.length > 1 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  mt: 2,
                  animation: 'fadeIn 0.5s ease-in-out'
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<MoreHorizIcon />}
                  onClick={() => setOpenViewMoreModal(true)}
                  sx={{
                    background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #2196f3, #3f51b5)'
                    }
                  }}
                >
                  View More
                </Button>
              </Box>
            )}
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