import { NativeService } from './native.service';
import { Injectable } from '@angular/core';
import CameraInfo from './model/cameraInfo';
import Resolution from './model/resolution';

@Injectable({
  providedIn: 'root'
})
export class WebrtcService {
  stream: MediaStream | null = null;
  cameras: CameraInfo[] = [];
  permission: boolean = false;
  initializedFilter: boolean = false;
  ratio: string[];
  statusFrontCamera: boolean = false;
  statusBackCamera: boolean = false;
  resolutionByRatio: any = {
    '16:9': [
      { label: 'FullHD', width: 1920, height: 1080 },
      { label: 'HD', width: 1280, height: 720 },
      { label: 'PAL', width: 1024, height: 576 },
      { label: 'qHD', width: 960, height: 540 },
    ],
    '9:16': [
      { label: 'FullHD', width: 1080, height: 1920 },
      { label: 'HD', width: 720, height: 1280 },
      { label: 'qHD', width: 540, height: 960 },
      { label: 'PAL', width: 576, height: 1024 },
    ],
    '4:3': [
      { label: 'SXGA-', width: 1280, height: 960 },
      { label: 'XGA+', width: 1152, height: 864 },
      { label: 'XGA', width: 1024, height: 768 },
      { label: 'SVGA', width: 800, height: 600 },
      { label: 'VGA', width: 640, height: 480 },
    ],
    '3:4': [
      { label: 'SXGA-', width: 960, height: 1280 },
      { label: 'XGA+', width: 864, height: 1152 },
      { label: 'XGA', width: 768, height: 1024 },
      { label: 'SVGA', width: 600, height: 800 },
      { label: 'VGA', width: 480, height: 640 },
    ],
  };


  constructor(
    private nativeService: NativeService
  ) { }


  //start camera
  async startUserMedia(deviceId: string, width: number, height: number) {
    try {
      let constraints = {
        video: {
          deviceId: deviceId,
          width: { exact: width },
          height: { exact: height },
        },
      };
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('เปิดกล้องแล้ว');
    } catch (error) {
      console.log(error);
    }
  }

  //stop camera
  stopUserMedia(source: MediaStream | null) {
    try {
      if (source) {
        source.getTracks().forEach((track) => {
          track.stop();
        });
        console.log('ปิดกล้องแล้ว');
      }
    } catch (error) {
      console.log(error);
    }
  }

  //get informatiom camera and filter
  async initializeCamera() {
    try {
      console.log('เรียกข้อมูลกล้อง');
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputDevices = devices.filter((device) => device.kind === 'videoinput');
      if (videoInputDevices.length > 0) {
        this.cameras = await this.filterCameraInfo(videoInputDevices);
        console.log('เรียกข้อมูลกล้องแล้ว: ', this.cameras);
      } else {
        console.log('ไม่พบกล้อง');
      }
    } catch (error) {
      console.log(error);
    }
  }

