import React, { useState } from "react";
import {
  Heading,
  Box,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Text,
  Stack,
  Image,
  Tag,
  Wrap,
  WrapItem,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
} from "@chakra-ui/react";
import { SearchIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const fetchEvents = async () => {
  try {
    const response = await axios.get("http://localhost:3000/events");
    return response.data;
  } catch (error) {
    console.error("Error details:", error);
    if (error.code === 'ECONNREFUSED') {
      throw new Error("Cannot connect to the server. Please make sure json-server is running.");
    }
    throw new Error(error.response?.data?.message || "Failed to fetch events. Is the server running?");
  }
};

export const EventsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  const {
    data: events,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
    retry: 1,
    onError: (error) => {
      console.error("Query error:", error);
    },
  });

  if (isLoading) return <Box p={4}>Loading...</Box>;
  if (error) {
    return (
      <Box p={4} color="red.500">
        Error: {error.message}
        <Button ml={4} onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  // Get unique categories from all events
  const allCategories = [...new Set(events.flatMap(event => event.categories))];

  const filteredEvents = events.filter((event) => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.categories.some(category => 
        category.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategories = 
      selectedCategories.length === 0 || 
      event.categories.some(category => selectedCategories.includes(category));

    return matchesSearch && matchesCategories;
  });

  const formatDateTime = (dateTimeStr) => {
    return new Date(dateTimeStr).toLocaleString();
  };

  return (
    <Box p={4}>
      <Box
        mb={4}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={4}
        flexWrap="wrap"
      >
        <Heading>List of events</Heading>
        <Button
          colorScheme="blue"
          onClick={() => navigate("/add-event")}
        >
          Add Event
        </Button>
      </Box>

      <Stack spacing={4} mb={6}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search events by title, description, location, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="lg"
            variant="filled"
          />
        </InputGroup>

        <Menu closeOnSelect={false}>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            variant="outline"
          >
            Filter by Categories ({selectedCategories.length || 'All'})
          </MenuButton>
          <MenuList>
            <MenuOptionGroup 
              type="checkbox" 
              value={selectedCategories}
              onChange={setSelectedCategories}
            >
              {allCategories.map((category) => (
                <MenuItemOption key={category} value={category}>
                  {category}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>

        {selectedCategories.length > 0 && (
          <Wrap spacing={2}>
            {selectedCategories.map(category => (
              <WrapItem key={category}>
                <Tag 
                  colorScheme="blue" 
                  variant="solid"
                  cursor="pointer"
                  onClick={() => setSelectedCategories(
                    selectedCategories.filter(c => c !== category)
                  )}
                >
                  {category} ✕
                </Tag>
              </WrapItem>
            ))}
            <WrapItem>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setSelectedCategories([])}
              >
                Clear all
              </Button>
            </WrapItem>
          </Wrap>
        )}
      </Stack>

      {filteredEvents.length === 0 ? (
        <Text textAlign="center" fontSize="lg" color="gray.600">
          No events found matching your search.
        </Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {filteredEvents.map((event) => (
            <Link
              to={`/event/${event.id}`}
              key={event.id}
              style={{ textDecoration: "none" }}
            >
              <Card
                overflow="hidden"
                _hover={{
                  transform: "translateY(-4px)",
                  boxShadow: "lg",
                  transition: "all 0.2s ease-in-out",
                }}
              >
                {event.image && (
                  <Image
                    src={event.image}
                    alt={event.title}
                    height="200px"
                    objectFit="cover"
                  />
                )}
                <CardHeader>
                  <Heading size="md">{event.title}</Heading>
                </CardHeader>
                <CardBody>
                  <Stack spacing={3}>
                    <Text>{event.description}</Text>

                    <Text>
                      <strong>Start:</strong> {formatDateTime(event.startTime)}
                    </Text>
                    <Text>
                      <strong>End:</strong> {formatDateTime(event.endTime)}
                    </Text>

                    <Box>
                      <Text fontWeight="bold" mb={2}>
                        Categories:
                      </Text>
                      <Wrap>
                        {event.categories.map((category) => (
                          <WrapItem key={category}>
                            <Tag colorScheme="blue">{category}</Tag>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </Box>

                    <Text>
                      <strong>Location:</strong> {event.location}
                    </Text>
                    <Text>
                      <strong>Organizer:</strong> {event.organizer}
                    </Text>
                  </Stack>
                </CardBody>
              </Card>
            </Link>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};
