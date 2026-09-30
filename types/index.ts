export type UserRole="super_admin"|"school_admin"|"teacher"|"accountant"|"receptionist"|"parent"|"student";
export interface School{ id:string; name:string; address?:string; logo_url?:string|null; }
export interface Student{ id:string; school_id:string; admission_no:string; name:string; class_id?:string|null; section_id?:string|null; status:string; }