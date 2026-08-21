import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User, UserPreferences } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private preferencesSubject = new BehaviorSubject<UserPreferences>({
    alertEmails: true,
    dailyFleetDigest: true,
    aogPager: true,
    egtMarginThreshold: 20,
    defaultFleet: 'Trent 1000'
  });

  currentUser$ = this.currentUserSubject.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  preferences$ = this.preferencesSubject.asObservable();

  private mockUser: User = {
    id: 'RR-4471',
    firstName: 'Alice',
    lastName: 'Whitmore',
    email: 'alice.whitmore@rolls-royce.com',
    phone: '+44 7700 900412',
    role: 'Fleet Health Controller',
    baseLocation: 'Derby, Sinfin — Operations Centre',
    authorityLevel: 'Level 3 — workscope release',
    lastLogin: '2026-03-26T06:15:00Z',
    employeeSince: '2016-09-05',
    fleetsCovered: ['Trent 1000', 'Trent XWB-84', 'Trent 7000']
  };

  constructor() {
    const stored = localStorage.getItem('rr_portal_auth');
    if (stored) {
      this.currentUserSubject.next(this.mockUser);
      this.isAuthenticatedSubject.next(true);
    }
  }

  login(email: string, password: string): Observable<User> {
    return of(this.mockUser).pipe(
      delay(1200),
      tap(user => {
        localStorage.setItem('rr_portal_auth', 'true');
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('rr_portal_auth');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  updateProfile(changes: Partial<User>): Observable<User> {
    const updated = { ...this.mockUser, ...changes };
    this.mockUser = updated;
    return of(updated).pipe(
      delay(600),
      tap(user => this.currentUserSubject.next(user))
    );
  }

  updatePreferences(preferences: UserPreferences): Observable<UserPreferences> {
    return of(preferences).pipe(
      delay(400),
      tap(prefs => this.preferencesSubject.next(prefs))
    );
  }

  get isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get preferences(): UserPreferences {
    return this.preferencesSubject.value;
  }
}
