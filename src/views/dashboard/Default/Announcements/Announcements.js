import React, { useState, useEffect } from 'react';
import CampaignIcon from "@mui/icons-material/Campaign";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
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
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import StorefrontTwoToneIcon from '@mui/icons-material/StorefrontTwoTone';
import { useTheme } from '@mui/material/styles';
import apiCalls from 'apicall';
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

function Announcements({ blockEdit = false, enableEditing = true }) {
  const [listViewData, setListViewData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openViewMoreModal, setOpenViewMoreModal] = useState(false);
  const orgId = localStorage.getItem('orgId');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const loginUserName = localStorage.getItem('userName');

  const [formData, setFormData] = useState({
    active: true,
    topic: '',
    announcement: '',
  });
  const [editId, setEditId] = useState('');

  const theme = useTheme();

  // Fetch all announcements on component mount
  useEffect(() => {
    GetAnnouncementByOrgId();
  }, [orgId]);

  // Fetch all announcements by organization ID
  const GetAnnouncementByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/basicmaster/GetAnnouncementByOrgId?orgId=${orgId}`);
      if (result?.paramObjectsMap?.announcementVO) {
        const formattedData = result.paramObjectsMap.announcementVO.reverse();
        setListViewData(formattedData);
      } else {
        setListViewData([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to fetch announcements');
      setListViewData([]);
    }
  };

  // Fetch announcement by ID for editing
  const getAnnouncementById = async (row) => {
    const postId = row.id || row.original?.id;
    if (!postId) {
      console.error('Invalid row data (missing ID):', row);
      toast.error('Invalid row data (missing ID)');
      return;
    }

    setEditId(postId);

    try {
      const result = await apiCalls('get', `/basicmaster/GetAnnouncementById?id=${postId}`);
      if (result?.paramObjectsMap?.announcementVO) {
        const announcementData = result.paramObjectsMap.announcementVO;
        setFormData({
          active: announcementData.active === 'Active',
          topic: announcementData.topic,
          announcement: announcementData.announcement,
        });
        setOpenCreateModal(true);
      } else {
        toast.error('Failed to fetch announcement data');
      }
    } catch (err) {
      console.error('Error fetching announcement data:', err);
      toast.error('Failed to fetch announcement data');
    }
  };

  // Handle save (create or update)
  const handleSave = async () => {
    const errors = {};
    if (!formData.topic) errors.topic = 'Topic is required';
    if (!formData.announcement) errors.announcement = 'Announcement is required';
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
      topic: formData.topic,
      announcement: formData.announcement,
      orgId: orgId,
      createdBy: loginUserName,
    };

    try {
      const result = await apiCalls('put', `/basicmaster/createUpdateAnnouncement`, saveFormData);
      if (result.status === true) {
        toast.success(editId ? 'Announcement Updated Successfully' : 'Announcement created successfully');
        setIsLoading(false);
        setOpenCreateModal(false);
        GetAnnouncementByOrgId();
        setFormData({ topic: '', announcement: '' });
        setEditId('');
      } else {
        toast.error(result.paramObjectsMap?.errorMessage || 'Announcement creation failed');
        setIsLoading(false);
      }
    } catch (err) {
      console.log('error', err);
      toast.error('Announcement creation failed. Please check the data and try again.');
      setIsLoading(false);
    }
  };

  // Close create modal and reset form
  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    setFormData({ topic: '', announcement: '' });
    setEditId('');
  };

  return (
    <>
      <style>
        {` 
       .css-18oxjtg-MuiGrid-root>.MuiGrid-item {
                 padding-left: 45px;
                 padding-top: 5px;
        }
        .css-13v5gjb-MuiPaper-root-MuiCard-root {
        padding:0px;
        }
       `}
      </style>
      <Box sx={{ p: 3 }}>
        <ToastContainer />
        <Grid container spacing={6} sx={{ mt: 2, position: "relative" }}>
          {listViewData.length > 0 ? (
            listViewData.slice(0, 2).map((item) => ( // Show first two announcements
              <Grid item key={item.id} xs={12} md={12} lg={12} sm={12}> {/* Two announcements side by side on larger screens */}
                <Card
                  sx={{
                    p: 4,
                    position: "relative",
                    bgcolor: "rgba(255, 255, 255, 0.9)", // Slight transparency
                    boxShadow: 3,
                    borderRadius: 2,
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      backgroundImage: "url('/path-to-your-image.jpg')", // Replace with actual path
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      opacity: 0.2, // Light background effect
                      zIndex: -1,
                    },
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <CampaignIcon sx={{ fontSize: 32, color: "primary.main" }} />
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {item.topic}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mt: 1, color: "text.secondary" }}>
                      {item.announcement}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                sx={{ mt: 4 }}
              >
                <NotificationsActiveIcon sx={{ fontSize: 64, color: "text.disabled" }} />
                <Typography variant="h6" sx={{ mt: 2, color: "text.disabled" }}>
                  No announcements available
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        {listViewData.length > 1 && (
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
        )}
      </Box>

      {/* Create/Edit Announcement Modal */}
      <Modal open={openCreateModal} onClose={handleCloseCreateModal} BackdropProps={{ style: { backdropFilter: 'blur(4px)' } }}>
        <Box className="modal-container" sx={{ bgcolor: 'white', p: 3, borderRadius: 2, width: 400, mx: 'auto', mt: '10%' }}>
          <Typography variant="h6" mb={2}>{editId ? 'Edit Announcement' : 'Create Announcement'}</Typography>
          <TextField
            label="Topic"
            fullWidth
            name="topic"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            error={!!fieldErrors.topic}
            helperText={fieldErrors.topic}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Content"
            fullWidth
            name="announcement"
            multiline
            rows={3}
            value={formData.announcement}
            onChange={(e) => setFormData({ ...formData, announcement: e.target.value })}
            error={!!fieldErrors.announcement}
            helperText={fieldErrors.announcement}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="contained" color="secondary" onClick={handleCloseCreateModal}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : editId ? 'Update' : 'Post'}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* View More Modal */}
      <Modal open={openViewMoreModal} onClose={() => setOpenViewMoreModal(false)} BackdropProps={{ style: { backdropFilter: 'blur(4px)' } }}>
        <Box className="view-more-modal" sx={{ bgcolor: 'white', p: 3, borderRadius: 2, width: '80%', mx: 'auto', mt: '5%' }}>
          <Typography variant="h5" mb={3}>All Announcements</Typography>
          <List sx={{ py: 0 }}>
            {listViewData.map((item) => (
              <Box key={item.id}>
                <ListItem
                  alignItems="flex-start"
                  disableGutters
                  sx={{ py: 1 }}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => getAnnouncementById(item)}>
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
                          {item.announcement}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mt: 0.5 }}>
                          {new Date(item.createdAt).toLocaleDateString()}
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

export default Announcements;