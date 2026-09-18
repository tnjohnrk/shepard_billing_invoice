import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../common/Input';

export function HistorySearch({ search, setSearch }) {
  return (
    <div className="w-full sm:w-80">
      <Input
        icon={Search}
        placeholder="Search invoice no, buyer, or GSTIN..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}
