# Chat Implementation Documentation

## Overview

This document describes the implementation of the chat functionality for the Plantastic application, allowing users to have voice and text conversations with an AI assistant about their plants.

## Features Implemented

### 1. Database Schema

- **Table**: `chat_messages`
- **Purpose**: Stores chat history per flower for each user
- **Key Fields**:
  - `flower_id`: References the specific plant
  - `user_id`: References the user
  - `role`: Either 'user' or 'assistant'
  - `content`: The message text
  - `audio_url`: Optional URL for voice messages
  - `created_at`: Timestamp

### 2. Voice Input

- **Component**: `VoiceInput.tsx`
- **Features**:
  - Browser speech recognition API integration
  - Real-time voice-to-text conversion
  - Visual feedback during recording
  - Error handling for unsupported browsers

### 3. Chat Interface

- **Component**: `ChatInterface.tsx`
- **Features**:
  - Real-time message display
  - Auto-scrolling to latest messages
  - Loading states and error handling
  - Voice and text input options
  - Chat history persistence

### 4. AI Integration

- **Service**: Gemini API via `GeminiService.ts`
- **Features**:
  - Context-aware responses including plant information
  - Chat history for conversation continuity
  - Personalized plant care advice
  - Error handling and fallbacks

### 5. API Endpoints

- **Route**: `/api/chat`
- **Method**: POST
- **Features**:
  - User authentication verification
  - Message persistence
  - AI response generation
  - Error handling

## File Structure

```
src/
├── app/
│   ├── api/chat/route.ts          # Chat API endpoint
│   └── [userId]/flowers/[id]/chat/page.tsx  # Chat page
├── components/chat/
│   ├── ChatInterface.tsx          # Main chat component
│   ├── ChatMessage.tsx            # Individual message component
│   ├── VoiceInput.tsx             # Voice input component
│   └── index.ts                   # Export file
└── services/
    ├── actions/chatActions.ts     # Database operations
    └── GeminiService.ts           # AI service integration
```

## Database Migration

To set up the chat functionality, run the migration:

```sql
-- Run this file to create the chat_messages table
psql -h localhost -U postgres -d plantastic -f database/chat_migration.sql
```

## Usage

1. **Navigate to Chat**: Go to any flower detail page and click "Chat with Plantastic"
2. **Text Input**: Type messages in the input field and press Enter or click Send
3. **Voice Input**: Click the microphone button to start voice recording
4. **Chat History**: All conversations are automatically saved and loaded

## AI Context

The AI assistant receives the following context for each conversation:

- Plant name and description
- Health status and notes
- Previous chat history
- User's current question

## Error Handling

- **Voice Recognition**: Graceful fallback for unsupported browsers
- **API Errors**: User-friendly error messages
- **Network Issues**: Retry mechanisms and offline indicators
- **Authentication**: Proper user verification

## Security

- **Row Level Security**: Users can only access their own chat messages
- **Authentication**: All API calls require valid user authentication
- **Input Validation**: Message content is validated before processing

## Future Enhancements

- **Audio Playback**: Play AI responses as audio
- **Image Analysis**: Send plant photos for analysis
- **Scheduled Reminders**: AI-powered care reminders
- **Multi-language Support**: Support for different languages
- **Export Chat**: Download chat history as PDF

## Testing

Use the example data file to test the chat functionality:

```sql
-- Insert sample chat data for testing
psql -h localhost -U postgres -d plantastic -f database/example_chat_data.sql
```

Remember to replace the placeholder IDs with actual flower and user IDs from your database.
