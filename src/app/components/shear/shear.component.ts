import { Menu } from 'electron';
import { Component, OnInit, ViewChild } from '@angular/core';
import { SheetComponent } from '../sheet/sheet.component';
import pq from 'pqgrid';
import { SaveDataService } from 'src/app/providers/save-data.service';
import { DataHelperModule } from 'src/app/providers/data-helper.module';
import { TranslateService } from '@ngx-translate/core';
import { ShearStrengthService } from './shear-strength.service';
import { InputBasicInformationService } from '../basic-information/basic-information.service';
import { InputMembersService } from '../members/members.service';
import { InputSafetyFactorsMaterialStrengthsService } from '../safety-factors-material-strengths/safety-factors-material-strengths.service';
import { MenuService } from '../menu/menu.service';

@Component({
  selector: 'app-shear',
  templateUrl: './shear.component.html',
  styleUrls: ['./shear.component.scss', '../subNavArea.scss']
})
export class ShearComponent implements OnInit {

  @ViewChild('grid') grid: SheetComponent;
  public options: pq.gridT.options;
  public isSubstructure: boolean = false; 
  public isRoad: boolean = false;
  // データグリッドの設定変数
  private option_list: pq.gridT.options[] = new Array();
  private columnHeaders: object[] = new Array();

  public table_datas: any[];
  // タブのヘッダ名
  public groupe_name: string[];

  public isSubstructure: boolean = false;
  public isRoad: boolean = false;

  constructor(
    private shear: ShearStrengthService,
    private members: InputMembersService,
    private material: InputSafetyFactorsMaterialStrengthsService,
    private menu: MenuService,

    private save: SaveDataService,
    public helper: DataHelperModule,
    private basic: InputBasicInformationService,
    private translate: TranslateService,
    private material: InputSafetyFactorsMaterialStrengthsService,
    private menu: MenuService,
  ) {
    this.members.checkGroupNo();
  }

  ngOnInit() {
    this.isRoad = this.menu.selectedRoad;
    if(this.isRoad){
      this.setShow(1); //set default by first group
    }
    this.setTitle(this.save.isManual());

    this.table_datas = this.shear.getTableColumns();

    // グリッドの設定
    this.options = new Array();
    for (let i = 0; i < this.table_datas.length; i++) {
      const op = {
        showTop: false,
        reactive: true,
        sortable: false,
        locale: "jp",
        height: this.tableHeight().toString(),
        numberCell: { show: false }, // 行番号
        colModel: this.columnHeaders,
        dataModel: { data: this.table_datas[i] },
        freezeCols: (this.save.isManual()) ? 2 : 3,
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
      };
      this.option_list.push(op);
    }
    this.options = this.option_list[0];

    // タブのタイトルとなる
    this.groupe_name = new Array();
    for (let i = 0; i < this.table_datas.length; i++) {
      this.groupe_name.push(this.shear.getGroupeName(i));
    }

  }

  ngAfterViewInit() {
    this.activeButtons(0);
  }

