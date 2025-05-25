# Dice Image Classifier

A static web application for classifying images of dice. This application allows users to select a local directory containing images and classify them based on the number shown on the die.

## Features

- Select a local directory containing dice images
- View one image at a time
- Classify images as 4-sided, 6-sided, 8-sided, 10-sided, 12-sided, or 20-sided dice
- Mark images as invalid
- Automatically organize images into subdirectories based on classification
- Undo last classification
- Track remaining unclassified images

## Requirements

- A modern web browser that supports the File System Access API (Chrome, Edge, or Opera)
- Local images of dice to classify

## Usage

1. Open `index.html` in a supported web browser
2. Click "Select Directory" to choose a folder containing your dice images
3. For each image:
   - View the image
   - Click the appropriate button to classify the die (4, 6, 8, 10, 12, or 20 sides)
   - Click "Invalid" if the image is not a valid dice image
4. Use the "Undo Last Classification" button if you need to reclassify an image
5. The application will automatically create subdirectories for each classification and move the images accordingly

## Supported Image Formats

- JPG/JPEG
- PNG
- GIF
- WebP

## Note

This application requires the File System Access API, which is currently only supported in Chrome, Edge, and Opera browsers. For security reasons, the application must be served over HTTPS or run from localhost. 