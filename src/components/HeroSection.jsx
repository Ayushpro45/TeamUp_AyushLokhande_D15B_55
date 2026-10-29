import React from 'react';
import { Users, Zap, Award, Target, ArrowRight, ShieldCheck, Sparkles, Code2, Compass } from 'lucide-react';

export default function HeroSection({ onNavigateDashboard, onNavigateLogin }) {
  const stats = [
    {
      id: 'stat-1',
      title: '98% Match Rate',
      subtitle: 'AI Skill Matrix Alignment',
      icon: Target,
      color: 'from-emerald-400 to-teal-500',
      badge: 'High Accuracy',
      animation: 'animate-float-slow',
      pos: 'top-4 -left-4 sm:-left-8 lg:-left-12',
    },
    {
      id: 'stat-2',
      title: '500+ Teams',
      subtitle: 'Formed Across 30+ Sprints',
      icon: Users,
      color: 'from-purple-400 to-indigo-500',
      badge: 'Active Community',
      animation: 'animate-float-medium',
      pos: 'top-12 -right-4 sm:-right-8 lg:-right-10',
    },
    {
      id: 'stat-3',
      title: '48hr Sprint Ready',
      subtitle: 'Instant Chat & Role Lock',
      icon: Zap,
      color: 'from-amber-400 to-orange-500',
      badge: 'Fast Track',
      animation: 'animate-float-reverse',
      pos: 'bottom-8 left-2 sm:left-6',
    },
    {
      id: 'stat-4',
      title: '12 Live Hackathons',
      subtitle: '$250k Prize Pools Open',
      icon: Award,
      color: 'from-pink-400 to-rose-500',
      badge: 'Global Events',
      animation: 'animate-float-slow',
      pos: 'bottom-4 right-2 sm:right-6',
    },
  ];

  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-pink-600/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-purple-200 text-xs sm:text-sm font-medium shadow-lg">
              <Sparkles className="w-4 h-4 text-purple-300 animate-spin" />
              <span>Next-Gen Hackathon Matchmaking</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
              Assemble Your <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-200 bg-clip-text text-transparent">
                Dream Team
              </span>{' '}
              in Seconds.
            </h1>

            {/* Body Copy - High Contrast Accessibility */}
            <p className="text-lg sm:text-xl text-slate-200 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Stop hacking solo. Connect with skilled developers, UI/UX designers, and AI specialists tailor-matched for your next hackathon project.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onNavigateDashboard}
                className="w-full sm:w-auto px-8 py-4 rounded-xl btn-primary text-base shadow-xl flex items-center justify-center gap-3 animate-pulse-glow focus:outline-none focus:ring-2 focus:ring-cyan-300"
              >
                <Compass className="w-5 h-5" />
                Find a Team Now
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onNavigateLogin}
                className="w-full sm:w-auto px-8 py-4 rounded-xl btn-secondary text-base flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <ShieldCheck className="w-5 h-5 text-purple-300" />
                Sign In to Post
              </button>
            </div>

            {/* Micro Specs */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-purple-400" />
                <span>React + Vite Stack</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Profiles</span>
              </div>
            </div>

          </div>

          {/* Right Column: Floating Translucent Glass Cards Visual */}
          <div className="lg:col-span-5 relative min-h-[420px] sm:min-h-[460px] flex items-center justify-center">
            
            {/* Center Glowing Hub Card — iridescent edge per Design.md §1.1 */}
            <div className="w-full max-w-sm rounded-3xl glass-box glass-iridescent p-6 shadow-2xl relative z-20 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/40">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Intruders Squad</h3>
                <p className="text-xs text-purple-200 font-medium">Cybersecurity & AI Defense</p>
              </div>

              {/* Roles needed badges */}
              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                <span className="px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/40 text-purple-100 text-xs font-semibold">
                  Fullstack Dev Needed
                </span>
                <span className="px-3 py-1 rounded-full bg-pink-500/30 border border-pink-400/40 text-pink-100 text-xs font-semibold">
                  Computer Vision
                </span>
              </div>

              <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs text-slate-200">
                <span>Team Capacity:</span>
                <span className="font-bold text-emerald-300">3 / 5 Members Locked</span>
              </div>
            </div>

            {/* Translucent Glass Stat Cards Floating Around Center Hub */}
            {stats.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.id}
                  className={`absolute ${item.pos} ${item.animation} z-30 hidden sm:block pointer-events-auto`}
                >
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3.5 sm:p-4 rounded-2xl shadow-xl flex items-center gap-3.5 hover:bg-white/20 transition-all duration-300 max-w-[210px]">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 shadow-md`}>
                      <IconComp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white tracking-wide">{item.title}</div>
                      <div className="text-[11px] text-slate-200 font-medium leading-tight">{item.subtitle}</div>
                    </div>
                  </div>
                </div>
              );
            })}

          </div>

        </div>
      </div>
    </section>
  );
}
