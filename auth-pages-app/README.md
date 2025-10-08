# Auth Pages App

## Overview
The Auth Pages App is a React application that provides user authentication functionality through login and registration pages. It allows users to create an account or log in using their existing credentials. The application is designed with a clean and modern interface, utilizing social media authentication options for convenience.

## Features
- User registration with validation
- User login with validation
- Social media authentication buttons (Google, Facebook)
- Responsive design for mobile and desktop views
- Consistent styling across authentication forms

## Project Structure
```
auth-pages-app
├── src
│   ├── components
│   │   ├── AuthSocialButtons.tsx
│   │   └── AuthFormWrapper.tsx
│   ├── pages
│   │   ├── auth
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   ├── assets
│   │   └── car-bg.svg
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public
│   └── index.html
├── package.json
├── tsconfig.json
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd auth-pages-app
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
To start the development server, run:
```
npm start
```
This will launch the application in your default web browser at `http://localhost:3000`.

## Components
- **AuthSocialButtons**: Renders social media buttons for authentication.
- **AuthFormWrapper**: Provides a consistent layout for authentication forms.
- **LoginPage**: Contains the login form with email and password fields.
- **RegisterPage**: Contains the registration form with user details fields.

## Assets
- **car-bg.svg**: Background image used in authentication pages.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.