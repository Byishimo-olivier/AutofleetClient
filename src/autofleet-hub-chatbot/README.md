# AutoFleet Hub Chatbot

## Overview
The AutoFleet Hub Chatbot is an interactive chatbot designed to assist users with various inquiries related to the AutoFleet Hub platform. It provides a user-friendly interface for communication, allowing users to ask questions and receive instant responses.

## Features
- **User Interaction**: Users can type messages and receive responses from the chatbot.
- **Chat History**: The chatbot maintains a history of conversations, allowing users to refer back to previous messages.
- **Suggested Responses**: The chatbot provides suggested responses based on the context of the conversation.
- **Customizable UI**: The chatbot interface is designed to be visually appealing and can be customized as per the application's theme.

## Project Structure
The project is organized into several directories, each serving a specific purpose:

- **src/components/chatbot**: Contains all the components related to the chatbot interface.
  - `ChatBot.tsx`: Main component managing the chatbot interface.
  - `ChatBubble.tsx`: Displays individual chat messages.
  - `ChatInput.tsx`: Input field for user messages.
  - `ChatMessage.tsx`: Formats and displays a single chat message.
  - `ChatHeader.tsx`: Displays the header of the chatbot interface.
  - `ChatSuggestions.tsx`: Displays suggested responses for the user.

- **src/components/ui**: Contains reusable UI components.
  - `Button.tsx`: Customizable button component.
  - `Input.tsx`: Customizable input field component.

- **src/components/layout**: Contains layout components for the chatbot.
  - `ChatBotContainer.tsx`: Wraps the chatbot components and provides layout styling.

- **src/hooks**: Contains custom hooks for managing chatbot logic and state.
  - `useChatBot.ts`: Manages chatbot state and logic.
  - `useChatHistory.ts`: Manages chat history.

- **src/services**: Contains services for API interactions and message processing.
  - `chatBotAPI.ts`: Functions for interacting with the chatbot API.
  - `messageProcessor.ts`: Functions for processing incoming messages.

- **src/types**: Contains TypeScript types and interfaces related to the chatbot.
  - `chatbot.ts`: Type definitions for chat messages and responses.

- **src/utils**: Contains utility functions for chat-related tasks.
  - `chatHelpers.ts`: Functions for managing chat tasks.
  - `messageFormatter.ts`: Functions for formatting messages.

- **src/contexts**: Contains context providers for managing global state.
  - `ChatBotContext.tsx`: Context provider for the chatbot.

- **src/styles**: Contains CSS styles specific to the chatbot components.
  - `chatbot.css`: Styles for the chatbot interface.

## Installation
To install the project, clone the repository and run the following commands:

```bash
npm install
```

## Usage
To start the development server, run:

```bash
npm start
```

Visit `http://localhost:3000` in your browser to see the chatbot in action.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.