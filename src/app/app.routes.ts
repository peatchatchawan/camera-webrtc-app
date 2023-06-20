import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'cameras',
    loadComponent: () => import('./pages/cameras/cameras.page').then(m => m.CamerasPage)
  },
  {
    path: 'image',
    loadComponent: () => import('./pages/image/image.page').then( m => m.ImagePage)
  },
  {
    path: 'ios',
    loadComponent: () => import('./pages/ios/ios.page').then( m => m.IosPage)
  },
];
