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
        items-center
        gap-3
        w-full
        px-4
        py-3
        rounded-xl
        text-sm
        font-medium
        transition-all
        duration-200

        ${
          isActive
            ? `
              bg-gradient-to-r
              from-blue-600
              to-cyan-500
              text-white
              shadow-md
              shadow-blue-500/20
            `
            : `
              text-slate-600
              hover:bg-blue-50
              hover:text-blue-600
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
              -translate-y-1/2
              w-1
              h-7
              rounded-r-full
              bg-cyan-400
              transition-opacity
              duration-200
              ${isActive ? "opacity-100" : "opacity-0"}
            `}
          />

          {/* ICON */}
          <span
            className={`
              flex
              items-center
              justify-center
              w-9
              h-9
              rounded-lg
              shrink-0
              transition-all
              duration-200

              ${
                isActive
                  ? "bg-white/10"
                  : "group-hover:bg-white/70"
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