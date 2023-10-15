import { getPreferenceValues, LocalStorage, showToast, Toast } from "@raycast/api";
import axios from "axios";

export default async function Command() {
  const { deviceAddress } = getPreferenceValues<ExtensionPreferences>();
  const toast = await showToast({ title: "Authorizing device...", style: Toast.Style.Animated });
  const deviceToken = await LocalStorage.getItem<string>("device-token");

  if (deviceToken) {
    toast.hide();
  } else {
    toast.style = Toast.Style.Failure;
    toast.title = "Unable to authenticate device. Please pair your device first.";
  }

  await axios.put(`http://${deviceAddress}:16021/api/v1/${deviceToken}/state`, {
    brightness: {
      value: 20,
    },
  });
}
