const express = require('express');
const router = express.Router();

// In-memory store for demo mode
let visitsStore = [];

// Sample visits for demo
const sampleVisits = [
  { id:1, patientId:'P001', district:'Colombo', symptoms:'Fever and headache', triage:'MODERATE', date: new Date(Date.now()-86400000*1).toISOString(), workerName:'Amara Perera' },
  { id:2, patientId:'P002', district:'Gampaha', symptoms:'Severe chest pain', triage:'URGENT', date: new Date(Date.now()-86400000*2).toISOString(), workerName:'Suresh Kumar' },
  { id:3, patientId:'P003', district:'Kandy', symptoms:'Common cold and cough', triage:'MILD', date: new Date(Date.now()-86400000*2).toISOString(), workerName:'Nimal Silva' },
  { id:4, patientId:'P004', district:'Galle', symptoms:'Dengue symptoms - high fever rash', triage:'URGENT', date: new Date(Date.now()-86400000*3).toISOString(), workerName:'Fathima Hassan' },
  { id:5, patientId:'P005', district:'Matara', symptoms:'Back pain and fatigue', triage:'MILD', date: new Date(Date.now()-86400000*3).toISOString(), workerName:'Amara Perera' },
  { id:6, patientId:'P006', district:'Colombo', symptoms:'Diabetes follow-up', triage:'MODERATE', date: new Date(Date.now()-86400000*4).toISOString(), workerName:'Suresh Kumar' },
  { id:7, patientId:'P007', district:'Kurunegala', symptoms:'Malaria symptoms', triage:'URGENT', date: new Date(Date.now()-86400000*4).toISOString(), workerName:'Nimal Silva' },
  { id:8, patientId:'P008', district:'Anuradhapura', symptoms:'Stomach pain and vomiting', triage:'MODERATE', date: new Date(Date.now()-86400000*5).toISOString(), workerName:'Amara Perera' },
  { id:9, patientId:'P009', district:'Jaffna', symptoms:'Hypertension check', triage:'MODERATE', date: new Date(Date.now()-86400000*5).toISOString(), workerName:'Fathima Hassan' },
  { id:10, patientId:'P010', district:'Trincomalee', symptoms:'Minor wound infection', triage:'MILD', date: new Date(Date.now()-86400000*6).toISOString(), workerName:'Suresh Kumar' }
];

visitsStore = [...sampleVisits];

router.get('/', (req, res) => {
  const { worker, district } = req.query;
  let results = [...visitsStore];
  if (worker) results = results.filter(v => v.workerName === worker);
  if (district) results = results.filter(v => v.district === district);
  res.json({ visits: results.sort((a,b) => new Date(b.date) - new Date(a.date)), total: results.length });
});

router.post('/', (req, res) => {
  const { patientId, district, symptoms, triage, workerName, soapNote, notes } = req.body;
  if (!patientId || !symptoms) return res.status(400).json({ error: 'patientId and symptoms are required' });
  const visit = {
    id: visitsStore.length + 1,
    patientId, district: district || 'Colombo', symptoms, triage: triage || 'MILD',
    workerName: workerName || 'Health Worker', soapNote, notes,
    date: new Date().toISOString()
  };
  visitsStore.push(visit);
  res.status(201).json({ visit, message: 'Visit logged successfully' });
});

module.exports = router;
module.exports.getVisits = () => visitsStore;
