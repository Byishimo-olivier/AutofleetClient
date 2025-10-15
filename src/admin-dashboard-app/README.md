# Admin Dashboard App

This project is an admin dashboard application designed for managing various aspects of a vehicle rental service. It provides functionalities for user management, vehicle management, bookings management, reports and analytics, disputes and support, system settings, and notifications.

## Project Structure

The project is organized into the following main directories:

- **src**: Contains all the source code for the application.
  - **components**: Contains reusable UI components.
    - **admin**: Contains components specific to the admin dashboard.
      - `AdminSidebar.tsx`: Renders the sidebar for navigation between admin pages.
    - **ui**: Contains generic UI components.
      - `Button.tsx`: Renders a customizable button element.
      - `Card.tsx`: Renders a card layout for displaying content.
      - `Input.tsx`: Renders an input field for user input.
  - **pages**: Contains the main pages of the application.
    - **admin**: Contains all admin-related pages.
      - `AdminDashboard.tsx`: Main dashboard displaying statistics and trends.
      - `UserManagement.tsx`: Manages user information.
      - `VehicleManagement.tsx`: Manages vehicle listings.
      - `BookingsManagement.tsx`: Manages booking records.
      - `ReportsAnalytics.tsx`: Displays reports and analytics.
      - `DisputesSupport.tsx`: Handles user disputes and support requests.
      - `SystemSettings.tsx`: Configures system settings.
      - `NotificationsCenter.tsx`: Displays notifications.
  - **contexts**: Contains context providers for managing application state.
    - `SettingContext.tsx`: Manages application settings such as theme and language preferences.
  - **hooks**: Contains custom hooks for reusable logic.
    - `useAuth.tsx`: Provides authentication-related functionality.
  - **utils**: Contains utility functions and constants.
    - `constants.ts`: Exports various constants used throughout the application.
  - `App.tsx`: Main application component that sets up routing.
  - `main.tsx`: Entry point of the application.
  - `index.css`: Global CSS styles for the application.

## Installation

To install the project dependencies, run:

```
npm install
```

## Usage

To start the development server, run:

```
npm start
```

The application will be available at `http://localhost:3000`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.