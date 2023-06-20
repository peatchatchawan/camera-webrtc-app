import { Injectable } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class NativeService {

  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController) { }
  loading: any


  // Toast
  async Toast(massage: string, position: 'top' | 'middle' | 'bottom', color: 'primary' | 'success' | 'danger', duration: number) {
    const toast = await this.toastController.create({
      message: massage,
      duration: duration! * 1000 || 3,
      position: position,
      color: color,
    });
    await toast.present();
  }

  // loading spinner with time
  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: 'โปรดรอซักครู่...',
      duration: 2500,
    });
    await this.loading.present();
    const { role, data } = await this.loading.onDidDismiss();
    console.log('ยกเลิกการโหลดแล้ว!');
  }

  // loading spinner with time
  async presentLoadingWithOutTime(massage: string) {
    this.loading = await this.loadingController.create({
      message: massage,
    });
    await this.loading.present();
  }

  //loading Cancel
  async dismissLoading() {
    if (this.loading) {
      await this.loading.dismiss();
      console.log('ยกเลิกการโหลดแล้ว!');
    }
  }

  // Alert
  async presentAlert(header: any, massage: any) {
    const alert = await this.alertController.create({
      header: header,
      message: massage,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
