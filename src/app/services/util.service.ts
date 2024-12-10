import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  getTypeName(tipo: number): string {
    switch (tipo) {
      case 1:
        return 'Pesos';
      case 2:
        return 'Distancias';
      case 3:
        return 'Body Building';
      case 4:
        return 'Desafíos';
      case 5:
        return 'A Heroe';
      case 6:
        return 'A Girl';
      default:
        return 'Desconocido';
    }
  }
}
