import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation'; 

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
  ],
})
export class HomePage implements OnInit {
  latitude: number | null = null;
  longitude: number | null = null;
  mapUrl: string | null = null;

  private firestore: Firestore = inject(Firestore); 

  constructor() {}


  async ngOnInit(): Promise<void> {

    await Geolocation.requestPermissions();
    this.getCurrentLocation(); 
  }

  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      console.error('Geolocalización no está soportada en este navegador.');
      return;
    }


    new Promise<void>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.generateMapUrl(); 
          resolve(); 
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          reject(error); 
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    })
      .then(() => {
        this.saveUrlToFirestore();  
      })
      .catch((error) => {
        console.error('Error en la obtención de ubicación:', error);
      });
  }


  generateMapUrl(): void {
    if (this.latitude !== null && this.longitude !== null) {
      this.mapUrl = `https://www.google.com/maps/@${this.latitude},${this.longitude}`;
    }
  }


  async saveUrlToFirestore(): Promise<void> {
    if (this.mapUrl) {
      try {
        const docRef = await addDoc(collection(this.firestore, 'ubicaciones'), {
          url: this.mapUrl,
          nombre: 'Carlos Perez',
        });
        console.log('URL guardada en Firestore con ID: ', docRef.id);
      } catch (e) {
        console.error('Error guardando la URL en Firestore: ', e);
      }
    }
  }
}