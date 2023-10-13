import { LocalStorage, showToast, Toast, getPreferenceValues, confirmAlert } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import axios from "axios";

interface Preferences {
  deviceAddress: string;
}

export default async function Command() {
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
    const toast = await showToast({ title: "Authorizing device...", style: Toast.Style.Animated });
    const { deviceAddress } = getPreferenceValues<Preferences>();
    try {
      const response = await axios.post(`http://${deviceAddress}:16021/api/v1/new`);
      const token = response.data.auth_token;
      await LocalStorage.setItem("device-token", token);
      toast.title = "Device successfully paired";
      toast.style = Toast.Style.Success;
    } catch (e) {
      showFailureToast("Ensure device is in pairing mode", {
        title: "Pairing failed",
      });
    }
  }
}
