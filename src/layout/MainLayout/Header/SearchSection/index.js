import PropTypes from 'prop-types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Material-UI components
import {
  Avatar,
  Box,
  ButtonBase,
  Card,
  Grid,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  OutlinedInput,
  Paper,
  Popper
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

// Third-party components
import PopupState, { bindPopper, bindToggle } from 'material-ui-popup-state';

// Project imports
import Transitions from 'ui-component/extended/Transitions';

// Assets
import { IconAdjustmentsHorizontal, IconSearch, IconX } from '@tabler/icons-react';

// Screens list
const screens = [
  { name: 'Dashboard', path: '/' },
  { name: 'Country', path: '/basicMaster/country' },
  { name: 'State', path: '/basicMaster/state' },
  { name: 'City', path: '/basicMaster/city' },
  { name: 'Currency', path: '/basicMaster/currency' },
  { name: 'Region', path: '/basicMaster/RegionMaster' },
  { name: 'Department', path: '/basicMaster/Department' },
  { name: 'Designation', path: '/basicMaster/Designation' },
  { name: 'Project Master', path: '/basicMaster/ProjectMaster' },
  { name: 'Roles And Responsibilities', path: '/basicMaster/roles' },
  { name: 'Calendar', path: '/calendar' },
  { name: 'Company Setup', path: '/companysetup/companysetup' },
  { name: 'Leave Assigned', path: '/companysetup/LeaveAssigned' },
  { name: 'Screen Names', path: '/companysetup/ScreenNames' },
  { name: 'User Creation', path: '/admin/user-creation/userCreation' },
  { name: 'Employee Details', path: '/employeeMaster/employeeDetails' },
  { name: 'Attendance Process', path: '/employeeMaster/AttendenceProcess' },
  { name: 'Leave Type', path: '/leaveMaster/LeaveType' },
  { name: 'Holidays', path: '/leaveMaster/Holidays' },
  { name: 'Salary Heads', path: '/salaryMaster/salaryHeads' },
  { name: 'Salary Structure', path: '/salaryMaster/SalaryStructure' },
  { name: 'Salary Process', path: '/salaryMaster/SalaryProcess' },
  { name: 'Salary Report', path: '/salaryMaster/SalaryReport' },
  { name: 'Permission Request', path: '/me/permissionRequest' },
  { name: 'Leave Request', path: '/me/leaveRequest' },
  { name: 'Holiday Report', path: '/me/HolidayReport' },
  { name: 'Check In & Out', path: '/me/SwipeInSwipeOut' },
  { name: 'Time Sheet', path: '/me/TimeSheet' },
  { name: 'Compo Off', path: '/me/CompoOff' },
  { name: 'Payslip', path: '/finance/payslip' },
  { name: 'Leave Approval', path: '/team/LeaveApproval' },
  { name: 'Permission  Approval', path: '/team/PermissionApproval' },
  { name: 'Attendance Report ', path: '/team/AttendanceReport' },
  { name: 'Today Attendance ', path: '/team/TodayAttendance' },
  { name: 'Over All Task Report', path: '/team/OverAllReport' }
];


// Styled Components
const PopperStyle = styled(Popper)(({ theme }) => ({
  zIndex: 1300,
  width: '100%',
  marginTop: theme.spacing(1),
  position: 'absolute',
  padding: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1)
  }
}));

const OutlineInputStyle = styled(OutlinedInput)(({ theme }) => ({
  width: 434,
  marginLeft: 16,
  paddingLeft: 16,
  paddingRight: 16,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  '& input': {
    background: 'transparent !important',
    paddingLeft: '4px !important'
  },
  [theme.breakpoints.down('lg')]: {
    width: 250
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
    marginLeft: 4
  }
}));

const HeaderAvatarStyle = styled(Avatar)(({ theme }) => ({
  ...theme.typography.commonAvatar,
  ...theme.typography.mediumAvatar,
  background: theme.palette.secondary.light,
  color: theme.palette.secondary.dark,
  '&:hover': {
    background: theme.palette.secondary.dark,
    color: theme.palette.secondary.light
  }
}));

const SearchResultsPaper = styled(Paper)(({ theme }) => ({
  maxHeight: 300,
  overflowY: 'auto',
  boxShadow: theme.shadows[5],
  borderRadius: theme.shape.borderRadius
}));

