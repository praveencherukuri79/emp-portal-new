import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-prospect-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './prospect-dashboard.component.html',
  styleUrls: ['./prospect-dashboard.component.scss']
})
export class ProspectDashboardComponent implements OnInit {
  currentUser = signal<User | null>(null);

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser.set(this.authService.currentUser());
  }
}
