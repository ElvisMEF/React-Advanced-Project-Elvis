import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Image,
  Stack,
  Tag,
  Wrap,
  WrapItem,
  HStack,
  Avatar,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const fetchEvent = async (id) => {
  const { data } = await axios.get(`http://localhost:3000/events/${id}`);
  return data;
};

const updateEvent = async (eventData) => {
  const { data } = await axios.put(
    `http://localhost:3000/events/${eventData.id}`,
    eventData
  );
  return data;
};

// Delete function
const deleteEvent = async (id) => {
  await axios.delete(`http://localhost:3000/events/${id}`);
};

export const EventPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const toast = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const cancelRef = React.useRef();
  const { eventId } = useParams();

  const {
    data: event,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => fetchEvent(eventId),
  });

  const mutation = useMutation({
    mutationFn: updateEvent,
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["event", eventId]);

      // Enhanced success toast
      toast({
        title: "Event updated successfully!",
        description: `"${data.title}" has been updated.`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
        icon: "✓",
      });
      onClose();
    },
    onError: (error) => {
      // Enhanced error toast
      toast({
        title: "Failed to update event",
        description: error.response?.data?.message || "Please try again later",
        status: "error",
        duration: 7000,
        isClosable: true,
        position: "top",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries(["events"]);
      toast({
        title: "Event deleted successfully",
        description: `"${event.title}" has been permanently removed`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error deleting event",
        description:
          error.message || "Failed to delete the event. Please try again.",
        status: "error",
        duration: 7000,
        isClosable: true,
        position: "top",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Validate dates
    const startTime = new Date(formData.get("startTime"));
    const endTime = new Date(formData.get("endTime"));

    if (endTime <= startTime) {
      toast({
        title: "Invalid date range",
        description: "End time must be after start time",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    const updatedEvent = {
      ...event,
      id: event.id,
      title: formData.get("title"),
      description: formData.get("description"),
      image: formData.get("image") || null,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      location: formData.get("location"),
      categories: formData
        .get("categories")
        .split(",")
        .map((cat) => cat.trim())
        .filter(Boolean),
      organizer: formData.get("organizer"),
      organizerImage: formData.get("organizerImage") || null,
    };

    // Validate required fields
    const requiredFields = ["title", "description", "location", "organizer"];
    const missingFields = requiredFields.filter((field) => !formData.get(field));

    if (missingFields.length > 0) {
      toast({
        title: "Missing required fields",
        description: `Please fill in: ${missingFields.join(", ")}`,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    mutation.mutate(updatedEvent);
  };

  const formatDateTime = (dateTimeStr) => {
    return new Date(dateTimeStr).toLocaleString();
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Container maxW="4xl" py={8}>
      {event.image && (
        <Box mb={6} borderRadius="lg" overflow="hidden">
          <Image
            src={event.image}
            alt={event.title}
            width="100%"
            height="400px"
            objectFit="cover"
          />
        </Box>
      )}

      <Stack spacing={6}>
        <Heading size="2xl">{event.title}</Heading>

        <HStack>
          <Avatar size="md" name={event.organizer} src={event.organizerImage} />
          <Box>
            <Text fontWeight="bold">Organized by</Text>
            <Text>{event.organizer}</Text>
          </Box>
        </HStack>

        <Box>
          <Text fontSize="lg" mb={4}>
            {event.description}
          </Text>
        </Box>

        <Stack spacing={2}>
          <Text fontSize="lg">
            <strong>Start:</strong> {formatDateTime(event.startTime)}
          </Text>
          <Text fontSize="lg">
            <strong>End:</strong> {formatDateTime(event.endTime)}
          </Text>
          <Text fontSize="lg">
            <strong>Location:</strong> {event.location}
          </Text>
        </Stack>

        <Box>
          <Text fontWeight="bold" mb={2}>
            Categories:
          </Text>
          <Wrap>
            {event.categories.map((category) => (
              <WrapItem key={category}>
                <Tag size="lg" colorScheme="blue">
                  {category}
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      </Stack>

      <HStack spacing={4} mt={6}>
        <Button colorScheme="blue" onClick={onOpen}>
          Edit Event
        </Button>
        <Button
          colorScheme="red"
          onClick={onDeleteOpen}
          isLoading={deleteMutation.isLoading}
        >
          Delete Event
        </Button>
      </HStack>

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Event
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete &quot;{event.title}&quot;? This action cannot
              be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  deleteMutation.mutate();
                  onDeleteClose();
                }}
                isLoading={deleteMutation.isLoading}
                ml={3}
              >
                Delete Event
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Event</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input name="title" defaultValue={event.title} />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    name="description"
                    defaultValue={event.description}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Image URL</FormLabel>
                  <Input name="image" defaultValue={event.image} />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Start Time</FormLabel>
                  <Input
                    name="startTime"
                    type="datetime-local"
                    defaultValue={event.startTime.slice(0, 16)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>End Time</FormLabel>
                  <Input
                    name="endTime"
                    type="datetime-local"
                    defaultValue={event.endTime.slice(0, 16)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Location</FormLabel>
                  <Input name="location" defaultValue={event.location} />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Categories (comma-separated)</FormLabel>
                  <Input
                    name="categories"
                    defaultValue={event.categories.join(", ")}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Organizer Name</FormLabel>
                  <Input name="organizer" defaultValue={event.organizer} />
                </FormControl>

                <FormControl>
                  <FormLabel>Organizer Image URL</FormLabel>
                  <Input
                    name="organizerImage"
                    defaultValue={event.organizerImage}
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={mutation.isLoading}
                  loadingText="Saving..."
                >
                  Save Changes
                </Button>
              </Stack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};