// Mobile Search
const MobileSearch = ({ value, setValue, popupState }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleSearch = (screen) => {
    navigate(screen.path);
    setValue('');
    popupState.close();
  };

  const filteredScreens = screens.filter((screen) =>
    screen.name.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <>
      <OutlineInputStyle
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search"
        startAdornment={
          <InputAdornment position="start">
            <IconSearch stroke={1.5} size="1rem" color={theme.palette.grey[500]} />
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end">
            <ButtonBase onClick={() => popupState.close()}>
              <Avatar
                variant="rounded"
                sx={{
                  background: theme.palette.orange.light,
                  color: theme.palette.orange.dark,
                  '&:hover': {
                    background: theme.palette.orange.dark,
                    color: theme.palette.orange.light
                  }
                }}
              >
                <IconX stroke={1.5} size="1.3rem" />
              </Avatar>
            </ButtonBase>
          </InputAdornment>
        }
        fullWidth
      />
      {value && (
        <SearchResultsPaper sx={{ mt: 1 }}>
          <List>
            {filteredScreens.length > 0 ? (
              filteredScreens.map((screen) => (
                <ListItem key={screen.path} disablePadding>
                  <ListItemButton onClick={() => handleSearch(screen)}>
                    <ListItemText primary={screen.name} />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No results found" />
              </ListItem>
            )}
          </List>
        </SearchResultsPaper>
      )}
    </>
  );
};

MobileSearch.propTypes = {
  value: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired,
  popupState: PropTypes.object.isRequired
};

// Desktop Search
const DesktopSearch = ({ value, setValue }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleSearch = (screen) => {
    navigate(screen.path);
    setValue('');
    window.location.reload(); // Optional
  };

  const filteredScreens = screens.filter((screen) =>
    screen.name.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <Box sx={{ position: 'relative' }}>
      <OutlineInputStyle
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search"
        startAdornment={
          <InputAdornment position="start">
            <IconSearch stroke={1.5} size="1rem" color={theme.palette.grey[500]} />
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end">
            <ButtonBase>
              <HeaderAvatarStyle variant="rounded">
                <IconAdjustmentsHorizontal stroke={1.5} size="1.3rem" />
              </HeaderAvatarStyle>
            </ButtonBase>
          </InputAdornment>
        }
      />
      {value && (
        <SearchResultsPaper sx={{ position: 'absolute', top: '100%', left: 0, right: 0, mt: 1, ml: 2, zIndex: 1600 }}>
          <List>
            {filteredScreens.length > 0 ? (
              filteredScreens.map((screen) => (
                <ListItem key={screen.path} disablePadding>
                  <ListItemButton onClick={() => handleSearch(screen)}>
                    <ListItemText primary={screen.name} />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No results found" />
              </ListItem>
            )}
          </List>
        </SearchResultsPaper>
      )}
    </Box>
  );
};

DesktopSearch.propTypes = {
  value: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired
};

// Main SearchSection
const SearchSection = () => {
  const [value, setValue] = useState('');
  const theme = useTheme();

  return (
    <>
      {/* Mobile */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, width: '100%' }}>
        <PopupState variant="popper" popupId="mobile-search-popper">
          {(popupState) => (
            <>
              <Box sx={{ ml: 2 }}>
                <ButtonBase>
                  <HeaderAvatarStyle variant="rounded" {...bindToggle(popupState)}>
                    <IconSearch stroke={1.5} size="1.2rem" />
                  </HeaderAvatarStyle>
                </ButtonBase>
              </Box>
              <PopperStyle {...bindPopper(popupState)} transition placement="bottom-start">
                {({ TransitionProps }) => (
                  <Transitions type="zoom" {...TransitionProps}>
                    <Card sx={{ width: '100%' }}>
                      <Box sx={{ p: 1 }}>
                        <MobileSearch value={value} setValue={setValue} popupState={popupState} />
                      </Box>
                    </Card>
                  </Transitions>
                )}
              </PopperStyle>
            </>
          )}
        </PopupState>
      </Box>

      {/* Desktop */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'relative' }}>
        <DesktopSearch value={value} setValue={setValue} />
      </Box>
    </>
  );
};

export default SearchSection;
