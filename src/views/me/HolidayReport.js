import React, { useState, useEffect } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Box, Button, Card, Typography, Paper } from '@mui/material';
import CommonBulkUpload from 'utils/CommonBulkUpload';
import { ToastContainer } from 'react-toastify';
import apiCalls from 'apicall';
import 'react-toastify/dist/ReactToastify.css';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';

const HolidayReport = () => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [listViewData, setListViewData] = useState([]);
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));

  useEffect(() => {
    getAllHolidayByOrgId();
  }, []);

  const getAllHolidayByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/basicmaster/getAllHolidayByOrgId?orgId=${orgId}`);
      if (result && result.paramObjectsMap && result.paramObjectsMap.holidayVO.reverse()) {
        setListViewData(result.paramObjectsMap.holidayVO.reverse());
      } else {
        setListViewData([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setListViewData([]);
    }
  };

  const handleBulkUploadOpen = () => {
    setUploadOpen(true);
  };

  const handleBulkUploadClose = () => {
    setUploadOpen(false);
  };

  const handleFileUpload = (event) => {
    console.log(event.target.files[0]);
  };

  const handleSubmit = async () => {
    console.log('Submit clicked');
    handleBulkUploadClose();
  };

  const listViewColumns = [
    { accessorKey: 'holidayDate', header: 'Holiday Date', size: 140 },
    { accessorKey: 'day', header: 'Day', size: 140 },
    { accessorKey: 'festival', header: 'Festival', size: 140 },
    { accessorKey: 'branchName', header: 'Branch Name', size: 140 },
  ];

  return (
    <>
      <Card
        sx={{
          padding: 4,
          backgroundColor: '#ffffff',
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
          borderRadius: 4,
          maxWidth: '100%',
          mt: 3,
        }}
      >
        <ToastContainer />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              sx={{
                background: 'linear-gradient(90deg, #3f51b5, #5c6bc0)',
                color: '#fff',
                fontWeight: 'bold',
                height: '40px',
                px: 4,
                py: 1,
                borderRadius: 2,
                boxShadow: '0px 4px 8px rgba(63, 81, 181, 0.2)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #3949ab, #536dfe)',
                  boxShadow: '0px 6px 12px rgba(63, 81, 181, 0.3)',
                },
              }}
              onClick={handleBulkUploadOpen}
            >
              Upload Excel
            </Button>
          </Typography>
        </Box>

        {uploadOpen && (
          <CommonBulkUpload
            open={uploadOpen}
            handleClose={handleBulkUploadClose}
            dialogTitle="Upload Files"
            uploadText="Upload File"
            onSubmit={handleSubmit}
            handleFileUpload={handleFileUpload}
            apiUrl="/basicmaster/excelUploadForHolidays"
            screen="HolidayReport"
            loginUser={loginUserName}
            orgId={orgId}
          />
        )}

        <Box sx={{ mt: 4 }}>
          {listViewData.length > 0 ? (
            <Paper
              sx={{
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <CommonListViewTable
                data={listViewData}
                columns={listViewColumns}
                blockEdit={true}
                showActions={false}
                hideActions={true}
                
              />
            </Paper>
          ) : (
            <Typography
              variant="body1"
              sx={{
                textAlign: 'center',
                fontSize: '18px',
                fontWeight: 700,
                color: 'red',
                mt: 4,
                p: 4,
                backgroundColor: '#f5f5f5',
                borderRadius: 2,
              }}
            >
              No holidays available
            </Typography>
          )}
        </Box>
      </Card>
    </>
  );
};

export default HolidayReport;