/* ==========================================================================
   MEDICARE SCHEDULER & GEMINI AI HEALTHCARE COMPANION - IRELAND HPRA EDITION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const savedMedsStr = localStorage.getItem('medicare_medications_v9');
    const savedDiseasesStr = localStorage.getItem('medicare_active_diseases_v9');

    let medications = [];
    let activeDiseases = [
        { id: 'pneumonia', label: 'Pneumonia / Chest Infection', icon: 'fa-lungs', checked: false, classTag: 'tag-pneumonia' },
        { id: 'diabetes', label: 'Type 2 diabetes', icon: 'fa-droplet', checked: false, classTag: 'tag-diabetes' },
        { id: 'fatty_liver', label: 'Fatty Liver (NAFLD)', icon: 'fa-disease', checked: false, classTag: 'tag-liver' },
        { id: 'cholesterol', label: 'High Cholesterol', icon: 'fa-heart', checked: false, classTag: 'tag-cholesterol' },
        { id: 'hypertension', label: 'Hypertension (High BP)', icon: 'fa-heart-pulse', checked: false, classTag: 'tag-hypertension' },
        { id: 'hypotension', label: 'Low Blood Pressure (Hypotension)', icon: 'fa-gauge-simple-low', checked: false, classTag: '' },
        { id: 'anemia', label: 'Anemia / Low Iron Blood Count', icon: 'fa-vial', checked: false, classTag: '' },
        { id: 'acid_reflux', label: 'Acid Reflux / Gastritis', icon: 'fa-vial-circle-check', checked: false, classTag: '' },
        { id: 'back_pain', label: 'Lower Back Pain', icon: 'fa-child', checked: false, classTag: '' },
        { id: 'joint_arthritis', label: 'Joint Arthritis', icon: 'fa-bone', checked: false, classTag: '' },
        { id: 'anxiety_stress', label: 'Anxiety & Stress', icon: 'fa-brain', checked: false, classTag: '' }
    ];

    if (savedMedsStr && savedDiseasesStr) {
        medications = JSON.parse(savedMedsStr);
        activeDiseases = JSON.parse(savedDiseasesStr);
        activeDiseases.forEach(d => { if(d.id === 'diabetes') d.label = 'Type 2 diabetes'; });
    }

    let doseLogs = JSON.parse(localStorage.getItem('medicare_dose_logs')) || {};

    // ----------------------------------------------------------------------
    // 4. Render & Manage Disease Checkbox Pills + Automatic AI Generation
    // ----------------------------------------------------------------------
    const checkboxGrid = document.getElementById('conditions-checkbox-grid');
    const customDiseaseInput = document.getElementById('custom-disease-input');
    const btnAddCustomDisease = document.getElementById('btn-add-custom-disease');
    const formConditionSelect = document.getElementById('med-condition');

    function renderDiseaseCheckboxGrid() {
        checkboxGrid.innerHTML = '';
        formConditionSelect.innerHTML = '<option value="general">General / All Health Conditions</option>';

        activeDiseases.forEach((dis) => {
            const label = document.createElement('label');
            label.className = `condition-checkbox-pill ${dis.classTag} ${dis.checked ? 'active' : ''}`;
            label.innerHTML = `
                <input type="checkbox" value="${dis.id}" ${dis.checked ? 'checked' : ''} class="disease-checkbox-input">
                <span><i class="fa-solid ${dis.icon || 'fa-stethoscope'}"></i> ${window.MediCare.escape(dis.label)}</span>
                <button type="button" class="remove-disease-btn" data-id="${dis.id}" title="Remove Disease from Profile">×</button>
            `;
            checkboxGrid.appendChild(label);

            const opt = document.createElement('option');
            opt.value = dis.id;
            opt.textContent = `${window.MediCare.escape(dis.label)} ${dis.checked ? '✓ (Active in Profile)' : ''}`;
            formConditionSelect.appendChild(opt);
        });

        document.querySelectorAll('.disease-checkbox-input').forEach(cb => {
            cb.addEventListener('change', () => {
                const disease = activeDiseases.find(d => d.id === cb.value);
                if (disease) {
                    disease.checked = cb.checked;
                    saveState();
                    renderDiseaseCheckboxGrid();
                    updateAllViews();
                    if(disease.checked) window.MediCare.detail(disease);
                }
            });
        });

        document.querySelectorAll('.remove-disease-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const diseaseId = btn.getAttribute('data-id');
                if (confirm(`Remove "${activeDiseases.find(d => d.id === diseaseId)?.label}" from your disease profile?`)) {
                    activeDiseases = activeDiseases.filter(d => d.id !== diseaseId);
                    saveState();
                    renderDiseaseCheckboxGrid();
                    updateAllViews();
                }
            });
        });
    }

    window.medicareProfile = {
        list: () => activeDiseases,
        add: (topic) => {
            let existing = activeDiseases.find(d => d.id === topic.id || d.label.toLowerCase() === topic.label.toLowerCase());
            if (existing) existing.checked = true;
            else activeDiseases.push({...topic, checked: true, icon: 'fa-notes-medical', classTag: ''});
            saveState(); renderDiseaseCheckboxGrid(); updateAllViews();
        }
    };
    document.getElementById('btn-select-all-diseases').addEventListener('click', () => {
        activeDiseases.forEach(d => d.checked = true);
        saveState();
        renderDiseaseCheckboxGrid();
        updateAllViews();
    });

    // ----------------------------------------------------------------------
    // 5. Tab Navigation & Dropdown Controls
    // ----------------------------------------------------------------------
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabPanels = document.querySelectorAll('.tab-panel');

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            navTabs.forEach(t => t.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Dropdown Preload Menu
    const preloadBtn = document.getElementById('btn-preload-menu');
    const dropdownMenu = document.getElementById('preload-dropdown');

    preloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', () => {
        dropdownMenu.style.display = 'none';
    });

    // Theme Toggle
    const themeBtn = document.getElementById('btn-toggle-theme');
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const icon = themeBtn.querySelector('i');
        icon.className = document.body.classList.contains('dark-theme') ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    });

    // Print Schedule
    document.getElementById('btn-export-pdf').addEventListener('click', () => {
        window.print();
    });

    // Current Date
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date-str').textContent = new Date().toLocaleDateString(undefined, dateOptions);

    // ----------------------------------------------------------------------
    // 6. Gemini AI Consultant Integration (with Ireland HPRA Regulatory Context)
    // ----------------------------------------------------------------------
    const btnGenerateAI = document.getElementById('btn-generate-ai-plan');
    const btnAskAI = document.getElementById('btn-ask-ai');
    const aiUserQuery = document.getElementById('ai-user-query');
    const aiOutputBox = document.getElementById('ai-output-box');
    const activeConditionsSummary = document.getElementById('active-conditions-summary');

    function updateActiveConditionsSummary() {
        const checkedList = activeDiseases.filter(d => d.checked);
        activeConditionsSummary.innerHTML = '<strong>Active Selected Conditions:</strong> ';

        if (checkedList.length === 0) {
            activeConditionsSummary.innerHTML += '<span class="text-muted">No conditions checked. Select diseases above.</span>';
            return;
        }

        checkedList.forEach(dis => {
            activeConditionsSummary.innerHTML += `
                <span class="disease-pill ${dis.classTag}"><i class="fa-solid ${dis.icon}"></i> ${window.MediCare.escape(dis.label)}</span>
            `;
        });
    }

    async function callGeminiAI(userPrompt) {
        await window.MediCare.ask(userPrompt, activeDiseases.filter(d => d.checked));
    }

    btnGenerateAI.addEventListener('click', () => {
        callGeminiAI("Generate a complete multi-disease care plan, Ireland pharmacy classification (POM vs OTC), food warnings, and exercise safety guide.");
    });

    btnAskAI.addEventListener('click', () => {
        const query = aiUserQuery.value.trim();
        if (query) {
            callGeminiAI(query);
            aiUserQuery.value = '';
        }
    });

    aiUserQuery.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            btnAskAI.click();
        }
    });

    // ----------------------------------------------------------------------
    // 7. Form Submit & Autocomplete with Ireland Status
    // ----------------------------------------------------------------------
    const medNameInput = document.getElementById('med-name');
    const searchSpinner = document.getElementById('search-spinner');
    const autocompleteDropdown = document.getElementById('autocomplete-results');
    const apiBadge = document.getElementById('api-info-badge');
    const freqSelect = document.getElementById('med-frequency');
    const generatedTimesDiv = document.getElementById('generated-times-container');
    const irelandStatusSelect = document.getElementById('med-ireland-type');

    let debounceTimer;

    medNameInput.addEventListener('input', () => {
        const query = medNameInput.value.trim().toLowerCase();
        clearTimeout(debounceTimer);
        apiBadge.style.display = 'none';
        document.getElementById('rxnorm-id').textContent = '';
        document.getElementById('api-ingredient').textContent = '';
        autocompleteDropdown.style.display = 'none';

        if (query.length < 2) {
            autocompleteDropdown.style.display = 'none';
            searchSpinner.style.display = 'none';
            return;
        }

        searchSpinner.style.display = 'block';

        debounceTimer = setTimeout(() => {
            fetchMedicationData(query);
        }, 350);
    });

    async function fetchMedicationData(query) {
        let matches = [];
        try {
            const response = await fetch(`https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                if (data.drugGroup && data.drugGroup.conceptGroup) {
                    data.drugGroup.conceptGroup.forEach(group => {
                        if (group.conceptProperties) {
                            group.conceptProperties.slice(0, 5).forEach(item => {
                                if (!matches.some(m => m.name.toLowerCase() === item.name.toLowerCase())) {
                                    matches.push({
                                        name: item.name,
                                        rxcui: item.rxcui,
                                        ingredient: item.name,
                                        purpose: "NLM RxNorm medicine entry",
                                        condition: "general",
                                        irelandStatus: "unknown",
                                        irelandNote: "Prescription Only Medicine (POM in Ireland).",
                                        interactions: "Take with plenty of water. Consult healthcare provider."
                                    });
                                }
                            });
                        }
                    });
                }
            }
        } catch (err) {
            console.warn("NIH RxNav API offline, using local medical database.", err);
        }

        if (medNameInput.value.trim().toLowerCase() !== query) return;
        searchSpinner.style.display = 'none';
        renderAutocomplete(matches);
    }

    function renderAutocomplete(matches) {
        if (matches.length === 0) {
            autocompleteDropdown.style.display = 'none';
            return;
        }

        autocompleteDropdown.innerHTML = '';
        matches.slice(0, 6).forEach(item => {
            const statusBadge = '<span class="badge">NLM RxNorm</span>';

            const div = document.createElement('div');
            div.className = 'autocomplete-item';
            div.innerHTML = `
                <div>
                    <strong>${window.MediCare.escape(item.name)}</strong> ${statusBadge}
                    <div class="item-class">${item.purpose || 'Medication'}</div>
                </div>
                <span class="badge"><i class="fa-solid fa-angle-right"></i></span>
            `;
            div.addEventListener('click', () => {
                selectMedication(item);
            });
            autocompleteDropdown.appendChild(div);
        });

        autocompleteDropdown.style.display = 'block';
    }

    function selectMedication(item) {
        medNameInput.value = item.name;
        autocompleteDropdown.style.display = 'none';

        document.getElementById('rxnorm-id').textContent = `RxCUI: ${item.rxcui || 'N/A'}`;
        document.getElementById('api-ingredient').textContent = item.ingredient || item.name;
        document.getElementById('api-purpose').textContent = item.purpose || 'Therapeutic Agent';
        document.getElementById('api-interactions').textContent = item.interactions || 'No immediate contraindications recorded.';

        const statusSpan = document.getElementById('api-ireland-status');
        statusSpan.className = 'hpra-badge';
        statusSpan.textContent = 'Irish availability not verified. Ask your pharmacist.';
        irelandStatusSelect.value = 'unknown';
        document.getElementById('api-interactions').textContent = 'Interactions are not checked here. Ask your pharmacist to review your full medicine list.';
        let link = document.getElementById('medicine-source');
        if (!link) { link = document.createElement('a'); link.id = 'medicine-source'; link.className = 'source-link'; apiBadge.append(link); }
        link.textContent = 'Source: NLM RxNorm medicine entry';
        link.href = 'https://rxnav.nlm.nih.gov/REST/rxcui/' + encodeURIComponent(item.rxcui) + '/properties.json';
        link.target = '_blank'; link.rel = 'noopener noreferrer';

        apiBadge.style.display = 'block';

        if (item.condition) {
            document.getElementById('med-condition').value = item.condition;
        }
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-group')) {
            autocompleteDropdown.style.display = 'none';
        }
    });

    function generateTimes(frequency) {
        generatedTimesDiv.innerHTML = '';
        const freq = parseInt(frequency, 10);
        let defaultTimes = [];

        if (freq === 1) defaultTimes = ['08:00'];
        else if (freq === 2) defaultTimes = ['08:00', '20:00'];
        else if (freq === 3) defaultTimes = ['06:00', '14:00', '22:00']; // EXACT 8 HOURS
        else if (freq === 4) defaultTimes = ['06:00', '12:00', '18:00', '00:00'];

        defaultTimes.forEach((t, idx) => {
            const chip = document.createElement('div');
            chip.className = 'time-chip';
            chip.innerHTML = `
                <span>Dose ${idx + 1}:</span>
                <input type="time" class="intake-time-input" required value="${t}">
            `;
            generatedTimesDiv.appendChild(chip);
        });

        if (freq === 3) {
            const infoNote = document.createElement('div');
            infoNote.style.fontSize = '0.78rem';
            infoNote.style.color = 'var(--primary-color)';
            infoNote.style.width = '100%';
            infoNote.style.marginTop = '4px';
            infoNote.textContent = 'Suggested times only. Edit these to match the instructions on your prescription.';
            generatedTimesDiv.appendChild(infoNote);
        }
    }

    freqSelect.addEventListener('change', () => {
        generateTimes(freqSelect.value);
    });

    generateTimes(freqSelect.value);

    const medForm = document.getElementById('medication-form');
    medForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = medNameInput.value.trim();
        const dosage = document.getElementById('med-dosage').value.trim();
        const condition = document.getElementById('med-condition').value || 'general';
        const frequency = document.getElementById('med-frequency').value;
        const food = document.getElementById('med-food').value;
        const irelandStatus = irelandStatusSelect.value;
        const notes = document.getElementById('med-notes').value.trim();

        const timeInputs = document.querySelectorAll('.intake-time-input');
        const times = Array.from(timeInputs).map(input => input.value);

        const newMed = {
            id: 'med_' + Date.now(),
            name,
            dosage,
            condition,
            frequency,
            food,
            irelandStatus,
            notes,
            times,
            rxcui: document.getElementById('rxnorm-id').textContent,
            ingredient: document.getElementById('api-ingredient').textContent
        };

        medications.push(newMed);

        // Auto-check target disease if present in profile
        const diseaseObj = activeDiseases.find(d => d.id === condition);
        if (diseaseObj) {
            diseaseObj.checked = true;
            renderDiseaseCheckboxGrid();
        }

        saveState();

        medForm.reset();
        apiBadge.style.display = 'none';
        generateTimes(2);

        document.querySelector('[data-tab="tab-schedule"]').click();
        updateAllViews();
    });

    function saveState() {
        localStorage.setItem('medicare_medications_v9', JSON.stringify(medications));
        localStorage.setItem('medicare_dose_logs', JSON.stringify(doseLogs));
        localStorage.setItem('medicare_active_diseases_v9', JSON.stringify(activeDiseases));
    }

    function updateAllViews() {
        renderSchedule();
        renderExercises();
        renderRemedies();
        renderCareGuidelines();
        updateActiveConditionsSummary();
        window.MediCare.refresh(activeDiseases.filter(d=>d.checked));
    }

    // ----------------------------------------------------------------------
    // 8. Schedule & Timeline Filtered Dynamically by Checked Diseases
    // ----------------------------------------------------------------------
    function renderSchedule() {
        const timelineContainer = document.getElementById('timeline-container');
        timelineContainer.innerHTML = '';

        const todayKey = new Date().toISOString().split('T')[0];
        if (!doseLogs[todayKey]) {
            doseLogs[todayKey] = {};
        }

        const checkedDiseaseIds = activeDiseases.filter(d => d.checked).map(d => d.id);

        // Filter medications by currently checked diseases
        const activeMeds = medications.filter(med => {
            return med.condition === 'general' || checkedDiseaseIds.length === 0 || checkedDiseaseIds.includes(med.condition);
        });

        let scheduleItems = [];
        activeMeds.forEach(med => {
            med.times.forEach(time => {
                const doseId = `${med.id}_${time}`;
                const status = doseLogs[todayKey][doseId] || 'pending';
                scheduleItems.push({
                    doseId,
                    med,
                    time,
                    status
                });
            });
        });

        scheduleItems.sort((a, b) => a.time.localeCompare(b.time));

        const totalCount = scheduleItems.length;
        const takenCount = scheduleItems.filter(i => i.status === 'taken').length;
        const pendingCount = totalCount - takenCount;

        document.getElementById('stat-total').textContent = totalCount;
        document.getElementById('stat-taken').textContent = takenCount;
        document.getElementById('stat-pending').textContent = pendingCount;
        document.getElementById('dose-badge').textContent = pendingCount;

        if (scheduleItems.length === 0) {
            timelineContainer.innerHTML = `
                <div class="card onboarding-welcome-card" style="text-align: center; padding: 40px; background: var(--primary-light); border: 1px solid var(--primary-border);">
                    <i class="fa-solid fa-hand-holding-medical" style="font-size: 3.5rem; color: var(--primary-color); margin-bottom: 16px;"></i>
                    <h3 style="color: var(--primary-color);">No medicines scheduled yet</h3>
                    <p class="text-muted" style="max-width: 600px; margin: 8px auto 20px;">
                        Add medicines from your own prescription to create your schedule. Browse the health library for everyday care and movement guidance.
                    </p>
                    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                        <button onclick="document.querySelector('[data-tab=\\'tab-add\\']').click()" class="btn btn-primary"><i class="fa-solid fa-plus-circle"></i> Add Your Medication</button>
                    </div>
                </div>
            `;
            updateNextDoseBanner(null);
            return;
        }

        const now = new Date();
        const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const upcomingDose = scheduleItems.find(item => item.status === 'pending' && item.time >= currentTimeStr) || scheduleItems.find(item => item.status === 'pending');

        updateNextDoseBanner(upcomingDose);

        scheduleItems.forEach(item => {
            const timeFormatted = formatTime12h(item.time);
            const isTaken = item.status === 'taken';

            const statusBadge = '<span class="hpra-badge">' + (item.med.irelandStatus === 'OTC' ? 'OTC · entered by you' : item.med.irelandStatus === 'POM' ? 'Prescription · entered by you' : 'Availability not verified') + '</span>';

            const itemDiv = document.createElement('div');
            itemDiv.className = `timeline-item ${isTaken ? 'taken' : 'pending'}`;
            itemDiv.innerHTML = `
                <div class="timeline-time">${timeFormatted}</div>
                <div class="timeline-body">
                    <h4>
                        ${window.MediCare.escape(item.med.name)}
                        <span class="dosage-pill">${window.MediCare.escape(item.med.dosage)}</span>
                        ${statusBadge}
                    </h4>
                    <div class="timeline-meta">
                        <span><i class="fa-solid fa-glass-water"></i> ${formatFoodRelation(item.med.food)}</span>
                        <span><i class="fa-solid fa-stethoscope"></i> ${window.MediCare.escape(formatConditionName(item.med.condition))}</span>
                    </div>
                    ${item.med.notes ? `<p style="font-size:0.85rem; color: var(--text-muted); margin-top:4px;"><i class="fa-solid fa-sticky-note"></i> ${window.MediCare.escape(item.med.notes)}</p>` : ''}
                </div>
                <div class="timeline-actions">
                    <button class="btn ${isTaken ? 'btn-outline' : 'btn-success'} btn-toggle-taken" data-dose-id="${item.doseId}">
                        <i class="fa-solid ${isTaken ? 'fa-rotate-left' : 'fa-check'}"></i>
                        ${isTaken ? 'Mark Pending' : 'Mark taken'}
                    </button>
                    <button class="btn btn-danger-sm btn-delete-med" data-med-id="${item.med.id}" title="Remove Medication">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
            timelineContainer.appendChild(itemDiv);
        });

        document.querySelectorAll('.btn-toggle-taken').forEach(btn => {
            btn.addEventListener('click', () => {
                const doseId = btn.getAttribute('data-dose-id');
                const currentStatus = doseLogs[todayKey][doseId];
                if (currentStatus === 'taken') {
                    delete doseLogs[todayKey][doseId];
                } else {
                    doseLogs[todayKey][doseId] = 'taken';
                    playAlertSound();
                }
                saveState();
                renderSchedule();
            });
        });

        document.querySelectorAll('.btn-delete-med').forEach(btn => {
            btn.addEventListener('click', () => {
                const medId = btn.getAttribute('data-med-id');
                if (confirm('Are you sure you want to remove this medication from your schedule?')) {
                    medications = medications.filter(m => m.id !== medId);
                    saveState();
                    updateAllViews();
                }
            });
        });
    }

    function updateNextDoseBanner(upcoming) {
        const titleEl = document.getElementById('next-dose-title');
        const timeEl = document.getElementById('next-dose-time');
        const timerEl = document.getElementById('next-dose-timer');

        if (!upcoming) {
            titleEl.textContent = document.getElementById('stat-total').textContent === '0' ? 'No doses scheduled' : 'All scheduled doses recorded';
            timeEl.textContent = 'Great job staying on track with your health schedule.';
            timerEl.textContent = 'Done!';
            return;
        }

        titleEl.textContent = `${upcoming.med.name} (${upcoming.med.dosage})`;
        timeEl.textContent = `Scheduled for ${formatTime12h(upcoming.time)} • ${formatFoodRelation(upcoming.med.food)}`;
        timerEl.textContent = formatTime12h(upcoming.time);
    }

    function formatTime12h(time24) {
        const [hours, minutes] = time24.split(':');
        let h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${minutes} ${ampm}`;
    }

    function formatFoodRelation(val) {
        switch (val) {
            case 'after_water': return 'After food with plenty of water';
            case 'plenty_water': return 'With plenty of water (Swallow whole)';
            case 'with_food_water': return 'With meals & water';
            case 'before_water': return 'Before meals with water';
            case 'empty_water': return 'Empty stomach with plenty of water';
            default: return 'With plenty of water';
        }
    }

    function formatConditionName(val) {
        if (val === 'general') return 'General / All Health Conditions';
        const found = activeDiseases.find(d => d.id === val);
        if (found) return found.label;
        switch (val) {
            case 'pneumonia': return 'Pneumonia / Lung Infection';
            case 'diabetes': return 'Diabetes';
            case 'fatty_liver': return 'Fatty Liver (NAFLD)';
            case 'cholesterol': return 'High Cholesterol';
            case 'hypertension': return 'Hypertension (High BP)';
            case 'hypotension': return 'Low Blood Pressure';
            case 'anemia': return 'Anemia (Low Blood)';
            case 'acid_reflux': return 'Acid Reflux / Gastritis';
            case 'headache_migraine': return 'Fever / Paracetamol';
            case 'back_pain': return 'Back Pain';
            case 'joint_arthritis': return 'Joint Arthritis';
            case 'anxiety_stress': return 'Anxiety & Sleep';
            case 'custom_broken_leg': return 'Broken Leg / Fracture Recovery';
            default: return val.replace('custom_', '').replace(/_/g, ' ');
        }
    }

    function playAlertSound() {
        const sound = document.getElementById('alert-sound');
        if (sound) {
            sound.play().catch(() => {});
        }
    }

    // ----------------------------------------------------------------------
    // 9. Exercises Rendering & Filter by Checked Diseases + AI Generator
    // ----------------------------------------------------------------------
    function renderExercises() { window.MediCare.renderCollection('exercise', activeDiseases); }
    function renderRemedies() { window.MediCare.renderCollection('care', activeDiseases); }
    function renderCareGuidelines() { window.MediCare.renderCollection('safety', activeDiseases); }
    // ----------------------------------------------------------------------
    // 12. Initial Load & View Refresh
    // ----------------------------------------------------------------------
    renderDiseaseCheckboxGrid();
    updateAllViews();
});
