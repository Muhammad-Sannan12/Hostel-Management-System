import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useHostel } from '@/context/useHostel';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import {
  Users,
  Building2,
  Bed,
  CalendarOff,
  UserPlus,
  CheckCircle2,
  MessageSquare,
  ClipboardList,
  Search,
  Bell,
  Plus,
  ArrowUpRight,
  ChevronRight,
  AlertTriangle,
  UtensilsCrossed,
  FileText,
  User as UserIcon,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  const { students, hostels, leaveApplications, messAttendance, complaints } = useHostel();
  const { user } = useAuth();
  const hasAdminAccess = user?.role === 'admin' || user?.role === 'superadmin' || user?.isAdmin;

  // Admin Stats
  const totalStudents = students.length;
  const totalRooms = hostels.reduce((acc, h) => acc + h.rooms.length, 0);
  const occupiedBeds = hostels.reduce(
    (acc, h) => acc + h.rooms.reduce((r, room) => r + room.occupants.length, 0),
    0
  );
  const totalBeds = hostels.reduce(
    (acc, h) => acc + h.rooms.reduce((r, room) => r + room.capacity, 0),
    0
  );
  const pendingLeaves = leaveApplications.data?.filter((l) => l.status === 'Pending').length || 0;
  // const pendingLeaves = (leaveApplications?.data ?? leaveApplications)
  // .filter((l) => l.status === 'Pending').length;
  const openComplaints = complaints.filter(c => c.status === 'Pending' || c.status === 'In Progress').length;

  // Mess attendance today
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = messAttendance.filter(a => {
    const recordDate = new Date(a.date).toISOString().split('T')[0];
    return recordDate === today && a.status === 'Present';
  });
  const messAttendanceCount = todayAttendance.length;
  const messAttendanceTotal = students.length;

  // Sample room data
  const sampleRooms = hostels.slice(0, 1).flatMap(hostel => 
    hostel.rooms.slice(0, 6).map(room => ({
      roomNumber: room.roomNumber,
      block: hostel.name,
      student: room.occupants.length > 0 ? (room.occupants[0].name || room.occupants[0].user?.name || 'Student') : '-',
      messStatus: room.occupants.length > 0 ? 'Active' : 'Inactive',
      status: room.occupants.length >= room.capacity ? 'Occupied' : room.occupants.length > 0 ? 'Occupied' : 'Vacant'
    }))
  );

  // Student Stats
  const myLeaves = leaveApplications.filter(l => l.studentId === user?._id || l.collegeNumber === user?.collegeNumber);
  const myPendingLeaves = myLeaves.filter(l => l.status === 'Pending').length;
  const myAttendance = messAttendance.filter(a => a.studentId === user?._id || a.collegeNumber === user?.collegeNumber);
  const myAttendanceRate = myAttendance.length > 0
    ? Math.round((myAttendance.filter(a => a.status === 'Present').length / myAttendance.length) * 100)
    : 0;

  if (!hasAdminAccess) {
    return (
      <MainLayout>
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Hello, {user?.name || 'Student'}!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your personal hostel dashboard
          </p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '0.5px solid #E2E8F0',
            padding: '24px'
          }}>
            <CheckCircle2 style={{ width: '32px', height: '32px', color: '#6366F1', marginBottom: '12px' }} />
            <div style={{ fontSize: '28px', fontWeight: 500, color: '#0F172A', marginBottom: '4px' }}>
              {myAttendanceRate}%
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8' }}>
              Mess attendance
            </div>
          </div>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '0.5px solid #E2E8F0',
            padding: '24px'
          }}>
            <Clock style={{ width: '32px', height: '32px', color: '#F59E0B', marginBottom: '12px' }} />
            <div style={{ fontSize: '28px', fontWeight: 500, color: '#0F172A', marginBottom: '4px' }}>
              {myPendingLeaves}
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8' }}>
              Awaiting approval
            </div>
          </div>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '0.5px solid #E2E8F0',
            padding: '24px'
          }}>
            <Building2 style={{ width: '32px', height: '32px', color: '#22C55E', marginBottom: '12px' }} />
            <div style={{ fontSize: '28px', fontWeight: 500, color: '#0F172A', marginBottom: '4px' }}>
              Active
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8' }}>
              Current registration
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Top Bar */}
      <div 
        style={{
          backgroundColor: '#FFFFFF',
          height: '54px',
          borderBottom: '0.5px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          marginBottom: '24px',
          marginTop: '-24px',
          marginLeft: '-24px',
          marginRight: '-24px'
        }}
      >
        <h1 style={{ fontSize: '15px', fontWeight: 500, color: '#0F172A', margin: 0 }}>
          Admin Dashboard
        </h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#F1F5F9',
            borderRadius: '20px',
            padding: '6px 14px',
            gap: '8px',
            width: '240px'
          }}>
            <Search style={{ width: '14px', height: '14px', color: '#94A3B8' }} />
            <input 
              type="text" 
              placeholder="Search..." 
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '12px',
                color: '#0F172A',
                width: '100%'
              }}
            />
          </div>

          {/* Notification Bell */}
          <button style={{
            position: 'relative',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px'
          }}>
            <Bell style={{ width: '18px', height: '18px', color: '#64748B' }} />
            <div style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '6px',
              height: '6px',
              backgroundColor: '#EF4444',
              borderRadius: '50%'
            }} />
          </button>

          {/* New Button */}
          <Link to="/admin/admissions">
            <button style={{
              backgroundColor: '#6366F1',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '7px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Plus style={{ width: '14px', height: '14px' }} />
              New
            </button>
          </Link>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {/* Total Students */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '0.5px solid #E2E8F0',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TOTAL STUDENTS
            </span>
            <div style={{ width: '7px', height: '7px', backgroundColor: '#22C55E', borderRadius: '50%' }} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 500, color: '#0F172A', marginBottom: '4px' }}>
            {totalStudents}
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '12px' }}>
            Admitted students
          </div>
          <div style={{ height: '3px', backgroundColor: '#F1F5F9', borderRadius: '2px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ height: '100%', width: '68%', backgroundColor: '#6366F1' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: '#22C55E', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpRight style={{ width: '10px', height: '10px' }} />
              +2 this month
            </span>
            <Link to="/admin/tracking" style={{ fontSize: '10px', color: '#6366F1', textDecoration: 'none' }}>
              View →
            </Link>
          </div>
        </div>

        {/* Total Rooms */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '0.5px solid #E2E8F0',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TOTAL ROOMS
            </span>
            <div style={{ width: '7px', height: '7px', backgroundColor: '#22C55E', borderRadius: '50%' }} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 500, color: '#0F172A', marginBottom: '4px' }}>
            {totalRooms}
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '12px' }}>
            All operational
          </div>
          <div style={{ height: '3px', backgroundColor: '#F1F5F9', borderRadius: '2px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ height: '100%', width: '100%', backgroundColor: '#14B8A6' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: '#94A3B8' }}>
              Fully operational
            </span>
            <Link to="/admin/hostels" style={{ fontSize: '10px', color: '#6366F1', textDecoration: 'none' }}>
              View →
            </Link>
          </div>
        </div>

        {/* Occupied Beds */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '0.5px solid #E2E8F0',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              OCCUPIED BEDS
            </span>
            <div style={{ width: '7px', height: '7px', backgroundColor: '#F59E0B', borderRadius: '50%' }} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 500, color: '#0F172A', marginBottom: '4px' }}>
            {occupiedBeds} of {totalBeds}
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '12px' }}>
            {occupiedBeds === totalBeds ? 'No vacancy' : 'Available beds'}
          </div>
          <div style={{ height: '3px', backgroundColor: '#F1F5F9', borderRadius: '2px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ height: '100%', width: `${totalBeds > 0 ? (occupiedBeds / totalBeds * 100) : 0}%`, backgroundColor: '#F59E0B' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: '#94A3B8' }}>
              {totalBeds > 0 ? Math.round(occupiedBeds / totalBeds * 100) : 0}% occupied
            </span>
            <Link to="/admin/hostels" style={{ fontSize: '10px', color: '#6366F1', textDecoration: 'none' }}>
              View →
            </Link>
          </div>
        </div>

        {/* Pending Leaves */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '0.5px solid #E2E8F0',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              PENDING LEAVES
            </span>
            <div style={{ width: '7px', height: '7px', backgroundColor: '#EF4444', borderRadius: '50%' }} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 500, color: '#0F172A', marginBottom: '4px' }}>
            {pendingLeaves}
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '12px' }}>
            Needs review
          </div>
          <div style={{ height: '3px', backgroundColor: '#F1F5F9', borderRadius: '2px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ height: '100%', width: '30%', backgroundColor: '#EF4444' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle style={{ width: '10px', height: '10px' }} />
              Requires action
            </span>
            <Link to="/admin/leave" style={{ fontSize: '10px', color: '#6366F1', textDecoration: 'none' }}>
              View →
            </Link>
          </div>
        </div>
      </div>

      {/* Middle Section: Two Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {/* Room Occupancy Table */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '0.5px solid #E2E8F0',
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 500, color: '#0F172A', marginBottom: '16px', marginTop: 0 }}>
            Room Occupancy
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid #E2E8F0' }}>
                <th style={{ fontSize: '10px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0', letterSpacing: '0.05em' }}>ROOM</th>
                <th style={{ fontSize: '10px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0', letterSpacing: '0.05em' }}>BLOCK</th>
                <th style={{ fontSize: '10px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0', letterSpacing: '0.05em' }}>STUDENT</th>
                <th style={{ fontSize: '10px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0', letterSpacing: '0.05em' }}>MESS</th>
                <th style={{ fontSize: '10px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0', letterSpacing: '0.05em' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {sampleRooms.map((room, index) => (
                <tr key={index} style={{ borderBottom: '0.5px solid #F1F5F9' }}>
                  <td style={{ fontSize: '12px', color: '#6366F1', padding: '12px 0', fontWeight: 500 }}>R-{room.roomNumber}</td>
                  <td style={{ fontSize: '12px', color: '#94A3B8', padding: '12px 0' }}>{room.block}</td>
                  <td style={{ fontSize: '12px', color: '#0F172A', padding: '12px 0' }}>{room.student}</td>
                  <td style={{ fontSize: '12px', color: room.messStatus === 'Active' ? '#22C55E' : '#94A3B8', padding: '12px 0' }}>{room.messStatus}</td>
                  <td style={{ padding: '12px 0' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 500,
                      padding: '4px 10px',
                      borderRadius: '12px',
                      backgroundColor: room.status === 'Occupied' ? '#DCFCE7' : room.status === 'On leave' ? '#FEF3C7' : '#FEE2E2',
                      color: room.status === 'Occupied' ? '#16A34A' : room.status === 'On leave' ? '#CA8A04' : '#DC2626'
                    }}>
                      {room.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '0.5px solid #E2E8F0',
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 500, color: '#0F172A', marginBottom: '16px', marginTop: 0 }}>
            Quick Actions
          </h3>
          
          <Link to="/admin/admissions" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 0',
              borderBottom: '0.5px solid #F1F5F9',
              cursor: 'pointer'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                backgroundColor: '#F1F5F9',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <UserPlus style={{ width: '14px', height: '14px', color: '#64748B' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#0F172A' }}>New Admission</div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>Register new student</div>
              </div>
              <ChevronRight style={{ width: '14px', height: '14px', color: '#CBD5E1' }} />
            </div>
          </Link>

          <Link to="/admin/leave" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 0',
              borderBottom: '0.5px solid #F1F5F9',
              cursor: 'pointer'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                backgroundColor: '#F1F5F9',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle2 style={{ width: '14px', height: '14px', color: '#64748B' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#0F172A' }}>Approve Leaves</div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>{pendingLeaves} pending</div>
              </div>
              <ChevronRight style={{ width: '14px', height: '14px', color: '#CBD5E1' }} />
            </div>
          </Link>

          <Link to="/admin/mess" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 0',
              borderBottom: '0.5px solid #F1F5F9',
              cursor: 'pointer'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                backgroundColor: '#F1F5F9',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ClipboardList style={{ width: '14px', height: '14px', color: '#64748B' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#0F172A' }}>Mess Attendance</div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>Mark today's attendance</div>
              </div>
              <ChevronRight style={{ width: '14px', height: '14px', color: '#CBD5E1' }} />
            </div>
          </Link>

          <Link to="/admin/complaints" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 0',
              cursor: 'pointer'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                backgroundColor: '#F1F5F9',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MessageSquare style={{ width: '14px', height: '14px', color: '#64748B' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#0F172A' }}>Complaints</div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>{openComplaints} unresolved</div>
              </div>
              <ChevronRight style={{ width: '14px', height: '14px', color: '#CBD5E1' }} />
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom Row: Mini Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {/* Mess Attendance */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '0.5px solid #E2E8F0',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              MESS ATTENDANCE
            </span>
            <span style={{
              fontSize: '9px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '10px',
              backgroundColor: '#DCFCE7',
              color: '#16A34A'
            }}>
              Today
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 500, color: '#0F172A', marginBottom: '4px' }}>
            {messAttendanceCount}/{messAttendanceTotal}
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '12px' }}>
            Students present
          </div>
          <div style={{ height: '2px', backgroundColor: '#F1F5F9', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${messAttendanceTotal > 0 ? (messAttendanceCount / messAttendanceTotal * 100) : 0}%`, backgroundColor: '#14B8A6' }} />
          </div>
        </div>

        {/* Open Complaints */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '0.5px solid #E2E8F0',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              OPEN COMPLAINTS
            </span>
            <span style={{
              fontSize: '9px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '10px',
              backgroundColor: '#FEE2E2',
              color: '#DC2626'
            }}>
              Urgent: {openComplaints > 2 ? 2 : openComplaints}
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 500, color: '#0F172A', marginBottom: '4px' }}>
            {openComplaints}
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '12px' }}>
            Pending resolution
          </div>
          <div style={{ height: '2px', backgroundColor: '#F1F5F9', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '35%', backgroundColor: '#EF4444' }} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
