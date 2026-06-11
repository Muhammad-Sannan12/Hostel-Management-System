import React, { useEffect, useState } from 'react';
import { Building2, Plus, Trash2, Edit, Users, Package, Bed, Check } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useHostel } from '@/context/useHostel';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const roomCapacities = [
  { value: '1', label: 'Single Seater' },
  { value: '2', label: 'Double Seater' },
  { value: '3', label: 'Triple Seater' },
  { value: '4', label: 'Quad Seater' },
];
{/* Helper function - define outside component or inside */}
const getFloorOptions = (totalFloors) => {
  const options = ['Ground Floor'];
  const ordinals = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th',
    '11th', '12th', '13th', '14th', '15th', '16th', '17th', '18th', '19th', '20th'];
  
  for (let i = 1; i < totalFloors; i++) {
    options.push(`${ordinals[i - 1]} Floor`);
  }
  return options;
};
const Hostels = () => {
  const {
    hostels,
    students,
    addHostel,
    updateHostel,
    deleteHostel,
    addRoom,
    updateRoom,
    deleteRoom,
    assignStudentToRoom,
    removeStudentFromRoom,
    addInventoryToRoom,
    updateRoomInventory,
    deleteRoomInventory,
    getStudentById,
  } = useHostel();

  const [selectedHostel, setSelectedHostel] = useState(hostels[0]?._id || '');

  useEffect(() => {
    if (!selectedHostel && hostels.length > 0) {
      console.log("hostels :", hostels);
      setSelectedHostel(hostels[0]._id);
    }
  }, [hostels, selectedHostel]);

  const [isHostelDialogOpen, setIsHostelDialogOpen] = useState(false);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isInventoryDialogOpen, setIsInventoryDialogOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [editingHostel, setEditingHostel] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);

  const [hostelForm, setHostelForm] = useState({ name: '', totalRooms: '', floors: '', 
    // category: ['BS'],
    //  description: '' 
  });

  const currentHostel = hostels.find((h) => h._id === selectedHostel);
  const selectedRoom = currentHostel?.rooms?.find(r => r._id === selectedRoomId);

  const [roomSections, setRoomSections] = useState([
    { roomNumber: '', seatType: 'Single', floor: 'Ground Floor' }
  ]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [inventoryForm, setInventoryForm] = useState({
    name: '',
    quantity: '',
    condition: 'Good',
  });


  const handleAddHostel = async (e) => {
    e.preventDefault();
    if (!hostelForm.name.trim()) {
      toast.error('Hostel name is required');
      return;
    }
    let result;
    if (editingHostel) {
      result = await updateHostel(editingHostel._id, {
        name: hostelForm.name,
        totalRooms: parseInt(hostelForm.totalRooms) || 0,
        floors: parseInt(hostelForm.floors) || 1,
        // category: hostelForm.category,
        // description: hostelForm.description,
      });
    } else {
      result = await addHostel({
        name: hostelForm.name,
        totalRooms: parseInt(hostelForm.totalRooms) || 0,
        floors: parseInt(hostelForm.floors) || 1,
        // category: hostelForm.category,
        // description: hostelForm.description,
      });
    }
console.log('Hostel save result:', result);
    if (result.success) {
      toast.success(editingHostel ? 'Hostel updated successfully' : 'Hostel added successfully');
      if (!editingHostel && result.data?._id) {
        setSelectedHostel(result.data._id);
      }
      setHostelForm({ name: '', totalRooms: '', floors: '', 
    // category: ['BS'],
    //  description: '' 
  });
      setEditingHostel(null);
      setIsHostelDialogOpen(false);
    }
  };
  

  // const handleEditHostel = (hostel) => {
  //   setEditingHostel(hostel);
  //   let initialCategory = hostel.category || ['BS'];
  //   if (typeof initialCategory === 'string') {
  //     initialCategory = [initialCategory];
  //   }
  //   setHostelForm({
  //     name: hostel.name,
  //     totalRooms: hostel.totalRooms.toString(),
  //     floors: hostel.floors.toString(),
  //     // category: initialCategory,
  //     description: hostel.description || ''
  //   });
  //   setIsHostelDialogOpen(true);
  // };

  const handleEditHostel = (hostel) => {
    setEditingHostel(hostel);
    setHostelForm({
      name: hostel.name,
      totalRooms: hostel.totalRooms.toString(),
      floors: hostel.floors.toString(),
      // description: hostel.description || ''
    });
    setIsHostelDialogOpen(true);
  };
  // const toggleCategory = (value) => {
  //   setHostelForm(prev => {
  //     const current = prev.category || [];
  //     if (current.includes(value)) {
  //       return { ...prev, category: current.filter(c => c !== value) };
  //     } else {
  //       return { ...prev, category: [...current, value] };
  //     }
  //   });
  // };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    const capacityMap = { 'Single': 1, 'Double': 2, 'Triple': 3, 'Quad': 4, 'Quin': 5 };

    if (editingRoom) {
      const roomData = {
        roomNumber: roomSections[0].roomNumber,
        seatType: roomSections[0].seatType,
        floor: roomSections[0].floor,
        capacity: capacityMap[roomSections[0].seatType],
      };

      if (!roomData.roomNumber.trim()) {
        toast.error('Room number is required');
        return;
      }

      const result = await updateRoom(editingRoom._id, roomData);
      if (result.success) {
        toast.success('Room updated successfully');
        setEditingRoom(null);
        setIsRoomDialogOpen(false);
      }
      return;
    }

    // Batch Add
    if (roomSections.some(r => !r.roomNumber.trim())) {
      toast.error('Please fill all room numbers');
      return;
    }

    const roomsToAdd = roomSections.length;
    if (currentHostel.rooms.length + roomsToAdd > currentHostel.totalRooms) {
      toast.error(`Cannot add ${roomsToAdd} rooms. Hall limit of ${currentHostel.totalRooms} will be exceeded.`);
      return;
    }

    let successCount = 0;
    for (const section of roomSections) {
      const roomData = {
        roomNumber: section.roomNumber,
        seatType: section.seatType,
        floor: section.floor,
        capacity: capacityMap[section.seatType],
      };

      const result = await addRoom(selectedHostel, roomData);
      if (result.success) successCount++;
    }

    if (successCount > 0) {
      toast.success(`${successCount} rooms added successfully`);
      setRoomSections([{ roomNumber: '', seatType: 'Single', floor: 'Ground Floor' }]);
      setIsRoomDialogOpen(false);
    }
  };

  const addRoomSection = () => {
    if (currentHostel.rooms.length + roomSections.length >= currentHostel.totalRooms) {
      toast.error('Maximum hall capacity reached');
      return;
    }

    // Try to auto-increment the last room number if possible
    const lastRoom = roomSections[roomSections.length - 1];
    let nextRoomNumber = '';

    const match = lastRoom.roomNumber.match(/(.*?)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const number = parseInt(match[2]);
      nextRoomNumber = `${prefix}${number + 1}`;
    }

    setRoomSections([...roomSections, { roomNumber: nextRoomNumber, seatType: lastRoom.seatType, floor: lastRoom.floor }]);
  };

  const removeRoomSection = (index) => {
    if (roomSections.length === 1) return;
    setRoomSections(roomSections.filter((_, i) => i !== index));
  };

  const updateSection = (index, field, value) => {
    setRoomSections(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setRoomSections([{
      roomNumber: room.roomNumber,
      seatType: room.seatType,
      floor: room.floor
    }]);
    setIsRoomDialogOpen(true);
  };

  const handleAssignStudent = async () => {
    if (!selectedStudent || !selectedRoomId) return;
    const result = await assignStudentToRoom(selectedStudent, selectedHostel, selectedRoomId);
    if (result.success) {
      toast.success('Student assigned to room');
      setSelectedStudent('');
      setIsAssignDialogOpen(false);
    }
    // error toast is handled by assignStudentToRoom in HostelContext
  };

  const handleAddInventory = (e) => {
    e.preventDefault();
    if (!inventoryForm.name.trim() || !inventoryForm.quantity) {
      toast.error('Please fill all fields');
      return;
    }
    if (selectedRoom) {
      addInventoryToRoom(selectedHostel, selectedRoom._id || selectedRoom.id, {
        name: inventoryForm.name,
        quantity: parseInt(inventoryForm.quantity),
        condition: inventoryForm.condition,
      });
      toast.success('Inventory item added');
      setInventoryForm({ name: '', quantity: '', condition: 'Good' });
    }
  };

  const unassignedStudents = students.filter((student) => {
    const studentId = student._id || student.id;
    const isAssigned = hostels.some((hostel) =>
      hostel.rooms.some((room) =>
        (room.occupants || []).some((occ) => {
          // occupants can be either a string ID or a populated object
          const occId = typeof occ === 'object' ? (occ._id || occ.id) : occ;
          return String(occId) === String(studentId);
        })
      )
    );
    return !isAssigned;
  });

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-[18px] font-semibold text-foreground">
            Hostels & Rooms
          </h1>
          <p className="mt-2 text-[12px] font-light text-muted-foreground">
            View and manage all hostels, rooms, and bed assignments
          </p>
        </div>
        <Drawer open={isHostelDialogOpen} onOpenChange={setIsHostelDialogOpen}>
          <DrawerTrigger asChild>
            <Button size="sm" className="text-[12px] font-normal rounded-md">
              <Plus className="mr-2 h-4 w-4" />
              Add Hostel
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="font-display text-2xl">
                {editingHostel ? 'Edit Hostel' : 'Add New Hostel'}
              </DrawerTitle>
              <DrawerDescription>
                {editingHostel ? 'Update hostel details and capacity' : 'Create a new hostel to manage rooms and students'}
              </DrawerDescription>
            </DrawerHeader>
            <form onSubmit={handleAddHostel} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="hostelName">Hostel Name</Label>
                <Input
                  id="hostelName"
                  value={hostelForm.name}
                  onChange={(e) => setHostelForm({ ...hostelForm, name: e.target.value })}
                  placeholder="e.g. Block A Hostel"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalRooms">Total Rooms</Label>
                  <Input
                    id="totalRooms"
                    type="number"
                    value={hostelForm.totalRooms}
                    onChange={(e) => setHostelForm({ ...hostelForm, totalRooms: e.target.value })}
                    placeholder="e.g. 50"
                  />
                </div>
                <div>
                  <Label htmlFor="floors">Floors</Label>
                  <Input
                    id="floors"
                    type="number"
                    value={hostelForm.floors}
                    onChange={(e) => setHostelForm({ ...hostelForm, floors: e.target.value })}
                    placeholder="e.g. 3"
                  />
                </div>
              </div>
              {/* <div className="space-y-3">
                <Label>Building For (Select all that apply)</Label>
                <div className="grid grid-cols-3 gap-4 rounded-lg border border-border p-4">
                  {['1st Year', '2nd Year', 'BS'].map((cat) => (
                    <div key={cat} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${cat}`}
                        checked={hostelForm.category.includes(cat)}
                        onCheckedChange={() => toggleCategory(cat)}
                      />
                      <Label
                        htmlFor={`cat-${cat}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {cat}
                      </Label>
                    </div>
                  ))}
                </div>
              </div> */}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => {
                  setIsHostelDialogOpen(false);
                  setEditingHostel(null);
                  setHostelForm({ name: '', totalRooms: '', floors: '',
                    //  category: ['BS'],
                      // description: ''
                     });
                }}>
                  Cancel
                </Button>
                <Button type="submit">{editingHostel ? 'Update Hostel' : 'Add Hostel'}</Button>
              </div>
            </form>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Hostel Tabs */}
      <Tabs value={selectedHostel} onValueChange={setSelectedHostel} className="animate-slide-up">
        <TabsList className="mb-6 flex-wrap h-auto gap-2 bg-transparent p-0">
          {hostels.map((hostel) => (
            <TabsTrigger
              key={hostel._id || hostel.id}
              value={hostel._id || hostel.id}
              className="text-[12px] font-normal rounded-md border border-border bg-card px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Building2 className="mr-2 h-4 w-4" />
              {hostel.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {hostels.map((hostel) => (
          <TabsContent key={hostel._id || hostel.id} value={hostel._id || hostel.id} className="space-y-6">
            {/* Hostel Header */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-[16px] font-semibold tracking-tight">{hostel.name}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground">
                    {/* <span className="text-[10px] font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-md">
                      {Array.isArray(hostel.category) ? hostel.category.join(' • ') : hostel.category}
                    </span> */}
                    <span className="text-border">|</span>
                    <span className="text-[11px] font-normal">{hostel.rooms.length} of {hostel.totalRooms} rooms added</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Dialog open={isRoomDialogOpen} onOpenChange={(open) => {
                  if (!open) {
                    setEditingRoom(null);
                    setRoomSections([{ roomNumber: '', seatType: 'Single', floor: 'Ground Floor' }]);
                  }
                  setIsRoomDialogOpen(open);
                }}>
                  <DialogTrigger asChild>
                    <Button
                      disabled={hostel.rooms.length >= hostel.totalRooms}
                      onClick={() => {
                        setSelectedHostel(hostel._id || hostel.id);
                        setEditingRoom(null);
                        setRoomSections([{ roomNumber: '', seatType: 'Single', floor: 'Ground Floor' }]);
                      }}
                      className="text-[12px] font-normal rounded-md"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Room
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="font-display text-2xl">
                        {editingRoom ? 'Edit Room' : `Add Rooms to ${hostel.name}`}
                      </DialogTitle>
                      <DialogDescription>
                        Configure room details and floor positions
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddRoom} className="mt-4 space-y-6">
                      <div className="space-y-6">
                        {roomSections.map((section, index) => (
                          <div key={index} className="relative rounded-xl border border-border p-4 bg-muted/20">
                            {!editingRoom && roomSections.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
                                onClick={() => removeRoomSection(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                              <div>
                                <Label>Room No</Label>
                                <Input
                                  value={section.roomNumber}
                                  onChange={(e) => updateSection(index, 'roomNumber', e.target.value)}
                                  placeholder="e.g. 101"
                                />
                              </div>
                              <div>
                                <Label>Seats</Label>
                                <Select
                                  value={section.seatType}
                                  onValueChange={(val) => updateSection(index, 'seatType', val)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Single">Single</SelectItem>
                                    <SelectItem value="Double">Double</SelectItem>
                                    <SelectItem value="Triple">Triple</SelectItem>
                                    <SelectItem value="Quad">Quad</SelectItem>
                                    <SelectItem value="Quin">Quin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              {/* <div>
                                <Label>Floor</Label>
                                <Select
                                  value={section.floor}
                                  onValueChange={(val) => updateSection(index, 'floor', val)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Ground Floor">Ground Floor</SelectItem>
                                    <SelectItem value="1st Floor">1st Floor</SelectItem>
                                    <SelectItem value="2nd Floor">2nd Floor</SelectItem>
                                    <SelectItem value="3rd Floor">3rd Floor</SelectItem>
                                    <SelectItem value="4th Floor">4th Floor</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div> */}
                           <div>
  <Label>Floor</Label>
  <Select
    value={section.floor}
    onValueChange={(val) => updateSection(index, 'floor', val)}
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {getFloorOptions(hostel.floors || 1).map((floor) => (
        <SelectItem key={floor} value={floor}>
          {floor}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {!editingRoom && (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-dashed"
                          onClick={addRoomSection}
                          disabled={hostel.rooms.length + roomSections.length >= hostel.totalRooms}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Another Section
                        </Button>
                      )}

                      <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button type="button" variant="outline" onClick={() => {
                          setIsRoomDialogOpen(false);
                          setEditingRoom(null);
                        }}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingRoom ? 'Update Room' : `Add ${roomSections.length} Rooms`}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                <div className="h-8 w-px bg-border hidden sm:block mx-1" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditHostel(hostel)}
                  className="text-[12px] font-normal rounded-md"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[12px] font-normal rounded-md text-destructive hover:bg-destructive/5 hover:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {hostel.name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Delete this hostel? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          const result = await deleteHostel(hostel._id || hostel.id);
                          if (result.success) {
                            toast.success('Hostel deleted');
                            if (hostels.length > 1) {
                              setSelectedHostel(hostels.find((h) => (h._id || h.id) !== (hostel._id || hostel.id))?._id || '');
                            }
                          }
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Hostel
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Rooms Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {hostel.rooms.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-12">
                  <Bed className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-lg font-medium text-muted-foreground">No rooms added yet</p>
                  <p className="text-sm text-muted-foreground">Add rooms to this hostel to get started</p>
                </div>
              ) : (
                hostel.rooms.map((room) => {
                  const occupancyPercent = (room.occupants?.length / room.capacity) * 100 || 0;
                  const isFull = room.occupants?.length >= room.capacity;

                  return (
                    <Card key={room._id || room.id} className="overflow-hidden rounded-lg border-[0.5px] border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                      <CardHeader className="pb-3 p-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-[13px] font-medium">Room {room.roomNumber}</CardTitle>
                          <Badge
                            variant={isFull ? 'destructive' : 'secondary'}
                            className={cn(
                              'text-[10px] font-normal rounded',
                              isFull ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                            )}
                          >
                            {isFull ? 'Full' : 'Available'}
                          </Badge>
                        </div>
                        <CardDescription className="text-[11px] font-normal">
                          Floor {room.floor.replace(/(\d+)(st|nd|rd|th)?\s*Floor/i, '$1')} • {room.seatType} •{' '}
                          {(room.occupants || []).length} of {room.capacity} beds occupied
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 p-4 pt-0">
                        {/* Occupancy Bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-normal tracking-wider text-muted-foreground">
                            <span>Occupancy</span>
                            <span>{Math.round(occupancyPercent)}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-muted/50 border border-border/50">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all duration-500',
                                isFull ? 'bg-destructive' : occupancyPercent > 70 ? 'bg-warning' : 'bg-success'
                              )}
                              style={{ width: `${occupancyPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Occupants List */}
                        {(room.occupants || []).length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">Assigned Students</Label>
                            <div className="space-y-1.5">
                              {room.occupants.map((student) => {
                                const studentName = typeof student === 'object'
                                  ? (student.user?.name || student.name || student.collegeNumber || 'Unknown')
                                  : 'Loading...';
                                const studentId = typeof student === 'object' ? (student._id || student.id) : student;
                                return (
                                  <div key={studentId} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-2 py-1.5 transition-colors hover:border-primary/20 hover:bg-primary/5">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                        {studentName.charAt(0).toUpperCase()}
                                      </div>
                                      <div className="overflow-hidden">
                                        <span className="block truncate text-[12px] font-normal text-foreground">{studentName}</span>
                                        {typeof student === 'object' && student.collegeNumber && (
                                          <span className="block text-[10px] font-normal text-muted-foreground">{student.collegeNumber}</span>
                                        )}
                                      </div>
                                    </div>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Remove Student?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Remove <strong>{studentName}</strong> from Room {room.roomNumber}?
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={async () => {
                                              const result = await removeStudentFromRoom(studentId, hostel._id || hostel.id, room._id || room.id);
                                              if (result.success) toast.success(`${studentName} removed from room`);
                                            }}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          >
                                            Remove
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-2 pt-2">
                          <Dialog
                            open={isAssignDialogOpen && selectedRoomId === room._id}
                            onOpenChange={(open) => {
                              setIsAssignDialogOpen(open);
                              if (open) setSelectedRoomId(room._id);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-[12px] font-normal rounded-md flex items-center justify-center"
                                disabled={isFull}
                                onClick={() => setSelectedRoomId(room._id)}
                              >
                                <Users className="mr-2 h-4 w-4" />
                                Assign
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Assign Student to Room {room.roomNumber}</DialogTitle>
                                <DialogDescription>
                                  Select an unassigned student to place in this room
                                </DialogDescription>
                              </DialogHeader>
                              <div className="mt-4 space-y-4">
                                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a student" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {unassignedStudents.map((student) => {
                                      const displayName = student.user?.name || student.name || student.collegeNumber || 'Unknown';
                                      return (
                                        <SelectItem key={student._id || student.id} value={student._id || student.id}>
                                          {displayName} ({student.collegeNumber})
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                                {unassignedStudents.length === 0 && (
                                  <p className="text-sm text-muted-foreground">
                                    All students are already assigned to rooms
                                  </p>
                                )}
                                <div className="flex justify-end gap-3">
                                  <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleAssignStudent} disabled={!selectedStudent}>
                                    Assign Student
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-[12px] font-normal rounded-md flex items-center justify-center"
                            onClick={() => {
                              setSelectedRoomId(room._id);
                              setIsInventoryDialogOpen(true);
                            }}
                          >
                            <Package className="mr-2 h-4 w-4" />
                            Items
                          </Button>
                          <div className="flex items-center justify-end gap-1 border-t border-border pt-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                              onClick={() => handleEditRoom(room)}
                            >
                              <Edit className="h-[14px] w-[14px]" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                                >
                                  <Trash2 className="h-[14px] w-[14px]" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Room {room.roomNumber}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Delete this room? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={async () => {
                                      const result = await deleteRoom(hostel._id || hostel.id, room._id || room.id);
                                      if (result.success) toast.success('Room deleted');
                                    }}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete Room
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Shared Inventory Dialog */}
      <Dialog open={isInventoryDialogOpen} onOpenChange={setIsInventoryDialogOpen}>
        <DialogContent className="max-w-3xl h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Room {selectedRoom?.roomNumber} Inventory</DialogTitle>
            <DialogDescription>
              Manage furniture and equipment for this room
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-6">
            {selectedRoom?.inventory?.length > 0 ? (
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                {selectedRoom?.inventory?.map((item, index) => (
                  <div
                    key={item._id || item.id || index}
                    className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{item.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                        onClick={() => deleteRoomInventory(selectedHostel, selectedRoom._id || selectedRoom.id, item._id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-1 items-center gap-2">
                        <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Qty</Label>
                        <Input
                          type="number"
                          className="h-8 w-16 text-xs"
                          defaultValue={item.quantity}
                          onBlur={(e) => {
                            const val = parseInt(e.target.value);
                            if (val !== item.quantity && val > 0) {
                              updateRoomInventory(selectedHostel, selectedRoom._id || selectedRoom.id, item._id, { quantity: val });
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <Select
                          defaultValue={item.condition}
                          onValueChange={(val) => {
                            if (val !== item.condition) {
                              updateRoomInventory(selectedHostel, selectedRoom._id || selectedRoom.id, item._id, { condition: val });
                            }
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Good">Good</SelectItem>
                            <SelectItem value="Fair">Fair</SelectItem>
                            <SelectItem value="Poor">Poor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-border rounded-xl">
                <Package className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No items in this room yet</p>
              </div>
            )}

            <div className="rounded-xl border border-border p-4 bg-muted/10">
              <h4 className="mb-3 text-sm font-bold flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Item
              </h4>
              <form onSubmit={handleAddInventory} className="space-y-3">
                <Input
                  placeholder="Item name (e.g. Bed, Chair)"
                  value={inventoryForm.name}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })}
                  className="rounded-lg"
                />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={inventoryForm.quantity}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })}
                    className="w-20 rounded-lg"
                  />
                  <Select
                    value={inventoryForm.condition}
                    onValueChange={(value) =>
                      setInventoryForm({ ...inventoryForm, condition: value })
                    }
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full rounded-lg shadow-sm">
                  Add to Room
                </Button>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout >
  );
};

export default Hostels;
