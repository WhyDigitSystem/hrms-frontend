import React, { useState, useEffect, useCallback } from 'react';
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
  FormControlLabel,
  FormControl,
  CircularProgress,
  RadioGroup,
  Radio,
  Chip,
  Avatar
} from '@mui/material';
import PollIcon from '@mui/icons-material/Poll';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useTheme } from '@mui/material/styles';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';

function Poll({ }) {
  const theme = useTheme();
  const [polls, setPolls] = useState([]);
  const [listViewData, setListViewData] = useState([]);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [editId, setEditId] = useState('');
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [department, setDepartment] = useState(localStorage.getItem('department'));
  const [newPoll, setNewPoll] = useState({
    question: '',
    expiresAt: '',
    maxSelection: 1,
    multiSelect: false
  });
  const [pollDetails, setPollDetails] = useState(["", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    getAllPolls();
  }, []);

  const getAllPolls = async () => {
    try {
      const result = await apiCalls('get', `/basicmaster/getAllPollsByOrgId?orgId=${orgId}`);
      if (result && result.paramObjectsMap.pollsVO) {
        const transformed = result.paramObjectsMap.pollsVO.map(poll => ({
          ...poll,
          options: poll.pollDetailsVO.map(option => ({
            id: option.id,
            text: option.options, // backend uses `options` for label, frontend expects `text`
            votes: option.votes || 0 // defaulting in case backend adds votes later
          }))
        }));
        setPolls(transformed);
        setListViewData(transformed);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
        const updateData = (data) => data.map(poll => {
          if (poll.id === pollId) {
            const updatedOptions = poll.options.map(option => ({
              ...option,
              votes: option.id === selectedOption ? option.votes + 1 : option.votes
            }));
            const totalVotes = updatedOptions.reduce((sum, opt) => sum + opt.votes, 0);
            return { ...poll, options: updatedOptions, totalVotes, hasVoted: true };
          }
          return poll;
        });

        setPolls(prev => updateData(prev));
        setListViewData(prev => updateData(prev));
        toast.success('Your vote has been submitted!');
      } else {
        toast.error(response?.message || 'Failed to submit vote');
      }
    } catch (error) {
      toast.error('Error submitting vote');
      console.error('Voting error:', error);
    } finally {
      setIsLoading(false);
      setSelectedOptions(prev => ({ ...prev, [pollId]: null }));
    }
  };

  const handleSave = async () => {
    const errors = {};

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);

      const pollDetailsVo = pollDetails.map((opt) => ({
        options: opt
      }));

      const saveData = {
        ...(editId && { id: editId }),
        active: true,
        branchCode: branchCode,
        branchName: branch,
        createdBy: loginUserName,
        department: department,
        maxSelection: newPoll.maxSelection,
        multiSelect: newPoll.multiSelect,
        orgId: orgId,
        pollDetailsDTO: pollDetailsVo,
        question: newPoll.question,
        updatedBy: loginUserName
      };

      console.log('DATA TO SAVE IS:', saveData);

      try {
        const response = await apiCalls('put', '/basicmaster/createUpdatepolls', saveData);

        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? 'Polls Updated Successfully' : 'Polls created successfully');
          getAllPolls();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Polls creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'polls creation failed');
        setIsLoading(false);
      }
    } else {
    }
  };

  const handleOptionChange = (index, value) => {
    const updated = [...pollDetails];
    updated[index] = value;
    setPollDetails(updated);
  };

  const removeOption = (index) => {
    const updated = pollDetails.filter((_, i) => i !== index);
    setPollDetails(updated);
  };

  const addOptionField = () => {
    setPollDetails([...pollDetails, '']);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading && polls.length === 0 && !fetchError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  console.log("Listview", polls)

  return (
    <Box sx={{ p: 2 }}>
      <ToastContainer position="top-right" autoClose={5000} />
      <Grid container spacing={3}>
        {listViewData.length > 0 ? (
          listViewData.map(poll => (
            <Grid item xs={12} md={6} lg={4} key={poll.id}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  width: '600px',
                  display: 'flex',
                  flexDirection: 'column',
                  borderColor: poll.hasVoted ? theme.palette.success.light : theme.palette.primary.light,
                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Chip
                      label={poll.hasVoted ? 'Voted' : 'Active'}
                      size="small"
                      color={poll.hasVoted ? 'success' : 'primary'}
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(poll.createdDate)}
                    </Typography>
                  </Box>

                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
                    {poll.question}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PeopleIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="caption" color="text.secondary">
                        {poll.totalVotes} votes
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="caption" color="text.secondary">
                        {poll.expiresAt ? `Ends ${formatDate(poll.expiresAt)}` : 'No deadline'}
                      </Typography>
                    </Box>
                  </Box>

                  {poll.hasVoted ? (
                    <>
                      {poll.options.map(option => (
                        <Box key={option.id} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {option.text}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {Math.round((option.votes / (poll.totalVotes || 1)) * 100)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(option.votes / (poll.totalVotes || 1)) * 100}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: theme.palette.grey[200],
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: theme.palette.primary.main
                              }
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                            {option.votes} votes
                          </Typography>
                        </Box>
                      ))}
                    </>
                  ) : (
                    <FormControl component="fieldset" fullWidth>
                      <RadioGroup
                        value={selectedOptions[poll.id] || ''}
                        onChange={(e) =>
                          setSelectedOptions(prev => ({ ...prev, [poll.id]: e.target.value }))
                        }
                      >
                        <Grid container spacing={1}>
                          {poll.options.map(option => (
                            <Grid item xs={12} sm={4} key={option.id}>
                              <FormControlLabel
                                value={option.id}
                                control={<Radio color="primary" />}
                                label={
                                  <Typography variant="body2">
                                    {option.text}
                                  </Typography>
                                }
                                sx={{
                                  mb: 1,
                                  borderRadius: 1,
                                  padding: '4px 8px',
                                  width: '100%',
                                  '&:hover': {
                                    backgroundColor: theme.palette.action.hover
                                  }
                                }}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </RadioGroup>
                      <Button
                        variant="contained"
                        size="medium"
                        startIcon={<HowToVoteIcon />}
                        onClick={() => handleVote(poll.id)}
                        sx={{
                          mt: 1,
                          width: '30%',
                          backgroundColor: theme.palette.primary.main,
                          '&:hover': {
                            backgroundColor: theme.palette.primary.dark
                          }
                        }}
                        disabled={isLoading}
                      >
                        Submit Vote
                      </Button>
                    </FormControl>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : !fetchError ? (
          <Grid item xs={12}>
            <Card
              variant="outlined"
              sx={{
                p: 4,
                textAlign: 'center',
                backgroundColor: theme.palette.background.paper,
                border: '2px dashed',
                borderColor: theme.palette.divider
              }}
            >
              <PollIcon sx={{
                fontSize: 60,
                mb: 2,
                color: theme.palette.text.secondary,
                opacity: 0.5
              }} />
              <Typography variant="h6" sx={{ mb: 1 }}>No active polls available</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create a new poll to gather opinions from your organization
              </Typography>
            </Card>
          </Grid>
        ) : null}
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
            setNewPoll({ circularTopic: "", circularcontent: "", postImage: "" });
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
          // onClick={() => setOpenViewMoreModal(true)}
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

      {/* Create Poll Modal */}
      <Modal open={openCreateModal} onClose={() => !isLoading && setOpenCreateModal(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 500,
          bgcolor: 'background.paper',
          p: 3,
          borderRadius: 2,
          boxShadow: 24,
          outline: 'none'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">Create New Poll</Typography>
            <IconButton
              onClick={() => setOpenCreateModal(false)}
              disabled={isLoading}
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.action.hover
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <TextField
            fullWidth
            label="Question *"
            value={newPoll.question}
            onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
            sx={{ mb: 2 }}
            disabled={isLoading}
            variant="outlined"
            size="small"
          />

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Options *</Typography>
          {Array.isArray(pollDetails) &&
            pollDetails.map((opt, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TextField
                  fullWidth
                  label={`Option ${idx + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  sx={{ mr: 1 }}
                  disabled={isLoading}
                  variant="outlined"
                  size="small"
                />
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => removeOption(idx)}
                  disabled={pollDetails.length <= 2 || isLoading}
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.palette.error.light
                    }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}

          <Button
            onClick={addOptionField}
            size="small"
            startIcon={<AddIcon />}
            sx={{ mb: 2 }}
            // disabled={isLoading || newPoll.options.length >= 10}
            variant="outlined"
          >
            Add Option
          </Button>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expiration Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newPoll.expiresAt}
                onChange={(e) => setNewPoll({ ...newPoll, expiresAt: e.target.value })}
                disabled={isLoading}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Selections"
                type="number"
                value={newPoll.maxSelection}
                onChange={(e) => setNewPoll({ ...newPoll, maxSelection: Math.max(1, e.target.value) })}
                inputProps={{ min: 1 }}
                disabled={isLoading}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
            <Button
              variant="outlined"
              size="medium"
              onClick={() => setOpenCreateModal(false)}
              disabled={isLoading}
              sx={{
                color: theme.palette.text.primary,
                borderColor: theme.palette.divider,
                '&:hover': {
                  borderColor: theme.palette.text.primary
                }
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="medium"
              onClick={handleSave}
              disabled={isLoading}
              sx={{
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark
                }
              }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Create Poll'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

export default Poll;