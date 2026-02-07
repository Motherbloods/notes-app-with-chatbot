const now = new Date();

export const isToday = (date) => {
  const d = new Date(date);
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
};

export const isThisWeek = (date) => {
  const d = new Date(date);
  const firstDayOfWeek = new Date(now);
  firstDayOfWeek.setDate(now.getDate() - now.getDay());

  return d >= firstDayOfWeek && d <= now;
};

export const isThisMonth = (date) => {
  const d = new Date(date);
  return (
    d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  );
};
