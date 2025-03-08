import Axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setUserRole } from 'store/actions';
import { encryptPassword } from 'views/utilities/passwordEnc';

// material-ui
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
  Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// third party
import { Formik } from 'formik';
import * as Yup from 'yup';

// project imports
import useScriptRef from 'hooks/useScriptRef';
import AnimateButton from 'ui-component/extended/AnimateButton';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { setUser } from '../../../../redux/userSlice';

const FirebaseLogin = ({ ...others }) => {
  const theme = useTheme();
  const scriptedRef = useScriptRef();
  const [checked, setChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const formikRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  useEffect(() => {
    const storedCredentials = localStorage.getItem('rememberedCredentials');
    if (storedCredentials) {
      const { email, password } = JSON.parse(storedCredentials);
      formikRef.current.setValues({ email, password });
      setChecked(true);
    }
  }, []);

  const resetForm = () => {
    if (formikRef.current) {
      formikRef.current.resetForm({
        values: {
          email: '',
          password: ''
        }
      });
    }
  };

  const loginAPICall = async (values) => {
    const userData = {
      password: encryptPassword(values.password),
      userName: values.email
    };

    try {
      const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, userData, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('wer', response);

      if (response.data.status) {
        dispatch(setUser({ orgId: response.data.paramObjectsMap.userVO.orgId }));
        localStorage.setItem('orgId', response.data.paramObjectsMap.userVO.orgId);
        localStorage.setItem('userId', response.data.paramObjectsMap.userVO.usersId);
        localStorage.setItem('token', response.data.paramObjectsMap.userVO.token);
        localStorage.setItem('tokenId', response.data.paramObjectsMap.userVO.tokenId);
        localStorage.setItem('userName', response.data.paramObjectsMap.userVO.userName);
        localStorage.setItem('userType', response.data.paramObjectsMap.userVO.roleVO[0].role);
        localStorage.setItem('employeeCode', response.data.paramObjectsMap.userVO.employeeCode);
        localStorage.setItem('employeeName', response.data.paramObjectsMap.userVO.employeeName);
        // localStorage.setItem('LoginMessage', true);

        // const userRole = response.data.paramObjectsMap.userVO.roleVO;
        // localStorage.setItem('ROLE', userRole);
        const userRole = response.data.paramObjectsMap.userVO.roleVO;
        localStorage.setItem('ROLE', userRole);
        const roleVO = response.data.paramObjectsMap.userVO.roleVO;
        let allScreensVO = [];
        roleVO.forEach((roleObj) => {
          roleObj.responsibilityVO.forEach((responsibility) => {
            if (responsibility.screensVO) {
              allScreensVO = allScreensVO.concat(responsibility.screensVO);
            }
          });
        });
        allScreensVO = [...new Set(allScreensVO)];
        localStorage.setItem('screens', JSON.stringify(allScreensVO));
        dispatch(setUserRole(userRole));
        resetForm();
        navigate('/dashboard/default');
        // window.location.reload();

        setTimeout(() => {
          window.location.reload();
        }, 50);

        if (checked) {
          localStorage.setItem('rememberedCredentials', JSON.stringify({ email: values.email, password: values.password }));
        } else {
          localStorage.removeItem('rememberedCredentials');
        }
      } else {
        toast.error(response.data.paramObjectsMap.errorMessage, {
          autoClose: 2000,
          theme: 'colored'
        });
      }
    } catch (error) {
      toast.error('Network Error', {
        autoClose: 2000,
        theme: 'colored'
      });
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 400,
        margin: 'auto',
        borderRadius: 3,
        boxShadow: 'none',
        backgroundColor: theme.palette.background.default
      }}
    >
      <ToastContainer />
      <Formik
        innerRef={formikRef}
        initialValues={{
          email: '',
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().max(255).required('Email / UserName is required'),
          password: Yup.string().max(255).required('Password is required')
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            if (scriptedRef.current) {
              setStatus({ success: true });
              setSubmitting(false);
              loginAPICall(values);
            }
          } catch (err) {
            console.error(err);
            if (scriptedRef.current) {
              setStatus({ success: false });
              setErrors({ submit: err.message });
              setSubmitting(false);
            }
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit} {...others}>
            <FormControl fullWidth error={Boolean(touched.email && errors.email)} sx={{ mb: 2 }}>
              <InputLabel htmlFor="outlined-adornment-email-login">Email Address / Username</InputLabel>
              <OutlinedInput
                id="outlined-adornment-email-login"
                type="email"
                value={values.email}
                name="email"
                onBlur={handleBlur}
                onChange={handleChange}
                label="Email Address / Username"
              />
              {touched.email && errors.email && <FormHelperText error>{errors.email}</FormHelperText>}
            </FormControl>

            <FormControl fullWidth error={Boolean(touched.password && errors.password)} sx={{ mb: 2 }}>
              <InputLabel htmlFor="outlined-adornment-password-login">Password</InputLabel>
              <OutlinedInput
                id="outlined-adornment-password-login"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                name="password"
                onBlur={handleBlur}
                onChange={handleChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end" size="large">
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
              />
              {touched.password && errors.password && <FormHelperText error>{errors.password}</FormHelperText>}
            </FormControl>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} name="checked" color="primary" />
                }
                label="Remember me"
              />
              <Typography variant="subtitle2" color="primary" sx={{ cursor: 'pointer' }}>
                Forgot Password?
              </Typography>
            </Stack>

            {errors.submit && (
              <Box sx={{ mb: 2 }}>
                <FormHelperText error>{errors.submit}</FormHelperText>
              </Box>
            )}

            <AnimateButton>
              <Button
                disableElevation
                disabled={isSubmitting}
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                color="primary"
                style={{ backgroundColor: '#673AB7' }}
              >
                Sign in
              </Button>
            </AnimateButton>
          </form>
        )}
      </Formik>
    </Paper>
  );
};

export default FirebaseLogin;
