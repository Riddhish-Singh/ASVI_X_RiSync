// script.js

// Using localStorage for data persistence
let employees = JSON.parse(localStorage.getItem('employees')) || [];

// --- Core Functions ---

// Adds a new employee or a new skill to an existing employee
function addSkill() {
    const employeeName = document.getElementById('employeeName').value.trim();
    const employeeDesignation = document.getElementById('employeeDesignation').value.trim();
    const employeeExperience = parseInt(document.getElementById('employeeExperience').value, 10);
    const skillNamesInput = document.getElementById('skillName').value.trim();
    const skillProficiency = parseInt(document.getElementById('skillProficiency').value, 10);

    if (!employeeName || !skillNamesInput) {
        alert('Please enter both employee name and at least one skill name.');
        return;
    }
    
    // Split the input string by commas and remove leading/trailing spaces
    const skills = skillNamesInput.split(',').map(skill => skill.trim());

    let employee = employees.find(e => e.name === employeeName);
    if (!employee) {
        employee = { 
            name: employeeName, 
            designation: employeeDesignation, 
            experience: employeeExperience,
            skills: {} 
        };
        employees.push(employee);
    }
    
    // Update existing employee's designation and experience if provided
    if (employeeDesignation) {
        employee.designation = employeeDesignation;
    }
    if (!isNaN(employeeExperience)) {
        employee.experience = employeeExperience;
    }
    
    // Loop through each skill and add it to the employee's profile
    skills.forEach(skill => {
        if (skill) { // Ensure the skill name is not empty
            employee.skills[skill] = skillProficiency;
        }
    });

    // Save data to localStorage
    localStorage.setItem('employees', JSON.stringify(employees));
    alert(`Skills added for ${employeeName}: ${skills.join(', ')}`);
    
    // Reload the skills page to show the update
    window.location.href = 'skills.html';
}

// Renders the skills matrix table on the skills.html page
function renderSkillsMatrix() {
    const tableBody = document.getElementById('skillsMatrixTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = ''; // Clear existing content

    employees.forEach(employee => {
        const newRow = tableBody.insertRow();
        const cellEmployee = newRow.insertCell(0);
        const cellSkills = newRow.insertCell(1);

        // Display the designation and experience fields
        const employeeInfo = `
            <strong>${employee.name}</strong><br>
            <small>${employee.designation || 'N/A'}</small><br>
            <small>${employee.experience !== undefined ? employee.experience + ' years' : 'N/A'}</small>
        `;
        cellEmployee.innerHTML = employeeInfo;

        let skillText = '';
        const skillArray = Object.keys(employee.skills);
        // This part now also displays the count of total skills
        skillArray.forEach((skill, index) => {
            const proficiency = employee.skills[skill];
            skillText += `<span class="skill-prof-${proficiency}">${skill} (${proficiency})</span>`;
            if (index < skillArray.length - 1) {
                skillText += `, `;
            }
        });
        
        const totalSkillsCount = skillArray.length;
        cellSkills.innerHTML = `${skillText} <br> <strong>(${totalSkillsCount} total skills)</strong>` || 'No skills added.';
    });
}

// Renders dashboard metrics
function renderDashboard() {
    const employeeCount = document.getElementById('employeeCount');
    const totalSkillsMapped = document.getElementById('totalSkillsMapped');
    const aiReadinessBar = document.getElementById('aiReadinessBar');
    const aiReadinessValue = document.getElementById('aiReadinessValue');
    
    if (!employeeCount || !totalSkillsMapped || !aiReadinessBar) return;
    
    employeeCount.textContent = employees.length;
    
    let totalSkills = 0;
    employees.forEach(emp => totalSkills += Object.keys(emp.skills).length);
    totalSkillsMapped.textContent = totalSkills;

    // Example KPI: Calculate readiness for the AI adoption goal
    const aiReadinessSkills = ['Python', 'Machine Learning', 'Data Analysis'];
    let totalPossibleScore = 0;
    let totalCurrentScore = 0;
    
    employees.forEach(emp => {
        aiReadinessSkills.forEach(skill => {
            totalPossibleScore += 5;
            totalCurrentScore += emp.skills[skill] || 0;
        });
    });
    
    const readinessPercentage = totalPossibleScore > 0 ? (totalCurrentScore / totalPossibleScore) * 100 : 0;
    
    aiReadinessBar.style.width = readinessPercentage.toFixed(0) + '%';
    aiReadinessBar.textContent = readinessPercentage.toFixed(0) + '%';
    aiReadinessValue.textContent = `${readinessPercentage.toFixed(1)}% Ready`;
}

// Populates dropdowns for employees on the analysis.html page
function populateAnalysisDropdowns() {
    const designationDropdown = document.getElementById('designationFilter');
    const employeeDropdown = document.getElementById('analysisEmployee');

    if (!designationDropdown || !employeeDropdown) return;
    
    // Populate Designation dropdown
    designationDropdown.innerHTML = '<option value="">-- All Designations --</option>';
    const uniqueDesignations = new Set(employees.map(e => e.designation).filter(Boolean));
    uniqueDesignations.forEach(designation => {
        const option = document.createElement('option');
        option.value = designation;
        option.textContent = designation;
        designationDropdown.appendChild(option);
    });

    // Populate Employee dropdown with all employees initially
    populateEmployeeDropdown(employees);
}

// NEW: Function to filter employees based on selected designation
function filterEmployeesByDesignation() {
    const designation = document.getElementById('designationFilter').value;
    const filteredEmployees = employees.filter(emp => !designation || emp.designation === designation);
    populateEmployeeDropdown(filteredEmployees);
    // Clear the skills output when the designation filter changes
    document.getElementById('analysisEmployee').value = '';
    document.getElementById('skillsOutput').style.display = 'none';
}

// Helper function to populate the employee dropdown
function populateEmployeeDropdown(employeeList) {
    const employeeDropdown = document.getElementById('analysisEmployee');
    employeeDropdown.innerHTML = '<option value="">-- Select Employee --</option>';
    employeeList.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.name;
        option.textContent = emp.name;
        employeeDropdown.appendChild(option);
    });
}

