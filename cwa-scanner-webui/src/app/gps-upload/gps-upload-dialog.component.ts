import { Component } from '@angular/core';

@Component({
  selector: 'app-gps-upload-dialog',
  template: `
    <h1 mat-dialog-title>Upload GPS data</h1>
    <div mat-dialog-content style="overflow: hidden;">
        <app-gps-upload></app-gps-upload>
    </div>
    <div mat-dialog-actions>
      <button mat-button mat-dialog-close>Close</button>
    </div>
  `,
})
export class GpsUploadDialogComponent {}
