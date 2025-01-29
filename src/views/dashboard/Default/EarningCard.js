import PropTypes from 'prop-types';
import { useState } from 'react';
import { Avatar, Box, Grid, Menu, MenuItem, Typography, Button } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import MainCard from 'ui-component/cards/MainCard';
import SkeletonEarningCard from 'ui-component/cards/Skeleton/EarningCard';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import EarningIcon from 'assets/images/icons/earning.svg';
import { motion } from 'framer-motion';

const CardWrapper = styled(MainCard)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.dark,
  color: '#fff',
  overflow: 'hidden',
  position: 'relative',
  borderRadius: '12px',
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: theme.palette.secondary[800],
    borderRadius: '50%',
    top: -85,
    right: -95,
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: theme.palette.secondary[800],
    borderRadius: '50%',
    top: -125,
    right: -15,
    opacity: 0.5,
  }
}));

const EarningCard = ({ isLoading }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {isLoading ? (
        <SkeletonEarningCard />
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <CardWrapper border={false} content={false}>
            <Box sx={{ p: 2.25 }}>
              <Grid container direction="column">
                <Grid item>
                  <Grid container justifyContent="space-between">
                  </Grid>
                </Grid>
                <div className='d-flex justify-content-between align-items-center'>
                  <Grid item>
                    <Typography sx={{ fontSize: '1.5rem', fontWeight: 500, mt: 1 }}>Name : John Doe</Typography>
                    <Typography sx={{ fontSize: '1rem', color: theme.palette.secondary[200] }}>Employee No : 123456</Typography>
                    <Typography sx={{ fontSize: '1rem', color: theme.palette.secondary[200] }}>Role: Software Engineer</Typography>
                    <Typography sx={{ fontSize: '1rem', color: theme.palette.secondary[200] }}>Date: January 29th 2025</Typography>
                    <Typography sx={{ fontSize: '1rem', color: theme.palette.secondary[200] }}>Time: 11:55:49 AM</Typography>
                  </Grid>

                  <Grid item sx={{ mt: 2, mb: 1 }} className='d-flex'>
                    <motion.div whileHover={{ scale: 1.1 }}>
                      <Button variant="contained" color="primary" sx={{ mr: 1 }}>Check-In</Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }}>
                      <Button variant="contained" color="secondary" className='bg-danger' sx={{ zIndex: 1 }}>Check-Out</Button>
                    </motion.div>
                  </Grid>
                </div>
              </Grid>
            </Box>
          </CardWrapper>
        </motion.div>
      )}
    </>
  );
};

EarningCard.propTypes = {
  isLoading: PropTypes.bool
};

export default EarningCard;