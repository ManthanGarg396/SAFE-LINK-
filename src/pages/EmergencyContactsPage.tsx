import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Trash2,
  PhoneCall,
  Mail,
  ShieldCheck,
  Star,
  StarOff,
  BellRing,
  X,
  Check,
} from 'lucide-react';
import { EmergencyContact } from '../types.ts';
import { StorageService } from '../services/storage.ts';

interface EmergencyContactsPageProps {
  onOpenAlertModal: () => void;
}

export const EmergencyContactsPage: React.FC<EmergencyContactsPageProps> = ({
  onOpenAlertModal,
}) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<EmergencyContact['relationship']>('Parent');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  useEffect(() => {
    StorageService.getContacts().then(setContacts);
  }, []);

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const newContact: EmergencyContact = {
      id: 'c-' + Date.now(),
      name: name.trim(),
      relationship,
      phone: phone.trim(),
      email: email.trim() || undefined,
      isPrimary,
    };

    const updated = [newContact, ...contacts];
    setContacts(updated);
    StorageService.saveContacts(updated);

    setName('');
    setPhone('');
    setEmail('');
    setIsPrimary(false);
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    StorageService.saveContacts(updated);
  };

  const handleTogglePrimary = (id: string) => {
    const updated = contacts.map((c) =>
      c.id === id ? { ...c, isPrimary: !c.isPrimary } : c
    );
    setContacts(updated);
    StorageService.saveContacts(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 font-bold text-xs uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Designated Safety Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
            Emergency Contacts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Contacts alerted during high-risk incidents with GPS location & incident summary.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Add Contact</span>
          </button>

          <button
            onClick={onOpenAlertModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
          >
            <BellRing className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Test Alert Dispatch</span>
          </button>
        </div>
      </div>

      {/* Contacts List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className={`p-5 rounded-2xl border transition shadow-xs flex flex-col justify-between ${
              contact.isPrimary
                ? 'bg-blue-50/60 border-blue-300'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-extrabold text-sm sm:text-base text-slate-900">
                      {contact.name}
                    </h2>
                    {contact.isPrimary && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold">
                        PRIMARY ALERT
                      </span>
                    )}
                  </div>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200">
                    {contact.relationship}
                  </span>
                </div>

                <button
                  onClick={() => handleTogglePrimary(contact.id)}
                  title={contact.isPrimary ? 'Unmark Primary' : 'Mark Primary'}
                  className={`p-1.5 rounded-lg border transition ${
                    contact.isPrimary
                      ? 'bg-amber-100 text-amber-700 border-amber-300'
                      : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
                  }`}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              </div>

              <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-200/50">
                <div className="flex items-center gap-2 font-mono">
                  <PhoneCall className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{contact.phone}</span>
                </div>
                {contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
              <button
                onClick={() => {
                  window.location.href = `tel:${contact.phone.replace(/\s+/g, '')}`;
                }}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>Call Directly</span>
              </button>

              <button
                onClick={() => handleDelete(contact.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 transition"
                title="Delete Contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold font-display text-slate-900">
                Add Emergency Contact
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Prof. Sharma / Mom / Roommate"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Relationship
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                >
                  <option value="Parent">Parent</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Friend">Friend / Roommate</option>
                  <option value="Hostel Warden">Hostel Warden</option>
                  <option value="Teacher">Teacher / Faculty</option>
                  <option value="Campus Security">Campus Security</option>
                  <option value="Medical Doctor">Medical Doctor</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@example.com"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="primaryCheck"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="primaryCheck" className="text-slate-700 font-semibold cursor-pointer">
                  Mark as Primary Alert Contact
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