  private setTitle(isManual: boolean): void {
    if (!this.isRoad) {
      if (isManual) {
        // 断面力手入力モードの場合
        this.columnHeaders = [
          { title: '', align: 'center', dataType: 'integer', dataIndx: 'm_no', editable: false, frozen: true, sortable: false, width: 60, nodrag: true, style: { 'background': '#373e45' }, styleHead: { 'background': '#373e45' } },
        ];
      } else {
        this.columnHeaders = [
          {
            title: this.translate.instant("shear-strength.m_no"),
            align: 'center', dataType: 'integer', dataIndx: 'm_no', editable: false, frozen: true, sortable: false, width: 60, nodrag: true, style: { 'background': '#373e45' }, styleHead: { 'background': '#373e45' }
          },
          {
            title: this.translate.instant("shear-strength.position"),
            dataType: 'float', format: '#.000', dataIndx: 'position', editable: false, frozen: true, sortable: false, width: 110, nodrag: true, style: { 'background': '#373e45' }, styleHead: { 'background': '#373e45' }
          },
        ];
      }

      // 共通する項目
      this.columnHeaders.push(
        {
          title: this.translate.instant("shear-strength.p_name"),
          dataType: 'string', dataIndx: 'p_name', editable: false, frozen: true, sortable: false, width: 250, nodrag: true, style: { 'background': '#373e45' }, styleHead: { 'background': '#373e45' }
        },
        {
          title: this.translate.instant("shear-strength.s_len"),
          dataType: "float", dataIndx: "La", sortable: false, width: 200, nodrag: true,
        }
      );

      // 令和5年 RC標準
      const speci1 = this.basic.get_specification1();
      const speci2 = this.basic.get_specification2();
      if (speci1 === 0 && (speci2 === 3 || speci2 === 4)) {
        this.columnHeaders.push(
          {
            title: this.translate.instant("shear-strength.fixed_end"),
            align: 'center', dataType: 'bool', dataIndx: 'fixed_end', type: 'checkbox', sortable: false, width: 100, nodrag: true,
          },
          {
            title: this.translate.instant("shear-strength.m_len"),
            dataType: "float", dataIndx: "L", sortable: false, width: 150, nodrag: true,
          }
        );
      }
    }
    else {
      if (isManual) {
        this.columnHeaders = [
          { title: '', align: 'center', dataType: 'integer', dataIndx: 'm_no', editable: false, frozen: true, sortable: false, width: 60, nodrag: true, style: { 'background': '#373e45' }, styleHead: { 'background': '#373e45' } },
        ];
      } else {
        this.columnHeaders = [
          {
            title: this.translate.instant("shear-strength.m_no"),
            align: 'center', dataType: 'integer', dataIndx: 'm_no', editable: false, frozen: true, sortable: false, width: 60, nodrag: true, style: { 'background': '#373e45' }, styleHead: { 'background': '#373e45' }
          },
          {
            title: this.translate.instant("shear-strength.position"),
            dataType: 'float', format: '#.000', dataIndx: 'position', editable: false, frozen: true, sortable: false, width: 110, nodrag: true, style: { 'background': '#373e45' }, styleHead: { 'background': '#373e45' }
          },
        ];
      }
      this.columnHeaders.push(
        {
          title: this.translate.instant("shear-strength.p_name"),
          dataType: 'string', dataIndx: 'p_name', editable: false, frozen: true, sortable: false, width: 250, nodrag: true, style: { 'background': '#373e45' }, styleHead: { 'background': '#373e45' }
        },
      );
      if (this.isSubstructure) {
        this.columnHeaders.push(
          {
            title: this.translate.instant("shear-strength.consider_shear"),
            align: 'center', colModel: [
              {
                title: this.translate.instant("shear-strength.concrete"),
                align: 'center', dataType: 'bool', dataIndx: 'La', type: 'checkbox', frozen: true, sortable: false, width: 150, nodrag: true,
              },
              {
                title: this.translate.instant("shear-strength.reinforcement_bar"),
                align: 'center', dataType: 'bool', dataIndx: 'fixed_end', type: 'checkbox', frozen: true, sortable: false, width: 150, nodrag: true,
              }
            ],
            nodrag: true,
          },
          {
            title: this.translate.instant("shear-strength.s_len"),
            dataType: "float", dataIndx: "L", sortable: false, width: 200, nodrag: true,
          }
        );
      }
    }
  }

  public getGroupeName(i: number): string {
    return this.groupe_name[i];
  }

  ngOnDestroy() {
    this.saveData();
  }

  //Set show following component type is "Substructure"
  public setShow(id){
    let pile_factor = new Array();
    pile_factor = this.material.pile_factor[id];
    if(pile_factor !== null && pile_factor !== undefined){
      var sub = pile_factor.find((value) => value.id === "pile-002" )
      if(sub !== null && sub !== undefined) this.isSubstructure = sub.selected;
    }
  }

  public saveData(): void {
    const a = [];
    for (const g of this.table_datas) {
      for (const e of g) {
        a.push(e);
      }
    }
    this.shear.setTableColumns(a);
  }

  // 表の高さを計算する
  private tableHeight(): number {
    let containerHeight = window.innerHeight;
    containerHeight -= 230;
    return containerHeight;
  }

  public activePageChenge(id: number): void {
    this.setShow(id + 1);
    this.activeButtons(id);

    this.options = this.option_list[id];
    this.grid.options = this.options;
    this.grid.refreshDataAndView();
  }

  // アクティブになっているボタンを全て非アクティブにする
  private activeButtons(id: number) {
    for (let i = 0; i <= this.table_datas.length; i++) {
      const data = document.getElementById("shr" + i);
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
