import { useEffect, useState } from 'react';

// material-ui
import { Grid } from '@mui/material';

// project imports
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { gridSpacing } from 'store/constant';
import EarningCard from './EarningCard';
// import PopularCard from './PopularCard';
import TotalGrowthBarChart from './TotalGrowthBarChart';
import TotalIncomeDarkCard from './TotalIncomeDarkCard';
import TotalIncomeLightCard from './TotalIncomeLightCard';

import TotalOrderLineChartCard from './TotalOrderLineChartCard';
import CurrencyExchangeRates from './ExRateDash';
import UpcomingHolidayCard from './UpcomingHolidayCard';
import LeaveBalance from './LeaveBalance';
import CheckinDetails from './CheckinDetails';
import Announcement from './Announcements/Announcements';
import Organization from './Organization';
import Inbox from './Inbox';
import TimeDate from './TimeDate';
import BirthdayNews from './BirthdayNews'
import Main from './SocialMedia/Main'
import Home from './Announcements/Home'


// ==============================|| DEFAULT DASHBOARD ||============================== //

const Dashboard = () => {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    if (localStorage.getItem('LoginMessage') === 'true') {
      toast.success('Login Successful, Welcome!', {
        autoClose: 2000,
        theme: 'colored'
      });

      // Set loginMessage to false after 2 seconds
      const timeoutId = setTimeout(() => {
        localStorage.setItem('LoginMessage', false);
      }, 2000);

      // setTimeout(() => {
      //   window.location.reload();
      // }, 2000);

      // Clear the timeout on component unmount to prevent memory leaks
      return () => clearTimeout(timeoutId);
    }
  }, []);

  return (
    <Grid container spacing={gridSpacing}>
      {/* <div>
        <ToastContainer /> 
      </div> */}
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing} sx={{ pt: { lg: 2, xs: 0 } }}>
          <Grid item lg={6} md={12} sm={12} xs={12} >
            <CheckinDetails isLoading={isLoading} />
            <TimeDate isLoading={isLoading} />
          </Grid>
          <Grid item sm={12} xs={12} md={12} lg={6}>
            <Main isLoading={isLoading} />
          </Grid>
          <Grid item lg={6} md={12} sm={12} xs={12}>
            <UpcomingHolidayCard isLoading={isLoading} />
          </Grid>
          <Grid item lg={6} md={12} sm={12} xs={12}>
            <Home />
          </Grid>
          <Grid item lg={6} md={12} sm={12} xs={12}>
            <BirthdayNews isLoading={isLoading} />
          </Grid>
          <Grid item lg={6} md={12} sm={12} xs={12}>
            <Inbox isLoading={isLoading} />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing} sx={{ pt: { lg: 2, xs: 0 } }}>
          <Grid item lg={6} md={12} sm={12} xs={12} >
            {/* <BirthdayNews isLoading={isLoading} /> */}
          </Grid>
          <Grid item sm={12} xs={12} md={12} lg={6}>
            {/* <Organization isLoading={isLoading} /> */}
            {/* <UpcomingHolidayCard isLoading={isLoading} /> */}
          </Grid>
          <Grid item lg={6} md={12} sm={12} xs={12}>
            {/* <UpcomingHolidayCard isLoading={isLoading} /> */}
          </Grid>
          <Grid item lg={6} md={12} sm={12} xs={12}>
            {/* <LeaveBalance isLoading={isLoading} /> */}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