// NEW: Function to display the skills of the selected employee
function displayEmployeeSkills() {
    const employeeName = document.getElementById('analysisEmployee').value;
    const skillsOutputDiv = document.getElementById('skillsOutput');
    skillsOutputDiv.innerHTML = '';
    skillsOutputDiv.style.display = 'none'; // Hide the card by default

    if (!employeeName) {
        return; // Exit if no employee is selected
    }

    const employee = employees.find(e => e.name === employeeName);
    if (!employee) {
        skillsOutputDiv.innerHTML = '<p>Employee not found.</p>';
        return;
    }

    let skillsHTML = `
        <h2>Skills for ${employee.name}</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Skill</th>
                    <th>Proficiency</th>
                </tr>
            </thead>
            <tbody>
    `;

    if (Object.keys(employee.skills).length === 0) {
        skillsHTML += `<tr><td colspan="2">No skills have been added for this employee yet.</td></tr>`;
    } else {
        for (const skill in employee.skills) {
            skillsHTML += `
                <tr>
                    <td>${skill}</td>
                    <td>${employee.skills[skill]}</td>
                </tr>
            `;
        }
    }
    
    skillsHTML += `</tbody></table>`;
    
    skillsOutputDiv.innerHTML = skillsHTML;
    skillsOutputDiv.style.display = 'block'; // Show the card
}

/**
 * Converts the employees data to a CSV format and triggers a download.
 */
function downloadSkillsData() {
    // Check if there are employees to export
    if (employees.length === 0) {
        alert("No employee data to export.");
        return;
    }

    // 1. Prepare the CSV header
    // Start with the employee name, designation, and experience
    let csvContent = "Employee Name,Designation,Experience,";

    // Get all unique skill names from all employees to create the header
    const allSkills = new Set();
    employees.forEach(emp => {
        Object.keys(emp.skills).forEach(skill => {
            allSkills.add(skill);
        });
    });

    const skillArray = Array.from(allSkills);
    csvContent += skillArray.join(",") + "\n"; // Add skills and a newline

    // 2. Generate the CSV rows
    employees.forEach(emp => {
        // Quote the fields to handle commas
        let row = `"${emp.name || 'N/A'}",`;
        row += `"${emp.designation || 'N/A'}",`;
        row += `"${emp.experience !== undefined ? emp.experience : 'N/A'}",`;
        
        const skillsRow = skillArray.map(skill => {
            // Get the proficiency level, or 0 if the skill is not present
            return emp.skills[skill] || 0;
        });
        row += skillsRow.join(",") + "\n";
        csvContent += row;
    });

    // 3. Create a downloadable file
    // Create a Blob from the CSV content with a specific MIME type
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Create a temporary link element to trigger the download
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "employee_skills_data.csv");
    link.style.display = 'none'; // Hide the link

    // Append the link to the body, click it, and then remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("Skills data downloaded successfully!");
}

