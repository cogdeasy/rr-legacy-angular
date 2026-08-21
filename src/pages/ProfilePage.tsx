import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../shared/auth/useAuth';
import { Icon } from '../shared/components/Icon';
import { formatDate } from '../shared/lib/date';
import { User, UserPreferences } from '../shared/models/user';
import './profile.scss';

export default function ProfilePage() {
  const { currentUser: user, preferences, updateProfile, updatePreferences } = useAuth();
  const [draft, setDraft] = useState<Partial<User>>({});
  const [draftPreferences, setDraftPreferences] = useState<UserPreferences>(preferences);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    if (user) {
      setDraft({ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone, baseLocation: user.baseLocation });
    }
  }, [user]);

  const startEditing = () => {
    if (user) setDraft({ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone, baseLocation: user.baseLocation });
    setIsEditing(true);
    setSavedMessage('');
  };
  const cancelEditing = () => {
    setIsEditing(false);
    if (user) setDraft({ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone, baseLocation: user.baseLocation });
  };
  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    void updateProfile(draft).then(() => { setIsSaving(false); setIsEditing(false); setSavedMessage('Profile details updated.'); });
  };
  const savePrefs = () => {
    setIsSaving(true);
    void updatePreferences(draftPreferences).then(() => { setIsSaving(false); setSavedMessage('Notification preferences updated.'); });
  };
  if (!user) return null;
  const setDraftField = (field: keyof User, value: string) => setDraft((current) => ({ ...current, [field]: value }));

  return (
    <>
      <div className="page-header"><div><span className="micro-label">Profile</span><h1>Your operations account</h1><p>Contact details, delegated authority and alerting thresholds.</p></div></div>
      {savedMessage && <div className="saved-banner panel"><Icon>check_circle_outline</Icon><span>{savedMessage}</span></div>}
      <div className="profile-layout">
        <aside className="panel identity-card"><div className="avatar">{user.firstName.charAt(0)}{user.lastName.charAt(0)}</div><h2>{user.firstName} {user.lastName}</h2><span className="role">{user.role}</span><span className="status-pill state-nominal">{user.authorityLevel}</span><dl className="identity-facts"><div><dt className="micro-label">Employee ID</dt><dd className="numeric">{user.id}</dd></div><div><dt className="micro-label">Base</dt><dd>{user.baseLocation}</dd></div><div><dt className="micro-label">With Rolls-Royce since</dt><dd>{formatDate(user.employeeSince, 'MMMM yyyy')}</dd></div><div><dt className="micro-label">Last sign in</dt><dd>{formatDate(user.lastLogin, 'dd MMM yyyy, HH:mm')}</dd></div></dl><span className="micro-label">Fleets covered</span><div className="fleet-chips">{user.fleetsCovered.map((fleet) => <span className="fleet-chip" key={fleet}>{fleet}</span>)}</div></aside>
        <section className="profile-main">
          <div className="panel"><header className="section-head"><span className="micro-label">Contact details</span>{!isEditing && <button className="rr-button rr-button-stroked pill-cta" onClick={startEditing}><Icon>edit</Icon> Edit</button>}</header>{!isEditing ? <dl className="detail-grid"><div><dt className="micro-label">First name</dt><dd>{user.firstName}</dd></div><div><dt className="micro-label">Last name</dt><dd>{user.lastName}</dd></div><div><dt className="micro-label">Email</dt><dd>{user.email}</dd></div><div><dt className="micro-label">Phone</dt><dd>{user.phone}</dd></div><div className="wide"><dt className="micro-label">Base location</dt><dd>{user.baseLocation}</dd></div></dl> : <form className="detail-grid" onSubmit={saveProfile}>{(['firstName', 'lastName', 'email', 'phone', 'baseLocation'] as const).map((field) => <label className={`field${field === 'baseLocation' ? ' wide' : ''}`} key={field}><span className="field-label">{field === 'firstName' ? 'First name' : field === 'lastName' ? 'Last name' : field === 'baseLocation' ? 'Base location' : field.charAt(0).toUpperCase() + field.slice(1)}</span><input type={field === 'email' ? 'email' : 'text'} name={field} value={String(draft[field] ?? '')} onChange={(event) => setDraftField(field, event.target.value)} /></label>)}<div className="form-actions wide"><button className="rr-button rr-button-stroked" type="button" onClick={cancelEditing}>Cancel</button><button className="rr-button rr-button-flat pill-cta" type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save changes'}</button></div></form>}</div>
          <div className="panel"><span className="micro-label">Alerting preferences</span><label className="toggle-row"><input type="checkbox" name="alertEmails" checked={draftPreferences.alertEmails} onChange={(event) => setDraftPreferences({ ...draftPreferences, alertEmails: event.target.checked })} /><span><strong>Engine alert emails</strong><span className="toggle-note">Send an email whenever a covered engine moves to act now.</span></span></label><label className="toggle-row"><input type="checkbox" name="dailyFleetDigest" checked={draftPreferences.dailyFleetDigest} onChange={(event) => setDraftPreferences({ ...draftPreferences, dailyFleetDigest: event.target.checked })} /><span><strong>Daily fleet digest</strong><span className="toggle-note">06:00 summary of downlink coverage and margin movement.</span></span></label><label className="toggle-row"><input type="checkbox" name="aogPager" checked={draftPreferences.aogPager} onChange={(event) => setDraftPreferences({ ...draftPreferences, aogPager: event.target.checked })} /><span><strong>AOG pager</strong><span className="toggle-note">Page immediately for aircraft on ground events.</span></span></label><div className="threshold-row"><label className="field"><span className="field-label">EGT margin alert threshold (degC)</span><input type="number" min="0" max="60" name="egtMarginThreshold" value={draftPreferences.egtMarginThreshold} onChange={(event) => setDraftPreferences({ ...draftPreferences, egtMarginThreshold: Number(event.target.value) })} /></label><label className="field"><span className="field-label">Default fleet</span><select name="defaultFleet" value={draftPreferences.defaultFleet} onChange={(event) => setDraftPreferences({ ...draftPreferences, defaultFleet: event.target.value })}>{user.fleetsCovered.map((fleet) => <option value={fleet} key={fleet}>{fleet}</option>)}</select></label></div><div className="form-actions"><button className="rr-button rr-button-flat pill-cta" onClick={savePrefs} disabled={isSaving}>{isSaving ? 'Saving…' : 'Save preferences'}</button></div></div>
        </section>
      </div>
    </>
  );
}
