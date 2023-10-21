import { Action, ActionPanel, Grid, Icon } from "@raycast/api";
import tinycolor from "tinycolor2";
import { AddCustomColorForm } from "./AddCustomColorForm";

interface HslWithName {
  hsl: tinycolor.ColorFormats.HSL;
  name: string;
}

interface Props {
  colors: HslWithName[];
  onSetCustomColor: (value: tinycolor.ColorFormats.HSL) => void;
}

export function CustomColorGrid({ colors, onSetCustomColor }: Props) {
  return (
    <Grid
      key="add-custom-color"
      actions={
        <ActionPanel>
          <Action.Push
            title="Add Custom Color"
            icon={Icon.PlusCircleFilled}
            target={<AddCustomColorForm onSetCustomColor={onSetCustomColor} />}
          />
        </ActionPanel>
      }
    >
      <Grid.Item
        content={Icon.PlusCircleFilled}
        actions={
          <ActionPanel>
            <Action.Push
              title="Add Custom Color"
              icon={Icon.PlusCircleFilled}
              target={<AddCustomColorForm onSetCustomColor={onSetCustomColor} />}
            />
          </ActionPanel>
        }
        title="Add Custom Color"
      />
      {colors.map((color) => (
        <Grid.Item
          key={color.name}
          content={{
            color: {
              light: tinycolor(color.hsl).toHexString(),
              dark: tinycolor(color.hsl).toHexString(),
              adjustContrast: false,
            },
          }}
          actions={
            <ActionPanel>
              <Action title="Set Color" onAction={() => onSetCustomColor(color.hsl)} />
              <Action title="Delete Color" style={Action.Style.Destructive} />
            </ActionPanel>
          }
          title={`${color.name.charAt(0).toUpperCase() + color.name.slice(1)}`}
          subtitle={`hsl(${Math.round(color.hsl.h)}, ${Math.round(color.hsl.s) * 100}%, ${Math.round(
            color.hsl.l * 100
          )}%)`}
        />
      ))}
    </Grid>
  );
}
