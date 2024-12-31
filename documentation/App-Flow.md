
# App Flow

## Table of Contents
- [Onboarding Flow](#onboarding-flow)
- [Home Screen Flow](#home-screen-flow)
- [Habit Creation Flow](#habit-creation-flow)
- [Group Management Flow](#group-management-flow)
- [Profile Management Flow](#profile-management-flow)
- [Error Handling Flow](#error-handling-flow)
- [Navigation Flow](#navigation-flow)

## 1. Onboarding Flow

### 1.1 Sign Up / Log In
#### Screen: Welcome Screen
- Users are greeted with a welcome message and options to "Sign Up" or "Log In."
- Option to log in with Google.

#### Screen: Sign Up
- Users can create an account using email and password.
- Option to sign up with Google.
- After successful sign up, users are redirected to the onboarding screen.

#### Screen: Log In
- Users can log in using email and password.
- Option to log in with Google.
- After successful login, users are redirected to the home screen.

### 1.2 Onboarding
#### Screen: Onboarding - Set Habits
- Users are prompted to set at least one habit.
- Users can add multiple habits.
- After setting habits, users are redirected to the home screen.

## 2. Home Screen Flow

### 2.1 Habit Summary
#### Screen: Home Screen
- Displays a summary of the user's habits for the day.
- Shows a heatmap of habit completion over the past week/month.
- Displays the user's current streak.
- Option to view all habits in a list.

### 2.2 Group Summary
#### Screen: Home Screen
- Displays a summary of the user's groups.
- Shows the collective heatmap for each group.
- Option to view group details.

### 2.3 Quick Actions
#### Screen: Home Screen
- Option to quickly log a habit completion.
- Option to create a new habit.
- Option to create a new group.

## 3. Habit Creation Flow

### 3.1 Create Habit
#### Screen: Create Habit
- Users can input the name of the habit.
- Users can set the frequency of the habit (daily, weekly, etc.).
- Users can set a reminder for the habit (if push notifications are implemented in the future).
- Option to set a goal for the habit (if goals are implemented in the future).
- After creating a habit, users are redirected to the habit list screen.

### 3.2 Habit List
#### Screen: Habit List
- Displays a list of all the user's habits.
- Users can toggle the completion status of each habit.
- Users can edit or delete habits.
- Option to view the habit's detailed progress.

## 4. Group Management Flow

### 4.1 Create Group
#### Screen: Create Group
- Users can input the name of the group.
- The system generates a unique group code.
- Users can invite others to join the group by sharing the group code.
- After creating a group, users are redirected to the group list screen.

### 4.2 Group List
#### Screen: Group List
- Displays a list of all the user's groups.
- Users can view group details, including the collective heatmap.
- Users can manage group members (kick members, delete group).
- Option to join a new group by entering a group code.

### 4.3 Group Details
#### Screen: Group Details
- Displays the collective heatmap for the group.
- Displays a list of group members.
- Users can view individual member profiles.
- Option to leave the group.

## 5. Profile Management Flow

### 5.1 Profile Overview
#### Screen: Profile Overview
- Displays the user's name and avatar.
- Option to view the user's habit list and heatmap.
- Option to view the user's group list.

### 5.2 Edit Profile
#### Screen: Edit Profile
- Users can upload a new avatar.
- Users can edit their profile information (if additional information is added in the future).
- After editing, users are redirected back to the profile overview.

### 5.3 View Member Profile
#### Screen: Member Profile
- Displays the member's name and avatar.
- Displays the member's habit list and heatmap.
- (No bio or achievement badges for now.)

## 6. Error Handling Flow

### 6.1 General Errors
#### Error Messages:
- Clear and concise error messages for common errors (e.g., invalid login credentials, failed to create group, etc.).
- Option to retry the action or go back to the previous screen.

### 6.2 Network Errors
#### Error Handling:
- Graceful handling of network errors (e.g., offline mode, retry option).
- Inform users of network issues and suggest retrying the action.

### 6.3 Edge Cases
#### Edge Case Handling:
- Handle cases where a user tries to join a non-existent group.
- Handle cases where a user tries to create a group with an already existing group code.
- Handle cases where a user tries to add an excessive number of habits (if habit limits are implemented in the future).

## 7. Navigation Flow

### 7.1 Navigation Structure
#### Navigation Stack:
- Welcome Screen -> Sign Up / Log In
- Home Screen -> Habit List / Group List / Profile
- Create Habit -> Habit List
- Create Group -> Group List
- Group Details -> Member Profile

#### Bottom Navigation:
- Home, Groups, Profile

### 7.2 Navigation Flow Diagram
#### Flow Diagram:
- [Flow diagram can be added here, showing the navigation between different screens.]

## Notes

### Future Enhancements:
- Implement push notifications for habit reminders.
- Add bio and achievement badges to profiles.
- Implement a goal system tied to habits.

### Current Limitations:
- No monetization features.
- No bio or achievement badges in profiles.
- No push notifications for reminders.
