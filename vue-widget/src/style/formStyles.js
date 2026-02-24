export const colors = {
  primary: 'var(--main-primary)',
  primaryLighter: 'var(--main-primary--10)',
  primaryDarker: 'var(--main-primary)',
  accent: 'var(--main-primary)',
  accentLighter: 'var(--extra-three--10)',
  accentDarker: 'var(--main-primary)',
  warn: 'var(--extra-two)',
  warnLighter: 'var(--extra-two--10)',
  warnDarker: 'var(--extra-two)',
  text: 'var(--black)',
  textLight: 'var(--arsenic)',
  textDisabled: 'var(--manatee)',
  outline: 'var(--chinese-silver)',
  background: 'var(--white)',
  backgroundDisabled: 'var(--cultured)'
};

const baseStyles = {
  container: {
    position: 'relative',
    marginBottom: '0px',
    width: '100%',
    fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
    overflow: 'visible'
  },
  fieldContainer: {
    position: 'relative',
    display: 'flex',
    width: '100%'
  },
  wrapper: {
    position: 'relative',
    flex: '1',
    width: '100%'
  },
  input: {
    width: '100%',
    height: '100%',
    padding: '16px 12px 4px',
    fontSize: '16px',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    caretColor: colors.accent,
    color: colors.text,
    zIndex: '1',
    position: 'relative'
  },
  label: {
    position: 'absolute',
    left: '12px',
    color: colors.textLight,
    pointerEvents: 'none',
    transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1), background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), padding 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    transformOrigin: 'left top',
    zIndex: '2',
    fontSize: '16px'
  },
  outline: {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    display: 'flex',
    pointerEvents: 'none',
    boxSizing: 'border-box',
    zIndex: '0'
  },
  prefix: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 12px',
    color: colors.textLight,
    zIndex: '1'
  },
  suffix: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 12px',
    color: colors.textLight,
    zIndex: '1',
    cursor: 'pointer'
  },
  icon: {
    fontSize: '20px'
  },
  subscript: {
    display: 'flex',
    justifyContent: 'space-between',
    minHeight: '20px',
    padding: '0 12px',
    marginTop: '4px'
  },
  error: {
    color: colors.warn,
    fontSize: '12px'
  },
  hint: {
    color: colors.textLight,
    fontSize: '12px'
  },
  counter: {
    color: colors.textLight,
    fontSize: '12px',
    marginLeft: 'auto'
  }
};

export const inputStyles = {
  ...baseStyles,
  fieldContainer: {
    ...baseStyles.fieldContainer,
    alignItems: 'center',
    height: '48px',
    overflow: 'visible'
  },
  wrapper: {
    ...baseStyles.wrapper,
    height: '48px',
    overflow: 'visible'
  },
  input: {
    ...baseStyles.input,
    resize: 'none'
  },
  label: {
    ...baseStyles.label,
    top: '12px',
    whiteSpace: 'nowrap'
  },
  prefix: {
    ...baseStyles.prefix,
    height: '48px'
  },
  suffix: {
    ...baseStyles.suffix,
    height: '48px'
  }
};

export const textareaStyles = {
  ...baseStyles,
  fieldContainer: {
    ...baseStyles.fieldContainer,
    alignItems: 'flex-start',
    minHeight: '56px'
  },
  wrapper: {
    ...baseStyles.wrapper,
    minHeight: '56px'
  },
  input: {
    ...baseStyles.input,
    minHeight: '100px',
    resize: 'vertical'
  },
  label: {
    ...baseStyles.label,
    top: '20px'
  },
  prefix: {
    ...baseStyles.prefix,
    height: '56px'
  },
  suffix: {
    ...baseStyles.suffix,
    height: '56px'
  }
};

