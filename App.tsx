import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { usePermissions, LOCATION } from 'expo-permissions';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

const TASK = 'log-location';
let ID = 0;

enum State {
  Started = 'started',
  Stopped = 'stopped',
  Pending = 'pending',
}

registerTask();

export default function App() {
  const [permission, askPermission, getPermission] = usePermissions(LOCATION, { ask: true });
  const [state, setState] = useState(State.Stopped);

  const onStartLocation = useCallback(async () => {
    setState(State.Pending);
    await Location.startLocationUpdatesAsync(TASK, {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 5000,
      foregroundService: {
        notificationTitle: 'FBI Agent',
        notificationBody: 'Im just chilling here with you',
        notificationColor: '#ff0000'
      }
    });
    setState(State.Started);
  }, []);

  const onStopLocation = useCallback(async () => {
    setState(State.Pending);
    await Location.stopLocationUpdatesAsync(TASK);
    setState(State.Stopped);
  }, []);

  useEffect(() => {
    getPermission();
    Location.hasStartedLocationUpdatesAsync(TASK).then(
      isStarted => setState(isStarted ? State.Started : State.Stopped),
    );
  }, []);

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text>We need your permission to start background location checks</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Background location is currently: {state}</Text>
      {state === State.Started && <Button onPress={onStopLocation} title='Stop background location' />}
      {state === State.Stopped && <Button onPress={onStartLocation} title='Start background location' />}
      {state === State.Pending && <Button onPress={() => undefined} title='Changing background location...' disabled />}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

async function registerTask() {
  try {
    console.log('Unreginstering task...');
    await TaskManager.unregisterTaskAsync(TASK);
    console.log('Unregistered task!');
  } catch (error) {
    console.log('Failed unregistering task', error);
  }
  try {
    console.log('Reginstering task...');
    await TaskManager.defineTask(TASK, result => {
      if (result.error) {
        return console.error(`Failed to execute task: [${result.error.code}] - `, result.error.message);
      }

      console.log(`LOCATION #${ID++}`, (result.data as any).locations);
    });
    console.log('Registered task!');
  } catch (error) {
    console.log('Failed registering task', error);
  }
}
