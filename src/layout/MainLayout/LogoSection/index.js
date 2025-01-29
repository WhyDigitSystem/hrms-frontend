import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

// material-ui
import { ButtonBase } from '@mui/material';

// project imports
import { MENU_OPEN } from 'store/actions';
import LogoImage from '../../../../src/assets/images/Why-Digit-Systems-Pvt-Ltd.png';

// ==============================|| MAIN LOGO ||============================== //

const LogoSection = () => {
  const defaultId = useSelector((state) => state.customization.defaultId);
  const dispatch = useDispatch();
  return (
    <ButtonBase disableRipple onClick={() => dispatch({ type: MENU_OPEN, id: defaultId })} component={Link}>
      {/* <Logo /> */}
      <img
        src={LogoImage}
        alt="logo"
        style={{
          width: '130px',
          height: '75px'
        }}
      ></img>
    </ButtonBase>
  );
};

export default LogoSection;
