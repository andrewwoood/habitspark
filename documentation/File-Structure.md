
# Habit Tracking App Project Structure

## Root Directory

```
habit-tracking-app/
├── assets/
│   ├── images/
│   │   └── app_icon.png
│   └── icons/
│       └── menu.png
├── components/
│   ├── Button.js
│   ├── Header.js
│   └── ...
├── screens/
│   ├── HomeScreen.js
│   ├── GroupScreen.js
│   ├── ProfileScreen.js
│   └── ...
├── navigation/
│   └── Navigation.js
├── utils/
│   ├── dateHelper.js
│   ├── colorGenerator.js
│   └── ...
├── api/
│   ├── supabaseClient.js
│   ├── auth.js
│   ├── habits.js
│   └── ...
├── store/
│   ├── store.js
│   └── ...
├── types/
│   └── HabitTypes.js
├── constants/
│   └── AppConstants.js
├── App.js
├── package.json
└── ...
```

## Explanation

### assets/
- **images/**: App icons and other images.
- **icons/**: Reusable icons used throughout the app.

### components/
- Reusable UI components.
- **Button.js**: Custom button component.
- **Header.js**: App header component.

### screens/
- Individual screens of the app.
- **HomeScreen.js**: Main screen displaying user's habits.
- **GroupScreen.js**: Screen for managing groups.
- **ProfileScreen.js**: User profile screen.

### navigation/
- Navigation configuration.
- **Navigation.js**: Setup for stacks and tabs.

### utils/
- Utility functions.
- **dateHelper.js**: Functions for date manipulation.
- **colorGenerator.js**: Generates colors for heatmaps.

### api/
- Functions to interact with Supabase.
- **supabaseClient.js**: Supabase client initialization.
- **auth.js**: Authentication functions.
- **habits.js**: Functions for habit data.

### store/
- State management (e.g., Redux or Context API).
- **store.js**: Configuration for state management.

### types/
- TypeScript types and interfaces.
- **HabitTypes.js**: Types related to habits.

### constants/
- Configuration constants.
- **AppConstants.js**: API endpoints, colors, etc.

### Others
- **App.js**: Main application component.
- **package.json**: Project dependencies and scripts.
