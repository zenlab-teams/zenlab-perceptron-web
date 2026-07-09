import React from 'react';

export function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="mb-5 flex items-center gap-2 border-b border-[#D8D0C3] pb-3">
      <Icon size={18} className="text-[#B85C38]" />
      <h2 className="font-serif text-2xl text-[#1F1B16]">{title}</h2>
    </div>
  );
}
