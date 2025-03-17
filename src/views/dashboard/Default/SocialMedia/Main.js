import React, { useState } from 'react';
import { Box, Typography, Button, Modal, TextField } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import PostIcon from '@mui/icons-material/PostAdd'; // Icon for POST
import PollIcon from '@mui/icons-material/Poll'; // Icon for POLL
import PraiseIcon from '@mui/icons-material/ThumbUp'; // Icon for PRAISE
import Post from './Post';
import Poll from './Poll'; // Ensure this import is correct
import Praise from './Praise';

// Styled Components
const CardWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  overflow: 'hidden',
  position: 'relative',
  borderRadius: '12px',
  padding: '16px',
  transition: 'background-color 0.5s ease',
  '&:after, &:before': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: theme.palette.primary[800],
    borderRadius: '50%',
    opacity: 0.1,
  },
  '&:after': { top: -85, right: -95 },
  '&:before': { top: -125, right: -15 },
}));

// Modal Style
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '12px',
};

// Create Post Modal Component
const CreatePostModal = ({ open, handleClose, handleCreatePost, postContent, isEdit, handleEditPost }) => {
  const [subject, setSubject] = useState(postContent?.subject || ''); // Subject state
  const [content, setContent] = useState(postContent?.content || ''); // Content state

  const handleSubmit = () => {
    if (isEdit) {
      handleEditPost({ subject, content });
    } else {
      handleCreatePost({ subject, content });
    }
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {isEdit ? 'Edit Post' : 'Create a New Post'}
        </Typography>
        <TextField
          fullWidth
          label="Subject"
          variant="outlined"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Post Content"
          variant="outlined"
          multiline
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            {isEdit ? 'Update Post' : 'Create Post'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

const Main = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0); // Main tab state (Organization or IT)
  const [nestedTabValue, setNestedTabValue] = useState('POST'); // Nested tab state (POST, POLL, PRAISE)
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false); // Post modal state
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false); // Edit post modal state
  const [organizationPosts, setOrganizationPosts] = useState([]); // Organization posts
  const [itPosts, setItPosts] = useState([]); // IT posts
  const [postToEdit, setPostToEdit] = useState(null); // Post to edit
  const [currentPostIndex, setCurrentPostIndex] = useState(0); // Track the current post index in the modal

  // Handle creating a new post
  const handleCreatePost = (post) => {
    if (tabValue === 0) {
      setOrganizationPosts([...organizationPosts, post]); // Add to Organization posts
    } else {
      setItPosts([...itPosts, post]); // Add to IT posts
    }
  };

  // Handle editing a post
  const handleEditPost = (post) => {
    if (tabValue === 0) {
      const updatedPosts = organizationPosts.map((p, index) =>
        index === postToEdit ? post : p
      );
      setOrganizationPosts(updatedPosts);
    } else {
      const updatedPosts = itPosts.map((p, index) =>
        index === postToEdit ? post : p
      );
      setItPosts(updatedPosts);
    }
    setPostToEdit(null);
  };

  // Handle opening edit post modal
  const handleOpenEditPostModal = (index) => {
    setPostToEdit(index);
    setIsEditPostModalOpen(true);
  };

  // Handle next post
  const handleNextPost = () => {
    const posts = tabValue === 0 ? organizationPosts : itPosts;
    if (currentPostIndex < posts.length - 1) {
      setCurrentPostIndex(currentPostIndex + 1);
    } else {
      setCurrentPostIndex(0); // Loop back to the first post
    }
  };

  // Handle previous post
  const handlePreviousPost = () => {
    const posts = tabValue === 0 ? organizationPosts : itPosts;
    if (currentPostIndex > 0) {
      setCurrentPostIndex(currentPostIndex - 1);
    } else {
      setCurrentPostIndex(posts.length - 1); // Loop back to the last post
    }
  };

  // Get current posts based on tab
  const posts = tabValue === 0 ? organizationPosts : itPosts;
  const currentPost = posts[currentPostIndex];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Custom Buttons for Organization and IT */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant={tabValue === 0 ? 'contained' : 'outlined'}
          onClick={() => setTabValue(0)}
          sx={{
            textTransform: 'none',
            fontWeight: 500,
            backgroundColor: tabValue === 0 ? theme.palette.primary.main : 'transparent',
            color: tabValue === 0 ? '#fff' : theme.palette.text.primary,
            '&:hover': {
              backgroundColor: tabValue === 0 ? theme.palette.primary.dark : theme.palette.action.hover,
            },
          }}
        >
          Organization
        </Button>
        <Button
          variant={tabValue === 1 ? 'contained' : 'outlined'}
          onClick={() => setTabValue(1)}
          sx={{
            textTransform: 'none',
            fontWeight: 500,
            backgroundColor: tabValue === 1 ? theme.palette.secondary.main : 'transparent',
            color: tabValue === 1 ? '#fff' : theme.palette.text.primary,
            '&:hover': {
              backgroundColor: tabValue === 1 ? theme.palette.secondary.dark : theme.palette.action.hover,
            },
          }}
        >
          IT
        </Button>
      </Box>

      {/* Content for Organization or IT Tab */}
      <CardWrapper>
        {/* Nested Tabs for POST, POLL, PRAISE */}
        <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-start' }}>
          <Box
            onClick={() => setNestedTabValue('POST')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              color: nestedTabValue === 'POST' ? theme.palette.primary.main : theme.palette.text.secondary,
              fontWeight: 600,
              '&:hover': {
                color: theme.palette.primary.main,
              },
            }}
          >
            <PostIcon />
            <Typography variant="h6" style={{ fontSize: '14px' }}>POST</Typography>
          </Box>
          <Box
            onClick={() => setNestedTabValue('POLL')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              color: nestedTabValue === 'POLL' ? theme.palette.primary.main : theme.palette.text.secondary,
              fontWeight: 600,
              '&:hover': {
                color: theme.palette.primary.main,
              },
            }}
          >
            <PollIcon />
            <Typography variant="h6" style={{ fontSize: '14px' }}>POLL</Typography>
          </Box>
          <Box
            onClick={() => setNestedTabValue('PRAISE')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              color: nestedTabValue === 'PRAISE' ? theme.palette.primary.main : theme.palette.text.secondary,
              fontWeight: 600,
              '&:hover': {
                color: theme.palette.primary.main,
              },
            }}
          >
            <PraiseIcon />
            <Typography variant="h6" style={{ fontSize: '14px' }}>PRAISE</Typography>
          </Box>
        </Box>

        {/* Content for POST Tab */}
        {nestedTabValue === 'POST' && (
          <Box sx={{ mt: 3 }}>
            {/* Removed the heading */}
            <Post />
          </Box>
        )}

        {/* Content for POLL Tab */}
        {nestedTabValue === 'POLL' && (
          <Box sx={{ mt: 3 }}>
            {/* Removed the heading */}
            <Poll />
          </Box>
        )}

        {/* Content for PRAISE Tab */}
        {nestedTabValue === 'PRAISE' && (
          <Box sx={{ mt: 3 }}>
            {/* Removed the heading */}
            <Praise />
          </Box>
        )}
      </CardWrapper>

      {/* Modals */}
      <CreatePostModal
        open={isCreatePostModalOpen || isEditPostModalOpen}
        handleClose={() => {
          setIsCreatePostModalOpen(false);
          setIsEditPostModalOpen(false);
          setPostToEdit(null);
        }}
        handleCreatePost={handleCreatePost}
        handleEditPost={handleEditPost}
        postContent={postToEdit !== null ? (tabValue === 0 ? organizationPosts[postToEdit] : itPosts[postToEdit]) : null}
        isEdit={isEditPostModalOpen}
      />
    </Box>
  );
};

export default Main;