import { Component } from '@angular/core';

@Component({
  selector: 'app-file-upload-dialog',
  template: `
    <h1 mat-dialog-title>File upload</h1>
    <div mat-dialog-content style="overflow: hidden;">
        <app-file-upload></app-file-upload>
    </div>
    <div mat-dialog-actions>
      <button mat-button mat-dialog-close>Close</button>
    </div>
  `,
})
export class FileUploadDialogComponent {}
