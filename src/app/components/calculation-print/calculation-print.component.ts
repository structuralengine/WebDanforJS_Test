import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { InputCalclationPrintService } from './calculation-print.service';
import { SaveDataService } from '../../providers/save-data.service';

import { AngularFireAuth } from '@angular/fire/auth';
import { UserInfoService } from 'src/app/providers/user-info.service';
import { TranslateService } from "@ngx-translate/core";
import { DataHelperModule } from 'src/app/providers/data-helper.module';

import printJS from "print-js";
import { ElectronService } from "ngx-electron";

@Component({
  selector: 'app-calculation-print',
  templateUrl: './calculation-print.component.html',
  styleUrls: ['./calculation-print.component.scss']
})
export class CalculationPrintComponent implements OnInit, OnDestroy {

  // 設計条件
  public print_calculate_checked: boolean;
  public print_section_force_checked: boolean;
  public print_summary_table_checked: boolean;
  // 照査
  public calculate_moment_checked: boolean;
  public calculate_shear_force_checked: boolean;
  public calculate_torsional_moment_checked: boolean;
  // 部材
  public table_datas: any[];

  constructor(
    private calc: InputCalclationPrintService,
    private save: SaveDataService,
    private router: Router,
    private user: UserInfoService,
    public auth: AngularFireAuth,
    public electronService: ElectronService,
    private translate: TranslateService,
    private helper: DataHelperModule
  ) {}

  ngOnInit() {

    this.print_calculate_checked = this.calc.print_selected.print_calculate_checked;
    this.print_section_force_checked = this.calc.print_selected.print_section_force_checked;
    this.print_summary_table_checked = this.calc.print_selected.print_summary_table_checked;

    this.calculate_moment_checked = this.calc.print_selected.calculate_moment_checked;
    this.calculate_shear_force_checked = this.calc.print_selected.calculate_shear_force;
    this.calculate_torsional_moment_checked = this.calc.print_selected.calculate_torsional_moment;

    this.table_datas = new Array();
    for ( const data of this.calc.getColumnData()) {
      this.table_datas.push({
        'calc_checked': data.checked,
        'g_name': data.g_name
      });
    }
  }

  ngOnDestroy() {
    this.saveData();
  }

  public saveData(): void {
    this.calc.print_selected.print_calculate_checked = this.print_calculate_checked;
    this.calc.print_selected.print_section_force_checked = this.print_section_force_checked;
    this.calc.print_selected.print_summary_table_checked = this.print_summary_table_checked;

    this.calc.print_selected.calculate_moment_checked = this.calculate_moment_checked;
    this.calc.print_selected.calculate_shear_force = this.calculate_shear_force_checked;
    this.calc.print_selected.calculate_torsional_moment = this.calculate_torsional_moment_checked;

    this.calc.setColumnData(this.table_datas);
  }

  // 計算開始
  onClick() {

    this.auth.currentUser.then(user=>{
      if(user === null){
        this.helper.alert(this.translate.instant("calculation-print.p_login"));
        return;
      }

      this.user.clear(user.uid);

      //this.router.navigate(['/result-viewer']); // 今やPDF作成機能はサーバの機能となった

      this.saveData();
      var ui_data: any = this.save.getInputJson();
      ui_data["ver"] = packageJson.version;
      ui_data["member_group_selection"] = this.table_datas;

      const base64Encoded = this.getPostJson(JSON.stringify(ui_data));

      //console.log("base64EncodedをgetPostJsonしたところまで: " + this.check_ts() + " msec");

      this.pdfPreView(base64Encoded);
    });
  }

  private pdfPreView(base64Encoded: string): void {
    console.log('pdfPreView を実行中...');

    this.http
      .post(this.url, base64Encoded, this.options)
      .subscribe(
        (response) => {
          console.log('pdfPreView が完了');

          this.showPDF(response.toString());
        },
        (err) => {
          try {
            if ("error" in err) {
              if ("text" in err.error) {
                this.showPDF(err.error.text.toString());
                return;
              }
            }
          } catch (e) { }
          this.loading_disable();
          this.helper.alert(err['message']);
        }
      );
  }

  private showPDF(base64: string) {
    this.loading_disable();

    if (this.electronService.isElectronApp) {
      // electron の場合
      const byteCharacters = atob(base64);
      let byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      let byteArray = new Uint8Array(byteNumbers);
      let file = new Blob([byteArray], { type: 'application/pdf;base64' });
      let fileURL = URL.createObjectURL(file);
      window.open(fileURL, "_blank");

    } else {
      //Webアプリの場合
      printJS({ printable: base64, type: "pdf", base64: true });
    }
  }

  private getPostJson(json: any): string {
    console.log('getPostJson を実行中...');

    const jsonStr = JSON.stringify(json);
    console.log(jsonStr);
    // pako を使ってgzip圧縮する
    const compressed = pako.gzip(jsonStr);
    //btoa() を使ってBase64エンコードする
    const base64Encoded = btoa(compressed);

    console.log('getPostJson が完了');

    return base64Encoded
  }

  private loading_enable(): void {
    // loadingの表示
    document.getElementById("print-loading").style.display = "block";
    this.id.setAttribute("disabled", "true");
    this.id.style.opacity = "0.7";
  }

  private loading_disable() {
    document.getElementById("print-loading").style.display = "none";
    const id = document.getElementById("printButton");
    this.id.removeAttribute("disabled");
    this.id.style.opacity = "";
  }

  public isManual(): boolean{
    return this.save.isManual();
  }
}
