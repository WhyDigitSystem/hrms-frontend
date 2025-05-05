import React, { useState, useEffect } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
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
  Divider,
  LinearProgress,
  FormControl,
  CircularProgress,
  RadioGroup,
  Radio,
  Chip,
  FormControlLabel
} from '@mui/material';
import {
  Poll as PollIcon,
  HowToVote as HowToVoteIcon,
  MoreHoriz as MoreHorizIcon,
  Close as CloseIcon,
  Add as AddIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';

function Poll() {
  const theme = useTheme();
  const [polls, setPolls] = useState([]);
  const [listViewData, setListViewData] = useState([]);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [editId, setEditId] = useState('');
  const [showAllPolls, setShowAllPolls] = useState(false);
  const [pollDetails, setPollDetails] = useState(["", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [newPoll, setNewPoll] = useState({
    question: '',
    expiresAt: '',
    maxSelection: 1,
    multiSelect: false
  });
  const [viewAllModalOpen, setViewAllModalOpen] = useState(false);

  const orgId = localStorage.getItem('orgId');
  const branchCode = localStorage.getItem('branchCode');
  const branch = localStorage.getItem('branch');
  const loginUserName = localStorage.getItem('userName');
  const department = localStorage.getItem('department');

  useEffect(() => {
    getAllPolls();
  }, []);

  const getAllPolls = async () => {
    try {
      setIsLoading(true);
      const result = await apiCalls('get', `/basicmaster/getAllPollsByOrgId?orgId=${orgId}`);
      if (result && result.paramObjectsMap.pollsVO) {
        const transformed = result.paramObjectsMap.pollsVO.map(poll => ({
          ...poll,
          options: poll.pollDetailsVO.map(option => ({
            id: option.id,
            text: option.options,
            votes: option.votes || 0
          }))
        }));
        setPolls(transformed);
        setListViewData(transformed);
      }
    } catch (error) {
      console.error('Error fetching polls:', error);
      setFetchError(error.message || 'Failed to fetch');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (pollId) => {
    const selectedOption = selectedOptions[pollId];
    if (!selectedOption) {
      toast.warning('Please select an option before voting');
      return;
    }
    try {
      setIsLoading(true);
      const response = await apiCalls('post', '/basicmaster/submitVote', {
        pollId,
        optionId: selectedOption,
        orgId
      });

      if (response?.status) {
        const updatedData = polls.map(poll => {
          if (poll.id === pollId) {
            const updatedOptions = poll.options.map(opt =>
              opt.id === selectedOption ? { ...opt, votes: opt.votes + 1 } : opt
            );
            const totalVotes = updatedOptions.reduce((sum, opt) => sum + opt.votes, 0);
            return { ...poll, options: updatedOptions, totalVotes, hasVoted: true };
          }
          return poll;
        });
        setPolls(updatedData);
        setListViewData(updatedData);
        toast.success('Vote submitted successfully!');
      } else {
        toast.error(response?.message || 'Failed to submit vote');
      }
    } catch (error) {
      toast.error('Error submitting vote');
      console.error(error);
    } finally {
      setIsLoading(false);
      setSelectedOptions(prev => ({ ...prev, [pollId]: null }));
    }
  };

  const handleSave = async () => {
    if (!newPoll.question.trim() || pollDetails.length < 2 || pollDetails.some(opt => !opt.trim())) {
      showToast('error', 'Please fill in all required fields properly.');
      return;
    }

    const saveData = {
      ...(editId && { id: editId }),
      active: true,
      branchCode,
      branchName: branch,
      createdBy: loginUserName,
      department,
      maxSelection: newPoll.maxSelection,
      multiSelect: newPoll.multiSelect,
      orgId,
      pollDetailsDTO: pollDetails.map(opt => ({ options: opt })),
      question: newPoll.question,
      expiresAt: newPoll.expiresAt,
      updatedBy: loginUserName
    };

    try {
      setIsLoading(true);
      const response = await apiCalls('put', '/basicmaster/createUpdatepolls', saveData);
      if (response.status) {
        showToast('success', editId ? 'Poll updated successfully' : 'Poll created successfully');
        getAllPolls();
        setOpenCreateModal(false);
      } else {
        showToast('error', response.paramObjectsMap.errorMessage || 'Failed to save poll');
      }
    } catch (error) {
      console.error(error);
      showToast('error', 'Error saving poll');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePollDetailsChange = (index, value) => {
    const updatedPollDetails = [...pollDetails];
    updatedPollDetails[index] = value;
    setPollDetails(updatedPollDetails);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading && polls.length === 0 && !fetchError) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <ToastContainer position="top-right" autoClose={5000} />
      <Grid container spacing={3}>
        {listViewData.length > 0 ? (
          listViewData
            .slice(0, showAllPolls ? listViewData.length : 1)
            .map(poll => (
              <Grid item xs={12} md={6} lg={12} key={poll.id}>
                <Card variant="outlined" sx={{
                  height: '100%',
                  width: '100%',
                  borderColor: poll.hasVoted ? theme.palette.success.light : theme.palette.primary.light,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip label={poll.hasVoted ? 'Voted' : 'Active'} size="small" color={poll.hasVoted ? 'success' : 'primary'} />
                      <Typography variant="caption" color="text.secondary">{formatDate(poll.createdDate)}</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>{poll.question}</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PeopleIcon fontSize="small" />
                        <Typography variant="caption" sx={{ ml: 0.5 }}>{poll.totalVotes || 0} votes</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon fontSize="small" />
                        <Typography variant="caption" sx={{ ml: 0.5 }}>{poll.expiresAt ? `Ends ${formatDate(poll.expiresAt)}` : 'No deadline'}</Typography>
                      </Box>
                    </Box>

                    {poll.hasVoted ? (
                      poll.options.map(option => (
                        <Box key={option.id} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" fontWeight={500}>{option.text}</Typography>
                            <Typography variant="body2">{Math.round((option.votes / (poll.totalVotes || 1)) * 100)}%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={(option.votes / (poll.totalVotes || 1)) * 100} sx={{ height: 8, borderRadius: 4, mt: 0.5 }} />
                          <Typography variant="caption">{option.votes} votes</Typography>
                        </Box>
                      ))
                    ) : (
                      <FormControl component="fieldset" fullWidth>
                        <RadioGroup
                          value={selectedOptions[poll.id] || ''}
                          onChange={(e) => setSelectedOptions(prev => ({ ...prev, [poll.id]: e.target.value }))}
                        >
                          <Grid container spacing={1}>
                            {poll.options.map(option => (
                              <Grid item xs={12} sm={6} key={option.id}>
                                <FormControlLabel
                                  value={option.id}
                                  control={<Radio />}
                                  label={option.text}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </RadioGroup>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>

                          <Button
                            variant="contained"
                            startIcon={<HowToVoteIcon sx={{ fontSize: 20 }} />}
                            onClick={() => handleVote(poll.id)}
                            sx={{
                              mt: 2,
                              width: { xs: '90%', sm: '30%' },
                              fontWeight: 'bold',
                              borderRadius: 2,
                              background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
                              color: 'white',
                              boxShadow: '0 3px 5px 2px rgba(63, 81, 181, .3)',
                              transition: 'all 0.3s ease-in-out',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #2196f3, #3f51b5)',
                                boxShadow: '0 6px 10px 4px rgba(33, 150, 243, .3)',
                                transform: 'scale(1.03)'
                              }
                            }}
                          >
                            Submit Vote
                          </Button>

                        </Box>
                      </FormControl>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
        ) : !fetchError ? (
          <Grid item xs={12}>
            <Card sx={{ p: 5, textAlign: 'center', border: '2px dashed', borderColor: theme.palette.divider }}>
              <PollIcon sx={{ fontSize: 50, color: theme.palette.text.secondary, opacity: 0.5, mb: 2 }} />
              <Typography variant="h6">No active polls</Typography>
              <Typography variant="body2" color="text.secondary">Create a new poll to get started.</Typography>
            </Card>
          </Grid>
        ) : null}
      </Grid>

      <div className='d-flex justify-content-between align-items-center mt-2'>
        <IconButton
          size="large"
          color="primary"
          onClick={() => {
            setNewPoll({ question: '', expiresAt: '', maxSelection: 1, multiSelect: false });
            setPollDetails(["", ""]);
            setEditId('');
            setOpenCreateModal(true);
          }}
          sx={{
            p: 1.5, // increase padding
            background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #2196f3, #3f51b5)'
            }
          }}
        >
          <AddIcon />
        </IconButton>


        <Button
          variant="contained"
          color="primary"
          endIcon={<MoreHorizIcon />}
          onClick={() => setViewAllModalOpen(true)}
          sx={{
            background: "linear-gradient(45deg, #3f51b5, #2196f3)",
            "&:hover": {
              background: "linear-gradient(45deg, #2196f3, #3f51b5)",
            },
          }}
        >
          View More
        </Button>
      </div>

      {/* Edit Poll Modal */}
      <Modal open={openCreateModal} onClose={() => setOpenCreateModal(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
          width: { xs: '90vw', sm: '500px' },
        }}>
          <Typography variant="h6" mb={2}>{editId ? 'Edit Poll' : 'Create Poll'}</Typography>

          <TextField
            label="Question"
            variant="outlined"
            fullWidth
            value={newPoll.question}
            onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Expires At"
            type="date"
            fullWidth
            value={newPoll.expiresAt}
            onChange={(e) => setNewPoll({ ...newPoll, expiresAt: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Max Selection"
            type="number"
            fullWidth
            value={newPoll.maxSelection}
            onChange={(e) => setNewPoll({ ...newPoll, maxSelection: e.target.value })}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
            {pollDetails.map((detail, index) => (
              <TextField
                key={index}
                label={`Option ${index + 1}`}
                fullWidth
                value={detail}
                onChange={(e) => handlePollDetailsChange(index, e.target.value)}
                sx={{ mb: 1 }}
              />
            ))}
          </Box>

          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ width: '100%' }}
          >
            {editId ? 'Save Changes' : 'Create Poll'}
          </Button>
        </Box>
      </Modal>

      {/* View All Polls Modal */}
      <Modal open={viewAllModalOpen} onClose={() => setViewAllModalOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
          width: { xs: '90vw', sm: '500px' },
          maxHeight: '80vh',
          overflow: 'auto'
        }}>
          <Typography variant="h6" mb={2}>All Polls</Typography>
          <Grid container spacing={3}>
            {polls.map(poll => (
              <Grid item xs={12} key={poll.id}>
                <Card variant="outlined" sx={{ width: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">{poll.question}</Typography>
                    <Divider sx={{ mb: 2 }} />
                    {poll.options.map(option => (
                      <Box key={option.id} sx={{ mb: 2 }}>
                        <Typography variant="body2" fontWeight={500}>{option.text}</Typography>
                        <Typography variant="caption">{option.votes} votes</Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Modal>

    </Box>
  );
}

export default Poll;
