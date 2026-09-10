export default function ProfilePreview({ profile, username }) {
  if (!profile) return null;

  return (
    <div className="w-full p-6 sm:p-7 glass-panel space-y-6 animate-fade-in transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4 min-w-0">
          {profile.avatar_url ? (
            <div className="relative shrink-0">
              <img
                src={profile.avatar_url}
                alt={profile.name || username}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border-2 border-[rgba(168,85,247,0.40)] object-cover shadow-[0_0_25px_rgba(109,40,168,0.35)]"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#A855F7] border-2 border-[#09030F] flex items-center justify-center shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-[rgba(63,13,99,0.50)] border border-[rgba(168,85,247,0.30)] flex items-center justify-center font-black text-xl text-[#A855F7] shadow-[0_0_20px_rgba(109,40,168,0.3)]">
              {(profile.login || username || 'G').charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
              {profile.name || profile.login}
            </h2>
            <p className="text-sm text-[#A855F7] font-mono font-semibold">
              @{profile.login || username}
            </p>
          </div>
        </div>

        {profile.html_url && (
          <a
            href={profile.html_url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#C4B5D4] hover:text-white bg-[rgba(63,13,99,0.30)] hover:bg-[rgba(109,40,168,0.45)] border border-[rgba(168,85,247,0.25)] hover:border-[rgba(168,85,247,0.50)] transition-all shadow-sm shrink-0"
          >
            <span>View GitHub</span>
            <svg className="w-3.5 h-3.5 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>

      {profile.bio && (
        <p className="text-sm text-[#C4B5D4] leading-relaxed max-w-2xl bg-[rgba(15,5,25,0.50)] p-4 rounded-xl border border-[rgba(168,85,247,0.15)]">
          {profile.bio}
        </p>
      )}

      {/* 3-Column Profile Stats */}
      <div className="grid grid-cols-3 gap-3 pt-1">
        <div className="p-4 rounded-xl glass-panel-subtle text-center space-y-1">
          <span className="block text-2xl sm:text-3xl font-black text-white font-mono">
            {profile.public_repos?.toLocaleString() ?? 0}
          </span>
          <span className="block text-[11px] font-bold text-[#C4B5D4] uppercase tracking-wider">
            Repositories
          </span>
        </div>

        <div className="p-4 rounded-xl glass-panel-subtle text-center space-y-1">
          <span className="block text-2xl sm:text-3xl font-black text-[#A855F7] font-mono">
            {profile.followers?.toLocaleString() ?? 0}
          </span>
          <span className="block text-[11px] font-bold text-[#C4B5D4] uppercase tracking-wider">
            Followers
          </span>
        </div>

        <div className="p-4 rounded-xl glass-panel-subtle text-center space-y-1">
          <span className="block text-2xl sm:text-3xl font-black text-white font-mono">
            {profile.following?.toLocaleString() ?? 0}
          </span>
          <span className="block text-[11px] font-bold text-[#C4B5D4] uppercase tracking-wider">
            Following
          </span>
        </div>
      </div>
    </div>
  );
}
