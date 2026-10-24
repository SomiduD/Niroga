const express = require('express');
const router = express.Router();

const CLINICS_DATA = {
  "Colombo": [
    { name: "Colombo National Hospital", address: "Regent Street, Colombo 08", phone: "011-2691111", type: "Teaching Hospital", lat: 6.9271, lng: 79.8612, etu247: true, bloodBank: true, ambulance: true, pediatric: true },
    { name: "Colombo South Teaching Hospital (Kalubowila)", address: "Kalubowila, Dehiwala", phone: "011-2763064", type: "Teaching Hospital", lat: 6.8732, lng: 79.8821, etu247: true, bloodBank: true, ambulance: true, pediatric: true },
    { name: "Lady Ridgeway Hospital for Children", address: "Danister de Silva Mawatha, Colombo 08", phone: "011-2693711", type: "Teaching Hospital", lat: 6.9189, lng: 79.8732, etu247: true, bloodBank: true, ambulance: true, pediatric: true },
    { name: "Nawaloka Hospital", address: "23 Deshamanya H. K. Dharmadasa Mawatha", phone: "011-2544444", type: "Private Hospital", lat: 6.9157, lng: 79.8636, etu247: true, bloodBank: true, ambulance: true, pediatric: false },
    { name: "Colombo South Medical Clinic", address: "Dehiwala, Colombo", phone: "011-2717272", type: "Clinic", lat: 6.8724, lng: 79.8653, etu247: false, bloodBank: false, ambulance: false, pediatric: false }
  ],
  "Gampaha": [
    { name: "Gampaha District General Hospital", address: "Hospital Road, Gampaha", phone: "033-2222261", type: "District Hospital", lat: 7.0917, lng: 79.9997, etu247: true, bloodBank: true, ambulance: true, pediatric: true },
    { name: "Negombo District General Hospital", address: "Aluthgama Road, Negombo", phone: "031-2222261", type: "General Hospital", lat: 7.2096, lng: 79.8353, etu247: true, bloodBank: true, ambulance: true, pediatric: true },
    { name: "Wathupitiwala Base Hospital", address: "Wathupitiwala, Nittambuwa", phone: "033-2273261", type: "Base Hospital", lat: 7.1547, lng: 80.0327, etu247: true, bloodBank: true, ambulance: true, pediatric: false },
    { name: "Ragama Teaching Hospital", address: "Hospital Road, Ragama", phone: "011-2959261", type: "Teaching Hospital", lat: 7.0272, lng: 79.9248, etu247: true, bloodBank: true, ambulance: true, pediatric: true }
  ],
  "Kandy": [
    { name: "Kandy National Hospital (Teaching)", address: "Hospital Road, Kandy", phone: "081-2222261", type: "Teaching Hospital", lat: 7.2906, lng: 80.6337, etu247: true, bloodBank: true, ambulance: true, pediatric: true },
    { name: "Peradeniya Teaching Hospital", address: "Peradeniya, Kandy", phone: "081-2388001", type: "Teaching Hospital", lat: 7.2686, lng: 80.5998, etu247: true, bloodBank: true, ambulance: true, pediatric: true },
    { name: "Sirimavo Bandaranaike Children's Hospital", address: "Peradeniya", phone: "081-2387171", type: "Teaching Hospital", lat: 7.2655, lng: 80.6012, etu247: true, bloodBank: true, ambulance: true, pediatric: true },
    { name: "Kandy City Primary Clinic", address: "Dalada Veediya, Kandy", phone: "081-2233445", type: "Clinic", lat: 7.2933, lng: 80.6408, etu247: false, bloodBank: false, ambulance: false, pediatric: false }
  ],
  "Galle": [
    { name: "Karapitiya Teaching Hospital", address: "Karapitiya, Galle", phone: "091-2222261", type: "Teaching Hospital", lat: 6.0535, lng: 80.2210, etu247: true, bloodBank: true, ambulance: true, pediatric: true },
    { name: "Mahamodara Maternity Hospital", address: "Mahamodara, Galle", phone: "091-2232261", type: "Teaching Hospital", lat: 6.0411, lng: 80.2089, etu247: true, bloodBank: true, ambulance: true, pediatric: true },
    { name: "Balapitiya Base Hospital", address: "Balapitiya", phone: "091-2258261", type: "Base Hospital", lat: 6.2731, lng: 80.0432, etu247: true, bloodBank: false, ambulance: true, pediatric: false }
  ],
  "Matara": [
    { name: "Matara District General Hospital", address: "Hospital Road, Matara", phone: "041-2222261", type: "Teaching Hospital", lat: 5.9496, lng: 80.5353, etu247: true, bloodBank: true, ambulance: true, pediatric: true },
    { name: "Weligama District Hospital", address: "Weligama", phone: "041-2250261", type: "District Hospital", lat: 5.9767, lng: 80.4296, etu247: true, bloodBank: false, ambulance: true, pediatric: false }
  ],
  "Ratnapura": [
    { name: "Ratnapura Teaching Hospital", address: "Hospital Road, Ratnapura", phone: "045-2222261", type: "Teaching Hospital", lat: 6.6828, lng: 80.3992, etu247: true, bloodBank: true, ambulance: true, pediatric: true },
    { name: "Embilipitiya District General Hospital", address: "Embilipitiya", phone: "047-2260261", type: "District Hospital", lat: 6.3414, lng: 80.8493, etu247: true, bloodBank: true, ambulance: true, pediatric: true }
  ],
  "Kurunegala": [
    { name: "Kurunegala Teaching Hospital", address: "Hospital Road, Kurunegala", phone: "037-2222261", type: "Teaching Hospital", lat: 7.4867, lng: 80.3647, etu247: true, bloodBank: true, ambulance: true, pediatric: true },
    { name: "Kuliyapitiya Teaching Hospital", address: "Kuliyapitiya", phone: "037-2280261", type: "Teaching Hospital", lat: 7.4684, lng: 80.0432, etu247: true, bloodBank: true, ambulance: true, pediatric: true }
  ],
  "Anuradhapura": [
    { name: "Anuradhapura Teaching Hospital", address: "Hospital Road, Anuradhapura", phone: "025-2222261", type: "Teaching Hospital", lat: 8.3114, lng: 80.4037, etu247: true, bloodBank: true, ambulance: true, pediatric: true },
    { name: "Medawachchiya District Hospital", address: "Medawachchiya", phone: "025-2245261", type: "District Hospital", lat: 8.5467, lng: 80.4932, etu247: true, bloodBank: false, ambulance: true, pediatric: false }
  ],
  "Polonnaruwa": [
    { name: "Polonnaruwa District General Hospital", address: "Hospital Road, Polonnaruwa", phone: "027-2222261", type: "General Hospital", lat: 7.9403, lng: 81.0188, etu247: true, bloodBank: true, ambulance: true, pediatric: true }
  ],
  "Badulla": [
    { name: "Badulla Provincial General Hospital", address: "Hospital Road, Badulla", phone: "055-2222261", type: "General Hospital", lat: 6.9934, lng: 81.0550, etu247: true, bloodBank: true, ambulance: true, pediatric: true },
    { name: "Bandarawela District Hospital", address: "Bandarawela", phone: "057-2222261", type: "District Hospital", lat: 6.8290, lng: 80.9892, etu247: true, bloodBank: false, ambulance: true, pediatric: false }
  ],
  "Monaragala": [
    { name: "Monaragala District General Hospital", address: "Hospital Road, Monaragala", phone: "055-2276261", type: "District Hospital", lat: 6.8726, lng: 81.3499, etu247: true, bloodBank: true, ambulance: true, pediatric: true }
  ],
  "Hambantota": [
    { name: "Hambantota District General Hospital", address: "Mirijjawila, Hambantota", phone: "047-2220261", type: "District Hospital", lat: 6.1246, lng: 81.1185, etu247: true, bloodBank: true, ambulance: true, pediatric: true },
    { name: "Tangalle Base Hospital", address: "Tangalle", phone: "047-2240261", type: "Base Hospital", lat: 6.0263, lng: 80.7931, etu247: true, bloodBank: false, ambulance: true, pediatric: false }
  ],
  "Nuwara Eliya": [
    { name: "Nuwara Eliya District General Hospital", address: "Hospital Road, Nuwara Eliya", phone: "052-2222261", type: "District Hospital", lat: 6.9497, lng: 80.7891, etu247: true, bloodBank: true, ambulance: true, pediatric: true }
  ],
  "Kegalle": [
    { name: "Kegalle District General Hospital", address: "Hospital Road, Kegalle", phone: "035-2222261", type: "District Hospital", lat: 7.2512, lng: 80.3464, etu247: true, bloodBank: true, ambulance: true, pediatric: true }
  ],
  "Kalutara": [
    { name: "Nagoda General Hospital (Kalutara)", address: "Hospital Road, Nagoda, Kalutara", phone: "034-2222261", type: "General Hospital", lat: 6.5854, lng: 79.9607, etu247: true, bloodBank: true, ambulance: true, pediatric: true },
    { name: "Panadura Base Hospital", address: "Panadura", phone: "038-2232261", type: "Base Hospital", lat: 6.7132, lng: 79.9036, etu247: true, bloodBank: false, ambulance: true, pediatric: false }
  ],
  "Trincomalee": [
    { name: "Trincomalee District General Hospital", address: "Hospital Road, Trincomalee", phone: "026-2222261", type: "General Hospital", lat: 8.5874, lng: 81.2152, etu247: true, bloodBank: true, ambulance: true, pediatric: true }
  ],
  "Batticaloa": [
    { name: "Batticaloa Teaching Hospital", address: "Hospital Road, Batticaloa", phone: "065-2222261", type: "Teaching Hospital", lat: 7.7172, lng: 81.6993, etu247: true, bloodBank: true, ambulance: true, pediatric: true }
  ],
  "Ampara": [
    { name: "Ampara District General Hospital", address: "Hospital Road, Ampara", phone: "063-2222261", type: "District Hospital", lat: 7.2993, lng: 81.6724, etu247: true, bloodBank: true, ambulance: true, pediatric: true }
  ],
  "Jaffna": [
    { name: "Jaffna Teaching Hospital", address: "Hospital Road, Jaffna", phone: "021-2222261", type: "Teaching Hospital", lat: 9.6615, lng: 80.0255, etu247: true, bloodBank: true, ambulance: true, pediatric: true },
    { name: "Point Pedro Base Hospital", address: "Point Pedro, Jaffna", phone: "021-2260261", type: "Base Hospital", lat: 9.8207, lng: 80.2394, etu247: true, bloodBank: false, ambulance: true, pediatric: false }
  ],
  "Mannar": [
    { name: "Mannar District General Hospital", address: "Hospital Road, Mannar", phone: "023-2222261", type: "District Hospital", lat: 8.9810, lng: 79.9044, etu247: true, bloodBank: true, ambulance: true, pediatric: true }
  ],
  "Vavuniya": [
    { name: "Vavuniya District General Hospital", address: "Hospital Road, Vavuniya", phone: "024-2222261", type: "General Hospital", lat: 8.7514, lng: 80.4964, etu247: true, bloodBank: true, ambulance: true, pediatric: true }
  ],
  "Mullaitivu": [
    { name: "Mullaitivu District General Hospital", address: "Hospital Road, Mullaitivu", phone: "021-2290261", type: "District Hospital", lat: 9.2671, lng: 80.8142, etu247: true, bloodBank: true, ambulance: true, pediatric: true }
  ],
  "Kilinochchi": [
    { name: "Kilinochchi District General Hospital", address: "Hospital Road, Kilinochchi", phone: "021-2285261", type: "General Hospital", lat: 9.3803, lng: 80.4072, etu247: true, bloodBank: true, ambulance: true, pediatric: true }
  ],
  "Puttalam": [
    { name: "Puttalam Base Hospital", address: "Hospital Road, Puttalam", phone: "032-2265261", type: "Base Hospital", lat: 8.0362, lng: 79.8283, etu247: true, bloodBank: false, ambulance: true, pediatric: false },
    { name: "Chilaw General Hospital", address: "Chilaw", phone: "032-2222261", type: "General Hospital", lat: 7.5758, lng: 79.7953, etu247: true, bloodBank: true, ambulance: true, pediatric: true }
  ],
  "Matale": [
    { name: "Matale District General Hospital", address: "Hospital Road, Matale", phone: "066-2222261", type: "District Hospital", lat: 7.4675, lng: 80.6234, etu247: true, bloodBank: true, ambulance: true, pediatric: true }
  ]
};

