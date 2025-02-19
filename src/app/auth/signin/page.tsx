'use client';

import { getProviders, signIn } from 'next-auth/react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { FaSpotify } from 'react-icons/fa';
import { useEffect, useState } from 'react';

export default function SignIn() {
  const [providers, setProviders] = useState<any>(null);

  useEffect(() => {
    const loadProviders = async () => {
      const providers = await getProviders();
      setProviders(providers);
    };
    loadProviders();
  }, []);

  if (!providers) {
    return null;
  }

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={8} align="center">
        <Heading>Sign in to Playlist Converter</Heading>
        <Text>Choose your sign-in method:</Text>
        
        {Object.values(providers).map((provider: any) => (
          <Box key={provider.name}>
            <Button
              leftIcon={<Icon as={FaSpotify} />}
              colorScheme="green"
              onClick={() => signIn(provider.id, { callbackUrl: '/projects/musicConverter' })}
              size="lg"
            >
              Sign in with {provider.name}
            </Button>
          </Box>
        ))}
      </VStack>
    </Container>
  );
} 