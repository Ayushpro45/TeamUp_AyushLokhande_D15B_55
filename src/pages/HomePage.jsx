import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import HeroSection from '../components/HeroSection';
import { UserCheck, Zap, Award, Layers, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function HomePage() {
  const { setActivePage, handleOpenTeamDetailsFromHome, teams } = useContext(AppContext);
  const steps = [
    {
      step: '01',
      title: 'Post or Discover Projects',
      description: 'Browse active hackathon teams seeking members or list your project vision with target roles.',
      icon: Layers,
    },
    {
      step: '02',
      title: 'Match Skills & Synergy',
      description: 'Filter candidates by frontend, backend, AI/ML, or design expertise with real-time match scores.',
      icon: UserCheck,
    },
    {
      step: '03',
      title: 'Sprint & Build',
      description: 'Lock in your roster, coordinate in team rooms, and execute 48-hour winning prototypes.',
      icon: Zap,
    },
  ];

  const featuredTeams = Array.isArray(teams) && teams.length > 0 ? teams.slice(0, 2) : [];

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section */}
      <HeroSection 
        onNavigateDashboard={() => setActivePage('dashboard')} 
        onNavigateLogin={() => setActivePage('login')} 
      />

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            How <span className="bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">TeamUp</span> Works
          </h2>
          <p className="text-slate-200 text-base sm:text-lg max-w-xl mx-auto">
            From solo idea to full-stack hackathon execution in three streamlined steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((item) => {
            const IconComp = item.icon;
            return (
              <div 
                key={item.step} 
                className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl relative hover:bg-white/15 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600/40 border border-purple-400/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <IconComp className="w-6 h-6 text-purple-200" />
                  </div>
                  <span className="text-3xl font-black text-white/30 tracking-widest">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-200 text-sm leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Live Projects Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 lg:p-12 relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold mb-3 border border-purple-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Spotlights
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Active Hackathon Squads</h2>
            </div>
            
            <button
              onClick={() => setActivePage('dashboard')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600/60 hover:bg-purple-600 text-white font-semibold text-sm transition-all border border-purple-400/30 shadow-lg"
            >
              View All Teams in Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredTeams.map((team, idx) => {
              const teamKey = team._id || team.id;
              const openRoles = Array.isArray(team.openRoles) ? team.openRoles : Array.isArray(team.roles) ? team.roles : [];
              const membersCount = Array.isArray(team.members) ? team.members.length : typeof team.members === 'string' ? team.members : 1;
              const maxMembers = team.maxMembers || 4;
              const gradient = idx % 2 === 0 ? 'from-purple-500/30 to-indigo-500/20' : 'from-emerald-500/30 to-teal-500/20';

              return (
                <div 
                  key={teamKey}
                  onClick={() => handleOpenTeamDetailsFromHome && handleOpenTeamDetailsFromHome(teamKey)}
                  className={`bg-gradient-to-br ${gradient} bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl cursor-pointer hover:border-white/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 space-y-4`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-purple-100">
                        {team.category || 'Hackathon Squad'}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-2">{team.title}</h3>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-emerald-100 text-xs font-bold">
                      {team.matchScore || '95%'} Match
                    </span>
                  </div>

                  <p className="text-slate-200 text-sm line-clamp-2">{team.tagline || team.description}</p>

                  <div className="pt-2 flex flex-wrap gap-2">
                    {openRoles.slice(0, 3).map((role, rIdx) => (
                      <span key={rIdx} className="px-2.5 py-1 rounded-lg bg-slate-900/50 text-purple-200 text-xs font-medium border border-white/10">
                        + {typeof role === 'string' ? role : role?.name || 'Contributor'}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-200 font-medium">
                    <span>Roster Status: {membersCount}/{maxMembers}</span>
                    <span className="text-purple-300 font-semibold flex items-center gap-1">
                      Join Team <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
}