export const selectStyles = {
  ...baseStyles,
  fieldContainer: {
    ...baseStyles.fieldContainer,
    alignItems: 'center',
    height: '48px',
    overflow: 'visible',
    cursor: 'pointer'
  },
  wrapper: {
    ...baseStyles.wrapper,
    height: '48px',
    overflow: 'visible',
    display: 'flex',
    alignItems: 'center'
  },
  selectDisplay: {
    width: '100%',
    height: '100%',
    padding: '10px 12px 12px',
    fontSize: '16px',
    background: 'transparent',
    border: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    color: colors.text,
    zIndex: '1',
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  placeholder: {
    color: colors.textLight,
    userSelect: 'none'
  },
  selectedValue: {
    color: colors.text,
    userSelect: 'none',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 'calc(100% - 24px)'
  },
  label: {
    ...baseStyles.label,
    top: '10px',
    whiteSpace: 'nowrap'
  },
  prefix: {
    ...baseStyles.prefix,
    height: '48px'
  },
  suffix: {
    ...baseStyles.suffix,
    height: '48px'
  },
  dropdownIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '48px',
    padding: '0 8px',
    color: colors.textLight,
    position: 'absolute',
    right: '0',
    top: '0',
    zIndex: '1',
    transition: 'transform 0.2s ease'
  },
  dropdown: {
    position: 'absolute',
    top: '52px',
    left: '0',
    width: '100%',
    maxHeight: '300px',
    backgroundColor: colors.background,
    boxShadow: '0 2px 4px -1px rgba(0,0,0,.2), 0 4px 5px 0 rgba(0,0,0,.14), 0 1px 10px 0 rgba(0,0,0,.12)',
    borderRadius: '4px',
    zIndex: '100',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  actionBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    borderBottom: '1px solid rgba(0,0,0,0.12)',
    position: 'sticky',
    top: '0',
    backgroundColor: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(4px)'
  },
  actionButton: {
    padding: '8px 16px',
    fontSize: '14px',
    color: colors.accent,
    background: 'none',
    border: 'none',
    cursor: 'pointer'
  },
  searchContainer: {
    borderBottom: '1px solid rgba(0,0,0,0.12)',
    position: 'sticky',
    top: '0',
    backdropFilter: 'blur(4px)'
  },
  searchInput: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent'
  },
  optionsList: {
    overflow: 'auto',
    maxHeight: '250px'
  },
  option: {
    padding: '12px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.15s ease',
    zIndex: '9999'
  },
  selectedOption: {
    backgroundColor: colors.accentLighter,
    color: colors.accent
  },
  checkbox: {
    width: '18px',
    height: '18px',
    border: '2px solid ' + colors.textLight,
    borderRadius: '2px',
    marginRight: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkboxSelected: {
    width: '10px',
    height: '10px',
    backgroundColor: colors.accent,
    borderRadius: '1px'
  }
};

export const getInputLabelFloatStyles = (hasError, isActive, backgroundColor) => ({
  transform: 'translateY(-18px) scale(0.9)',
  color: hasError ? colors.warn : colors.accent,
  backgroundColor: backgroundColor,
  padding: '1px -8px 0 2px',
  margin: '0 -8px 0 4px',
  fontSize: '14px',
  lineHeight: '12px',
  zIndex: '30',
  left: '16px',
  whiteSpace: 'nowrap',
  borderRadius: '2px'
});

export const getTextareaLabelFloatStyles = (hasError, isActive, backgroundColor) => ({
  transform: 'translateY(-28px) scale(0.9)',
  color: hasError ? colors.warn : colors.accent,
  backgroundColor: backgroundColor,
  padding: '0 2px 0 2px',
  margin: '0 2px 0 4px',
  fontSize: '14px',
  zIndex: '2',
  left: '16px'
});

export const getSelectLabelFloatStyles = (hasError, isActive, backgroundColor) => ({
  transform: 'translateY(-18px) scale(0.9)',
  color: hasError ? colors.warn : colors.accent,
  backgroundColor: backgroundColor,
  padding: '1px -14px 0 2px',
  margin: '0 -8px 0 8px',
  fontSize: '14px',
  lineHeight: '12px',
  zIndex: '30',
  left: '16px',
  whiteSpace: 'nowrap',
  borderRadius: '2px'
});

export const getLabelBackgroundStyles = (labelPosition, labelWidth, backgroundColor, height = '4px', zIndex = '20') => ({
  position: 'absolute',
  top: '0px',
  left: labelPosition,
  width: labelWidth,
  height: height,
  backgroundColor: backgroundColor,
  zIndex: zIndex
});

export const getBorderStyles = (part, borderColor, borderWidth, backgroundColor, labelPosition, labelWidth) => {
  const baseStyles = {
    height: '100%',
    boxSizing: 'border-box',
    backgroundColor: backgroundColor,
    transition: 'border-color 0.2s, border-width 0.2s'
  };

  if (part === 'start') {
    return {
      ...baseStyles,
      flex: 'none',
      width: labelPosition,
      borderTop: `${borderWidth} solid ${borderColor}`,
      borderLeft: `${borderWidth} solid ${borderColor}`,
      borderBottom: `${borderWidth} solid ${borderColor}`,
      borderRight: 'none',
      borderRadius: '4px 0 0 4px'
    };
  } else if (part === 'notch') {
    return {
      ...baseStyles,
      flex: 'none',
      width: labelWidth,
      borderTop: `${borderWidth} solid ${borderColor}`,
      borderBottom: `${borderWidth} solid ${borderColor}`,
      borderLeft: 'none',
      borderRight: 'none'
    };
  } else if (part === 'end') {
    return {
      ...baseStyles,
      flex: '1',
      borderTop: `${borderWidth} solid ${borderColor}`,
      borderRight: `${borderWidth} solid ${borderColor}`,
      borderBottom: `${borderWidth} solid ${borderColor}`,
      borderLeft: 'none',
      borderRadius: '0 4px 4px 0'
    };
  }

  return baseStyles;
};
