import { NavLink } from "react-router-dom";

const MenuItem = ({ to, icon, title, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `
        group
        relative
        flex
        w-full
        items-center
        gap-3
        rounded-xl
        px-4
        py-3
        text-sm
        font-medium
        transition-all
        duration-200

        ${
          isActive
            ? `
              bg-gradient-to-r
              from-brand-500
              to-accent-500
              text-white
              shadow-lg
              shadow-brand-500/20
            `
            : `
              text-surface-300
              hover:bg-surface-800
              hover:text-brand-400
            `
        }
        `
      }
    >
      {({ isActive }) => (
        <>
          {/* ACTIVE INDICATOR */}
          <span
            className={`
              absolute
              left-0
              top-1/2
              h-7
              w-1
              -translate-y-1/2
              rounded-r-full
              bg-accent-400
              transition-all
              duration-200
              ${
                isActive
                  ? "opacity-100 shadow-[0_0_10px_rgba(103,232,249,0.7)]"
                  : "opacity-0"
              }
            `}
          />

          {/* ICON */}
          <span
            className={`
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              transition-all
              duration-200

              ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-surface-400 group-hover:bg-brand-500/10 group-hover:text-brand-400"
              }

              group-hover:scale-105
            `}
          >
            {icon}
          </span>

          {/* TITLE */}
          <span className="truncate">
            {title}
          </span>
        </>
      )}
    </NavLink>
  );
};

export default MenuItem;