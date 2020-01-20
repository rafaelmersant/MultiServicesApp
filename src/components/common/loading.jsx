import React from "react";

const Loading = props => {
  return (
    <div
      className="spinner-border text-warning"
      style={{ width: "5rem", height: "5rem" }}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loading;
