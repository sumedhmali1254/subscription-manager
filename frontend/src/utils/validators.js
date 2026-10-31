export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const checkPasswordStrength = (password = '') => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  
  let label = 'Very Weak';
  let color = 'bg-rose-500';
  let percentage = 20;

  if (score >= 5) {
    label = 'Strong';
    color = 'bg-emerald-500';
    percentage = 100;
  } else if (score >= 4) {
    label = 'Good';
    color = 'bg-teal-500';
    percentage = 80;
  } else if (score >= 3) {
    label = 'Fair';
    color = 'bg-amber-500';
    percentage = 60;
  } else if (score >= 2) {
    label = 'Weak';
    color = 'bg-orange-500';
    percentage = 40;
  }

  return { checks, score, label, color, percentage };
};

