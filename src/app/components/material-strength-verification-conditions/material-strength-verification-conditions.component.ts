import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-material-strength',
  templateUrl: './material-strength-verification-conditions.component.html',
  styleUrls: ['./material-strength-verification-conditions.component.scss']
})
export class MaterialStrengthVerificationConditionComponent implements OnInit {
  public groupe_name: string[];
  public activeTab: string = 'com_type';

  public options3: any[]; 
  public pile_factor_list: any[] = new Array();
  public pile_factor_select_id: string;

  public options5: any[]; 
  public material_steel_list: any[] = new Array();
  

  constructor(private translate: TranslateService,) { }

  ngOnInit() {
    
  }

  ngAfterViewInit() {
    this.setActiveTab(this.activeTab);

  }
  public setActiveTab(tab: string) {
    this.activeTab = tab;
  }

}
