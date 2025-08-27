import mitt from 'mitt';

type Events = {
  'auth:logout': void;
  'auth:token-expired': void;
};

const emitter = mitt<Events>();

export default emitter;
