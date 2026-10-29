import { motion } from "motion/react";
import { ArrowRight, CalendarClock, Globe2, LogOut, Send, Users } from "lucide-react";
import { StatusBadge } from "./Feedback";
import { timeUntil } from "../lib/format";

export default function TaskCard({ task, assignment, onClaim, onLeave, onSubmit, busy }) {
  const count = task.assignedCount || 0;
  const capacity = task.maxAssignees || 1;
  const fill = Math.min(100, (count / capacity) * 100);
  const canClaim = !assignment && task.status === "open" && new Date(task.deadline) > new Date();
  const isClaimed = assignment?.status === "claimed";

  return (
    <motion.article className="task-card" layout whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <div className="task-card-top">
        <span className={`task-scope scope-${task.type}`}>{task.type === "global" ? <Globe2 size={14} /> : <Users size={14} />}{task.type === "global" ? "All club" : task.department?.name || "Department"}</span>
        <StatusBadge status={assignment?.status || task.status} />
      </div>
      <div className="task-copy">
        <h3>{task.title}</h3>
        <p>{task.description}</p>
      </div>
      <div className="task-metrics">
        <span><CalendarClock size={16} /><strong>{timeUntil(task.deadline)}</strong></span>
        <span><Users size={16} /><strong>{count}/{capacity} claimed</strong></span>
        <span className="points-value">+{task.points} pts</span>
      </div>
      <div className="capacity-track"><span style={{ width: `${fill}%` }} /></div>
      {task.notes && <p className="task-note">{task.notes}</p>}
      <div className="task-actions">
        {canClaim && <button className="button button-primary button-small" disabled={busy} onClick={() => onClaim(task)}>Claim task <ArrowRight size={15} /></button>}
        {isClaimed && <button className="button button-primary button-small" onClick={() => onSubmit(task, assignment)}>Submit work <Send size={15} /></button>}
        {isClaimed && <button className="button button-quiet button-small" disabled={busy} onClick={() => onLeave(task)}><LogOut size={15} /> Leave</button>}
        {assignment?.status === "submitted" && <span className="task-waiting">Submission awaiting review</span>}
        {!canClaim && !assignment && task.status !== "open" && <span className="task-waiting">No open places</span>}
      </div>
    </motion.article>
  );
}
