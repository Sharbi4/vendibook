import React, { createContext, useState } from 'react';
import PropTypes from 'prop-types';

const AppStatusContext = createContext(null);

export function AppStatusProvider({ children }) {
  const [isGlobalLoading, setGlobalLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  const value = {
    isGlobalLoading,
    globalError,
    setGlobalLoading,
    setGlobalError,
  };

  return <AppStatusContext.Provider value={value}>{children}</AppStatusContext.Provider>;
}

AppStatusProvider.propTypes = {
  children: PropTypes.node,
};
