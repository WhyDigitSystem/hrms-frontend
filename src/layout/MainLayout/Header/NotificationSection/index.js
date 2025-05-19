import { useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  ButtonBase,
  Paper,
  Popper,
  Tooltip,
  useMediaQuery,
  useTheme,
  GlobalStyles
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Transitions from 'ui-component/extended/Transitions';
import NotificationList from './NotificationList';
import { IconBell } from '@tabler/icons-react';
import apiCalls from 'apicall';

const pulseAnimation = {
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.1)' },
    '100%': { transform: 'scale(1)' }
  }
};

const customTheme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: pulseAnimation
    }
  }
});

const Index = () => {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const [open, setOpen] = useState(false);
  const [approvalCount, setApprovalCount] = useState('0');
  const [listViewData, setListViewData] = useState([]);

  const anchorRef = useRef(null);
  const prevOpen = useRef(open);

  // Get org details from localStorage
  const orgId = localStorage.getItem('orgId');
  const branchCode = localStorage.getItem('branchCode');

  // Handle reportingPersonCode fallback
  let reportingPersonCode = localStorage.getItem('reportingPersonCode');
  if (!reportingPersonCode || reportingPersonCode === 'null') {
    reportingPersonCode = localStorage.getItem('employeeCode') || '';
  }

  const handleToggle = () => setOpen((prev) => !prev);

  const handleClose = (event) => {
    if (anchorRef.current?.contains(event.target)) return;
    setOpen(false);
  };

  const fetchApprovalData = async () => {
    try {
      console.log('Fetching with:', { orgId, branchCode, reportingPersonCode });

      const response = await apiCalls(
        'get',
        `/basicmaster/getApprovalPendingCountForDashBoard?branchCode=${branchCode}&orgId=${orgId}&reportingPersonCode=${reportingPersonCode}`
      );

      console.log('API response:', response);

      const approvalCountData = response?.paramObjectsMap?.approvalCount;
      const count = approvalCountData?.[0]?.count || '0';
      setApprovalCount(count);
      setListViewData([]); // No list data from this API
    } catch (error) {
      console.error('Error fetching approval count:', error);
      setApprovalCount('0');
      setListViewData([]);
    }
  };

  useEffect(() => {
    fetchApprovalData();
    const interval = setInterval(fetchApprovalData, 300000); // every 5 minutes
    return () => clearInterval(interval);
  }, [orgId, branchCode, reportingPersonCode]);

  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current?.focus();
    }
    prevOpen.current = open;
  }, [open]);

  return (
    <ThemeProvider theme={customTheme}>
      <GlobalStyles styles={pulseAnimation} />
      <Box sx={{ ml: 2, [theme.breakpoints.down('md')]: { mr: 2 } }}>
        <Tooltip title={approvalCount !== '0' ? `${approvalCount} Pending Approvals` : 'No Pending Approvals'}>
          <ButtonBase
            sx={{
              borderRadius: '12px',
              position: 'relative',
              '&:hover': {
                '& .notification-badge': {
                  transform: 'scale(1.15) rotate(-15deg)'
                }
              }
            }}
          >
            <Avatar
              variant="rounded"
              sx={{
                ...theme.typography.commonAvatar,
                ...theme.typography.mediumAvatar,
                transition: 'all .2s ease-in-out',
                bgcolor: theme.palette.primary.light,
                color: theme.palette.primary.dark,
                '&:hover': {
                  bgcolor: `${theme.palette.primary.main}!important`,
                  color: theme.palette.primary.light
                }
              }}
              ref={anchorRef}
              aria-controls={open ? 'menu-list-grow' : undefined}
              aria-haspopup="true"
              onClick={handleToggle}
            >
              <IconBell stroke={1.5} size="1.3rem" />
              {approvalCount !== '0' && (
                <Box
                  className="notification-badge"
                  sx={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    bgcolor: theme.palette.error.main,
                    color: theme.palette.error.contrastText,
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    border: `2px solid ${theme.palette.background.default}`,
                    boxShadow: theme.shadows[3],
                    transition: 'all 0.2s ease-in-out',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}
                >
                  {approvalCount}
                </Box>
              )}
            </Avatar>
          </ButtonBase>
        </Tooltip>
      </Box>

      <Popper
        placement={matchesXs ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        transition
        disablePortal
        popperOptions={{
          modifiers: [{ name: 'offset', options: { offset: [matchesXs ? 5 : 0, 20] } }]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions position={matchesXs ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper
              sx={{
                width: matchesXs ? '100vw' : 360,
                maxWidth: '100%',
                boxShadow: theme.shadows[10]
              }}
            >
              <NotificationList data={listViewData} />
            </Paper>
          </Transitions>
        )}
      </Popper>
    </ThemeProvider>
  );
};

export default Index;
