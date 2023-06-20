import { NativeService } from 'src/app/services/native.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { WebrtcService } from 'src/app/services/webrtc.service';

@Component({
  selector: 'app-ios',
  templateUrl: './ios.page.html',
  styleUrls: ['./ios.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class IosPage implements OnInit {
  @ViewChild('showVideo') showVideo: ElementRef<HTMLVideoElement>;
  @ViewChild('realVideo') realVideo: ElementRef<HTMLVideoElement>;

  constructor(
    private webrtcService: WebrtcService,
    private nativeService: NativeService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
  }

  async onDismiss(data: string, role: string) {
    this.webrtcService.stopUserMedia(this.webrtcService.stream);
    this.modalController.dismiss(data, role);
  }

  async openCamera() {
    this.nativeService.presentLoadingWithOutTime('Opening Camera');
    const camera = await this.webrtcService.getFrontCamera();
    await this.webrtcService.stopUserMedia(this.webrtcService.stream);
    if (camera) {
      await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          deviceId: camera.deviceId
        },
      }).then(
        async (stream) => {
          this.webrtcService.stream = stream;
          this.showVideo.nativeElement.srcObject = this.webrtcService.stream;
          this.realVideo.nativeElement.srcObject = this.webrtcService.stream;
          this.showVideo.nativeElement.onloadeddata = async () => {
            this.showVideo.nativeElement.play();
            this.realVideo.nativeElement.play();
            console.log('open camera success');
          };
        }
      ).catch(err => {
        console.log(err.message);
        this.nativeService.presentAlert('เกิดข้อผิดพลาดขณะเปิดกล้อง', err.message);
      }).finally(async () => await this.nativeService.dismissLoading());
    }
  }

  stopCamera() {
    this.webrtcService.stopUserMedia(this.webrtcService.stream);
  }
}
