const fs = require('fs');
const path = require('path');
const { Contact } = require('../models/contact');

const DATA_FILE = path.join(__dirname, '../data/contacts.json');

const ensureDataFile = () => {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
};

const readContacts = () => {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => Contact.create(item).toJSON());
  } catch (err) {
    console.error('[Contacts] Error reading file:', err.message);
    return [];
  }
};

const writeContacts = (contacts) => {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(contacts, null, 2));
};

const listContacts = () => {
  return readContacts().sort((a, b) => a.name.localeCompare(b.name));
};

const getContactById = (id) => {
  return readContacts().find((c) => c.id === id) || null;
};

const createContact = (data) => {
  const contacts = readContacts();
  const contact = Contact.create(data).toJSON();
  contacts.push(contact);
  writeContacts(contacts);
  return contact;
};

const updateContact = (id, data) => {
  const contacts = readContacts();
  const index = contacts.findIndex((c) => c.id === id);
  if (index === -1) return null;
  const updated = Contact.create({ ...contacts[index], ...data, id, updatedAt: new Date().toISOString() }).toJSON();
  contacts[index] = updated;
  writeContacts(contacts);
  return updated;
};

const deleteContact = (id) => {
  const contacts = readContacts();
  const index = contacts.findIndex((c) => c.id === id);
  if (index === -1) return false;
  contacts.splice(index, 1);
  writeContacts(contacts);
  return true;
};

module.exports = { listContacts, getContactById, createContact, updateContact, deleteContact };
