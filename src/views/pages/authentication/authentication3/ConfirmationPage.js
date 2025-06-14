import { Card, Result } from 'antd';
import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import apiCalls from 'apicall';
import emailjs from '@emailjs/browser';
import dayjs from 'dayjs';

const API_URL = process.env.REACT_APP_API_URL;

const extractApiError = (error) =>
  error?.response?.data?.paramObjectsMap?.errorMessage ||
  error?.response?.data?.paramObjectsMap?.message ||
  error?.response?.data?.message ||
  'An unexpected error occurred. Please try again.';

const ConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action'); // 'APPROVED' or 'REJECTED'
  const actionId = searchParams.get('id');
  const employeeCode = searchParams.get('employeeCode');
  const loginUserName = searchParams.get('actionBy');
  const notifyCode = searchParams.get('notifyCode');
  const notify = searchParams.get('notify');
  const orgId = searchParams.get('orgId');

  const [branchCode] = useState(localStorage.getItem('branchCode'));
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [approveStatus, setApproveStatus] = useState('');

  const isApprove = action === 'APPROVED';

  // useEffect(() => {
  //   getAllLeaveApprove();
  //   getAllPermissionApprove();
  // }, []);

  useEffect(() => {
    getApprovalData(); // New combined logic
  }, []);

  // 
  
  const getApprovalData = async () => {
    try {
      // Call both APIs in parallel
      const [leaveResult, permissionResult] = await Promise.all([
        apiCalls('get', `leaveprocess/getLeaveRequestForDashBoard?orgId=${orgId}&reportingPersonCode=${notifyCode}&branchCode=${branchCode}`),
        apiCalls('get', `employeemaster/getPendingPermissionRequest?orgId=${orgId}&reportingPersonCode=${notifyCode}&branchCode=${branchCode}`)
      ]);
  
      // Extract data safely
      const leaveRequests = Array.isArray(leaveResult?.paramObjectsMap?.leaveRequestVO)
        ? leaveResult.paramObjectsMap.leaveRequestVO
        : [leaveResult?.paramObjectsMap?.leaveRequestVO].filter(Boolean);
  
      const permissionRequests = Array.isArray(permissionResult?.paramObjectsMap?.permissionRequestVO)
        ? permissionResult.paramObjectsMap.permissionRequestVO
        : [permissionResult?.paramObjectsMap?.permissionRequestVO].filter(Boolean);
  
      // Search leave and permission by ID
      const leaveMatch = leaveRequests.find((req) => String(req.id) === String(actionId));
      const permissionMatch = permissionRequests.find((req) => String(req.permissionRequestId) === String(actionId));
  
      if (leaveMatch?.screenName === 'LEAVE REQUEST') {
        await handleApprove(leaveMatch);
      } else if (permissionMatch?.screenName === 'PERMISSION REQUEST') {
        await handlePermissionApprove(permissionMatch);
      } else {
        // If not found in frontend, fallback to backend-only processing
        const fallbackType = searchParams.get('screenName');
        if (fallbackType === 'PERMISSION REQUEST') {
          await handlePermissionApprove({ id: actionId });
        } else {
          await handleApprove({ id: actionId });
        }
      }
    } catch (error) {
      console.error('Error fetching approval data:', error);
      setErrorMessage(extractApiError(error));
      setIsSuccess(false);
      setIsLoading(false);
    }
  };

  const handleApprove = async (matchedRequest = {}) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/leaveprocess/createApprovalLeave?action=${action}&actionBy=${loginUserName}&employeeCode=${employeeCode}&id=${actionId}&orgId=${orgId}&notifyCode=${notifyCode}&notify=${notify}`
      );

      const isSuccess = response.data.status === true;
      const backendData = response?.data?.paramObjectsMap?.leaveRequestVO;
      const backendStatus = backendData?.approveStatus || '';

      setApproveStatus(backendStatus);

      if (!isSuccess) {
        setErrorMessage(response?.data?.paramObjectsMap?.errorMessage || 'Leave request could not be processed.');
        return;
      }

      const templateParams = {
        name: matchedRequest?.employeeName || backendData?.employeeName || 'Employee',
        from_name: notify,
        leave_type: matchedRequest?.leaveType || backendData?.leaveType || '',
        start_date: dayjs(matchedRequest?.startDate || backendData?.startDate).format('DD-MM-YYYY'),
        end_date: dayjs(matchedRequest?.endDate || backendData?.endDate).format('DD-MM-YYYY'),
        total_days: matchedRequest?.totalDays || backendData?.totalDays || '',
        status: backendStatus,
        status_message: backendStatus === 'APPROVED' ? 'Approved' : 'Rejected',
        status_class: backendStatus === 'APPROVED' ? 'status-approved' : 'status-rejected',
        remarks: matchedRequest?.remarks || backendData?.remarks || 'N/A',
        email: matchedRequest?.employeeEmail || backendData?.employeeEmail || ''
      };

      await emailjs.send('service_hff8dd7', 'template_0pmh0cu', templateParams, 'G6cKiPBXzCvlFaOuo');

      setIsSuccess(true);
      setErrorMessage(response?.data?.paramObjectsMap?.message || 'Leave action completed.');
    } catch (error) {
      console.error('Error approving request:', error);
      setErrorMessage(extractApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionApprove = async (matchedRequest = {}) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/employeemaster/createApprovalPermissionRequest?action=${action}&actionBy=${loginUserName}&employeeCode=${employeeCode}&id=${actionId}&orgId=${orgId}&notifyCode=${notifyCode}&notify=${notify}`
      );
  
      const isSuccess = response.data.status === true;
      const backendData = response?.data?.paramObjectsMap?.permissionRequestVO;
      const backendStatus = backendData?.approveStatus || '';
  
      setApproveStatus(backendStatus);
  
      if (!isSuccess) {
        setErrorMessage(response?.data?.paramObjectsMap?.errorMessage || 'Permission request could not be processed.');
        return;
      }

      // const fromTimeFormatted = matchedRequest?.fromTime ? dayjs(matchedRequest.fromTime).format('hh:mm A') : 'N/A';
      // const toTimeFormatted = matchedRequest?.toTime ? dayjs(matchedRequest.toTime).format('hh:mm A') : 'N/A';
      // const totalHoursFormatted = matchedRequest?.totalHours || 'N/A';
  
      const templateParams = {
        name: matchedRequest.employeeName || backendData?.employeeName || 'Employee',
        from_name: notify,
        start_date: dayjs(matchedRequest.date || backendData?.date).format('DD-MM-YYYY'),
        from_time: matchedRequest.fromTime,
        to_time: matchedRequest.toTime,
        total_hours: matchedRequest.totalHours,
        status: backendStatus,
        status_message: backendStatus === 'APPROVED' ? 'Approved' : 'Rejected',
        status_class: backendStatus === 'APPROVED' ? 'status-approved' : 'status-rejected',
        remarks: matchedRequest.remarks || backendData?.remarks || 'N/A',
        email: matchedRequest.employeeEmail || backendData?.employeeEmail || ''
      };
  
      await emailjs.send('service_9ucz1v3', 'template_om3wfui', templateParams, 'Opp4e1xb0JkW0bocB');
  
      setIsSuccess(true);
      setErrorMessage(response?.data?.paramObjectsMap?.message || 'Permission action completed.');
    } catch (error) {
      console.error('Error approving request:', error);
      setErrorMessage(extractApiError(error));
    } finally {
      setIsLoading(false);
    }
  };  

  const handleCelebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    const button = document.getElementById('celebrateBtn');
    if (button) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 100);
    }
  };

  useEffect(() => {
    if (isSuccess && approveStatus === 'APPROVED') {
      handleCelebrate();
    }
  }, [isSuccess, approveStatus]);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '95vh',
          background: 'linear-gradient(135deg, #7b2ff7 0%, #f107a3 100%)'
        }}
      >
        <div>Redirecting...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '95vh',
        background: '#ffffff'
      }}
    >
      <Card
        style={{
          maxWidth: 420,
          textAlign: 'center',
          borderRadius: '15px',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
          maxHeight: 550
        }}
      >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.6, ease: 'easeOut' }} />

        {isSuccess ? (
          <Result
            status={approveStatus === 'REJECTED' ? 'error' : 'success'}
            title={
              <motion.h4
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                style={{ color: approveStatus === 'REJECTED' ? 'red' : 'green' }}
              >
                {errorMessage || (approveStatus === 'REJECTED' ? 'Leave request has been rejected.' : 'Leave request approved successfully.')}
              </motion.h4>
            }
            subTitle={
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {approveStatus === 'REJECTED' ? 'You have rejected the request.' : 'You have approved the request.'}
              </motion.p>
            }
          />
        ) : (
          <Result
            status="error"
            title={
              <motion.h4
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                style={{ color: 'red' }}
              >
                {errorMessage}
              </motion.h4>
            }
          />
        )}
      </Card>
    </div>
  );
};

export default ConfirmationPage;
