import { Action, ActionPanel, Grid, Icon } from "@raycast/api";
import tinycolor from "tinycolor2";
import { AddCustomColorForm } from "./AddCustomColorForm";
import { useState } from "react";
import { createHslColorWithName } from "../utils";
import { HslWithName } from "../types";

interface Props {
  colors: HslWithName[];
  onDeleteCustomColor: (color: HslWithName) => void;
  onSetCustomColor: (color: tinycolor.ColorFormats.HSL) => void;
}

export function CustomColorGrid({ colors: colorsFromProps, onDeleteCustomColor, onSetCustomColor }: Props) {
  // We need this state to deal with a bug where the props are not updating after adding a new color
  const [colors, setColors] = useState<HslWithName[]>(colorsFromProps);

  function handleSetCustomColor(color: tinycolor.ColorFormats.HSL) {
    const hslColor = createHslColorWithName(color);

    setColors((colors) => [...colors.filter((color) => color.name !== hslColor.name), hslColor]);

    onSetCustomColor(color);
  }

  function handleDeleteCustomColor(color: HslWithName) {
    setColors((colors) => colors.filter((currentColor) => currentColor.name !== color.name));

    onDeleteCustomColor(color);
  }

  return (
    <Grid
      actions={
        <ActionPanel>
          <Action.Push
            title="Add Custom Color"
            icon={Icon.PlusCircleFilled}
            target={<AddCustomColorForm onSetCustomColor={handleSetCustomColor} />}
          />
        </ActionPanel>
      }
    >
      <Grid.Item
        key="add-custom-color"
        content={Icon.PlusCircleFilled}
        actions={
          <ActionPanel>
            <Action.Push
              title="Add Custom Color"
              icon={Icon.PlusCircleFilled}
              target={<AddCustomColorForm onSetCustomColor={handleSetCustomColor} />}
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
              <Action
                title="Delete Color"
                style={Action.Style.Destructive}
                onAction={() => handleDeleteCustomColor(color)}
              />
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
