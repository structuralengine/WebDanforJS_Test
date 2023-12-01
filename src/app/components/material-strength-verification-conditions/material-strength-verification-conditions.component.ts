


import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { InputMembersService } from '../members/members.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { InputMaterialStrengthVerificationConditionService } from './material-strength-verification-conditions.service';
import { SheetComponent } from '../sheet/sheet.component';
import pq from 'pqgrid';


@Component({
  selector: 'app-material-strength',
  templateUrl: './material-strength-verification-conditions.component.html',
  styleUrls: ['./material-strength-verification-conditions.component.scss', '../subNavArea.scss']
})

export class MaterialStrengthVerificationConditionComponent implements OnInit {
  public groupe_name: string[];
  public activeTab: string = 'rsb_con';

  public options3: any[];
  public component_list: any[] = new Array();
  public component_select_id: string;

  public options5: any[];
  public other_list: any[] = new Array();

  public groupMem: any;
  @ViewChild('grid1') grid1: SheetComponent;
  public options1: pq.gridT.options;
  private option1_list: pq.gridT.options[] = new Array();
  private columnHeaders1: object[] = [];
  private table1_datas: any[];
  @ViewChild('grid2') grid2: SheetComponent;
  public options2: pq.gridT.options;
  private option2_list: pq.gridT.options[] = new Array();
  private columnHeaders2: object[] = [];
  private table2_datas: any[];

