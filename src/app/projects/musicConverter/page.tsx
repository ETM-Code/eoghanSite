'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  VStack,
  useToast,
  Heading,
  Card,
  CardBody,
  Image,
} from '@chakra-ui/react';

export default function Home() {
  const { data: session } = useSession();
  const toast = useToast();
  const [sourceUrl, setSourceUrl] = useState('');
  const [direction, setDirection] = useState('apple_to_spotify');
  const [isConverting, setIsConverting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [conversionStatus, setConversionStatus] = useState<string | null>(null);

  useEffect(() => {
    // Poll for status updates if there's an active job
    if (jobId && conversionStatus === 'pending') {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/status/${jobId}`, {
            headers: {
              'Authorization': `Bearer ${session?.accessToken}`,
            },
          });
          const data = await response.json();
          
          setConversionStatus(data.status);
          if (data.status === 'completed') {
            toast({
              title: 'Conversion Complete!',
              description: `Your playlist has been converted. Click here to view it: ${data.target_url}`,
              status: 'success',
              duration: null,
              isClosable: true,
              onCloseComplete: () => window.open(data.target_url, '_blank'),
            });
            setJobId(null);
          } else if (data.status === 'failed') {
            toast({
              title: 'Conversion Failed',
              description: data.error || 'An unknown error occurred',
              status: 'error',
              duration: null,
              isClosable: true,
            });
            setJobId(null);
          }
        } catch (error) {
          console.error('Error checking status:', error);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [jobId, conversionStatus, session, toast]);

  const handleConvert = async () => {
    if (!sourceUrl) {
      toast({
        title: 'Error',
        description: 'Please enter a playlist URL',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsConverting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          source_url: sourceUrl,
          direction,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setJobId(data.job_id);
        setConversionStatus('pending');
        toast({
          title: 'Conversion Started',
          description: 'Your playlist is being converted. You will be notified when it\'s ready.',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error(data.detail || 'Failed to start conversion');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsConverting(false);
    }
  };

  if (!session) {
    return (
      <Container maxW="container.md" py={10}>
        <VStack spacing={8} align="center">
          <Heading>Playlist Converter</Heading>
          <Text>Sign in to convert your playlists between Apple Music and Spotify</Text>
          <Button
            colorScheme="blue"
            onClick={() => signIn(undefined, { callbackUrl: '/projects/musicConverter' })}
          >
            Sign In
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={8}>
        <Heading>Playlist Converter</Heading>
        
        <Card w="full">
          <CardBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Playlist URL</FormLabel>
                <Input
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="Enter playlist URL from Apple Music or Spotify"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Conversion Direction</FormLabel>
                <Select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                >
                  <option value="apple_to_spotify">Apple Music to Spotify</option>
                  <option value="spotify_to_apple">Spotify to Apple Music</option>
                </Select>
              </FormControl>

              <Button
                colorScheme="blue"
                onClick={handleConvert}
                isLoading={isConverting}
                loadingText="Converting..."
                w="full"
              >
                Convert Playlist
              </Button>
            </VStack>
          </CardBody>
        </Card>

        <Box>
          <Button
            variant="ghost"
            onClick={() => signOut()}
          >
            Sign Out
          </Button>
        </Box>
      </VStack>
    </Container>
  );
} 