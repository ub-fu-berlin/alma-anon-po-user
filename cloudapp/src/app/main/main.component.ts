/*
 * anonymize users in PO-line
 *
 * @autor: krempe@ub.fu-berlin.de
 * @date: 10/2020
*/
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import {
  CloudAppRestService, CloudAppEventsService, Request, HttpMethod,
  Entity, PageInfo, RestErrorResponse
} from '@exlibris/exl-cloudapp-angular-lib';
import { Settings } from '../models/settings';
import { SettingsComponent } from '../settings/settings.component';
import { Configuration } from '../models/configuration';
import { ConfigurationComponent } from '../configuration/configuration.component';
import { CloudAppSettingsService } from '@exlibris/exl-cloudapp-angular-lib';
import { CloudAppConfigService } from '@exlibris/exl-cloudapp-angular-lib';



@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

  private pageLoad$: Subscription;
  pageEntities: Entity[];
  private _apiResult: any;
  barcode: any;
  number: any;
  anonymousId: string;
  deleteUser: string;
  interestedUsers: string[];
  settings: Settings;
  configuration: Configuration;
  hasApiResult: boolean = false;
  loading = false;
  showApi = false;

  constructor(private restService: CloudAppRestService,
    private eventsService: CloudAppEventsService,
    private settingsService: CloudAppSettingsService,
    private configService: CloudAppConfigService,
    private toastr: ToastrService) { }

  ngOnInit() {
    this.eventsService.getPageMetadata().subscribe(this.onPageLoad);
    this.pageLoad$ = this.eventsService.onPageLoad(this.onPageLoad);

    // page metadata
    this.eventsService.getPageMetadata().subscribe(
      //pageInfo => console.log('entities: link', pageInfo.entities[0].link)
    );

    // get settings
    this.settingsService.get().subscribe(settings => {
      this.settings = settings as Settings;
    });

    // get configuration
    this.configService.get().subscribe(configuration => {
      this.configuration = configuration as Configuration;
    });



    this.eventsService.getInitData().subscribe(
      data => console.log('Page called by', data.user.firstName, data.user.lastName)
    );
  }

  ngOnDestroy(): void {
    this.pageLoad$.unsubscribe();
  }

  get apiResult() {
    return this._apiResult;
  }

  set apiResult(result: any) {
    this._apiResult = result;
    this.hasApiResult = result && Object.keys(result).length > 0;
    // set initial values
    if (typeof this.apiResult.interested_user !== 'undefined') {
      let users = this.apiResult.interested_user;
      let iu = [];
      users.forEach(function(entry) {
        iu.push(entry.last_name + ', ' + entry.first_name + ' (' + entry.email + ')');
      });
      this.interestedUsers = iu;
    }
    this.number = this.apiResult.number;
  }

  onPageLoad = (pageInfo: PageInfo) => {
    this.pageEntities = pageInfo.entities;
    if ((pageInfo.entities || []).length == 1) {
      const entity = pageInfo.entities[0];
      this.restService.call(entity.link).subscribe(result => this.apiResult = result);
    } else {
      this._apiResult = {};
    }
  }

  // getUser() {
  //   console.log('PO: ' + this.apiResult.number);
  //   this.number = this.apiResult.number;
  //   let users = this.apiResult.interested_user;
  //   let iu = [];
  //   users.forEach(function(entry) {
  //     iu.push(entry.last_name + ', ' + entry.first_name + ' (' + entry.email + ')');
  //   });
  //   this.interestedUsers = iu;
  // }

  // delete interested users in po-line
  delUser() {
    console.log('User anonymize: ');
    for (let user of this.apiResult.interested_user) {
      console.log('Users Old: ' + user.primary_id);
      user.primary_id = this.deleteUser;
    };
    for (let user of this.apiResult.interested_user) {
      console.log('Users New: ' + user.primary_id);
    };
    this.save();
  }

  // anonymize interested users in po-line
  anonUser() {
    console.log('User anonymize: ');
    for (let user of this.apiResult.interested_user) {
      console.log('Users Old: ' + user.primary_id);
      user.primary_id = this.anonymousId;
    };
    for (let user of this.apiResult.interested_user) {
      console.log('Users New: ' + user.primary_id);
    };
    this.save();
  }

  // update apiResult
  save() {
    this.loading = true;
    let a = JSON.stringify(this._apiResult);
    let requestBody = this.tryParseJson(a);
    if (!requestBody) {
      this.loading = false;
      return this.toastr.error('Failed to parse json');
    }
    this.sendUpdateRequest(requestBody);
  }

  // update object displayed
  update(value: any) {
    this.loading = true;
    let requestBody = this.tryParseJson(value);
    if (!requestBody) {
      this.loading = false;
      return this.toastr.error('Failed to parse json');
    }
    this.sendUpdateRequest(requestBody);
  }

  refreshPage = () => {
    this.loading = true;
    this.eventsService.refreshPage().subscribe({
      next: () => this.toastr.success('Success!'),
      error: e => {
        console.error(e);
        this.toastr.error('Failed to refresh page');
      },
      complete: () => this.loading = false
    });
  }

  private sendUpdateRequest(requestBody: any) {
    let request: Request = {
      url: this.pageEntities[0].link,
      method: HttpMethod.PUT,
      requestBody
    };
    this.restService.call(request).subscribe({
      next: result => {
        this.apiResult = result;
        this.refreshPage();
      },
      error: (e: RestErrorResponse) => {
        this.toastr.error('Failed to update data');
        console.error(e);
        this.loading = false;
      }
    });
  }

  private tryParseJson(value: any) {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error(e);
    }
    return undefined;
  }

}
