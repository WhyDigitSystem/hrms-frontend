import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Modal,
  IconButton,
  Button,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  LinearProgress,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Paper
} from '@mui/material';
import StorefrontTwoToneIcon from '@mui/icons-material/StorefrontTwoTone';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import PollIcon from '@mui/icons-material/Poll';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { useTheme } from '@mui/material/styles';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Poll() {
  const [polls, setPolls] = useState([
    {
      id: 1,
      question: "Which feature should we implement next?",
      options: [
        { id: 1, text: "Dark mode", votes: 15 },
        { id: 2, text: "Multi-language support", votes: 8 },
        { id: 3, text: "Advanced analytics", votes: 12 },
        { id: 4, text: "Mobile app", votes: 5 }
      ],
      totalVotes: 40,
      postImage: "https://source.unsplash.com/random/800x400/?poll",
      circularTopic: "Feature Prioritization Poll",
      // circularcontent: "Help us decide which features to prioritize in our next development cycle.",
      expiresAt: "2023-12-31",
      hasVoted: false
    }
  ]);

  const [openModal, setOpenModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openViewMoreModal, setOpenViewMoreModal] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: "",
    options: ["", ""],
    expiresAt: ""
  });
  const [selectedOption, setSelectedOption] = useState(null);
  const theme = useTheme();

  const handleVote = (pollId) => {
    if (!selectedOption) {
      toast.warning("Please select an option before voting");
      return;
    }

    setPolls(polls.map(poll => {
      if (poll.id === pollId) {
        const updatedOptions = poll.options.map(option => {
          if (option.id === selectedOption) {
            return { ...option, votes: option.votes + 1 };
          }
          return option;
        });

        const totalVotes = updatedOptions.reduce((sum, option) => sum + option.votes, 0);

        return {
          ...poll,
          options: updatedOptions,
          totalVotes,
          hasVoted: true
        };
      }
      return poll;
    }));

    toast.success("Your vote has been submitted!");
    setSelectedOption(null);
  };

  const addPoll = () => {
    const pollOptions = newPoll.options.filter(opt => opt.trim() !== "").map((opt, index) => ({
      id: index + 1,
      text: opt,
      votes: 0
    }));

    if (pollOptions.length < 2) {
      toast.error("Poll must have at least 2 options");
      return;
    }

    if (!newPoll.question.trim()) {
      toast.error("Poll question cannot be empty");
      return;
    }

    const newPollObj = {
      id: polls.length + 1,
      question: newPoll.question,
      options: pollOptions,
      totalVotes: 0,
      postImage: "https://source.unsplash.com/random/800x400/?survey",
      circularTopic: newPoll.question,
      circularcontent: "Newly created poll - vote now!",
      expiresAt: newPoll.expiresAt || "2023-12-31",
      hasVoted: false
    };

    setPolls([...polls, newPollObj]);
    setOpenCreateModal(false);
    setNewPoll({
      question: "",
      options: ["", ""],
      expiresAt: ""
    });
    toast.success("New poll created successfully!");
  };

  const addOptionField = () => {
    setNewPoll({
      ...newPoll,
      options: [...newPoll.options, ""]
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...newPoll.options];
    newOptions[index] = value;
    setNewPoll({
      ...newPoll,
      options: newOptions
    });
  };

  const removeOption = (index) => {
    if (newPoll.options.length <= 2) {
      toast.warning("Poll must have at least 2 options");
      return;
    }

    const newOptions = [...newPoll.options];
    newOptions.splice(index, 1);
    setNewPoll({
      ...newPoll,
      options: newOptions
    });
  };

  return (
    <>
      <style>
        {`
    .css-19h80yh-MuiGrid-root > .MuiGrid-item {
    padding-top: 0px;
} 
    .css-vh9s07 {
    padding: 8px;
    background: linear-gradient(45deg, #f3f4f6, #e5e7eb);
}
    .css-h4l1he-MuiCardContent-root:last-child {
    padding-bottom: 0px;
}
    .css-iaibkd-MuiPaper-root {
    background-color: #ffffff;
    color: #364152;
    -webkit-transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    border-radius: 0px;
    box-shadow: none; 
    background-image: none;
    padding: 0px;
    margin-bottom: 0px; 
    border: 0px solid rgba(0, 0, 0, 0.12); 
    border-radius: 0px; 
    -webkit-transition: all 0.2s;
    transition: all 0.2s;
    }
    
    .css-6sjij1-MuiPaper-root {
    background-color: #ffffff;
    color: #364152;
    -webkit-transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    border-radius: 4px;
    box-shadow: none;
    background-image: none;
    border-radius: 0px;
    padding: 0px;
    margin-bottom: 0px;
    border: 0px solid #2196f3;
    border-radius: 0px;
    -webkit-transition: all 0.2s;
    transition: all 0.2s;
    }

`}
      </style>
      <Box sx={{ p: 4, background: "linear-gradient(45deg, #f3f4f6, #e5e7eb)" }}>
        <ToastContainer />
        {/* Create Poll Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateModal(true)}
            sx={{
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark
              }
            }}
          >
            Create Poll
          </Button>
        </Box>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {polls.length > 0 ? (
            polls.map((poll) => (
              <Grid item xs={12} key={poll.id}>
                <Card
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    boxShadow: 3,
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PollIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {poll.circularTopic}
                      </Typography>
                      <Chip
                        label={`${poll.totalVotes} votes`}
                        variant="outlined"
                        color="primary"
                        size="small"
                        sx={{ ml: 'auto' }}
                        icon={<HowToVoteIcon fontSize="small" />}
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
                      {poll.circularcontent}
                    </Typography>

                    {poll.hasVoted ? (
                      <Box sx={{ mt: 2 }}>
                        {poll.options.map((option) => (
                          <Box key={option.id} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body1">{option.text}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {Math.round((option.votes / poll.totalVotes) * 100)}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={(option.votes / poll.totalVotes) * 100}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {option.votes} votes
                            </Typography>
                          </Box>
                        ))}
                        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'success.main' }}>
                          You've already voted in this poll
                        </Typography>
                      </Box>
                    ) : (
                      <FormControl component="fieldset" sx={{ width: '100%' }}>
                        <FormLabel component="legend" sx={{ mb: 2, fontWeight: 500 }}>
                          {poll.question}
                        </FormLabel>
                        <RadioGroup
                          value={selectedOption}
                          onChange={(e) => setSelectedOption(parseInt(e.target.value))}
                        >
                          {poll.options.map((option) => (
                            <Paper
                              key={option.id}
                              sx={{
                                p: 2,
                                mb: 1,
                                border: selectedOption === option.id ? `2px solid ${theme.palette.primary.main}` : '1px solid rgba(0, 0, 0, 0.12)',
                                borderRadius: 1,
                                transition: 'all 0.2s',
                                '&:hover': {
                                  borderColor: theme.palette.primary.light
                                }
                              }}
                            >
                              <FormControlLabel
                                value={option.id}
                                control={<Radio />}
                                label={option.text}
                                sx={{ width: '100%' }}
                              />
                            </Paper>
                          ))}
                        </RadioGroup>

                        <div className='d-flex justify-content-between align-items-baseline'>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                            <Button
                              variant="contained"
                              startIcon={<HowToVoteIcon />}
                              onClick={() => handleVote(poll.id)}
                              sx={{
                                backgroundColor: theme.palette.primary.main,
                                '&:hover': {
                                  backgroundColor: theme.palette.primary.dark
                                }
                              }}
                            >
                              Submit Vote
                            </Button>
                          </Box>
                        </div>
                        {/* <Button
                          variant="contained"
                          onClick={() => handleVote(poll.id)}
                          sx={{ mt: 2 }}
                          startIcon={<HowToVoteIcon />}
                        >
                          Submit Vote
                        </Button> */}
                      </FormControl>
                    )}
                    {/* <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
                      Poll closes on {poll.expiresAt}
                    </Typography> */}
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Typography
                variant="body1"
                sx={{ textAlign: "center", color: "text.secondary", p: 3 }}
              >
                No polls available
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Create Poll Modal */}
      <Modal open={openCreateModal} onClose={() => setOpenCreateModal(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: 600,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Create New Poll</Typography>
            <IconButton onClick={() => setOpenCreateModal(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <TextField
            fullWidth
            label="Poll Question"
            value={newPoll.question}
            onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle1" sx={{ mb: 2 }}>Poll Options</Typography>

          {newPoll.options.map((option, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TextField
                fullWidth
                label={`Option ${index + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                sx={{ mr: 1 }}
              />
              <IconButton
                onClick={() => removeOption(index)}
                disabled={newPoll.options.length <= 2}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={addOptionField}
            sx={{ mb: 3 }}
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
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={addPoll}
              startIcon={<PollIcon />}
            >
              Create Poll
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

export default Poll;