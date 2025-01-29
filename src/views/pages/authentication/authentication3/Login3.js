import { Link } from 'react-router-dom';

// material-ui
import { Chip, Divider, Grid, Stack, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
import LogoImage from '../../../../assets/images/Why-Digit-Systems-Pvt-Ltd.png';
import AuthCardWrapper from '../AuthCardWrapper';
import AuthWrapper1 from '../AuthWrapper1';
import AuthLogin from '../auth-forms/AuthLogin';

// ================================|| AUTH3 - LOGIN ||================================ //

const bevanRegularStyle = {
  fontFamily: "'Bevan', serif",
  fontWeight: 300,
  fontStyle: 'normal',
  fontSize: 25,
  color: '#673ab7',
};

const Login = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AuthWrapper1>
      <Grid
        container
        direction="column"
        justifyContent="flex-end"
        sx={{
          minHeight: '100vh',
          overflow: 'hidden', // Hide any overflow on the main container
        }}
      >
        <Grid item xs={12}>
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            sx={{
              minHeight: 'calc(100vh - 68px)',
              overflow: 'hidden', // Hide overflow here as well
            }}
          >
            <Grid
              item
              sx={{ m: { xs: 1, sm: 3 }, mb: 0, p: 0 }}
              className="css-1arlb8v css-1irzm6x-MuiGrid-root"
            >
              <AuthCardWrapper>
                <Grid container direction="column" spacing={2} alignItems="center" justifyContent="center">
                  <Grid item sx={{ mt: 2 }}>
                    <Link to="#">
                      <img
                        src={LogoImage}
                        alt="logo"
                        style={{
                          width: '150px',
                          height: 'auto',
                        }}
                      />
                    </Link>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid
                      container
                      direction={matchDownSM ? 'column-reverse' : 'row'}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Grid item>
                        <Stack alignItems="center" justifyContent="center" spacing={1}>
                          <Stack alignItems="center" justifyContent="center" spacing={1}>
                            <Typography
                              style={bevanRegularStyle}
                              color={theme.palette.secondary.main}
                              gutterBottom
                              variant={matchDownSM ? 'h5' : 'h4'}
                            >
                              Hi, Welcome Back
                            </Typography>
                            <Typography
                              variant="caption"
                              fontSize="14px"
                              textAlign={matchDownSM ? 'center' : 'inherit'}
                            >
                              Enter your credentials to continue
                            </Typography>
                          </Stack>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sx={{ marginBottom: 0, paddingBottom: 0 }}>
                    <AuthLogin />
                  </Grid>
                  <Grid item xs={12} sx={{ marginBottom: 0, paddingBottom: 0 }}>
                    <Grid item container direction="column" alignItems="center" xs={12}>
                      <Typography
                        component={Link}
                        to="/pages/register/register3"
                        variant="subtitle1"
                        sx={{ textDecoration: 'none', marginTop: 0 }}
                      >
                        Don&apos;t have an account?
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ display: 'none' }} />
                  </Grid>
                  <Stack direction="row" justifyContent="center" sx={{ mb: 1, mt: 1 }}>
                    <Chip
                      label="©  2025 Why Digit System Private Limited." // Updated version content
                      disabled
                      chipcolor="secondary"
                      size="small"
                      sx={{ cursor: 'pointer' }}
                    />
                  </Stack>
                </Grid>
              </AuthCardWrapper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </AuthWrapper1>
  );
};

export default Login;
