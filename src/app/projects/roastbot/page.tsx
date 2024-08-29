"use client"

import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import axios from 'axios';
import { FaCamera } from 'react-icons/fa';

const GlobalStyle = createGlobalStyle`
  body, html, #root {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    font-family: 'Arial', sans-serif;
  }
`;

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  padding: 20px;
`;

const Heading = styled.h1`
  font-size: 3rem;
  color: white;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const UploadButton = styled.label`
  display: flex;
  align-items: center;
  padding: 10px 20px;
  font-size: 1rem;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }

  svg {
    margin-right: 10px;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const ImagePreview = styled.img`
  margin-top: 20px;
  max-width: 400px;
  max-height: 400px;
  border: 2px solid #ddd;
  border-radius: 5px;
`;

const OutputContainer = styled.div`
  margin-top: 20px;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 80%;
  max-width: 600px;
  text-align: left;
  font-size: 1.2rem;
  color: #333;
`;

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [poem, setPoem] = useState<string | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const resizedImage = await resizeImage(file, 200, 200);
      
      setSelectedImage(URL.createObjectURL(resizedImage));
  
      const formData = new FormData();
      formData.append('file', resizedImage, file.name);
  
      try {
        const response = await axios.post('https://roastbot-sparkling-snowflake-9082.fly.dev/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setDescription(response.data.description);
        setPoem(response.data);
      } catch (error) {
        console.error("Error uploading the image:", error);
      }
    }
  };
  
  const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
  
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
  
          canvas.width = maxWidth;
          canvas.height = maxHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, (maxWidth - width) / 2, (maxHeight - height) / 2, width, height);
          
          canvas.toBlob((blob) => {
            resolve(blob as Blob);
          }, file.type);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <>
      <GlobalStyle />
      <AppWrapper>
        <AppContainer>
          <Heading>be humbled</Heading>
          <UploadButton htmlFor="upload-input">
            <FaCamera />
            Upload Image
          </UploadButton>
          <HiddenInput 
            id="upload-input" 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload} 
          />
          {selectedImage && <ImagePreview src={selectedImage} alt="Uploaded preview" />}
          {/* {description && <OutputContainer>{description}</OutputContainer>} */}
          {poem && <OutputContainer>{poem}</OutputContainer>}
        </AppContainer>
      </AppWrapper>
    </>
  );
};

export default App;
