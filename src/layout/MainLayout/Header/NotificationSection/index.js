import { useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  CardActions,
  Chip,
  ClickAwayListener,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Popper,
  Stack,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PerfectScrollbar from 'react-perfect-scrollbar';
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import NotificationList from './NotificationList';
import { IconBell, IconX } from '@tabler/icons-react';

const notifications = [
  { name: 'John Doe', expenceId: 'EXP123', docDate: '2024-11-12', amount: 2500.5, currency: 'USD', heading: 'TAX INVOICE' },
  { name: 'Jane Smith', expenceId: 'EXP124', docDate: '2024-11-13', amount: 1750.75, currency: 'EUR', heading: 'IRN CREDIT NOTE' },
  // Add more notifications as needed
];

const Index = () => {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const handleViewAll = () => {
    setOpen(false); // Close the popover
    setModalOpen(true); // Open the modal
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Box sx={{ ml: 2, [theme.breakpoints.down('md')]: { mr: 2 } }}>
        <ButtonBase sx={{ borderRadius: '12px' }}>
          <Avatar
            variant="rounded"
            sx={{
              ...theme.typography.commonAvatar,
              ...theme.typography.mediumAvatar,
              transition: 'all .2s ease-in-out',
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.primary.dark,
              '&:hover': {
                background: `${theme.palette.primary.main}!important`,
                color: theme.palette.primary.light
              }
            }}
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
          >
            <IconBell stroke={1.5} size="1.3rem" />
          </Avatar>
        </ButtonBase>
      </Box>
      
      {/* Popover for notifications */}
      <Popper
        placement={matchesXs ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{ modifiers: [{ name: 'offset', options: { offset: [matchesXs ? 5 : 0, 20] } }] }}
      >
        {({ TransitionProps }) => (
          <Transitions position={matchesXs ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                  <Grid container direction="column" spacing={2}>
                    <Grid item xs={12}>
                      <Grid container alignItems="center" justifyContent="space-between" sx={{ pt: 2, px: 2 }}>
                        <Grid item>
                          <Stack direction="row" spacing={2}>
                            <Typography variant="subtitle1">Notifications</Typography>
                            <Chip 
                              size="small" 
                              label={notifications.length} 
                              sx={{ 
                                color: theme.palette.background.default, 
                                bgcolor: theme.palette.warning.dark 
                              }} 
                            />
                          </Stack>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <PerfectScrollbar style={{ 
                        height: '100%', 
                        maxHeight: 'calc(100vh - 205px)', 
                        overflowX: 'hidden' 
                      }}>
                        <NotificationList notifications={notifications.slice(0, 5)} />
                      </PerfectScrollbar>
                    </Grid>
                  </Grid>
                  <Divider />
                  <CardActions sx={{ p: 1.25, justifyContent: 'center' }}>
                    <Button size="small" disableElevation onClick={handleViewAll}>
                      View All
                    </Button>
                  </CardActions>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>

      {/* Modal for all notifications */}
      <Dialog
        open={modalOpen}
        onClose={handleModalClose}
        fullWidth
        maxWidth="sm"
        aria-labelledby="notification-modal-title"
      >
        <DialogTitle id="notification-modal-title">
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5">All Notifications</Typography>
            <IconButton onClick={handleModalClose}>
              <IconX />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <PerfectScrollbar style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <NotificationList notifications={notifications} />
          </PerfectScrollbar>
        </DialogContent>
        <CardActions sx={{ p: 1.25, justifyContent: 'center' }}>
          <Button variant="contained" onClick={handleModalClose}>
            Close
          </Button>
        </CardActions>
      </Dialog>
    </>
  );
};

export default Index;