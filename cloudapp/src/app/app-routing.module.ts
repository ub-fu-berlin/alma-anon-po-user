import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { SettingsComponent } from './settings/settings.component';
import { ConfigurationComponent, ConfigurationGuard } from './configuration/configuration.component';
import { HelpComponent } from './help/help.component';

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'configuration', component: ConfigurationComponent, canActivate: [ConfigurationGuard] },
  { path: 'help', component: HelpComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
