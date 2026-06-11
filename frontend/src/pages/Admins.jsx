import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Trash2, Edit, Users, Eye, EyeOff, Loader2, ShieldCheck, UserCog } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const Admins = () => {
    const { getAdmins, updateAdmin, deleteAdmin, addAdmin, user: currentUser } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'admin',
    });
    const [errors, setErrors] = useState({});

    const fetchAdmins = async () => {
        setLoading(true);
        const data = await getAdmins();
        setAdmins(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!editingAdmin || editingAdmin.role !== 'superadmin') {
            if (!formData.name?.trim()) newErrors.name = 'Name is required';
        }

        if (!formData.email?.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!editingAdmin && !formData.password) {
            newErrors.password = 'Password is required for new admins';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            let result;
            if (editingAdmin) {
                // Special rules for superadmin: only email and password (if provided)
                const updateData = editingAdmin.role === 'superadmin'
                    ? { email: formData.email }
                    : { ...formData };

                if (formData.password) {
                    updateData.password = formData.password;
                }

                result = await updateAdmin(editingAdmin._id || editingAdmin.id, updateData);
                if (result.success) toast.success('Admin updated successfully');
            } else {
                result = await addAdmin(formData);
                if (result.success) toast.success('Admin added successfully');
            }

            if (result.success) {
                setIsDialogOpen(false);
                fetchAdmins();
            } else {
                toast.error(result.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (admin) => {
        setEditingAdmin(admin);
        setFormData({
            name: admin.name,
            email: admin.email,
            password: '', // Don't show password on edit
            role: admin.role,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this admin?')) {
            const result = await deleteAdmin(id);
            if (result.success) {
                toast.success('Admin removed successfully');
                fetchAdmins();
            } else {
                toast.error(result.message || 'Failed to remove admin');
            }
        }
    };

    const filteredAdmins = admins.filter(
        (admin) =>
            (admin.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (admin.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <MainLayout>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between animate-fade-in">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">
                        Administrator Management
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Manage system administrators and their permissions
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            size="lg"
                            onClick={() => {
                                setEditingAdmin(null);
                                setFormData({
                                    name: '',
                                    email: '',
                                    password: '',
                                    role: 'admin',
                                });
                                setErrors({});
                            }}
                        >
                            <UserPlus className="mr-2 h-5 w-5" />
                            Add Admin
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="font-display text-2xl">
                                {editingAdmin ? 'Edit Administrator' : 'Add New Administrator'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        placeholder="Enter full name"
                                        className={errors.name ? 'border-destructive' : ''}
                                        disabled={editingAdmin?.role === 'superadmin'}
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-destructive">{errors.name}</p>
                                    )}
                                    {editingAdmin?.role === 'superadmin' && (
                                        <p className="mt-1 text-xs text-muted-foreground">Name cannot be changed for Super Admin</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        placeholder="admin@example.com"
                                        className={errors.email ? 'border-destructive' : ''}
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="password">
                                        {editingAdmin ? 'New Password (Leave blank to keep current)' : 'Login Password'}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) =>
                                                setFormData({ ...formData, password: e.target.value })
                                            }
                                            placeholder="••••••••"
                                            className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-destructive">{errors.password}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, role: value })
                                        }
                                        disabled={editingAdmin?.role === 'superadmin'}
                                    >
                                        <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Administrator</SelectItem>
                                            <SelectItem value="superadmin" disabled={currentUser?.role !== 'superadmin'}>Super Administrator</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {editingAdmin?.role === 'superadmin' && (
                                        <p className="mt-1 text-xs text-muted-foreground">Role cannot be changed for Super Admin</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        editingAdmin ? 'Update Admin' : 'Add Admin'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search and Stats */}
            <div className="mb-6 flex items-center gap-4 animate-slide-up">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search admins by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <span className="font-medium text-primary">{admins.length} Administrators</span>
                </div>
            </div>

            {/* Admins Table */}
            <div className="rounded-xl border border-border bg-card shadow-card animate-slide-up" style={{ animationDelay: '100ms' }}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Administrator</TableHead>
                            <TableHead>Email Address</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center">
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredAdmins.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <Users className="h-12 w-12 mb-2 opacity-20" />
                                        <p>No administrators found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAdmins.map((admin) => (
                                <TableRow key={admin._id || admin.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                                                {admin.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium">{admin.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{admin.email}</TableCell>
                                    <TableCell>
                                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${admin.role === 'superadmin'
                                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                                            }`}>
                                            {admin.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                                        </div>
                                    </TableCell>
                                    <TableCell>{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(admin)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(admin._id || admin.id)}
                                                disabled={admin.role === 'superadmin'}
                                                className={admin.role === 'superadmin' ? 'opacity-30' : ''}
                                                title={admin.role === 'superadmin' ? "Super Admin cannot be deleted" : "Delete Admin"}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </MainLayout >
    );
};

export default Admins;
