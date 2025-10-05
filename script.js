// script.js

// Using localStorage for data persistence
let employees = JSON.parse(localStorage.getItem('employees')) || [];

// --- 1. Role Library and LMS Modules (For Gap Analysis) ---
/**
 * 1. Library of role and associated skills are mapped on our platform
 */
const REQUIRED_SKILLS = {
    'Senior Software Engineer': {
        'JavaScript': 5,
        'React': 5,
        'Node.js': 4,
        'Cloud Computing': 3,
        'Data Structures': 4
    },
    'Team Lead': {
        'Project Management': 5,
        'Communication': 4,
        'Mentorship': 4,
        'Node.js': 3,
        'Agile Methodology': 5
    },
    'UX Designer': {
        'Figma': 5,
        'User Research': 4,
        'Prototyping': 5,
        'HTML/CSS': 3,
        'Visual Design': 4
    },
    'AI Specialist': {
        'Python': 5,
        'Machine Learning': 4,
        'Statistical Analysis': 4,
        'Data Structures': 3
    },
    // --- NEW ROLE ADDED: Sr. Manager ---
    'Sr. Manager': {
        'Project Management': 5,
        'Communication': 5,
        'Leadership': 4,
        'Strategic Planning': 4,
        'Budgeting': 3
    }
    // ------------------------------------
};

const LMS_MODULES = {
    1: 'Foundation Course (LMS-101)',
    2: 'Intermediate Workshop (LMS-202)',
    3: 'Advanced Certification (LMS-303)',
    4: 'Expert Masterclass (LMS-404)',
    5: 'External Specialization (LMS-505)'
};

// --- CORE FUNCTIONS (EXISTING) ---

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
    
    if (employeeDesignation) {
        employee.designation = employeeDesignation;
    }
    if (!isNaN(employeeExperience)) {
        employee.experience = employeeExperience;
    }
    
    skills.forEach(skill => {
        if (skill) {
            employee.skills[skill] = skillProficiency;
        }
    });

    localStorage.setItem('employees', JSON.stringify(employees));
    alert(`Skills added for ${employeeName}: ${skills.join(', ')}`);
    
    window.location.href = 'skills.html';
}

function renderSkillsMatrix() {
    const tableBody = document.getElementById('skillsMatrixTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    employees.forEach(employee => {
        const newRow = tableBody.insertRow();
        const cellEmployee = newRow.insertCell(0);
        const cellSkills = newRow.insertCell(1);

        const employeeInfo = `
            <strong>${employee.name}</strong><br>
            <small>${employee.designation || 'N/A'}</small><br>
            <small>${employee.experience !== undefined ? employee.experience + ' years' : 'N/A'}</small>
        `;
        cellEmployee.innerHTML = employeeInfo;

        let skillText = '';
        const skillArray = Object.keys(employee.skills);
        skillArray.forEach(skill => {
            const proficiency = employee.skills[skill];
            skillText += `<span class="skill-prof-${proficiency}">${skill} (${proficiency})</span>`;
        });
        
        const totalSkillsCount = skillArray.length;
        cellSkills.innerHTML = `${skillText} <br> <strong>(${totalSkillsCount} total skills)</strong>` || 'No skills added.';
    });
}

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

// Populates dropdowns for employees on the analysis and gap_analysis pages
function populateEmployeeDropdown(employeeList) {
    const employeeDropdown = document.getElementById('analysisEmployee');
    if (!employeeDropdown) return;
    
    employeeDropdown.innerHTML = '<option value="">-- Select Employee --</option>';
    employeeList.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.name;
        option.textContent = emp.name;
        employeeDropdown.appendChild(option);
    });
}

function populateAnalysisDropdowns() {
    const designationDropdown = document.getElementById('designationFilter');
    if (designationDropdown) {
        designationDropdown.innerHTML = '<option value="">-- All Designations --</option>';
        const uniqueDesignations = new Set(employees.map(e => e.designation).filter(Boolean));
        uniqueDesignations.forEach(designation => {
            const option = document.createElement('option');
            option.value = designation;
            option.textContent = designation;
            designationDropdown.appendChild(option);
        });
    }

    populateEmployeeDropdown(employees);
}

