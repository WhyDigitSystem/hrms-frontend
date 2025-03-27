import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Grid,
  Modal,
  IconButton,
  Button,
  TextField,
} from '@mui/material';
import {
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText
} from '@mui/material';
import StorefrontTwoToneIcon from '@mui/icons-material/StorefrontTwoTone';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Divider from '@mui/material/Divider';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@mui/material/styles';
import apiCalls from 'apicall';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';

function Post({ blockEdit = false, enableEditing = true }) {
  const [listViewData, setListViewData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openViewMoreModal, setOpenViewMoreModal] = useState(false);
  const orgId = localStorage.getItem('orgId');
  const id = localStorage.getItem('id');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const loginUserName = localStorage.getItem('userName');
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [formData, setFormData] = useState({
    active: true,
    circularTopic: '',
    circularcontent: '',
    postImage: '',
  });


  const [editId, setEditId] = useState('');

  const theme = useTheme();

  // Add this function near your other handler functions
  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
  };


  // Fetch all circulars on component mount
  useEffect(() => {
    getAllCircularByOrgId();
    getLeaveProcessByOrgId();
  }, [orgId]);

  const getLeaveProcessByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/basicmaster/GetCountOfPraiseByOrgIdAndCircularId?circularid=${id}&orgId=${orgId}`);
      if (result && result.paramObjectsMap && result.paramObjectsMap.leaveProcessVO.reverse()) {
        setListViewData(result.paramObjectsMap.leaveProcessVO.reverse());
      } else {
        setListViewData([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setListViewData([]);
    }
  };


  // Fetch all circulars by organization ID
  const getAllCircularByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/basicmaster/getAllCircularByOrgId?orgId=${orgId}`);
      if (result?.paramObjectsMap?.circularVO) {
        const formattedData = result.paramObjectsMap.circularVO
          .map((item, index) => ({
            id: item.circularId || index,
            ...item,
          }))
          .reverse();
        setListViewData(formattedData);
      } else {
        setListViewData([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setListViewData([]);
    }
  };

  // Handle image click to open modal
  const handleImageClick = (image) => {
    setSelectedImage(image);
    setOpenModal(true);
  };

  // Close the image modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedImage(null);
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, postImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch circular by ID for editing
  const getCircularById = async (row) => {
    const postId = row.id || row.original?.id;
    if (!postId) {
      console.error('Invalid row data (missing ID):', row);
      toast.error('Invalid row data (missing ID)');
      return;
    }

    setEditId(postId);

    try {
      const result = await apiCalls('get', `/basicmaster/getCircularById?id=${postId}`);
      if (result?.paramObjectsMap?.circularVO) {
        const circularData = result.paramObjectsMap.circularVO;
        setFormData({
          active: circularData.active === 'Active',
          circularTopic: circularData.circularTopic,
          circularcontent: circularData.circularcontent,
          postImage: circularData.postImage,
        });
        setOpenCreateModal(true);
      } else {
        toast.error('Failed to fetch circular data');
      }
    } catch (err) {
      console.error('Error fetching circular data:', err);
      toast.error('Failed to fetch circular data');
    }
  };

  // Handle save or update of a circular
  const handleSave = async () => {
    const errors = {};
    if (!formData.circularTopic) errors.circularTopic = 'Circular Topic is required';
    if (!formData.circularcontent) errors.circularcontent = 'Circular content is required';
    if (!orgId) errors.orgId = 'Organization ID is required';
    if (!loginUserName) errors.createdBy = 'Created By is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    const saveFormData = {
      ...(editId && { id: editId }),
      active: formData.active,
      circularTopic: formData.circularTopic,
      circularcontent: formData.circularcontent,
      postImage: formData.postImage || null,
      orgId: orgId,
      createdBy: loginUserName,
    };

    try {
      const result = await apiCalls('put', `/basicmaster/createUpdateCircular`, saveFormData);
      if (result.status === true) {
        toast.success(editId ? 'Post Updated Successfully' : 'Post created successfully');
        setIsLoading(false);
        setOpenCreateModal(false);
        getAllCircularByOrgId();
        setFormData({ circularTopic: '', circularcontent: '', postImage: '' });
        setEditId('');
      } else {
        toast.error(result.paramObjectsMap?.errorMessage || 'Post creation failed');
        setIsLoading(false);
      }
    } catch (err) {
      console.log('error', err);
      toast.error('Post creation failed. Please check the data and try again.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
        .css-vh9s07{
        padding: 10px;
        }
        .css-19h80yh-MuiGrid-root>.MuiGrid-item {
        padding-top: 0px;
        }
          .css-19kzrtu {
            padding: 0px !important;
          }
          .css-aqz1n5-MuiGrid-root {
            margin: 0 !important;
            padding: 0 !important;
          }
          .css-11l5t4l-MuiGrid-root {
            margin: 0 !important;
            padding: 0 !important;
          }
         
          .view-more-modal {
            overflow-y: auto;
            max-height: 80vh;
            padding: 16px;
          }
          .modal-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 24px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            outline: none;
          }
          .modal-image {
            max-width: 100%;
            max-height: 80vh;
            border-radius: 8px;
          }
          .modal-close-button {
            position: absolute;
            top: 8px;
            right: 8px;
          }
            .css-g0x6gi-MuiGrid-root{
                 margin-left:0px;
            }
          .css-g0x6gi-MuiGrid-root>.MuiGrid-item {
    padding-left: 0px;
         padding-left: 0px;
              padding-top: 0px;
}
              .css-1139et6-MuiCardContent-root:last-child {
    padding-bottom: 0px;
}
    
.css-1w25cgw-MuiCardActions-root {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex
;
    -webkit-align-items: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    padding: 8px;
    padding: 0px;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex
;
    -webkit-align-items: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    gap: 0px;
}
    
        `}
      </style>
      <Box sx={{ p: 4, background: "linear-gradient(45deg, #f3f4f6, #e5e7eb)" }}>
        <ToastContainer />
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {listViewData.length > 0 ? (
            <Grid item xs={12}>
              <Card
                className="post-card"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  boxShadow: 3,
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 6,
                  },
                }}
              >
                {listViewData[0].postImage && (
                  <CardMedia
                    component="img"
                    height="300"
                    image={listViewData[0].postImage}
                    alt="Post Image"
                    onClick={() => handleImageClick(listViewData[0].postImage)}
                    sx={{
                      cursor: "pointer",
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                      objectFit: "cover",
                    }}
                  />
                )}

                <CardContent sx={{ p: 4 }}>
                  <div className='d-flex justify-content-between align-items-baseline'>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        color: "text.primary",
                        fontFamily: "'Merriweather', serif",
                      }}
                    >
                      {listViewData[0].circularTopic}
                    </Typography>
                    <CardActions sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        aria-label="like"
                        onClick={handleLike}
                        sx={{
                          color: isLiked ? theme.palette.primary.main : 'inherit',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.08)'
                          }
                        }}
                      >
                        {isLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                      </IconButton>
                      <Typography variant="body2" color="text.secondary">
                        {likes}
                      </Typography>
                    </CardActions>
                  </div>

                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.secondary",
                      fontSize: "1rem",
                      lineHeight: 1.6,
                      fontFamily: "'Open Sans', sans-serif",
                    }}
                  >
                    {listViewData[0].circularcontent}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

          ) : (
            <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Typography
                variant="body1"
                sx={{
                  textAlign: "center",
                  color: "text.secondary",
                  fontSize: "1.125rem",
                  fontStyle: "italic",
                  p: 3,
                  borderRadius: 2,
                  boxShadow: 1,
                  background: "rgba(255, 255, 255, 0.8)",
                }}
              >
                No circulars available
              </Typography>
            </Grid>
          )}
        </Grid>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 3,
            animation: "fadeIn 0.5s ease-in-out",
          }}
        >
          <IconButton
            color="primary"
            aria-label="add news"
            onClick={() => {
              setFormData({ circularTopic: "", circularcontent: "", postImage: "" });
              setEditId("");
              setOpenCreateModal(true);
            }}
            sx={{
              background: "linear-gradient(45deg, #3f51b5, #2196f3)",
              color: "white",
              "&:hover": {
                background: "linear-gradient(45deg, #2196f3, #3f51b5)",
              },
            }}
          >
            <AddIcon />
          </IconButton>

          <Button
            variant="contained"
            color="primary"
            endIcon={<MoreHorizIcon />}
            onClick={() => setOpenViewMoreModal(true)}
            sx={{
              background: "linear-gradient(45deg, #3f51b5, #2196f3)",
              "&:hover": {
                background: "linear-gradient(45deg, #2196f3, #3f51b5)",
              },
            }}
          >
            View More
          </Button>
        </Box>
        {/* Debugging: Log listViewData */}
        {console.log("listViewData:", listViewData)}
      </Box>

      {/* Image Modal */}
      <Modal open={openModal} onClose={handleCloseModal} BackdropProps={{ style: { backdropFilter: 'blur(4px)' } }}>
        <Box className="modal-container">
          <IconButton className="modal-close-button" onClick={handleCloseModal}>
            <CloseIcon />
          </IconButton>
          {selectedImage && <img src={selectedImage} alt="Full View" className="modal-image" />}
        </Box>
      </Modal>

      {/* Create Post Modal */}
      <Modal open={openCreateModal} onClose={() => setOpenCreateModal(false)} BackdropProps={{ style: { backdropFilter: 'blur(4px)' } }}>
        <Box className="modal-container" sx={{ bgcolor: 'white', p: 3, borderRadius: 2, width: 400, mx: 'auto', mt: '10%' }}>
          <Typography variant="h6" mb={2}>{editId ? 'Edit Post' : 'Create Post'}</Typography>
          <TextField
            label="Topic"
            fullWidth
            name="circularTopic"
            value={formData.circularTopic}
            onChange={(e) => setFormData({ ...formData, circularTopic: e.target.value })}
            error={!!fieldErrors.circularTopic}
            helperText={fieldErrors.circularTopic}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Content"
            fullWidth
            name="circularcontent"
            multiline
            rows={3}
            value={formData.circularcontent}
            onChange={(e) => setFormData({ ...formData, circularcontent: e.target.value })}
            error={!!fieldErrors.circularcontent}
            helperText={fieldErrors.circularcontent}
            sx={{ mb: 2 }}
          />
          <input type="file" accept="image/*" name="postImage" onChange={handleImageUpload} style={{ marginBottom: '16px' }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="contained" color="secondary" onClick={() => setOpenCreateModal(false)}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : editId ? 'Update' : 'Post'}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* View More Modal */}
      <Modal open={openViewMoreModal} onClose={() => setOpenViewMoreModal(false)} BackdropProps={{ style: { backdropFilter: 'blur(4px)' } }}>
        <Box className="view-more-modal" sx={{ bgcolor: 'white', p: 3, borderRadius: 2, width: '80%', mx: 'auto', mt: '5%' }}>
          <Typography variant="h5" mb={3}>All Post</Typography>
          <List sx={{ py: 0 }}>
            {listViewData.map((item) => (
              <Box key={item.id}>
                <ListItem
                  alignItems="flex-start"
                  disableGutters
                  sx={{ py: 1 }}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => getCircularById(item)}>
                      <EditIcon />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      variant="rounded"
                      sx={{
                        ...theme.typography.commonAvatar,
                        ...theme.typography.largeAvatar,
                        backgroundColor: theme.palette.primary.light,
                        color: theme.palette.primary.dark
                      }}
                    >
                      <StorefrontTwoToneIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                        {item.topic}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {item.circularTopic}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mt: 0.5 }}>
                          {new Date(item.circularcontent).toLocaleDateString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider sx={{ my: 1, backgroundColor: theme.palette.divider }} />
              </Box>
            ))}
          </List>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="contained" color="secondary" onClick={() => setOpenViewMoreModal(false)}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

export default Post;