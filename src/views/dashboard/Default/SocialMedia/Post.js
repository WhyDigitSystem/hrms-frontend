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
  Tooltip,
  Dialog,
  DialogContent,
  Collapse
} from '@mui/material';
import apiCalls from 'apicall';
import { toast } from 'react-toastify';
import ControlCameraIcon from '@mui/icons-material/ControlCamera';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import { useTheme } from '@mui/material/styles';
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloseIcon from '@mui/icons-material/Close';

const Post = ({ tabValue, circularData, setCircularData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [praiseCounts, setPraiseCounts] = useState({});
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openViewMoreModal, setOpenViewMoreModal] = useState(false);
  const [branchCode] = useState(localStorage.getItem('branchCode'));
  const [branchName] = useState(localStorage.getItem('branch'));
  const [department] = useState(localStorage.getItem('department'));
  const [userType] = useState(localStorage.getItem('userType'));
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [formData, setFormData] = useState({
    active: true,
    circularTopic: '',
    circularcontent: '',
    expiresDate: '',
    imageUrl: ''
  });
  const [logo, setLogo] = useState(null);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState('');
  const [expandedItems, setExpandedItems] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  
  // Track which circulars the user has liked
  const [likedCirculars, setLikedCirculars] = useState(() => {
    const savedLikes = localStorage.getItem('likedCirculars');
    return savedLikes ? JSON.parse(savedLikes) : {};
  });

  // Check if user has liked a circular
  const hasUserLiked = (circularId) => {
    return likedCirculars[circularId] === true;
  };

  // Save liked circulars to localStorage
  useEffect(() => {
    localStorage.setItem('likedCirculars', JSON.stringify(likedCirculars));
  }, [likedCirculars]);

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
  }, [tabValue]);

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
    // Check if user has already liked this circular
    if (hasUserLiked(circularId)) {
      toast.info('You have already praised this circular');
      return;
    }

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
        
        // Update praise count
        const updatedCount = await getPraiseCount(circularId);
        setPraiseCounts(prev => ({ ...prev, [circularId]: updatedCount }));
        
        // Mark circular as liked by user
        setLikedCirculars(prev => ({ ...prev, [circularId]: true }));
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
      department: tabValue === 0 ? 'All' : department,
      type,
    };

    try {
      const result = await apiCalls('put', `/basicmaster/createUpdateCircular`, saveFormData);
      if (result.status === true) {
        toast.success(editId ? 'Circular Updated Successfully' : 'Circular created successfully');
        setOpenCreateModal(false);
        GetCircularByOrgId();

        const generatedId = result.paramObjectsMap.circularVO.id;
        if (generatedId && typeof logo === 'object') {
          handleFileUpload(generatedId);
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

  const handleRemoveImage = () => {
    setLogo(null);
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
  };

  const cardStyle = {
    position: 'relative',
    margin: 2,
    minHeight: 200,
    background: 'linear-gradient(193deg, #D1E0F3 30%, #D1E0F3 90%) ',
    borderRadius: 4,
    color: theme.palette.common.white,
    overflow: 'hidden',
  };

  const announcementStyle = {
    background: 'rgba(73, 53, 53, 0.1)',
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

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setLogo(file);
    } else {
      toast.error('Please upload a valid image (PNG or JPEG).');
    }
  };
  
  const handleFileUpload = async (generatedId) => {
    if (!generatedId) {
      toast.error('Generated ID is required');
      return;
    }
    const formData = new FormData();
    formData.append('file', logo);
    try {
      await apiCalls(
        'post',
        `/basicmaster/uploadPostImageInBloob?id=${generatedId}`,
        formData,
        {},
        { 'Content-Type': 'multipart/form-data' }
      );
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleThumbnailClick = (image) => {
    setPreviewImage(image);
  };

  return (
    <Box sx={cardStyle}>
      <Box sx={{ position: 'relative', padding: isMobile ? 2 : 4, zIndex: 1 }}>
        <Box sx={announcementStyle}>
          {circularData.length > 0 ? (
            <Box>
              <Box sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center'
              }}>
                <div>
                  {circularData?.[0]?.postImage && (
                    <Box
                      component="img"
                      src={`data:image/png;base64,${circularData[0].postImage}`}
                      alt="Circular Attachment"
                      sx={{
                        width: isMobile ? 80 : 100,
                        height: isMobile ? 80 : 100,
                        objectFit: 'cover',
                        mt: 2,
                        borderRadius: '50%',
                        border: '2px solid #ccc',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleThumbnailClick(circularData[0].postImage)}
                    />
                  )}
                </div>
                <div className={isMobile ? 'mt-2' : 'ps-3'}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 'bold' }}
                  >
                    {circularData[0].circularTopic}
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      lineHeight: 1.6,
                      fontSize: isMobile ? '0.875rem' : '1rem',
                      color: '#000'
                    }}
                  >
                    {circularData[0].circularcontent}
                  </Typography>
                </div>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Tooltip 
                  title={hasUserLiked(circularData[0].id) 
                    ? "You've already praised this" 
                    : "Praise this circular"
                  }
                >
                  <IconButton 
                    onClick={() => handlePraise(circularData[0].id)} 
                    color={hasUserLiked(circularData[0].id) ? "primary" : "secondary"}
                    disabled={hasUserLiked(circularData[0].id)}
                  >
                    <ThumbUpAltIcon />
                  </IconButton>
                </Tooltip>
                <Typography variant="caption" sx={{ ml: -1 }}>
                  {praiseCounts[circularData[0].id] || "0"}
                </Typography>
              </Box>
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
            disabled={(userType === 'USER' && tabValue === 0) || (userType === 'TEAM LEAD' && tabValue === 0)}
          >
            <AddIcon />
          </IconButton>
          <IconButton
            color="primary"
            onClick={() => {
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
          width: isMobile ? '95vw' : 400,
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
            size={isMobile ? 'small' : 'medium'}
          />
          <TextField
            fullWidth
            multiline
            rows={isMobile ? 3 : 4}
            label="Circular Content"
            value={formData.circularcontent}
            onChange={(e) => setFormData({ ...formData, circularcontent: e.target.value })}
            error={!!fieldErrors.circularcontent}
            helperText={fieldErrors.circularcontent}
            sx={{ mb: 3 }}
            size={isMobile ? 'small' : 'medium'}
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
            size={isMobile ? 'small' : 'medium'}
          />
          <Box className="col-md-9 mb-3">
            <Box display="flex" alignItems="center" gap={1}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{
                  color: 'rgb(103 58 183)',
                  borderRadius: '12px',
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {logo ? (typeof logo === 'object' && logo.name ? logo.name : 'Image') : 'Upload Image'}
                <input type="file" hidden accept="image/png, image/jpeg" onChange={handleLogoChange} />
              </Button>

              {logo && (
                <IconButton
                  sx={{ color: 'rgb(103 58 183)', fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                  onClick={handleOpen}
                >
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
                      sx={{
                        maxWidth: '100%',
                        maxHeight: '60vh',
                        width: 'auto',
                        height: 'auto',
                        borderRadius: 2
                      }}
                    />
                    <Box display="flex" gap={2} mt={2}>
                      <Button
                        variant="outlined"
                        sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)', fontSize: '13px' }}
                        onClick={handleRemoveImage}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="outlined"
                        sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)', fontSize: '13px' }}
                        onClick={handleClose}
                      >
                        Close
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Avatar sx={{ width: 150, height: 150, bgcolor: '#F0F0F0', borderRadius: 2 }}>
                      <Typography variant="caption">Upload Image</Typography>
                    </Avatar>
                    <Box display="flex" gap={2} mt={2}>
                      <Button
                        variant="outlined"
                        sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)', fontSize: '15px' }}
                        onClick={handleClose}
                      >
                        Close
                      </Button>
                    </Box>
                  </Box>
                )}
              </DialogContent>
            </Dialog>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              onClick={handleCloseCreateModal}
              color="secondary"
              size={isMobile ? 'small' : 'medium'}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              color="primary"
              disabled={isLoading}
              size={isMobile ? 'small' : 'medium'}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Compact View All Circulars Modal */}
      <Modal open={openViewMoreModal} onClose={() => setOpenViewMoreModal(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          width: isMobile ? '95vw' : '80%',
          maxWidth: '600px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          outline: 'none'
        }}>
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              All Circulars
              <Typography component="span" variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                ({circularData.length})
              </Typography>
            </Typography>
            <IconButton onClick={() => setOpenViewMoreModal(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ overflowY: 'auto', flex: 1 }}>
            <List dense sx={{ p: 0 }}>
              {circularData.map((circular) => (
                <React.Fragment key={circular.id}>
                  <ListItem 
                    sx={{ 
                      alignItems: 'flex-start',
                      '&:hover': { backgroundColor: '#f9f9f9' },
                      py: 1.5,
                      px: 2
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 40, mt: 0.5 }}>
                      <Avatar sx={{ 
                        bgcolor: 'primary.main', 
                        width: 30, 
                        height: 30,
                        fontSize: '0.8rem'
                      }}>
                        <CampaignIcon fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {circular.circularTopic}
                        </Typography>
                        
                        <Box sx={{ display: 'flex' }}>
                          {circular.postImage && (
                            <Tooltip title="View image">
                              <IconButton 
                                size="small"
                                onClick={() => handleThumbnailClick(circular.postImage)}
                                sx={{ mr: 0.5 }}
                              >
                                <Avatar 
                                  src={`data:image/png;base64,${circular.postImage}`}
                                  sx={{ width: 24, height: 24 }}
                                />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {userType !== 'USER' && (
                            <Tooltip title="Edit">
                              <IconButton 
                                size="small" 
                                onClick={() => getCircularById(circular)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                      
                      <Collapse in={expandedItems[circular.id]} collapsedSize={20}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'text.secondary',
                            whiteSpace: 'pre-line',
                            fontSize: '0.8rem',
                            mt: 0.5
                          }}
                        >
                          {circular.circularcontent}
                        </Typography>
                      </Collapse>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.disabled',
                          }}
                        >
                          Expires: {new Date(circular.expiresDate).toLocaleDateString()}
                        </Typography>
                        
                        <IconButton 
                          size="small" 
                          onClick={() => toggleExpand(circular.id)}
                          sx={{ ml: 1 }}
                        >
                          {expandedItems[circular.id] ? 
                            <ExpandLessIcon fontSize="small" /> : 
                            <ExpandMoreIcon fontSize="small" />
                          }
                        </IconButton>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Tooltip 
                          title={hasUserLiked(circular.id) 
                            ? "You've already praised this" 
                            : "Praise this circular"
                          }
                        >
                          <IconButton 
                            size="small" 
                            onClick={() => handlePraise(circular.id)}
                            color={hasUserLiked(circular.id) ? "primary" : "secondary"}
                            disabled={hasUserLiked(circular.id)}
                          >
                            <ThumbUpAltIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Typography variant="caption">
                          {praiseCounts[circular.id] || "0"}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                  <Divider sx={{ mx: 2 }} />
                </React.Fragment>
              ))}
            </List>
          </Box>
        </Box>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{ 
          position: 'relative',
          bgcolor: 'background.paper', 
          borderRadius: 1,
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          outline: 'none'
        }}>
          <IconButton
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              zIndex: 1,
              bgcolor: 'rgba(255,255,255,0.7)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
            }}
            onClick={() => setPreviewImage(null)}
          >
            <CloseIcon />
          </IconButton>
          <img 
            src={`data:image/png;base64,${previewImage}`} 
            alt="Full preview" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              display: 'block'
            }} 
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default Post;