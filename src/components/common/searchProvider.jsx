import React, { useCallback, useEffect, useState } from "react";
import Input from "./input";
import { getProviderByName } from "../../services/providerService";
import { debounce } from "throttle-debounce";

const SearchProvider = (props) => {
  const [providers, setProviders] = useState([]);
  const [providerName, setProviderName] = useState(props.value);

  useEffect(() => {
    if (props.value) setProviderName(props.value);

    if (props.hide && props.clearSearchProvider) {
      setProviderName("");
      handleSearchProvider("");
    }
  }, [providerName, props]);

  const debounced = useCallback(
    debounce(400, (nextValue) => {
      handleSearchProvider(nextValue);
    }),
    []
  );

  const handleSelectProvider = (provider) => {
    setProviderName(`${provider.firstName} ${provider.lastName}`);
    props.onSelect(provider);
  };

  const handleSearchProvider = async (value) => {
    if (value.length >= 2) {
      const providerNameQuery = value.toUpperCase().split(" ").join("%20");

      let { data: _providers } = await getProviderByName(
        props.companyId,
        providerNameQuery
      );

      if (value === "" || value.length < 2) _providers = [];

      if (value.length > 2 && _providers.length === 0) {
        _providers = [
          {
            id: 0,
            firstName: "No existe el proveedor, desea crearlo?"
          },
        ];
      }

      setProviders(_providers);
    } else {
      setProviders([]);
    }
  };

  const handleChange = (event) => {
    const value = event.target.value;
    setProviderName(value);

    debounced(value);
  };

  const { onFocus, onBlur, hide, label = "" } = props;

  return (
    <div>
      <Input
        type="text"
        name="query"
        className="form-control my-3"
        placeholder="Buscar proveedor..."
        autoComplete="Off"
        onChange={(e) => handleChange(e)}
        onFocus={onFocus}
        onBlur={onBlur}
        value={providerName}
        label={label}
      />

      {providers.length > 0 && !hide && (
        <div
          className="list-group col-12 shadow bg-white position-absolute p-0"
          style={{ marginTop: "-15px", zIndex: "999", maxWidth: "600px" }}
        >
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleSelectProvider(provider)}
              className="list-group-item list-group-item-action w-100 py-2"
            >
              <span>{provider.firstName} {provider.lastName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchProvider;