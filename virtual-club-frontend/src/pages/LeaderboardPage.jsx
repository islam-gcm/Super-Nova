import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Award, Medal, Sparkles, Trophy } from "lucide-react";
import { endpoints } from "../api/client";
import PageIntro from "../components/PageIntro";
import { EmptyState, ErrorState, LoadingState } from "../components/Feedback";
import { useAuth } from "../state/AuthContext";
import { errorMessage, initials } from "../lib/format";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    endpoints.leaderboard().then((response) => setEntries(response.data.leaderboard)).catch((requestError) => setError(errorMessage(requestError))).finally(() => setLoading(false));
  }, []);

  const icons = [Trophy, Medal, Award];
  return (
    <div className="workspace-page leaderboard-page">
      <PageIntro eyebrow="Club momentum" title="Leaderboard" description="Points come only from work approved by a task reviewer. Consistency matters more than noise." />
      {error ? <ErrorState message={error} /> : loading ? <LoadingState rows={7} /> : entries.length ? (
        <>
          <section className="podium">
            {entries.slice(0, 3).map((entry, index) => {
              const Icon = icons[index];
              return <motion.article className={`podium-place podium-${entry.rank}`} key={entry.memberId} initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}><Icon size={24} /><span className="podium-avatar">{initials(entry.fullName)}</span><strong>{entry.fullName}</strong><span>{entry.points} points</span><small>{entry.completedTasks} completed</small></motion.article>;
            })}
          </section>
          <section className="ranking-table" aria-label="Club leaderboard">
            <div className="table-head"><span>Rank</span><span>Member</span><span>Completed</span><span>Points</span></div>
            {entries.map((entry) => <motion.div className={`ranking-row ${String(entry.memberId) === String(user._id) ? "is-current-user" : ""}`} key={entry.memberId} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(entry.rank * 0.035, 0.5) }}><strong className="rank-number">{String(entry.rank).padStart(2, "0")}</strong><span className="ranking-member"><i>{initials(entry.fullName)}</i><span><strong>{entry.fullName}</strong>{String(entry.memberId) === String(user._id) && <small>You</small>}</span></span><span>{entry.completedTasks} tasks</span><strong className="ranking-points"><Sparkles size={15} />{entry.points}</strong></motion.div>)}
          </section>
        </>
      ) : <EmptyState icon={Trophy} title="The first points are still up for grabs" description="Approved task completions will build the leaderboard automatically." />}
    </div>
  );
}
