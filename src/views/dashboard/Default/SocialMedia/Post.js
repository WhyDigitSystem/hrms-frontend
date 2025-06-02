import React, { useState, useEffect } from 'react';
import CampaignIcon from "@mui/icons-material/Campaign";
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  Box,
  Typography,
  Modal,
  IconButton,
  Button,
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  useMediaQuery,
  keyframes,
  Tooltip,
  Dialog,
  DialogContent
} from '@mui/material';
import { toast } from 'react-toastify';
import ControlCameraIcon from '@mui/icons-material/ControlCamera';
import ToastComponent, { showToast } from 'utils/toast-component';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import { useTheme } from '@mui/material/styles';
import apiCalls from 'apicall';
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

const Post = ({ tabValue, circularData, setCircularData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [listViewData, setListViewData] = useState([]);
  const [praiseCounts, setPraiseCounts] = useState({});
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openViewMoreModal, setOpenViewMoreModal] = useState(false);
  const [branchCode] = useState(localStorage.getItem('branchCode'));
  const [branchName] = useState(localStorage.getItem('branch'));
  const [department] = useState(localStorage.getItem('department'));
  const [userType] = useState(localStorage.getItem('userType'));
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [logoPreviewOpen, setLogoPreviewOpen] = useState(false);
  const [formData, setFormData] = useState({
    active: true,
    circularTopic: '',
    circularcontent: '',
    expiresDate: '',
    imageUrl: ''
  });
  // const [imageFile, setImageFile] = useState(null);
  const [editId, setEditId] = useState('');
  const [viewAllCirculars, setViewAllCirculars] = useState([]);

  const glow = keyframes`
    0% { box-shadow: 0 0 5px ${theme.palette.primary.main}; }
    50% { box-shadow: 0 0 20px ${theme.palette.primary.main}, 0 0 30px ${theme.palette.secondary.main}; }
    100% { box-shadow: 0 0 5px ${theme.palette.primary.main}; }
  `;

  const GetCircularByOrgId = async () => {
    try {
      const type = tabValue === 0 ? 'Organization' : 'IT';
      const endpoint =
        tabValue === 0
          ? `/basicmaster/getAllCircularByOrgId?branchCode=${branchCode}&orgId=${orgId}&type=${type}&department=ALL`
          : `/basicmaster/getAllCircularByOrgId?branchCode=${branchCode}&orgId=${orgId}&department=${department}&type=${type}`;

      const result = await apiCalls('get', endpoint);

      if (result?.paramObjectsMap?.circularVO) {
        const formattedData = result.paramObjectsMap.circularVO.reverse();
        setCircularData(formattedData);
        fetchAllPraiseCounts(formattedData);
      } else {
        setCircularData([]);
      }
    } catch (err) {
      console.error('Error fetching circulars:', err);
      setCircularData([]);
    }
  };

  useEffect(() => {
    GetCircularByOrgId();
  }, []);

  const getCircularById = (circular) => {
    setLogo(circular.postImage);
    setFormData({
      circularTopic: circular.circularTopic,
      circularcontent: circular.circularcontent,
      expiresDate: circular.expiresDate,
      imageUrl: circular.imageUrl,
      active: circular.active,
    });
    setEditId(circular.id);
    setOpenCreateModal(true);
  };

  const fetchAllPraiseCounts = async (circulars) => {
    const counts = {};
    for (let circular of circulars) {
      const count = await getPraiseCount(circular.id);
      counts[circular.id] = count;
    }
    setPraiseCounts(counts);
  };

  const getPraiseCount = async (circularId) => {
    try {
      const res = await apiCalls('get', `/basicmaster/GetCountOfPraiseByOrgIdAndCircularId?circularid=${circularId}&orgId=${orgId}`);
      return res?.paramObjectsMap?.praiseVO?.[0]?.Count || "0";
    } catch (err) {
      console.error("Error fetching praise count:", err);
      return "0";
    }
  };

  const handlePraise = async (circularId) => {
    try {
      const payload = {
        circularId,
        orgId,
        userName: loginUserName,
        department,
        branchCode,
        branchName,
        liked: "Yes"
      };
      const result = await apiCalls('put', '/basicmaster/createUpdatePraise', payload);
      if (result?.status === true) {
        toast.success('Praised successfully');
        const updatedCount = await getPraiseCount(circularId);
        setPraiseCounts(prev => ({ ...prev, [circularId]: updatedCount }));
      } else {
        toast.error('Failed to register praise');
      }
    } catch (error) {
      toast.error('Praise action failed');
    }
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.circularTopic) errors.circularTopic = 'Circular topic is required';
    if (!formData.circularcontent) errors.circularcontent = 'Circular content is required';
    if (!formData.expiresDate) errors.expiresDate = 'Expiration date is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    let imageUrl = formData.imageUrl;
    const type = tabValue === 0 ? 'Organization' : 'IT';

    const saveFormData = {
      ...(editId && { id: editId }),
      active: formData.active,
      circularTopic: formData.circularTopic,
      circularcontent: formData.circularcontent,
      expiresDate: formData.expiresDate,
      orgId,
      createdBy: loginUserName,
      branchCode,
      branchName,
      department: tabValue === 0 ? 'All' : department, // Only include department if tabValue is not 0
      type,
      // imageUrl, // Uncomment this if needed
    };

    try {
      const result = await apiCalls('put', `/basicmaster/createUpdateCircular`, saveFormData);
      if (result.status === true) {
        toast.success(editId ? 'Circular Updated Successfully' : 'Circular created successfully');
        setOpenCreateModal(false);
        GetCircularByOrgId();
        // window.location.reload();

        const generatedId = result.paramObjectsMap.circularVO.id;
        if (generatedId && typeof logo === 'object') {
          console.log('Generated ID:', generatedId);
          console.log('Uploaded Item', logo);
          handleFileUpload(generatedId);
        } else {
          console.log('handle Img Upload failed');
        }

        setFormData({ circularTopic: '', circularcontent: '', expiresDate: '', imageUrl: '' });
        setLogo(null);
        setEditId('');

      } else {
        toast.error(result.paramObjectsMap?.errorMessage || 'Circular creation failed');
      }
    } catch (err) {
      toast.error('Circular creation failed. Please check the data and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    setFormData({ circularTopic: '', circularcontent: '', expiresDate: '', imageUrl: '' });
    setLogo(null);
    setEditId('');
  };

  // const handleImageUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setImageFile(file); // Store the file for preview
  //   }
  // };

  const handleRemoveImage = () => {
    setLogo(null);
    setFormData((prev) => ({ ...prev, imageUrl: '' })); // Reset the form data's image URL to empty
  };

  const cardStyle = {
    position: 'relative',
    margin: 2,
    minHeight: 200,
    background: `linear-gradient(145deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
    borderRadius: 4,
    color: theme.palette.common.white,
    overflow: 'hidden',
    '&:hover': { animation: `${glow} 2s infinite` },
  };

  const announcementStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    padding: isMobile ? 2 : 3,
    backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    position: 'relative',
    minHeight: 150,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };
  const [logo, setLogo] = useState(null);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setLogo(file);
    } else {
      showToast('error', 'Please upload a valid image (PNG or JPEG).');
    }
  };
  //   const uploadImageToBlob = async (file) => {
  //   try {
  //     const formData = new FormData();
  //     formData.append("file", file);
  //     const result = await apiCalls("post", "/basicmaster/uploadPostImageInBloob", formData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });
  //     if (result?.paramObjectsMap?.fileUrl) {
  //       return result.paramObjectsMap.fileUrl;
  //     } else {
  //       throw new Error('Image upload failed');
  //     }
  //   } catch (err) {
  //     toast.error("Image upload failed");
  //     console.error("Image upload error:", err);
  //     return ""; // Return an empty string on error
  //   }
  // };
  const handleFileUpload = async (generatedId) => {
    if (!generatedId) {
      console.warn('Generated ID is missing');
      showToast('error', 'Generated ID is required');
      return;
    }
    const formData = new FormData();
    formData.append('file', logo);
    try {
      const response = await apiCalls(
        'post',
        `/basicmaster/uploadPostImageInBloob?id=${generatedId}`,
        formData,
        {},
        { 'Content-Type': 'multipart/form-data' }
      );
      console.log('Img Upload Response:', response);

      if (response.status === true) {
        showToast('success', response.message || 'Image Uploaded successfully!');
      } else {
        console.warn('Img upload failed:', response);
        showToast('error', 'Img upload failed');
      }
    } catch (error) {
      console.error('Img Upload Error:', error);
      showToast('error', 'Failed to upload Img');
    }
  };
  useEffect(() => {
    return () => {
      if (logo && typeof logo === 'object') {
        URL.revokeObjectURL(logo);
      }
    };
  }, [logo]);
  // console.log('Image URL:', circularData[0].postImage);

  return (
    <Box sx={cardStyle}>
      <Box sx={{ position: 'relative', padding: isMobile ? 3 : 4, zIndex: 1 }}>
        <Box sx={announcementStyle}>
          {circularData.length > 0 ? (
            <Box>
              <div className='d-flex justify-content-between align-items-center'>

                <div>
                  <Typography variant="h6" gutterBottom>
                    {circularData[0].circularTopic}
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {circularData[0].circularcontent}
                  </Typography>
                </div>
                <div>
                  {circularData?.[0]?.postImage && (
                    <Box
                      component="img"
                      src={`data:image/png;base64,${circularData[0].postImage}`}
                      alt="Circular Attachment"
                      sx={{
                        width: '100%',
                        maxHeight: 300,
                        objectFit: 'contain',
                        mt: 2,
                        borderRadius: 2,
                      }}
                      onClick={() => setLogoPreviewOpen(true)}
                    />
                  )}
                </div>
              </div>

              <Tooltip title="Praise this circular">
                <IconButton onClick={() => handlePraise(circularData[0].id)} color="secondary">
                  <ThumbUpAltIcon />
                </IconButton>
              </Tooltip>
              <Typography variant="caption">
                {praiseCounts[circularData[0].id] || "0"}
              </Typography>

              {/* Display image if available */}


            </Box>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <NotificationsActiveIcon sx={{ fontSize: 48, opacity: 0.3 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No circulars available
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingTop: 2 }}>
          <IconButton
            color="primary"
            onClick={() => setOpenCreateModal(true)}
            disabled={userType === 'USER' && tabValue === 0 || userType === 'TEAM LEAD' && tabValue === 0}
          >
            <AddIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => {
              setViewAllCirculars(circularData);
              setOpenViewMoreModal(true);
            }}
          >
            <VisibilityIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Create/Edit Modal */}
      <Modal open={openCreateModal} onClose={handleCloseCreateModal}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: theme.palette.background.paper,
          borderRadius: 2,
          p: isMobile ? 2 : 4,
          width: isMobile ? '90%' : 400,
          maxHeight: '90vh',
          overflowY: 'auto',
          outline: 'none'
        }}>
          <Typography variant="h6" gutterBottom>
            {editId ? 'Edit Circular' : 'Create New Circular'}
          </Typography>
          <TextField
            fullWidth
            label="Circular Topic"
            value={formData.circularTopic}
            onChange={(e) => setFormData({ ...formData, circularTopic: e.target.value })}
            error={!!fieldErrors.circularTopic}
            helperText={fieldErrors.circularTopic}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Circular Content"
            value={formData.circularcontent}
            onChange={(e) => setFormData({ ...formData, circularcontent: e.target.value })}
            error={!!fieldErrors.circularcontent}
            helperText={fieldErrors.circularcontent}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            type="date"
            label="Expiration Date"
            InputLabelProps={{ shrink: true }}
            value={formData.expiresDate}
            onChange={(e) => setFormData({ ...formData, expiresDate: e.target.value })}
            error={!!fieldErrors.expiresDate}
            helperText={fieldErrors.expiresDate}
            sx={{ mb: 3 }}
          />
          <div className="col-md-9 mb-3">
            <Box display="flex" alignItems="center" gap={1}>
              <Button
                variant="outlined"
                component="label"
                multiline
                startIcon={<CloudUploadIcon />}
                sx={{ color: 'rgb(103 58 183)', borderRadius: '12px' }}
              >
                {logo ? (typeof logo === 'object' && logo.name ? logo.name : 'Image') : 'Upload Image'}

                <input type="file" hidden accept="image/png, image/jpeg" onChange={handleLogoChange} />
              </Button>

              { logo && (
                <IconButton variant="contained" sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)' }} onClick={handleOpen}>
                  <ControlCameraIcon />
                </IconButton>
              )}
            </Box>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
              <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h5" sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)' }}>
                  Image
                </Typography>
                {logo ? (
                  <Box>
                    <Avatar
                      src={typeof logo === 'object' ? URL.createObjectURL(logo) : `data:image/jpeg;base64,${logo}`}
                      alt="Image"
                      sx={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', borderRadius: 2 }}
                    />
                    <Box display="flex" gap={2} mt={2}>
                      <IconButton
                        variant="contained"
                        sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)', fontSize: '13px' }}
                        onClick={handleRemoveImage}
                      >
                        Delete
                      </IconButton>
                      <IconButton
                        variant="contained"
                        sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)', fontSize: '13px' }}
                        onClick={handleClose}
                      >
                        Close
                      </IconButton>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Avatar sx={{ width: 150, height: 150, bgcolor: '#F0F0F0', borderRadius: 2 }}>
                      <Typography variant="caption">Upload Image</Typography>
                    </Avatar>
                    <Box display="flex" gap={2} mt={2}>
                      <IconButton
                        variant="contained"
                        sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)', fontSize: '15px' }}
                        onClick={handleClose}
                      >
                        Close
                      </IconButton>
                    </Box>
                  </Box>
                )}
              </DialogContent>
            </Dialog>
          </div>
          {/* {(imageFile || formData.imageUrl) && (
            <Box sx={{ mb: 2 }}>
              <img
                src={imageFile ? URL.createObjectURL(imageFile) : formData.imageUrl}
                alt="Circular Preview"
                style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }}
              />
              <Button onClick={handleRemoveImage} color="error" fullWidth sx={{ mt: 1 }}>Remove Image</Button>
            </Box>
          )} */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={handleCloseCreateModal} color="secondary">Cancel</Button>
            <Button onClick={handleSave} variant="contained" color="primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* View All Circulars Modal */}
      <Modal open={openViewMoreModal} onClose={() => setOpenViewMoreModal(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: theme.palette.background.paper,
          borderRadius: 2,
          p: isMobile ? 2 : 4,
          width: isMobile ? '90%' : '80%',
          maxHeight: '90vh',
          overflowY: 'auto',
          outline: 'none'
        }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            All Circulars ({viewAllCirculars.length})
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>
            Total Posts: {viewAllCirculars.length}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {viewAllCirculars.map((circular, idx) => (
              <React.Fragment key={circular.id || idx}>
                <ListItem alignItems="flex-start" secondaryAction={
                  <IconButton edge="end" onClick={() => getCircularById(circular)}>
                    <EditIcon />
                  </IconButton>
                }>
                  <ListItemAvatar>
                    <Avatar><CampaignIcon /></Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="h6" sx={{ fontWeight: 'bold' }}>{circular.circularTopic}</Typography>}
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{circular.circularcontent}</Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.6 }}>
                          Expires: {new Date(circular.expiresDate).toLocaleDateString()}
                        </Typography>
                      </>
                    }
                  />
                  <div>
                    {circularData?.[0]?.postImage && (
                      <Box
                        component="img"
                        src={`data:image/png;base64,${circularData[0].postImage}`}
                        alt="Circular Attachment"
                        sx={{
                          width: '100%',
                          maxHeight: 300,
                          objectFit: 'contain',
                          mt: 2,
                          borderRadius: 2,
                        }}
                      />
                    )}
                  </div>
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Modal>
      <Modal
        open={logoPreviewOpen}
        onClose={() => setLogoPreviewOpen(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}
      >
        <Box
          sx={{
            width: 200,
            height: 200,
            borderRadius: '50%',
            overflow: 'hidden',
            bgcolor: 'background.paper',
            boxShadow: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1
          }}
        >
          {circularData?.[0]?.postImage && (
            <img
              src={`data:image/png;base64,${circularData[0].postImage}`}
              alt="Circular Attachment"
              style={{ width: '100%', height: '60%', objectFit: 'cover' }}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default Post;
