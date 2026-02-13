import React from "react";

const Loading = ({ label = "Loading..." }) => {
  return (
    <div className="flex items-center gap-3 text-sm text-ink/60">
      <span className="h-3 w-3 animate-pulse rounded-full bg-sky" />
      {label}
    </div>
  );
};

export default Loading;
