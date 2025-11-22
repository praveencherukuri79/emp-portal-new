import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService } from '../../../services/settings.service';
import { ToastService } from '../../../shared/components/toast-notification/toast-notification.component';
import { IUpdateTenantRequest } from '@shared/types/requests';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './system-settings.component.html',
  styleUrls: ['./system-settings.component.scss']
})
export class SystemSettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  loading = signal(false);
  saving = signal(false);
  settingsForm: FormGroup;
  tenantData: any = null;

  currencies = ['USD', 'EUR', 'GBP', 'INR', 'AED', 'SAR'];
  dateFormats = ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY', 'DD-MM-YYYY'];
  timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Singapore',
    'Australia/Sydney'
  ];

  constructor() {
    this.settingsForm = this.fb.group({
      name: ['', Validators.required],
      domain: ['', Validators.required],
      workDaysPerWeek: [5, [Validators.required, Validators.min(1), Validators.max(7)]],
      workHoursPerDay: [8, [Validators.required, Validators.min(1), Validators.max(24)]],
      currency: ['USD', Validators.required],
      dateFormat: ['YYYY-MM-DD', Validators.required],
      timeZone: ['UTC', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading.set(true);
    this.settingsService.getTenantSettings().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.tenantData = response.data;
          this.populateForm(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading settings:', error);
        this.toast.error('Failed to load settings');
        this.loading.set(false);
      }
    });
  }

  populateForm(data: any): void {
    this.settingsForm.patchValue({
      name: data.name || '',
      domain: data.domain || '',
      workDaysPerWeek: data.settings?.workDaysPerWeek || 5,
      workHoursPerDay: data.settings?.workHoursPerDay || 8,
      currency: data.settings?.currency || 'USD',
      dateFormat: data.settings?.dateFormat || 'YYYY-MM-DD',
      timeZone: data.settings?.timeZone || 'UTC'
    });
  }

  saveSettings(): void {
    if (this.settingsForm.valid) {
      this.saving.set(true);
      const formValue = this.settingsForm.value;
      
      const updateData: IUpdateTenantRequest = {
        name: formValue.name,
        domain: formValue.domain,
        settings: {
          workDaysPerWeek: formValue.workDaysPerWeek,
          workHoursPerDay: formValue.workHoursPerDay,
          currency: formValue.currency,
          dateFormat: formValue.dateFormat,
          timeZone: formValue.timeZone
        }
      };

      this.settingsService.updateTenantSettings(updateData).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.toast.success('Settings saved successfully');
            this.tenantData = response.data;
          } else {
            this.toast.error(response.message || 'Failed to save settings');
          }
          this.saving.set(false);
        },
        error: (error) => {
          console.error('Error saving settings:', error);
          this.toast.error(error.message || 'Failed to save settings');
          this.saving.set(false);
        }
      });
    } else {
      this.toast.error('Please fill in all required fields');
    }
  }
}