router.get('/', (req, res) => {
  const { district, q, type } = req.query;

  // Search across all districts
  if (q || type) {
    let results = [];
    const searchLower = (q || '').toLowerCase();

    for (const [dist, clinics] of Object.entries(CLINICS_DATA)) {
      if (district && dist.toLowerCase() !== district.toLowerCase()) continue;
      for (const c of clinics) {
        const matchesQuery = !q || c.name.toLowerCase().includes(searchLower) || c.address.toLowerCase().includes(searchLower) || dist.toLowerCase().includes(searchLower);
        const matchesType = !type || type === 'All' || c.type.toLowerCase() === type.toLowerCase();
        if (matchesQuery && matchesType) {
          results.push({ ...c, district: dist });
        }
      }
    }
    return res.json({ clinics: results, count: results.length, query: q, type });
  }

  if (!district) {
    return res.json({ districts: Object.keys(CLINICS_DATA), total: Object.keys(CLINICS_DATA).length });
  }

  const clinics = CLINICS_DATA[district] || [];
  if (clinics.length === 0) {
    return res.status(404).json({ error: `No clinics found for district: ${district}` });
  }
  return res.json({ district, clinics, count: clinics.length });
});

module.exports = router;
module.exports.CLINICS_DATA = CLINICS_DATA;
