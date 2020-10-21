import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { FormGroup } from '@angular/forms';
import { CloudAppSettingsService } from '@exlibris/exl-cloudapp-angular-lib';
import { FormGroupUtil } from '@exlibris/exl-cloudapp-angular-lib';
import { ToastrService } from 'ngx-toastr';
import { Settings } from '../models/settings';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  form: FormGroup;
  saving = false;

  constructor(
    private appService: AppService,
    private settingsService: CloudAppSettingsService,
    private toastr: ToastrService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    //this.settingsService.remove().subscribe( () => console.log('removed') );
    this.appService.setTitle('Settings');
    this.settingsService.getAsFormGroup().subscribe( settings => {
      this.form = Object.keys(settings.value).length==0 ?
        FormGroupUtil.toFormGroup(new Settings()) :
        settings;
    });
  }

  save() {
    this.saving = true;
    // use local store for language??
    this.translate.use(this.form.value.language);
    //this.settingsService.get().
    this.settingsService.set(this.form.value).subscribe(
      response => {
        this.toastr.success(this.translate.instant('Settings successfully saved'));
        this.form.markAsPristine();
      },
      err => this.toastr.error(err.message),
      ()  => this.saving = false
    );
  }
}
