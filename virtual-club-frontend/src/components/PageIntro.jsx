import { motion } from "motion/react";

export default function PageIntro({ eyebrow, title, description, actions, children }) {
  return (
    <motion.header
      className="page-intro"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
      {children}
    </motion.header>
  );
}
