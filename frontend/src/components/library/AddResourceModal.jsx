import { useState, useRef } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { toast } from 'react-hot-toast';
import { createResource, uploadResourceFile } from '../../services/resourceService';
import { UploadCloud, Link as LinkIcon, FileText } from 'lucide-react';
import clsx from 'clsx';

const AddResourceModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [uploadType, setUploadType] = useState('link'); // 'link' or 'file'
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'notes',
        url: '',
        tags: ''
    });

    const resetForm = () => {
        setFormData({ title: '', description: '', category: 'notes', url: '', tags: '' });
        setSelectedFile(null);
        setUploadType('link');
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
            
            if (!allowedTypes.includes(file.type)) {
                return toast.error('Format not supported. Please upload PDF, DOC, DOCX, PPT, or PPTX.');
            }
            if (file.size > 10 * 1024 * 1024) {
                return toast.error('File size should be less than 10MB.');
            }
            setSelectedFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title) return toast.error('Please provide a title');
        if (!formData.description) return toast.error('Please provide a description');
        if (uploadType === 'link' && !formData.url) return toast.error('Please provide a resource link');
        if (uploadType === 'file' && !selectedFile) return toast.error('Please select a file to upload');

        setLoading(true);
        try {
            let finalUrl = formData.url;

            if (uploadType === 'file') {
                const uploadRes = await uploadResourceFile(selectedFile);
                finalUrl = uploadRes.data.data.url;
            }

            const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
            await createResource({
                ...formData,
                url: finalUrl,
                tags: tagsArray
            });

            toast.success('Resource shared successfully!');
            onSuccess();
            resetForm();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to share resource');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleClose} 
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
                    <div className="flex items-center justify-between mb-2 ml-1">
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Resource Source *</label>
                        <div className="flex bg-dark-800 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setUploadType('link')}
                                className={clsx(
                                    "px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5",
                                    uploadType === 'link' ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
                                )}
                            >
                                <LinkIcon className="w-3 h-3" /> Link
                            </button>
                            <button
                                type="button"
                                onClick={() => setUploadType('file')}
                                className={clsx(
                                    "px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5",
                                    uploadType === 'file' ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
                                )}
                            >
                                <UploadCloud className="w-3 h-3" /> Upload
                            </button>
                        </div>
                    </div>

                    {uploadType === 'link' ? (
                        <Input 
                            placeholder="Google Drive, Dropbox, or Website URL" 
                            value={formData.url}
                            onChange={(e) => setFormData({...formData, url: e.target.value})}
                            required={uploadType === 'link'}
                        />
                    ) : (
                        <div 
                            className={clsx(
                                "w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer group",
                                selectedFile ? "border-primary/50 bg-primary/5" : "border-white/10 bg-dark-800 hover:bg-dark-800/80 hover:border-white/20"
                            )}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input 
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.ppt,.pptx"
                                onChange={handleFileChange}
                            />
                            {selectedFile ? (
                                <div className="flex flex-col items-center space-y-2 text-center">
                                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-200 truncate max-w-[200px]">{selectedFile.name}</p>
                                        <p className="text-xs font-medium text-gray-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 hover:text-white transition-colors">Click to change</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center space-y-2 text-center">
                                    <div className="w-10 h-10 bg-dark-700 rounded-full flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                                        <UploadCloud className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-300">Click to upload document</p>
                                        <p className="text-xs font-medium text-gray-500">PDF, DOC, DOCX, PPT (Max 10MB)</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Description *</label>
                    <textarea 
                        className="w-full bg-dark-800 border border-white/5 rounded-2xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all min-h-[100px] resize-none"
                        placeholder="What's inside this resource?"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        required
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
                    <Button type="button" variant="ghost" className="flex-1" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" className="flex-1" loading={loading}>Share Resource</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddResourceModal;
