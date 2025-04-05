import React, { useState, useEffect } from 'react';
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
  Radio
} from '@mui/material';
import PollIcon from '@mui/icons-material/Poll';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@mui/material/styles';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';

function Poll({ orgId }) {
  const theme = useTheme();
  const [polls, setPolls] = useState([]);
  const [listViewData, setListViewData] = useState([]);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
    expiresAt: '',
    maxSelection: 1,
    multiSelect: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  useEffect(() => {
    if (orgId) {
      getAllPollsByOrgId();
    }
  }, [orgId]);


  const getAllPollsByOrgId = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/basicmaster/getAllPollsByOrgId?orgId=${orgId}`);
      console.log('Full API response:', response.data);

      if (response.data?.paramObjectsMap?.pollsVO) {
        const pollsData = response.data.paramObjectsMap.pollsVO.map(poll => ({
          id: poll.id,
          question: poll.question,
          options: poll.pollDetailsDTO.map(option => ({
            id: option.id,
            text: option.options,
            votes: option.votes || 0
          })),
          totalVotes: poll.pollDetailsDTO.reduce((sum, opt) => sum + (opt.votes || 0), 0),
          hasVoted: poll.hasVoted || false,
          expiresAt: poll.expiresAt,
          maxSelection: poll.maxSelection,
          multiSelect: poll.multiSelect
        }));

        setPolls(pollsData);
        setListViewData(pollsData);
        setFetchError(null);
      } else {
        setFetchError('No polls data available');
        setPolls([]);
        setListViewData([]);
      }
    } catch (error) {
      console.error('Error fetching polls:', error);
      setFetchError('Failed to load polls. Please try again.');
      setPolls([]);
      setListViewData([]);
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
    if (!newPoll.question || newPoll.options.some(opt => !opt.trim())) {
      toast.error('Question and all options are required');
      return;
    }

    setIsLoading(true);
    try {
      const pollDetailsDTO = newPoll.options.map(opt => ({ options: opt }));
      const payload = {
        question: newPoll.question,
        expiresAt: newPoll.expiresAt,
        maxSelection: newPoll.maxSelection,
        multiSelect: newPoll.multiSelect,
        pollDetailsDTO,
        orgId
      };

      const response = await apiCalls('put', '/basicmaster/createUpdatepolls', payload);
      if (response?.status) {
        showToast('success', 'Poll created successfully');
        setOpenCreateModal(false);
        setNewPoll({
          question: '',
          options: ['', ''],
          expiresAt: '',
          maxSelection: 1,
          multiSelect: false
        });
        getAllPollsByOrgId(); // refresh
      } else {
        showToast('error', response?.message || 'Poll creation failed');
      }
    } catch (error) {
      showToast('error', 'Poll creation failed');
      console.error('Poll creation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...newPoll.options];
    newOptions[index] = value;
    setNewPoll({ ...newPoll, options: newOptions });
  };

  const addOptionField = () => {
    if (newPoll.options.length >= 10) {
      toast.warning('Maximum 10 options allowed');
      return;
    }
    setNewPoll(prev => ({ ...prev, options: [...prev.options, ''] }));
  };

  const removeOption = (index) => {
    if (newPoll.options.length <= 2) {
      toast.warning('Poll must have at least 2 options');
      return;
    }
    const newOptions = newPoll.options.filter((_, idx) => idx !== index);
    setNewPoll({ ...newPoll, options: newOptions });
  };

  if (isLoading && polls.length === 0 && !fetchError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <ToastContainer position="top-right" autoClose={5000} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Current Polls</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateModal(true)}
          disabled={isLoading}
        >
          Create Poll
        </Button>
      </Box>

      {fetchError && (
        <Card variant="outlined" sx={{ mb: 2, borderColor: 'error.main' }}>
          <CardContent>
            <Typography color="error">{fetchError}</Typography>
            <Button
              onClick={() => window.location.reload()}
              variant="outlined"
              color="error"
              sx={{ mt: 1 }}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={2}>
        {listViewData.length > 0 ? (
          listViewData.map(poll => (
            <Box key={poll.id} sx={{ mb: 2 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600}>{poll.question}</Typography>
                  <Divider sx={{ my: 1 }} />

                  {poll.hasVoted ? (
                    <>
                      {poll.options.map(option => (
                        <Box key={option.id} sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            {option.text} - {option.votes} votes
                            ({Math.round((option.votes / (poll.totalVotes || 1)) * 100)}%)
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(option.votes / (poll.totalVotes || 1)) * 100}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      ))}
                      <Typography variant="caption" color="text.secondary">
                        Total votes: {poll.totalVotes}
                      </Typography>
                    </>
                  ) : (
                    <FormControl component="fieldset" fullWidth>
                      <RadioGroup
                        value={selectedOptions[poll.id] || ''}
                        onChange={(e) =>
                          setSelectedOptions(prev => ({ ...prev, [poll.id]: e.target.value }))
                        }
                      >
                        {poll.options.map(option => (
                          <FormControlLabel
                            key={option.id}
                            value={option.id}
                            control={<Radio />}
                            label={option.text}
                          />
                        ))}
                      </RadioGroup>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<HowToVoteIcon />}
                        onClick={() => handleVote(poll.id)}
                        sx={{ mt: 1 }}
                        disabled={isLoading}
                      >
                        Submit Vote
                      </Button>
                    </FormControl>
                  )}
                </CardContent>
              </Card>
            </Box>
          ))
        ) : !fetchError ? (
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <PollIcon sx={{ fontSize: 40, mb: 1, color: theme.palette.text.secondary }} />
              <Typography variant="body1">No active polls available</Typography>
              <Button
                size="small"
                variant="contained"
                onClick={() => setOpenCreateModal(true)}
                startIcon={<AddIcon />}
                sx={{ mt: 1 }}
              >
                Create New Poll
              </Button>
            </Card>
          </Grid>
        ) : null}
      </Grid>

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
          borderRadius: 1,
          outline: 'none'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Create New Poll</Typography>
            <IconButton onClick={() => setOpenCreateModal(false)} disabled={isLoading}>
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
          />

          <Typography variant="subtitle2" sx={{ mb: 1 }}>Options *</Typography>
          {newPoll.options.map((opt, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TextField
                fullWidth
                label={`Option ${idx + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                sx={{ mr: 1 }}
                disabled={isLoading}
              />
              <IconButton
                size="small"
                color="error"
                onClick={() => removeOption(idx)}
                disabled={newPoll.options.length <= 2 || isLoading}
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
            disabled={isLoading || newPoll.options.length >= 10}
          >
            Add Option
          </Button>

          <TextField
            fullWidth
            label="Expiration Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={newPoll.expiresAt}
            onChange={(e) => setNewPoll({ ...newPoll, expiresAt: e.target.value })}
            sx={{ mb: 2 }}
            disabled={isLoading}
          />

          <TextField
            fullWidth
            label="Max Selections"
            type="number"
            value={newPoll.maxSelection}
            onChange={(e) => setNewPoll({ ...newPoll, maxSelection: Math.max(1, e.target.value) })}
            sx={{ mb: 2 }}
            inputProps={{ min: 1 }}
            disabled={isLoading}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setOpenCreateModal(false)}
              sx={{ mr: 1 }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

export default Poll;
