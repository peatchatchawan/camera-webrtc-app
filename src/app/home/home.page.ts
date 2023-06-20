import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { AngularDeviceInformationService } from 'angular-device-information';
import { NativeService } from '../services/native.service';
import { WebrtcService } from '../services/webrtc.service';
import CameraInfo from '../services/model/cameraInfo';
import { CamerasPage } from '../pages/cameras/cameras.page';
import { IosPage } from '../pages/ios/ios.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class HomePage implements OnInit {


  @ViewChild('video') video: ElementRef<HTMLVideoElement>;
  cameras: CameraInfo[] = [];
  os: any;
  version: any;
  browser: any;
  browserVersion: any;
  userAgent: any;
  cpuCores: any;
  memory: any;
  resolutionWideScreen: string | undefined;
  resolutioFullScreen: string | undefined;

  constructor(
    private nativeService: NativeService,
    private webrtcService: WebrtcService,
    private modalController: ModalController,
    private deviceInformationService: AngularDeviceInformationService,
  ) { }
  async ngOnInit(): Promise<void> {
    await this.getDeviceInformation();
    await this.cameraActive();
    await this.webrtcService.initializeCamera();
    this.cameras = await this.webrtcService.cameras;

  }

  async getDeviceInformation(): Promise<void> {
    this.os = await this.deviceInformationService.getDeviceInfo().os;
    this.version = await this.deviceInformationService.getDeviceInfo().osVersion;
    this.browser = await this.deviceInformationService.getDeviceInfo().browser;
    this.browserVersion = await this.deviceInformationService.getDeviceInfo().browserVersion;
    this.userAgent = await this.deviceInformationService.getDeviceInfo().userAgent;
    this.cpuCores = navigator.hardwareConcurrency;
    this.memory = (navigator as any).deviceMemory;
  }


  async openModalCamera() {
    const modal = await this.modalController.create({
      component: CamerasPage,
      backdropDismiss: true,
      showBackdrop: true,
      animated: true,
      keyboardClose: true,
      presentingElement: await this.modalController.getTop(),
    });
    await modal.present();
  }

  async openModalVideoTesting() {
    const modal = await this.modalController.create({
      component: IosPage,
      backdropDismiss: true,
      showBackdrop: true,
      animated: true,
      keyboardClose: true,
      presentingElement: await this.modalController.getTop(),
    });
    await modal.present();
  }

  async cameraActive() {
    try {
      this.nativeService.presentLoadingWithOutTime('กำลังเช็คการกล้อง...');
      this.webrtcService.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      this.video.nativeElement.srcObject = this.webrtcService.stream;
      this.video.nativeElement.onloadedmetadata = () => {
        const { videoWidth, videoHeight } = this.video.nativeElement;
        const aspectRatio = videoWidth / videoHeight;
        if (aspectRatio === 4 / 3 || aspectRatio === 16 / 9) {
          this.webrtcService.ratio = ['4:3', '16:9'];
        } else if (aspectRatio === 3 / 4 || aspectRatio === 9 / 16) {
          this.webrtcService.ratio = ['3:4', '9:16'];
        } else {
          this.webrtcService.ratio = [];
        }
        this.resolutioFullScreen = this.webrtcService.ratio[0];
        this.resolutionWideScreen = this.webrtcService.ratio[1];
        this.video.nativeElement.play();
        this.nativeService.dismissLoading();
      };
    } catch (error) {
      console.log(error);
      this.nativeService.dismissLoading();
    }
  }

}



