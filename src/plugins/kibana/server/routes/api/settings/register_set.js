import Boom from 'boom';

export default function registerSet(server) {
  server.route({
    path: '/api/kibana/settings/{key}',
    method: 'POST',
    handler: async function (req, reply) {
      const key = req.params.key;
      const value = req.payload.value;
      const client = server.plugins.elasticsearch.client;
      const config = server.config();
      const index = config.get('kibana.index');
      const id = config.get('pkg.version');
      const type = 'config';

      client
        .update({
          index,
          type,
          id,
          body: {
            doc: {
              [key]: { value }
            }
          }
        })
        .then(() => reply({}).type('application/json'))
        .catch(reason => reply(Boom.wrap(reason)));
    }
  });
}
