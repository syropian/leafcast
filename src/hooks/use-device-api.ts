import { getPreferenceValues } from "@raycast/api";
import { useCachedState } from "@raycast/utils";
import axios from "axios";
import { useEffect, useState } from "react";

type NumberWithMinMax = {
  value: number;
  max: number;
  min: number;
};

interface DeviceMetadata {
  name: string;
  serialNo: string;
  manufacturer: string;
  firmwareVersion: string;
  model: string;
  state: {
    on: {
      value: boolean;
    };
    brightness: NumberWithMinMax;
    hue: NumberWithMinMax;
    sat: NumberWithMinMax;
    ct: NumberWithMinMax;
    colorMode: string;
  };
  effects: {
    select: string;
    effectsList: string[];
  };
}
export function useDeviceApi() {
  const [deviceToken, setDeviceToken] = useCachedState<string>("device-token", "");
  const [deviceMetadata, setDeviceMetadata] = useCachedState<DeviceMetadata | null>("device-metadata", null);
  const [isConnecting, setConnected] = useState<boolean>(true);
  const { deviceAddress } = getPreferenceValues<ExtensionPreferences>();

  const http = axios.create({
    baseURL: `http://${deviceAddress}:16021/api/v1`,
  });

  useEffect(() => {
    if (!deviceToken) {
      setConnected(false);
      return;
    }

    _getDeviceMetadata();
  }, [deviceToken]);

  async function _getDeviceMetadata() {
    try {
      const { data } = await http.get(`/${deviceToken}`);
      delete data.panelLayout;
      delete data.rhythm;

      setDeviceMetadata(data);
    } catch (e) {
      console.log(e);
    } finally {
      setConnected(false);
    }
  }

  function _updateState(state: Record<string, unknown>) {
    return http.put(`/${deviceToken}/state`, state);
  }

  async function pairDevice(): Promise<void> {
    try {
      const { data } = await http.post("/new");
      const token = data.auth_token;

      if (token) {
        setDeviceToken(token);
      }
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async function setDeviceBrightness(brightness: number) {
    await _updateState({
      brightness: {
        value: brightness,
      },
    });
    _getDeviceMetadata();
  }

  async function setDeviceColor(color: tinycolor.ColorFormats.HSL) {
    await _updateState({
      hue: {
        value: Math.round(color.h),
      },
      sat: {
        value: Math.min(Math.max(Math.round(color.s * 100), 0), 100),
      },
      brightness: {
        value: Math.min(Math.max(Math.round(color.l * 100), 0), 100),
      },
    });
    _getDeviceMetadata();
  }

  async function turnOffDevice() {
    await _updateState({
      on: {
        value: false,
      },
    });
    _getDeviceMetadata();
  }

  async function turnOnDevice() {
    await _updateState({
      on: {
        value: true,
      },
    });
    _getDeviceMetadata();
  }

  async function getDeviceEffects(): Promise<string[]> {
    const { data } = await http.get(`/${deviceToken}/effects/effectsList`);

    return data as string[];
  }

  async function updateDeviceEffect(effect: string) {
    await http.put(`/${deviceToken}/effects`, { select: effect });
    _getDeviceMetadata();
  }

  return {
    deviceAddress,
    deviceMetadata,
    deviceToken,
    getDeviceEffects,
    isConnecting,
    pairDevice,
    setDeviceBrightness,
    setDeviceColor,
    turnOffDevice,
    turnOnDevice,
    updateDeviceEffect,
  };
}
