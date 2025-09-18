
import React, { useState, useMemo } from 'react';
import { useData } from '../../../context/DataContext';
import { ActionPreset, ActionType, BadgeTier } from '../../../types';
import { AdminSection, ActionBar } from '../../../components/ui/AdminSection';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Table } from '../../../components/ui/Table';
import { Select } from '../../../components/ui/Select';
import { PlusCircleIcon, PencilIcon, TrashIcon, ChevronDownIcon, CheckCircleIcon, availableIconNames } from '../../../assets/icons';
import { BadgeIconRenderer } from '../../shared/BadgeIconRenderer';
import { ConfirmationModal } from '../../shared/ConfirmationModal';

const ActionPresetForm: React.FC<{ preset?: ActionPreset; onDone: () => void }> = ({ preset, onDone }) => {
    const { createActionPreset, updateActionPreset } = useData();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState<Omit<ActionPreset, 'id' | 'createdBy'>>({
        name: preset?.name || '',
        type: preset?.type || ActionType.REWARD,
        points: preset?.points || 0,
        category: preset?.category || '',
        description: preset?.description || '',
        badgeTier: preset?.badgeTier || undefined,
        icon: preset?.icon || undefined,
        isArchived: preset?.isArchived || false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const newFormData = { ...formData } as any;

        if (type === 'checkbox') {
            newFormData.isArchived = (e.target as HTMLInputElement).checked;
        } else if (name === 'points') {
            newFormData.points = Number(value);
        } else {
            newFormData[name] = value;
        }
        
        if (name === 'type' && value !== ActionType.MEDAL) {
            delete newFormData.badgeTier;
            delete newFormData.icon;
        }
        
        if (name === 'type' && value === ActionType.MEDAL) {
            newFormData.badgeTier = newFormData.badgeTier || BadgeTier.BRONZE;
        }
        
        if (name === 'icon' && value === '') {
            delete newFormData.icon;
        }

        setFormData(newFormData);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            if (preset) {
                await updateActionPreset(preset.id, formData);
                setSuccessMessage('Preset updated successfully.');
            } else {
                await createActionPreset(formData);
                setSuccessMessage('Preset created successfully.');
            }
            setIsSuccess(true);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isSuccess) {
        return (
            <div className="text-center p-4">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-secondary" />
                <h3 className="mt-2 text-lg font-medium text-text-primary">Success!</h3>
                <p className="mt-2 text-sm text-text-secondary">{successMessage}</p>
                <Button onClick={onDone} className="mt-6" variant="secondary">
                    Close
                </Button>
            </div>
        );
    }

    const iconOptions = availableIconNames.map(name => ({
        name: name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1'),
        value: name
    }));

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" value={formData.name} onChange={handleChange} placeholder="Preset Name (e.g., '+10 for Homework')" required />
            <Select name="type" value={formData.type} onChange={handleChange}>
                {Object.values(ActionType).map(type => <option key={type} value={type} className="capitalize">{type}</option>)}
            </Select>
            <Input name="points" type="number" value={formData.points} onChange={handleChange} placeholder="Points (e.g., 10 or -5)" required />
            <Input name="category" value={formData.category} onChange={handleChange} placeholder="Category (e.g., 'Homework')" required />
            <Input name="description" value={formData.description} onChange={handleChange} placeholder="Default Description" required />
            {formData.type === ActionType.MEDAL && (
                 <>
                    <Select name="badgeTier" value={formData.badgeTier} onChange={handleChange} required>
                        {Object.values(BadgeTier).map(tier => <option key={tier} value={tier} className="capitalize">{tier}</option>)}
                    </Select>
                    <Select name="icon" value={formData.icon || ''} onChange={handleChange}>
                        <option value="">Default Medal Icon</option>
                        {iconOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.name}</option>)}
                    </Select>
                 </>
            )}
             <label className="flex items-center space-x-3 cursor-pointer text-text-secondary">
                <input type="checkbox" name="isArchived" checked={formData.isArchived} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                <span>Is Archived</span>
            </label>
            {error && <p className={`text-sm text-danger`}>{error}</p>}
            <Button type="submit" className="w-full !mt-6" disabled={isLoading}>
                {isLoading ? (preset ? 'Updating...' : 'Creating...') : (preset ? 'Update Preset' : 'Create Preset')}
            </Button>
        </form>
    );
};

