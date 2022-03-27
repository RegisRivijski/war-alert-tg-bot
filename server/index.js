const express = require('express');

const app = express();
app.set('port', (process.env.PORT || 5000));

app.get('/', (request, response) => {
  const memoryUsage = process.memoryUsage();
  Object.keys(memoryUsage).forEach((key) => {
    memoryUsage[`${key}_mb`] = memoryUsage[key] / 1048576;
  });
  const result = {
    service: 'war-alert-tg-bot',
    memoryUsage,
  };
  response.send(result);
}).listen(app.get('port'), () => {
  console.info('App is running, server is listening on port ', app.get('port'));
});
