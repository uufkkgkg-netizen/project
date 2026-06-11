const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function runTests() {
    console.log('--- 1. AUTHENTICATION & MULTI-TENANCY ---');
    try {
        const rand = Math.floor(Math.random() * 100000);
        
        // Register Clinic A
        const regA = await axios.post(`${API_URL}/auth/register`, {
            firstName: 'AdminA', lastName: 'A', email: `adminA${rand}@clinic.com`, password: 'password123', clinicName: 'Clinic A', subdomain: `clinica${rand}`
        });
        console.log('Register Clinic A:', regA.data.message);
        
        // Register Clinic B
        const regB = await axios.post(`${API_URL}/auth/register`, {
            firstName: 'AdminB', lastName: 'B', email: `adminB${rand}@clinic.com`, password: 'password123', clinicName: 'Clinic B', subdomain: `clinicb${rand}`
        });
        console.log('Register Clinic B:', regB.data.message);

        // Login A
        const loginA = await axios.post(`${API_URL}/auth/login`, { email: `adminA${rand}@clinic.com`, password: 'password123' });
        const tokenA = loginA.data.access_token;
        console.log('Login Clinic A: Success');

        // Login B
        const loginB = await axios.post(`${API_URL}/auth/login`, { email: `adminB${rand}@clinic.com`, password: 'password123' });
        const tokenB = loginB.data.access_token;
        console.log('Login Clinic B: Success');

        // Create Patient in Clinic A
        const patA = await axios.post(`${API_URL}/patients`, {
            fullName: 'Test Patient A', phone: '123456789'
        }, { headers: { Authorization: `Bearer ${tokenA}` }});
        const patIdA = patA.data.id;
        console.log(`Create Patient in Clinic A: Success, ID: ${patIdA}`);

        // Try access Patient A with Clinic B Token
        try {
            await axios.get(`${API_URL}/patients/${patIdA}`, { headers: { Authorization: `Bearer ${tokenB}` }});
            console.log('Clinic B accessing Patient A: FAILED (Allowed when it should not be!)');
        } catch (e) {
            console.log(`Clinic B accessing Patient A: SECURELY BLOCKED (${e.response.status} ${e.response.statusText})`);
        }

        console.log('\n--- 2. CRUD OPERATIONS ---');
        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + 1);
        const dateString = nextDay.toISOString().split('T')[0];

        const aptA = await axios.post(`${API_URL}/appointments`, {
            patientId: patIdA, date: dateString, time: '14:30', notes: 'Checkup'
        }, { headers: { Authorization: `Bearer ${tokenA}` }});
        console.log('Create Appointment Clinic A: Success');

        const updateA = await axios.patch(`${API_URL}/patients/${patIdA}`, {
            phone: '999999999'
        }, { headers: { Authorization: `Bearer ${tokenA}` }});
        console.log('Update Patient Clinic A: Success (Phone: ' + updateA.data.phone + ')');

        console.log('\n--- 3. ERROR HANDLING ---');
        try {
            await axios.post(`${API_URL}/auth/register`, {
                firstName: 'AdminA', lastName: 'A', email: `adminA${rand}@clinic.com`, password: 'password123', clinicName: 'Clinic A', subdomain: `clinica2${rand}`
            });
            console.log('Duplicate Email Registration: FAILED (Allowed!)');
        } catch (e) {
            console.log(`Duplicate Email Registration: Handled properly (${e.response.status} ${e.response.data?.message || e.response.statusText})`);
        }

    } catch (e) {
        console.error('Test script error:', e.response ? e.response.data : e.message);
    }
}
runTests();
