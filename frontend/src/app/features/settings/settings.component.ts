import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ThemeService } from '../../core/services/theme.service';
import { UINotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  saving = signal(false);

  constructor(
    private fb: FormBuilder,
    public themeService: ThemeService,
    private notification: UINotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.settingsForm = this.fb.group({
      theme: [this.themeService.currentTheme()],
      notifications: [true],
      emailNotifications: [true],
      language: ['en']
    });
  }

  saveSettings(): void {
    this.saving.set(true);
    
    // Update theme if changed
    const newTheme = this.settingsForm.get('theme')?.value;
    if (newTheme && newTheme !== this.themeService.currentTheme()) {
      this.themeService.setTheme(newTheme);
    }

    // Simulate save delay
    setTimeout(() => {
      this.saving.set(false);
      this.notification.showSuccess('Settings saved successfully!');
    }, 500);
  }
}

