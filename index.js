'use strict';

const Hapi = require('hapi');
const noir = require('pino-noir')

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8000
});

server.state('cookie', {isSecure: false})

// Add the route
server.route({
    method: 'GET',
    path:'/hello',
    handler: function (request, reply) {

        return reply('hello world').state('cookie', 'value');
    }
});

function asReqValue (req) {
  const raw = req.raw.req
  return {
    id: req.id,
    method: raw.method,
    url: raw.url,
    headers: raw.headers,
    remoteAddress: raw.connection.remoteAddress,
    remotePort: raw.connection.remotePort
  }
}

server.register([
  {
    register: require('hapi-pino'),
    options: {
      // The following causes seemingly infinite output:
      // serializers: noir(['req.headers.cookie'], 'Ssshh!'))

      // Once a cookie is set, the following causes Hapi to crash. Make sure to
      // load /hello without noir first in order to set the cookie.
      // serializers: noir({
      //   req: asReqValue
      // }, ['req.headers.cookie'], 'Ssshh!')
    }
  }
], (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  // the logger is available in server.app
  server.app.logger.warn('Pino is registered')

  // also as a decorated API
  server.logger().info('another way for accessing it')

  // and through Hapi standard logging system
  server.log(['subsystem'], 'third way for accessing it')

  // Start the server
  server.start((err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
  })
})
