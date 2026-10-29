import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { API_BASE } from '../config';
import {
  UserCircle, Mail, Calendar, Briefcase, BookOpen, Loader2,
  Sparkles, Pencil, Check, X, Plus, AlertCircle, CheckCircle2,
  Tag
} from 'lucide-react';

const SUGGESTED_SKILLS = [
  'React', 'Node.js', 'Python', 'TailwindCSS', 'TypeScript',
  'Next.js', 'MongoDB', 'Express', 'Docker', 'AI / ML',
  'FastAPI', 'Web3', 'Solidity', 'Figma', 'UI/UX'
];

export default function ProfilePage() {
  const { user, token, updateProfile } = useAuthContext();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

  const syncStateFromUser = (u) => {
    if (!u) return;
    setName(u.name || '');
    setBio(u.bio || '');
    setSkills(Array.isArray(u.skills) ? [...u.skills] : []);
  };

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
          syncStateFromUser(data.user);
        } else {
          syncStateFromUser(user);
        }
      } catch {
        syncStateFromUser(user);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayUser = profile || user;

  const handleStartEdit = () => {
    syncStateFromUser(displayUser);
    setFeedback(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    syncStateFromUser(displayUser);
    setSkillInput('');
    setFeedback(null);
    setIsEditing(false);
  };

  const handleAddSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || skillInput).trim();
    if (!trimmed) return;
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkillInput('');
      return;
    }
    setSkills((prev) => [...prev, trimmed]);
    setSkillInput('');
  };

  const handleKeyDownSkill = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    // If there is pending text in skillInput, add it first
    let finalSkills = [...skills];
    if (skillInput.trim()) {
      const trimmed = skillInput.trim();
      if (!finalSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
        finalSkills.push(trimmed);
      }
    }

    const res = await updateProfile({
      name: name.trim() || displayUser?.name,
      bio: bio.trim(),
      skills: finalSkills,
    });

    setIsSaving(false);

    if (res.success) {
      setProfile(res.user);
      setSkills(finalSkills);
      setSkillInput('');
      setIsEditing(false);
      setFeedback({ type: 'success', message: 'Profile updated successfully!' });
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message || 'Failed to update profile.' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold border border-purple-400/30">
          <Sparkles className="w-3.5 h-3.5" />
          Hacker Profile
        </div>

        {!isEditing && !loading && (
          <button
            onClick={handleStartEdit}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/30 text-white text-xs font-bold transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <Pencil className="w-3.5 h-3.5 text-purple-300" />
            <span>Edit Bio & Skills</span>
          </button>
        )}
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-medium animate-in fade-in duration-200 border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200'
              : 'bg-red-500/15 border-red-400/30 text-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {loading ? (
        <div className="glass-box rounded-3xl p-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : (
        <>
          {/* ── Profile Card ── */}
          <div className="glass-box rounded-3xl p-6 sm:p-8 space-y-6">

            {/* Avatar + Basic Details */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-500 to-pink-500 flex items-center justify-center text-2xl font-extrabold text-white shadow-lg shadow-purple-500/30 shrink-0">
                {displayUser?.avatar || displayUser?.name?.substring(0, 2).toUpperCase()}
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                {isEditing ? (
                  <div className="space-y-1.5 max-w-sm">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Display Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/20 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                ) : (
                  <h1 className="text-2xl font-extrabold text-white tracking-tight truncate">
                    {displayUser?.name}
                  </h1>
                )}

                <div className="flex items-center gap-2 text-slate-300 text-sm">
                  <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="truncate">{displayUser?.email}</span>
                </div>
                {displayUser?.createdAt && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>Member since {new Date(displayUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── EDIT FORM OR VIEW MODE ── */}
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-6 border-t border-white/10 pt-6">

                {/* Bio Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                      <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                      About You (Bio)
                    </label>
                    <span className={`text-[11px] font-mono ${bio.length > 280 ? 'text-amber-400' : 'text-slate-400'}`}>
                      {bio.length} / 300
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={300}
                    placeholder="Tell hackathon team leads and teammates about your developer background, technical passions, and what projects you want to build..."
                    className="w-full px-4 py-3 rounded-2xl bg-slate-900/80 border border-white/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all resize-none leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400">
                    Your bio is shown when you apply to squads or when other hackers check your profile.
                  </p>
                </div>

                {/* Skills Field */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                    <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                    Technical Skills & Expertise
                  </label>

                  {/* Active Skill Chips */}
                  <div className="flex flex-wrap gap-2 min-h-[38px] p-2.5 rounded-2xl bg-slate-900/60 border border-white/10">
                    {skills.length === 0 ? (
                      <p className="text-xs text-slate-500 italic p-1">No skills added yet. Type below or click recommendations.</p>
                    ) : (
                      skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-400/40 text-purple-200 shadow-sm"
                        >
                          <Tag className="w-3 h-3 text-purple-300" />
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="hover:text-pink-300 transition-colors p-0.5 rounded-full hover:bg-white/10"
                            title={`Remove ${skill}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Add Skill Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleKeyDownSkill}
                      placeholder="Add a skill (e.g. React, Python, Docker) and press Enter..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSkill()}
                      disabled={!skillInput.trim()}
                      className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Suggested Skills Suggestions */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-semibold text-slate-400">Popular Hackathon Skills (click to add):</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_SKILLS.map((suggested) => {
                        const alreadyAdded = skills.some((s) => s.toLowerCase() === suggested.toLowerCase());
                        return (
                          <button
                            key={suggested}
                            type="button"
                            onClick={() => (alreadyAdded ? handleRemoveSkill(suggested) : handleAddSkill(suggested))}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 border ${
                              alreadyAdded
                                ? 'bg-purple-500/30 text-purple-200 border-purple-400/40 shadow-sm'
                                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10 hover:border-purple-400/30'
                            }`}
                          >
                            {alreadyAdded ? <Check className="w-3 h-3 text-emerald-400" /> : <Plus className="w-3 h-3 text-slate-400" />}
                            <span>{suggested}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-[1.02] active:scale-[0.98] text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30 border border-purple-400/30 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Profile</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            ) : (
              /* ── VIEW MODE ── */
              <>
                {/* Bio Display */}
                <div className="border-t border-white/10 pt-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                      <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                      Bio
                    </div>
                    {!displayUser?.bio && (
                      <button
                        onClick={handleStartEdit}
                        className="text-xs text-purple-300 hover:text-white underline font-medium flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Bio
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {displayUser?.bio || (
                      <span className="text-slate-500 italic">No bio added yet. Click &ldquo;Edit Bio &amp; Skills&rdquo; above to tell your squad about your experience.</span>
                    )}
                  </p>
                </div>

                {/* Skills Display */}
                <div className="border-t border-white/10 pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                      <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                      Skills & Tech Stack
                    </div>
                    {(!displayUser?.skills || displayUser.skills.length === 0) && (
                      <button
                        onClick={handleStartEdit}
                        className="text-xs text-purple-300 hover:text-white underline font-medium flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Skills
                      </button>
                    )}
                  </div>

                  {displayUser?.skills?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {displayUser.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-400/30 text-purple-200 shadow-sm flex items-center gap-1.5"
                        >
                          <Tag className="w-3 h-3 text-purple-400" />
                          <span>{skill}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No skills added yet. Add your programming languages, frameworks, and developer tools.</p>
                  )}
                </div>
              </>
            )}

          </div>

          {/* Account Details Card */}
          <div className="glass-box rounded-3xl p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Role</p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-bold border border-purple-400/30">
                  <UserCircle className="w-3 h-3" />
                  {displayUser?.role === 'admin' ? 'Administrator' : 'Member'}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">User ID</p>
                <p className="text-xs text-slate-400 font-mono truncate">{displayUser?.id || displayUser?._id}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
