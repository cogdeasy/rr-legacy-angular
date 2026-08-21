import { FormEvent, useEffect, useState } from 'react';
import { Icon } from '../shared/components/Icon';
import { useAuth } from '../shared/auth/useAuth';
import { formatDate } from '../shared/lib/date';
import { User } from '../shared/models/user';
import './profile.scss';

type ContactDraft = Pick<User, 'firstName' | 'lastName' | 'email' | 'phone' | 'baseLocation'>;

const draftFrom = (user: User): ContactDraft => ({
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  baseLocation: user.baseLocation
});

export default function ProfilePage() {
  const { currentUser, preferences, updateProfile, updatePreferences } = useAuth();
  const [draft, setDraft] = useState<ContactDraft | null>(currentUser ? draftFrom(currentUser) : null);
  const [prefsDraft, setPrefsDraft] = useState(preferences);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    setDraft(currentUser ? draftFrom(currentUser) : null);
  }, [currentUser]);

  if (!currentUser || !draft) {
    return null;
  }

  const initials = `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`;

  const startEditing = () => {
    setDraft(draftFrom(currentUser));
    setIsEditing(true);
    setSavedMessage('');
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setDraft(draftFrom(currentUser));
  };

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    updateProfile(draft).then(() => {
      setIsSaving(false);
      setIsEditing(false);
      setSavedMessage('Profile details updated.');
    });
  };

  const savePreferences = () => {
    setIsSaving(true);
    updatePreferences(prefsDraft).then(() => {
      setIsSaving(false);
      setSavedMessage('Notification preferences updated.');
    });
  };

  const updateDraft = (changes: Partial<ContactDraft>) =>
    setDraft(current => (current ? { ...current, ...changes } : current));

  return (
    <>
      <div className="page-header">
        <div>
          <span className="micro-label">Profile</span>
          <h1>Your operations account</h1>
          <p>Contact details, delegated authority and alerting thresholds.</p>
        </div>
      </div>

      {savedMessage && (
        <div className="saved-banner panel">
          <Icon name="check_circle_outline" />
          <span>{savedMessage}</span>
        </div>
      )}

      <div className="profile-layout">
        <aside className="panel identity-card">
          <div className="avatar">{initials}</div>
          <h2>
            {currentUser.firstName} {currentUser.lastName}
          </h2>
          <span className="role">{currentUser.role}</span>
          <span className="status-pill state-nominal">{currentUser.authorityLevel}</span>

          <dl className="identity-facts">
            <div>
              <dt className="micro-label">Employee ID</dt>
              <dd className="numeric">{currentUser.id}</dd>
            </div>
            <div>
              <dt className="micro-label">Base</dt>
              <dd>{currentUser.baseLocation}</dd>
            </div>
            <div>
              <dt className="micro-label">With Rolls-Royce since</dt>
              <dd>{formatDate(currentUser.employeeSince, 'MMMM yyyy')}</dd>
            </div>
            <div>
              <dt className="micro-label">Last sign in</dt>
              <dd>{formatDate(currentUser.lastLogin, 'dd MMM yyyy, HH:mm')}</dd>
            </div>
          </dl>

          <span className="micro-label">Fleets covered</span>
          <div className="fleet-chips">
            {currentUser.fleetsCovered.map(fleet => (
              <span className="fleet-chip" key={fleet}>
                {fleet}
              </span>
            ))}
          </div>
        </aside>

        <section className="profile-main">
          <div className="panel">
            <header className="section-head">
              <span className="micro-label">Contact details</span>
              {!isEditing && (
                <button type="button" className="rr-button stroked pill-cta" onClick={startEditing}>
                  <Icon name="edit" /> Edit
                </button>
              )}
            </header>

            {!isEditing ? (
              <dl className="detail-grid">
                <div>
                  <dt className="micro-label">First name</dt>
                  <dd>{currentUser.firstName}</dd>
                </div>
                <div>
                  <dt className="micro-label">Last name</dt>
                  <dd>{currentUser.lastName}</dd>
                </div>
                <div>
                  <dt className="micro-label">Email</dt>
                  <dd>{currentUser.email}</dd>
                </div>
                <div>
                  <dt className="micro-label">Phone</dt>
                  <dd>{currentUser.phone}</dd>
                </div>
                <div className="wide">
                  <dt className="micro-label">Base location</dt>
                  <dd>{currentUser.baseLocation}</dd>
                </div>
              </dl>
            ) : (
              <form className="detail-grid" onSubmit={saveProfile}>
                <label className="field">
                  <span className="field-label">First name</span>
                  <input
                    type="text"
                    name="firstName"
                    value={draft.firstName}
                    onChange={event => updateDraft({ firstName: event.target.value })}
                  />
                </label>
                <label className="field">
                  <span className="field-label">Last name</span>
                  <input
                    type="text"
                    name="lastName"
                    value={draft.lastName}
                    onChange={event => updateDraft({ lastName: event.target.value })}
                  />
                </label>
                <label className="field">
                  <span className="field-label">Email</span>
                  <input
                    type="email"
                    name="email"
                    value={draft.email}
                    onChange={event => updateDraft({ email: event.target.value })}
                  />
                </label>
                <label className="field">
                  <span className="field-label">Phone</span>
                  <input
                    type="text"
                    name="phone"
                    value={draft.phone}
                    onChange={event => updateDraft({ phone: event.target.value })}
                  />
                </label>
                <label className="field wide">
                  <span className="field-label">Base location</span>
                  <input
                    type="text"
                    name="baseLocation"
                    value={draft.baseLocation}
                    onChange={event => updateDraft({ baseLocation: event.target.value })}
                  />
                </label>

                <div className="form-actions wide">
                  <button type="button" className="rr-button" onClick={cancelEditing}>
                    Cancel
                  </button>
                  <button type="submit" className="rr-button primary pill-cta" disabled={isSaving}>
                    {isSaving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="panel">
            <span className="micro-label">Alerting preferences</span>

            <label className="toggle-row">
              <input
                type="checkbox"
                name="alertEmails"
                checked={prefsDraft.alertEmails}
                onChange={event => setPrefsDraft({ ...prefsDraft, alertEmails: event.target.checked })}
              />
              <span>
                <strong>Engine alert emails</strong>
                <span className="toggle-note">
                  Send an email whenever a covered engine moves to act now.
                </span>
              </span>
            </label>

            <label className="toggle-row">
              <input
                type="checkbox"
                name="dailyFleetDigest"
                checked={prefsDraft.dailyFleetDigest}
                onChange={event =>
                  setPrefsDraft({ ...prefsDraft, dailyFleetDigest: event.target.checked })
                }
              />
              <span>
                <strong>Daily fleet digest</strong>
                <span className="toggle-note">
                  06:00 summary of downlink coverage and margin movement.
                </span>
              </span>
            </label>

            <label className="toggle-row">
              <input
                type="checkbox"
                name="aogPager"
                checked={prefsDraft.aogPager}
                onChange={event => setPrefsDraft({ ...prefsDraft, aogPager: event.target.checked })}
              />
              <span>
                <strong>AOG pager</strong>
                <span className="toggle-note">Page immediately for aircraft on ground events.</span>
              </span>
            </label>

            <div className="threshold-row">
              <label className="field">
                <span className="field-label">EGT margin alert threshold (degC)</span>
                <input
                  type="number"
                  name="egtMarginThreshold"
                  min={0}
                  max={60}
                  value={prefsDraft.egtMarginThreshold}
                  onChange={event =>
                    setPrefsDraft({ ...prefsDraft, egtMarginThreshold: Number(event.target.value) })
                  }
                />
              </label>
              <label className="field">
                <span className="field-label">Default fleet</span>
                <select
                  name="defaultFleet"
                  value={prefsDraft.defaultFleet}
                  onChange={event => setPrefsDraft({ ...prefsDraft, defaultFleet: event.target.value })}
                >
                  {currentUser.fleetsCovered.map(fleet => (
                    <option value={fleet} key={fleet}>
                      {fleet}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="rr-button primary pill-cta"
                onClick={savePreferences}
                disabled={isSaving}
              >
                {isSaving ? 'Saving…' : 'Save preferences'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