// --- Page-Specific Loaders ---

// This function runs when any of the pages loads.
// It checks the current page's file name to call the right functions.
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'skills.html') {
        renderSkillsMatrix();
    } else if (currentPage === 'analysis.html') {
        populateAnalysisDropdowns();
    } else if (currentPage === 'dashboard.html') {
        renderDashboard();
    }
});
// Add these new functions to your script.js file

/**
 * Handles the bulk upload of a CSV file.
 * Reads the file, parses the data, and updates the employees array.
 */
function handleBulkUpload() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a CSV file to upload.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const csvContent = event.target.result;
        processCSVData(csvContent);
    };
    reader.readAsText(file);
}

/**
 * Parses the CSV content and updates the employees array in localStorage.
 * @param {string} csvContent The content of the CSV file as a string.
 */
function processCSVData(csvContent) {
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');
    if (lines.length <= 1) {
        alert("The CSV file is empty or has only a header.");
        return;
    }

    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    const employeeData = lines.slice(1);

    employeeData.forEach(line => {
        const values = parseCSVLine(line);
        if (values.length < headers.length) return; // Skip malformed rows

        const employeeName = values[headers.indexOf('Employee Name')];
        const designation = values[headers.indexOf('Designation')];
        const experience = values[headers.indexOf('Experience')];

        if (!employeeName) return;

        let employee = employees.find(e => e.name === employeeName);
        if (!employee) {
            employee = {
                name: employeeName,
                designation: designation,
                experience: parseInt(experience, 10) || 0,
                skills: {}
            };
            employees.push(employee);
        } else {
            // Update existing employee's details
            employee.designation = designation || employee.designation;
            employee.experience = parseInt(experience, 10) || employee.experience;
        }

        // Add skills from the remaining columns
        for (let i = 3; i < headers.length; i++) {
            const skillName = headers[i];
            // We'll assume a default proficiency of 3 (Intermediate) for bulk upload
            // We could enhance this to read proficiency values from the CSV as well
            if (skillName && values[i] && values[i] !== "0") {
                employee.skills[skillName] = parseInt(values[i], 10) || 3;
            }
        }
    });

    localStorage.setItem('employees', JSON.stringify(employees));
    alert('Bulk upload successful! Employee skills have been updated.');
    // Redirect or reload to see changes
    window.location.href = 'skills.html';
}

/**
 * Parses a single line of CSV, handling commas within quoted fields.
 * @param {string} line The CSV line to parse.
 * @returns {string[]} An array of values.
 */
function parseCSVLine(line) {
    const result = [];
    let inQuote = false;
    let currentField = '';

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && (i === 0 || line[i - 1] === ',')) {
            inQuote = true;
        } else if (char === '"' && line[i + 1] === ',') {
            inQuote = false;
        } else if (char === ',' && !inQuote) {
            result.push(currentField.trim().replace(/"/g, ''));
            currentField = '';
        } else {
            currentField += char;
        }
    }
    result.push(currentField.trim().replace(/"/g, ''));
    return result;
}

/**
 * Generates and downloads a sample CSV file to show the required format.
 */
function generateSampleCSV() {
    const headers = ["Employee Name", "Designation", "Experience", "Skill1", "Skill2", "Skill3"];
    const sampleData = [
        ["John Doe", "Software Engineer", 5, 5, 4, 3],
        ["Jane Smith", "UX Designer", 3, 0, 4, 0]
    ];

    let csvContent = headers.join(",") + "\n";
    sampleData.forEach(row => {
        csvContent += row.map(item => `"${item}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sample_bulk_upload.csv");
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Add a new conditional block to the existing DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'skills.html') {
        renderSkillsMatrix();
    } else if (currentPage === 'analysis.html') {
        populateAnalysisDropdowns();
    } else if (currentPage === 'dashboard.html') {
        renderDashboard();
    } else if (currentPage === 'bulk_upload.html') {
        // No specific function needed for this page yet, the button click will handle it
        console.log("Bulk Upload page loaded.");
    }
});