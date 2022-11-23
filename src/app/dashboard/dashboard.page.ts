import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ModalController, AlertController } from '@ionic/angular';
export interface Tunnel {
  REMOTE_HOST: String;
  REMOTE_PORT: Number;
  TUNNEL_HOST: String;
  TUNNEL_PORT: Number;
  SSH_TUNNEL: String;
  NODEPORT: Object;
  STATUS: String;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})



export class DashboardPage implements OnInit {
  public dashboard!: string;
  Tunnels: Tunnel[] = [];

  constructor(private http: HttpClient, 
    private activatedRoute: ActivatedRoute,
    private altCtrl: AlertController,
    private modalCtrl: ModalController,
    ) { }
  
  ngOnInit() {
    this.dashboard = this.activatedRoute.snapshot.paramMap.get('id') as string;
    if (this.dashboard == 'tunnels') {
      this.startTimer();
    }
  }

  async deleteTunnel(SSH_TUNNEL: String) {

    let confirmAlert = await this.altCtrl.create(
      {
        translucent: true, 
        header: "Delete SSH Tunnel", 
        message: 'You are about to delete '+ SSH_TUNNEL, 
        subHeader: 'This will also remove NodePort assignment',
        buttons: [
          {role: 'cancel', text: 'Cancel'},
          {role: 'confirm', text: 'OK'}
        ],
      });
    await confirmAlert.present();
    let data = await confirmAlert.onWillDismiss();
    if (data.role == 'confirm') {
      this.http.delete('/api/tunnels/'+SSH_TUNNEL)
      .subscribe(() => console.log('Delete successful'));
      return true;
    } else {
      console.log('not deleted');
      return null;
    }
  }

  getTunnels() {
    this.http.get('/api/tunnels').subscribe((tunnelsArr: any) => {
      this.Tunnels = tunnelsArr.response.concat( 
        this.Tunnels.filter( s => 
            !this.Tunnels.find( t => t.SSH_TUNNEL == s.SSH_TUNNEL ) 
        )
      );
    });
  }

  trackByFn(index: any, Tunnel: Tunnel) {
    return Tunnel.SSH_TUNNEL;
  }

  startTimer() {
    this.getTunnels();
    setInterval(() => this.getTunnels(), 1000)
  }

}