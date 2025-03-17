import PropTypes from 'prop-types';

// material-ui
import { Avatar, Box, List, ListItem, ListItemAvatar, ListItemText, Typography, Button, IconButton, Divider } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import TotalIncomeCard from 'ui-component/cards/Skeleton/TotalIncomeCard';

// assets
import StorefrontTwoToneIcon from '@mui/icons-material/StorefrontTwoTone';
import AddIcon from '@mui/icons-material/Add';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentIcon from '@mui/icons-material/Comment';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

// styles
const CardWrapper = styled(MainCard)(({ theme }) => ({
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[4],
}));

// Dummy data for announcements (without "Office Holiday")
const dummyAnnouncements = [
  {
    id: 1,
    title: 'New Product Launch',
    description: 'We are excited to announce the launch of our new product line!',
    date: '2 hours ago',
    icon: <StorefrontTwoToneIcon />
  },
  {
    id: 3,
    title: 'Team Meeting',
    description: 'A team meeting is scheduled for Friday at 10 AM. Please be present.',
    date: '3 days ago',
    icon: <StorefrontTwoToneIcon />
  }
];

// ==============================|| DASHBOARD - TOTAL INCOME LIGHT CARD ||============================== //

const Announcements = ({ isLoading }) => {
  const theme = useTheme();

  return (
    <>
      {isLoading ? (
        <TotalIncomeCard />
      ) : (
        <CardWrapper border={false} content={false}>
          <Box sx={{ p: 2, position: 'relative' }}>
            <Typography variant="h4" sx={{ mb: 2, color: theme.palette.text.primary }}>
              Announcements
            </Typography>
            <List sx={{ py: 0 }}>
              {dummyAnnouncements.map((announcement) => (
                <Box key={announcement.id}>
                  <ListItem alignItems="flex-start" disableGutters sx={{ py: 1 }}>
                    <ListItemAvatar>
                      <Avatar
                        variant="rounded"
                        sx={{
                          ...theme.typography.commonAvatar,
                          ...theme.typography.largeAvatar,
                          backgroundColor: theme.palette.primary.light,
                          color: theme.palette.primary.dark
                        }}
                      >
                        {announcement.icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                          {announcement.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            {announcement.description}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mt: 0.5 }}>
                            {announcement.date}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider sx={{ my: 1, backgroundColor: theme.palette.divider }} />
                </Box>
              ))}
            </List>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Box>
                <IconButton color="primary" aria-label="add news">
                  <AddIcon />
                </IconButton>
                <IconButton color="primary" aria-label="like">
                  <ThumbUpIcon />
                </IconButton>
                <IconButton color="primary" aria-label="comment">
                  <CommentIcon />
                </IconButton>
              </Box>
              <Button variant="text" color="primary" endIcon={<MoreHorizIcon />}>
                View More
              </Button>
            </Box>
          </Box>
        </CardWrapper>
      )}
    </>
  );
};

Announcements.propTypes = {
  isLoading: PropTypes.bool
};

export default Announcements;
