export enum DeviceType {
    Mouse = 0,
    Touch = 1,
    Keyboard = 2,
}

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
}

export interface PointerInfo {
    x: number;
    y: number;
    button: MouseButton;
    deviceType: DeviceType;
    pointerId: number;
    isPrimary: boolean;
    pressure: number;
}

export interface TouchPoint {
    id: number;
    x: number;
    y: number;
    radiusX?: number;
    radiusY?: number;
    force?: number;
}

export interface WheelInfo {
    deltaX: number;
    deltaY: number;
    deltaZ: number;
    deltaMode: number;
}

export interface KeyboardInfo {
    key: string;
    code: string;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    metaKey: boolean;
}