  //filter cameras
  filterCameraInfo(cameras: MediaDeviceInfo[]) {
    // filter front and back camera for ios
    const cameraInfo: CameraInfo[] = [];
    const front = cameras.find((cam) => cam.label.includes('Front Camera'));
    const back = cameras.find((cam) => cam.label.includes('Back Camera'));

    if (front) {
      cameraInfo.push({
        label: front.label,
        side: 'Front Camera',
        deviceId: front.deviceId,
        ratioWideScreen: [],
        ratioFullScreen: []
      });
    }
    if (back) {
      cameraInfo.push({
        label: back.label,
        side: 'Back Camera',
        deviceId: back.deviceId,
        ratioWideScreen: [],
        ratioFullScreen: []
      });
    }

    // filter front and back camera for android
    let minFrontIndex: number | undefined;
    let minFrontDevice: MediaDeviceInfo | undefined;
    let minBackIndex: number | undefined;
    let minBackDevice: MediaDeviceInfo | undefined;

    if (!front && !back) {
      for (let device of cameras) {
        const deviceParts = device.label.split(',').map((item) => item.trim());
        const index = Number.parseInt(deviceParts[0].split(' ')[1]);
        const facing = deviceParts[1];

        if (facing === 'facing front') {
          if (minFrontIndex === undefined || index < minFrontIndex) {
            minFrontIndex = index;
            minFrontDevice = device;
          }
        }
        if (facing === 'facing back') {
          if (minBackIndex === undefined || index < minBackIndex) {
            minBackIndex = index;
            minBackDevice = device;
          }
        }
      }
      if (minFrontDevice) {
        cameraInfo.push({
          label: minFrontDevice.label,
          side: 'Front Camera',
          deviceId: minFrontDevice.deviceId,
          ratioWideScreen: [],
          ratioFullScreen: []
        });
      }
      if (minBackDevice) {
        cameraInfo.push({
          label: minBackDevice.label,
          side: 'Back Camera',
          deviceId: minBackDevice.deviceId,
          ratioWideScreen: [],
          ratioFullScreen: []
        });
      }
    }
    if (!front && !back && !minFrontDevice && !minBackDevice) {
      const device = cameras.find(() => true);
      if (device) {
        cameraInfo.push({
          label: device.label,
          side: 'Front Camera',
          deviceId: device.deviceId,
          ratioWideScreen: [],
          ratioFullScreen: []
        });
      }
    }
    return cameraInfo;
  }

  getFrontCamera() {
    return this.cameras.find((cameras: any) => cameras.side === 'Front Camera');
  }

  getBackCamera() {
    return this.cameras.find((cameras: any) => cameras.side === 'Back Camera');
  }


  //filter resolution
  async initializeFilter(camera: CameraInfo) {
    this.nativeService.presentLoadingWithOutTime('กำลังสแกนความละเอียดของกล้อง');
    if (camera) {
      await Promise.all([
        this.initialzeTesting(camera, this.resolutionByRatio['16:9'], '16:9'),
        this.initialzeTesting(camera, this.resolutionByRatio['4:3'], '4:3')
      ]);
      this.stopUserMedia(this.stream);
      this.nativeService.dismissLoading();
      console.log('สแกนเสร็จแล้ว', camera);
    } else {
      console.log('ไม่พบกล้องถ่ายรูป');
      this.nativeService.dismissLoading();
    }
  }

  async initialzeTesting(camera: CameraInfo, resolution: Resolution[], ratio: string) {
    let totalPassed = 0;
    const passedPromises = resolution.map(res => this.resolutionTesting(camera.deviceId, res));
    const passedResults = await Promise.all(passedPromises);
    passedResults.forEach((passed, index) => {
      if (passed) {
        totalPassed++;
        const res = resolution[index];
        this.pushRatioInfo(camera.side, res, ratio);
      }
    });

    if (camera.side === 'Front Camera') {
      this.statusFrontCamera = true;
    } else if (camera.side === 'Back Camera') {
      this.statusBackCamera = true;
    }
    console.log('สแกนผ่านทั้งหมด:', totalPassed + ' จาก ' + resolution.length + ' รายการ');
    this.nativeService.Toast('สแกนผ่านทั้งหมด: ' + totalPassed + ' จาก ' + resolution.length + ' รายการ', 'top', 'success', 1);
  }

