import React, { useState, useEffect, useContext } from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, Loader2, Lock } from 'lucide-react';
import { useForm } from '../hooks/useForm';
import { useAuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';

// ─── Validation rules ─────────────────────────────────────────────────────────
const createTeamRules = {
  title: (v) => {
    if (!v || !v.trim()) return 'Project title is required';
    if (v.trim().length < 3) return 'Title must be at least 3 characters';
    return null;
  },
  hackathonName: (v) => {
    if (!v || !v.trim()) return 'Hackathon name is required';
    return null;
  },
  tagline: (v) => {
    if (!v || !v.trim()) return 'Tagline / vision is required';
    if (v.trim().length < 10) return 'Tagline must be at least 10 characters';
    return null;
  },
  roles: (v) => {
    if (!v || !v.trim()) return 'At least one required role is needed';
    return null;
  },
};

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </p>
  );
}

const CATEGORIES = [
  'AI / ML',
  'AI / Sustainability',
  'AR/VR / Health',
  'Web3 / Blockchain',
  'DevTools / Open Source',
  'HealthTech',
  'Sustainability',
  'FinTech',
];

export default function CreateTeamModal({ onClose, onCreateTeam }) {
  const [created, setCreated] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const { user, isLoggedIn } = useAuthContext();
  const { setActivePage } = useContext(AppContext);

  // Close on ESC key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm(
    {
      title: '',
      hackathonName: '',
      tagline: '',
      category: 'AI / ML',
      roles: '',
      maxMembers: 4,
    },
    createTeamRules
  );

  const onSubmit = async (vals) => {
    setSubmitError(null);

    const rolesList = vals.roles
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    const newTeam = {
      title: vals.title.trim(),
      hackathonName: vals.hackathonName.trim(),
      tagline: vals.tagline.trim(),
      category: vals.category,
      membersCount: 1,
      maxMembers: Number(vals.maxMembers),
      matchScore: '99%',
      rolesNeeded: rolesList.length > 0 ? rolesList : ['Fullstack Dev', 'UI/UX Designer'],
      leaderName: user?.name || 'You (Team Lead)',
      leaderAvatar: user?.avatar || user?.name?.substring(0, 2).toUpperCase() || 'TU',
      description: vals.tagline.trim(),
    };

    const res = await onCreateTeam(newTeam);
    if (res?.success) {
      setCreated(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setSubmitError(res?.message || 'Failed to publish team. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-xl bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8 relative space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto">

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 border border-white/20 text-slate-300 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-purple-400"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!isLoggedIn ? (
          /* Sign-in required guard */
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center mx-auto text-purple-300 shadow-xl shadow-purple-900/30">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-2xl font-bold text-white">Sign In Required</h4>
              <p className="text-sm text-slate-300 max-w-sm mx-auto">
                You must be signed in to list a project on TeamUp. Your account will automatically be linked as the team leader.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-sm font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActivePage('login');
                }}
                className="px-6 py-2.5 rounded-xl btn-primary font-bold text-sm shadow-xl shadow-purple-600/30 transition-all"
              >
                Sign In / Register
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Create Hackathon Team
              </h3>
              <p className="text-sm text-slate-200">
                Listing as <strong className="text-purple-300">{user?.name}</strong> ({user?.email})
              </p>
            </div>

            {submitError && (
              <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-400/40 text-red-200 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-300" />
                <span>{submitError}</span>
              </div>
            )}

            {created ? (
              <div className="py-8 text-center space-y-2 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-white">Team Published!</h4>
                <p className="text-xs text-emerald-100">Saved to database and visible on dashboard…</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

                {/* Project Title */}
                <div className="space-y-1.5">
                  <label htmlFor="ct-title" className="block text-xs font-bold text-slate-100">
                    Project Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="ct-title"
                    name="title"
                    type="text"
                    value={values.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. Neural-Sync"
                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all ${
                      touched.title && errors.title ? 'border-red-400/70' : 'border-white/20'
                    }`}
                  />
                  {touched.title && <FieldError message={errors.title} />}
                </div>

                {/* Hackathon Name */}
                <div className="space-y-1.5">
                  <label htmlFor="ct-hackathon" className="block text-xs font-bold text-slate-100">
                    Hackathon Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="ct-hackathon"
                    name="hackathonName"
                    type="text"
                    list="hackathon-options"
                    value={values.hackathonName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. Smart India Hackathon (SIH), Global AI Sprint…"
                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all ${
                      touched.hackathonName && errors.hackathonName ? 'border-red-400/70' : 'border-white/20'
                    }`}
                  />
                  <datalist id="hackathon-options">
                    <option value="Global AI Sprint" />
                    <option value="EcoTech Global Hack" />
                    <option value="ETH Global Hackathon" />
                    <option value="Smart India Hackathon (SIH)" />
                  </datalist>
                  {touched.hackathonName && <FieldError message={errors.hackathonName} />}
                </div>

                {/* Tagline */}
                <div className="space-y-1.5">
                  <label htmlFor="ct-tagline" className="block text-xs font-bold text-slate-100">
                    Tagline / Vision <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="ct-tagline"
                    name="tagline"
                    type="text"
                    value={values.tagline}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. Real-time EEG brainwave signal processing for collaborative VR"
                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all ${
                      touched.tagline && errors.tagline ? 'border-red-400/70' : 'border-white/20'
                    }`}
                  />
                  {touched.tagline && <FieldError message={errors.tagline} />}
                </div>

                {/* Category + Team Size */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="ct-category" className="block text-xs font-bold text-slate-100">Category</label>
                    <select
                      id="ct-category"
                      name="category"
                      value={values.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="ct-maxMembers" className="block text-xs font-bold text-slate-100">
                      Target Team Size
                    </label>
                    <input
                      id="ct-maxMembers"
                      name="maxMembers"
                      type="number"
                      min={2}
                      max={6}
                      value={values.maxMembers}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                </div>

                {/* Required Roles */}
                <div className="space-y-1.5">
                  <label htmlFor="ct-roles" className="block text-xs font-bold text-slate-100">
                    Required Roles (comma-separated) <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="ct-roles"
                    name="roles"
                    type="text"
                    value={values.roles}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. PyTorch Engineer, Frontend Dev, 3D Modeler"
                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all ${
                      touched.roles && errors.roles ? 'border-red-400/70' : 'border-white/20'
                    }`}
                  />
                  {touched.roles && <FieldError message={errors.roles} />}
                  {values.roles && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {values.roles.split(',').map((r) => r.trim()).filter(Boolean).map((role) => (
                        <span
                          key={role}
                          className="px-2.5 py-0.5 rounded-full bg-purple-600/30 border border-purple-400/30 text-purple-200 text-[11px] font-medium"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-bold text-sm shadow-xl shadow-purple-600/30 hover:scale-[1.01] transition-all border border-purple-400/30 focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publishing…
                    </>
                  ) : (
                    'Publish Team Listing'
                  )}
                </button>
              </form>
            )}
          </>
        )}

      </div>
    </div>
  );
}