function filterEmployeesByDesignation() {
    const designation = document.getElementById('designationFilter').value;
    const filteredEmployees = employees.filter(emp => !designation || emp.designation === designation);
    populateEmployeeDropdown(filteredEmployees);
    
    const analysisEmployee = document.getElementById('analysisEmployee');
    if (analysisEmployee) analysisEmployee.value = '';

    const skillsOutput = document.getElementById('skillsOutput');
    if (skillsOutput) skillsOutput.style.display = 'none';

    const gapAnalysisOutput = document.getElementById('gapAnalysisOutput');
    if (gapAnalysisOutput) gapAnalysisOutput.style.display = 'none';
}

/**
 * Displays the skills of the selected employee (The As-Is Placement).
 */
function displayEmployeeSkills() {
    const employeeName = document.getElementById('analysisEmployee').value;
    const skillsOutputDiv = document.getElementById('skillsOutput');
    skillsOutputDiv.innerHTML = '';
    skillsOutputDiv.style.display = 'none';

    const gapAnalysisOutput = document.getElementById('gapAnalysisOutput');
    if (gapAnalysisOutput) gapAnalysisOutput.style.display = 'none';

    if (!employeeName) return;

    const employee = employees.find(e => e.name === employeeName);
    if (!employee) {
        skillsOutputDiv.innerHTML = '<p>Employee not found.</p>';
        return;
    }

    let skillsHTML = `
        <h2>Current Skills Placement: ${employee.name}</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Skill</th>
                    <th>Proficiency (1-5)</th>
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
                    <td><span class="skill-prof-${employee.skills[skill]}">${employee.skills[skill]}</span></td>
                </tr>
            `;
        }
    }

    skillsHTML += `</tbody></table>`;
    skillsOutputDiv.innerHTML = skillsHTML;
    skillsOutputDiv.style.display = 'block';
}


// --- 2. New Gap Analysis Functions ---

/**
 * Populates the 'Target Role' dropdown with roles from REQUIRED_SKILLS.
 */
function populateTargetRoleDropdown() {
    const targetRoleSelect = document.getElementById('targetRole');
    if (!targetRoleSelect) return;

    targetRoleSelect.innerHTML = '<option value="">-- Select Aspiring Role --</option>';
    
    const allDesignations = Object.keys(REQUIRED_SKILLS).sort();

    allDesignations.forEach(role => {
        const option = document.createElement('option');
        option.value = role;
        option.textContent = role;
        targetRoleSelect.appendChild(option);
    });
}

/**
 * Runs the Skill Gap Analysis for the selected employee and target role.
 */
