import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { toast } from 'react-hot-toast';
import { createResource } from '../../services/resourceService';

const AddResourceModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'notes',
        url: '',
        tags: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.url) return toast.error('Please fill in required fields');

        setLoading(true);
        try {
            const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
            await createResource({
                ...formData,
                tags: tagsArray
            });
            toast.success('Resource shared successfully!');
            onSuccess();
            onClose();
            setFormData({ title: '', description: '', category: 'notes', url: '', tags: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to share resource');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Share Academic Resource"
            className="max-w-md bg-dark-900 border-white/10"
        >
            <form onSubmit={handleSubmit} className="space-y-5 py-2">
                <div>
                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Title *</label>
                    <Input 
                        placeholder="e.g. CS101 Midterm Notes" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Category</label>
                    <select 
                        className="w-full bg-dark-800 border border-white/5 rounded-2xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                        <option value="notes">Notes</option>
                        <option value="exam-paper">Exam Paper</option>
                        <option value="book">Book</option>
                        <option value="link">Link/Tool</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Resource Link *</label>
                    <Input 
                        placeholder="Google Drive, Dropbox, or Website URL" 
                        value={formData.url}
                        onChange={(e) => setFormData({...formData, url: e.target.value})}
                        required
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Description</label>
                    <textarea 
                        className="w-full bg-dark-800 border border-white/5 rounded-2xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all min-h-[100px] resize-none"
                        placeholder="What's inside this resource?"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Tags (comma separated)</label>
                    <Input 
                        placeholder="e.g. semester1, computer-science, python" 
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    />
                </div>

                <div className="pt-2 flex gap-3">
                    <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button type="submit" className="flex-1" loading={loading}>Share Resource</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddResourceModal;
