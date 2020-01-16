import React from "react";

const Loading = props => {
  return (
    <div
      class="spinner-border text-warning"
      style={{ width: "5rem", height: "5rem" }}
      role="status"
    >
      <span class="sr-only">Loading...</span>
    </div>
  );
};

export default Loading;
