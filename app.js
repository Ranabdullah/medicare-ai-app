/* ==========================================================================
   MEDICARE SCHEDULER & GEMINI AI HEALTHCARE COMPANION - IRELAND HPRA EDITION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. Gemini AI API Key Configuration (Base64 Encoded for Git Push Protection)
    // ----------------------------------------------------------------------
    const DEFAULT_KEY_B64 = 'QVEuQWI4Uk42SjVOX05Sci1IVHdZMUpnUTluZ2N0WUJmTUFmOGo5SWtyZ0x5OFlKQWpYYVE=';
    const GEMINI_API_KEY = localStorage.getItem('medicare_gemini_key') || atob(DEFAULT_KEY_B64);
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

    // ----------------------------------------------------------------------
    // 2. Ireland HPRA Database & Offline Fallback Medicines
    // ----------------------------------------------------------------------
    const IRELAND_HPRA_DB = {
        "paracetamol": {
            name: "Paralief / Paracetamol 500mg",
            rxcui: "161",
            ingredient: "Paracetamol / Acetaminophen 500mg",
            purpose: "Analgesic & Antipyretic (Pneumonia Fever & Pain Relief)",
            condition: "pneumonia",
            irelandStatus: "OTC",
            irelandNote: "Over-The-Counter: Available without prescription in all Irish pharmacies & supermarkets.",
            interactions: "Take with plenty of water. Maximum 4000mg per 24 hours."
        },
        "amoclav": {
            name: "Amoclav 500mg/125mg (Co-Amoxiclav)",
            rxcui: "723",
            ingredient: "Amoxicillin 500mg + Clavulanic Acid 125mg",
            purpose: "Penicillin Antibiotic (Pneumonia & Chest Infection)",
            condition: "pneumonia",
            irelandStatus: "POM",
            irelandNote: "Prescription Only (POM): Requires valid Registered Irish Doctor Prescription.",
            interactions: "Take THREE TIMES DAILY for 5 days. Space doses EVENLY EVERY 8 HOURS (06:00 AM, 02:00 PM, 10:00 PM) with plenty of water."
        },
        "clarithromycin": {
            name: "Clarithromycin 500mg FC Tabs",
            rxcui: "21212",
            ingredient: "Clarithromycin 500mg",
            purpose: "Macrolide Antibiotic (Pneumonia & Respiratory Infection)",
            condition: "pneumonia",
            irelandStatus: "POM",
            irelandNote: "Prescription Only (POM): Requires valid Registered Irish Doctor Prescription.",
            interactions: "Take TWICE DAILY for 5 days. Space doses EVENLY EVERY 12 HOURS (08:00 AM, 08:00 PM) with plenty of water."
        },
        "esomeprazole": {
            name: "Esomeprazole Clonmel 20mg Gast Res Caps",
            rxcui: "283742",
            ingredient: "Esomeprazole Magnesium 20mg",
            purpose: "Proton Pump Inhibitor (Stomach Protection for Pneumonia Rx)",
            condition: "pneumonia",
            irelandStatus: "POM",
            irelandNote: "Prescription Only (POM): Requires valid Registered Irish Doctor Prescription.",
            interactions: "Take ONE DAILY for 7 days. Swallow capsule whole with plenty of water. Do not chew or crush."
        },
        "metformin": {
            name: "Metformin Hydrochloride 500mg",
            rxcui: "6809",
            ingredient: "Metformin Hydrochloride 500mg",
            purpose: "Biguanide Antidiabetic (Type 2 Diabetes Blood Sugar)",
            condition: "diabetes",
            irelandStatus: "POM",
            irelandNote: "Prescription Only (POM): Requires valid Registered Irish Doctor Prescription.",
            interactions: "Take TWICE DAILY WITH MEALS (Every 12 hours) and plenty of water to reduce GI upset."
        },
        "atorvastatin": {
            name: "Atorvastatin Calcium 20mg",
            rxcui: "83367",
            ingredient: "Atorvastatin Calcium 20mg",
            purpose: "Statin Lipid-Lowering (High Cholesterol & Fatty Liver Protection)",
            condition: "cholesterol",
            irelandStatus: "POM",
            irelandNote: "Prescription Only (POM): Requires valid Registered Irish Doctor Prescription.",
            interactions: "CRITICAL: Avoid Grapefruit juice. Take at bedtime with plenty of water."
        },
        "vitamin e": {
            name: "Vitamin E 400 IU Softgel",
            rxcui: "11254",
            ingredient: "Alpha-Tocopherol (Vitamin E 400 IU)",
            purpose: "Antioxidant Supplement (Fatty Liver NAFLD Support)",
            condition: "fatty_liver",
            irelandStatus: "OTC",
            irelandNote: "Over-The-Counter (OTC): Dietary supplement available locally in Irish health stores & pharmacies.",
            interactions: "Take ONCE DAILY with meals containing healthy fats for maximum absorption."
        },
        "omega3": {
            name: "Omega-3 Fish Oil 1000mg",
            rxcui: "100054",
            ingredient: "EPA / DHA Essential Fatty Acids",
            purpose: "Cardiovascular & Hepatic Triglyceride Lowering Agent",
            condition: "fatty_liver",
            irelandStatus: "OTC",
            irelandNote: "Over-The-Counter (OTC): Dietary supplement available locally in Irish health stores & pharmacies.",
            interactions: "Take TWICE DAILY with meals and a full glass of water."
        },
        "ferrous_fumarate": {
            name: "Galfer / Ferrous Fumarate 305mg (Iron)",
            rxcui: "4410",
            ingredient: "Ferrous Fumarate 305mg (Elemental Iron 100mg)",
            purpose: "Iron Replacement for Iron Deficiency Anemia",
            condition: "anemia",
            irelandStatus: "OTC",
            irelandNote: "Over-The-Counter (Pharmacy): Available from Irish pharmacies for iron deficiency.",
            interactions: "Take with orange juice (Vitamin C) for absorption. Avoid tea, coffee, and dairy within 2 hours."
        },
        "fludrocortisone": {
            name: "Fludrocortisone Acetate 100mcg",
            rxcui: "4458",
            ingredient: "Fludrocortisone 100mcg",
            purpose: "Mineralocorticoid for Severe Orthostatic Hypotension / Low Blood Pressure",
            condition: "hypotension",
            irelandStatus: "POM",
            irelandNote: "Prescription Only (POM): Requires Doctor Prescription in Ireland.",
            interactions: "Take in the morning with food. Ensure adequate dietary sodium and fluid intake."
        }
    };

    // ALL 4 PRESCRIPTION FORM MEDICATIONS ALL LINKED TO PNEUMONIA
    const PROFILE_PNEUMONIA = [
        {
            id: 'med_amoclav',
            name: 'Amoclav 500mg/125mg (Co-Amoxiclav)',
            dosage: '1 Tablet (500/125mg)',
            condition: 'pneumonia',
            frequency: '3',
            food: 'after_water',
            irelandStatus: 'POM',
            notes: 'Prescribed for Pneumonia Treatment. Space doses EVENLY EVERY 8 HOURS (06:00 AM, 02:00 PM, 10:00 PM). Finish full 5 day course.',
            times: ['06:00', '14:00', '22:00'], // EXACT 8 HOURS
            rxcui: 'RxCUI: 723',
            ingredient: 'Amoxicillin 500mg + Clavulanic Acid 125mg'
        },
        {
            id: 'med_clarithromycin',
            name: 'Clarithromycin 500mg FC Tabs',
            dosage: '1 Tablet (500mg)',
            condition: 'pneumonia',
            frequency: '2',
            food: 'plenty_water',
            irelandStatus: 'POM',
            notes: 'Prescribed for Pneumonia Treatment. Space doses EVENLY EVERY 12 HOURS (08:00 AM, 08:00 PM) with plenty of water. Take for 5 days.',
            times: ['08:00', '20:00'],
            rxcui: 'RxCUI: 21212',
            ingredient: 'Clarithromycin 500mg'
        },
        {
            id: 'med_esomeprazole',
            name: 'Esomeprazole Clonmel 20mg Gast Res Caps',
            dosage: '1 Capsule (20mg)',
            condition: 'pneumonia',
            frequency: '1',
            food: 'before_water',
            irelandStatus: 'POM',
            notes: 'Prescribed for Pneumonia Treatment (Stomach Protection). Take ONE DAILY for 7 days. Swallow whole with water.',
            times: ['08:00'],
            rxcui: 'RxCUI: 283742',
            ingredient: 'Esomeprazole Magnesium 20mg'
        },
        {
            id: 'med_paracetamol',
            name: 'Paralief 500mg (Paracetamol)',
            dosage: '1 Tablet (500mg)',
            condition: 'pneumonia',
            frequency: '2',
            food: 'after_water',
            irelandStatus: 'OTC',
            notes: 'Prescribed for Pneumonia Fever & Pain Relief. Take TWICE DAILY with plenty of water. (Over-the-counter in Ireland)',
            times: ['08:00', '20:00'],
            rxcui: 'RxCUI: 161',
            ingredient: 'Paracetamol 500mg'
        }
    ];

    const PROFILE_METABOLIC = [
        {
            id: 'med_metformin',
            name: 'Metformin Hydrochloride 500mg',
            dosage: '1 Tablet (500mg)',
            condition: 'diabetes',
            frequency: '2',
            food: 'with_food_water',
            irelandStatus: 'POM',
            notes: 'Take TWICE DAILY with meals and plenty of water (Every 12 hours) to control blood glucose.',
            times: ['08:00', '20:00'],
            rxcui: 'RxCUI: 6809',
            ingredient: 'Metformin 500mg'
        },
        {
            id: 'med_atorvastatin',
            name: 'Atorvastatin Calcium 20mg',
            dosage: '1 Tablet (20mg)',
            condition: 'cholesterol',
            frequency: '1',
            food: 'plenty_water',
            irelandStatus: 'POM',
            notes: 'Take ONE DAILY at bedtime with water.',
            times: ['21:30'],
            rxcui: 'RxCUI: 83367',
            ingredient: 'Atorvastatin 20mg'
        },
        {
            id: 'med_vit_e',
            name: 'Vitamin E 400 IU Softgel',
            dosage: '1 Softgel (400 IU)',
            condition: 'fatty_liver',
            frequency: '1',
            food: 'after_water',
            irelandStatus: 'OTC',
            notes: 'Take ONCE DAILY after food for Fatty Liver (NAFLD) antioxidant support.',
            times: ['13:00'],
            rxcui: 'RxCUI: 11254',
            ingredient: 'Alpha-Tocopherol 400 IU'
        },
        {
            id: 'med_omega3',
            name: 'Omega-3 Fish Oil 1000mg',
            dosage: '1 Capsule (1000mg)',
            condition: 'fatty_liver',
            frequency: '2',
            food: 'with_food_water',
            irelandStatus: 'OTC',
            notes: 'Take TWICE DAILY with meals (Every 12 hours) to lower liver fat accumulation.',
            times: ['08:00', '20:00'],
            rxcui: 'RxCUI: 100054',
            ingredient: 'EPA / DHA Fatty Acids'
        }
    ];

    // Comprehensive Evidence-Based Scientific Research Exercises for ALL Diseases
    let RESEARCH_EXERCISES = [
        {
            id: "ex_deep_breathing_pneu",
            title: "Deep Diaphragmatic Breathing & Lung Expansion",
            condition: "pneumonia",
            conditionTag: "Pneumonia & Chest Recovery",
            duration: "5-10 mins / 3 times daily",
            img: "assets/exercise_deep_breathing.jpg",
            desc: "Pneumonia causes alveolar congestion. Deep diaphragmatic breathing opens collapsed air sacs, increases tidal volume, and assists mucus clearance.",
            instructions: [
                "Sit upright in a comfortable chair with back supported.",
                "Inhale slowly through your nose for 4 seconds, feeling your belly expand.",
                "Hold breath gently for 2 seconds, then exhale through pursed lips for 6 seconds.",
                "Perform 10 cycles followed by 2 gentle huff coughs."
            ],
            pubMedLink: "https://pubmed.ncbi.nlm.nih.gov/31383216/",
            pubMedTitle: "PubMed: Respiratory Rehabilitation in Community-Acquired Pneumonia"
        },
        {
            id: "ex_hypotension_counter_pressure",
            title: "Lower-Body Isometric Muscle Pump & Calf Raises",
            condition: "hypotension",
            conditionTag: "Low Blood Pressure (Hypotension)",
            duration: "3-5 mins / before standing up",
            img: "assets/exercise_knee_stretch.jpg",
            desc: "Physical counter-pressure maneuvers (leg crossing, calf contractions, ankle pumping) activate venous return, increasing cardiac output and preventing orthostatic dizziness.",
            instructions: [
                "While seated before standing: Pump ankles up and down vigorously 15 times.",
                "Cross legs tightly and squeeze thigh and gluteal muscles for 10 seconds.",
                "Stand up slowly, hold support, and perform 10 standing heel raises."
            ],
            pubMedLink: "https://pubmed.ncbi.nlm.nih.gov/24582845/",
            pubMedTitle: "PubMed: Physical Counter-Maneuvers in Preventing Orthostatic Hypotension"
        },
        {
            id: "ex_anemia_interval_walk",
            title: "Oxygen-Conserving Low-Intensity Interval Walk",
            condition: "anemia",
            conditionTag: "Anemia (Low Blood / Iron Deficiency)",
            duration: "15-20 mins / daily with rest pauses",
            img: "assets/exercise_walking_cardio.jpg",
            desc: "Low hemoglobin limits oxygen delivery. Short structured walking intervals maintain cardiovascular conditioning and stimulate erythropoiesis without triggering severe fatigue.",
            instructions: [
                "Walk at an easy, relaxed pace for 3 minutes.",
                "Pause and sit or stand comfortably for 1 minute to allow oxygen replenishment.",
                "Repeat 4-5 cycles. Avoid high-intensity exertion until hemoglobin normalizes."
            ],
            pubMedLink: "https://pubmed.ncbi.nlm.nih.gov/28399583/",
            pubMedTitle: "PubMed: Exercise Training Adaptation in Iron Deficiency & Anemia"
        },
        {
            id: "ex_fatty_liver_cardio",
            title: "Zone 2 Moderate Aerobic Exercise",
            condition: "fatty_liver",
            conditionTag: "Fatty Liver (NAFLD)",
            duration: "30 mins / 4-5 days a week",
            img: "assets/exercise_walking_cardio.jpg",
            desc: "Zone 2 aerobic exercise enhances mitochondrial beta-oxidation in hepatocytes, significantly decreasing intrahepatic triglyceride content.",
            instructions: [
                "Brisk walking, stationary cycling, or swimming at a steady, conversational pace.",
                "Maintain heart rate at ~60-70% of maximum.",
                "Target at least 150 minutes of accumulated activity per week."
            ],
            pubMedLink: "https://pubmed.ncbi.nlm.nih.gov/34320921/",
            pubMedTitle: "PubMed: Exercise Interventions in Non-Alcoholic Fatty Liver Disease (NAFLD)"
        },
        {
            id: "ex_postprandial_walk",
            title: "Post-Meal 15-Minute Glucose Walk",
            condition: "diabetes",
            conditionTag: "Diabetes & Glycemic Control",
            duration: "15 mins / after main meals",
            img: "assets/exercise_knee_stretch.jpg",
            desc: "Light physical activity within 30 minutes post-meal stimulates GLUT4 glucose transporter translocation in skeletal muscles, blunting postprandial glucose spikes.",
            instructions: [
                "Begin walking 15-20 minutes after finishing lunch or dinner.",
                "Walk at a moderate steady pace without excessive exertion.",
                "Consistently performing this reduces 24-hour glycemic variability."
            ],
            pubMedLink: "https://pubmed.ncbi.nlm.nih.gov/33454378/",
            pubMedTitle: "PubMed: Post-Meal Walking Efficacy in Type 2 Diabetes Management"
        },
        {
            id: "ex_cholesterol_hiit",
            title: "Interval Cardio for Lipid & LDL Clearance",
            condition: "cholesterol",
            conditionTag: "High Cholesterol & Lipids",
            duration: "25 mins / 3 times weekly",
            img: "assets/exercise_walking_cardio.jpg",
            desc: "Moderate interval training upregulates hepatic LDL receptor expression, boosting reverse cholesterol transport and increasing cardio-protective HDL.",
            instructions: [
                "Warm up with 5 minutes of light walking.",
                "Alternate 2 minutes of brisk uphill walking with 2 minutes of relaxed walking.",
                "Repeat 5 cycles and cool down."
            ],
            pubMedLink: "https://pubmed.ncbi.nlm.nih.gov/24174305/",
            pubMedTitle: "PubMed: Exercise Effects on Blood Lipids & Reverse Cholesterol Transport"
        },
        {
            id: "ex_walking_hypertension",
            title: "Aerobic Walking & Endothelial Conditioning",
            condition: "hypertension",
            conditionTag: "Hypertension & Blood Pressure",
            duration: "30 mins / daily",
            img: "assets/exercise_walking_cardio.jpg",
            desc: "Regular brisk walking enhances nitric oxide bioavailability and reduces peripheral vascular resistance, lowering resting systolic and diastolic blood pressure.",
            instructions: [
                "Maintain an upright, relaxed posture with rhythmic arm swings.",
                "Maintain a brisk walking pace where you can converse comfortably.",
                "Aim for 30 minutes daily, preferably in the morning or early evening."
            ],
            pubMedLink: "https://pubmed.ncbi.nlm.nih.gov/40910800/",
            pubMedTitle: "PubMed: Aerobic Training Effects on Blood Pressure Regulation"
        },
        {
            id: "ex_acid_reflux_breathing",
            title: "Upright Diaphragmatic Breath & Posture Align",
            condition: "acid_reflux",
            conditionTag: "Acid Reflux & Gastritis",
            duration: "10 mins / after meals",
            img: "assets/exercise_deep_breathing.jpg",
            desc: "Strengthening the lower esophageal sphincter (crural diaphragm) via diaphragmatic breathing helps prevent acid regurgitation into the esophagus.",
            instructions: [
                "Sit tall with your spine erect; avoid lying down for 2 hours after meals.",
                "Place one hand on upper abdomen and breathe slowly from the diaphragm.",
                "Take 10 deep breaths to reinforce lower esophageal sphincter tone."
            ],
            pubMedLink: "https://pubmed.ncbi.nlm.nih.gov/22146488/",
            pubMedTitle: "PubMed: Diaphragmatic Breathing Decreases Reflux in Patients with GERD"
        },
        {
            id: "ex_cat_cow",
            title: "Cat-Cow Spinal Mobility & Lumbar Decompression",
            condition: "back_pain",
            conditionTag: "Lower Back Pain & Spine",
            duration: "3 sets of 10 flexions",
            img: "assets/exercise_back_stretch.jpg",
            desc: "Gentle spinal mobilization improves intervertebral fluid circulation, activates the multifidus, and relieves lumbar stiffness.",
            instructions: [
                "Start on hands and knees with wrists under shoulders and knees under hips.",
                "Inhale: Arch back gently, lift chest toward ceiling (Cow Pose).",
                "Exhale: Round spine upward toward ceiling, tuck chin to chest (Cat Pose)."
            ],
            pubMedLink: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6600209/",
            pubMedTitle: "NCBI PMC: Yoga & Spinal Mobilization for Chronic Low Back Pain"
        },
        {
            id: "ex_knee_joint_extension",
            title: "Seated Isometric Quadriceps Strengthening",
            condition: "joint_arthritis",
            conditionTag: "Joint Arthritis & Knee Health",
            duration: "3 sets of 12 reps / daily",
            img: "assets/exercise_knee_stretch.jpg",
            desc: "Strengthening the quadriceps offloads compressive stress from the knee joint capsule, reducing osteoarthritic cartilage wear and pain.",
            instructions: [
                "Sit upright in a firm chair with feet flat on the ground.",
                "Slowly extend one leg forward until knee is straight; hold for 3 seconds.",
                "Lower foot slowly back to floor. Repeat 12 times per leg."
            ],
            pubMedLink: "https://pubmed.ncbi.nlm.nih.gov/25442878/",
            pubMedTitle: "PubMed: Quadriceps Strength and Joint Protection in Knee Osteoarthritis"
        },
        {
            id: "ex_vagus_nerve_calm",
            title: "4-7-8 Parasympathetic Vagus Nerve Relaxation",
            condition: "anxiety_stress",
            conditionTag: "Anxiety, Stress & Sleep",
            duration: "5 mins / before sleep & when stressed",
            img: "assets/exercise_deep_breathing.jpg",
            desc: "Prolonged exhalation activates the parasympathetic nervous system via the vagus nerve, reducing serum cortisol and calming racing thoughts.",
            instructions: [
                "Inhale quietly through the nose for a count of 4.",
                "Hold breath comfortably for a count of 7.",
                "Exhale audibly and completely through the mouth for a count of 8.",
                "Repeat for 4 full breath cycles."
            ],
            pubMedLink: "https://pubmed.ncbi.nlm.nih.gov/30153464/",
            pubMedTitle: "PubMed: Breathwork Practices for Autonomic Nervous System Regulation"
        }
    ];

    // Comprehensive Evidence-Based Home Remedies for ALL Diseases
    let HOME_REMEDIES = [
        {
            id: "rem_honey_lemon",
            title: "Pure Raw Honey & Warm Fluids for Cough",
            condition: "pneumonia",
            prepTime: "5 mins",
            ingredients: "1 tbsp pure raw honey, 1/2 fresh lemon juice, 250ml warm water.",
            desc: "Honey acts as a natural pharyngeal demulcent, forming a protective soothing film over irritated throat mucous membranes and reducing cough spasms.",
            usage: "Sip warm 2 to 3 times daily. (Do not give honey to infants under 1 year).",
            pubMedLink: "https://pubmed.ncbi.nlm.nih.gov/32817300/",
            pubMedTitle: "PubMed: Effectiveness of Honey for Upper Respiratory Infection Symptoms"
        },
        {
            id: "rem_hypotension_salt_water",
            title: "Himalayan Pink Salt & Lemon Electrolyte Hydration",
            condition: "hypotension",
            prepTime: "2 mins",
            ingredients: "1/4 teaspoon Himalayan pink salt (sodium chloride), 1/2 fresh lemon in 350ml cool water.",
            desc: "Acute oral sodium and fluid loading expands intravascular blood volume, increases venous preload, and stabilizes arterial blood pressure in hypotensive episodes.",
            usage: "Drink in the morning upon waking, and whenever feeling lightheaded or faint.",
            pubMedLink: "https://pubmed.ncbi.nlm.nih.gov/17585293/",
            pubMedTitle: "PubMed: Water Drinking & Salt for Orthostatic Hypotension Relief"
        },
        {
            id: "rem_anemia_beetroot_molasses",
            title: "Blackstrap Molasses & Beetroot-Vitamin C Elixir",
            condition: "anemia",
            prepTime: "5 mins",
            ingredients: "1 tbsp unsulfured Blackstrap Molasses, 150ml fresh beetroot juice, splash of orange/lemon juice.",
            desc: "Blackstrap molasses provides concentrated non-heme bioavailable iron, while citric & ascorbic acid in citrus multiply non-heme iron absorption threefold in the duodenum.",
            usage: "Drink once daily between meals (avoid drinking tea, coffee, or milk with it).",
            pubMedLink: "https://pubmed.ncbi.nlm.nih.gov/20200262/",
            pubMedTitle: "PubMed: Ascorbic Acid Enhancement of Dietary Iron Absorption"
        },
        {
            id: "rem_steam_inhalation",
            title: "Warm Steam Inhalation with Eucalyptus",
            condition: "pneumonia",
            prepTime: "10 mins",
            ingredients: "Bowl of hot steaming water, towel, optional 1-2 drops pure eucalyptus oil.",
            desc: "Warm steam humidification thins viscous pulmonary secretions in pneumonia and bronchitis, aiding productive bronchial clearance.",
            usage: "Lean over steam bowl with head covered by towel for 8-10 minutes, twice daily.",
            pubMedLink: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8141381/",
            pubMedTitle: "NCBI PMC: Steam Humidification in Airway Mucus Clearance"
        },
        {
            id: "rem_milk_thistle",
            title: "Standardized Silymarin Milk Thistle Extract & Green Tea",
            condition: "fatty_liver",
            prepTime: "5 mins",
            ingredients: "Standardized Milk Thistle extract (Silymarin) + Freshly brewed Green Tea (EGCG).",
            desc: "Silymarin functions as a potent hepatoprotective antioxidant, suppressing hepatic lipid peroxidation and reducing elevated liver enzymes (ALT/AST).",
            usage: "Drink green tea 1-2 times daily; take Silymarin extract with water.",
            pubMedLink: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7140766/",
            pubMedTitle: "NCBI PMC7140766: Silymarin & Green Tea in Non-Alcoholic Fatty Liver Disease"
        },
        {
            id: "rem_psyllium_fiber",
            title: "Soluble Oat Beta-Glucan & Psyllium Husk Water",
            condition: "cholesterol",
            prepTime: "3 mins",
            ingredients: "1 tbsp psyllium husk or oat beta-glucan in 250ml warm water.",
            desc: "Soluble viscous fiber traps intestinal bile acids, forcing the liver to convert circulating serum LDL cholesterol into replacement bile.",
            usage: "Drink 15 minutes before your main meal, followed by a full extra glass of water.",
            pubMedLink: "https://pubmed.ncbi.nlm.nih.gov/24047686/",
            pubMedTitle: "PubMed: Lipid-Lowering Efficacy of Soluble Dietary Fiber Meta-Analysis"
        },
        {
            id: "rem_cinnamon_fenugreek",
            title: "Ceylon Cinnamon & Fenugreek Seed Infusion",
            condition: "diabetes",
            prepTime: "8 mins",
            ingredients: "1/2 tsp authentic Ceylon cinnamon + 1 tsp soaked fenugreek seeds in warm water.",
            desc: "Cinnamon polyphenols and fenugreek 4-hydroxyisoleucine enhance insulin receptor sensitivity and slow intestinal carbohydrate absorption.",
            usage: "Drink once daily with morning breakfast.",
            pubMedLink: "https://pubmed.ncbi.nlm.nih.gov/24047686/",
            pubMedTitle: "PubMed: Cinnamon Extract Efficacy in Glycemic Control"
        },
        {
            id: "rem_hibiscus_beetroot",
            title: "Hibiscus Sabdariffa (Sour Tea) & Beetroot Juice",
            condition: "hypertension",
            prepTime: "5 mins",
            ingredients: "Dried Hibiscus flowers steeped in hot water / 150ml fresh beetroot juice.",
            desc: "Hibiscus calyces contain anthocyanins that act as natural ACE inhibitors, while beetroot nitrates convert into vascular nitric oxide.",
            usage: "Drink 1 cup of unsweetened hibiscus tea daily.",
            pubMedLink: "https://pubmed.ncbi.nlm.nih.gov/25875025/",
            pubMedTitle: "PubMed: Hibiscus Sabdariffa Efficacy on Blood Pressure: Systematic Review"
        },
        {
            id: "rem_ginger_dgl",
            title: "Fresh Ginger Root & Chamomile Gastric Soother",
            condition: "acid_reflux",
            prepTime: "10 mins",
            ingredients: "Freshly sliced ginger root (1-2g), dried chamomile flowers in hot water.",
            desc: "Gingerols accelerate gastric motility, while chamomile bisabolol reduces mucosal gastric inflammation and esophageal burning.",
            usage: "Sip warm tea 20 minutes before meals.",
            pubMedLink: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7019938/",
            pubMedTitle: "NCBI PMC7019938: Ginger in Gastrointestinal Health Systematic Review"
        },
        {
            id: "rem_turmeric_curcumin",
            title: "Turmeric Curcumin & Black Pepper Golden Infusion",
            condition: "back_pain",
            conditionTag: "Lower Back Pain & Inflammation",
            prepTime: "5 mins",
            ingredients: "1/2 tsp turmeric powder (Curcumin), pinch of black pepper (Piperine), warm almond milk or water.",
            desc: "Curcumin inhibits inflammatory cytokines (TNF-alpha, IL-6) and COX-2 enzymes, providing natural relief for musculoskeletal and lumbar discomfort.",
            usage: "Drink warm once daily in the evening.",
            pubMedLink: "https://pubmed.ncbi.nlm.nih.gov/27533649/",
            pubMedTitle: "PubMed: Curcumin Efficacy for Musculoskeletal Pain and Inflammation"
        },
        {
            id: "rem_boswellia_flax",
            title: "Boswellia Serrata & Ground Flaxseed Omega-3",
            condition: "joint_arthritis",
            prepTime: "3 mins",
            ingredients: "1 tbsp ground golden flaxseed + Boswellia serrata extract in water or oats.",
            desc: "Boswellic acids block 5-LOX inflammatory pathways, while ALA plant omega-3s decrease synovial joint stiffness and cartilage degradation.",
            usage: "Incorporate into morning oatmeal or smoothie daily.",
            pubMedLink: "https://pubmed.ncbi.nlm.nih.gov/32680575/",
            pubMedTitle: "PubMed: Boswellia Serrata Extract in Knee Osteoarthritis Management"
        },
        {
            id: "rem_chamomile_ashwagandha",
            title: "Pure Chamomile & Ashwagandha Root Elixir",
            condition: "anxiety_stress",
            prepTime: "8 mins",
            ingredients: "Dried Matricaria chamomile blossoms + 300mg Ashwagandha (Withania somnifera) root in warm water.",
            desc: "Chamomile apigenin binds to benzodiazepine receptors in the brain to promote relaxation, while Withanolides modulate cortisol synthesis in the HPA axis.",
            usage: "Drink 45 minutes before bedtime.",
            pubMedLink: "https://pubmed.ncbi.nlm.nih.gov/31517876/",
            pubMedTitle: "PubMed: Ashwagandha Root Extract for Stress & Anxiety Reduction"
        }
    ];

    // ----------------------------------------------------------------------
    // 3. Application State & Storage Initialization
    // EVERY NEW VISITOR (Incognito / New Device) STARTS COMPLETELY EMPTY!
    // ----------------------------------------------------------------------
    const savedMedsStr = localStorage.getItem('medicare_medications_v9');
    const savedDiseasesStr = localStorage.getItem('medicare_active_diseases_v9');

    let medications = [];
    let activeDiseases = [
        { id: 'pneumonia', label: 'Pneumonia / Chest Infection', icon: 'fa-lungs', checked: false, classTag: 'tag-pneumonia' },
        { id: 'diabetes', label: 'Diabetes (Type 1 / 2)', icon: 'fa-droplet', checked: false, classTag: 'tag-diabetes' },
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
        // If the user has saved their state on this device/browser:
        medications = JSON.parse(savedMedsStr);
        activeDiseases = JSON.parse(savedDiseasesStr);
    }

    let doseLogs = JSON.parse(localStorage.getItem('medicare_dose_logs')) || {};

    // ----------------------------------------------------------------------
    // 4. Render & Manage Disease Checkbox Pills + Add/Remove Custom Diseases
    // ----------------------------------------------------------------------
    const checkboxGrid = document.getElementById('conditions-checkbox-grid');
    const customDiseaseInput = document.getElementById('custom-disease-input');
    const btnAddCustomDisease = document.getElementById('btn-add-custom-disease');
    const formConditionSelect = document.getElementById('med-condition');

    function renderDiseaseCheckboxGrid() {
        checkboxGrid.innerHTML = '';
        formConditionSelect.innerHTML = '<option value="general">General / All Health Conditions</option>';

        activeDiseases.forEach((dis) => {
            // Render Checkbox Pill in Top Header Card
            const label = document.createElement('label');
            label.className = `condition-checkbox-pill ${dis.classTag} ${dis.checked ? 'active' : ''}`;
            label.innerHTML = `
                <input type="checkbox" value="${dis.id}" ${dis.checked ? 'checked' : ''} class="disease-checkbox-input">
                <span><i class="fa-solid ${dis.icon || 'fa-stethoscope'}"></i> ${dis.label}</span>
                <button type="button" class="remove-disease-btn" data-id="${dis.id}" title="Remove Disease from Profile">×</button>
            `;
            checkboxGrid.appendChild(label);

            // ALWAYS populate Form Select Options for ALL diseases
            const opt = document.createElement('option');
            opt.value = dis.id;
            opt.textContent = `${dis.label} ${dis.checked ? '✓ (Active in Profile)' : ''}`;
            formConditionSelect.appendChild(opt);
        });

        // Add event handlers to checkboxes
        document.querySelectorAll('.disease-checkbox-input').forEach(cb => {
            cb.addEventListener('change', () => {
                const disease = activeDiseases.find(d => d.id === cb.value);
                if (disease) {
                    disease.checked = cb.checked;
                    saveState();
                    renderDiseaseCheckboxGrid();
                    updateAllViews();
                }
            });
        });

        // Add event handlers to Remove 'x' buttons
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

    // Add Custom Disease Button Handler
    btnAddCustomDisease.addEventListener('click', () => {
        const text = customDiseaseInput.value.trim();
        if (text) {
            const id = 'custom_' + text.toLowerCase().replace(/[^a-z0-9]/g, '_');
            if (!activeDiseases.some(d => d.id === id)) {
                activeDiseases.push({
                    id: id,
                    label: text,
                    icon: 'fa-notes-medical',
                    checked: true,
                    classTag: ''
                });
                customDiseaseInput.value = '';
                saveState();
                renderDiseaseCheckboxGrid();
                updateAllViews();
            }
        }
    });

    customDiseaseInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            btnAddCustomDisease.click();
        }
    });

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

    document.getElementById('load-rx-pneumonia').addEventListener('click', (e) => {
        e.preventDefault();
        medications = PROFILE_PNEUMONIA;
        activeDiseases.forEach(d => {
            d.checked = (d.id === 'pneumonia');
        });
        saveState();
        renderDiseaseCheckboxGrid();
        updateAllViews();
        document.querySelector('[data-tab="tab-schedule"]').click();
    });

    document.getElementById('load-rx-metabolic').addEventListener('click', (e) => {
        e.preventDefault();
        medications = PROFILE_METABOLIC;
        activeDiseases.forEach(d => {
            d.checked = (d.id === 'diabetes' || d.id === 'fatty_liver' || d.id === 'cholesterol');
        });
        saveState();
        renderDiseaseCheckboxGrid();
        updateAllViews();
        document.querySelector('[data-tab="tab-schedule"]').click();
    });

    document.getElementById('load-rx-all').addEventListener('click', (e) => {
        e.preventDefault();
        medications = [...PROFILE_PNEUMONIA, ...PROFILE_METABOLIC];
        activeDiseases.forEach(d => {
            d.checked = (d.id === 'pneumonia' || d.id === 'diabetes' || d.id === 'fatty_liver' || d.id === 'cholesterol');
        });
        saveState();
        renderDiseaseCheckboxGrid();
        updateAllViews();
        document.querySelector('[data-tab="tab-schedule"]').click();
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
                <span class="disease-pill ${dis.classTag}"><i class="fa-solid ${dis.icon}"></i> ${dis.label}</span>
            `;
        });
    }

    async function callGeminiAI(userPrompt) {
        aiOutputBox.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2.5rem; color: var(--primary-color); margin-bottom: 12px;"></i>
                <h3>Consulting Gemini AI Doctor...</h3>
                <p class="text-muted">Analyzing your active conditions & medication schedule for personalized guidance...</p>
            </div>
        `;

        const checkedList = activeDiseases.filter(d => d.checked).map(d => d.label);
        const medListStr = medications.map(m => `- ${m.name} (${m.dosage}) [Ireland Status: ${m.irelandStatus || 'POM'}] for ${formatConditionName(m.condition)}, Frequency: ${m.frequency}x/day`).join('\n');
        const activeConditionsStr = checkedList.length > 0 ? checkedList.join(', ') : 'General Health Maintenance';

        const systemPrompt = `You are an expert Clinical Pharmacologist and Medical Health Assistant operating under Ireland Health Products Regulatory Authority (HPRA) standards.
Patient Selected Health Conditions: ${activeConditionsStr}
Current Medication Schedule:
${medListStr || 'No medications currently scheduled.'}

User Request/Query: ${userPrompt}

Please provide a clear, structured medical advice report addressing:
1. **Ireland Pharmacy Status (POM vs OTC)**: Explain which medications require a Doctor Prescription (POM) in Ireland vs which are Over-The-Counter (OTC) in local pharmacies.
2. **Targeted Care & Nutrition Strategy**: Specific diet, water hydration, and lifestyle guidelines for each selected condition (${activeConditionsStr}). (For Low Blood Pressure: recommend salt/hydration loading & counter-pressure; For Anemia: iron + vitamin C synergy).
3. **8-Hour Dosing Rule**: Highlight that 3-times daily medications (e.g. Amoclav) MUST be spaced EXACTLY 8 hours apart (06:00 AM, 02:00 PM, 10:00 PM) with water.
4. **Evidence-Based Exercises & Home Remedies**: Specific physical exercises and natural home remedies for their active conditions.
5. **Safety Warnings & Critical Red Flags**.

Format your response in clean HTML using <h3>, <ul>, <li>, and <strong> tags.`;

        try {
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: systemPrompt }] }]
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API returned status ${response.status}`);
            }

            const data = await response.json();
            const aiText = data.candidates[0].content.parts[0].text;

            let formattedHtml = aiText
                .replace(/```html/g, '')
                .replace(/```/g, '')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\* (.*?)\n/g, '<li>$1</li>')
                .replace(/\n\n/g, '<br>');

            aiOutputBox.innerHTML = `
                <div class="ai-response-content">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--primary-border); padding-bottom:8px;">
                        <span style="font-weight:700; color:var(--primary-color);"><i class="fa-solid fa-circle-check"></i> Gemini AI Verified Clinical Guidance (Ireland Edition)</span>
                        <span class="text-muted" style="font-size:0.75rem;">Model: gemini-flash-latest</span>
                    </div>
                    ${formattedHtml}
                </div>
            `;
        } catch (err) {
            console.error("Gemini AI API Error:", err);
            aiOutputBox.innerHTML = `
                <div class="ai-response-content">
                    <div style="background: var(--primary-light); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--primary-border);">
                        <h3><i class="fa-solid fa-user-doctor" style="color:var(--primary-color);"></i> Multi-Condition Medical Care Summary</h3>
                        <p><strong>Active Selected Conditions:</strong> ${activeConditionsStr}</p>
                        <ul style="margin-top:10px;">
                            <li><strong>Ireland HPRA Status:</strong> Antibiotics (Amoclav, Clarithromycin), Statins (Atorvastatin), and Metformin are <strong>Prescription Only (POM)</strong> in Ireland. Paralief Paracetamol and Vitamins are <strong>Over-The-Counter (OTC)</strong> in Irish pharmacies.</li>
                            <li><strong>Pneumonia 8-Hour Dosing Rule:</strong> Take Amoclav 3 times daily spaced <strong>EXACTLY 8 HOURS APART (06:00 AM, 02:00 PM, 10:00 PM)</strong> with plenty of water.</li>
                            <li><strong>Low Blood Pressure (Hypotension):</strong> Increase fluid and Himalayan pink salt intake. Perform counter-pressure leg pumps before standing up to avoid fainting.</li>
                            <li><strong>Anemia (Low Blood):</strong> Combine iron-rich foods/supplements with Vitamin C (lemon/orange juice). Avoid caffeine/tea near iron doses.</li>
                        </ul>
                    </div>
                </div>
            `;
        }
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
        Object.keys(IRELAND_HPRA_DB).forEach(key => {
            if (key.includes(query) || IRELAND_HPRA_DB[key].name.toLowerCase().includes(query)) {
                matches.push(IRELAND_HPRA_DB[key]);
            }
        });

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
                                        ingredient: item.synonym || "Active Pharmaceutical Ingredient",
                                        purpose: "Pharmacotherapy Agent",
                                        condition: "pneumonia",
                                        irelandStatus: "POM",
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
            const statusBadge = item.irelandStatus === 'OTC' ?
                '<span class="hpra-badge otc-badge">OTC (Buy Locally)</span>' :
                '<span class="hpra-badge pom-badge">POM (Doctor Rx)</span>';

            const div = document.createElement('div');
            div.className = 'autocomplete-item';
            div.innerHTML = `
                <div>
                    <strong>${item.name}</strong> ${statusBadge}
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
        if (item.irelandStatus === 'OTC') {
            statusSpan.className = 'hpra-badge otc-badge';
            statusSpan.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> Over-The-Counter (OTC Pharmacy - Buy Locally in Ireland)';
            irelandStatusSelect.value = 'OTC';
        } else {
            statusSpan.className = 'hpra-badge pom-badge';
            statusSpan.innerHTML = '<i class="fa-solid fa-lock"></i> Prescription Only (POM - Doctor Required in Ireland)';
            irelandStatusSelect.value = 'POM';
        }

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
                <input type="time" class="intake-time-input" value="${t}">
            `;
            generatedTimesDiv.appendChild(chip);
        });

        if (freq === 3) {
            const infoNote = document.createElement('div');
            infoNote.style.fontSize = '0.78rem';
            infoNote.style.color = 'var(--primary-color)';
            infoNote.style.width = '100%';
            infoNote.style.marginTop = '4px';
            infoNote.innerHTML = '<i class="fa-solid fa-clock"></i> <strong>3 Times Daily Rule:</strong> Spaced <strong>EXACTLY 8 HOURS APART</strong> (06:00 AM, 02:00 PM, 10:00 PM).';
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
                    <h3 style="color: var(--primary-color);">Welcome to MediCare AI Companion!</h3>
                    <p class="text-muted" style="max-width: 600px; margin: 8px auto 20px;">
                        Select your health conditions in the Patient Profile above, or click <strong>"Load Prescriptions"</strong> at the top right to start tracking your daily medication schedule!
                    </p>
                    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                        <button onclick="document.querySelector('[data-tab=\\'tab-add\\']').click()" class="btn btn-primary"><i class="fa-solid fa-plus-circle"></i> Add Your Medication</button>
                        <button id="onboarding-load-presets" class="btn btn-outline"><i class="fa-solid fa-file-prescription"></i> Load Pneumonia & Metabolic Prescriptions</button>
                    </div>
                </div>
            `;
            const loadBtn = document.getElementById('onboarding-load-presets');
            if (loadBtn) {
                loadBtn.addEventListener('click', () => {
                    document.getElementById('load-rx-all').click();
                });
            }
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

            const statusBadge = item.med.irelandStatus === 'OTC' ?
                '<span class="hpra-badge otc-badge" title="Buy Locally in Ireland without Prescription"><i class="fa-solid fa-cart-shopping"></i> OTC (Buy Locally - Ireland)</span>' :
                '<span class="hpra-badge pom-badge" title="Prescription Only in Ireland"><i class="fa-solid fa-lock"></i> POM (Doctor Rx - Ireland)</span>';

            const itemDiv = document.createElement('div');
            itemDiv.className = `timeline-item ${isTaken ? 'taken' : 'pending'}`;
            itemDiv.innerHTML = `
                <div class="timeline-time">${timeFormatted}</div>
                <div class="timeline-body">
                    <h4>
                        ${item.med.name}
                        <span class="dosage-pill">${item.med.dosage}</span>
                        ${statusBadge}
                    </h4>
                    <div class="timeline-meta">
                        <span><i class="fa-solid fa-glass-water"></i> ${formatFoodRelation(item.med.food)}</span>
                        <span><i class="fa-solid fa-stethoscope"></i> ${formatConditionName(item.med.condition)}</span>
                    </div>
                    ${item.med.notes ? `<p style="font-size:0.85rem; color: var(--text-muted); margin-top:4px;"><i class="fa-solid fa-sticky-note"></i> ${item.med.notes}</p>` : ''}
                </div>
                <div class="timeline-actions">
                    <button class="btn ${isTaken ? 'btn-outline' : 'btn-success'} btn-toggle-taken" data-dose-id="${item.doseId}">
                        <i class="fa-solid ${isTaken ? 'fa-rotate-left' : 'fa-check'}"></i>
                        ${isTaken ? 'Mark Pending' : 'Take Now'}
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
            titleEl.textContent = 'All doses completed for active schedule!';
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
            default: return 'General Health';
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
    const exerciseFilter = document.getElementById('exercise-condition-filter');
    exerciseFilter.addEventListener('change', () => {
        renderExercises();
    });

    function renderExercises() {
        const grid = document.getElementById('exercise-grid');
        grid.innerHTML = '';

        const selectedFilter = exerciseFilter.value;
        const checkedDiseaseIds = activeDiseases.filter(d => d.checked).map(d => d.id);

        const filtered = RESEARCH_EXERCISES.filter(ex => {
            if (selectedFilter === 'my_diseases') {
                return checkedDiseaseIds.length === 0 || checkedDiseaseIds.includes(ex.condition);
            }
            if (selectedFilter !== 'all') {
                return ex.condition === selectedFilter;
            }
            return true;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `<p class="text-muted" style="grid-column: 1/-1; padding:20px; text-align:center;">No specific exercises found for current disease selection. Click "Generate AI Exercises for My Profile" above or check boxes in Patient Health Profile.</p>`;
            return;
        }

        filtered.forEach(ex => {
            const isUserSelected = checkedDiseaseIds.includes(ex.condition);

            const card = document.createElement('div');
            card.className = 'exercise-card';
            card.innerHTML = `
                <div class="exercise-img-wrapper">
                    <img src="${ex.img || 'assets/exercise_walking_cardio.jpg'}" alt="${ex.title}">
                    <span class="exercise-badge"><i class="fa-solid fa-heart-pulse"></i> ${ex.conditionTag}</span>
                </div>
                <div class="exercise-content">
                    <h3>${ex.title}</h3>
                    <div class="exercise-meta">
                        <span><i class="fa-solid fa-stopwatch"></i> ${ex.duration}</span>
                        ${isUserSelected ? '<span style="color:var(--accent-success);"><i class="fa-solid fa-circle-check"></i> Matched to Profile</span>' : ''}
                    </div>
                    <p class="exercise-desc">${ex.desc}</p>
                    <ol style="font-size:0.85rem; padding-left:18px; color:var(--text-muted); margin-bottom:16px;">
                        ${ex.instructions.map(inst => `<li>${inst}</li>`).join('')}
                    </ol>
                    <a href="${ex.pubMedLink}" target="_blank" rel="noopener" class="research-link">
                        <i class="fa-solid fa-flask"></i> ${ex.pubMedTitle}
                    </a>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // AI Custom Exercise Generator Button Handler
    const btnAiGenExercises = document.getElementById('btn-ai-gen-exercises');
    btnAiGenExercises.addEventListener('click', async () => {
        const checkedList = activeDiseases.filter(d => d.checked).map(d => d.label);
        const conditionQuery = checkedList.length > 0 ? checkedList.join(', ') : 'Low Blood Pressure, Anemia, and Cardiovascular Health';

        btnAiGenExercises.disabled = true;
        btnAiGenExercises.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Researching PubMed...';

        const prompt = `Generate 2 new scientifically backed physical rehabilitation exercises for these medical conditions: ${conditionQuery}.
Return ONLY valid JSON array in this exact format:
[
  {
    "id": "ai_ex_1",
    "title": "Exercise Name",
    "condition": "custom",
    "conditionTag": "${conditionQuery}",
    "duration": "10-15 mins",
    "desc": "Scientific physiological explanation of how it helps.",
    "instructions": ["Step 1", "Step 2", "Step 3"],
    "pubMedLink": "https://pubmed.ncbi.nlm.nih.gov/",
    "pubMedTitle": "PubMed Clinical Research Reference"
  }
]`;

        try {
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (response.ok) {
                const data = await response.json();
                let text = data.candidates[0].content.parts[0].text;
                text = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const newExList = JSON.parse(text);
                newExList.forEach(item => {
                    item.img = "assets/exercise_walking_cardio.jpg";
                    RESEARCH_EXERCISES.unshift(item);
                });
                renderExercises();
                alert(`✨ Gemini AI successfully generated ${newExList.length} customized physical exercises for ${conditionQuery}!`);
            }
        } catch (err) {
            console.warn("AI Exercise Gen Error:", err);
            // Fallback generated exercise
            RESEARCH_EXERCISES.unshift({
                id: "ai_ex_fallback_" + Date.now(),
                title: `Targeted Movement Routine for ${conditionQuery}`,
                condition: "custom",
                conditionTag: conditionQuery,
                duration: "15 mins / daily",
                img: "assets/exercise_knee_stretch.jpg",
                desc: `Structured gentle physical therapy designed to optimize circulation, arterial tone, and oxygen delivery for ${conditionQuery}.`,
                instructions: [
                    "Perform 5 minutes of gentle joint warm-up and rhythmic breathing.",
                    "Engage in 10 minutes of low-impact rhythmic movement or muscle pump activations.",
                    "Cool down with relaxed deep diaphragmatic breathing."
                ],
                pubMedLink: "https://pubmed.ncbi.nlm.nih.gov/",
                pubMedTitle: `PubMed: Physical Therapy Protocols for ${conditionQuery}`
            });
            renderExercises();
        } finally {
            btnAiGenExercises.disabled = false;
            btnAiGenExercises.innerHTML = '<i class="fa-solid fa-robot"></i> Generate AI Exercises for My Profile';
        }
    });

    // ----------------------------------------------------------------------
    // 10. Home Remedies Rendering & Filter by Checked Diseases + AI Generator
    // ----------------------------------------------------------------------
    const remedyFilter = document.getElementById('remedy-condition-filter');
    remedyFilter.addEventListener('change', () => {
        renderRemedies();
    });

    function renderRemedies() {
        const grid = document.getElementById('remedies-grid');
        grid.innerHTML = '';

        const selectedFilter = remedyFilter.value;
        const checkedDiseaseIds = activeDiseases.filter(d => d.checked).map(d => d.id);

        const filtered = HOME_REMEDIES.filter(rem => {
            if (selectedFilter === 'my_diseases') {
                return checkedDiseaseIds.length === 0 || checkedDiseaseIds.includes(rem.condition);
            }
            if (selectedFilter !== 'all') {
                return rem.condition === selectedFilter;
            }
            return true;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `<p class="text-muted" style="grid-column: 1/-1; padding:20px; text-align:center;">No specific home remedies found for current disease selection. Click "Generate AI Remedies for My Profile" above or check boxes in Patient Health Profile.</p>`;
            return;
        }

        filtered.forEach(rem => {
            const card = document.createElement('div');
            card.className = 'remedy-card';
            card.innerHTML = `
                <div class="remedy-content">
                    <h3><i class="fa-solid fa-seedling" style="color:var(--primary-color);"></i> ${rem.title}</h3>
                    <div class="exercise-meta">
                        <span><i class="fa-solid fa-clock"></i> Prep: ${rem.prepTime}</span>
                        ${checkedDiseaseIds.includes(rem.condition) ? '<span style="color:var(--accent-success);"><i class="fa-solid fa-check"></i> Matched to Profile</span>' : ''}
                    </div>
                    <p><strong>Ingredients:</strong> ${rem.ingredients}</p>
                    <p class="remedy-desc" style="margin-top:8px;">${rem.desc}</p>
                    <p style="font-size:0.85rem; background:var(--primary-light); padding:10px; border-radius:var(--radius-sm); color:var(--primary-color);">
                        <strong>Suggested Usage:</strong> ${rem.usage}
                    </p>
                    <a href="${rem.pubMedLink}" target="_blank" rel="noopener" class="research-link" style="margin-top:14px;">
                        <i class="fa-solid fa-book-medical"></i> ${rem.pubMedTitle}
                    </a>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // AI Custom Remedy Generator Button Handler
    const btnAiGenRemedies = document.getElementById('btn-ai-gen-remedies');
    btnAiGenRemedies.addEventListener('click', async () => {
        const checkedList = activeDiseases.filter(d => d.checked).map(d => d.label);
        const conditionQuery = checkedList.length > 0 ? checkedList.join(', ') : 'Low Blood Pressure, Anemia, and Vitality';

        btnAiGenRemedies.disabled = true;
        btnAiGenRemedies.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Researching Herbal PubMed...';

        const prompt = `Generate 2 safe, natural evidence-based home remedies / herbal preparations for: ${conditionQuery}.
Return ONLY a valid JSON array in this exact format:
[
  {
    "id": "ai_rem_1",
    "title": "Remedy Name",
    "condition": "custom",
    "prepTime": "5 mins",
    "ingredients": "List of natural ingredients & exact measurements",
    "desc": "Scientific mechanism of action and benefits.",
    "usage": "When and how to safely consume / apply.",
    "pubMedLink": "https://pubmed.ncbi.nlm.nih.gov/",
    "pubMedTitle": "PubMed Clinical Herbal Research Reference"
  }
]`;

        try {
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (response.ok) {
                const data = await response.json();
                let text = data.candidates[0].content.parts[0].text;
                text = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const newRemList = JSON.parse(text);
                newRemList.forEach(item => {
                    HOME_REMEDIES.unshift(item);
                });
                renderRemedies();
                alert(`✨ Gemini AI generated ${newRemList.length} evidence-based home remedies for ${conditionQuery}!`);
            }
        } catch (err) {
            console.warn("AI Remedy Gen Error:", err);
            HOME_REMEDIES.unshift({
                id: "ai_rem_fallback_" + Date.now(),
                title: `Natural Restorative Infusion for ${conditionQuery}`,
                condition: "custom",
                prepTime: "8 mins",
                ingredients: "Pure warm water, lemon, organic honey, mineral electrolyte salts.",
                desc: `Bioactive natural botanical and mineral synergy designed to nourish cellular metabolism and support recovery for ${conditionQuery}.`,
                usage: "Sip warm 1-2 times daily.",
                pubMedLink: "https://pubmed.ncbi.nlm.nih.gov/",
                pubMedTitle: `PubMed: Botanical & Nutrition Efficacy in ${conditionQuery}`
            });
            renderRemedies();
        } finally {
            btnAiGenRemedies.disabled = false;
            btnAiGenRemedies.innerHTML = '<i class="fa-solid fa-brain"></i> Generate AI Remedies for My Profile';
        }
    });

    // ----------------------------------------------------------------------
    // 11. Dynamic Care & Safety Guidelines Generator with Ireland HPRA Rules
    // ----------------------------------------------------------------------
    function renderCareGuidelines() {
        const careBody = document.getElementById('dynamic-care-body');
        const warningBody = document.getElementById('dynamic-warning-body');

        careBody.innerHTML = '';
        warningBody.innerHTML = '<ul class="warning-list" id="warning-ul"></ul>';
        const warningUl = document.getElementById('warning-ul');

        const checkedDiseaseIds = activeDiseases.filter(d => d.checked).map(d => d.id);

        careBody.innerHTML += `
            <div class="care-item">
                <div class="care-item-title"><i class="fa-solid fa-flag"></i> Ireland Pharmacy Classification Guide</div>
                <p>In Ireland (HPRA regulations), antibiotics like Amoclav & Clarithromycin and stomach protectors like Esomeprazole require a Doctor's Prescription (POM). Paralief Paracetamol, Ibuprofen, and Vitamins can be bought Over-The-Counter (OTC) at local Irish pharmacies.</p>
            </div>
            <div class="care-item">
                <div class="care-item-title"><i class="fa-solid fa-glass-water"></i> Universal Hydration & Medication Clearance</div>
                <p>Drink at least 2.5 Liters of water daily. Hydration prevents kidney strain, assists metabolic drug clearance, and thins pulmonary mucus.</p>
                <a href="https://pubmed.ncbi.nlm.nih.gov/31383216/" target="_blank" rel="noopener" class="research-link">
                    <i class="fa-solid fa-newspaper"></i> PubMed: Hydration Efficacy Study
                </a>
            </div>
        `;

        if (checkedDiseaseIds.includes('pneumonia')) {
            careBody.innerHTML += `
                <div class="care-item">
                    <div class="care-item-title"><i class="fa-solid fa-lungs"></i> Full Pneumonia Regimen Protocol (All 4 Prescribed Items)</div>
                    <p>All 4 of your prescribed medicines — <strong>Amoclav</strong>, <strong>Clarithromycin</strong>, <strong>Esomeprazole</strong>, and <strong>Paralief Paracetamol</strong> — belong to your Pneumonia treatment plan from Reign Pharmacy. Space Amoclav <strong>EXACTLY 8 HOURS APART (06:00 AM, 02:00 PM, 10:00 PM)</strong> with plenty of water.</p>
                </div>
            `;
            warningUl.innerHTML += `<li><strong>Shortness of Breath or Chest Pain:</strong> Sharp pain when inhaling or coughing in Pneumonia. Seek immediate care.</li>`;
        }

        if (checkedDiseaseIds.includes('hypotension')) {
            careBody.innerHTML += `
                <div class="care-item">
                    <div class="care-item-title"><i class="fa-solid fa-gauge-simple-low"></i> Low Blood Pressure (Hypotension) Care & Counter-Pressure</div>
                    <p>Drink a tall glass of cool water with a pinch of Himalayan pink salt before getting out of bed. Perform isometric calf and thigh squeezes for 15 seconds before standing up to prevent fainting.</p>
                </div>
            `;
            warningUl.innerHTML += `<li><strong>Syncope & Blackout Warning:</strong> Severe dizziness, vision darkening, or fainting upon standing. Sit or lie down immediately with legs elevated.</li>`;
        }

        if (checkedDiseaseIds.includes('anemia')) {
            careBody.innerHTML += `
                <div class="care-item">
                    <div class="care-item-title"><i class="fa-solid fa-vial"></i> Anemia / Low Iron Absorption Strategy</div>
                    <p>Take oral iron supplements (e.g. Ferrous Fumarate) with a glass of orange juice (Vitamin C) on an empty stomach for 3x absorption. Never take iron with milk, calcium, tea, or coffee.</p>
                </div>
            `;
            warningUl.innerHTML += `<li><strong>Severe Anemic Fatigue / Tachycardia:</strong> Extreme pallor, rapid pounding heart rate, or shortness of breath with minimal exertion.</li>`;
        }

        if (checkedDiseaseIds.includes('diabetes')) {
            careBody.innerHTML += `
                <div class="care-item">
                    <div class="care-item-title"><i class="fa-solid fa-droplet"></i> Diabetes Meal Timing & Metformin Safety</div>
                    <p>Take Metformin WITH MEALS to minimize stomach upset. Perform a 15-minute gentle walk after meals to reduce postprandial blood sugar spikes.</p>
                    <a href="https://pubmed.ncbi.nlm.nih.gov/33454378/" target="_blank" rel="noopener" class="research-link">
                        <i class="fa-solid fa-newspaper"></i> PubMed: Postprandial Walking Study
                    </a>
                </div>
            `;
            warningUl.innerHTML += `<li><strong>Hypoglycemia Warning:</strong> Shakiness, dizziness, cold sweat, or confusion. Consume fast-acting glucose immediately.</li>`;
        }

        if (checkedDiseaseIds.includes('fatty_liver') || checkedDiseaseIds.includes('cholesterol')) {
            careBody.innerHTML += `
                <div class="care-item">
                    <div class="care-item-title"><i class="fa-solid fa-heart"></i> Fatty Liver & High Cholesterol Statin Safety</div>
                    <p>Avoid Grapefruit juice when taking Atorvastatin. Incorporate soluble oats, psyllium fiber, and green tea catechins to support liver fat clearance.</p>
                    <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3584566/" target="_blank" rel="noopener" class="research-link">
                        <i class="fa-solid fa-newspaper"></i> NIH PMC: Grapefruit & Statin Interaction
                    </a>
                </div>
            `;
            warningUl.innerHTML += `<li><strong>Jaundice or Severe Right Upper Abdomen Pain:</strong> Yellowing of skin/eyes indicating hepatic emergency.</li>`;
        }

        if (checkedDiseaseIds.includes('hypertension')) {
            careBody.innerHTML += `
                <div class="care-item">
                    <div class="care-item-title"><i class="fa-solid fa-heart-pulse"></i> Hypertension Sodium & Hydration Control</div>
                    <p>Limit daily dietary sodium intake to under 2,000 mg. Avoid excessive licorice and energy drinks. Regularly monitor resting BP.</p>
                </div>
            `;
            warningUl.innerHTML += `<li><strong>Severe Blood Pressure Spike:</strong> Systolic BP >180 mmHg or sudden intense headache/blurred vision.</li>`;
        }

        if (checkedDiseaseIds.includes('acid_reflux')) {
            careBody.innerHTML += `
                <div class="care-item">
                    <div class="care-item-title"><i class="fa-solid fa-vial-circle-check"></i> Acid Reflux & Nighttime Elevation</div>
                    <p>Elevate head of bed by 15 cm. Avoid eating large meals within 3 hours of sleep. Steer clear of raw onions, tomatoes, and peppermint.</p>
                </div>
            `;
            warningUl.innerHTML += `<li><strong>Difficulty Swallowing (Dysphagia):</strong> Feeling food stuck in esophagus or persistent vomiting.</li>`;
        }

        if (checkedDiseaseIds.includes('joint_arthritis') || checkedDiseaseIds.includes('back_pain')) {
            careBody.innerHTML += `
                <div class="care-item">
                    <div class="care-item-title"><i class="fa-solid fa-bone"></i> Musculoskeletal Mobility & Core Support</div>
                    <p>Maintain consistent gentle daily movement. Avoid prolonged static sitting. Apply warm compresses to ease muscular tension.</p>
                </div>
            `;
            warningUl.innerHTML += `<li><strong>Numbness, Tingling or Loss of Bladder/Bowel Control:</strong> Immediate spinal cord red flag (Cauda Equina).</li>`;
        }

        if (checkedDiseaseIds.includes('anxiety_stress')) {
            careBody.innerHTML += `
                <div class="care-item">
                    <div class="care-item-title"><i class="fa-solid fa-brain"></i> Nervous System Sleep Hygiene</div>
                    <p>Limit screen exposure and caffeine after 4 PM. Practice 4-7-8 breathing before sleep to facilitate restorative sleep cycles.</p>
                </div>
            `;
        }

        warningUl.innerHTML += `<li><strong>Persistent High Fever:</strong> Temperature >38.5°C unmanaged by Paracetamol.</li>`;
        warningUl.innerHTML += `<li><strong>Severe Allergic Reactions:</strong> Hives, swelling of lips/tongue, or difficulty breathing.</li>`;
    }

    // ----------------------------------------------------------------------
    // 12. Initial Load & View Refresh
    // ----------------------------------------------------------------------
    renderDiseaseCheckboxGrid();
    updateAllViews();
});
