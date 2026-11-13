export const SAMPLE_REPORTS = [
  {
    id: 'rep-001',
    title: 'Complete Blood Count (CBC) with Iron Study',
    category: 'Hematology',
    patient: {
      name: 'Priya Nair',
      age: 31,
      gender: 'Female',
      id: 'PT-89421'
    },
    labName: 'Metro Clinical Diagnostic Laboratories',
    date: 'Nov 12, 2026',
    urgencyLevel: 'follow_up_recommended', // 'routine' | 'follow_up_recommended' | 'prompt_attention'
    overallSummary: 
      'Your blood test shows mild iron-deficiency anemia. Red blood cells and hemoglobin are slightly below the typical healthy range, which frequently accounts for feelings of sluggishness or tiredness. Your immune cells (white blood cells) and blood-clotting cells (platelets) are completely normal. This is very common and usually manageable with dietary adjustments or iron supplementation guided by your doctor.',
    keyFindings: [
      'Hemoglobin (11.0 g/dL) is mildly lower than standard reference interval (12.0 - 15.5 g/dL).',
      'Serum Ferritin (14 ng/mL) indicates low iron storage reserves.',
      'Total White Blood Cell Count (6,800 /mcL) is healthy, indicating no ongoing acute infection.',
      'Platelet Count (240,000 /mcL) is optimal for standard blood clotting.'
    ],
    biomarkers: [
      {
        name: 'Hemoglobin (Hb)',
        value: '11.0',
        unit: 'g/dL',
        referenceRange: '12.0 - 15.5',
        status: 'low',
        min: 12.0,
        max: 15.5,
        numValue: 11.0,
        explanation: 'Hemoglobin is the iron-rich protein in red blood cells that transports oxygen from your lungs to the rest of your body. When slightly low, muscles and tissues receive slightly less oxygen.'
      },
      {
        name: 'Red Blood Cell (RBC) Count',
        value: '3.9',
        unit: 'million/mcL',
        referenceRange: '4.2 - 5.4',
        status: 'low',
        min: 4.2,
        max: 5.4,
        numValue: 3.9,
        explanation: 'The total number of red cells circulating in your bloodstream. A modest dip parallels the lower hemoglobin finding.'
      },
      {
        name: 'White Blood Cell (WBC) Count',
        value: '6,800',
        unit: '/mcL',
        referenceRange: '4,500 - 11,000',
        status: 'normal',
        min: 4500,
        max: 11000,
        numValue: 6800,
        explanation: 'White blood cells represent the frontline defense of your immune system. Your count is within the healthy target zone.'
      },
      {
        name: 'Platelet Count',
        value: '240,000',
        unit: '/mcL',
        referenceRange: '150,000 - 450,000',
        status: 'normal',
        min: 150000,
        max: 450000,
        numValue: 240000,
        explanation: 'Tiny cell fragments responsible for sealing blood vessels and forming clots when you scrape or cut your skin.'
      },
      {
        name: 'Mean Corpuscular Volume (MCV)',
        value: '76.2',
        unit: 'fL',
        referenceRange: '80.0 - 100.0',
        status: 'low',
        min: 80.0,
        max: 100.0,
        numValue: 76.2,
        explanation: 'Measures the physical size of individual red blood cells. Slightly smaller red cells (microcytosis) are standard in iron insufficiency.'
      },
      {
        name: 'Serum Ferritin',
        value: '14.0',
        unit: 'ng/mL',
        referenceRange: '20.0 - 200.0',
        status: 'low',
        min: 20.0,
        max: 200.0,
        numValue: 14.0,
        explanation: 'Ferritin acts like your body’s iron savings account. Lower numbers mean your iron reserve stores are currently depleted.'
      }
    ],
    doctorQuestions: [
      'Would you recommend an oral iron supplement, and which formulation causes the least digestive sensitivity?',
      'Should we schedule a follow-up Complete Blood Count in 8 to 12 weeks to monitor recovery?',
      'Are there specific dietary iron sources or vitamin C pairings that would support absorption?'
    ],
    wellnessNotes: [
      'Incorporate iron-dense foods (spinach, lentils, beans, lean meats) combined with citrus or vitamin C to maximize bioavailability.',
      'Avoid drinking strong tea or coffee directly with meals, as tannins can inhibit iron absorption.',
      'Stay well-hydrated throughout the day and observe energy levels during mild exercise.'
    ],
    rawExtractedText: `METRO CLINICAL DIAGNOSTIC LABORATORIES
Patient: Priya Nair | Age: 31 | Sex: F | Ref ID: PT-89421
Specimen: Whole Blood EDTA | Date: 12-Nov-2026 09:30 AM
----------------------------------------------------------------
TEST                          RESULT    FLAG   REF INTERVAL   UNIT
Hemoglobin (Hb)               11.0      L      12.0 - 15.5    g/dL
RBC Count                     3.9       L      4.2 - 5.4      mil/uL
Total Leukocyte Count (WBC)   6,800            4,500 - 11,000 /mcL
Platelet Count                240,000          150,000-450,000/mcL
MCV                           76.2      L      80.0 - 100.0   fL
Serum Ferritin                14.0      L      20.0 - 200.0   ng/mL
----------------------------------------------------------------
Impression: Microcytic hypochromic indices suggestive of low iron reserves.`
  },

  {
    id: 'rep-002',
    title: 'Comprehensive Metabolic & Lipid Panel',
    category: 'Biochemistry',
    patient: {
      name: 'Rajesh Sharma',
      age: 52,
      gender: 'Male',
      id: 'PT-41029'
    },
    labName: 'Apex Health Pathology & Research',
    date: 'Nov 08, 2026',
    urgencyLevel: 'follow_up_recommended',
    overallSummary: 
      'Your metabolic results reflect good kidney and liver performance with some areas for cardiovascular and metabolic focus. Your fasting blood sugar and HbA1c hover in the pre-diabetic borderline range. Additionally, LDL ("bad") cholesterol and triglycerides are mildly elevated. These findings provide a valuable early window for lifestyle optimization—such as brisk walking and dietary adjustments—before issues progress.',
    keyFindings: [
      'Fasting Blood Glucose (112 mg/dL) is above the typical normal threshold (< 100 mg/dL).',
      'HbA1c (5.8%) sits in the pre-diabetes monitoring bracket (5.7% - 6.4%).',
      'LDL Cholesterol (142 mg/dL) and Triglycerides (178 mg/dL) are mildly elevated.',
      'Serum Creatinine (0.9 mg/dL) confirms normal, healthy kidney filtration.'
    ],
    biomarkers: [
      {
        name: 'Fasting Blood Glucose',
        value: '112',
        unit: 'mg/dL',
        referenceRange: '70 - 99',
        status: 'high',
        min: 70,
        max: 99,
        numValue: 112,
        explanation: 'The level of sugar circulating in your blood after an overnight fast. Being slightly above 99 mg/dL suggests the body is taking slightly longer to clear glucose.'
      },
      {
        name: 'HbA1c (Glycated Hemoglobin)',
        value: '5.8',
        unit: '%',
        referenceRange: '4.0 - 5.6',
        status: 'borderline',
        min: 4.0,
        max: 5.6,
        numValue: 5.8,
        explanation: 'Provides a 3-month average of your blood sugar levels. 5.7% to 6.4% is classified as pre-diabetes, meaning it is an ideal time for preventative diet tweaks.'
      },
      {
        name: 'Total Cholesterol',
        value: '224',
        unit: 'mg/dL',
        referenceRange: '< 200',
        status: 'high',
        min: 100,
        max: 200,
        numValue: 224,
        explanation: 'The combined measure of all cholesterol fractions in your circulation.'
      },
      {
        name: 'LDL Cholesterol',
        value: '142',
        unit: 'mg/dL',
        referenceRange: '< 100',
        status: 'high',
        min: 50,
        max: 100,
        numValue: 142,
        explanation: 'Commonly known as "bad" cholesterol. Elevated levels can gradually build up along artery walls over long periods.'
      },
      {
        name: 'HDL Cholesterol',
        value: '44',
        unit: 'mg/dL',
        referenceRange: '> 40',
        status: 'normal',
        min: 40,
        max: 80,
        numValue: 44,
        explanation: 'Known as "protective" or good cholesterol that gathers excess lipids and returns them to the liver.'
      },
      {
        name: 'Serum Creatinine',
        value: '0.92',
        unit: 'mg/dL',
        referenceRange: '0.70 - 1.25',
        status: 'normal',
        min: 0.70,
        max: 1.25,
        numValue: 0.92,
        explanation: 'A muscle breakdown byproduct filtered cleanly by your kidneys. This confirms healthy renal filtration.'
      }
    ],
    doctorQuestions: [
      'Should we re-test HbA1c and lipid levels in 3 to 6 months to see if dietary changes are moving numbers into range?',
      'Would consulting a registered dietitian or nutritionist be helpful for structuring meals around lower glycemic indices?',
      'What target numbers should I set for my LDL and fasting glucose given my overall family history?'
    ],
    wellnessNotes: [
      'Aim for 150 minutes of moderate physical activity weekly (e.g., 30 minutes of brisk walking 5 days a week).',
      'Increase soluble dietary fiber (oats, flaxseeds, legumes) which naturally binds to excess dietary cholesterol.',
      'Cut down on ultra-processed sugars, sodas, and refined carbohydrates.'
    ],
    rawExtractedText: `APEX HEALTH PATHOLOGY & RESEARCH
Patient: Rajesh Sharma | Age: 52 | Sex: M | Ref ID: PT-41029
Specimen: Fasting Plasma / Serum | Date: 08-Nov-2026 08:15 AM
----------------------------------------------------------------
TEST                          RESULT    FLAG   REF INTERVAL   UNIT
Fasting Plasma Glucose        112       H      70 - 99        mg/dL
HbA1c (Glycosylated Hb)       5.8       H      4.0 - 5.6      %
Total Cholesterol             224       H      < 200          mg/dL
Triglycerides                 178       H      < 150          mg/dL
LDL Cholesterol (Direct)      142       H      < 100          mg/dL
HDL Cholesterol               44               > 40           mg/dL
Serum Creatinine              0.92             0.70 - 1.25    mg/dL
eGFR (CKD-EPI)                94               > 90           mL/min`
  },

  {
    id: 'rep-003',
    title: 'Thyroid & Vitamin D3 Profile',
    category: 'Endocrinology',
    patient: {
      name: 'Kavita Patel',
      age: 38,
      gender: 'Female',
      id: 'PT-92104'
    },
    labName: 'Lifeline Diagnostic & Wellness Center',
    date: 'Nov 02, 2026',
    urgencyLevel: 'follow_up_recommended',
    overallSummary: 
      'Your report shows subclinical thyroid variation and low Vitamin D3. Thyroid Stimulating Hormone (TSH) is mildly elevated, while actual circulating thyroid hormone (Free T4) remains normal. This indicates your pituitary gland is nudging the thyroid slightly harder than usual. Vitamin D3 is also in the insufficient range, which is very common and readily corrected with physician-prescribed supplementation.',
    keyFindings: [
      'TSH (5.60 uIU/mL) is slightly higher than standard reference upper limit (4.20 uIU/mL).',
      'Free T4 (1.18 ng/dL) is well within normal limits, ruling out overt thyroid failure.',
      'Vitamin D3 (17.2 ng/mL) falls below the 30 ng/mL sufficiency benchmark.',
      'Serum Calcium (9.4 mg/dL) is completely normal.'
    ],
    biomarkers: [
      {
        name: 'Thyroid Stimulating Hormone (TSH)',
        value: '5.60',
        unit: 'uIU/mL',
        referenceRange: '0.45 - 4.20',
        status: 'high',
        min: 0.45,
        max: 4.20,
        numValue: 5.60,
        explanation: 'Produced by your pituitary gland to tell your thyroid to release hormones. A mild elevation often flags subclinical hypothyroidism.'
      },
      {
        name: 'Free T4 (Thyroxine)',
        value: '1.18',
        unit: 'ng/dL',
        referenceRange: '0.80 - 1.80',
        status: 'normal',
        min: 0.80,
        max: 1.80,
        numValue: 1.18,
        explanation: 'The actual active thyroid hormone circulating in your system. Because this is normal, your body is still receiving adequate thyroid hormone.'
      },
      {
        name: 'Vitamin D3 (25-Hydroxy)',
        value: '17.2',
        unit: 'ng/mL',
        referenceRange: '30.0 - 100.0',
        status: 'low',
        min: 30.0,
        max: 100.0,
        numValue: 17.2,
        explanation: 'Essential for bone mineralization, calcium uptake, and immune health. Values below 20 ng/mL suggest mild-to-moderate deficiency.'
      },
      {
        name: 'Total Serum Calcium',
        value: '9.4',
        unit: 'mg/dL',
        referenceRange: '8.5 - 10.2',
        status: 'normal',
        min: 8.5,
        max: 10.2,
        numValue: 9.4,
        explanation: 'Measures total calcium in the bloodstream. Normal values demonstrate your body is maintaining blood mineral balance despite low Vitamin D.'
      }
    ],
    doctorQuestions: [
      'Does this TSH level warrant thyroid medication right now, or should we recheck in 3 months to see if it normalizes spontaneously?',
      'What weekly or daily Vitamin D3 dosage would be most effective to safely bring my levels above 30 ng/mL?',
      'Should we check thyroid antibody markers (Anti-TPO) to screen for autoimmune thyroiditis?'
    ],
    wellnessNotes: [
      'Safe sun exposure during mid-morning hours can help natural vitamin D synthesis.',
      'Take Vitamin D supplements alongside meals containing healthy fats (nuts, yogurt, olive oil) for optimal intestinal absorption.',
      'Ensure a consistent sleep routine, as irregular sleep cycles can influence endocrine and TSH circadian rhythms.'
    ],
    rawExtractedText: `LIFELINE DIAGNOSTIC & WELLNESS CENTER
Patient: Kavita Patel | Age: 38 | Sex: F | Ref ID: PT-92104
Specimen: Serum | Date: 02-Nov-2026 08:00 AM
----------------------------------------------------------------
TEST                          RESULT    FLAG   REF INTERVAL   UNIT
TSH (Ultrasensitive)          5.60      H      0.45 - 4.20    uIU/mL
Free T4                       1.18             0.80 - 1.80    ng/dL
25-OH Vitamin D Total         17.2      L      30.0 - 100.0   ng/mL
Serum Calcium                 9.4              8.5 - 10.2     mg/dL`
  }
]
