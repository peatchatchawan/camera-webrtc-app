import { WebrtcService } from './../../services/webrtc.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import CameraInfo from 'src/app/services/model/cameraInfo';
import { NativeService } from 'src/app/services/native.service';
import Resolution from 'src/app/services/model/resolution';
import captures from 'src/app/services/model/captures';
import { ImagePage } from '../image/image.page';

@Component({
  selector: 'app-cameras',
  templateUrl: './cameras.page.html',
  styleUrls: ['./cameras.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CamerasPage implements OnInit {
  @ViewChild('showVideo') showVideo: ElementRef<HTMLVideoElement>;
  @ViewChild('realVideo') realVideo: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;


  // ngModel
  rotateImage: captures;
  selectedVideoInput: string;
  selectedRatioInput: string;
  selectedResolutionInput: Resolution;

  //resolution
  cameras: CameraInfo[] = [];
  ratio: string[];
  useRatio: string;
  useWidth: number;
  useHeight: number;
  reqWidth: number;
  reqHeight: number;
  resolution: Resolution[];

  //set state
  toggleSnapshot: boolean = false;
  stateSelectedRatio: boolean = false;
  stateSelectedResolution: boolean = false;
  lastedVideoInput: string;
  lastedRatioInput: string;
  lastedResolutionInput: Resolution;
  showCamera: boolean = false;
  onChangeCamera: boolean = false;
  statusFrontCamera: boolean;
  statusBackCamera: boolean;

  // about take picture
  configQualityImage: number = 0.9;
  capture: captures;
  captures: captures[] = [];
  album: any[] = [];


  constructor(
    private modalController: ModalController,
    private webrtcService: WebrtcService,
    private nativeService: NativeService
  ) { }

  ngOnInit() {
    this.statusFrontCamera = this.webrtcService.statusFrontCamera;
    this.statusBackCamera = this.webrtcService.statusBackCamera;
    this.cameras = this.webrtcService.cameras;
    this.ratio = this.webrtcService.ratio;
  }

  async onDismiss(data: string, role: string) {
    this.webrtcService.stopUserMedia(this.webrtcService.stream);
    this.modalController.dismiss(data, role);
  }

  async onCameraChange(event: any) {
    this.selectedVideoInput = event.detail.value;

    if (this.selectedVideoInput) {
      this.stateSelectedRatio = true;
      console.log('this.stateSelectedRatio:', this.stateSelectedRatio);
    } else {
      this.stateSelectedRatio = false;
    }

    // if selectedVideoInput is Front Camera and statusFrontCamera is false then scan front camera
    if (this.selectedVideoInput === 'Front Camera' && this.statusFrontCamera === false) {
      this.showCamera = false;
      const camera = await this.webrtcService.getFrontCamera();
      if (camera) {
        await this.webrtcService.initializeFilter(camera);
        this.statusFrontCamera = true;
        this.webrtcService.statusFrontCamera = true;
      }
    }
    // if selectedVideoInput is Back Camera and statusBackCamera is false then scan back camera
    else if (this.selectedVideoInput === 'Back Camera' && this.statusBackCamera === false) {
      this.showCamera = false;
      const camera = await this.webrtcService.getBackCamera();
      if (camera) {
        await this.webrtcService.initializeFilter(camera);
        this.statusBackCamera = true;
        this.webrtcService.statusBackCamera = true;
      }
    } else if (this.lastedVideoInput != this.selectedVideoInput) {
      this.onChangeCamera = true;
    }
    // scan all camera finished. do nothing
    else {
      console.log('Camera is ready');
    }
  }

  async onRatioChange(event: any) {
    this.selectedRatioInput = event.detail.value;
    if (this.lastedRatioInput != this.selectedRatioInput) {
      this.onChangeCamera = true;
    }

    if (this.selectedRatioInput) {
      this.stateSelectedResolution = true;
    } else {
      this.stateSelectedResolution = false;
    }

    // if front camera
    if (this.selectedVideoInput === 'Front Camera') {
      const camera = await this.webrtcService.getFrontCamera();
      if (camera) {
        if (this.selectedRatioInput === '16:9' || this.selectedRatioInput === '9:16') {
          this.resolution = await camera.ratioWideScreen;
        } else if (this.selectedRatioInput === '4:3' || this.selectedRatioInput === '3:4') {
          this.resolution = await camera.ratioFullScreen;
        } else {
          console.error('เกิดข้อผิดพลาดขณะเปิดกล้องเนื่องจากไม่ได้เลือกอัตราส่วน');
        }
      }
    } else if (this.selectedVideoInput === 'Back Camera') {
      const camera = await this.webrtcService.getBackCamera();
      if (camera) {
        if (this.selectedRatioInput === '16:9' || this.selectedRatioInput === '9:16') {
          this.resolution = await camera.ratioWideScreen;
        } else if (this.selectedRatioInput === '4:3' || this.selectedRatioInput === '3:4') {
          this.resolution = await camera.ratioFullScreen;
        } else {
          console.error('เกิดข้อผิดพลาดขณะเปิดกล้องเนื่องจากไม่ได้เลือกอัตราส่วน');
        }
      }
    }
  }

  onResolutionChange(event: any) {
    console.log(event.detail.value);
    if (this.lastedResolutionInput != event.detail.value) {
      this.onChangeCamera = true;
    }
    this.reqWidth = event.detail.value.width;
    this.reqHeight = event.detail.value.height;
  }

  toggleChange(event: any) {
    this.toggleSnapshot = event.detail.checked;
    console.log('toggleSnapshot:', this.toggleSnapshot);
    this.nativeService.Toast('toggleSnapshot:' + this.toggleSnapshot, 'top', 'primary', 0.2);
  }

  async initializeCamera() {
    try {
      //show video nativeElement
      this.showCamera = true;
      // if selected front camera
      if (this.selectedVideoInput === 'Front Camera' && this.selectedResolutionInput) {
        const camera = await this.webrtcService.getFrontCamera();
        if (camera) {
          this.openCamera(camera, this.selectedResolutionInput);
        } else {
          this.showCamera = false;
          console.log('เกิดข้อผิดพลาด : ไม่พบกล้องหน้า');
          this.nativeService.presentAlert('เกิดข้อผิดพลาดขณะเปิดกล้อง', 'เกิดข้อผิดพลาดขณะเปิดกล้องเนื่องจากไม่พบกล้องหน้า โปรดเลือกอินพุตวิดีโอใหม่อีกครั้ง');
        }
      }
      // if selected back camera
      else if (this.selectedVideoInput === 'Back Camera') {
        const camera = await this.webrtcService.getBackCamera();
        if (camera) {
          this.openCamera(camera, this.selectedResolutionInput);
        } else {
          this.showCamera = false;
          console.log('เกิดข้อผิดพลาด : ไม่พบกล้องหลัง');
          this.nativeService.presentAlert('เกิดข้อผิดพลาดขณะเปิดกล้อง', 'เกิดข้อผิดพลาดขณะเปิดกล้องเนื่องจากไม่พบกล้องหลัง โปรดเลือกอินพุตวิดีโอใหม่อีกครั้ง');
        }
      }
      // if not selected camera
      else {
        this.showCamera = false;
        console.error('เกิดข้อผิดพลาดขณะเปิดกล้องเนื่องจากไม่พบกล้อง');
        this.nativeService.presentAlert('เกิดข้อผิดพลาดขณะเปิดกล้อง', 'เกิดข้อผิดพลาดขณะเปิดกล้องเนื่องจากไม่ได้เลือกกล้อง โปรดเลือกอินพุตวิดีโอ');
      }

      //reset state to hide button reopencamera
      this.onChangeCamera = false;
    } catch (err) {
      this.showCamera = false;
      console.error('เกิดข้อผิดพลาดขณะเปิดกล้อง:', err);
      this.nativeService.presentAlert('เกิดข้อผิดพลาดขณะเปิดกล้อง:', err);
    }
  }

  async openCamera(camera: CameraInfo, resolution: Resolution) {
    this.nativeService.presentLoadingWithOutTime('Opening Camera');
    await this.webrtcService.stopUserMedia(this.webrtcService.stream);
    // last selected video input and ratio
    this.lastedVideoInput = this.selectedVideoInput;
    this.lastedRatioInput = this.selectedRatioInput;
    this.lastedResolutionInput = this.selectedResolutionInput;
    this.nativeService.Toast(`กำลังเปิด ${camera.label} ด้วยความละเอียด ${resolution.label}`, 'middle', 'success', 1);
    await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        deviceId: camera.deviceId,
        width: { exact: resolution.width },
        height: { exact: resolution.height },
      },
    }).then(
      async (stream) => {
        this.webrtcService.stream = stream;
        this.showVideo.nativeElement.srcObject = this.webrtcService.stream;
        this.realVideo.nativeElement.srcObject = this.webrtcService.stream;
        this.showVideo.nativeElement.onloadeddata = async () => {
          this.showVideo.nativeElement.play();
          this.realVideo.nativeElement.play();
          // last use resolution
          this.useRatio = this.selectedRatioInput;
          this.useWidth = this.realVideo.nativeElement.videoWidth;
          this.useHeight = this.realVideo.nativeElement.videoHeight;
          this.nativeService.Toast('กำลังเปิดกล้องสำเร็๋จ...', 'bottom', 'success', 1);
        };
      }
    ).catch(err => {
      this.showCamera = false;
      console.log(err.message);
      this.nativeService.presentAlert('เกิดข้อผิดพลาดขณะเปิดกล้อง', err.message);
    }).finally(async () => {
      await this.nativeService.dismissLoading();
    });
  }

  stopCamera() {
    this.showCamera = false;
    this.webrtcService.stopUserMedia(this.webrtcService.stream);
  }

  async takePicture() {
    if (this.toggleSnapshot) {
      this.captures = [];
      switch (this.useRatio) {
        case '16:9':
          console.log('16:9');
          this.getSnapshot('16:9');
          break;
        case '9:16':
          console.log('9:16');
          this.getSnapshot('9:16');
          break;
        case '4:3':
          console.log('4:3');
          this.getSnapshot('4:3');
          break;
        case '3:4':
          console.log('3:4');
          this.getSnapshot('3:4');
          break;
        default:
          break;
      }
    }
    // if toggle snapshot is false > one snapshot
    else {
      const canvas = this.canvas.nativeElement;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = this.showVideo.nativeElement.videoWidth;
        canvas.height = this.showVideo.nativeElement.videoHeight;
        context.drawImage(this.showVideo.nativeElement, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL('image/jpeg', this.configQualityImage);
        const resolution = `${this.realVideo.nativeElement.videoWidth}x${this.realVideo.nativeElement.videoHeight}`;
        this.capture = { dataURL: dataURL, resolution: resolution, ratio: this.useRatio };
        // rotate image
        const image = new Image();
        image.src = dataURL;
        // Create a Promise to load the image
        const loadImage = new Promise<void>((resolve) => {
          image.onload = () => resolve();
        });
        await loadImage; // Wait for the image to load
        const canvasRotated = document.createElement('canvas');
        const ctxRotated = canvasRotated.getContext('2d');
        if (ctxRotated) {
          canvasRotated.width = image.height;
          canvasRotated.height = image.width;
          ctxRotated.rotate(90 * Math.PI / 180);
          ctxRotated.translate(0, -canvasRotated.width);
          ctxRotated.drawImage(image, 0, 0);
          const rotatedDataURL = canvasRotated.toDataURL('image/jpeg', this.configQualityImage);
          this.rotateImage = { dataURL: rotatedDataURL, resolution: resolution, ratio: this.useRatio };
        }
        const modal = await this.modalController.create({
          component: ImagePage,
          componentProps: {
            'data': this.capture,
            'rotateImage': this.rotateImage
          }
        });
        await modal.present();
      }
    }
  }

  async getSnapshot(ratio: string) {
    this.webrtcService.resolutionByRatio[ratio].forEach(async (res: any) => {
      const width = res.width <= this.realVideo.nativeElement.videoWidth;
      const height = res.width <= this.realVideo.nativeElement.videoWidth;
      if (width && height) {
        await this.captureImageFromVideo(this.realVideo.nativeElement, res.width, res.height, this.useRatio);
      }
    });
    if (this.captures.length > 0) {
      this.album.push(this.captures);
      const modal = await this.modalController.create({
        component: ImagePage,
        componentProps: {
          'data': this.captures,
        }
      });
      await modal.present();
      console.log('ถ่ายได้ทั้งหมด', this.captures.length, 'รูป.');
      this.nativeService.Toast(`ถ่ายได้ทั้งหมด ${this.captures.length} รูป.`, 'top', 'success', 1);
    } else {
      console.log('ไม่สามารถถ่ายภาพได้');
      this.nativeService.presentAlert('ไม่สามารถถ่ายภาพได้', 'กรุณาลองใหม่อีกครั้ง');
    }
  }

  captureImageFromVideo(element: HTMLVideoElement, width: number, height: number, ratio: string) {
    const canvas = this.canvas.nativeElement;
    const context = canvas.getContext('2d');
    if (!element) {
      return;
    }
    if (context) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(element, 0, 0, this.useWidth, this.useHeight, 0, 0, width, height);
      const resizedDataURL = canvas.toDataURL('image/jpeg', this.configQualityImage);
      const resolution = `${width}x${height}`;
      this.captures.push({ dataURL: resizedDataURL, resolution, ratio });
    }
    return this.captures;
  }
}
