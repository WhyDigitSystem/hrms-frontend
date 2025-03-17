import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Radio, RadioGroup, FormControlLabel, Modal } from '@mui/material';

function Poll() {
  const [isCreatePollModalOpen, setIsCreatePollModalOpen] = useState(false); // Modal state
  const [polls, setPolls] = useState([]); // List of polls
  const [currentPollIndex, setCurrentPollIndex] = useState(0); // Current poll index
  const [newPollQuestion, setNewPollQuestion] = useState(''); // New poll question
  const [newPollOptions, setNewPollOptions] = useState(['', '']); // New poll options
  const [selectedOption, setSelectedOption] = useState(''); // Selected option for voting

  // Handle creating a new poll
  const handleCreatePoll = () => {
    if (newPollQuestion.trim() && newPollOptions.every(option => option.trim())) {
      const newPoll = {
        question: newPollQuestion,
        options: newPollOptions.map(option => ({ text: option, votes: 0 })),
      };
      setPolls([...polls, newPoll]);
      setIsCreatePollModalOpen(false);
      setNewPollQuestion('');
      setNewPollOptions(['', '']);
    }
  };

  // Handle voting for an option
  const handleVote = () => {
    if (selectedOption) {
      const updatedPolls = polls.map((poll, index) => {
        if (index === currentPollIndex) {
          const updatedOptions = poll.options.map(option => {
            if (option.text === selectedOption) {
              return { ...option, votes: option.votes + 1 }; // Update votes immutably
            }
            return option;
          });
          return { ...poll, options: updatedOptions }; // Update options immutably
        }
        return poll;
      });
      setPolls(updatedPolls); // Update the polls state
      setSelectedOption(''); // Reset selected option
    }
  };

  // Handle next poll
  const handleNextPoll = () => {
    if (currentPollIndex < polls.length - 1) {
      setCurrentPollIndex(currentPollIndex + 1);
    }
  };

  // Handle previous poll
  const handlePreviousPoll = () => {
    if (currentPollIndex > 0) {
      setCurrentPollIndex(currentPollIndex - 1);
    }
  };

  const currentPoll = polls[currentPollIndex];

  return (
    <div>
      <Box sx={{ mt: 2 }}>
        {/* Create Poll Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsCreatePollModalOpen(true)}
          >
            Create Poll
          </Button>
        </Box>

        {/* Display Polls */}
        {polls.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Box
              sx={{
                mb: 2,
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {currentPoll.question}
              </Typography>
              <RadioGroup
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
              >
                {currentPoll.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option.text}
                    control={<Radio />}
                    label={`${option.text} (${option.votes} votes)`}
                  />
                ))}
              </RadioGroup>
              <Button
                variant="contained"
                color="primary"
                onClick={handleVote}
                sx={{ mt: 2 }}
                disabled={!selectedOption}
              >
                Vote
              </Button>
            </Box>

            {/* Next and Previous Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                onClick={handlePreviousPoll}
                disabled={currentPollIndex === 0}
              >
                Previous
              </Button>
              <Button
                variant="contained"
                onClick={handleNextPoll}
                disabled={currentPollIndex === polls.length - 1}
              >
                Next
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      {/* Create Poll Modal */}
      <Modal open={isCreatePollModalOpen} onClose={() => setIsCreatePollModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: '12px',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Create a New Poll
          </Typography>
          <TextField
            fullWidth
            label="Poll Question"
            variant="outlined"
            value={newPollQuestion}
            onChange={(e) => setNewPollQuestion(e.target.value)}
            sx={{ mb: 2 }}
          />
          {newPollOptions.map((option, index) => (
            <TextField
              key={index}
              fullWidth
              label={`Option ${index + 1}`}
              variant="outlined"
              value={option}
              onChange={(e) => {
                const updatedOptions = [...newPollOptions];
                updatedOptions[index] = e.target.value;
                setNewPollOptions(updatedOptions);
              }}
              sx={{ mb: 2 }}
            />
          ))}
          <Button
            variant="outlined"
            onClick={() => setNewPollOptions([...newPollOptions, ''])}
            sx={{ mb: 2 }}
          >
            Add Option
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={() => setIsCreatePollModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleCreatePoll}>
              Create Poll
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}

export default Poll;