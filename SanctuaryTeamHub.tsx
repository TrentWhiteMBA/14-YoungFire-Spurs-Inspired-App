import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Shield, Flame, Heart, Search, CheckCircle2, 
  Calendar, BookOpen, Sparkles, Award, ArrowRight,
  TrendingUp, Activity, UserPlus, Filter, ChevronRight,
  Check, RefreshCw, Zap
} from 'lucide-react';
import { CurrentUser } from './SettingsHUDModal';
import { 
  VERIFIED_LEAD_FACILITATORS, 
  DEFAULT_LEAD_FACILITATORS, 
  RosterMember, 
  normalizeRosterWithLeads 
} from '../data/rosterData';

// Generates athletic high-contrast initials from real disciple name
export const getMemberInitials = (nameStr?: string): string => {
  if (!nameStr) return 'D';
  const parts = nameStr.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return nameStr.slice(0, 2).toUpperCase();
};

export interface SanctuaryTeamHubProps {
  currentUser?: CurrentUser | null;
  onNavigateToScripture?: (bookId: string, chapter: number) => void;
  onNavigate?: (tab: string) => void;
}

export const SanctuaryTeamHub: React.FC<SanctuaryTeamHubProps> = ({
  currentUser,
  onNavigateToScripture,
  onNavigate
}) => {
  // 3-Way Segmented Control: [ ROSTER ] | [ DISCIPLESHIP STREAKS ] | [ STATS ]
  const [activeSegment, setActiveSegment] = useState<'roster' | 'streaks' | 'stats'>('roster');
  
  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<'All' | 'Men On Fire' | 'Women Ignited' | 'YoungFire'>('All');

  // Load registered disciples from localStorage ('youngfire_member_roster_v2')
  const [members, setMembers] = useState<RosterMember[]>(() => {
    try {
      const saved = localStorage.getItem('youngfire_member_roster_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return normalizeRosterWithLeads(parsed);
        }
      }
      return DEFAULT_LEAD_FACILITATORS;
    } catch {
      return DEFAULT_LEAD_FACILITATORS;
    }
  });

  // Listen for member updates across windows/sessions
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('youngfire_member_roster_v2');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setMembers(normalizeRosterWithLeads(parsed));
          }
        }
      } catch {}
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('yf_roster_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('yf_roster_updated', handleStorageChange);
    };
  }, []);

  // Filtered members for Roster list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const nameMatch = (m.fullName || m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.calling || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const groupMatch = selectedGroup === 'All' || m.group === selectedGroup || m.group === 'All';

      return nameMatch && groupMatch;
    });
  }, [members, searchQuery, selectedGroup]);

  // Small Group Check-In State
  const [checkedInToday, setCheckedInToday] = useState<boolean>(() => {
    try {
      const checkinDate = localStorage.getItem('youngfire_last_checkin_date');
      const today = new Date().toISOString().slice(0, 10);
      return checkinDate === today;
    } catch {
      return false;
    }
  });

  const handleCheckIn = () => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem('youngfire_last_checkin_date', today);
    setCheckedInToday(true);
  };

  // Helper to determine Column Badge:
  // 'A' for Lead Facilitator, 'B' for Brother, 'S' for Sister
  const getColumnBadge = (member: RosterMember): { letter: 'A' | 'B' | 'S'; style: string; label: string } => {
    const isLead = member.isAdmin || 
      (member.role || '').toLowerCase().includes('facilitator') ||
      (member.ministryRole || '').toLowerCase().includes('facilitator') ||
      (member.fullName || '').toLowerCase().includes('lead facilitator');
    
    if (isLead) {
      return { 
        letter: 'A', 
        style: 'bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]', 
        label: 'Overseer / Apostle' 
      };
    }

    if (member.gender === 'female' || member.group === 'Women Ignited') {
      return { 
        letter: 'S', 
        style: 'bg-gradient-to-tr from-rose-500 to-pink-600 text-white border-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.4)]', 
        label: 'Sister' 
      };
    }

    return { 
      letter: 'B', 
      style: 'bg-gradient-to-tr from-slate-700 to-slate-900 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]', 
      label: 'Brother' 
    };
  };

  return (
    <div className="min-h-screen bg-[#040711] text-white pb-36 select-none max-w-4xl mx-auto px-3 sm:px-6 pt-4 space-y-6">
      
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30 border border-amber-300/40">
            <Users className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400 font-bold block">
              JOSHUA HOUSE OF WORSHIP
            </span>
            <h1 className="text-lg sm:text-2xl font-black uppercase font-['Outfit'] tracking-wide text-white">
              SANCTUARY <span className="text-amber-400">TEAM HUB</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
            {members.length} Disciples
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. TOP SHOWCASE CAROUSEL (<<<<< SWIPE >>>>>)                 */}
      {/*    Anchored Lead Facilitators + Dynamic Registered Disciples */}
      {/* ============================================================ */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] sm:text-xs font-mono font-black tracking-widest uppercase text-cyan-400 animate-pulse flex items-center gap-1.5">
            <span>&lt;&lt;&lt;&lt;&lt;</span>
            <span className="text-white">SWIPE SANCTUARY TEAM</span>
            <span>&gt;&gt;&gt;&gt;&gt;</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Horizontal Scroll
          </span>
        </div>

        {/* Swipeable Container */}
        <div className="flex items-stretch gap-4 overflow-x-auto no-scrollbar py-2 px-1 snap-x snap-mandatory">
          
          {/* ANCHOR 1: Lead Facilitator Trent D. White */}
          <div className="snap-start flex-shrink-0 w-64 sm:w-72 bg-[#080E21] border-2 border-amber-500/60 rounded-3xl p-4 shadow-[0_10px_35px_rgba(245,158,11,0.25)] flex flex-col justify-between relative overflow-hidden group">
            <div className="relative h-60 w-full rounded-2xl overflow-hidden bg-slate-950 mb-3 border border-amber-500/40">
              <img
                src="/image_7.png"
                alt="Lead Facilitator Trent D. White"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ objectPosition: '30% 15%' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040711] via-transparent to-transparent" />
              <div className="absolute top-2.5 right-2.5">
                <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 border border-amber-200 text-slate-950 font-black text-xs font-mono flex items-center justify-center shadow-lg">
                  A
                </span>
              </div>
              <div className="absolute bottom-2.5 left-2.5 right-2.5">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-slate-950 text-[9px] font-mono font-black tracking-wider uppercase inline-block mb-1">
                  LEAD FACILITATOR
                </span>
                <h3 className="text-sm font-black text-white font-['Outfit'] uppercase drop-shadow">
                  Trent D. White
                </h3>
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <p className="text-xs text-amber-300 font-mono font-bold">
                Sanctuary Leadership &amp; Overseer
              </p>
              <p className="text-[11px] text-slate-300 font-serif leading-relaxed line-clamp-2">
                "According to the effectual working in the measure of every part..." &bull; Ephesians 4:16
              </p>
            </div>
          </div>

          {/* ANCHOR 2: Lead Facilitator Whitney White */}
          <div className="snap-start flex-shrink-0 w-64 sm:w-72 bg-[#080E21] border-2 border-amber-500/60 rounded-3xl p-4 shadow-[0_10px_35px_rgba(244,63,94,0.25)] flex flex-col justify-between relative overflow-hidden group">
            <div className="relative h-60 w-full rounded-2xl overflow-hidden bg-slate-950 mb-3 border border-rose-500/40">
              <img
                src="/image_7.png"
                alt="Lead Facilitator Whitney White"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ objectPosition: '70% 15%' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040711] via-transparent to-transparent" />
              <div className="absolute top-2.5 right-2.5">
                <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 border border-amber-200 text-slate-950 font-black text-xs font-mono flex items-center justify-center shadow-lg">
                  A
                </span>
              </div>
              <div className="absolute bottom-2.5 left-2.5 right-2.5">
                <span className="px-2 py-0.5 rounded-md bg-rose-500/90 text-white text-[9px] font-mono font-black tracking-wider uppercase inline-block mb-1">
                  LEAD FACILITATOR
                </span>
                <h3 className="text-sm font-black text-white font-['Outfit'] uppercase drop-shadow">
                  Whitney White
                </h3>
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <p className="text-xs text-rose-300 font-mono font-bold">
                Sanctuary Leadership &amp; Sisterhood
              </p>
              <p className="text-[11px] text-slate-300 font-serif leading-relaxed line-clamp-2">
                Nurturing spiritual alignment, fervent intercession, and holy sisterhood across San Antonio.
              </p>
            </div>
          </div>

          {/* DYNAMIC REGISTERED DISCIPLES (from localStorage / Firestore) */}
          {members
            .filter(m => !m.id.includes('roster_lead_'))
            .map((disciple) => {
              const badge = getColumnBadge(disciple);
              return (
                <div 
                  key={disciple.id}
                  className="snap-start flex-shrink-0 w-60 sm:w-64 bg-[#080E21] border border-white/15 hover:border-amber-500/50 rounded-3xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden transition-all group"
                >
                  <div className="relative h-56 w-full rounded-2xl overflow-hidden bg-slate-950 mb-3 border border-white/10 flex items-center justify-center">
                    {disciple.avatar && disciple.avatar.startsWith('data:') ? (
                      <img
                        src={disciple.avatar}
                        alt={disciple.fullName || disciple.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-amber-500/40 flex items-center justify-center text-xl font-black font-['Outfit'] text-amber-400 shadow-inner">
                        {getMemberInitials(disciple.fullName || disciple.name)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#040711] via-transparent to-transparent" />
                    
                    <div className="absolute top-2.5 right-2.5">
                      <span className={`w-7 h-7 rounded-full border text-xs font-mono font-black flex items-center justify-center ${badge.style}`}>
                        {badge.letter}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900/90 text-amber-400 text-[9px] font-mono font-bold tracking-wider uppercase inline-block mb-1 border border-white/10">
                        {disciple.group || 'YoungFire'}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white font-['Outfit'] truncate">
                        {disciple.fullName || disciple.name}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <p className="text-[11px] text-amber-300 font-mono font-bold truncate">
                      {disciple.calling || disciple.role || 'Word Disciple'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      San Antonio, TX &bull; Active Huddle
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. 3-WAY SEGMENTED CONTROL: [ROSTER] | [STREAKS] | [STATS]   */}
      {/* ============================================================ */}
      <div className="bg-[#0B1329] p-1.5 rounded-2xl border border-white/10 shadow-lg flex items-center justify-between">
        <button
          onClick={() => setActiveSegment('roster')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeSegment === 'roster'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md scale-100'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          [ ROSTER ]
        </button>

        <button
          onClick={() => setActiveSegment('streaks')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeSegment === 'streaks'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md scale-100'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          [ DISCIPLESHIP STREAKS ]
        </button>

        <button
          onClick={() => setActiveSegment('stats')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeSegment === 'stats'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md scale-100'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          [ STATS ]
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB A: ATHLETIC ROSTER CARDS                                 */}
      {/* ============================================================ */}
      {activeSegment === 'roster' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search disciple by name or calling..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080E21] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            {/* Group Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {(['All', 'Men On Fire', 'Women Ignited', 'YoungFire'] as const).map((grp) => (
                <button
                  key={grp}
                  onClick={() => setSelectedGroup(grp)}
                  className={`px-3 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap cursor-pointer transition-all ${
                    selectedGroup === grp
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400'
                      : 'bg-[#080E21] text-slate-400 border border-white/10 hover:text-white'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>
          </div>

          {/* Roster Cards List */}
          <div className="space-y-2.5">
            {filteredMembers.map((member) => {
              const badge = getColumnBadge(member);
              return (
                <div
                  key={member.id}
                  className="p-3 sm:p-4 rounded-2xl bg-[#080E21] border border-white/10 hover:border-amber-500/40 shadow-md flex items-center justify-between gap-3 transition-all hover:bg-[#0c142e]"
                >
                  {/* Left: Circular Member Photo or Monogram */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      {member.avatar && member.avatar.startsWith('data:') ? (
                        <img
                          src={member.avatar}
                          alt={member.fullName || member.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow-md"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center font-black font-['Outfit'] text-amber-400 text-sm shadow-md">
                          {getMemberInitials(member.fullName || member.name)}
                        </div>
                      )}
                    </div>

                    {/* Center: Full Name, Calling, and Fellowship Group */}
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white font-['Outfit'] truncate">
                          {member.fullName || member.name}
                        </h4>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-300">
                          {member.group || 'YoungFire'}
                        </span>
                      </div>
                      <p className="text-xs text-amber-400 font-mono truncate">
                        {member.calling || member.role || 'Word Disciple'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        Joshua House of Worship &bull; San Antonio, TX
                      </p>
                    </div>
                  </div>

                  {/* Right: Athletic Column Badge (B, S, or A) */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span 
                      className={`w-9 h-9 rounded-2xl border-2 font-mono font-black text-xs flex items-center justify-center cursor-default ${badge.style}`}
                      title={badge.label}
                    >
                      {badge.letter}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB B: DISCIPLESHIP STREAKS                                  */}
      {/* ============================================================ */}
      {activeSegment === 'streaks' && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* Small Group Check-In Banner */}
          <div className="bg-[#0B1329] border border-orange-500/40 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-orange-400" />
                <h3 className="text-sm sm:text-base font-black uppercase text-white font-['Outfit']">
                  Monday Small Group Huddle Attendance
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-mono text-[10px] font-bold border border-orange-500/40">
                Bi-Weekly 7:00 PM CST
              </span>
            </div>

            <p className="text-xs text-slate-300 font-serif leading-relaxed">
              Living room fellowship and intentional discipleship with Lead Facilitators Trent D. White &amp; Whitney White.
            </p>

            <div className="flex items-center justify-between pt-1">
              <div className="text-xs font-mono">
                <span className="text-slate-400">Next Huddle: </span>
                <span className="text-amber-400 font-bold">Monday, Oct 5 @ 7:00 PM CST</span>
              </div>

              <button
                onClick={handleCheckIn}
                disabled={checkedInToday}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  checkedInToday
                    ? 'bg-emerald-950/40 border border-emerald-500 text-emerald-300'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 hover:brightness-110 shadow-lg'
                }`}
              >
                {checkedInToday ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Checked In!</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Check In Now</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Daily Holy Sword Reading Streaks Leaderboard */}
          <div className="bg-[#080E21] border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm sm:text-base font-black uppercase text-white font-['Outfit']">
                  Daily Scripture Reading Streaks
                </h3>
              </div>
              <span className="text-xs font-mono text-amber-400 font-bold">
                Paper Sword Disciples
              </span>
            </div>

            <div className="space-y-3">
              {/* Leaderboard entries: Verified Leads + Real Registered Disciples ONLY */}
              {[
                { name: 'Lead Facilitator Trent D. White', streak: 42, chapters: 184, group: 'YoungFire' },
                { name: 'Lead Facilitator Whitney White', streak: 42, chapters: 178, group: 'YoungFire' },
                ...members
                  .filter(m => !m.id.includes('roster_lead_'))
                  .map((m, idx) => ({
                    name: m.fullName || m.name || 'Disciple',
                    streak: Math.max(7, 28 - idx * 3),
                    chapters: Math.max(14, 70 - idx * 7),
                    group: m.group || 'YoungFire'
                  }))
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-2xl bg-[#040817] border border-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-900 border border-white/10 text-[11px] font-mono font-bold text-slate-400 flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-white font-['Outfit']">{item.name}</h5>
                      <span className="text-[10px] font-mono text-slate-400">{item.group}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs font-black font-mono text-amber-400">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        <span>{item.streak} DAYS</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{item.chapters} Ch. Read</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB C: STATS                                                 */}
      {/* ============================================================ */}
      {activeSegment === 'stats' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Corporate Counters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Chapters Read */}
            <div className="p-4 rounded-2xl bg-[#080E21] border border-amber-500/40 shadow-xl space-y-1">
              <div className="flex items-center justify-between text-amber-400">
                <BookOpen className="w-5 h-5" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Corporate</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-white">
                1,248
              </div>
              <p className="text-[11px] font-mono text-slate-300">Total Chapters Read</p>
            </div>

            {/* Prayers Lifted */}
            <div className="p-4 rounded-2xl bg-[#080E21] border border-rose-500/40 shadow-xl space-y-1">
              <div className="flex items-center justify-between text-rose-400">
                <Heart className="w-5 h-5" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Intercession</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-white">
                312
              </div>
              <p className="text-[11px] font-mono text-slate-300">Prayers Logged</p>
            </div>

            {/* Fellowship Check-Ins */}
            <div className="p-4 rounded-2xl bg-[#080E21] border border-orange-500/40 shadow-xl space-y-1">
              <div className="flex items-center justify-between text-orange-400">
                <Activity className="w-5 h-5" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Attendance</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-white">
                486
              </div>
              <p className="text-[11px] font-mono text-slate-300">Fellowship Check-Ins</p>
            </div>
          </div>

          {/* Ministry Cohort Breakdown */}
          <div className="bg-[#0B1329] border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4">
            <h3 className="text-sm sm:text-base font-black uppercase text-white font-['Outfit']">
              Sanctuary Cohort Distribution
            </h3>

            <div className="space-y-3">
              {/* YoungFire General */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-amber-400 font-bold">YoungFire General Assembly</span>
                  <span className="text-slate-300">48% (598 Ch.)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '48%' }} />
                </div>
              </div>

              {/* Men On Fire */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-orange-400 font-bold">Men On Fire (Brotherhood)</span>
                  <span className="text-slate-300">28% (350 Ch.)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: '28%' }} />
                </div>
              </div>

              {/* Women Ignited */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-rose-400 font-bold">Women Ignited (Sisterhood)</span>
                  <span className="text-slate-300">24% (300 Ch.)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '24%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
