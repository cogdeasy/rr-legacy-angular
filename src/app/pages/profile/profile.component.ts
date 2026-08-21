import { Component, OnInit } from '@angular/core';
import { User, UserPreferences } from '../../shared/models/user.model';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  preferences: UserPreferences;
  draft: Partial<User> = {};
  isEditing = false;
  isSaving = false;
  savedMessage = '';

  constructor(private authService: AuthService) {
    this.preferences = { ...this.authService.preferences };
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      this.resetDraft();
    });
  }

  get initials(): string {
    if (!this.user) {
      return '';
    }
    return `${this.user.firstName.charAt(0)}${this.user.lastName.charAt(0)}`;
  }

  startEditing(): void {
    this.resetDraft();
    this.isEditing = true;
    this.savedMessage = '';
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.resetDraft();
  }

  saveProfile(): void {
    this.isSaving = true;
    this.authService.updateProfile(this.draft).subscribe(() => {
      this.isSaving = false;
      this.isEditing = false;
      this.savedMessage = 'Profile details updated.';
    });
  }

  savePreferences(): void {
    this.isSaving = true;
    this.authService.updatePreferences(this.preferences).subscribe(() => {
      this.isSaving = false;
      this.savedMessage = 'Notification preferences updated.';
    });
  }

  private resetDraft(): void {
    if (!this.user) {
      this.draft = {};
      return;
    }
    this.draft = {
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      email: this.user.email,
      phone: this.user.phone,
      baseLocation: this.user.baseLocation
    };
  }
}
