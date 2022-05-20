import React from "react";

const Input = ({ name, label, error, classForLabel, ...rest }) => {
  return (
    <div className="form-group">
      <label htmlFor={name} className={classForLabel}> {label} </label>
      <input {...rest} name={name} id={name} className="form-control form-control-sm" />
      {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
};

export default Input;
