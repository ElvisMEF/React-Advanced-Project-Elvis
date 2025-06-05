import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const createEvent = async (newEvent) => {
  const { data } = await axios.post('http://localhost:3000/events', newEvent);
  return data;
};

export const AddEventPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast({
        title: 'Event created successfully!',
        status: 'success',
        duration: 3000,
      });
      navigate('/');
    },
    onError: (error) => {
      toast({
        title: 'Error creating event',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const newEvent = {
      title: formData.get('title'),
      description: formData.get('description'),
      image: formData.get('image'),
      startTime: new Date(formData.get('startTime')).toISOString(),
      endTime: new Date(formData.get('endTime')).toISOString(),
      location: formData.get('location'),
      categories: formData.get('categories').split(',').map(cat => cat.trim()),
      organizer: formData.get('organizer'),
    };

    mutate(newEvent);
  };

  return (
    <Box p={4} maxWidth="600px" mx="auto">
      <Heading mb={6}>Add New Event</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input name="title" />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea name="description" />
          </FormControl>

          <FormControl>
            <FormLabel>Image URL</FormLabel>
            <Input name="image" type="url" />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Start Time</FormLabel>
            <Input name="startTime" type="datetime-local" />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>End Time</FormLabel>
            <Input name="endTime" type="datetime-local" />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Location</FormLabel>
            <Input name="location" />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Categories (comma-separated)</FormLabel>
            <Input name="categories" placeholder="Music, Arts, Technology" />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Organizer</FormLabel>
            <Input name="organizer" />
          </FormControl>

          <Button 
            type="submit" 
            colorScheme="blue" 
            isLoading={isLoading}
            loadingText="Creating..."
          >
            Create Event
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

// Removed duplicate import of Button
// Removed duplicate import of useNavigate

export const EventsPage = () => {
  const navigate = useNavigate();

  return (
    <Box p={4}>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Heading>List of events</Heading>
        <Button 
          colorScheme="blue" 
          onClick={() => navigate('/add-event')}
        >
          Add Event
        </Button>
      </Box>
      {/* ...existing SimpleGrid code... */}
    </Box>
  );
};