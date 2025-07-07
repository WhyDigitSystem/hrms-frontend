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
  FormControlLabel,
  Avatar
} from '@mui/material';
import {
  Poll as PollIcon,
  HowToVote as HowToVoteIcon,
  MoreHoriz as MoreHorizIcon,
  Close as CloseIcon,
  Add as AddIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';

function Poll({ tabValue, setPollData, pollData }) {
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
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [selectedVoters, setSelectedVoters] = useState([]);
  const [selectedOptionText, setSelectedOptionText] = useState('');
  const [newPoll, setNewPoll] = useState({
    question: '',
    expiresDate: '',
    maxSelection: 1,
    multiSelect: false
  });
  const [viewAllModalOpen, setViewAllModalOpen] = useState(false);

  const [votedPolls, setVotedPolls] = useState(() => {
    try {
      const saved = localStorage.getItem('votedPolls');
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? new Set(parsed) : new Set();
    } catch (e) {
      console.error('Failed to parse votedPolls from localStorage:', e);
      return new Set();
    }
  });

  const orgId = localStorage.getItem('orgId');
  const branchCode = localStorage.getItem('branchCode');
  const branchName = localStorage.getItem('branch');
  const department = localStorage.getItem('department');
  const loginUserName = localStorage.getItem('userName');
  const userType = localStorage.getItem('userType');

  useEffect(() => {
    getAllPolls();
  }, []);

  const handleViewVotes = async (pollId, optionId, optionText) => {
    try {
      setIsLoading(true);
      setSelectedOptionText(optionText);

      const response = await apiCalls(
        'get',
        `/basicmaster/getPollResultEmpName?options=${optionText}&orgId=${orgId}&pollId=${pollId}`
      );

      if (response?.paramObjectsMap?.pollVoteVO) {
        const voters = response.paramObjectsMap.pollVoteVO.map(voter => ({
          name: voter.empName,
          branch: voter.branchCode,
          department: voter.department,
          question: voter.question
        }));
        setSelectedVoters(voters);
      } else {
        setSelectedVoters([]);
      }
      setVoteModalOpen(true);
    } catch (error) {
      console.error('Error fetching voted employees:', error);
      toast.error('Failed to fetch voters');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('votedPolls', JSON.stringify(Array.from(votedPolls)));
  }, [votedPolls]);

  const getAllPolls = async () => {
    try {
      setIsLoading(true);
      const type = tabValue === 0 ? 'Organization' : 'IT';

      const endpoint =
        tabValue === 0
          ? `/basicmaster/getAllPollsByOrgId?branchCode=${branchCode}&orgId=${orgId}&type=${type}&department=ALL`
          : `/basicmaster/getAllPollsByOrgId?branchCode=${branchCode}&orgId=${orgId}&department=${department}&type=${type}`;

      const result = await apiCalls('get', endpoint);

      if (result && result.paramObjectsMap.pollsVO) {
        const transformed = await Promise.all(
          result.paramObjectsMap.pollsVO.map(async (poll) => {
            try {
              const voteResponse = await apiCalls(
                'get',
                `/basicmaster/getPollResultForHR?orgId=${orgId}&pollId=${poll.id}`
              );

              const voteMap = {};
              if (voteResponse?.paramObjectsMap?.pollVoteVO) {
                voteResponse.paramObjectsMap.pollVoteVO.forEach((item) => {
                  voteMap[item.options] = parseInt(item.Count, 10);
                });
              }

              const options = poll.pollDetailsVO.map((option) => {
                const optionId = option.id.toString();
                return {
                  id: optionId,
                  text: option.options,
                  votes: voteMap[optionId] || 0
                };
              });

              const totalVotes = Object.values(voteMap).reduce(
                (sum, count) => sum + count, 0
              );

              return {
                ...poll,
                options,
                totalVotes
              };
            } catch (error) {
              console.error(`Error fetching votes for poll ${poll.id}:`, error);
              return {
                ...poll,
                options: poll.pollDetailsVO.map(option => ({
                  id: option.id.toString(),
                  text: option.options,
                  votes: 0
                })),
                totalVotes: 0
              };
            }
          })
        );

        setPolls(transformed);
        setPollData(transformed);
      }
    } catch (error) {
      console.error('Error fetching polls:', error);
      setFetchError(error.message || 'Failed to fetch');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (pollId) => {
    const selectedOptionId = selectedOptions[pollId];
    if (!selectedOptionId) {
      toast.warning('Please select an option before voting');
      return;
    }

    const saveData = [{
      branchCode: branchCode,
      branchName: branchName,
      department: department,
      options: selectedOptionId,
      orgId: parseInt(orgId, 10),
      pollId: pollId,
      question: polls.find(p => p.id === pollId)?.question || '',
      userName: loginUserName,
    }];

    try {
      setIsLoading(true);
      const response = await apiCalls('put', '/basicmaster/createUpdatepollVote', saveData);

      if (response?.status) {
        setVotedPolls(prev => {
          const updated = new Set(prev);
          updated.add(pollId);
          return new Set(updated);
        });

        getAllPolls();
        toast.success('Vote submitted successfully!');
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
    const validOptions = pollDetails.filter(opt => opt.trim() !== '');

    if (!newPoll.question.trim() || validOptions.length < 2) {
      showToast('error', 'Please fill in all required fields and provide at least two options.');
      return;
    }

    const type = tabValue === 0 ? 'Organization' : 'IT';
    const saveData = {
      ...(editId && { id: editId }),
      active: true,
      branchCode,
      branchName,
      createdBy: loginUserName,
      department: tabValue === 0 ? 'All' : department,
      maxSelection: newPoll.maxSelection,
      multiSelect: newPoll.multiSelect,
      orgId,
      pollDetailsDTO: validOptions.map(opt => ({ options: opt })),
      question: newPoll.question,
      expiresDate: newPoll.expiresDate,
      updatedBy: loginUserName,
      type
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

  const addOption = () => {
    setPollDetails([...pollDetails, ""]);
  };

  const removeOption = (index) => {
    if (pollDetails.length <= 2) {
      showToast('error', 'Poll must have at least two options');
      return;
    }
    const updatedPollDetails = [...pollDetails];
    updatedPollDetails.splice(index, 1);
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
        {pollData.length > 0 ? (
          pollData
            .slice(0, showAllPolls ? pollData.length : 1)
            .map(poll => (
              <Grid item xs={12} md={6} lg={12} key={poll.id}>
                <Card variant="outlined" sx={{
                  height: '100%',
                  width: '100%',
                  borderColor: votedPolls.has(poll.id) ? theme.palette.success.light : theme.palette.primary.light,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip
                        label={votedPolls.has(poll.id) ? 'Voted' : 'Active'}
                        size="small"
                        color={votedPolls.has(poll.id) ? 'success' : 'primary'}
                      />
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
                        <Typography variant="caption" sx={{ ml: 0.5 }}>{poll.expiresDate ? `Ends ${formatDate(poll.expiresDate)}` : 'No deadline'}</Typography>
                      </Box>
                    </Box>

                    {votedPolls.has(poll.id) ? (
                      poll.options.map(option => (
                        <Box key={option.id} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" fontWeight={500}>{option.text}</Typography>
                            <Typography variant="body2">{Math.round((option.votes / (poll.totalVotes || 1)) * 100)}%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={(option.votes / (poll.totalVotes || 1)) * 100} sx={{ height: 8, borderRadius: 4, mt: 0.5 }} />
                          <Typography
                            variant="caption"
                            sx={{ textDecoration: 'underline', cursor: 'pointer', color: 'primary.main' }}
                            onClick={() => handleViewVotes(poll.id, option.id, option.text)}
                          >
                            {option.votes} vote{option.votes !== 1 ? 's' : ''}
                          </Typography>
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
                                  sx={{
                                    backgroundColor: selectedOptions[poll.id] === option.id ? '#e3f2fd' : 'transparent',
                                    borderRadius: 2,
                                    px: 2,
                                    py: 1,
                                    mb: 1,
                                    transition: 'background-color 0.3s'
                                  }}
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
                              background: selectedOptions[poll.id]
                                ? 'linear-gradient(45deg, #4caf50, #66bb6a)'
                                : 'linear-gradient(45deg, #3f51b5, #2196f3)',
                              color: 'white',
                              boxShadow: selectedOptions[poll.id]
                                ? '0 3px 5px 2px rgba(76, 175, 80, .3)'
                                : '0 3px 5px 2px rgba(63, 81, 181, .3)',
                              transition: 'all 0.3s ease-in-out',
                              '&:hover': {
                                background: selectedOptions[poll.id]
                                  ? 'linear-gradient(45deg, #43a047, #2e7d32)'
                                  : 'linear-gradient(45deg, #2196f3, #3f51b5)',
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
            setNewPoll({ question: '', expiresDate: '', maxSelection: 1, multiSelect: false });
            setPollDetails(["", ""]);
            setEditId('');
            setOpenCreateModal(true);
          }}
          disabled={userType === 'USER' && tabValue === 0 || userType === 'TEAM LEAD' && tabValue === 0}
        // sx={{
        //   p: 1.5,
        //   background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
        //   color: 'white',
        //   '&:hover': {
        //     background: 'linear-gradient(45deg, #2196f3, #3f51b5)'
        //   }
        // }}
        >
          <AddIcon />
        </IconButton>

        {/* New View More Icon Button */}
        {/* New View More Icon Button */}
        <IconButton
          color="primary"
          onClick={() => setViewAllModalOpen(true)}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            }
          }}
        >
          <MoreHorizIcon />
        </IconButton>
        {/* <Button
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
        </Button> */}
      </div>

      {/* Voter Details Modal */}
      <Modal open={voteModalOpen} onClose={() => setVoteModalOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
          width: { xs: '95vw', sm: '500px' },
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Voters for: {selectedOptionText}</Typography>
            <IconButton onClick={() => setVoteModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {selectedVoters.length > 0 ? (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Total: {selectedVoters.length} vote{selectedVoters.length !== 1 ? 's' : ''}
              </Typography>

              {selectedVoters.map((voter, index) => (
                <Box key={index} sx={{
                  mb: 2,
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    {voter.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight="bold">{voter.name}</Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BusinessIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="caption">{voter.branch}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WorkIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="caption">{voter.department}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No voters found for this option.
            </Typography>
          )}
        </Box>
      </Modal>

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
            required
          />

          <TextField
            label="Expires At"
            type="date"
            fullWidth
            value={newPoll.expiresDate}
            onChange={(e) => setNewPoll({ ...newPoll, expiresDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Max Selection"
            type="number"
            fullWidth
            value={newPoll.maxSelection}
            onChange={(e) => setNewPoll({ ...newPoll, maxSelection: parseInt(e.target.value) || 1 })}
            sx={{ mb: 2 }}
            inputProps={{ min: 1 }}
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
            {pollDetails.map((detail, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TextField
                  label={`Option ${index + 1}`}
                  fullWidth
                  value={detail}
                  onChange={(e) => handlePollDetailsChange(index, e.target.value)}
                  required
                />
                {index >= 2 && (
                  <IconButton
                    onClick={() => removeOption(index)}
                    sx={{ ml: 1, color: 'error.main' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addOption}
              sx={{ mt: 1, alignSelf: 'flex-start' }}
            >
              Add Option
            </Button>
          </Box>

          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ width: '100%' }}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : editId ? 'Save Changes' : 'Create Poll'}
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
          width: { xs: '90vw', sm: '600px' }, // Adjusted width
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            pb: 1
          }}>
            <Typography variant="h6" fontWeight="bold">All Polls</Typography>
            <IconButton
              onClick={() => setViewAllModalOpen(false)}
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.grey[200]
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {polls.length > 0 ? (
            <Grid container spacing={2}>
              {polls.map(poll => (
                <Grid item xs={12} key={poll.id}>
                  <Card variant="outlined" sx={{
                    borderColor: votedPolls.has(poll.id) ?
                      theme.palette.success.light :
                      theme.palette.primary.light,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    }
                  }}>
                    <CardContent>
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={votedPolls.has(poll.id) ? 'Voted' : 'Active'}
                            size="small"
                            color={votedPolls.has(poll.id) ? 'success' : 'primary'}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(poll.createdDate)}
                          </Typography>
                        </Box>
                        <Typography variant="caption">
                          {poll.totalVotes || 0} votes
                        </Typography>
                      </Box>

                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {poll.question}
                      </Typography>

                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1
                      }}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="caption">
                          {poll.expiresDate ? `Ends ${formatDate(poll.expiresDate)}` : 'No deadline'}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 1 }} />

                      {poll.options.map(option => (
                        <Box key={option.id} sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1,
                          p: 1,
                          backgroundColor: theme.palette.grey[50],
                          borderRadius: 1
                        }}>
                          <Typography variant="body2">{option.text}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight="500">
                              {option.votes}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleViewVotes(poll.id, option.id, option.text)}
                              sx={{
                                color: theme.palette.primary.main,
                                '&:hover': {
                                  backgroundColor: theme.palette.primary.light,
                                  color: 'white'
                                }
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 3,
              textAlign: 'center'
            }}>
              <PollIcon sx={{
                fontSize: 60,
                color: theme.palette.text.disabled,
                mb: 1
              }} />
              <Typography variant="h6" color="text.secondary">
                No polls available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create a new poll to get started
              </Typography>
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
}

export default Poll;