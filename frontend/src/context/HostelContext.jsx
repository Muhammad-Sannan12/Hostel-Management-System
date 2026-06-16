import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { Theater } from "lucide-react";

export const HostelContext = createContext(undefined);

// Configure axios instance for global defaults
const API = axios.create({
  baseURL: "http://localhost:5001/api",
  withCredentials: true,
});

export const HostelProvider = ({ children }) => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [challans, setChallans] = useState([]);
  const [students, setStudents] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [messAttendance, setMessAttendance] = useState([]);
  const [messMenu, setMessMenu] = useState([]);
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [messInventory, setMessInventory] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const isAdmin =
          user?.role === "admin" ||
          user?.role === "superadmin" ||
          user?.isAdmin;

        const endpoints = [
          isAdmin ? API.get("/students") : API.get("/students/me"),
          API.get("/hostels"),
          API.get("/rooms"),
          API.get("/mess/menu"),
          API.get("/mess/attendance"),
          // API.get('/inventory'),  // 👈 added
          isAdmin ? API.get("/leaves") : API.get("/leaves/me"),
          isAdmin ? API.get("/complaints") : Promise.resolve({ data: [] }),
          isAdmin ? API.get("/challans") : API.get("/challans/me"), // 👈 added
          API.get("/inventory"), // 👈 added
          API.get("/mess/inventory"),
        ];

        const [
          studentsRes,
          hostelsRes,
          roomsRes,
          menuRes,
          attendanceRes,
          leavesRes,
          complaintsRes,
          challansRes, // 👈 added
          inventoryRes, // 👈 added
          messInventoryRes,
        ] = await Promise.all(endpoints);

        setStudents(isAdmin ? studentsRes.data : [studentsRes.data]);
        // console.log('Fetched students:', studentsRes.data);
        // console.log('students',students)
        const hostelsWithRooms = hostelsRes.data.map((h) => ({
          ...h,
          rooms: roomsRes.data.filter(
            (r) => r.hostel?._id === h._id || r.hostel === h._id,
          ),
        }));
        setHostels(hostelsWithRooms);

        setMessMenu(menuRes.data);

        let finalLogs = attendanceRes.data;
        if (!isAdmin && user?._id) {
          const studentId = studentsRes.data._id;
          finalLogs = attendanceRes.data.filter((l) => {
            const logStudentId = l.student?._id || l.student;
            return logStudentId === studentId;
          });
        }
        setMessAttendance(finalLogs);
        setLeaveApplications(leavesRes.data);

        if (isAdmin) {
          setComplaints(complaintsRes.data);
        } else {
          try {
            const studentId = studentsRes.data?._id || studentsRes.data?.id;
            if (studentId) {
              const studentComplaintsRes = await API.get(
                `/complaints/my?studentId=${studentId}`,
              );
              setComplaints(studentComplaintsRes.data);
            } else {
              setComplaints([]);
            }
          } catch (err) {
            console.error("Error fetching student complaints:", err);
            setComplaints([]);
          }
        }

        // Set challans 👈 added
        setChallans(challansRes.data ?? []);
        // console.log('Fetched challans:', challansRes.data);

        // Set inventory items 👈 added
        setInventoryItems(inventoryRes.data.data ?? []);
        // console.log('Fetched inventory items:', inventoryRes.data);
        // console.log(messInventoryRes.data.data??null)
        setMessInventory(messInventoryRes.data.data ?? []);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response?.status !== 403 && error.response?.status !== 401) {
          toast.error("Failed to load system data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);
  const messStockDeduction = async (deductions) => {
    try {
      const res = await API.post("/mess/stock", deductions);
      // console.log("messStockDeducResponse: ", res);

      // Check if response indicates success
      if (res?.data?.success) {
        return { success: true };
      } else {
        // Server responded but with a failure status
        throw new Error(res?.data?.message || "Stock deduction failed");
      }
    } catch (error) {
      console.error("messStockDeduction error:", error);
      // Re-throw so the caller can catch it and show toast
      throw error;
    }
  };
  // Inventory CRUD
  const addInventoryItem = async (itemData) => {
    try {
      const response = await API.post("/inventory", itemData);
      // console.log("Inventory item added:",response.data.data);
      setInventoryItems((prev) => [...prev, response.data.data]);
      return { success: true, data: response.data.data };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add inventory");
      return { success: false, error: error.response?.data?.message };
    }
  };

  const updateInventory = async (id, updates) => {
    try {
      const response = await API.put(`/inventory/${id}`, updates);
      setInventoryItems((prev) =>
        prev.map((item) => (item._id === id ? response.data : item)),
      );
      if (response?.data?.success) {
        return { success: true, data: response.data.data };
      } else {
        // Server responded but with a failure status
        throw new Error(
          response?.data?.message || "error filtering by category or purchase",
        );
      }
    } catch (error) {
      console.error("error filtering by category or purchase");
      throw error;
    }
  };
  const getFilteredInventory = async (category = null, date = null) => {
    try {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (date) params.append("purchase_date", date);

      const data = await API.get(`/inventory/filter?${params}`);
      // const data = await res.json();
      // console.log("usegetfilterfunction:", res);
      if (data?.data?.success) {
        return { success: true, data: data.data.data };
      } else {
        // Server responded but with a failure status
        throw new Error(
          data?.data?.message || "error filtering by category or purchase",
        );
      }
    } catch (error) {
      console.error("error filtering by category or purchase");
      throw error;
    }
  };
  const deleteInventory = async (id) => {
    // console.log(id)
    try {
      // console.log(id);
      const response = await API.delete(`/inventory/${id}`);
      console.log("response", response.data);
      if (response?.data?.success) {
        setInventoryItems((prev) => prev.filter((item) => item._id !== id));
        return { success: true, data: response.data.data };
      } else {
        console.log("error  deleteing item");
        throw new Error(response?.message);
      }
    } catch (error) {
      console.error("error deleteing item");
      throw error;
    }
  };
  // Challan CRUD

  const createChallan = async (challanData) => {
    try {
      const response = await API.post("/challans", challanData);

      // const challansRes = await API.get('/challans');
      // console.log("Challans hostel Context",challansRes) // re-fetch fresh data
      // setChallans(challansRes.data);                  // set full updated list
      setChallans((prev) => [response.data.data, ...prev]);

      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create challan");
      return { success: false, error: error.response?.data?.message };
    }
  };
  // Student CRUD
  const addStudent = async (studentData) => {
    try {
      const response = await API.post("/students", studentData);

      // Re-fetch rooms to update occupancy
      const [hostelsRes, roomsRes] = await Promise.all([
        API.get("/hostels"),
        API.get("/rooms"),
      ]);

      setStudents((prev) => [...prev, response.data.student]);

      const hostelsWithRooms = hostelsRes.data.map((h) => ({
        ...h,
        rooms: roomsRes.data.filter(
          (r) => r.hostel?._id === h._id || r.hostel === h._id,
        ),
      }));
      setHostels(hostelsWithRooms);

      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add student");
      return { success: false };
    }
  };

  const updateStudent = async (id, updates) => {
    try {
      const response = await API.put(`/students/${id}`, updates);

      // Re-fetch rooms to update occupancy
      const [hostelsRes, roomsRes] = await Promise.all([
        API.get("/hostels"),
        API.get("/rooms"),
      ]);

      setStudents((prev) =>
        prev.map((s) => (s._id === id ? response.data : s)),
      );

      const hostelsWithRooms = hostelsRes.data.map((h) => ({
        ...h,
        rooms: roomsRes.data.filter(
          (r) => r.hostel?._id === h._id || r.hostel === h._id,
        ),
      }));
      setHostels(hostelsWithRooms);

      return { success: true };
    } catch (error) {
      toast.error("Failed to update student");
      return { success: false };
    }
  };

  const deleteStudent = async (id) => {
    try {
      await API.delete(`/students/${id}`);

      // Re-fetch rooms to update occupancy
      const [hostelsRes, roomsRes] = await Promise.all([
        API.get("/hostels"),
        API.get("/rooms"),
      ]);

      setStudents((prev) => prev.filter((s) => s._id !== id));

      const hostelsWithRooms = hostelsRes.data.map((h) => ({
        ...h,
        rooms: roomsRes.data.filter(
          (r) => r.hostel?._id === h._id || r.hostel === h._id,
        ),
      }));
      setHostels(hostelsWithRooms);

      return { success: true };
    } catch (error) {
      toast.error("Failed to remove student");
      return { success: false };
    }
  };

  // Hostel (Building) CRUD
  const addHostel = async (hostelData) => {
    try {
      const response = await API.post("/hostels", hostelData);
      setHostels((prev) => [...prev, { ...response.data, rooms: [] }]);
      return { success: true, data: response.data };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add building");
      return { success: false };
    }
  };

  const deleteHostel = async (id) => {
    try {
      await API.delete(`/hostels/${id}`);
      setHostels((prev) =>
        prev.filter((h) => (h._id === id ? false : h.id !== id)),
      );
      return { success: true };
    } catch (error) {
      toast.error("Failed to remove building");
      return { success: false };
    }
  };

  const updateHostel = async (id, hostelData) => {
    try {
      const response = await API.put(`/hostels/${id}`, hostelData);
      setHostels((prev) =>
        prev.map((h) =>
          h._id === id || h.id === id ? { ...h, ...response.data } : h,
        ),
      );
      return { success: true, data: response.data };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update building");
      return { success: false };
    }
  };

  // Room CRUD
  const addRoom = async (hostelId, roomData) => {
    try {
      const response = await API.post("/rooms", {
        ...roomData,
        hostel: hostelId,
      });
      setHostels((prev) =>
        prev.map((h) =>
          h._id === hostelId ? { ...h, rooms: [...h.rooms, response.data] } : h,
        ),
      );
      return { success: true, data: response.data };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add room");
      return { success: false };
    }
  };

  const deleteRoom = async (hostelId, roomId) => {
    try {
      await API.delete(`/rooms/${roomId}`);
      setHostels((prev) =>
        prev.map((h) =>
          h._id === hostelId || h.id === hostelId
            ? {
                ...h,
                rooms: h.rooms.filter(
                  (r) => r._id !== roomId && r.id !== roomId,
                ),
              }
            : h,
        ),
      );
      return { success: true };
    } catch (error) {
      toast.error("Failed to remove room");
      return { success: false };
    }
  };

  const updateRoom = async (roomId, roomData) => {
    try {
      const response = await API.put(`/rooms/${roomId}`, roomData);
      setHostels((prev) =>
        prev.map((h) => ({
          ...h,
          rooms: h.rooms.map((r) =>
            r._id === roomId || r.id === roomId
              ? { ...r, ...response.data }
              : r,
          ),
        })),
      );
      return { success: true, data: response.data };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update room");
      return { success: false };
    }
  };
  // Attendance & Menu
  const markAttendance = async (attendance) => {
    console.log("🔵 markAttendance called with:", attendance);
    const recordDate = new Date(attendance.date).toISOString().split("T")[0];

    let savedOriginal = null;

    // IMMEDIATE optimistic UI update using functional form
    setMessAttendance((prev) => {
      // Find existing record in current state
      const existingRecord = prev.find((a) => {
        const aDate = new Date(a.date).toISOString().split("T")[0];
        return (
          (a.student?._id === attendance.studentId ||
            a.student === attendance.studentId) &&
          aDate === recordDate
        );
      });

      console.log("🔵 Existing record found:", existingRecord);

      // Save original for potential rollback
      savedOriginal = existingRecord ? { ...existingRecord } : null;

      // Create optimistic record
      const optimisticRecord = {
        _id: existingRecord?._id || `temp-${Date.now()}`,
        student: { _id: attendance.studentId },
        date: new Date(attendance.date),
        status: attendance.status,
        markedBy: user ? { _id: user._id, name: user.name } : null,
        createdAt: existingRecord?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      console.log("🟢 Creating optimistic record:", optimisticRecord);

      // Return new array - forces React to re-render
      if (existingRecord) {
        return prev.map((a) =>
          a._id === existingRecord._id ? optimisticRecord : a,
        );
      } else {
        return [...prev, optimisticRecord];
      }
    });

    try {
      // Make backend call
      const response = await API.post("/mess/attendance", attendance);
      console.log("✅ Backend response:", response.data);

      // Replace optimistic with real data
      setMessAttendance((prev) =>
        prev.map((a) => {
          const isMatch =
            a._id === response.data._id ||
            (a._id.toString().startsWith("temp-") &&
              (a.student?._id || a.student) ===
                (response.data.student?._id || response.data.student));

          return isMatch ? response.data : a;
        }),
      );

      return { success: true };
    } catch (error) {
      console.error("❌ Backend error:", error);

      // Rollback on error
      setMessAttendance((prev) => {
        if (savedOriginal) {
          return prev.map((a) =>
            a._id === savedOriginal._id ? savedOriginal : a,
          );
        } else {
          return prev.filter((a) => !a._id.toString().startsWith("temp-"));
        }
      });

      toast.error("Failed to mark attendance");
      return { success: false };
    }
  };

  const updateMessMenu = async (day, menu) => {
    try {
      const response = await API.put(`/mess/menu/${day}`, menu);
      setMessMenu((prev) => {
        const existingIndex = prev.findIndex((m) => m.day === day);
        if (existingIndex >= 0) {
          const newMenu = [...prev];
          newMenu[existingIndex] = response.data;
          return newMenu;
        } else {
          return [...prev, response.data];
        }
      });
      return { success: true };
    } catch (error) {
      toast.error("Failed to update menu");
      return { success: false };
    }
  };

  // Leave Applications
  const addLeaveApplication = async (application) => {
    try {
      const response = await API.post("/leaves", application);
      setLeaveApplications((prev) => [...prev, response.data]);
      return { success: true };
    } catch (error) {
      toast.error("Failed to submit leave application");
      return { success: false };
    }
  };

  const updateLeaveStatus = async (id, status, remarks = "") => {
    try {
      const response = await API.put(`/leaves/${id}`, { status, remarks });
      setLeaveApplications((prev) =>
        prev.map((a) => (a._id === id ? response.data : a)),
      );
      return { success: true };
    } catch (error) {
      toast.error("Failed to update leave status");
      return { success: false };
    }
  };

  const assignStudentToRoom = async (studentId, hostelId, roomId) => {
    try {
      await API.put(`/students/${studentId}`, { room: roomId });
      // Re-fetch data to sync all counts
      const [studentsRes, roomsRes] = await Promise.all([
        API.get("/students"),
        API.get("/rooms"),
      ]);
      setStudents(studentsRes.data);
      setHostels((prev) =>
        prev.map((h) => ({
          ...h,
          rooms: roomsRes.data.filter(
            (r) => (r.hostel?._id || r.hostel) === h._id,
          ),
        })),
      );
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to assign student";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const removeStudentFromRoom = async (studentId, hostelId, roomId) => {
    try {
      await API.put(`/students/${studentId}`, { room: null });
      // Re-fetch data
      const [studentsRes, roomsRes] = await Promise.all([
        API.get("/students"),
        API.get("/rooms"),
      ]);
      setStudents(studentsRes.data);
      setHostels((prev) =>
        prev.map((h) => ({
          ...h,
          rooms: roomsRes.data.filter(
            (r) => (r.hostel?._id || r.hostel) === h._id,
          ),
        })),
      );
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to remove student";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const getStudentById = (id) =>
    students.find((s) => s._id === id || s.id === id);

  const getStudentAttendanceStats = (studentId) => {
    const studentRecords = messAttendance.filter(
      (a) => a.student?._id === studentId || a.student === studentId,
    );
    const total = studentRecords.length;
    const present = studentRecords.filter((a) => a.status === "Present").length;
    const absent = studentRecords.filter((a) => a.status === "Absent").length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, percentage };
  };

  const getStudentAttendanceHistory = (studentId) => {
    return messAttendance
      .filter((a) => a.student?._id === studentId || a.student === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getStudentLeaveHistory = (studentId) => {
    return leaveApplications
      .filter((l) => l.student?._id === studentId || l.student === studentId)
      .sort(
        (a, b) =>
          new Date(b.appliedDate || b.createdAt).getTime() -
          new Date(a.appliedDate || a.createdAt).getTime(),
      );
  };

  const addInventoryToRoom = async (hostelId, roomId, item) => {
    try {
      const response = await API.post(`/rooms/${roomId}/inventory`, item);
      setHostels((prev) =>
        prev.map((h) => {
          if (h._id === hostelId || h.id === hostelId) {
            return {
              ...h,
              rooms: h.rooms.map((r) =>
                r._id === roomId || r.id === roomId ? response.data : r,
              ),
            };
          }
          return h;
        }),
      );
      return { success: true };
    } catch (error) {
      toast.error("Failed to add inventory item");
      return { success: false };
    }
  };

  const updateRoomInventory = async (hostelId, roomId, itemId, updates) => {
    try {
      const response = await API.put(
        `/rooms/${roomId}/inventory/${itemId}`,
        updates,
      );
      setHostels((prev) =>
        prev.map((h) => {
          if (h._id === hostelId || h.id === hostelId) {
            return {
              ...h,
              rooms: h.rooms.map((r) =>
                r._id === roomId || r.id === roomId ? response.data : r,
              ),
            };
          }
          return h;
        }),
      );
      return { success: true };
    } catch (error) {
      toast.error("Failed to update inventory item");
      return { success: false };
    }
  };

  const deleteRoomInventory = async (roomId, inventoryId) => {
    try {
      const hostelId = hostels.find((h) =>
        h.rooms?.some((r) => r._id === roomId || r.id === roomId),
      )?._id;
      await API.delete(`/rooms/${roomId}/inventory/${inventoryId}`);
      const response = await API.get(`/rooms/${roomId}`);
      setHostels((prev) =>
        prev.map((h) => {
          if (h._id === hostelId || h.id === hostelId) {
            return {
              ...h,
              rooms: h.rooms.map((r) =>
                r._id === roomId || r.id === roomId ? response.data : r,
              ),
            };
          }
          return h;
        }),
      );
      return { success: true };
    } catch (error) {
      toast.error("Failed to delete inventory item");
      return { success: false };
    }
  };

  // Complaint Management
  const addComplaint = async (complaintData) => {
    try {
      const response = await API.post("/complaints", complaintData);
      setComplaints((prev) => [response.data, ...prev]);
      return { success: true };
    } catch (error) {
      console.error(
        "Error submitting complaint:",
        error.response?.data || error.message,
      );
      toast.error("Failed to submit complaint");
      return { success: false };
    }
  };

  const updateComplaintStatus = async (
    id,
    status,
    adminRemarks = "",
    priority = null,
  ) => {
    try {
      const updateData = { status, adminRemarks };
      if (priority) updateData.priority = priority;

      const response = await API.put(`/complaints/${id}`, updateData);
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? response.data : c)),
      );
      return { success: true };
    } catch (error) {
      toast.error("Failed to update complaint status");
      return { success: false };
    }
  };

  const deleteComplaint = async (id) => {
    try {
      await API.delete(`/complaints/${id}`);
      setComplaints((prev) => prev.filter((c) => c._id !== id));
      return { success: true };
    } catch (error) {
      toast.error("Failed to delete complaint");
      return { success: false };
    }
  };

  return (
    <HostelContext.Provider
      value={{
        messInventory,
        inventoryItems,
        challans,
        students,
        hostels,
        messAttendance,
        messMenu,
        leaveApplications,
        complaints,
        loading,
        updateInventory,
        deleteInventory,
        getFilteredInventory,
        addInventoryItem,
        createChallan,
        addStudent,
        updateStudent,
        deleteStudent,
        addHostel,
        updateHostel,
        deleteHostel,
        addRoom,
        updateRoom,
        deleteRoom,
        messStockDeduction,
        addInventoryToRoom,
        updateRoomInventory,
        deleteRoomInventory,
        assignStudentToRoom,
        removeStudentFromRoom,
        markAttendance,
        updateMessMenu,
        addLeaveApplication,
        updateLeaveStatus,
        getStudentById,
        getStudentAttendanceStats,
        getStudentAttendanceHistory,
        getStudentLeaveHistory,
        addComplaint,
        updateComplaintStatus,
        deleteComplaint,
        setComplaints,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
      }}
    >
      {children}
    </HostelContext.Provider>
  );
};

// export const useHostel = () => {
//   const context = useContext(HostelContext);
//   if (context === undefined) {
//     throw new Error('useHostel must be used within a HostelProvider');
//   }
//   return context;
// }
