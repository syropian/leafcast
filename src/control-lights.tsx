import {
  Action,
  ActionPanel,
  Color,
  Icon,
  List,
  showToast,
  Toast,
  launchCommand,
  LaunchType,
  confirmAlert,
  Alert,
} from "@raycast/api";
import { useDeviceApi } from "./hooks/use-device-api";
import { showFailureToast, useCachedState } from "@raycast/utils";
import { useState } from "react";
import tinycolor from "tinycolor2";
import { AddCustomBrightnessForm } from "./components/AddCustomBrightnessForm";
import { SetCustomColorForm } from "./components/SetCustomColorForm";

interface HslWithName {
  hsl: tinycolor.ColorFormats.HSL;
  name: string;
}

export default function Command() {
  const {
    deviceMetadata,
    deviceToken,
    getDeviceEffects,
    isConnecting,
    setDeviceBrightness,
    setDeviceColor,
    turnOffDevice,
    turnOnDevice,
    updateDeviceEffect,
  } = useDeviceApi();
  const [effects, setEffects] = useCachedState<string[]>("device-effects", deviceMetadata?.effects.effectsList ?? []);
  const [customColors, setCustomColors] = useCachedState<HslWithName[]>("custom-colors", []);
  const [customBrightnessValues, setCustomBrightnessValues] = useCachedState<number[]>("custom-brightness-values", []);
  const [isLoadingEffects, setIsLoadingEffects] = useState<boolean>(false);

  console.log(customColors);

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

  async function handleAddCustomBrightnessValue(value: number) {
    if (customBrightnessValues.includes(value)) {
      showFailureToast("That value already exists.");
      return;
    }

    setCustomBrightnessValues((vals) => [...vals, value]);
    await showToast({ title: "Custom brightness value added successfully", style: Toast.Style.Success });
  }

  async function handleSetCustomColor(color: tinycolor.ColorFormats.HSL, persist?: boolean) {
    await setDeviceColor(color);

    if (persist) {
      const colorName = tinycolor(color).toName() || "Unknown Color";
      const hslColorWithName: HslWithName = {
        hsl: color,
        name: colorName,
      };

      setCustomColors((colors) => [...colors.filter((color) => color.name !== colorName), hslColorWithName]);
    }
  }

  async function clearCustomBrightnessValues() {
    if (
      await confirmAlert({
        title: "Are you sure you want to delete all of your custom brightness values?",
        primaryAction: {
          title: "Yes, Delete Them",
          style: Alert.ActionStyle.Destructive,
        },
      })
    ) {
      setCustomBrightnessValues([]);
    }
  }

  async function clearCustomColors() {
    if (
      await confirmAlert({
        title:
          "Are you sure you want to delete all of your custom colors? This will not delete any of the effects you have saved on your device.",
        primaryAction: {
          title: "Yes, Delete Them",
          style: Alert.ActionStyle.Destructive,
        },
      })
    ) {
      setCustomColors([]);
    }
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
            accessories={[{ text: deviceMetadata?.effects.select.replace("*Solid*", "Solid Color") }]}
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
                  {!!customBrightnessValues.length && (
                    <ActionPanel.Section title="Custom Values">
                      {customBrightnessValues.map((value) => (
                        <Action
                          title={`${value}% Brightness`}
                          key={value}
                          onAction={() => doSetDeviceBrightness(value)}
                        />
                      ))}
                    </ActionPanel.Section>
                  )}
                  {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((brightness) => (
                    <Action
                      title={`${brightness}% Brightness`}
                      key={brightness}
                      onAction={() => doSetDeviceBrightness(brightness)}
                    />
                  ))}
                </ActionPanel.Submenu>
                <Action.Push
                  title="Add Custom Brightness"
                  icon={Icon.PlusCircle}
                  target={<AddCustomBrightnessForm onAddCustomBrightnessValue={handleAddCustomBrightnessValue} />}
                />
                {!!customBrightnessValues.length && (
                  <Action
                    title="Clear Custom Brightness List"
                    icon={{ source: Icon.XMarkCircle, tintColor: Color.Red }}
                    onAction={clearCustomBrightnessValues}
                    style={Action.Style.Destructive}
                  />
                )}
              </ActionPanel>
            }
          />
          <List.Item
            title="Set Color"
            icon={Icon.Swatch}
            actions={
              <ActionPanel>
                <Action.Push
                  title="Set Color"
                  icon={Icon.Swatch}
                  target={<SetCustomColorForm onSetCustomColor={handleSetCustomColor} />}
                />
                {!!customColors.length && (
                  <Action
                    title="Clear Custom Colors List"
                    icon={{ source: Icon.XMarkCircle, tintColor: Color.Red }}
                    onAction={clearCustomColors}
                    style={Action.Style.Destructive}
                  />
                )}
                <ActionPanel.Section title="Custom Colors">
                  {customColors.map((color, i) => (
                    <Action
                      title={color.name.charAt(0).toUpperCase() + color.name.slice(1)}
                      key={color.name}
                      onAction={() => handleSetCustomColor(color.hsl)}
                      autoFocus={i === 0}
                    />
                  ))}
                </ActionPanel.Section>
              </ActionPanel>
            }
          />
        </List.Section>
      )}
      {!deviceToken && !isConnecting && (
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