const ActionPresetGroup: React.FC<{
    title: string;
    presets: ActionPreset[];
    onEdit: (preset: ActionPreset) => void;
    onDelete: (preset: ActionPreset) => void;
}> = ({ title, presets, onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(true);

    if (presets.length === 0) return null;

    return (
        <div className="border border-border rounded-lg">
            <div className="p-4 bg-slate-50/70 border-b border-border cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-text-primary capitalize">{title} ({presets.length})</h4>
                    <ChevronDownIcon className={`h-5 w-5 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {isOpen && (
                <div className="overflow-x-auto">
                <Table headers={['Name', 'Points', 'Category', 'Status', 'Actions']}>
                    {presets.map(preset => (
                        <tr key={preset.id}>
                            <td className="px-6 py-3 font-medium text-text-primary flex items-center gap-2">
                                {preset.type === ActionType.MEDAL && preset.badgeTier && (
                                    <BadgeIconRenderer badge={{ tier: preset.badgeTier, icon: preset.icon }} className="h-5 w-5" />
                                )}
                                {preset.name}
                            </td>
                            <td className={`px-6 py-3 font-bold ${preset.points >= 0 ? 'text-secondary' : 'text-danger'}`}>{preset.points}</td>
                            <td className="px-6 py-3">{preset.category}</td>
                            <td className="px-6 py-3">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${preset.isArchived ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                    {preset.isArchived ? 'Archived' : 'Active'}
                                </span>
                            </td>
                            <td className="px-6 py-3">
                                <div className="flex space-x-2">
                                    <Button size="sm" variant="secondary" onClick={() => onEdit(preset)}><PencilIcon className="h-4 w-4" /></Button>
                                    <Button size="sm" variant="danger" onClick={() => onDelete(preset)}><TrashIcon className="h-4 w-4" /></Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </Table>
                </div>
            )}
        </div>
    );
}

const ActionPresetManagement: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
    const { actionPresets, deleteActionPreset } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPreset, setEditingPreset] = useState<ActionPreset | undefined>(undefined);
    const [deletingPreset, setDeletingPreset] = useState<ActionPreset | null>(null);

    const groupedPresets = useMemo(() => {
        if (!Array.isArray(actionPresets)) {
            return {} as Record<ActionType, ActionPreset[]>;
        }
        return actionPresets.reduce((acc, preset) => {
            acc[preset.type] = acc[preset.type] || [];
            acc[preset.type].push(preset);
            return acc;
        }, {} as Record<ActionType, ActionPreset[]>);
    }, [actionPresets]);

    const handleOpenModal = (preset?: ActionPreset) => {
        setEditingPreset(preset);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingPreset(undefined);
        setIsModalOpen(false);
        onUpdate();
    };
    
    const handleDelete = async () => {
        if (!deletingPreset) return;
        await deleteActionPreset(deletingPreset.id);
        onUpdate();
        setDeletingPreset(null);
    }

    return (
        <>
            <AdminSection 
                title="Action Presets"
                description="Manage predefined actions for rewards, violations, and medals"
                icon={<PlusCircleIcon />}
                actions={[
                    <Button key="add" onClick={() => handleOpenModal()}>
                        <PlusCircleIcon className="h-5 w-5 mr-2" />Add Preset
                    </Button>
                ]}
            >
                <div className="space-y-4 max-h-[32rem] overflow-y-auto pr-2">
                    <ActionPresetGroup title="Rewards" presets={groupedPresets[ActionType.REWARD] || []} onEdit={handleOpenModal} onDelete={setDeletingPreset} />
                    <ActionPresetGroup title="Violations" presets={groupedPresets[ActionType.VIOLATION] || []} onEdit={handleOpenModal} onDelete={setDeletingPreset} />
                    <ActionPresetGroup title="Medals" presets={groupedPresets[ActionType.MEDAL] || []} onEdit={handleOpenModal} onDelete={setDeletingPreset} />
                </div>
            </AdminSection>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingPreset ? 'Edit Action Preset' : 'Create New Action Preset'}>
                <ActionPresetForm preset={editingPreset} onDone={handleCloseModal} />
            </Modal>
            <ConfirmationModal
                isOpen={!!deletingPreset}
                onClose={() => setDeletingPreset(null)}
                onConfirm={handleDelete}
                title="Confirm Deletion"
                message={<p>Are you sure you want to delete the preset "<strong>{deletingPreset?.name}</strong>"? This action cannot be undone.</p>}
                confirmText="Confirm Delete"
                confirmVariant="danger"
            />
        </>
    );
};

export default ActionPresetManagement;
