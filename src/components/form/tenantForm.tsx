"use client";
import React, { useState } from 'react';
import ComponentCard from '../common/ComponentCard';
import Label from './Label';
import Input from './input/InputField';
import Select from './Select';
import { ChevronDownIcon, EyeCloseIcon, EyeIcon, TimeIcon } from '../../icons';
import DatePicker from '@/components/form/date-picker';
import TextArea from './input/TextArea';

export default function TenantForm() {

  const [form, setForm] = useState({
    fullName: "",
    callingName: "",
    nicNo: "",
    contactNo: "",
    address: "",
    joinedDate: new Date().toISOString().split("T")[0],
  });

  const [startDate, setStartDate] = useState(new Date());
  const [message, setMessage] = useState("");


 function handleChange(e) {
     const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setMessage("");

  // Simple frontend validation
  const emptyField = Object.entries(form).find(([key, value]) => !value?.toString().trim());
  if (emptyField) {
    setMessage(`❌ ${emptyField[0]} is required`);
    return;
  }

  const res = await fetch("/api/tenants", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });

  const data = await res.json();

  if (res.ok) {
    setMessage("✅ Tenant added successfully!");
    setForm({
      fullName: "",
      callingName: "",
      nicNo: "",
      contactNo: "",
      address: "",
      joinedDate: new Date().toISOString().split("T")[0],
    });
  } else {
    setMessage("❌ " + (data.error || "Something went wrong"));
  }
}



  return (
    <ComponentCard title="Tenant">
      <div className="space-y-6">
      <form onSubmit={handleSubmit}> 
        <div>
          <Label>Full Name</Label>
          <Input
            type="text"
            name="fullName"
            id="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label>Calling Name</Label>
          <Input
            type="text"
            name="callingName"
            id="callingName"
            placeholder="Calling Name"
            value={form.callingName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label>NIC No</Label>
           <Input
          type="text"
          name="nicNo"
          placeholder="NIC Number"
          value={form.nicNo}
          onChange={handleChange}
          required
        />
        </div>

        <div>
          <Label htmlFor="contactNo">Contact No</Label> 
          <Input
            type="text"
            name="contactNo"
            id="contactNo"
            placeholder="Contact Number"
            value={form.contactNo}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label>Address</Label>
          <TextArea
            name="address"
            id="address"
            placeholder="Address"
            value={form.address}
            onChange={(value: string) => setForm({ ...form, address: value })}
            required
          />
        </div>
                
        <div>
          <DatePicker
            id="date-picker"
            label="Joined Date"
            placeholder="Select a date"
            mode="single"
            defaultDate={startDate} 
            onChange={(dates: Date[], dateStr: string) => {
              setForm({ ...form, joinedDate: dateStr }); // stores formatted date string
            }}

          />
        </div>
        <button type="submit">Add Tenant</button>
      </form>
      {message && <p>{message}</p>}

      </div>
    </ComponentCard>
  );
}
