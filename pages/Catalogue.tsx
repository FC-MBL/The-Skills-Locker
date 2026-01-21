import React, { useState } from 'react';
import { DOMAINS } from '../data';
import { Link } from 'react-router-dom';
import { Card, Badge } from '../components/UI';
import { Search, Filter } from 'lucide-react';
import { useStore } from '../store';

export const Catalogue = () => {
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState<string>('ALL');
  const [filterDomain, setFilterDomain] = useState<string>('ALL');
  const { items } = useStore();

  const publishedItems = items.filter(item => item.status === 'PUBLISHED');
  const filteredItems = publishedItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesTier = filterTier === 'ALL' || item.tier === filterTier;
    const matchesDomain = filterDomain === 'ALL' || item.domainId === filterDomain;
    return matchesSearch && matchesTier && matchesDomain;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h1 className="text-4xl font-display uppercase text-slate-900 mb-2">Course Catalogue</h1>
           <p className="text-slate-500">Browse {publishedItems.length} courses across {DOMAINS.length} domains.</p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search courses..." 
            className="pl-10 pr-4 py-2 border rounded-full w-full md:w-64 focus:ring-2 focus:ring-primary outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-8 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase mr-2">
           <Filter size={16} /> Filters:
        </div>
        
        <select 
          className="bg-slate-50 border-none rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-100 cursor-pointer"
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value)}
        >
          <option value="ALL">All Tiers</option>
          <option value="BYTE">Training Bytes (1hr)</option>
          <option value="MICROCRED">Micro-Creds (Days)</option>
          <option value="SHORT">Short Courses (Weeks)</option>
        </select>

        <select 
          className="bg-slate-50 border-none rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-100 cursor-pointer"
          value={filterDomain}
          onChange={(e) => setFilterDomain(e.target.value)}
        >
          <option value="ALL">All Domains</option>
          {DOMAINS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        
        {(filterTier !== 'ALL' || filterDomain !== 'ALL') && (
           <button onClick={() => { setFilterTier('ALL'); setFilterDomain('ALL'); }} className="text-sm text-red-500 font-bold hover:underline">
             Clear
           </button>
        )}
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 opacity-50">
          <p className="text-xl font-bold">No results found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map(item => {
             const domain = DOMAINS.find(d => d.id === item.domainId);
             return (
               <Link key={item.id} to={`/items/${item.id}`} className="group">
                 <Card className="h-full flex flex-col hover:-translate-y-1 transition-transform duration-300">
                   <div className="h-40 overflow-hidden relative">
                     <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                     {item.accredited && (
                       <span className="absolute bottom-2 right-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded">
                         ACCREDITED
                       </span>
                     )}
                   </div>
                   <div className="p-5 flex-grow flex flex-col">
                     <div className="flex justify-between items-start mb-2">
                       <Badge tier={item.tier} />
                       <span className="text-[10px] font-bold text-slate-400 uppercase">{domain?.name}</span>
                     </div>
                     <h3 className="font-bold text-lg leading-snug mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                     <p className="text-sm text-slate-500 mb-4 line-clamp-2">{item.description}</p>
                     
                     <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                       <span className="text-xs font-bold text-slate-400">{item.durationLabel}</span>
                       <span className="text-sm font-bold text-slate-900">
                         {item.price === 0 ? 'FREE' : `$${item.price}`}
                       </span>
                     </div>
                   </div>
                 </Card>
               </Link>
             )
          })}
        </div>
      )}
    </div>
  );
};
