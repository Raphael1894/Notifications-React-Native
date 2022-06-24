import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Alert, Button, StyleSheet, View, Platform } from "react-native";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowAlert: true,
    };
  },
});

export default function App() {
  useEffect(() => {
    async function configurePushNotifications() {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (finalStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Permission required",
          "The app needs to have accesss to work properly"
        );
        return;
      }
      const pushTokenData = await Notifications.getExpoPushTokenAsync();
      //console.log(pushTokenData);

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
    }
    configurePushNotifications();
  }, []);

  useEffect(() => {
    const subscriptionNotif = Notifications.addNotificationReceivedListener(
      (notification) => {
        //console.log("notification received");
        //console.log(notification);
        const userName = notification.request.content.data.userName;
        console.log(userName);
      }
    );

    const subscriptionResp =
      Notifications.addNotificationResponseReceivedListener((response) => {
        //console.log("response received");
        //console.log(response);
      });

    return () => {
      subscriptionNotif.remove();
      subscriptionResp.remove();
    };
  }, []);

  function scheduleNotificationHandler() {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "My first local notification",
        body: "This is the body of the notification",
        data: { userName: "Johnes" },
      },
      trigger: {
        seconds: 2,
      },
    });
  }

  function sendPushNotificationHandler() {
    //Add pushTokenData in the brackets
    const receiverToken = "ExponentPushToken[]";

    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: receiverToken,
        title: "Test - sent from a device",
        body: "Lorem ipsum",
      }),
    });
  }

  return (
    <View style={styles.button}>
      <View style={styles.container}>
        <Button
          title="Schedule Notification"
          onPress={scheduleNotificationHandler}
        />
      </View>
      <View style={styles.button}>
        <Button
          title="Send Push Notification"
          onPress={sendPushNotificationHandler}
        />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    margin: 20,
    flex: 1,
  },
});
