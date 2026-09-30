const d = msg.payload;

if (typeof d.temperature !== 'number' || d.temperature < 10 || d.temperature > 45) {
    node.warn('Discarded invalid reading from ' + d.zone_id + ': ' + d.temperature);
    return null;
}

let store = context.get('store') || {};
let list = store[d.zone_id] || [];
list.push(d.temperature);
if (list.length > 5) list.shift();
store[d.zone_id] = list;
context.set('store', store);
const avg = list.reduce((a, b) => a + b, 0) / list.length;

msg.payload = {
    zone_id: d.zone_id,
    avg_temperature: Number(avg.toFixed(1)),
    humidity: d.humidity,
    occupancy: d.occupancy,
    timestamp: d.timestamp
};
msg.topic = 'smart-ac/' + d.zone_id + '/aggregated';
return msg;
