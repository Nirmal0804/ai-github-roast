export default function ProfilePreview({ profile, username }) {
  if (!profile) return null;

  return (
    <div className="w-full p-6 sm:p-7 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl shadow-purple-950/10 space-y-6 animate-fade-in transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4 min-w-0">
          {profile.avatar_url ? (
            <div className="relative shrink-0">
              <img
                src={profile.avatar_url}
                alt={profile.name || username}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border-2 border-purple-500/30 object-cover shadow-lg shadow-purple-950/40"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xl text-purple-400">
              {(profile.login || username || 'G').charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight truncate">
              {profile.name || profile.login}
            </h2>
            <p className="text-sm text-purple-400 font-mono font-medium">
              @{profile.login || username}
            </p>
          </div>
        </div>

        {profile.html_url && (
          <a
            href={profile.html_url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-800 hover:text-white border border-slate-700/80 hover:border-purple-500/40 transition-all shadow-sm shrink-0"
          >
            <span>View GitHub</span>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>

      {profile.bio && (
        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
          {profile.bio}
        </p>
      )}

      {/* 3-Column Profile Stats */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
          <span className="block text-2xl font-black text-slate-100 font-mono">
            {profile.public_repos?.toLocaleString() ?? 0}
          </span>
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            Repositories
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
          <span className="block text-2xl font-black text-slate-100 font-mono">
            {profile.followers?.toLocaleString() ?? 0}
          </span>
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            Followers
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
          <span className="block text-2xl font-black text-slate-100 font-mono">
            {profile.following?.toLocaleString() ?? 0}
          </span>
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            Following
          </span>
        </div>
      </div>
    </div>
  );
}
