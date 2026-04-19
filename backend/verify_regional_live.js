const http = require('http');

const data = JSON.stringify({
  email: 'central.regional@portal.local',
  password: 'Password123!'
});

const loginOptions = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const loginReq = http.request(loginOptions, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    const loginData = JSON.parse(body);
    const token = loginData.token;
    console.log('--- Login Successful ---');
    
    // Test Network/Associates
    const networkOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/sub-regional/network',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    };

    http.request(networkOptions, (res) => {
      let netBody = '';
      res.on('data', (chunk) => netBody += chunk);
      res.on('end', () => {
        const netData = JSON.parse(netBody);
        console.log('Associates Found:', netData.associates.length);
        if (netData.associates.length > 0) {
           console.log('First Associate Details:', {
             name: netData.associates[0].name,
             background: netData.associates[0].backgroundInfo,
             area: netData.associates[0].registeredBy?.area
           });
        }
      });
    }).end();

    // Test Areas
    const areaOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/regional/areas',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    };

    http.request(areaOptions, (res) => {
      let areaBody = '';
      res.on('data', (chunk) => areaBody += chunk);
      res.on('end', () => {
        const areaData = JSON.parse(areaBody);
        console.log('\nAreas Found:', areaData.length);
        if (areaData.length > 0) {
          console.log('Sample Area Integrity:', {
            name: areaData[0].name,
            subRegion: areaData[0].subRegion,
            schools: areaData[0].schoolsCount
          });
        }
      });
    }).end();

  });
});

loginReq.on('error', (e) => console.error(e));
loginReq.write(data);
loginReq.end();