  async resolutionTesting(deviceId: string, resolution: Resolution) {
    this.stopUserMedia(this.stream);
    const constraints = {
      video: {
        deviceId: deviceId,
        width: { exact: resolution.width },
        height: { exact: resolution.height }
      }
    };
    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('สามารถแสดงด้วย', resolution.label);
      return true;
    } catch (err) {
      console.log('ไม่สามารถแสดงด้วย:', resolution.label);
      return false;
    }
  }

  //filter resolution
  // async initializeFilter(camera: CameraInfo) {
  //   this.nativeService.presentLoadingWithOutTime('กำลังสแกนความละเอียดของกล้อง');
  //   if (camera) {
  //     this.nativeService.Toast('พบกล้องถ่ายรูป', 'top', 'success', 1);
  //     await this.initialzeTesting(camera, this.resolutionByRatio['16:9'], '16:9');
  //     await this.initialzeTesting(camera, this.resolutionByRatio['4:3'], '4:3');
  //     await this.stopUserMedia(this.stream);
  //     await this.nativeService.dismissLoading();
  //     console.log('สแกนเสร็จแล้ว', camera);
  //     this.nativeService.Toast('สแกนเสร็จแล้ว', 'top', 'success', 1);
  //   } else {
  //     console.log('ไม่พบกล้องถ่ายรูป');
  //     this.nativeService.Toast('ไม่พบกล้องถ่ายรูป', 'top', 'danger', 1);
  //     await this.nativeService.dismissLoading();
  //   }
  // }

  // async initialzeTesting(camera: CameraInfo, resolution: Resolution[], ratio: string): Promise<any> {
  //   let pass = false;
  //   let totalPassed = 0;
  //   for (let res of resolution) {
  //     pass = await this.resolutionTesting(camera.deviceId, res);
  //     if (pass) {
  //       totalPassed++;
  //       this.pushRatioInfo(camera.side, res, ratio);
  //     }
  //   }
  //   if (camera.side === 'Front Camera') {
  //     this.statusFrontCamera = true;
  //   } else if (camera.side === 'Back Camera') {
  //     this.statusBackCamera = true;
  //   }
  //   console.log('สแกนผ่านทั้งหมด:', totalPassed + ' จาก ' + resolution.length + ' รายการ');
  //   this.nativeService.Toast('สแกนผ่านทั้งหมด: ' + totalPassed + ' จาก ' + resolution.length + ' รายการ', 'top', 'success', 1);
  // }

  // async resolutionTesting(deviceId: string, resolution: Resolution) {
  //   this.stopUserMedia(this.stream);
  //   const constraints = {
  //     video: {
  //       deviceId: deviceId,
  //       width: { exact: resolution.width },
  //       height: { exact: resolution.height }
  //     }
  //   };
  //   try {
  //     this.stream = await navigator.mediaDevices.getUserMedia(constraints);
  //     console.log('สามารถแสดงด้วย', resolution.label);
  //     this.nativeService.Toast('สามารถแสดงด้วย: ' + resolution.label, 'bottom', 'success', .3);
  //     return true;
  //   } catch (err) {
  //     console.log('ไม่สามารถแสดงด้วย:', resolution.label);
  //     this.nativeService.Toast('ไม่สามารถแสดงด้วย: ' + resolution.label, 'bottom', 'danger', .3);
  //     return false;
  //   }
  // }



  //push resolution
  async pushRatioInfo(deviceName: string, res: any, ratio: string) {
    const camera = this.cameras.find(cam => cam.side === deviceName);
    if (!camera) {
      console.log(`Camera '${deviceName}' not found.`);
      return;
    }

    switch (deviceName) {
      case 'Front Camera':
        switch (ratio) {
          case '16:9':
            console.log('Pushing to 16:9');
            camera.ratioWideScreen.push(res);
            break;
          case '4:3':
            console.log('Pushing to 4:3');
            camera.ratioFullScreen.push(res);
            break;
          default:
            console.log('Unsupported ratio:', ratio);
            break;
        }
        break;
      case 'Back Camera':
        switch (ratio) {
          case '16:9':
            console.log('Pushing to 16:9');
            camera.ratioWideScreen.push(res);
            break;
          case '4:3':
            console.log('Pushing to 4:3');
            camera.ratioFullScreen.push(res);
            break;
          default:
            console.log('Unsupported ratio:', ratio);
            break;
        }
        break;
      default:
        console.log(`Unsupported device: ${deviceName}`);
        break;
    }
  }
}
