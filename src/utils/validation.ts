export function createVuetifyRules(checks: any[]) {
  if (!Array.isArray(checks)) return [];

  return checks.map((check) => {
    return (value: any) => {
      if (check === 'required' || check.type === 'required' || check.name === 'required') {
        return !!value || check.message || 'Field is required';
      }

      if (check.regex || check.type === 'regex') {
        const pattern = check.regex || check.pattern;
        if (pattern) {
          const regex = new RegExp(pattern);
          return regex.test(value) || check.message || 'Invalid format';
        }
      }

      if (check.type === 'minLength' && check.value !== undefined) {
        return (value !== undefined && value !== null && String(value).length >= check.value) || check.message || `Minimum length is ${check.value}`;
      }

      if (check.type === 'maxLength' && check.value !== undefined) {
        return value === undefined || value === null || String(value).length <= check.value || check.message || `Maximum length is ${check.value}`;
      }

      // Allow functions if they pass executable rules
      if (typeof check === 'function') {
        return check(value);
      }

      return true;
    };
  });
}
