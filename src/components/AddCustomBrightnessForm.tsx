import { Action, ActionPanel, Form, useNavigation } from "@raycast/api";
import { useState } from "react";

interface Props {
  onAddCustomBrightnessValue: (value: number) => void;
}

export function AddCustomBrightnessForm({ onAddCustomBrightnessValue }: Props) {
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
