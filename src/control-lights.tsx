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
  Form,
  useNavigation,
  confirmAlert,
  Alert,
} from "@raycast/api";
import { useDevice } from "./hooks/use-device";
import { showFailureToast, useCachedState } from "@raycast/utils";
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
  const [customBrightnessValues, setCustomBrightnessValues] = useCachedState<number[]>("custom-brightness-values", []);
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

  async function handleAddCustomBrightnessValue(value: number) {
    if (customBrightnessValues.includes(value)) {
      showFailureToast("That value already exists.");
      return;
    }

    setCustomBrightnessValues((vals) => [...vals, value]);
    await showToast({ title: "Custom brightness value added successfully", style: Toast.Style.Success });
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
                  target={<CustomBrightnessForm onAddCustomBrightnessValue={handleAddCustomBrightnessValue} />}
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

interface CustomBrightnessFormProps {
  onAddCustomBrightnessValue: (value: number) => void;
}

function CustomBrightnessForm({ onAddCustomBrightnessValue }: CustomBrightnessFormProps) {
  const { pop } = useNavigation();
  const [value, setValue] = useState<string>("50");
  const [validationError, setValidationError] = useState<string>("");

  function validateValue(e: Form.Event<string>) {
    const value = parseInt(e.target.value ?? "0", 10);

    if (isNaN(value) || value < 0 || value > 100) {
      setValidationError("Please enter a valid number between 0 and 100");
    } else {
      setValidationError("");
    }
  }

  function handleAddCustomBrightnessValue({ value }: { value: string }) {
    const numberValue = parseInt(value, 10);

    if (isNaN(numberValue) || numberValue < 0 || numberValue > 100) {
      setValidationError("Please enter a valid number between 0 and 100");
    } else {
      setValidationError("");
      onAddCustomBrightnessValue(numberValue);
      pop();
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleAddCustomBrightnessValue} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="value"
        title="Value"
        info="Must be a number between 0 and 100"
        value={value}
        onChange={setValue}
        onBlur={validateValue}
        error={validationError}
      />
    </Form>
  );
}
