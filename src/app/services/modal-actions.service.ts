import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalActionsService {

  constructor() { }

  modalAction(modalData: any) {
    switch (modalData.name) {
      case "logout":
        this.logout(modalData);
        break;
      
      case "deleteProduct":
        this.deleteProduct(modalData);
        break;
        
      default:
        break;
    }
  }

  private logout(modalData: any) {
    console.log("I came from a logout modal");
  }

  private deleteProduct(modalData: any) {
    console.log("I came from a product deletion modal");
  }
}