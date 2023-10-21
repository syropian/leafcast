import { Action, ActionPanel, Form, useNavigation } from "@raycast/api";
import { useState } from "react";
import tinycolor from "tinycolor2";

interface Props {
  onSetCustomColor: (value: tinycolor.ColorFormats.HSL, persist?: boolean) => void;
}

export function SetCustomColorForm({ onSetCustomColor }: Props) {
  const { pop } = useNavigation();
  const [value, setValue] = useState<string>("Red");
  const [persist, setPersist] = useState<boolean>(false);

  function handleSetCustomColor({ color }: { color: string }) {
    const colorValue = tinycolor(color).toHsl();

    onSetCustomColor(colorValue, persist);
    pop();
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSetCustomColor} />
        </ActionPanel>
      }
    >
      <Form.TextField id="color" title="Color" value={value} onChange={setValue} />
      <Form.Checkbox value={persist} onChange={setPersist} label="Save Custom Color" id="persist" />
    </Form>
  );
}
