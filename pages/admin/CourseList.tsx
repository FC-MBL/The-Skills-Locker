import React, { useState } from 'react';
import { useStore } from '../../store';
import { Link } from 'react-router-dom';
import { Button, Badge, Card } from '../../components/UI';
import { Edit, Layers, Plus, Search, Trash2 } from 'lucide-react';
import { DOMAINS } from '../../data';

export const CourseList = () => {
    const { items, deleteItem } = useStore();
    const [filter, setFilter] = useState('');
    const [domainFilter, setDomainFilter] = useState('ALL');

    const filtered = items.filter(i => {
        const matchText = i.title.toLowerCase().includes(filter.toLowerCase());
        const matchDomain = domainFilter === 'ALL' || i.domainId === domainFilter;
        return matchText && matchDomain;
    });

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-display uppercase text-slate-900">Courses</h1>
                <Link to="/admin/courses/new">
                    <Button className="flex items-center gap-2"><Plus size={18} /> New Course</Button>
                </Link>
            </div>

            <Card className="p-4 mb-6 flex flex-wrap gap-4 items-center">
                <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-primary outline-none"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                    />
                </div>
                <select
                    className="border rounded-lg px-4 py-2 bg-slate-50"
                    value={domainFilter}
                    onChange={e => setDomainFilter(e.target.value)}
                >
                    <option value="ALL">All Branches</option>
                    {DOMAINS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
            </Card>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Branch</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Ver</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.map(item => {
                            const domain = DOMAINS.find(d => d.id === item.domainId);
                            return (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{item.title}</div>
                                        <div className="flex gap-2 mt-1">
                                            <Badge tier={item.tier} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{domain?.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${item.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                                                item.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">v{item.versionNumber}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Link to={`/admin/courses/${item.id}/builder`}>
                                            <button className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 rounded transition" title="Course Builder">
                                                <Layers size={18} />
                                            </button>
                                        </Link>
                                        <Link to={`/admin/courses/${item.id}`}>
                                            <button className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 rounded transition" title="Edit Metadata">
                                                <Edit size={18} />
                                            </button>
                                        </Link>
                                        <button
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                            title="Delete Course"
                                            onClick={() => {
                                                if (window.confirm(`Delete "${item.title}"? This cannot be undone.`)) {
                                                    deleteItem(item.id);
                                                }
                                            }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
