import { Injectable } from '@angular/core';
import { InputMembersService } from '../members/members.service';
import { DataHelperModule } from 'src/app/providers/data-helper.module';
import { TranslateService } from '@ngx-translate/core';
import { InputBasicInformationService } from '../basic-information/basic-information.service';

@Injectable({
  providedIn: 'root'
})
export class InputMaterialStrengthVerificationConditionService {
  private material_bar: any;
  private material_steel: any;
  private material_concrete: any;
  public pile_factor: any;
  public arrayAxis: any[]
  public arrayAxisBase: any[]
  public groupe_name: any[]
  constructor(
    private members: InputMembersService,
    private helper: DataHelperModule,
    private translate: TranslateService,
    private basic: InputBasicInformationService,
  ) { }
  public getTableColumns(): any {

    const material_bar = {};
    const material_steel = {};
    const material_concrete = {};
    const pile_factor = {};

    // グリッド用データの作成
    const groupe_list = this.members.getGroupeList();
    for (const groupe of groupe_list) {
      const first = groupe[0];
      const id = first.g_id;

      // 空のデータを1行追加する
      const tmp_material_bar = this.default_material_bar();
      const tmp_material_steel = this.default_material_steel();
      const tmp_material_concrete = this.default_material_concrete();
      const tmp_pile_factor = this.default_pile_factor();     

      if (id in this.material_bar) {
        const old_material_bar = this.material_bar[id];
        for (let i = 0; i < tmp_material_bar.length; i++) {
          const tmp = tmp_material_bar[i];
          const old = old_material_bar[i];
          for (const key of Object.keys(tmp)) {
            if (key in old) {
              tmp[key] = old[key];
            }
          }
        }
      }

      if (id in this.material_steel) {
        const old_material_steel = this.material_steel[id];
        for (let i = 0; i < tmp_material_steel.length; i++) {
          const tmp = tmp_material_steel[i];
          const old = old_material_steel[i];
          for (const key of Object.keys(tmp)) {
            if (key in old) {
              tmp[key] = old[key];
            }
          }
        }
      }

      if (id in this.material_concrete) {
        const old_material_concrete = this.material_concrete[id];
        for (const key of Object.keys(tmp_material_concrete)) {
          if (key in old_material_concrete) {
            tmp_material_concrete[key] = old_material_concrete[key];
          }
        }
      }

      if (id in this.pile_factor) {
        const old_pile_factor = this.pile_factor[id];
        for (let i = 0; i < tmp_pile_factor.length; i++) {
          const tmp = tmp_pile_factor[i];
          const old = old_pile_factor[i];
          for (const key of Object.keys(tmp)) {
            if (key === 'title')
              continue;
            if (key in old)
              tmp[key] = old[key];
          }
        }
      }
      material_bar[id] = tmp_material_bar
      material_steel[id] = tmp_material_steel;
      material_concrete[id] = tmp_material_concrete;
      pile_factor[id] = tmp_pile_factor;

    }

    return {
      groupe_list,
      material_bar,
      material_steel,
      material_concrete,
      pile_factor
    };

  }
  public default_safety_factor(): any {

    let result: any;
    const sp1 = this.basic.get_specification1();
    const sp2 = this.basic.get_specification2();
    switch (sp1) {
      case 0: // 鉄道
      case 1: // 土木学会

        result = [
          {
            id: 0, 
            title: this.translate.instant("material-strength-verifiaction-condition.d_u"),
            M_rc: 1.00, M_rs: 1.00, M_rbs: 1.00,
            V_rc: 1.00, V_rs: 1.00, V_rbc: 1.00, V_rbs: 1.00, V_rbv: null,
            T_rbt:1.00,
            ri: 1.00, range: 1,
            S_rs: 1.0, S_rb: 1.0
          },
          {
            id: 2, 
            title: this.translate.instant("material-strength-verifiaction-condition.safe_ff"),
            M_rc: 1.30, M_rs: 1.05, M_rbs: 1.00,
            V_rc: 1.30, V_rs: 1.05, V_rbc: 1.30, V_rbs: 1.0, V_rbv: null,
            T_rbt:1.00,
            ri: 1.10, range: 2,
            S_rs: 1.0, S_rb: 1.1
          },
          {
            id: 5, 
            title: this.translate.instant("material-strength-verifiaction-condition.safe_d"),
            M_rc: 1.30, M_rs: 1.0, M_rbs: 1.10,
            V_rc: 1.30, V_rs: 1.0, V_rbc: 1.30, V_rbs: 1.10, V_rbv: 1.20,
            T_rbt:1.30,
            ri: 1.20, range: 2,
            S_rs: 1.05, S_rb: 1.1
          },
          {
            id: 6, 
            title:  (sp2 !== 3 && sp2 !== 4) ? this.translate.instant("material-strength-verifiaction-condition.r_ex") : this.translate.instant("material-strength-verifiaction-condition.u_damage"),
            M_rc: 1.30, M_rs: 1.00, M_rbs: 1.0,
            V_rc: 1.30, V_rs: 1.00, V_rbc: 1.30, V_rbs: 1.10, V_rbv: 1.20,
            T_rbt:1.30,
            ri: 1.20, range: 3,
            S_rs: 1.05, S_rb: 1.1
          },
          {
            id: 7, 
            title: this.translate.instant("material-strength-verifiaction-condition.r_at"),
            M_rc: 1.30, M_rs: 1.00, M_rbs: 1.00,
            V_rc: 1.30, V_rs: 1.00, V_rbc: 1.30, V_rbs: 1.00, V_rbv: 1.20,
            T_rbt:1.30,
            ri: 1.00, range: 3,
            S_rs: 1.05, S_rb: 1.1
          },
          {
            id: 8, 
            title: this.translate.instant("material-strength-verifiaction-condition.min_rebar"),
            M_rc: 1.30, M_rs: 1.00, M_rbs: 1.00,
            V_rc: null, V_rs: null, V_rbc: null, V_rbs: null, V_rbv: null,
            T_rbt:null,
            ri: 1.00, range: 3,
            S_rs: 1.05, S_rb: 1.1
          }
        ]

        break;

      case 2: // 港湾
        result = new Array();
        break;
    }

    // 例外
    if(sp1 === 0){
      if( this.basic.get_specification2() === 2){
        // JR東日本
        result[3].r1 = 1.00; // 復旧性の γi =1.00
      }
    }

    return result;

  }
  public default_material_bar(): any {
    const sp1 = this.basic.get_specification1();
    let result: any = [
      {
        separate: 25,
        tensionBar: { fsy: 345, fsu: 490 },
        sidebar: { fsy: 345, fsu: 490 },
        stirrup: { fsy: 345, fsu: 490 },
        bend: { fsy: 345, fsu: 490 }
      },
      {
        separate: 29,
        tensionBar: { fsy: 390, fsu: 560 },
        sidebar: { fsy: 390, fsu: 560 },
        stirrup: { fsy: 390, fsu: 560 },
        bend: { fsy: 390, fsu: 560 }
      }
    ]
    if( sp1===1 ){
      result = [
        {
          tensionBar: { fsy: 415, fsu: 550 },
          sidebar: { fsy: 415, fsu: 550 },
          stirrup: { fsy: 415, fsu: 550 },
          bend: { fsy: 415, fsu: 550 }
        }
      ]
    }

    return result;
  }
  public default_material_concrete(): any {
    const result = {
      fck: 24,
      dmax: 25
    };
    return result;
  }
  public default_pile_factor(): any {

    let result = [];

    switch (this.basic.get_specification1()) {
      case 0: // 鉄道
      result = [
          { 
            id: 'pile-000', 
            title: this.translate.instant("safety-factors-material-strengths.dont_use"),
            rfck: 1.0, rfbok: 1.0, rEc: 1.0, rVcd: 1.0, selected: true },
          { 
            id: 'pile-001', 
            title: this.translate.instant("safety-factors-material-strengths.muddy_less"),
            rfck: 0.8, rfbok: 0.7, rEc: 0.8, rVcd: 0.9, selected: false },
          { 
            id: 'pile-002', 
            title: this.translate.instant("safety-factors-material-strengths.natural_less"),
            rfck: 0.7, rfbok: 0.6, rEc: 0.8, rVcd: 0.9, selected: false },
          { 
            id: 'pile-003', 
            title: this.translate.instant("safety-factors-material-strengths.bentonite"),
            rfck: 0.6, rfbok: 0.5, rEc: 0.7, rVcd: 0.8, selected: false },
          { 
            id: 'pile-004', 
            title: this.translate.instant("safety-factors-material-strengths.aerial"),
            rfck: 0.9, rfbok: 0.9, rEc: 0.9, rVcd: 1.0, selected: false },
        ];
        break;

      case 1: // 土木学会
        result = [
            { 
              id: 'pile-000', 
              title: this.translate.instant("safety-factors-material-strengths.dont_use"),
              rfck: 1.0, rfbok: 1.0, rEc: 1.0, rVcd: 1.0, selected: true },
            { 
              id: 'pile-001', 
              title: this.translate.instant("safety-factors-material-strengths.muddy_less"),
              rfck: 0.8, rfbok: 0.7, rEc: 0.8, rVcd: 0.9, selected: false },
            { 
              id: 'pile-002', 
              title: this.translate.instant("safety-factors-material-strengths.natural_less"),
              rfck: 0.7, rfbok: 0.6, rEc: 0.8, rVcd: 0.9, selected: false },
            { 
              id: 'pile-003', 
              title: this.translate.instant("safety-factors-material-strengths.bentonite"),
              rfck: 0.6, rfbok: 0.5, rEc: 0.7, rVcd: 0.8, selected: false },
            { 
              id: 'pile-004', 
              title: this.translate.instant("safety-factors-material-strengths.aerial"),
              rfck: 0.9, rfbok: 0.9, rEc: 0.9, rVcd: 1.0, selected: false },
          ];
          break;
    
      case 2: // 港湾
      result = new Array();

        break;
    }
    return result;
  }
  public default_material_steel(): any {
    const result = [
      {
        separate: 16,
        fsyk: 245,
        fsvyk: 140,
        fsuk: 400,
      },
      {
        separate: 40,
        fsyk: 235,
        fsvyk: 135,
        fsuk: 400,
      },
      {
        separate: 75,
        fsyk: 215,
        fsvyk: 125,
        fsuk: 400,
      }
    ];
    return result;
  }
}
