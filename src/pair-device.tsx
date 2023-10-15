import { showToast, Toast, confirmAlert, List, Icon, Image, Color } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { useDevice } from "./hooks/use-device";
import { useEffect, useState } from "react";

export default function Command() {
  const { pairDevice } = useDevice();
  const [status, setStatus] = useState("Waiting to pair...");
  const [message, setMessage] = useState("");
  const [icon, setIcon] = useState<Image.ImageLike>(Icon.Clock);

  useEffect(() => {
    const attemptToPairDevice = async () => {
      if (
        await confirmAlert({
          title: "Place your device in pairing mode",
          message:
            "Before we begin pairing you must put your device into pairing mode. To do this, press and hold the power button on your device until the LED starts flashing. ",
          primaryAction: {
            title: "I'm ready to pair",
          },
        })
      ) {
        const toast = await showToast({ title: "Fetching token...", style: Toast.Style.Animated });

        setStatus("Fetching token...");
        setIcon(Icon.Signal3);

        try {
          await pairDevice();

          toast.title = "Device successfully paired";

          toast.style = Toast.Style.Success;

          setStatus("Device successfully paired!");
          setIcon({ source: Icon.CheckCircle, tintColor: Color.Green });
        } catch (e) {
          showFailureToast("Ensure device is in pairing mode", {
            title: "Pairing failed",
          });
          setStatus("Pairing failed");
          setMessage("Please ensure your device is in pairing mode and try again.");
          setIcon({ source: Icon.XMarkCircle, tintColor: Color.Red });
        }
      }
    };

    attemptToPairDevice();
  }, []);

  return (
    <List>
      <List.EmptyView title={status} icon={icon} description={message} />
    </List>
  );
}
