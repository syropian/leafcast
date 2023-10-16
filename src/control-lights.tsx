import { Action, ActionPanel, Color, Icon, List, showToast, Toast, launchCommand, LaunchType } from "@raycast/api";
import { useDevice } from "./hooks/use-device";
import { useCachedState } from "@raycast/utils";
import { useState } from "react";

export default function Command() {
  const {
    deviceMetadata,
    deviceToken,
    isLoading,
    setDeviceBrightness,
    turnOffDevice,
    turnOnDevice,
    getDeviceEffects,
    updateDeviceEffect,
  } = useDevice();
  const [effects, setEffects] = useCachedState<string[]>("device-effects", deviceMetadata?.effects.effectsList ?? []);
  const [isLoadingEffects, setIsLoadingEffects] = useState<boolean>(false);

  async function doSetDeviceBrightness(brightness: number) {
    await setDeviceBrightness(brightness);
    await showToast({ title: `Brightness set to ${brightness}%`, style: Toast.Style.Success });
  }

  async function doGetDeviceEffects() {
    setIsLoadingEffects(true);
    const effects = await getDeviceEffects();
    setEffects(effects);
    setIsLoadingEffects(false);
  }

  async function doUpdateDeviceEffect(effect: string) {
    await updateDeviceEffect(effect);
    await showToast({ title: `Effect set to ${effect}`, style: Toast.Style.Success });
  }

  async function launchPairDeviceCommand() {
    await launchCommand({ name: "pair-device", type: LaunchType.UserInitiated });
  }

  return (
    <List>
      {Boolean(deviceMetadata) && Boolean(deviceToken) && (
        <List.Section title={deviceMetadata?.name}>
          <List.Item
            title="Power"
            icon={Icon.Power}
            accessories={[
              {
                icon: {
                  source: Icon.CircleFilled,
                  tintColor: deviceMetadata
                    ? deviceMetadata.state.on.value
                      ? Color.Green
                      : Color.Red
                    : Color.SecondaryText,
                },
              },
            ]}
            actions={
              <ActionPanel>
                <ActionPanel.Submenu title="Turn Your Device On or Off">
                  <Action
                    title="Turn On"
                    onAction={turnOnDevice}
                    icon={{ source: Icon.Power, tintColor: Color.Green }}
                  />
                  <Action
                    title="Turn Off"
                    onAction={turnOffDevice}
                    icon={{ source: Icon.Power, tintColor: Color.Red }}
                  />
                </ActionPanel.Submenu>
              </ActionPanel>
            }
          />
          <List.Item
            title="Select effect"
            accessories={[{ text: deviceMetadata?.effects.select }]}
            icon={Icon.Stars}
            actions={
              <ActionPanel>
                <ActionPanel.Submenu title="Select an Effect" onOpen={doGetDeviceEffects} isLoading={isLoadingEffects}>
                  {effects.map((effect) => (
                    <Action title={effect} key={effect} onAction={() => doUpdateDeviceEffect(effect)} />
                  ))}
                </ActionPanel.Submenu>
              </ActionPanel>
            }
          />
          <List.Item
            title="Manage brightness"
            accessories={[{ text: `${deviceMetadata?.state.brightness.value.toString()}%` }]}
            icon={Icon.LightBulb}
            actions={
              <ActionPanel>
                <ActionPanel.Submenu title="Select a Brightness">
                  {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((brightness) => (
                    <Action
                      title={`${brightness}% Brightness`}
                      key={brightness}
                      onAction={() => doSetDeviceBrightness(brightness)}
                    />
                  ))}
                </ActionPanel.Submenu>
              </ActionPanel>
            }
          />
        </List.Section>
      )}
      {!deviceToken && !isLoading && (
        <List.EmptyView
          title="Device not paired"
          icon={Icon.LivestreamDisabled}
          description="Before you can control your Nanoleaf panels with Raycast, you must first pair your device."
          actions={
            <ActionPanel>
              <ActionPanel.Submenu title="Pair Device">
                <Action title="Pair Device" icon={Icon.Plug} onAction={launchPairDeviceCommand} />
              </ActionPanel.Submenu>
            </ActionPanel>
          }
        />
      )}
    </List>
  );
}
