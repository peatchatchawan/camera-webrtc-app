import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-image',
  templateUrl: './image.page.html',
  styleUrls: ['./image.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ImagePage implements OnInit {
  @Input() data?: any;
  @Input() rotateImage?: any;
  stateCaptures: boolean = false;
  stateRotateImage: boolean = false;
  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    console.log('this.data:', this.data);
    console.log('this.rotateImage:', this.rotateImage);
    if (this.data.length > 0) {
      this.stateCaptures = true;
      console.log(this.stateCaptures);
    }
    if (this.rotateImage) {
      this.stateRotateImage = true;
      console.log(this.stateRotateImage);
    }
  }

  async onDismiss() {
    this.modalController.dismiss();
  }

}
