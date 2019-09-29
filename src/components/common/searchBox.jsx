import React from "react";
import Input from "./input";

const SearchBox = ({ value, onChange, placeholder }) => {
  return (
    <Input
      type="text"
      name="query"
      className="form-control my-3"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.currentTarget.value)}
    />
  );
};

export default SearchBox;
