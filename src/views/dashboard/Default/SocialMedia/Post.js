import React, { useState, useEffect } from 'react';
import CampaignIcon from "@mui/icons-material/Campaign";
import VisibilityIcon from '@mui/icons-material/Visibility';
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
  Tooltip
} from '@mui/material';
import { toast } from 'react-toastify';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import { useTheme } from '@mui/material/styles';
import apiCalls from 'apicall';
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

const Post = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [listViewData, setListViewData] = useState([]);
  const [praiseCounts, setPraiseCounts] = useState({});
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openViewMoreModal, setOpenViewMoreModal] = useState(false);
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [branchCode] = useState(localStorage.getItem('branchCode'));
  const [branchName] = useState(localStorage.getItem('branch'));
  const [department] = useState(localStorage.getItem('department'));
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const loginUserName = localStorage.getItem('userName');
  const [formData, setFormData] = useState({
    active: true,
    circularTopic: '',
    circularcontent: '',
    expiresDate: '',
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [editId, setEditId] = useState('');
  const [viewAllCirculars, setViewAllCirculars] = useState([]);

  const glow = keyframes`
    0% { box-shadow: 0 0 5px ${theme.palette.primary.main}; }
    50% { box-shadow: 0 0 20px ${theme.palette.primary.main}, 0 0 30px ${theme.palette.secondary.main}; }
    100% { box-shadow: 0 0 5px ${theme.palette.primary.main}; }
  `;

  useEffect(() => {
    GetCircularByOrgId();
  }, [orgId]);

  const GetCircularByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/basicmaster/getAllCircularByOrgId?branchCode=${branchCode}&orgId=${orgId}&department=${department}`);
      if (result?.paramObjectsMap?.circularVO) {
        const formattedData = result.paramObjectsMap.circularVO.reverse();
        setListViewData(formattedData);
        fetchAllPraiseCounts(formattedData);
      } else {
        setListViewData([]);
      }
    } catch (err) {
      console.error('Error fetching circulars:', err);
      setListViewData([]);
    }
  };

  const uploadImageToBlob = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await apiCalls("post", "/basicmaster/uploadPostImageInBloob", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (result?.paramObjectsMap?.fileUrl) {
        return result.paramObjectsMap.fileUrl;
      } else {
        throw new Error('Image upload failed');
      }
    } catch (err) {
      toast.error("Image upload failed");
      console.error("Image upload error:", err);
      return ""; // Return an empty string on error
    }
  };

  const getCircularById = (circular) => {
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
    if (imageFile) {
      imageUrl = await uploadImageToBlob(imageFile);
    }

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
      department,
      imageUrl,
    };

    try {
      const result = await apiCalls('put', `/basicmaster/createUpdateCircular`, saveFormData);
      if (result.status === true) {
        toast.success(editId ? 'Circular Updated Successfully' : 'Circular created successfully');
        setOpenCreateModal(false);
        GetCircularByOrgId();
        setFormData({ circularTopic: '', circularcontent: '', expiresDate: '', imageUrl: '' });
        setImageFile(null);
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
    setImageFile(null);
    setEditId('');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // Store the file for preview
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
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

  return (
    <Box sx={cardStyle}>
      <Box sx={{ position: 'relative', padding: isMobile ? 3 : 4, zIndex: 1 }}>
        <Box sx={announcementStyle}>
          {listViewData.length > 0 ? (
            <Box>
              <Typography variant="h6" gutterBottom>{listViewData[0].circularTopic}</Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>{listViewData[0].circularcontent}</Typography>
              <Tooltip title="Praise this circular">
                <IconButton onClick={() => handlePraise(listViewData[0].id)} color="secondary">
                  <ThumbUpAltIcon />
                </IconButton>
              </Tooltip>
              <Typography variant="caption">
                {praiseCounts[listViewData[0].id] || "0"}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <NotificationsActiveIcon sx={{ fontSize: 48, opacity: 0.3 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>No circulars available</Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingTop: 2 }}>
          <IconButton color="primary" onClick={() => setOpenCreateModal(true)}><AddIcon /></IconButton>
          <IconButton color="inherit" onClick={() => { setViewAllCirculars(listViewData); setOpenViewMoreModal(true); }}><VisibilityIcon /></IconButton>
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
          <Button variant="outlined" component="label" sx={{ mb: 2 }}>
            Upload Image
            <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
          </Button>
          {(imageFile || formData.imageUrl) && (
            <Box sx={{ mb: 2 }}>
              <img
                src={imageFile ? URL.createObjectURL(imageFile) : formData.imageUrl}
                alt="Circular Preview"
                style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }}
              />
              <Button onClick={handleRemoveImage} color="error" fullWidth sx={{ mt: 1 }}>Remove Image</Button>
            </Box>
          )}
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
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Modal>
    </Box>
  );
};

export default Post;
