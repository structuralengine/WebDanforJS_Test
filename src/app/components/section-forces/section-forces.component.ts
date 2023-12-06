import { forEach } from 'jszip';
import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { InputSectionForcesService } from './section-forces.service';
import { SheetComponent } from '../sheet/sheet.component';
import pq from 'pqgrid';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { MenuService } from '../menu/menu.service';
import { InputBasicInformationService } from '../basic-information/basic-information.service';
import { log } from 'console';

@Component({
  selector: 'app-section-forces',
  templateUrl: './section-forces.component.html',
  styleUrls: ['./section-forces.component.scss']
})
export class SectionForcesComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(
    private force: InputSectionForcesService,
    private translate: TranslateService,
    private menu: MenuService,
    private basic: InputBasicInformationService,
     ) { }

  @ViewChild('grid') grid: SheetComponent;
  public options: pq.gridT.options;
  public currentColGroups: { [key: string]: { start: number; end: number } };
  public currentColGroupKeys: string[];
  public bendingColGroupKeys: string[];
  public bendingColGroups = {
    stress: { start: 1, end: 4 }, //耐久性トグル
    "safe-ff": { start: 5, end: 10 }, //安全性(疲労破壊)トグル
    "safe-destruct": { start: 11, end: 12 }, //安全性(破壊)トグル
    "recover-ex-earth": { start: 13, end: 14 }, //復旧性(地震以外)トグル
    "recover-earth": { start: 15, end: 16 }, //復旧性(地震)トグル
    "rebar": { start: 17, end: 18 }, //最小鉄筋量トグル
  };
  public shearColGroups = {
    stress: { start: 1, end: 9 }, //耐久性トグル
    "safe-ff": { start: 10, end: 15 }, //安全性(疲労破壊)トグル
    "safe-destruct": { start: 16, end: 18 }, //安全性(破壊)トグル
    "recover-ex-earth": { start: 19, end: 21 }, //復旧性(地震以外)トグル
    "recover-earth": { start: 22, end: 24 }, //復旧性(地震)トグル
  };
  public torsionalColGroups = {
    stress: { start: 1, end: 8 }, //耐久性トグル
    "safe-destruct": { start: 9, end: 12 }, //安全性(破壊)トグル
    "recover-ex-earth": { start: 13, end: 16 }, //復旧性(地震以外)トグル
    "recover-earth": { start: 17, end: 20 }, //復旧性(地震)トグル
  };

  public bendingColGroupsRoad : any;
  public shearColGroupsRoad : any;
  public torsionalColGroupsRoad: any;;

  public toggleStatus: { [key: string]: boolean } = {};

  private ROWS_COUNT = 0;
  private table_datas: any[] = [];

  // 曲げモーメントのグリッド設定変数
  private columnHeaders1: object[];

  // せん断力のグリッド設定変数
  private columnHeaders2: object[];

  // ねじりモーメントのグリッド設定変数
  private columnHeaders3: object[];
  public imgLink ="";
  public selectedRoad = false;
  public currentSW: any[];

  ngOnInit() {
    this.selectedRoad = this.menu.selectedRoad;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      if(this.menu.selectedRoad){
        this.setKeyGroupsRoad()
      }
      this.initTable ();
    });

    if(this.menu.selectedRoad){
      this.setKeyGroupsRoad()
    }
    this.initTable ();

    // this.setColGroupsAndKeys(0);
    // this.bendingColGroupKeys = Object.keys(this.bendingColGroups);
    // for (const group of this.bendingColGroupKeys) {
    //   this.toggleStatus[group] = true;
    // }

    // // データを登録する
    // this.ROWS_COUNT = this.rowsCount();
    // this.loadData(this.ROWS_COUNT);

    // this.columnHeaders1 = this.force.getColumnHeaders1();
    // this.columnHeaders2 = this.force.getColumnHeaders2();
    // this.columnHeaders3 = this.force.getColumnHeaders3();

    // // グリッドの初期化 --------------------------------------
    // this.options = {
    //   showTop: false,
    //   reactive: true,
    //   sortable: false,
    //   locale: 'jp',
    //   height: this.tableHeight().toString(),
    //   numberCell: { show: true }, // 行番号
    //   colModel: this.columnHeaders1,
    //   dataModel: { data: this.table_datas },
    //   freezeCols: 1,
    //   contextMenu: {
    //     on: true,
    //     items: [
    //       {
    //         name: this.translate.instant("action_key.copy"),
    //         shortcut: 'Ctrl + C',
    //         action: function (evt, ui, item) {
    //           this.copy();
    //         }
    //       },
    //       {
    //         name: this.translate.instant("action_key.paste"),
    //         shortcut: 'Ctrl + V',
    //         action: function (evt, ui, item) {
    //           this.paste();
    //         }
    //       },
    //       {
    //         name: this.translate.instant("action_key.cut"),
    //         shortcut: 'Ctrl + X',
    //         action: function (evt, ui, item) {
    //           this.cut();
    //         }
    //       },
    //       {
    //         name: this.translate.instant("action_key.undo"),
    //         shortcut: 'Ctrl + Z',
    //         action: function (evt, ui, item) {
    //           this.History().undo();
    //         }
    //       }
    //     ]
    //   },
    //   beforeTableView: (evt, ui) => {
    //     const dataV = this.table_datas.length;
    //     if (ui.initV == null) {
    //       return;
    //     }
    //     if (ui.finalV >= dataV - 1) {
    //       this.loadData(dataV + this.ROWS_COUNT);
    //       this.grid.refreshDataAndView();
    //     }
    //   },
    // };
  }

  initTable () {
    this.setColGroupsAndKeys(0);

    //Set active start
    if(this.menu.selectedRoad){
      this.bendingColGroupKeys = Object.keys(this.bendingColGroupsRoad);
    }
    else
    {
      this.bendingColGroupKeys = Object.keys(this.bendingColGroups);
    }
    for (const group of this.bendingColGroupKeys) {
      this.toggleStatus[group] = true;
    }

    // データを登録する
    this.ROWS_COUNT = this.rowsCount();
    this.loadData(this.ROWS_COUNT);

    this.columnHeaders1 = this.force.getColumnHeaders1();
    this.columnHeaders2 = this.force.getColumnHeaders2();
    this.columnHeaders3 = this.force.getColumnHeaders3();

    // グリッドの初期化 --------------------------------------
    this.options = {
      showTop: false,
      reactive: true,
      sortable: false,
      locale: 'jp',
      height: this.tableHeight().toString(),
      numberCell: { show: true }, // 行番号
      colModel: this.columnHeaders1,
      dataModel: { data: this.table_datas },
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
      beforeTableView: (evt, ui) => {
        const dataV = this.table_datas.length;
        if (ui.initV == null) {
          return;
        }
        if (ui.finalV >= dataV - 1) {
          this.loadData(dataV + this.ROWS_COUNT);
          this.grid.refreshDataAndView();
        }
      },
    };
  }

  ngAfterViewInit() {
    this.activeButtons(0);

    this.grid.refreshCell({
      rowIndx: 0,
      colIndx: 0,
    });
  }

  private setKeyGroupsRoad(){
    const basic = this.basic.getSaveData();
    this.bendingColGroupsRoad = {};
    this.shearColGroupsRoad = {};
    this.torsionalColGroupsRoad = {};
    //bending
    let bendingRoad: any = new Object, iB = 1;
    basic.pickup_moment.forEach((value, index) => {
      let key = "B" + value.id;
      bendingRoad[key] = { start: iB, end: iB + 1 };
      iB += 2;
    });
    this.bendingColGroupsRoad = bendingRoad;

    //Shear
    let shearRoad: any = new Object, iS = 1;
    basic.pickup_shear_force.forEach((value, index) => {
      let key = "S" + value.id;
      shearRoad[key] = { start: iS, end: iS + 2 };
      iS += 3;
    });
    this.shearColGroupsRoad = shearRoad;

    //Torsional
    let torsionalRoad: any = new Object, iT = 1;
    basic.pickup_torsional_moment.forEach((value, index) => {
      let key = "T" + value.id;
      torsionalRoad[key] = { start: iT, end: iT + 3 };
      iT += 4;
    });
    this.torsionalColGroupsRoad = torsionalRoad;
  }

  private setTitleGroupsRoad(id: number) {
    let crrLang = this.translate.currentLang ?? "ja";
    const basic = this.basic.getSaveData();
    //Set title switch
    let currentSW = new Array();
    if (id === 0) {
      basic.pickup_moment.forEach((value, index) => {
        let key = "B" + value.id;
        let titleString = "";

        if(crrLang === "en"){
          if (value.id < 2)
            titleString = this.force.cutString(this.translate.instant(value.title), 10)[1];
          else if (index === basic.pickup_moment.length - 1) ///temporary set: delete minimun rebar amount
            return
          else
            titleString = this.force.cutString(this.translate.instant(value.title), 22)[1];
          currentSW.push({
            id: key,
            title: titleString,
          })
        }
        else
        {
          if (value.id < 2)
            titleString = this.force.cutString(this.translate.instant(value.title), 4)[1];
          else if (index === basic.pickup_moment.length - 1) ///temporary set: delete minimun rebar amount
            return
          else
            titleString = this.force.cutString(this.translate.instant(value.title), 11)[1];
          currentSW.push({
            id: key,
            title: titleString,
          })
        }
      });
    } else if (id === 1) {
      basic.pickup_shear_force.forEach((value, index) => {
        let key = "S" + value.id;
        let titleString = "";

        if(crrLang === "en"){
          if (value.id < 2)
            titleString = this.force.cutString(this.translate.instant(value.title), 10)[1];
          else
            titleString = this.force.cutString(this.translate.instant(value.title), 22)[1];
          currentSW.push({
            id: key,
            title: titleString,
          })
        }
        else
        {
          if (value.id < 2)
            titleString = this.force.cutString(this.translate.instant(value.title), 4)[1];
          else if (index === basic.pickup_moment.length - 1) ///temporary set: delete minimun rebar amount
            return
          else
            titleString = this.force.cutString(this.translate.instant(value.title), 11)[1];
          currentSW.push({
            id: key,
            title: titleString,
          })
        }

      });
    } else if (id === 2) {
      basic.pickup_torsional_moment.forEach((value, index) => {
        let key = "T" + value.id;
        let titleString = "";

        if(crrLang === "en"){
          if (value.id < 2)
            titleString = this.force.cutString(this.translate.instant(value.title), 10)[1];
          else
            titleString = this.force.cutString(this.translate.instant(value.title), 22)[1];
          currentSW.push({
            id: key,
            title: titleString,
          })
        }
        else
        {
          if (value.id < 2)
            titleString = this.force.cutString(this.translate.instant(value.title), 4)[1];
          else if (index === basic.pickup_moment.length - 1) ///temporary set: delete minimun rebar amount
            return
          else
            titleString = this.force.cutString(this.translate.instant(value.title), 11)[1];
          currentSW.push({
            id: key,
            title: titleString,
          })
        }
        
      });
    }
    this.currentSW = currentSW;
  }

  private setColGroupsAndKeys(id: number): void {
    if(this.menu.selectedRoad)
    {
      //set for CurrentColGroupKeys
      this.setTitleGroupsRoad(id);

      if (id === 0) {
        this.currentColGroups = this.bendingColGroupsRoad;
      } else if (id === 1) {
        this.currentColGroups = this.shearColGroupsRoad;
      } else if (id === 2) {
        this.currentColGroups = this.torsionalColGroupsRoad;
      }
    }
    else
    {
      if (id === 0) {
        this.currentColGroups = this.bendingColGroups;
      } else if (id === 1) {
        this.currentColGroups = this.shearColGroups;
      } else if (id === 2) {
        this.currentColGroups = this.torsionalColGroups;
      }
    }
    this.currentColGroupKeys = Object.keys(this.currentColGroups);
    for (const group of this.currentColGroupKeys) {
      if (this.toggleStatus[group] === undefined) {
        this.toggleStatus[group] = true;
      }
    }
  }

  public toggleDataLoad(group: string): void {
    this.toggleStatus[group] = !this.toggleStatus[group];
    const { start, end } = this.currentColGroups[group];
    this.grid.grid.getColModel().forEach((column, index) => {
      if (index >= start && index <= end) {
        column.hidden = !this.toggleStatus[group];
      }
    });
    this.grid.refreshDataAndView();
    this.grid.setColsShow();
  }

  // 指定行row まで、曲げモーメント入力データを読み取る
  private loadData(row: number): void {
    for (let i = this.table_datas.length + 1; i <= row; i++) {
      const column = this.force.getTable1Columns(i);
      this.table_datas.push(column);
    }
  }


  ngOnDestroy(): void {
    this.saveData();
  }
  public saveData(): void {
    this.force.setTableColumns(this.table_datas);
  }


  // 表の高さを計算する
  private tableHeight(): number {
    let containerHeight = window.innerHeight;
    containerHeight -= 250;
    return containerHeight;
  }

  // 表高さに合わせた行数を計算する
  private rowsCount(): number {
    const containerHeight = this.tableHeight();
    return Math.round(containerHeight / 30);
  }

  public activePageChenge(id: number): void {
    this.setColGroupsAndKeys(id);

    if (id === 0) {
      this.options.colModel = this.columnHeaders1;
    } else if (id === 1) {
      this.options.colModel = this.columnHeaders2;
    } else if (id === 2) {
      this.options.colModel = this.columnHeaders3;
    } else {
      return;
    }

    this.grid.grid.getColModel().forEach((column, index) => {
      for (const [group, { start, end }] of Object.entries(
        this.currentColGroups
      )) {
        if (index >= start && index <= end) {
          column.hidden = !this.toggleStatus[group];
        }
      }
    });

    this.activeButtons(id);
    this.grid.options = this.options;
    this.grid.refreshDataAndView();
  }

  // アクティブになっているボタンを全て非アクティブにする
  private activeButtons(id: number) {
    for (let i = 0; i <= this.table_datas.length; i++) {
      const data = document.getElementById("foc" + i);
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
