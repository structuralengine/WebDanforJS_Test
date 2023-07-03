import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild, Renderer2 } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Workbook } from 'igniteui-angular-excel';
import { IgxSpreadsheetComponent } from 'igniteui-angular-spreadsheet';

@Component({
  selector: 'app-preview-excel',
  templateUrl: './preview-excel.component.html',
  styleUrls: ['./preview-excel.component.scss']
})
export class PreviewExcelComponent implements AfterViewInit, OnChanges {

  constructor(public activeModal: NgbActiveModal) { }

  @Input() url: string;
  @Input() file: File;

  @ViewChild('spreadsheet', { read: IgxSpreadsheetComponent })
  public spreadsheet: IgxSpreadsheetComponent;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['url']) {
      this.url = changes['url'].currentValue;
      if (this.url !== '') {
        // this.loadFromUrl(this.url).then((w: any) => {
        //   this.spreadsheet.workbook = w;
        // });
        this.load(this.file).then((w: any) => {
          this.spreadsheet.workbook = w;
        });
      }
    }
  }

  public load(file: File): Promise<Workbook> {
    return new Promise<Workbook>((resolve, reject) => {
      PreviewExcelComponent.readFileAsUint8Array(file).then((a) => {
        Workbook.load(a, null, (w) => {
          resolve(w);
        }, (e) => {
          reject(e);
        });
      }, (e) => {
        reject(e);
      });
    });
  }

  public loadFromUrl(url: string): Promise<Workbook> {
    return new Promise<Workbook>((resolve, reject) => {
      const req = new XMLHttpRequest();
      // req.open('GET', url, true);
      req.open('GET', url, true);

      req.responseType = 'arraybuffer';

      req.onload = (d) => {
        const data = new Uint8Array(req.response);
        Workbook.load(
          data,
          (w: any) => {
            resolve(w);
          },
          (e: any) => {
            reject(e);
          }
        );
      };
      req.send();
    });
  }

  private static readFileAsUint8Array(file: File): Promise<Uint8Array> {
    return new Promise<Uint8Array>((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = (e) => {
        reject(fr.error);
      };

      if (fr.readAsBinaryString) {
        fr.onload = (e) => {
          const rs = (fr as any).resultString;
          const str: string = rs != null ? rs : fr.result;
          const result = new Uint8Array(str.length);
          for (let i = 0; i < str.length; i++) {
            result[i] = str.charCodeAt(i);
          }
          resolve(result);
        };
        fr.readAsBinaryString(file);
      } else {
        fr.onload = (e) => {
          resolve(new Uint8Array(fr.result as ArrayBuffer));
        };
        fr.readAsArrayBuffer(file);
      }
    });
  }

  downloadFileExcel() {
    window.open(this.url, "_blank");
  }

  ngAfterViewInit() {

      if (this.url !== '') {
        // this.loadFromUrl(this.url).then((w: any) => {
        //   this.spreadsheet.workbook = w;
        // });
        this.load(this.file).then((w: any) => {
          this.spreadsheet.workbook = w;
        });
      }
  }


}
