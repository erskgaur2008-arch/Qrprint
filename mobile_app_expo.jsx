import React, { useState } from 'react';
import {
SafeAreaView,
View,
Text,
TouchableOpacity,
ScrollView,
TextInput,
StyleSheet,
StatusBar,
Alert,
Modal
} from 'react-native';
// Master Tenant Branding: Demo Public School (Chandigarh)
const THEME = {
primary: '#173B63',
secondary: '#245EA8',
accent: '#E7B84B',
bg: '#F7F9FC',
card: '#FFFFFF',
text: '#172033',
muted: '#667085',
success: '#16845B',
danger: '#D64545',
warning: '#D98A19',
};
export default function App() {
// Mobile role state: 'teacher' | 'parent' | 'admin'
const [role, setRole] = useState('teacher');
const [activeTab, setActiveTab] = useState('home');
// Teacher State: Attendance & Homework
const [studentsRoll, setStudentsRoll] = useState([
{ id: '1', roll: '101', name: 'Aarav Malhotra', status: 'P' },
{ id: '2', roll: '102', name: 'Diya Sharma', status: 'P' },
{ id: '3', roll: '103', name: 'Kabir Singh', status: 'P' },
{ id: '4', roll: '104', name: 'Rhea Sen', status: 'P' },
{ id: '5', roll: '105', name: 'Devansh Verma', status: 'A' },
]);
// Parent State: Multi-child switcher
const [selectedChild, setSelectedChild] = useState('Aarav Malhotra');
const [payModalVisible, setPayModalVisible] = useState(false);
// Toggle student roll call (P / A / L)
const toggleAttendanceStatus = (id) => {
setStudentsRoll((prev) =>
prev.map((s) => {
if (s.id === id) {
const next = s.status === 'P' ? 'A' : s.status === 'A' ? 'L' : 'P';
return { ...s, status: next };
}
return s;
})
);
};
const submitTeacherAttendance = () => {
Alert.alert(
'Attendance Saved',
'Roll call for Grade 10-A committed to Supabase. Instant push alerts dispatched to parents.',
[{ text: 'OK' }]
);
};
const handlePayTuition = () => {
setPayModalVisible(false);
Alert.alert('Payment Successful', 'Fee of ₹22,500 settled via UPI. Official receipt generated.');
};
return (
<SafeAreaView style={styles.container}>
<StatusBar barStyle="light-content" backgroundColor={THEME.primary} />
{/* Top Tenant Header */}
<View style={styles.topHeader}>
<View style={styles.schoolInfo}>
<Text style={styles.schoolTitle}>Demo Public School</Text>
<Text style={styles.schoolSub}>Sector 46-A, Chandigarh • CBSE</Text>
</View>
{/* Quick Role Switcher Pill */}
<View style={styles.rolePicker}>
<TouchableOpacity
style={[styles.rolePill, role === 'teacher' && styles.rolePillActive]}
onPress={() => {
setRole('teacher');
setActiveTab('home');
}}
>
<Text style={[styles.roleText, role === 'teacher' && styles.roleTextActive]}>Teacher</Text>
</TouchableOpacity>
<TouchableOpacity
style={[styles.rolePill, role === 'parent' && styles.rolePillActive]}
onPress={() => {
setRole('parent');
setActiveTab('home');
}}
>
<Text style={[styles.roleText, role === 'parent' && styles.roleTextActive]}>Parent</Text>
</TouchableOpacity>
<TouchableOpacity
style={[styles.rolePill, role === 'admin' && styles.rolePillActive]}
onPress={() => {
setRole('admin');
setActiveTab('home');
}}
>
<Text style={[styles.roleText, role === 'admin' && styles.roleTextActive]}>Admin</Text>
</TouchableOpacity>
</View>
</View>
{/* Dynamic Screen Views Based on Role /}
<ScrollView contentContainerStyle={styles.scrollContent}>
{/ ========================================================================= /}
{/ 1. TEACHER MOBILE INTERFACE (§12)                                         /}
{/ ========================================================================= /}
{role === 'teacher' && (
<View>
{activeTab === 'home' && (
<View style={styles.section}>
{/ Greeting */}
<View style={styles.card}>
<Text style={styles.cardHeader}>Welcome, Dr. Rajesh Sharma</Text>
<Text style={styles.cardSub}>HOD Science • Class Teacher 10-A</Text>
<View style={styles.badgeRow}>
<View style={styles.statusBadge}>
<Text style={styles.statusBadgeText}>Period 3 Active (10:15 - 11:00)</Text>
</View>
</View>
</View>
{/* Quick Roll Call Launcher */}
<View style={styles.actionCard}>
<Text style={styles.actionCardTitle}>Today's Roll Call Status</Text>
<Text style={styles.actionCardDesc}>Grade 10 - Section A (25 Enrolled)</Text>
<TouchableOpacity
style={styles.btnPrimary}
onPress={() => setActiveTab('attendance')}
>
<Text style={styles.btnPrimaryText}>Open Roll Call Station →</Text>
</TouchableOpacity>
</View>
{/* Homework Diary Tasks */}
<View style={styles.card}>
<Text style={styles.cardHeader}>Recent Homework Posted</Text>
<View style={styles.itemRow}>
<Text style={styles.itemBold}>Physics: Ray Optics Reflection</Text>
<Text style={styles.itemDue}>Due Tomorrow</Text>
</View>
<View style={styles.itemRow}>
<Text style={styles.itemBold}>Math: Quadratic Roots Exercise 4.2</Text>
<Text style={styles.itemDue}>Due 02 Oct</Text>
</View>
</View>
</View>
)}
{activeTab === 'attendance' && (
<View style={styles.section}>
<View style={styles.card}>
<Text style={styles.cardHeader}>Roll Call • Grade 10-A</Text>
<Text style={styles.cardSub}>Tap status to toggle (P = Present, A = Absent, L = Late)</Text>
</View>
{studentsRoll.map((s) => (
<View key={s.id} style={styles.rollRow}>
<View>
<Text style={styles.studentName}>{s.name}</Text>
<Text style={styles.studentRoll}>Roll #{s.roll} • DPS-00{s.id}</Text>
</View>
<TouchableOpacity
style={[
styles.statusBtn,
s.status === 'P'
? styles.statusP
: s.status === 'A'
? styles.statusA
: styles.statusL,
]}
onPress={() => toggleAttendanceStatus(s.id)}
>
<Text style={styles.statusBtnText}>{s.status}</Text>
</TouchableOpacity>
</View>
))}
<TouchableOpacity style={styles.btnSuccess} onPress={submitTeacherAttendance}>
<Text style={styles.btnPrimaryText}>Save & Dispatch Parent Alerts</Text>
</TouchableOpacity>
</View>
)}
{activeTab === 'classes' && (
<View style={styles.section}>
<View style={styles.card}>
<Text style={styles.cardHeader}>Assigned Classes & Schedules</Text>
<Text style={styles.cardSub}>Dr. Rajesh Sharma • Academic Year 2026-27</Text>
<View style={styles.divider} />
<Text style={styles.itemBold}>Grade 10 - Section A</Text>
<Text style={styles.cardSub}>Room 301 • Physics & Chemistry</Text>
<View style={styles.divider} />
<Text style={styles.itemBold}>Grade 9 - Section A</Text>
<Text style={styles.cardSub}>Room 203 • Science Practicals</Text>
</View>
</View>
)}
{activeTab === 'homework' && (
<View style={styles.section}>
<View style={styles.card}>
<Text style={styles.cardHeader}>Create Homework Assignment</Text>
<TextInput style={styles.input} placeholder="Homework Title (e.g. Optics Lab)" />
<TextInput
style={[styles.input, { height: 80 }]}
placeholder="Instructions and questions..."
multiline
/>
<TouchableOpacity
style={styles.btnPrimary}
onPress={() => Alert.alert('Homework Assigned', 'Dispatched to Grade 10-A students.')}
>
<Text style={styles.btnPrimaryText}>Publish to Student Diary</Text>
</TouchableOpacity>
</View>
</View>
)}
</View>
)}
{/* ========================================================================= /}
{/ 2. PARENT MOBILE INTERFACE (§13)                                          /}
{/ ========================================================================= /}
{role === 'parent' && (
<View>
{/ Child Switcher Pill */}
<View style={styles.childSwitcher}>
<Text style={styles.childSwitcherLabel}>Select Child:</Text>
<TouchableOpacity
style={[
styles.childPill,
selectedChild === 'Aarav Malhotra' && styles.childPillActive,
]}
onPress={() => setSelectedChild('Aarav Malhotra')}
>
<Text
style={[
styles.childPillText,
selectedChild === 'Aarav Malhotra' && styles.childPillTextActive,
]}
>
Aarav (Grade 10-A)
</Text>
</TouchableOpacity>
<TouchableOpacity
style={[
styles.childPill,
selectedChild === 'Ananya Malhotra' && styles.childPillActive,
]}
onPress={() => setSelectedChild('Ananya Malhotra')}
>
<Text
style={[
styles.childPillText,
selectedChild === 'Ananya Malhotra' && styles.childPillTextActive,
]}
>
Ananya (Grade 7-A)
</Text>
</TouchableOpacity>
</View>
{activeTab === 'home' && (
<View style={styles.section}>
{/* Child Snapshot */}
<View style={styles.card}>
<Text style={styles.cardHeader}>{selectedChild}</Text>
<Text style={styles.cardSub}>
{selectedChild === 'Aarav Malhotra' ? 'Grade 10 - Sec A' : 'Grade 7 - Sec A'} • Roll 101
</Text>
<View style={styles.statGrid}>
<View style={styles.statBox}>
<Text style={styles.statNum}>96.8%</Text>
<Text style={styles.statLabel}>Attendance</Text>
</View>
<View style={styles.statBox}>
<Text style={[styles.statNum, { color: THEME.success }]}>Paid</Text>
<Text style={styles.statLabel}>Q2 Fee</Text>
</View>
</View>
</View>
{/* Bus Live GPS Tracking */}
<View style={styles.card}>
<Text style={styles.cardHeader}>School Bus • Route #14</Text>
<Text style={styles.cardSub}>Driver: Harpal Singh (+91 94170 55210)</Text>
<View style={styles.gpsRow}>
<View style={styles.pulseDot} />
<Text style={styles.gpsText}>Approaching Sector 44 Roundabout (ETA 6 mins)</Text>
</View>
</View>
{/* Quick Fee Pay CTA */}
<TouchableOpacity
style={styles.btnSuccess}
onPress={() => setPayModalVisible(true)}
>
<Text style={styles.btnPrimaryText}>Pay School Fee Online (UPI / Card)</Text>
</TouchableOpacity>
</View>
)}
{activeTab === 'fees' && (
<View style={styles.section}>
<View style={styles.card}>
<Text style={styles.cardHeader}>Fee Invoices & Receipts</Text>
<View style={styles.itemRow}>
<Text style={styles.itemBold}>Term 2 Tuition Fee</Text>
<Text style={[styles.itemBold, { color: THEME.success }]}>₹22,500 (Paid)</Text>
</View>
<Text style={styles.cardSub}>Receipt DPS/2026/0892 • Settled via UPI</Text>
</View>
</View>
)}
{activeTab === 'homework' && (
<View style={styles.section}>
<View style={styles.card}>
<Text style={styles.cardHeader}>Active Homework Diary</Text>
<View style={styles.itemRow}>
<Text style={styles.itemBold}>Math: Quadratic Roots Worksheet 4.2</Text>
<Text style={styles.itemDue}>Due 30 Sep</Text>
</View>
<Text style={styles.cardSub}>Teacher: Dr. Rajesh Sharma</Text>
</View>
</View>
)}
</View>
)}
{/* ========================================================================= /}
{/ 3. ADMIN MOBILE INTERFACE (§4-§5)                                         /}
{/ ========================================================================= */}
{role === 'admin' && (
<View style={styles.section}>
<View style={styles.card}>
<Text style={styles.cardHeader}>Executive Overview • Santraj (Admin)</Text>
<Text style={styles.cardSub}>Demo Public School • Session 2026-27</Text>
<View style={styles.statGrid}>
<View style={styles.statBox}>
<Text style={styles.statNum}>21</Text>
<Text style={styles.statLabel}>Students</Text>
</View>
<View style={styles.statBox}>
<Text style={[styles.statNum, { color: THEME.primary }]}>13</Text>
<Text style={styles.statLabel}>Leads</Text>
</View>
</View>
</View>
<TouchableOpacity
style={styles.btnPrimary}
onPress={() => Alert.alert('Kiosk Terminal', 'Staff PIN / QR Scanner ready.')}
>
<Text style={styles.btnPrimaryText}>Open Staff Biometric Terminal</Text>
</TouchableOpacity>
</View>
)}
</ScrollView>
{/* Online Fee Payment Modal */}
<Modal visible={payModalVisible} animationType="slide" transparent>
<View style={styles.modalOverlay}>
<View style={styles.modalCard}>
<Text style={styles.modalTitle}>Settle School Dues</Text>
<Text style={styles.modalDesc}>Student: {selectedChild}</Text>
<Text style={styles.modalAmount}>Total: ₹22,500.00</Text>
<TouchableOpacity style={styles.btnSuccess} onPress={handlePayTuition}>
<Text style={styles.btnPrimaryText}>Confirm & Pay via UPI</Text>
</TouchableOpacity>
<TouchableOpacity
style={styles.btnCancel}
onPress={() => setPayModalVisible(false)}
>
<Text style={styles.btnCancelText}>Cancel</Text>
</TouchableOpacity>
</View>
</View>
</Modal>
{/* Role-Specific Bottom Navigation Bar */}
<View style={styles.bottomNav}>
{role === 'teacher' && (
<>
<TouchableOpacity
style={styles.navItem}
onPress={() => setActiveTab('home')}
>
<Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>Home</Text>
</TouchableOpacity>
<TouchableOpacity
style={styles.navItem}
onPress={() => setActiveTab('classes')}
>
<Text style={[styles.navText, activeTab === 'classes' && styles.navTextActive]}>Classes</Text>
</TouchableOpacity>
<TouchableOpacity
style={styles.navItem}
onPress={() => setActiveTab('attendance')}
>
<Text style={[styles.navText, activeTab === 'attendance' && styles.navTextActive]}>Roll Call</Text>
</TouchableOpacity>
<TouchableOpacity
style={styles.navItem}
onPress={() => setActiveTab('homework')}
>
<Text style={[styles.navText, activeTab === 'homework' && styles.navTextActive]}>Homework</Text>
</TouchableOpacity>
</>
)}
{role === 'parent' && (
<>
<TouchableOpacity
style={styles.navItem}
onPress={() => setActiveTab('home')}
>
<Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>Home</Text>
</TouchableOpacity>
<TouchableOpacity
style={styles.navItem}
onPress={() => setActiveTab('fees')}
>
<Text style={[styles.navText, activeTab === 'fees' && styles.navTextActive]}>Fees</Text>
</TouchableOpacity>
<TouchableOpacity
style={styles.navItem}
onPress={() => setActiveTab('homework')}
>
<Text style={[styles.navText, activeTab === 'homework' && styles.navTextActive]}>Diary</Text>
</TouchableOpacity>
</>
)}
{role === 'admin' && (
<TouchableOpacity
style={styles.navItem}
onPress={() => setActiveTab('home')}
>
<Text style={[styles.navText, styles.navTextActive]}>Executive Desk</Text>
</TouchableOpacity>
)}
</View>
</SafeAreaView>
);
}
const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: THEME.bg,
},
topHeader: {
backgroundColor: THEME.primary,
paddingHorizontal: 16,
paddingVertical: 12,
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
},
schoolInfo: {
flex: 1,
},
schoolTitle: {
color: '#FFF',
fontSize: 16,
fontWeight: 'bold',
},
schoolSub: {
color: THEME.accent,
fontSize: 11,
},
rolePicker: {
flexDirection: 'row',
backgroundColor: 'rgba(255,255,255,0.1)',
borderRadius: 8,
padding: 2,
},
rolePill: {
paddingHorizontal: 8,
paddingVertical: 4,
borderRadius: 6,
},
rolePillActive: {
backgroundColor: THEME.accent,
},
roleText: {
color: '#FFF',
fontSize: 11,
fontWeight: '600',
},
roleTextActive: {
color: '#000',
fontWeight: 'bold',
},
scrollContent: {
padding: 16,
paddingBottom: 80,
},
section: {
gap: 14,
},
card: {
backgroundColor: THEME.card,
borderRadius: 14,
padding: 16,
shadowColor: '#000',
shadowOpacity: 0.05,
shadowRadius: 8,
elevation: 2,
},
cardHeader: {
fontSize: 15,
fontWeight: 'bold',
color: THEME.text,
},
cardSub: {
fontSize: 12,
color: THEME.muted,
marginTop: 2,
},
badgeRow: {
marginTop: 10,
},
statusBadge: {
backgroundColor: '#EBF3FE',
paddingHorizontal: 10,
paddingVertical: 4,
borderRadius: 6,
alignSelf: 'flex-start',
},
statusBadgeText: {
color: THEME.secondary,
fontSize: 11,
fontWeight: 'bold',
},
actionCard: {
backgroundColor: '#FFF8E6',
borderColor: '#F9DF97',
borderWidth: 1,
borderRadius: 14,
padding: 16,
},
actionCardTitle: {
fontSize: 14,
fontWeight: 'bold',
color: '#7D5A06',
},
actionCardDesc: {
fontSize: 12,
color: '#946C09',
marginBottom: 10,
},
btnPrimary: {
backgroundColor: THEME.primary,
paddingVertical: 10,
paddingHorizontal: 16,
borderRadius: 8,
alignItems: 'center',
},
btnSuccess: {
backgroundColor: THEME.success,
paddingVertical: 12,
paddingHorizontal: 16,
borderRadius: 8,
alignItems: 'center',
marginTop: 8,
},
btnPrimaryText: {
color: '#FFF',
fontSize: 13,
fontWeight: 'bold',
},
itemRow: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginTop: 8,
},
itemBold: {
fontSize: 13,
fontWeight: '600',
color: THEME.text,
},
itemDue: {
fontSize: 11,
color: THEME.danger,
fontWeight: 'bold',
},
rollRow: {
backgroundColor: '#FFF',
padding: 12,
borderRadius: 10,
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: 8,
},
studentName: {
fontSize: 14,
fontWeight: 'bold',
color: THEME.text,
},
studentRoll: {
fontSize: 11,
color: THEME.muted,
},
statusBtn: {
width: 38,
height: 38,
borderRadius: 8,
justifyContent: 'center',
alignItems: 'center',
},
statusP: { backgroundColor: THEME.success },
statusA: { backgroundColor: THEME.danger },
statusL: { backgroundColor: THEME.warning },
statusBtnText: {
color: '#FFF',
fontWeight: 'bold',
fontSize: 15,
},
input: {
borderWidth: 1,
borderColor: '#E2E8F0',
borderRadius: 8,
padding: 10,
marginTop: 8,
fontSize: 12,
},
divider: {
height: 1,
backgroundColor: '#F1F5F9',
marginVertical: 10,
},
childSwitcher: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 12,
gap: 6,
},
childSwitcherLabel: {
fontSize: 12,
fontWeight: 'bold',
color: THEME.text,
},
childPill: {
paddingHorizontal: 10,
paddingVertical: 5,
borderRadius: 14,
backgroundColor: '#E2E8F0',
},
childPillActive: {
backgroundColor: THEME.primary,
},
childPillText: {
fontSize: 11,
fontWeight: '600',
color: THEME.text,
},
childPillTextActive: {
color: '#FFF',
},
statGrid: {
flexDirection: 'row',
gap: 10,
marginTop: 12,
},
statBox: {
flex: 1,
backgroundColor: '#F8FAFC',
padding: 10,
borderRadius: 8,
alignItems: 'center',
},
statNum: {
fontSize: 18,
fontWeight: 'bold',
color: THEME.text,
},
statLabel: {
fontSize: 11,
color: THEME.muted,
},
gpsRow: {
flexDirection: 'row',
alignItems: 'center',
gap: 8,
marginTop: 8,
},
pulseDot: {
width: 10,
height: 10,
borderRadius: 5,
backgroundColor: THEME.success,
},
gpsText: {
fontSize: 11,
color: THEME.muted,
},
modalOverlay: {
flex: 1,
backgroundColor: 'rgba(0,0,0,0.5)',
justifyContent: 'center',
padding: 20,
},
modalCard: {
backgroundColor: '#FFF',
borderRadius: 14,
padding: 20,
alignItems: 'center',
},
modalTitle: {
fontSize: 16,
fontWeight: 'bold',
color: THEME.text,
},
modalDesc: {
fontSize: 12,
color: THEME.muted,
marginVertical: 4,
},
modalAmount: {
fontSize: 22,
fontWeight: 'bold',
color: THEME.success,
marginVertical: 12,
},
btnCancel: {
marginTop: 10,
padding: 8,
},
btnCancelText: {
color: THEME.muted,
fontSize: 12,
},
bottomNav: {
position: 'absolute',
bottom: 0,
left: 0,
right: 0,
height: 60,
backgroundColor: '#FFF',
borderTopWidth: 1,
borderColor: '#E2E8F0',
flexDirection: 'row',
justifyContent: 'space-around',
alignItems: 'center',
},
navItem: {
padding: 8,
},
navText: {
fontSize: 12,
color: THEME.muted,
fontWeight: '600',
},
navTextActive: {
color: THEME.primary,
fontWeight: 'bold',
},
});
