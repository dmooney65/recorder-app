var os = require('os');
var dns = require('dns');

var h = os.hostname();
console.log('UQDN: ' + h);

dns.lookup(h, { hints: dns.ADDRCONFIG }, function(err, ip) {
    console.log('IP: ' + ip);
    dns.lookupService(ip, 0, function (err, hostname, service) {
        if (err) {
            console.log(err);
            return;
        }
        console.log('FQDN: ' + hostname);
        console.log('Service: ' + service);
    });
});