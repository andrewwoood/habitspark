import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome to Habit Spark</Text>
      <Button mode="contained" onPress={() => console.log('Create habit')}>
        Create Habit
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 24,
    marginBottom: 20,
  },
}); 