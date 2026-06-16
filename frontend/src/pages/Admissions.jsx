import React, { useState } from "react";
import {
  UserPlus,
  Search,
  Trash2,
  Edit,
  Users,
  Eye,
  EyeOff,
  Loader2,
  MoreVertical,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useHostel } from "@/context/useHostel";
import { toast } from "sonner";

const Admissions = () => {
  const { students, hostels, addStudent, deleteStudent, updateStudent } =
    useHostel();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    flip: false,
  });
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    organizationName: "",
    boardingNumber: "",
    password: "",
    fee: "",
    // program: '',
    // department: '',
    // year: '',
    occupation: "",
    occupationOther: "",
    hostelName: "",
    roomNumber: "",
    contactNumber: "",
    parentContact: "",
    email: "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) newErrors.name = "Name is required";
    if (!formData.fatherName?.trim())
      newErrors.fatherName = "Father name is required";
    if (!formData.boardingNumber?.toString().trim()) {
      newErrors.boardingNumber = "Boarding number is required";
    }
    if (!editingStudent && !formData.password) {
      newErrors.password = "Password is required for new students";
    }
    if (!formData.occupation) newErrors.occupation = "Occupation is required";
    if (formData.occupation === "other" && !formData.occupationOther) {
      newErrors.occupationOther = "Please specify your occupation";
    }
    if (!formData.organizationName?.trim())
      newErrors.organizationName = "Organization/Institution name is required";
    if (!formData.fee) newErrors.fee = "Decided fee is required";
    // if (!formData.program) newErrors.program = 'Program is required';
    // if (!formData.department) newErrors.department = 'Department is required';
    // if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.contactNumber?.trim()) {
      newErrors.contactNumber = "Contact number is required";
    }
    if (!formData.parentContact?.trim()) {
      newErrors.parentContact = "Parent contact is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form data on submit:", formData);

    if (!validateForm()) {
      console.log("Validation failed:", errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        contact: formData.contactNumber, // Backend expects 'contact'
      };

      console.log("Data being sent to server:", dataToSubmit);

      let result;
      if (editingStudent) {
        const studentId = editingStudent._id || editingStudent.id;
        console.log("Updating student with ID:", studentId);
        result = await updateStudent(studentId, dataToSubmit);
        if (result?.success) toast.success("Student updated successfully");
      } else {
        result = await addStudent(dataToSubmit);
        if (result?.success) toast.success("Student admitted successfully");
      }

      if (result?.success) {
        setFormData({
          name: "",
          fatherName: "",
          boardingNumber: "",
          password: "",
          // program: '',
          // department: '',
          // year: '',
          fee: "",
          occupation: "",
          organizationName: "",
          hostelName: "",
          roomNumber: "",
          contactNumber: "",
          parentContact: "",
          email: "",
        });
        setEditingStudent(null);
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("An unexpected error occurred during submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (student) => {
    console.log("Original student data:", student);

    setEditingStudent(student);
    setFormData({
      name: student.name || student.user?.name || "",
      fatherName: student.fatherName || "",
      password: "",
      hostelName:
        student.room?.hostel?.name ||
        student.hostel?.name ||
        student.hostelName ||
        "",
      roomNumber: (
        student.room?.roomNumber ||
        student.roomNumber ||
        ""
      ).toString(),
      boardingNumber: student.boardingNumber || "",
      contactNumber: student.contactNumber || student.contact || "",
      parentContact: student.parentContact || "",
      email: student.user?.email || student.email || "",
      fee: student.fee || "",
      occupation: student.occupation || "",
      occupationOther: student.occupationOther || "",
      organizationName: student.organizationName || "",
    });

    setIsDialogOpen(true);
  };
  const handleView = (student) => {
    setViewingStudent(student);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      const result = await deleteStudent(id);
      if (result.success) toast.success("Student removed successfully");
    }
  };

  const handleMenuClick = (e, studentId) => {
    e.stopPropagation();

    if (openMenuId === studentId) {
      setOpenMenuId(null);
      return;
    }

    const buttonRect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 140; // Approximate height of dropdown
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    // Determine if we should flip the dropdown upward
    const shouldFlip = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    setMenuPosition({
      top: shouldFlip ? buttonRect.top - dropdownHeight : buttonRect.bottom + 4,
      left: buttonRect.right - 130, // Align right edge of dropdown with button
      flip: shouldFlip,
    });

    setOpenMenuId(studentId);
  };

  // Department color mapping
  // const getDepartmentColor = (department) => {
  //   const colors = {
  //     'Computer Science': { bg: '#EEF2FF', text: '#4338CA' }, // Soft indigo
  //     'Pre-Engineering': { bg: '#F0FDFA', text: '#0F766E' }, // Soft teal
  //     'Pre-Medical': { bg: '#FFFBEB', text: '#B45309' }, // Soft amber
  //     'Arts': { bg: '#F0FDF4', text: '#15803D' }, // Soft green
  //     'English': { bg: '#FDF2F8', text: '#BE185D' }, // Soft pink
  //     'Political Science': { bg: '#EEF2FF', text: '#4338CA' }, // Soft indigo
  //     'Law': { bg: '#FEF2F2', text: '#B91C1C' }, // Soft red
  //     'HND': { bg: '#F0FDFA', text: '#0F766E' }, // Soft teal
  //     'BBA': { bg: '#FFF7ED', text: '#C2410C' }, // Soft orange
  //     'Economics': { bg: '#ECFEFF', text: '#0E7490' }, // Soft cyan
  //   };
  //   return colors[department] || { bg: '#F8FAFC', text: '#475569' }; // Default soft gray
  // };

  const filteredStudents = students.filter(
    (student) =>
      (student.name || student.user?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (student.boardingNumber || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between animate-fade-in">
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 500,
              color: "#0F172A",
              fontFamily: "Inter, system-ui, sans-serif",
              marginBottom: "4px",
            }}
          >
            Admissions
          </h1>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 300,
              color: "#94A3B8",
              margin: 0,
            }}
          >
            View and manage all student admission records
          </p>
        </div>
        <Drawer open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DrawerTrigger asChild>
            <Button
              onClick={() => {
                setEditingStudent(null);
                setFormData({
                  name: "",
                  fatherName: "",
                  boardingNumber: "",
                  password: "",
                  occupation: "",
                  organizationName: "",
                  fee: "",
                  // program: '',
                  // department: '',
                  // year: '',
                  hostelName: "",
                  roomNumber: "",
                  contactNumber: "",
                  parentContact: "",
                  email: "",
                });
                setErrors({});
              }}
              style={{
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 400,
                padding: "6px 14px",
                height: "34px",
                flexShrink: 0,
              }}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              New Admission
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle style={{ fontSize: "18px", fontWeight: 600 }}>
                {editingStudent ? "Edit Student" : "New Student Admission"}
              </DrawerTitle>
            </DrawerHeader>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <style>
                {`
                  .admission-form label {
                    font-size: 13px;
                    font-weight: 500;
                  }
                  .admission-form input,
                  .admission-form input::placeholder {
                    font-size: 13px;
                    font-weight: 400;
                    height: 36px;
                    padding: 6px 10px;
                    border-radius: 4px;
                  }
                  .admission-form button[type="button"] > div {
                    font-size: 13px;
                    font-weight: 400;
                    height: 36px;
                    padding: 6px 10px;
                    border-radius: 4px;
                  }
                  .admission-form .error-text {
                    font-size: 12px;
                  }
                `}
              </style>
              <div className="admission-form grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                <div>
                  <Label
                    htmlFor="name"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Student Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter full name"
                    className={errors.name ? "border-destructive" : ""}
                    style={{
                      fontSize: "13px",
                      fontWeight: 400,
                      height: "36px",
                      padding: "6px 10px",
                      borderRadius: "4px",
                    }}
                  />
                  {errors.name && (
                    <p
                      className="mt-1 error-text text-destructive"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="fatherName"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Father's Name
                  </Label>
                  <Input
                    id="fatherName"
                    value={formData.fatherName}
                    onChange={(e) =>
                      setFormData({ ...formData, fatherName: e.target.value })
                    }
                    placeholder="Enter father's name"
                    className={errors.fatherName ? "border-destructive" : ""}
                    style={{
                      fontSize: "13px",
                      fontWeight: 400,
                      height: "36px",
                      padding: "6px 10px",
                      borderRadius: "4px",
                    }}
                  />
                  {errors.fatherName && (
                    <p
                      className="mt-1 error-text text-destructive"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.fatherName}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="email"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Email (Optional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="student@example.com"
                    style={{
                      fontSize: "13px",
                      fontWeight: 400,
                      height: "36px",
                      padding: "6px 10px",
                      borderRadius: "4px",
                    }}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="boardingNumber"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Boarding Number
                  </Label>
                  <Input
                    id="boardingNumber"
                    value={formData.boardingNumber}
                    type="number"
                    placeholder="Enter boarding number"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        boardingNumber: e.target.value,
                      })
                    }
                    className={
                      errors.boardingNumber ? "border-destructive" : ""
                    }
                    style={{
                      fontSize: "13px",
                      fontWeight: 400,
                      height: "36px",
                      padding: "6px 10px",
                      borderRadius: "4px",
                    }}
                  />
                  {errors.boardingNumber && (
                    <p
                      className="mt-1 error-text text-destructive"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.boardingNumber}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="contactNumber"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Contact Number
                  </Label>
                  <Input
                    id="contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactNumber: e.target.value,
                      })
                    }
                    placeholder="03XXXXXXXXX"
                    className={errors.contactNumber ? "border-destructive" : ""}
                    style={{
                      fontSize: "13px",
                      fontWeight: 400,
                      height: "36px",
                      padding: "6px 10px",
                      borderRadius: "4px",
                    }}
                  />
                  {errors.contactNumber && (
                    <p
                      className="mt-1 error-text text-destructive"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.contactNumber}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="parentContact"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Parent Contact
                  </Label>
                  <Input
                    id="parentContact"
                    value={formData.parentContact}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        parentContact: e.target.value,
                      })
                    }
                    placeholder="03XXXXXXXXX"
                    className={errors.parentContact ? "border-destructive" : ""}
                    style={{
                      fontSize: "13px",
                      fontWeight: 400,
                      height: "36px",
                      padding: "6px 10px",
                      borderRadius: "4px",
                    }}
                  />
                  {errors.parentContact && (
                    <p
                      className="mt-1 error-text text-destructive"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.parentContact}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="hostelName"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Hostel
                  </Label>
                  <Select
                    value={formData.hostelName}
                    onValueChange={(value) =>
                      setFormData({ ...formData, hostelName: value })
                    }
                  >
                    <SelectTrigger
                      className={errors.hostelName ? "border-destructive" : ""}
                      style={{
                        fontSize: "13px",
                        fontWeight: 400,
                        height: "36px",
                        padding: "6px 10px",
                        borderRadius: "4px",
                      }}
                    >
                      <SelectValue placeholder="Select hostel" />
                    </SelectTrigger>
                    <SelectContent>
                      {hostels.map((hostel) => (
                        <SelectItem
                          key={hostel._id || hostel.id}
                          value={hostel.name}
                        >
                          {hostel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.hostelName && (
                    <p
                      className="mt-1 error-text text-destructive"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.hostelName}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="occupation"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Occupation
                  </Label>
                  <Select
                    value={formData.occupation}
                    onValueChange={(value) =>
                      setFormData({ ...formData, occupation: value })
                    }
                  >
                    <SelectTrigger
                      className={errors.occupation ? "border-destructive" : ""}
                      style={{
                        fontSize: "13px",
                        fontWeight: 400,
                        height: "36px",
                        padding: "6px 10px",
                        borderRadius: "4px",
                      }}
                    >
                      <SelectValue placeholder="Select occupation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9">9th Student</SelectItem>
                      <SelectItem value="10">10th Student</SelectItem>
                      <SelectItem value="11">1st Year Student</SelectItem>
                      <SelectItem value="12">2nd Year Student</SelectItem>
                      <SelectItem value="mbbs">MBBS Student</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.occupation && (
                    <p
                      className="mt-1 error-text text-destructive"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.occupation}
                    </p>
                  )}
                </div>
                {formData.occupation === "other" && (
                  <div>
                    <Label
                      htmlFor="occupationOther"
                      style={{ fontSize: "13px", fontWeight: 500 }}
                    >
                      Please specify
                    </Label>
                    <Input
                      id="occupationOther"
                      value={formData.occupationOther || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          occupationOther: e.target.value,
                        })
                      }
                      placeholder="Enter your occupation"
                      className={
                        errors.occupationOther ? "border-destructive" : ""
                      }
                      style={{
                        fontSize: "13px",
                        fontWeight: 400,
                        height: "36px",
                        padding: "6px 10px",
                        borderRadius: "4px",
                      }}
                    />
                    {errors.occupationOther && (
                      <p
                        className="mt-1 error-text text-destructive"
                        style={{ fontSize: "12px" }}
                      >
                        {errors.occupationOther}
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <Label
                    htmlFor="name"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Organization/Institution Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.organizationName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organizationName: e.target.value,
                      })
                    }
                    placeholder="Enter organization name"
                    className={
                      errors.organizationName ? "border-destructive" : ""
                    }
                    style={{
                      fontSize: "13px",
                      fontWeight: 400,
                      height: "36px",
                      padding: "6px 10px",
                      borderRadius: "4px",
                    }}
                  />
                  {errors.organizationName && (
                    <p
                      className="mt-1 error-text text-destructive"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.organizationName}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="fee"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Decided Fee
                  </Label>
                  <Input
                    id="fee"
                    value={formData.fee}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || Number(value) >= 0) {
                        setFormData({ ...formData, fee: value });
                      }
                    }}
                    type="number"
                    min="0"
                    placeholder="Enter decided fee"
                    className={errors.fee ? "border-destructive" : ""}
                    style={{
                      fontSize: "13px",
                      fontWeight: 400,
                      height: "36px",
                      padding: "6px 10px",
                      borderRadius: "4px",
                    }}
                  />
                  {errors.fee && (
                    <p
                      className="mt-1 error-text text-destructive"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.fee}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="roomNumber"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Room Number
                  </Label>
                  <Select
                    value={formData.roomNumber}
                    onValueChange={(value) =>
                      setFormData({ ...formData, roomNumber: value })
                    }
                    disabled={!formData.hostelName}
                  >
                    <SelectTrigger
                      style={{
                        fontSize: "13px",
                        fontWeight: 400,
                        height: "36px",
                        padding: "6px 10px",
                        borderRadius: "4px",
                      }}
                    >
                      <SelectValue
                        placeholder={
                          formData.hostelName
                            ? "Select room"
                            : "Select hostel first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {hostels
                        .find((h) => h.name === formData.hostelName)
                        ?.rooms.map((room) => {
                          const isFull = room.currentOccupants >= room.capacity;
                          return (
                            <SelectItem
                              key={room._id || room.id}
                              value={room.roomNumber}
                              disabled={
                                isFull &&
                                (!editingStudent ||
                                  editingStudent.room?.roomNumber !==
                                    room.roomNumber)
                              }
                            >
                              Room {room.roomNumber} ({room.floor} -{" "}
                              {room.seatType})
                              {isFull
                                ? " (Full)"
                                : ` (${room.currentOccupants}/${room.capacity})`}
                            </SelectItem>
                          );
                        })}
                      {hostels.find((h) => h.name === formData.hostelName)
                        ?.rooms.length === 0 && (
                        <SelectItem value="none" disabled>
                          No rooms in this hostel
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="password"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    {editingStudent
                      ? "New Password (Leave blank to keep current)"
                      : "Login Password"}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder={
                        editingStudent
                          ? "Leave blank to keep existing"
                          : "••••••••"
                      }
                      className={
                        errors.password ? "border-destructive pr-10" : "pr-10"
                      }
                      style={{
                        fontSize: "13px",
                        fontWeight: 400,
                        height: "36px",
                        padding: "6px 10px",
                        borderRadius: "4px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p
                      className="mt-1 error-text text-destructive"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  style={{ borderRadius: "5px" }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ borderRadius: "5px" }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : editingStudent ? (
                    "Update Student"
                  ) : (
                    "Admit Student"
                  )}
                </Button>
              </div>
            </form>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Search and Stats */}
      <div className="mb-6 flex items-center gap-4 animate-slide-up">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or boarding number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            style={{
              borderRadius: "7px",
              border: "0.5px solid #E2E8F0",
              backgroundColor: "#FFFFFF",
              fontSize: "12px",
              fontWeight: 300,
            }}
          />
          <style>
            {`
              input::placeholder {
                color: #94A3B8;
                font-weight: 300;
              }
            `}
          </style>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2"
          style={{
            borderRadius: "7px",
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            border: "0.5px solid rgba(99, 102, 241, 0.2)",
          }}
        >
          <Users className="h-5 w-5 text-primary" />
          <span style={{ fontSize: "12px", fontWeight: 400, color: "#0F172A" }}>
            {students.length} Students
          </span>
        </div>
      </div>

      {/* Students Table */}
      <div
        className="rounded-xl border border-border bg-card shadow-card animate-slide-up"
        style={{ animationDelay: "100ms" }}
      >
        <Table>
          <TableHeader>
            <TableRow style={{ borderBottom: "0.5px solid #E2E8F0" }}>
              <TableHead
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#0F172A",
                  textAlign: "left",
                  verticalAlign: "middle",
                  padding: "14px 16px",
                }}
              >
                Boarding No.
              </TableHead>
              <TableHead
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#0F172A",
                  textAlign: "left",
                  verticalAlign: "middle",
                  padding: "14px 16px",
                }}
              >
                Name
              </TableHead>
              <TableHead
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#0F172A",
                  textAlign: "left",
                  verticalAlign: "middle",
                  padding: "14px 16px",
                }}
              >
                Hostel
              </TableHead>
              <TableHead
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#0F172A",
                  textAlign: "left",
                  verticalAlign: "middle",
                  padding: "14px 16px",
                }}
              >
                Room
              </TableHead>
              <TableHead
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#0F172A",
                  textAlign: "left",
                  verticalAlign: "middle",
                  padding: "14px 16px",
                }}
              >
                Contact
              </TableHead>
              <TableHead
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#0F172A",
                  textAlign: "right",
                  verticalAlign: "middle",
                  padding: "14px 16px",
                }}
              >
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Users className="h-12 w-12 mb-2 opacity-20" />
                    <p>No students found</p>
                    <p className="text-sm">Add a new student to get started</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow
                  key={student._id || student.id}
                  style={{
                    height: "44px",
                    borderBottom: "0.5px solid #F1F5F9",
                  }}
                >
                  <TableCell
                    style={{
                      fontSize: "12px",
                      fontWeight: 400,
                      color: "#374151",
                      textAlign: "left",
                      verticalAlign: "middle",
                      padding: "10px 16px",
                    }}
                  >
                    {student.boardingNumber}
                  </TableCell>
                  <TableCell
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#111827",
                      textAlign: "left",
                      verticalAlign: "middle",
                      padding: "10px 16px",
                    }}
                  >
                    {student.user?.name || student.name}
                  </TableCell>
                  <TableCell
                    style={{
                      fontSize: "12px",
                      fontWeight: 400,
                      color: "#374151",
                      textAlign: "left",
                      verticalAlign: "middle",
                      padding: "10px 16px",
                    }}
                  >
                    {student.room?.hostel?.name ||
                      student.hostel?.name ||
                      student.hostelName ||
                      "-"}
                  </TableCell>
                  <TableCell
                    style={{
                      fontSize: "12px",
                      fontWeight: 400,
                      color: "#374151",
                      textAlign: "left",
                      verticalAlign: "middle",
                      padding: "10px 16px",
                    }}
                  >
                    {student.room?.roomNumber || student.roomNumber || "-"}
                  </TableCell>
                  <TableCell
                    style={{
                      fontSize: "12px",
                      fontWeight: 400,
                      color: "#374151",
                      textAlign: "left",
                      verticalAlign: "middle",
                      padding: "10px 16px",
                    }}
                  >
                    {student.contact || student.contactNumber}
                  </TableCell>
                  <TableCell
                    style={{
                      textAlign: "right",
                      verticalAlign: "middle",
                      padding: "10px 16px",
                    }}
                  >
                    <div className="relative inline-block">
                      <button
                        onClick={(e) =>
                          handleMenuClick(e, student._id || student.id)
                        }
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                        }}
                      >
                        <MoreVertical
                          style={{
                            width: "16px",
                            height: "16px",
                            color: "#94A3B8",
                          }}
                        />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Fixed Position Dropdown Menu */}
      {openMenuId && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setOpenMenuId(null)}
            style={{ background: "transparent" }}
          />
          <div
            className="fixed z-[9999]"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              backgroundColor: "#FFFFFF",
              borderRadius: "7px",
              border: "0.5px solid #E2E8F0",
              padding: "4px",
              minWidth: "130px",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
          >
            <button
              onClick={() => {
                const student = filteredStudents.find(
                  (s) => (s._id || s.id) === openMenuId,
                );
                if (student) handleView(student);
                setOpenMenuId(null);
              }}
              className="w-full flex items-center gap-2 transition-colors"
              style={{
                height: "32px",
                padding: "0 10px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                borderRadius: "5px",
                fontSize: "12px",
                fontWeight: 400,
                color: "#374151",
                textAlign: "left",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#F8FAFC")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <Eye
                style={{ width: "14px", height: "14px", color: "#64748B" }}
              />
              View
            </button>
            <button
              onClick={() => {
                const student = filteredStudents.find(
                  (s) => (s._id || s.id) === openMenuId,
                );
                if (student) handleEdit(student);
                setOpenMenuId(null);
              }}
              className="w-full flex items-center gap-2 transition-colors"
              style={{
                height: "32px",
                padding: "0 10px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                borderRadius: "5px",
                fontSize: "12px",
                fontWeight: 400,
                color: "#374151",
                textAlign: "left",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#F8FAFC")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <Edit
                style={{ width: "14px", height: "14px", color: "#64748B" }}
              />
              Edit
            </button>
            <div
              style={{
                height: "0.5px",
                backgroundColor: "#F1F5F9",
                margin: "2px 0",
              }}
            />
            <button
              onClick={() => {
                handleDelete(openMenuId);
                setOpenMenuId(null);
              }}
              className="w-full flex items-center gap-2 transition-colors"
              style={{
                height: "32px",
                padding: "0 10px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                borderRadius: "5px",
                fontSize: "12px",
                fontWeight: 400,
                color: "#EF4444",
                textAlign: "left",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#FEF2F2")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <Trash2
                style={{ width: "14px", height: "14px", color: "#EF4444" }}
              />
              Delete
            </button>
          </div>
        </>
      )}

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Student Details
            </DialogTitle>
          </DialogHeader>
          {viewingStudent && (
            <div className="mt-4 grid gap-6 md:grid-cols-3 lg:grid-cols-4">
              <div>
                <Label className="text-muted-foreground">Student Name</Label>
                <p className="mt-1 font-medium">{viewingStudent.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Father's Name</Label>
                <p className="mt-1 font-medium">{viewingStudent.fatherName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Boarding No</Label>
                <p className="mt-1 font-medium">
                  {viewingStudent.boardingNumber}
                </p>
              </div>

              {/* <div>
                <Label className="text-muted-foreground">Program</Label>
                <p className="mt-1 font-medium">{viewingStudent.department || viewingStudent.program}</p>
              </div> */}
              {/* <div>
                <Label className="text-muted-foreground">Year/Semester</Label>
                <p className="mt-1 font-medium">{viewingStudent.year}</p>
              </div> */}
              <div>
                <Label className="text-muted-foreground">Contact Number</Label>
                <p className="mt-1 font-medium">
                  {viewingStudent.contactNumber}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Parent Contact</Label>
                <p className="mt-1 font-medium">
                  {viewingStudent.parentContact || "-"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Hostel</Label>
                <p className="mt-1 font-medium">
                  {viewingStudent.room?.hostel?.name || "-"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Room</Label>
                <p className="mt-1 font-medium">
                  {viewingStudent.room?.roomNumber || "-"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="mt-1 font-medium">
                  {viewingStudent.user?.email || "-"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Occupation</Label>
                <p className="mt-1 font-medium">
                  {viewingStudent.occupation || "-"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">
                  Occupation Other
                </Label>
                <p className="mt-1 font-medium">
                  {viewingStudent.occupationOther || "-"}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Admissions;
