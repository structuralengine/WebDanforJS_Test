


import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { InputMembersService } from '../members/members.service';
import { TranslateService } from '@ngx-translate/core';
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
  public pile_factor_list: any[] = new Array();
  public pile_factor_select_id: string;

  public options5: any[]; 
  public material_steel_list: any[] = new Array(); 
  public setActiveTab(tab: string) {
    this.activeTab = tab;
  }

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
  @ViewChild('grid4') grid4: SheetComponent;
  public options4: pq.gridT.options;
  private option4_list: pq.gridT.options[] = new Array();
  private columnHeaders4: object[] = [];
  private table4_datas: any[];

  private current_index: number;
  private groupe_list: any[];
  constructor(
    private material: InputMaterialStrengthVerificationConditionService,
    private members: InputMembersService,
    private translate: TranslateService,
  ) { } 

  ngOnInit() {
    this.setTitle()
    const material = this.material.getTableColumns();
    this.table1_datas = new Array();      // 安全係数
    this.table2_datas = new Array();      // 鉄筋材料    
    this.table4_datas = new Array();      // 鉄骨材料    
    this.groupe_name = new Array();

    for (let i = 0; i < material.groupe_list.length; i++) {
      const groupe = material.groupe_list[i];
      const first = groupe[0];
      const id = first.g_id;
      this.groupe_name.push(this.members.getGroupeName(i));

      this.pile_factor_list.push(material.pile_factor[id]);
      this.options3=this.pile_factor_list[0]


    }
  }
  ngOnDestroy(): void {
    //throw new Error('Method not implemented.');
  }
  ngAfterViewInit(): void {
    this.setActiveTab(this.activeTab)
  }
  private setTitle() : void{
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


  }

  private getPileFactorSelectId(): string {
    const id = this.current_index
    const options6 = this.pile_factor_list[id];
    const result = options6.find((v) => v.selected === true);
    return result.id;
  }
  public activePageChenge(id: number, group: any): void {
    this.groupMem=group;
    this.activeButtons(id);
    this.current_index = id;    
   
    this.options1 = this.option1_list[id];
    this.grid1.options = this.options1;
    this.grid1.refreshDataAndView();

    this.options2 = this.option2_list[id];
    this.grid2.options = this.options2;
    this.grid2.refreshDataAndView();  

    this.options3 = this.pile_factor_list[id];
    this.pile_factor_select_id = this.getPileFactorSelectId();

    this.options4 = this.option4_list[id];
    this.grid4.options = this.options4;
    this.grid4.refreshDataAndView();
   
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
