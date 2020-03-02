import React from "react";
import { NavLink } from "react-router-dom";

const NewButton = ({ label, to }) => {
  return (
    <NavLink className="btn btn-warning pull-right" to={to}>
      {label}
    </NavLink>
  );
};

export default NewButton;
