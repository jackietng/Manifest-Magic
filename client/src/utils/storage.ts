export const saveJournalEntry = (entry: string) => {
  const entries = JSON.parse(localStorage.getItem("journalEntries") || "[]");
  entries.push({ entry, date: new Date().toISOString() });
  localStorage.setItem("journalEntries", JSON.stringify(entries));
};

export const getJournalEntries = () => {
  return JSON.parse(localStorage.getItem("journalEntries") || "[]");
};