  public options4: any[];
  private option4_list: any[] = new Array();
  private table4_datas: any[];
  public plastic_expect_selected_id: string;
  public plastic_selected: boolean = false;
  private current_index: number;
  private groupe_list: any[];
  constructor(
    private material: InputMaterialStrengthVerificationConditionService,
    private members: InputMembersService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.saveData();
      this.onInitData();
    });
    this.onInitData();
  }
  onInitData(){
    this.setTitle()
    const material = this.material.getTableColumns();
    this.table1_datas = new Array();
    this.component_list = new Array();
    this.option1_list = new Array();
    this.option2_list = new Array();
    this.option4_list =new Array();
    this.other_list= new Array();
    this.table2_datas = new Array();
    this.groupe_name = new Array();
    this.groupe_list = material.groupe_list;
    this.table4_datas = new Array();
    for (let i = 0; i < material.groupe_list.length; i++) {
      const groupe = material.groupe_list[i];
      const first = groupe[0];
      const id = first.g_id;
      this.groupe_name.push(this.members.getGroupeName(i));
      const fx = material.material_bar[id];
      const key = ["tensionBar", "sidebar", "stirrup"];
      const title = [
        this.translate.instant("material-strength-verifiaction-condition.rebar_ax"),
        this.translate.instant("material-strength-verifiaction-condition.rebar_la"),
        this.translate.instant("material-strength-verifiaction-condition.stirrup")
      ];
      const table1 = [];
      for (let j = 0; j < key.length; j++) {
        const target = { title: title[j] };
        const k = key[j];
        for (let i = 0; i < fx.length; i++) {
          const current = fx[i];
          const cur = current[k];
          const k1 = "fsy" + (i + 1);
          const k2 = "fsu" + (i + 1);
          target[k1] = cur.fsy;
          target[k2] = cur.fsu;
        }
        table1.push(target);
      }
      this.table1_datas.push(table1);
      const concrete = material.material_concrete[id];
      this.table2_datas.push([{
        title: this.translate.instant("material-strength-verifiaction-condition.fck"),
        value: concrete.fck
      }, {
        title: this.translate.instant("material-strength-verifiaction-condition.max_ca"),
        value: concrete.dmax
      }]);
      this.component_list.push(material.component[id]);
      this.other_list.push(material.other[id]);
      const safety_factor = material.safety_factor[id];
      const bar = [], steel = [];
      for (const col of safety_factor) {

        if (col.id === 8) continue; // 最小鉄筋量の安全係数は、編集しない

        bar.push({
          id: col.id, title: col.title,
          M_rc: col.M_rc, M_rs: col.M_rs, M_rbs: col.M_rbs,
          V_rc: col.V_rc, V_rs: col.V_rs, V_rbc: col.V_rbc, V_rbs: col.V_rbs, V_rbv: col.V_rbv,
          T_rbt: col.T_rbt,
          ri: col.ri, range: col.range,
          selected: this.table2_datas[0][0].value > 30 ? true : false
        });
        steel.push({
          id: col.id, title: col.title,
          S_rs: col.S_rs, S_rb: col.S_rb
        });
      }
      this.option4_list.push(bar);
      this.table4_datas.push(steel);
      this.option1_list.push({
        width: 550,
        height: 200,
        showTop: false,
        reactive: true,
        sortable: false,
        locale: 'jp',
        numberCell: { show: false }, // 行番号
        colModel: this.columnHeaders1,
        dataModel: { data: this.table1_datas[i] },
        freezeCols: 1,
        contextMenu: {
          on: true,
          items: [
            {
              name: this.translate.instant("action_key.copy"),
              shortcut: 'Ctrl + C',
              action: function (evt, ui, item) {
                this.copy();
              }
            },
            {
              name: this.translate.instant("action_key.paste"),
              shortcut: 'Ctrl + V',
              action: function (evt, ui, item) {
                this.paste();
              }
            },
            {
              name: this.translate.instant("action_key.cut"),
              shortcut: 'Ctrl + X',
              action: function (evt, ui, item) {
                this.cut();
              }
            },
            {
              name: this.translate.instant("action_key.undo"),
              shortcut: 'Ctrl + Z',
              action: function (evt, ui, item) {
                this.History().undo();
              }
            }
          ]
        },
      });
      this.option2_list.push({
        width: 550,
        height: 105,
        showTop: false,
        reactive: true,
        sortable: false,
        locale: 'jp',
        numberCell: { show: false }, // 行番号
        colModel: this.columnHeaders2,
        dataModel: { data: this.table2_datas[i] },
        freezeCols: 1,
        contextMenu: {
          on: true,
          items: [
            {
              name: this.translate.instant("action_key.copy"),
              shortcut: 'Ctrl + C',
              action: function (evt, ui, item) {
                this.copy();
              }
            },
            {
              name: this.translate.instant("action_key.paste"),
              shortcut: 'Ctrl + V',
              action: function (evt, ui, item) {
                this.paste();
              }
            },
            {
              name: this.translate.instant("action_key.cut"),
              shortcut: 'Ctrl + X',
              action: function (evt, ui, item) {
                this.cut();
              }
            },
            {
              name: this.translate.instant("action_key.undo"),
              shortcut: 'Ctrl + Z',
              action: function (evt, ui, item) {
                this.History().undo();
              }
            }
          ]
        },
      });

    }
    this.current_index = 0;
    this.options1 = this.option1_list[0];
    this.options2 = this.option2_list[0];
    this.options3 = this.component_list[0]
    this.component_select_id = this.getComponentSelectId();
    this.options4 = this.option4_list[0];
    this.options5 = this.other_list[0];
  }
  ngOnDestroy(): void {
    //throw new Error('Method not implemented.');
    this.saveData();
  }
  public setActiveTab(tab: string) {
    this.activeTab = tab;
    const i = this.current_index;
    const plastic = this.option4_list[i];
    for (let k = 0; k < plastic.length; k++) {
      const element = plastic[k]
      if (this.table2_datas[i][0].value > 30) {
        element.selected = true
      } else element.selected = false
    }



  }
  public saveData(): void {
    const safety_factor = {};
    const material_bar = {};
    const component = {};
    const verification ={};
    const other = {};
    const material_concrete = {};
    const material_steel ={};
    const pile_factor = {};
    for (let i = 0; i < this.groupe_list.length; i++) {
      const groupe = this.groupe_list[i];
      const first = groupe[0];
      const id = first.g_id;

      // 安全係数
      const safety_bar = this.option4_list[i];
      const safety_steel = this.table4_datas[i];
      const factor = [];
      for (let j = 0; j < safety_bar.length; j++) {
        const bar = safety_bar[j], steel = safety_steel[j];;
        factor.push({
          id: bar.id, title: bar.title,
          M_rc: bar.M_rc, M_rs: bar.M_rs, M_rbs: bar.M_rbs,
          V_rc: bar.V_rc, V_rs: bar.V_rs, V_rbc: bar.V_rbc, V_rbs: bar.V_rbs, V_rbv: bar.V_rbv,
          T_rbt: bar.T_rbt,
          ri: bar.ri, range: bar.range,
          S_rs: steel.S_rs, S_rb: steel.S_rb
        })
      }
      safety_factor[id] = factor;

      // 鉄筋材料
      const bar = this.table1_datas[i];
      material_bar[id] = [{
        tensionBar: { fsy: bar[0].fsy1, fsu: bar[0].fsu1 },
        sidebar: { fsy: bar[1].fsy1, fsu: bar[1].fsu1 },
        stirrup: { fsy: bar[2].fsy1, fsu: bar[2].fsu1 }
      },
      {
        tensionBar: { fsy: bar[0].fsy2, fsu: bar[0].fsu2 },
        sidebar: { fsy: bar[1].fsy2, fsu: bar[1].fsu2 },
        stirrup: { fsy: bar[2].fsy2, fsu: bar[2].fsu2 }
      }];


     
      
      component[id] = this.component_list[i];
      // 鉄骨材料
      // const steel = this.table5_datas[i];
      // material_steel[id] = [
      //   {
      //     fsyk: steel[0].SRCfsyk1,
      //     fsvyk: steel[1].SRCfsyk1,
      //     fsuk: steel[2].SRCfsyk1,
      //   },
      //   {
      //     fsyk: steel[0].SRCfsyk2,
      //     fsvyk: steel[1].SRCfsyk2,
      //     fsuk: steel[2].SRCfsyk2,
      //   },
      //   {
      //     fsyk: steel[0].SRCfsyk3,
      //     fsvyk: steel[1].SRCfsyk3,
      //     fsuk: steel[2].SRCfsyk3,
      //   }
      // ];


      const conc = this.table2_datas[i];
      material_concrete[id] = {
        fck: conc[0].value,
        dmax: conc[1].value
      }
      other[id] =  this.other_list[i];
    }
    this.material.setTableColumns({
      safety_factor,
      material_bar,
      material_steel,
      material_concrete,
      pile_factor,
      component,
      verification,
      other
    })

  }
  ngAfterViewInit(): void {
    this.activeButtons(0);
    this.setActiveTab(this.activeTab)
  }
  private setTitle(): void {
    this.columnHeaders1 = [
      { title: '', align: 'left', dataType: 'string', dataIndx: 'title', editable: false, frozen: true, sortable: false, width: 250, nodrag: true, style: { 'background': '#373e45' }, styleHead: { 'background': '#373e45' } },
      {
        title: this.translate.instant("material-strength-verifiaction-condition.ys"),
        align: 'center', colModel: [
          {
            title: this.translate.instant("material-strength-verifiaction-condition.d25"),
            dataType: 'float', dataIndx: 'fsy1', sortable: false, width: 70, nodrag: true,
          },
          {
            title: this.translate.instant("material-strength-verifiaction-condition.d29"),
            dataType: 'float', dataIndx: 'fsy2', sortable: false, width: 70, nodrag: true,
          }
        ],
        nodrag: true,
      },
      {
        title: this.translate.instant("material-strength-verifiaction-condition.dts"),
        align: 'center', colModel: [
          {
            title: this.translate.instant("material-strength-verifiaction-condition.d25"),
            dataType: 'float', dataIndx: 'fsu1', sortable: false, width: 70, nodrag: true,
          },
          {
            title: this.translate.instant("material-strength-verifiaction-condition.d29"),
            dataType: 'float', dataIndx: 'fsu2', sortable: false, width: 70, nodrag: true,
          }
        ],
        nodrag: true,
      },
    ];
    this.columnHeaders2 = [
      { title: '', align: 'left', dataType: 'string', dataIndx: 'title', editable: false, sortable: false, width: 390, nodrag: true, style: { 'background': '#373e45' }, styleHead: { 'background': '#373e45' } },
      { title: '', dataType: 'float', dataIndx: 'value', sortable: false, width: 140, nodrag: true, },
    ];
  }
  public setComponent(j: number): void {
    const i = this.current_index;
    const component = this.component_list[i];
    for (let k = 0; k < component.length; k++) {
      component[k].selected = (j === k) ? true : false;
    }
    this.component_select_id = this.getComponentSelectId();
  }
  public setCheckboxPlastic(j: number): void {
    const i = this.current_index;
    const plastic = this.option4_list[i];
    const element = plastic[j];  
    element.selected = !element.selected
  }
  private getComponentSelectId(): string {
    const id = this.current_index;
    let result:any = []
    const options3 = this.component_list[id];
   if(options3){
     result = options3.find((v) => v.selected === true);
   }
    return result.id;
  }
  handleCheck(event:any,item:any){
    const id = this.current_index
   this.other_list[id].forEach((data:any)=>{
    if(data.id === item.id){
      data.selected = event.target.checked
    }
   })
  }
  public activePageChenge(id: number, group: any): void {
    this.groupMem = group;
    this.activeButtons(id);
    this.current_index = id;

    this.options1 = this.option1_list[id];
    this.grid1.options = this.options1;
    this.grid1.refreshDataAndView();

    this.options2 = this.option2_list[id];
    this.grid2.options = this.options2;
    this.grid2.refreshDataAndView();

    this.options3 = this.component_list[id];
    this.component_select_id = this.getComponentSelectId();

    this.options5= this.other_list[id]

    this.options4 = this.option4_list[id]

  }
  private activeButtons(id: number) {
    for (let i = 0; i <= this.groupe_name.length; i++) {
      const data = document.getElementById("mat" + i);
      if (data != null) {
        if (i === id) {
          data.classList.add("is-active");
        } else if (data.classList.contains("is-active")) {
          data.classList.remove("is-active");
        }
      }
    }
  }
}