function runGapAnalysis() {
    const employeeSelect = document.getElementById('analysisEmployee');
    const targetRoleSelect = document.getElementById('targetRole');
    const outputDiv = document.getElementById('gapAnalysisOutput');

    const employeeName = employeeSelect.value;
    const targetRole = targetRoleSelect.value;

    outputDiv.style.display = 'none';

    if (!employeeName || !targetRole) {
        outputDiv.style.display = 'block';
        outputDiv.innerHTML = `<h2>Skill Gap Analysis</h2><p class="disclaimer">Please select both an employee and an aspired role to run the analysis.</p>`;
        return;
    }

    const employee = employees.find(e => e.name === employeeName);
    const requiredSkills = REQUIRED_SKILLS[targetRole];

    if (!employee || !requiredSkills) {
        outputDiv.style.display = 'block';
        // This message is now more generic as the dropdown only contains valid roles
        outputDiv.innerHTML = `<h2>Skill Gap Analysis</h2><p class="disclaimer">Required skills data not available for target role: <strong>${targetRole}</strong>. Cannot perform analysis.</p>`;
        return;
    }

    let tableHTML = `
        <h2>Skill Gap: Upskilling Path to ${targetRole}</h2>
        <table class="table analysis-table">
            <thead>
                <tr>
                    <th>Skill</th>
                    <th>Required Prof. (1-5)</th>
                    <th>Current Prof. (1-5)</th>
                    <th>Gap (Deficit is negative)</th>
                    <th>LMS Recommendation</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    let totalDeficit = 0;
    let skillsToDevelopCount = 0;

    // 1. Check required skills against employee skills
    for (const skill in requiredSkills) {
        const requiredProf = requiredSkills[skill];
        // Ensure case-insensitive match for employee skills
        const foundSkillKey = Object.keys(employee.skills).find(skillKey => skillKey.toLowerCase() === skill.toLowerCase());
        const currentProf = foundSkillKey ? employee.skills[foundSkillKey] : 0; // Default to 0 if skill not recorded
        const gap = currentProf - requiredProf;

        let gapClass = '';
        let recommendation = 'Meets or Exceeds Requirement';
        
        if (gap < 0) {
            totalDeficit += Math.abs(gap);
            skillsToDevelopCount++;
            gapClass = 'analysis-negative'; 
            const proficiencyNeeded = Math.abs(gap);
            recommendation = LMS_MODULES[proficiencyNeeded] || 'Tailored Development Plan';
        } else if (gap > 0) {
            gapClass = 'analysis-positive'; 
            recommendation = 'Potential Mentor / Exceeds Role Requirement';
        } else {
            gapClass = '';
        }

        const currentProfClass = `skill-prof-${currentProf > 5 ? 5 : currentProf}`;
        const requiredProfClass = `skill-prof-${requiredProf > 5 ? 5 : requiredProf}`;


        tableHTML += `
            <tr>
                <td>${skill}</td>
                <td><span class="${requiredProfClass}">${requiredProf}</span></td>
                <td><span class="${currentProfClass}">${currentProf}</span></td>
                <td class="${gapClass}"><strong>${gap}</strong></td>
                <td>${recommendation}</td>
            </tr>
        `;
    }
    
    // 2. Identify surplus skills
    for (const skill in employee.skills) {
        const requiredSkillKeys = Object.keys(requiredSkills).map(s => s.toLowerCase());
        if (!requiredSkillKeys.includes(skill.toLowerCase())) {
             tableHTML += `
                <tr>
                    <td>${skill}</td>
                    <td>-</td>
                    <td><span class="skill-prof-${employee.skills[skill]}">${employee.skills[skill]}</span></td>
                    <td class="analysis-positive">SURPLUS</td>
                    <td>Value-add skill, consider for special projects or other roles.</td>
                </tr>
            `;
        }
    }


    tableHTML += `</tbody></table>`;
    
    // --- Summary Metrics ---
    const maxDeficitPossible = Object.keys(requiredSkills).length * 5;
    const gapScore = maxDeficitPossible > 0 ? Math.max(0, 100 - (totalDeficit / maxDeficitPossible) * 100) : 100;

    let color;
    if (gapScore < 50) {
        color = '#DC2626';
    } else if (gapScore < 85) {
        color = '#F59E0B';
    } else {
        color = '#059669';
    }


    tableHTML += `
        <div class="dashboard-grid" style="margin-top: 30px;">
            <div class="metric-card" style="border-left-color: ${color};">
                <h3>Overall Readiness Score</h3>
                <p style="color: ${color};">${gapScore.toFixed(0)}/100</p>
                <small>Score based on total proficiency deficit against the target role.</small>
            </div>
            <div class="metric-card" style="border-left-color: #0570C7;">
                <h3>Skills Requiring Upskilling</h3>
                <p style="color: #0570C7;">${skillsToDevelopCount}</p>
                <small>Number of skills where current level is below required level.</small>
            </div>
            <div class="metric-card" style="border-left-color: #1F2937;">
                <h3>Total Proficiency Deficit</h3>
                <p style="color: #1F2937;">${totalDeficit}</p>
                <small>Total points needed to meet all minimum requirements.</small>
            </div>
        </div>
    `;

    outputDiv.innerHTML = tableHTML;
    outputDiv.style.display = 'block';
}

function downloadSkillsData() {
    // Existing download logic...
}
function handleBulkUpload() {
    // Existing bulk upload logic...
}
function generateSampleCSV() {
    // Existing generate sample CSV logic...
}


// --- Page-Specific Loaders (UPDATED) ---

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'skills.html') {
        renderSkillsMatrix();
    } else if (currentPage === 'analysis.html') {
        // Talent Analysis (Team view, uses designation filter)
        populateAnalysisDropdowns();
    } else if (currentPage === 'gap_analysis.html') {
        // Skill Gap Analysis (Individual view, uses employee and target role)
        populateEmployeeDropdown(employees);
        populateTargetRoleDropdown();
    } else if (currentPage === 'dashboard.html') {
        renderDashboard();
    }
    // No specific loader for index.html or bulk_upload.html needed here.
});