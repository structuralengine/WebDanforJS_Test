import { Injectable } from "@angular/core";
import { DataHelperModule } from "src/app/providers/data-helper.module";
import { InputDesignPointsService } from "../design-points/design-points.service";
import { InputCrackSettingsService } from "../crack/crack-settings.service";

@Injectable({
  providedIn: "root",
})

//Same as InputCrackSetting service that get data from 'crack'
export class InputDurabilityDataService {

  // 部材情報
  public crack_list: any[];

  constructor(
    private helper: DataHelperModule,
    private points: InputDesignPointsService,
    private cracks: InputCrackSettingsService
  ) {
    this.clear();
  }
  public clear(): void {
    this.crack_list = new Array();
  }

  // ひび割れ情報
  public default_crack(id: number): any {
    return {
      index: id,
      m_no: null,
      g_name: null,
      p_name: null,
      con_u: null,
      con_l: null,
      con_s: null,
      vis_u: false,
      vis_l: false,
      ecsd_u: null,
      ecsd_l: null,
      kr: null,
      k4: null,
      JRTT05: false, // 縁応力度が制限値以内の場合でもひび割れ幅を計算するフラグ
      WL: false, // 縁応力度が制限値以内の場合でもひび割れ幅を計算するフラグ
    };
  }


  public getTableColumns(): any[] {
    //get cracks frm Crack Service
    const crackData = this.cracks.crack_list;
    const table_datas: any[] = new Array();

    // グリッド用データの作成
    const groupe_list = this.points.getSortedGroupeList();// this.points.getGroupeList();
    for (let i = 0; i < groupe_list.length; i++) {
      const table_group = [];
      // 部材
      for (const member of groupe_list[i]) {
        // 着目点
        let count = 0;
        for (let k = 0; k < member.positions.length; k++) {
          const pos = member.positions[k];
          if (!this.points.isEnable(pos)) {
            continue;
          }
          // barデータに（部材、着目点など）足りない情報を追加する
          const data: any = this.getTableColumn(pos.index);
          data.m_no = (count === 0) ? member.m_no : ''; // 最初の行には 部材番号を表示する
          // data.b = member.B;
          // data.h = member.H;
          data.position = pos.position;
          data.g_name = pos.g_name;
          data.p_name = pos.p_name;
          data.g_id = member.g_id;
          
          let cr = crackData.find((value) => value.index === pos.index);
          if(cr != null) data.WL = cr.WL;
          table_group.push(data);
          count++;
        }
      }
      table_datas.push(table_group);
    }
    return table_datas;
  }

  public getTableColumn(index: any): any {
    let result = this.crack_list.find((value) => value.index === index);
    if (result == null) {
      result = this.default_crack(index);
      this.crack_list.push(result);
    }
    return result;
  }

  public setTableColumns(table_datas: any[]) {
    this.crack_list = new Array(); //Local save in Durability
    let crack_temp = this.cracks.crack_list;
    for (const column of table_datas) {
      //find crack by Index and update "WL"
      const c = crack_temp.find((value) => value.index === column.index);
      c.WL = column.WL;
      this.crack_list.push(c);
    }
    this.setSaveData();
  }

  public setPickUpData() {
  }

  public getSaveData(): any[] {
    return this.crack_list;
  }

  public setSaveData() {
    this.cracks.crack_list = this.crack_list
  }

  public getGroupeName(i: number): string {
    return this.points.getGroupeName(i);
  }
}
