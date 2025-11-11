// import { removePushToken, updatePushToken } from "~/apis/auth.api";
import * as Notifications from "expo-notifications";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface NotificationContextType {
  pushToken: string | null;
  notification: Notifications.Notification | null;
  requestPushToken: () => Promise<string | null>;
  deletePushToken: () => Promise<void>;
}

import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notification from "expo-notifications";
import { Platform } from "react-native";

async function registerForPushNotificationsAsync() {
  let token: string | null = null;
  if (Platform.OS === "android") {
    Notification.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notification.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notification.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notification.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      handleRegistrationError(
        "Permission not granted to get push token for push notification!"
      );
      return null;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }

    try {
      token = (await Notification.getDevicePushTokenAsync()).data;
    } catch (error) {
      handleRegistrationError(`${error}`);
    }
  } else {
    handleRegistrationError("Must use physic device for push notification");
  }
  return token;
}

function handleRegistrationError(errorMessage: string) {
  console.log(errorMessage);
  //   toast.error(errorMessage);
  //   throw new Error(errorMessage);
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);

  const notificationListener = useRef<Notifications.EventSubscription>(null);
  const responseListener = useRef<Notifications.EventSubscription>(null);

  const requestPushToken = async () => {
    let token: string | null = null;
    try {
      token = await registerForPushNotificationsAsync();
      if (token) {
        setPushToken(token);
        // updatePushToken(token);
      }
    } catch (error) {
      console.log(error);
    }
    return token;
  };

  const deletePushToken = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setPushToken(null);
        // await removePushToken(token);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log(
          "🔔 Notification Received while user in the app: ",
          notification
        );
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(
          "🔔 Notification Response when user interact with notification: "
        );
        // Handle the notification response here
        const data = response.notification.request.content.data;

        //   Navigate with data from server here
        //   if (data.type && data.type === 'alert') {
        //     router.push({
        //       pathname: '/',
        //       params: {
        //         notificationId: data.id as string,
        //       },
        //     });
        //   }
      });

    const response = Notifications.getLastNotificationResponse();
    if (!isMounted || !response?.notification) {
      console.log("No last notification response or component unmounted.");
      return;
    }
    console.log(
      "🔔 Last Notification Response when app was closed: ",
      response.notification
    );
    const data = response.notification.request.content.data;

    //   Navigate with data from server here
    //   if (data.type && data.type === 'alert') {
    //     router.push({
    //       pathname: '/',
    //       params: {
    //         notificationId: data.id as string,
    //       },
    //     });
    //   }

    return () => {
      isMounted = false;
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        pushToken,
        notification,
        requestPushToken,
        deletePushToken,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
