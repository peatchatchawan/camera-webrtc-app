import Resolution from "./resolution";

interface CameraInfo {
    label: string;
    side: string;
    deviceId: string;
    ratioWideScreen: Resolution[];
    ratioFullScreen: Resolution[];
}

export default CameraInfo;