import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardMedia, Paper, Modal, IconButton, Button, TextField } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import Carousel from 'react-material-ui-carousel';
import CloseIcon from '@mui/icons-material/Close';
import apiCalls from 'apicall';

function Post() {
  const [listViewData, setListViewData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({ topic: '', content: '', image: '' });
  const orgId = localStorage.getItem('orgId');
  

  useEffect(() => {
    getAllCircularByOrgId();
  }, [orgId]);

  const getAllCircularByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/basicmaster/getAllCircularByOrgId?orgId=${orgId}`);
      if (result?.paramObjectsMap?.circularVO) {
        const formattedData = result.paramObjectsMap.circularVO.map((item, index) => ({
          id: item.circularId || index,
          ...item,
        })).reverse();
        setListViewData(formattedData);
      } else {
        setListViewData([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setListViewData([]);
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedImage(null);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPost({ ...newPost, image: reader.result }); // Store Base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.topic || !newPost.content) {
      toast.error('Topic and content are required!');
      return;
    }
    try {
      await apiCalls('post', '/basicmaster/createCircular', {
        orgId,
        circularTopic: newPost.topic,
        circularcontent: newPost.content,
        postImage: newPost.image,
      });
      toast.success('Post created successfully!');
      setOpenCreateModal(false);
      setNewPost({ topic: '', content: '', image: '' });
      getAllCircularByOrgId();
    } catch (err) {
      console.error('Error creating post:', err);
      toast.error('Failed to create post');
    }
  };

  return (
    <>
      <style>
        {`
          .css-178yklu {
            margin-top: 0px;
          }
        `}
      </style>
      <Card className="custom-card css-178yklu">
        <ToastContainer />
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Posts</Typography>
          <Button variant="contained" color="primary" onClick={() => setOpenCreateModal(true)}>
            Create Post
          </Button>
        </Box>
        <Box sx={{ mt: 3 }}>
          {listViewData.length > 0 ? (
            <Carousel animation="slide" indicators={false} cycleNavigation={true}>
              {listViewData.map((item) => (
                <Paper key={item.id} className="custom-carousel-item">
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {item.circularTopic}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.5 }}>
                    {item.circularcontent}
                  </Typography>
                  {item.postImage && (
                    <CardMedia
                      component="img"
                      height="50"
                      width="50"
                      image={item.postImage}
                      alt="Post Image"
                      className="custom-card-media"
                      onClick={() => handleImageClick(item.postImage)}
                    />
                  )}
                </Paper>
              ))}
            </Carousel>
          ) : (
            <Typography variant="body1" className="custom-no-circulars">
              No circulars available
            </Typography>
          )}
        </Box>
      </Card>

      {/* Image Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box className="modal-container">
          <IconButton className="modal-close-button" onClick={handleCloseModal}>
            <CloseIcon />
          </IconButton>
          {selectedImage && <img src={selectedImage} alt="Full View" className="modal-image" />}
        </Box>
      </Modal>

      {/* Create Post Modal */}
      <Modal open={openCreateModal} onClose={() => setOpenCreateModal(false)}>
        <Box className="modal-container" sx={{ bgcolor: 'white', p: 3, borderRadius: 2, width: 400, mx: 'auto', mt: '10%' }}>
          <Typography variant="h6" mb={2}>Create Post</Typography>

          <TextField
            label="Topic"
            fullWidth
            value={newPost.topic}
            onChange={(e) => setNewPost({ ...newPost, topic: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Content"
            fullWidth
            multiline
            rows={3}
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            sx={{ mb: 2 }}
          />

          {/* File Upload Field */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ marginBottom: '16px' }}
          />

          {/* Show Image Preview if Uploaded */}
          {newPost.image && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <img src={newPost.image} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }} />
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="contained" color="secondary" onClick={() => setOpenCreateModal(false)}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleCreatePost}>Post</Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

export default Post;