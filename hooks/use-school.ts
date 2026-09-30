"use client";
import { useState } from "react";
export function useSchool(){ const [school]=useState({name:"Demo Public School",address:"123, Sector 46-A, Chandigarh"}); return school; }