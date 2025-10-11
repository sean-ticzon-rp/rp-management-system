<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class UsersImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        // Combine name fields
        $fullName = trim(
            ($row['first_name'] ?? '') . ' ' . 
            ($row['middle_name'] ?? '') . ' ' . 
            ($row['last_name'] ?? '')
        );

        return new User([
            'employee_id' => $row['employee_no'] ?? null,
            'first_name' => $row['first_name'] ?? null,
            'middle_name' => $row['middle_name'] ?? null,
            'last_name' => $row['last_name'] ?? null,
            'name' => $fullName,
            'gender' => $this->mapGender($row['gender'] ?? null),
            'civil_status' => $this->mapCivilStatus($row['civil_status'] ?? null),
            'birthday' => $this->parseDate($row['date_of_birth'] ?? null),
            'employment_status' => $this->mapStatus($row['status'] ?? 'active'),
            'address_line_1' => $row['home_address'] ?? null,
            'phone_number' => $row['mobile_number'] ?? null,
            'personal_mobile' => $row['mobile_number'] ?? null,
            'sss_number' => $row['sss_number'] ?? null,
            'tin_number' => $row['tin_number'] ?? null,
            'hdmf_number' => $row['hdmf_pagibig_number'] ?? null,
            'philhealth_number' => $row['philhealth_number'] ?? null,
            'position' => $row['job_title'] ?? null,
            'payroll_account' => $row['union_bank_payroll_account'] ?? null,
            'hire_date' => $this->parseDate($row['hire_date'] ?? null),
            'employment_type' => $this->mapEmploymentType($row['employment_type'] ?? 'full_time'),
            'work_email' => $row['work_email'] ?? null,
            'email' => $row['work_email'] ?? $row['personalemail'] ?? null,
            'personal_email' => $row['personalemail'] ?? null,
            'emergency_contact_name' => $row['contact_person_in_case_of_emergency'] ?? null,
            'emergency_contact_relationship' => $row['relationship'] ?? null,
            'emergency_contact_mobile' => $row['mobile_number_emergency'] ?? null,
            'password' => Hash::make('password123'),
        ]);
    }

    private function mapGender($gender)
    {
        if (!$gender) return 'prefer_not_to_say';
        
        $gender = strtolower(trim($gender));
        $map = [
            'male' => 'male',
            'm' => 'male',
            'female' => 'female',
            'f' => 'female',
        ];
        
        return $map[$gender] ?? 'prefer_not_to_say';
    }

    private function mapCivilStatus($status)
    {
        if (!$status) return null;
        
        $status = strtolower(trim($status));
        $validStatuses = ['single', 'married', 'widowed', 'divorced', 'separated'];
        
        return in_array($status, $validStatuses) ? $status : null;
    }

    private function mapStatus($status)
    {
        if (!$status) return 'active';
        
        $status = strtolower(str_replace(' ', '_', trim($status)));
        $validStatuses = ['active', 'on_leave', 'terminated', 'resigned'];
        
        return in_array($status, $validStatuses) ? $status : 'active';
    }

    private function mapEmploymentType($type)
    {
        if (!$type) return 'full_time';
        
        $type = strtolower(str_replace([' ', '-'], '_', trim($type)));
        $validTypes = ['full_time', 'part_time', 'contract', 'intern'];
        
        return in_array($type, $validTypes) ? $type : 'full_time';
    }

    private function parseDate($date)
    {
        if (!$date) return null;
        
        try {
            // Handles YYYY-MM-DD format and Excel date formats
            return \Carbon\Carbon::parse($date)->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }

    public function rules(): array
    {
        return [
            'first_name' => 'required',
            'last_name' => 'required',
            'work_email' => 'required|email|unique:users,email',
        ];
    }
}