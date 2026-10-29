import { useState, useCallback, useMemo } from 'react';

/**
 * useForm — general-purpose controlled form hook.
 *
 * @param {Object} initialValues  - { fieldName: initialValue }
 * @param {Object} validationRules - { fieldName: (value, allValues) => errorString | null }
 * @returns {{
 *   values: Object,
 *   errors: Object,
 *   touched: Object,
 *   isValid: boolean,
 *   isSubmitting: boolean,
 *   handleChange: Function,
 *   handleBlur: Function,
 *   handleSubmit: Function,
 *   setFieldValue: Function,
 *   reset: Function,
 * }}
 */
export function useForm(initialValues = {}, validationRules = {}) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Run all validation rules against current values
  const errors = useMemo(() => {
    const result = {};
    for (const field in validationRules) {
      const error = validationRules[field](values[field], values);
      if (error) result[field] = error;
    }
    return result;
  }, [values, validationRules]);

  const isValid = Object.keys(errors).length === 0;

  // Controlled change handler — works with inputs, selects, checkboxes
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  // Mark field as touched on blur so errors only appear after interaction
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  // Programmatic field setter (e.g. for select or custom components)
  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Touch all fields and call onSubmit if valid
  const handleSubmit = useCallback(
    (onSubmit) => async (e) => {
      e.preventDefault();
      // Touch every field so errors become visible
      const allTouched = Object.keys(initialValues).reduce(
        (acc, k) => ({ ...acc, [k]: true }),
        {}
      );
      setTouched(allTouched);

      if (!isValid) return;

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isValid, values, initialValues]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    reset,
  };
}
