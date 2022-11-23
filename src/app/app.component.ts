import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})


export class AppComponent {
  isSubmitted = false;
  ionicForm!: FormGroup;
  public appPages = [
    { title: 'SSH Tunnels', url: '/dashboard/tunnels', icon: 'swap-horizontal' },
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  constructor(private formBuilder: FormBuilder,private http: HttpClient, ) {
    this.ionicForm = this.formBuilder.group({
      REMOTE_HOST: ['', [Validators.required, Validators.minLength(2)]],
      REMOTE_PORT: ['', [Validators.required, Validators.minLength(2)]],
      TUNNEL_HOST: ['', [Validators.required, Validators.minLength(2)]],
      TUNNEL_PORT: [22, [Validators.required, Validators.minLength(2)]],
      TUNNEL_USER: ['root', [Validators.required, Validators.minLength(2)]],
   })
  }
  submitForm() {
    if (!this.ionicForm.valid) {
      console.log('Please provide all the required values!')
      return false;
    } else {
      this.http.post('/api/tunnels', this.ionicForm.value ).subscribe((res: any) => {
      console.log(res);
      });
      console.log(this.ionicForm.value)
      return true;
    }
  }
  }
