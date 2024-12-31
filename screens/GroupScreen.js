import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

export default function GroupScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spark Groups</Text>
      <Button mode="contained" onPress={() => console.log('Create group')}>
        Create Group
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
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
}); 