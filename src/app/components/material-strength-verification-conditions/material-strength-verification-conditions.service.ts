import { Injectable } from '@angular/core';
import { InputMembersService } from '../members/members.service';
import { DataHelperModule } from 'src/app/providers/data-helper.module';
import { TranslateService } from '@ngx-translate/core';
import { InputBasicInformationService } from '../basic-information/basic-information.service';

@Injectable({
  providedIn: 'root'
})

export class InputMaterialStrengthVerificationConditionService {
  private safety_factor: any;
  private material_bar: any;
  private material_steel: any;
  private material_concrete: any;
  public pile_factor: any;
  private component: any;
  private verification: any;
  private other: any;
  public arrayAxis: any[]
  public arrayAxisBase: any[]
  public groupe_name: any[]
  constructor(
    private members: InputMembersService,
    private helper: DataHelperModule,
    private translate: TranslateService,
    private basic: InputBasicInformationService,
  ) { 
    this.clear();
  }
  public getTableColumns(): any {
    const safety_factor = {};
    const material_bar = {};
    const material_steel = {};
    const material_concrete = {};
    const pile_factor = {};
    const component = {};
    const verification = {};
    const other = {};
    // グリッド用データの作成
    const groupe_list = this.members.getGroupeList();
    for (const groupe of groupe_list) {
      const first = groupe[0];
      const id = first.g_id;

      // 空のデータを1行追加する
      const tmp_safety_factor = this.default_safety_factor();
      const tmp_material_bar = this.default_material_bar();
      const tmp_material_steel = this.default_material_steel();
      const tmp_material_concrete = this.default_material_concrete();
      const tmp_pile_factor = this.default_pile_factor();
      const tmp_component = this.default_component();
      const tmp_verification = this.default_verification();
      const tmp_other = this.default_other()
      if (id in this.safety_factor) {
        const old_safety_factor = this.safety_factor[id];
        for (const tmp of tmp_safety_factor) {
          const old = old_safety_factor.find(v => v.id === tmp.id)
          if (old !== undefined) {
            for (const key of Object.keys(tmp)) {
              if (key === 'title')
                continue;
              if (key in old)
                tmp[key] = old[key];
              else
                tmp[key] = null;
            }
          }
        }
      }
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
            if(key ==="separate" )
            continue;
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
            if (key === 'title' || key === 'baseStan')
              continue;
            if (key in old)
              tmp[key] = old[key];
          }
        }
      }
      if(id in this.component){
        const old_component = this.component[id];
        for(let i = 0; i< tmp_component.length; i++){
          const tmp = tmp_component[i];
          const old = old_component[i];
          for(const key of Object.keys(tmp)){
            if(key === 'title')
              continue;
            if(key in old){
              tmp[key] = old[key]
            }
          }
        }
      }  
      if(id in this.verification){
        const old_verification = this.verification[id];
        for(let i = 0; i< tmp_verification.length; i++){
          const tmp = tmp_verification[i];
          const old = old_verification[i];
          for(const key of Object.keys(tmp)){
            if(key === 'title')
              continue;
            if(key in old){
              tmp[key] = old[key]
            }
          }
        }
      }
      if(id in this.other){
        const old_other= this.other[id];
        for(let i = 0; i< tmp_other.length; i++){
          const tmp = tmp_other[i];
          const old = old_other[i];
          for(const key of Object.keys(tmp)){
            if(key === 'title')
              continue;
            if(key in old){
              tmp[key] = old[key]
            }
          }
        }
      }
      safety_factor[id] = tmp_safety_factor;
      material_bar[id] = tmp_material_bar
      material_steel[id] = tmp_material_steel;
      material_concrete[id] = tmp_material_concrete;
      pile_factor[id] = tmp_pile_factor;
      component[id]= tmp_component
      verification[id] = tmp_verification
      other[id] = tmp_other
    }
  
    return {
      safety_factor,
      groupe_list,
      material_bar,
      material_steel,
      material_concrete,
      pile_factor,
      component,
      verification,
      other
    };

  }
  public default_safety_factor(): any {

    let result: any;
    const sp1 = this.basic.get_specification1();
    const sp2 = this.basic.get_specification2();
    switch (sp1) {
      case 0: // 鉄道
      case 1: // 土木学会
      case 2:
        result = [
          {
            id: 0,
            title: this.translate.instant("material-strength-verifiaction-condition.var_st"),
            M_rc: 1.00, M_rs: 1.00, M_rbs: 1.00,
            V_rc: 1.00, V_rs: 1.00, V_rbc: 1.00, V_rbs: 1.00, V_rbv: null,
            T_rbt:1.00,
            ri: true, range: "",
            S_rs: 1.0, S_rb: 1.0
          },
          {
            id: 2,
            title: this.translate.instant("material-strength-verifiaction-condition.acc_st"),
            M_rc: 1.30, M_rs: 1.05, M_rbs: 1.00,
            V_rc: 1.30, V_rs: 1.05, V_rbc: 1.30, V_rbs: 1.0, V_rbv: null,
            T_rbt:1.00,            
            ri: false, range: "2",
            S_rs: 1.0, S_rb: 1.1
          }   
         
        ]

        break;      
    }

    // 例外
    if (sp1 === 0) {
      if (this.basic.get_specification2() === 2) {
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
    if (sp1 === 1) {
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
            title: this.translate.instant("material-strength-verifiaction-condition.dont_use"),
            rfck: 1.0, rfbok: 1.0, rEc: 1.0, rVcd: 1.0, selected: true },
          { 
            id: 'pile-001', 
            title: this.translate.instant("material-strength-verifiaction-condition.muddy_less"),
            rfck: 0.8, rfbok: 0.7, rEc: 0.8, rVcd: 0.9, selected: false },
          { 
            id: 'pile-002', 
            title: this.translate.instant("material-strength-verifiaction-condition.natural_less"),
            rfck: 0.7, rfbok: 0.6, rEc: 0.8, rVcd: 0.9, selected: false },
          { 
            id: 'pile-003', 
            title: this.translate.instant("material-strength-verifiaction-condition.bentonite"),
            rfck: 0.6, rfbok: 0.5, rEc: 0.7, rVcd: 0.8, selected: false },
          { 
            id: 'pile-004', 
            title: this.translate.instant("material-strength-verifiaction-condition.aerial"),
            rfck: 0.9, rfbok: 0.9, rEc: 0.9, rVcd: 1.0, selected: false },     
        ];
        break;

      case 1: // 土木学会
        result = [
            { 
              id: 'pile-000', 
              title: this.translate.instant("material-strength-verifiaction-condition.dont_use"),
              rfck: 1.0, rfbok: 1.0, rEc: 1.0, rVcd: 1.0, selected: true },
            { 
              id: 'pile-001', 
              title: this.translate.instant("material-strength-verifiaction-condition.muddy_less"),
              rfck: 0.8, rfbok: 0.7, rEc: 0.8, rVcd: 0.9, selected: false },
            { 
              id: 'pile-002', 
              title: this.translate.instant("material-strength-verifiaction-condition.natural_less"),
              rfck: 0.7, rfbok: 0.6, rEc: 0.8, rVcd: 0.9, selected: false },
            { 
              id: 'pile-003', 
              title: this.translate.instant("material-strength-verifiaction-condition.bentonite"),
              rfck: 0.6, rfbok: 0.5, rEc: 0.7, rVcd: 0.8, selected: false },
            { 
              id: 'pile-004', 
              title: this.translate.instant("material-strength-verifiaction-condition.aerial"),
              rfck: 0.9, rfbok: 0.9, rEc: 0.9, rVcd: 1.0, selected: false },
          ];
          break;
    
      case 2: // Road
       result = [
        { 
          id: 'pile-000', 
          title: this.translate.instant("material-strength-verifiaction-condition.ge_pa"),
          rfck: 1.0, rfbok: 1.0, rEc: 1.0, rVcd: 1.0, selected: true },
        { 
          id: 'pile-001', 
          title: this.translate.instant("material-strength-verifiaction-condition.fla_for_flo_sla"),
          rfck: 0.8, rfbok: 0.7, rEc: 0.8, rVcd: 0.9, selected: false },
        { 
          id: 'pile-002', 
          title: this.translate.instant("material-strength-verifiaction-condition.sub"),
          rfck: 0.7, rfbok: 0.6, rEc: 0.8, rVcd: 0.9, selected: false },
        { 
          id: 'pile-003', 
          title: "",
          rfck: 0.7, rfbok: 0.6, rEc: 0.8, rVcd: 0.9, selected: false },
        { 
          id: 'pile-004', 
          title: "",
          rfck: 0.7, rfbok: 0.6, rEc: 0.8, rVcd: 0.9, selected: false},
       ];
      break;
      case 3:
        result = new Array();          
        break;     
    }
    return result;
  }
  public default_material_steel(): any {
    let result = [];
    switch (this.basic.get_specification1()) {
     case 0:
     case 1:
      result = [
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
      break;
      case 2:
        result = [
          {
            separate: this.translate.instant("material-strength-verifiaction-condition.sep"),
            fsyk: true,
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
            separate:75,
            fsyk: 215,
            fsvyk: 125,
            fsuk: 400,
          }
        ];
      break;
    }
     
    return result;
  }
  public default_verification(): any{
    let result = [];
    switch(this.basic.get_specification1()){
      case 0:
      case 1:
      case 2:
        result = [
          {
            id: 0,
            title: this.translate.instant("material-strength-verifiaction-condition.var_st"),
            selected: true,
            type: 0
          },
          {
            id: 1,
            title: this.translate.instant("material-strength-verifiaction-condition.acc_st"),
            selected: true,
            type: 1
          },
        ]
        break;
    }
    return result;
  }

  public default_component(): any{
    let result = [];
    switch(this.basic.get_specification1()){
      case 0:
      case 1:
      case 2:
        result = [
          {
            id: 0,
            title: this.translate.instant("material-strength-verifiaction-condition.ge_pa"),
            selected: false           
          },
          {
            id: 1,
            title: this.translate.instant("material-strength-verifiaction-condition.fla_for_flo_sla"),
            selected: false            
          },
          {
            id: 2,
            title: this.translate.instant("material-strength-verifiaction-condition.sub"),
            selected: true           
          },
        ]
        break;
    }
    return result;
  }
  public default_other(): any{
    let result = [];
    switch(this.basic.get_specification1()){
      case 0:
      case 1:
      case 2:
        result = [
          {
            id: 0,
            title: this.translate.instant("material-strength-verifiaction-condition.sep"),
            selected: false           
          }          
        ]
        break;
    }
    return result;
  }

  public setSaveData(material: any) {
    this.safety_factor = material.safety_factor,
    this.material_bar = material.material_bar,
    this.material_steel = material.material_steel,
    this.material_concrete = material.material_concrete,
    this.pile_factor = material.pile_factor
    this.component = material.component
    this.verification = material.verification
    this.other = material.other
  }
  public clear(): void {
    this.material_bar = {};
    this.material_steel = {};
    this.material_concrete = {};
    this.pile_factor = {};
    this.arrayAxis = new Array();
    this.component = {};
    this.verification = {};
    this.other = {};
  }


  public setTableColumns(material: any): void {
    this.clear();

    for (const id of Object.keys(material.safety_factor)) {

      const tmp_safety_factor = this.default_safety_factor();
      const tmp_material_bar = this.default_material_bar();
      const tmp_material_steel = this.default_material_steel();
      const tmp_material_concrete = this.default_material_concrete();
      const tmp_pile_factor = this.default_pile_factor();

      if (id in material.safety_factor) {
        const new_safety_factor = material.safety_factor[id];
        for (const tmp of tmp_safety_factor) {
          const org = new_safety_factor.find(v => v.id === tmp.id)
          if (org !== undefined) {
            for (const key of Object.keys(tmp)) {
              if (key in org) { tmp[key] = org[key]; }
            }
          }
        }
      }

      if (id in material.material_bar) {
        const new_material_bar = material.material_bar[id];
        for (let i = 0; i < tmp_material_bar.length; i++) {
          const tmp = tmp_material_bar[i];
          const org = new_material_bar[i];
          for (const key of Object.keys(tmp)) {
            if (key in org) { tmp[key] = org[key]; }
          }
        }
      }

      if (id in material.material_steel) {
        const new_material_steel = material.material_steel[id];
        for (let i = 0; i < tmp_material_steel.length; i++) {
          const tmp = tmp_material_steel[i];
          const org = new_material_steel[i];
          for (const key of Object.keys(tmp)) {
            if (key in org) { tmp[key] = org[key]; }
          }
        }
      }

      if (id in material.material_concrete) {
        const new_material_concrete = material.material_concrete[id];
        for (const key of Object.keys(tmp_material_concrete)) {
          if (key in new_material_concrete) {
            tmp_material_concrete[key] = new_material_concrete[key];
          }
        }
      }

      if (id in material.pile_factor) {
        const new_pile_factor = material.pile_factor[id];
        for (let i = 0; i < tmp_pile_factor.length; i++) {
          const tmp = tmp_pile_factor[i];
          const org = new_pile_factor[i];
          for (const key of Object.keys(tmp)) {
            if (key in org) { tmp[key] = org[key]; }
          }
        }
      }
      this.safety_factor[id] = tmp_safety_factor;
      this.material_bar[id] = tmp_material_bar;
      this.material_steel[id] = tmp_material_steel;
      this.material_concrete[id] = tmp_material_concrete;
      this.pile_factor[id] = tmp_pile_factor;
    }

  }
  public getSaveData(): any {
    return {
      safety_factor: this.safety_factor,
      material_bar: this.material_bar,
      material_steel: this.material_steel,
      material_concrete: this.material_concrete,
      pile_factor: this.pile_factor,
      component: this.component,
      verification: this.verification,
      other: this.other
    }
  }
}
