const API_BASE = 'http://localhost:3001/api';

export const listContacts = async () => {
  const res = await fetch(`${API_BASE}/contacts`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const createContact = async (data) => {
  const res = await fetch(`${API_BASE}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateContact = async (id, data) => {
  const res = await fetch(`${API_BASE}/contacts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const deleteContact = async (id) => {
  const res = await fetch(`${API_BASE}/contacts/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};
