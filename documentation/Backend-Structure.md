
# Backend Structure

Below is a markdown representation of the backend structure for your habit tracking app. This structure is designed to be scalable, maintainable, and organized.

```
backend/
├── controllers/
│   ├── authController.js
│   ├── habitController.js
│   ├── groupController.js
│   └── userController.js
├── models/
│   ├── User.js
│   ├── Habit.js
│   ├── Group.js
│   └── GroupMember.js
├── routes/
│   ├── authRoutes.js
│   ├── habitRoutes.js
│   ├── groupRoutes.js
│   └── userRoutes.js
├── middleware/
│   └── authMiddleware.js
├── utils/
│   ├── dateUtils.js
│   ├── colorUtils.js
│   └── ...
├── config/
│   └── config.js
├── database/
│   └── db.js
├── services/
│   └── supabaseService.js
├── tests/
│   ├── authTests.js
│   ├── habitTests.js
│   ├── groupTests.js
│   └── userTests.js
├── app.js
└── package.json
```

## Explanation

### controllers/
- Handle business logic for different endpoints.
- **authController.js**: Handles authentication logic (signup, login, Google OAuth).
- **habitController.js**: Handles habit-related operations (create, update, delete).
- **groupController.js**: Handles group-related operations (create, join, manage members).
- **userController.js**: Handles user profile-related operations.

### models/
- Define data models and schemas.
- **User.js**: User model with fields like email, password, and profile information.
- **Habit.js**: Habit model with fields like title, frequency, and completion status.
- **Group.js**: Group model with fields like name, code, and member list.
- **GroupMember.js**: Association model between users and groups.

### routes/
- Define API routes.
- **authRoutes.js**: Routes for authentication endpoints.
- **habitRoutes.js**: Routes for habit-related endpoints.
- **groupRoutes.js**: Routes for group-related endpoints.
- **userRoutes.js**: Routes for user profile-related endpoints.

### middleware/
- Handle request middleware.
- **authMiddleware.js**: Middleware for authentication and authorization checks.

### utils/
- Utility functions.
- **dateUtils.js**: Functions for date manipulation.
- **colorUtils.js**: Functions for generating colors for heatmaps.

### config/
- Configuration files.
- **config.js**: Environment variables and configuration settings.

### database/
- Database connection and setup.
- **db.js**: Supabase client initialization and database connections.

### services/
- External service integrations.
- **supabaseService.js**: Functions for interacting with Supabase.

### tests/
- Test files for backend logic.
- **authTests.js**: Tests for authentication controllers and routes.
- **habitTests.js**: Tests for habit controllers and routes.
- **groupTests.js**: Tests for group controllers and routes.
- **userTests.js**: Tests for user controllers and routes.

### Others
- **app.js**: Main application file, sets up express app, middleware, and routes.
- **package.json**: Project dependencies and scripts.
